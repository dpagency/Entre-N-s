import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { GUARDIAN_QUESTIONS, PLAYER_AVATARS } from '../src/data/pilot.ts';
import { CHARACTERS } from '../src/data/characters.ts';
import { SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS, LEGACY_SECOND_CHANCE_SCENARIOS } from '../src/data/fortuneScenarios.ts';
import { PATH_SCENARIOS } from '../src/data/pathScenarios.ts';
import { ADDITIONAL_QUESTIONS } from '../src/data/ethicsQuestions.ts';
import { MISSIONS } from '../src/data/missions.ts';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../src/data/channelActivity.ts';
import { cityArtworkSource, ORIGINAL_CITY_ARTWORK } from '../src/data/cityArtwork.ts';
import { staticSiteServer } from './static-site-server.mjs';
import { verifySite, siteRoot as defaultSiteRoot, projectRoot } from './institutional-package.mjs';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class DevTools {
  next = 0; pending = new Map(); listeners = new Map();
  static async open(url) {
    const client = new DevTools(); client.socket = new WebSocket(url);
    await new Promise((resolve, reject) => { client.socket.onopen = resolve; client.socket.onerror = reject; });
    client.socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const request = client.pending.get(message.id);
        if (!request) return;
        client.pending.delete(message.id); clearTimeout(request.timer);
        if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
      } else for (const listener of client.listeners.get(message.method) || []) listener(message.params);
    };
    return client;
  }
  on(method, listener) { this.listeners.set(method, [...this.listeners.get(method) || [], listener]); }
  call(method, params = {}) {
    const id = ++this.next;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 20000);
      this.pending.set(id, { resolve, reject, timer }); this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression, userGesture = false) {
    const result = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture }).catch(error => { throw new Error('Runtime.evaluate: ' + expression.slice(0, 240), { cause: error }); });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  async wait(expression, label) {
    for (let i = 0; i < 150; i++) { if (await this.evaluate(`Boolean(${expression})`)) return; await delay(100); }
    throw Error('Timeout: ' + label);
  }
  close() { this.socket.close(); }
}

const siteRoot = process.env.ENTRE_NOS_TEST_SITE ? path.resolve(process.env.ENTRE_NOS_TEST_SITE) : defaultSiteRoot;
const inventory = await verifySite(siteRoot);
const artifactFolder = process.env.ENTRE_NOS_TEST_REPORT ? path.resolve(process.env.ENTRE_NOS_TEST_REPORT) : path.join(projectRoot, 'artifacts/institutional/verification');
await mkdir(artifactFolder, { recursive: true });
const temp = await mkdtemp(path.join(os.tmpdir(), 'entre-nos-static-browser-'));
let browser, client, server, debuggingPort;
const report = { startedAt: new Date().toISOString(), artifactFiles: inventory.files.length, cases: [], dimensions: [], audio: null, blockedRequests: [], externalInitiators: [], apiAttempts: [], runtimeErrors: [], failedResources: [], checks: [] };

const roomExpression = `(()=>{const data=JSON.parse(localStorage.getItem('entre-nos-solo')||'null');return data?.rooms.find(([code])=>code===localStorage.getItem('guardioes_room_code'))?.[1]})()`;
let legacySnapshot, version3Snapshot;
const room = () => client.evaluate(roomExpression);
const phase = expected => client.wait(`${roomExpression}?.phase===${JSON.stringify(expected)}`, expected);
async function click(text) {
  const found = await client.evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)}&&!b.disabled);if(!button)return false;button.click();return true})()`, true);
  assert(found, 'Missing enabled button: ' + text); await delay(100);
}
async function named(name) {
  assert(await client.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(name)}&&!b.disabled);if(!b)return false;b.click();return true})()`), 'Missing named control: ' + name);
  await delay(100);
}
async function key(key, shift = false) {
  const code = ({ Escape: 27, Tab: 9, ArrowDown: 40, ArrowUp: 38, Home: 36, End: 35 })[key] || 13;
  for (const type of ['keyDown', 'keyUp']) await client.call('Input.dispatchKeyEvent', { type, key, code: key, modifiers: shift ? 1 : 0, windowsVirtualKeyCode: code, text: key === 'Enter' ? '\r' : undefined });
  await delay(80);
}
async function layout(label, prefix, screenshots = false) {
  for (const width of [320, 390, 768, 1440]) {
    await client.call('Emulation.setDeviceMetricsOverride', { width, height: 960, mobile: width < 768, deviceScaleFactor: 1 }); await delay(100);
    if (label.startsWith('atividade-canais')) await client.evaluate(`document.querySelector('${label.includes('pergunta') ? '[data-channel-question]' : '[data-channel-feedback]'}')?.scrollIntoView({block:'center'})`);
    const dimensions = await client.evaluate(`(()=>{const overflow=[...document.querySelectorAll('main *,[role=dialog] *')].filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX==='visible').map(e=>({tag:e.tagName,class:e.className}));return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,overflow}})()`);
    report.dimensions.push({ prefix, label, width, ...dimensions });
    assert(dimensions.scroll <= width && dimensions.overflow.length === 0, 'Horizontal overflow: ' + label + ' ' + width);
    const broken = await client.evaluate(`[...document.images].filter(image=>image.getClientRects().length&&image.complete&&!image.naturalWidth).map(image=>image.src)`);
    assert.deepEqual(broken, [], 'Broken image');
    if (screenshots && [390, 1440].includes(width)) {
      const selector = label.startsWith('convite-guardioes') ? '[aria-labelledby="guardian-challenge-title"]' : label.startsWith('perspectivas') ? '[aria-label="Perspectivas dos personagens"]' : label === 'carta-feedback' ? '[data-card-question]' : label === 'rever-alternativas' ? '[aria-label="Revisão das alternativas"]' : null;
      if (label.startsWith('perspectivas') || label.startsWith('convite-guardioes')) await client.evaluate('window.scrollTo(0,0)');
      const clip = selector ? await client.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`) : undefined;
      const screenshot = await client.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: Boolean(clip), ...(clip ? { clip } : {}) });
      await writeFile(path.join(artifactFolder, (prefix ? 'subpasta' : 'raiz') + '-' + label + '-' + width + '.png'), Buffer.from(screenshot.data, 'base64'));
    }
  }
}
async function preferences(enabled) {
  await named('Acessibilidade'); await click(enabled ? 'Extra' : 'Padrão');
  for (const label of ['Alto Contraste', 'Reduzir Animações']) {
    const checked = await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)})?.getAttribute('aria-checked')`);
    if (checked !== String(enabled)) await named(label);
  }
  await click('Concluir');
}

async function journeySelector(prefix, fresh = false) {
  await client.wait(`document.querySelector('[data-journey]')`, 'journey selector');
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-journey]').length`), 2);
  assert(await client.evaluate(`document.querySelectorAll('[data-journey] h3 button[aria-expanded="true"]').length <= 1`));
  assert(await client.evaluate(`document.querySelector('main img')?.src.endsWith(${JSON.stringify(cityArtworkSource())})`));
  await client.wait(`document.querySelector('main img')?.naturalWidth > 0`, 'approved city image loaded');
  if (fresh) {
    // Trigger the real component's error handler without introducing an unrelated HTTP failure.
    await client.evaluate(`document.querySelector('main img').dispatchEvent(new Event('error', { bubbles: true }))`);
    await client.wait(`document.querySelector('main img')?.src.endsWith(${JSON.stringify(ORIGINAL_CITY_ARTWORK)}) && document.querySelector('main img').naturalWidth > 0`, 'original artwork fallback');
    await client.call('Page.reload');
    await client.wait(`document.querySelector('main img')?.src.endsWith(${JSON.stringify(cityArtworkSource())}) && document.querySelector('main img').naturalWidth > 0`, 'approved artwork after reload');
    report.checks.push({ prefix, originalCityFallback: true, approvedArtworkRestoredOnReload: true });
  }
  await layout('selecao-jornadas', prefix, true);
  for (const width of [320, 390, 768, 1440]) {
    await client.call('Emulation.setDeviceMetricsOverride', { width, height: 960, mobile: width < 768, deviceScaleFactor: 1 });
    const image = await client.evaluate(`(()=>{const img=document.querySelector('main img');const r=img.getBoundingClientRect();return {fit:getComputedStyle(img).objectFit,width:r.width,height:r.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,alt:img.alt,controlsOverlap:[...document.querySelectorAll('main button')].filter(b=>b.getClientRects().length).some(b=>{const q=b.getBoundingClientRect();return q.left<r.right&&q.right>r.left&&q.top<r.bottom&&q.bottom>r.top})}})()`);
    assert.equal(image.fit, 'contain', 'Keep the complete city illustration visible');
    assert(image.width > 0 && image.height > 0 && image.naturalWidth > 0 && image.naturalHeight > 0);
    assert(image.alt.length > 0 && !image.controlsOverlap, 'Accessible city image with controls in separate legible panels');
    report.checks.push({ prefix, cityArtwork: cityArtworkSource(), width, completeFraming: true, controlsOverlap: false });
  }
  await client.evaluate(`document.querySelector('[data-journey] h3 button').focus()`);
  await key('End');
  assert.equal(await client.evaluate(`document.activeElement.closest('[data-journey]')?.dataset.journey`), 'entre-escolhas-e-cuidados');
  assert(await client.evaluate(`document.activeElement.matches(':focus-visible')`));
  await key('Enter');
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-journey] h3 button[aria-expanded="true"]').length`), 1);
  assert.equal(await client.evaluate(`document.querySelector('[data-journey="entre-escolhas-e-cuidados"] [role=region]').hidden`), false);
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-journey="entre-escolhas-e-cuidados"] [role=region] button, [data-journey="entre-escolhas-e-cuidados"] a').length`), 0);
  assert(!await client.evaluate(`Boolean([...document.querySelectorAll('a')].find(a=>a.textContent.includes('Guia Lilás')))`));
  if (fresh) {
    await preferences(true); await layout('selecao-acessivel', prefix, true); await preferences(false);
  }
  await key('Home');
  // Preferences close restores focus to its opener; explicitly focus the first trigger.
  await client.evaluate(`document.querySelector('[data-journey] h3 button').focus()`);
  await key('Enter');
  assert.equal(await client.evaluate(`document.querySelector('[data-journey="cidade-dos-encontros"] h3 button').getAttribute('aria-expanded')`), 'true');
  report.checks.push({ prefix, journeySelector: 'Exclusive accordion, keyboard, original artwork, disabled editorial journey, pending guide hidden' });
}

async function selectorRoundTrip(prefix) {
  const before = await room();
  await named('Início'); await journeySelector(prefix);
  assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Narração da etapa"]').length`), 0);
  await click('Retomar'); await phase(before.phase);
  const after = await room();
  for (const field of ['journeyId', 'activeMissionId', 'completedMissionIds', 'historyLog', 'guardianEncounters', 'fortuneCards']) {
    assert.deepEqual(after[field], before[field], 'Selector round trip changed ' + field);
  }
  report.checks.push({ prefix, selectorRoundTrip: before.phase, preserved: true });
}
async function invitationAccess(screen, prefix) {
  const before = await room();
  const initialViewport = await client.evaluate(`({width:innerWidth,height:innerHeight,mobile:innerWidth<768,deviceScaleFactor:devicePixelRatio})`);
  const ledger = () => client.evaluate(`Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('entre-nos-learning-')||k.startsWith('entre-nos-card-knowledge-')||k.startsWith('entre-nos-channel-activity-v')).sort().map(k=>[k,localStorage.getItem(k)]))`);
  const recordsBefore = await ledger();
  const disclosures = () => client.evaluate(`[...document.querySelectorAll('main [aria-expanded]')].map(e=>[e.getAttribute('aria-controls'),e.getAttribute('aria-expanded')])`);
  const disclosureBefore = await disclosures();
  const expected = await client.evaluate(`(()=>{const ids=${JSON.stringify(CHANNEL_ACTIVITY_QUESTIONS.map(q => q.id))};const journey=${JSON.stringify(before.journeyId)};const pending=ids.filter(id=>!localStorage.getItem('entre-nos-channel-activity-v1-'+journey+'-'+id));const saved=localStorage.getItem('entre-nos-channel-current-v1-'+journey);return pending.includes(saved)?saved:pending[0]||null})()`);
  for (const width of [390, 1440]) {
    await client.call('Emulation.setDeviceMetricsOverride', { width, height: 960, mobile: width < 768, deviceScaleFactor: 1 });
    await client.evaluate(`window.scrollTo(0,0);[...document.querySelectorAll('button[aria-label="Fechar notificação"]')].forEach(b=>b.click())`);
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-invitation]').length`), 1, 'One principal invitation per screen');
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-decision-invitation]').length`), 0, 'No duplicated decision invitation');
    const appearance = await client.evaluate(`(()=>{const b=document.querySelector('main [data-channel-invitation]');const r=b?.getBoundingClientRect();return {text:b?.textContent.trim(),yellow:b?.classList.contains('bg-amber-400'),visible:!!r&&r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight,clipped:b&&b.scrollWidth>b.clientWidth}})()`);
    assert.equal(appearance.text, 'Explore os Canais de Atendimento e ganhe pontos!');
    assert(appearance.yellow && appearance.visible && !appearance.clipped, 'Yellow invitation visible and legible on ' + screen);
    await client.evaluate(`document.querySelector('[data-channel-invitation]').focus()`); await key('Enter');
    await client.wait(`document.querySelector('[role=dialog]')`, 'principal invitation opens channels');
    if (before.learningRulesVersion === 4) {
      await client.wait(`document.querySelector('[data-channel-activity]')`, 'voluntary activity');
      if (expected) assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]')?.dataset.channelQuestion`), expected);
      else assert(await client.evaluate(`Boolean(document.querySelector('[data-channel-complete]'))`));
    }
    await key('Tab'); assert(await client.evaluate(`document.querySelector('[role=dialog]').contains(document.activeElement)`));
    await key('Escape');
    assert.equal(await client.evaluate(`document.activeElement.hasAttribute('data-channel-invitation')`), true);
    assert.deepEqual(await room(), before, 'Return to the exact phase, decision and progress');
    assert.deepEqual(await ledger(), recordsBefore, 'Access does not change answers or scores');
    assert.deepEqual(await disclosures(), disclosureBefore, 'Open perspectives and review panels remain unchanged');
    report.checks.push({ invitationScreen: screen, mission: before.activeMissionId || null, phase: before.phase, card: before.fortuneCards?.[before.activeMissionId]?.outcome || null, width, keyboard: true, uniqueYellowInvitation: true, exactReturn: true, noPointsForAccess: true });
  }
  if (before.activeMissionId === 'missao-3' && screen === 'narrativa') await layout('M03-convite-narrativa', prefix, true);
  await client.call('Emulation.setDeviceMetricsOverride', initialViewport);
  await delay(100);
}
async function perspectives(mission, prefix) {
  const before = await room();
  const selector = '[data-perspective-text]';
  const panels = () => client.evaluate(`[...document.querySelectorAll('${selector}')].map(p=>Boolean(p.getClientRects().length))`);
  const resize = async width => {
    await client.call('Emulation.setDeviceMetricsOverride', { width, height: 960, mobile: width < 768, deviceScaleFactor: 1 });
    await delay(100);
  };
  await client.wait(`document.querySelectorAll('${selector}').length===${mission.perspectives.length}`, 'perspectives');
  await client.evaluate(`[...document.querySelectorAll('button[aria-label="Fechar notificação"]')].forEach(b=>b.click())`);
  if (mission.id === 'missao-1') await layout('perspectivas-iniciais', prefix, true);
  await resize(1440);
  assert.deepEqual(await panels(), mission.perspectives.map(() => true), 'Desktop shows all perspectives without clicks');
  for (const p of mission.perspectives) {
    const content = await client.evaluate(`(()=>{const card=document.querySelector('[data-perspective="${p.id}"]');return {text:card.textContent,paragraphs:[...card.querySelectorAll('[data-narration]')].map(p=>p.textContent)}})()`);
    assert(content.text.includes(p.actorName) && content.text.includes(p.actorRole) && content.text.includes(p.actorAvatar));
    assert.deepEqual(content.paragraphs, [p.summary], 'Only the original summary is displayed');
    assert(!content.text.includes(p.details), 'Complete speech is absent from this stage');
  }
  await resize(390);
  assert.deepEqual(await panels(), mission.perspectives.map((_, i) => i === 0), 'Mobile opens only the first perspective');
  const mobileAX = (await client.call('Accessibility.getFullAXTree')).nodes.filter(node => !node.ignored).map(node => node.name?.value || '').join(' ');
  assert(mobileAX.includes(mission.perspectives[0].summary), 'Open summary is present in the accessibility tree');
  assert(!mobileAX.includes(mission.perspectives[1].summary), 'Collapsed summary is absent from the accessibility tree');
  for (const p of mission.perspectives) assert(!mobileAX.includes(p.details), 'Full speech is absent from the accessibility tree');
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-perspective] button[aria-expanded="true"]').length`), 1);
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-perspective] button').length`), mission.perspectives.length);
  assert(await client.evaluate(`[...document.querySelectorAll('[data-perspective] button')].every(b=>b.textContent.trim()!=='Ouvir'&&document.getElementById(b.getAttribute('aria-controls')))`));
  await client.evaluate(`window.__perspectiveSpeechDescriptor=Object.getOwnPropertyDescriptor(window,'speechSynthesis');window.__perspectiveSpeech=[];void Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{paused:false,speak(u){window.__perspectiveSpeech.push(u.text)},cancel(){},pause(){this.paused=true},resume(){this.paused=false}}})`);
  await client.evaluate(`document.querySelectorAll('[data-perspective] button')[1].focus()`);
  await key('Enter');
  assert.deepEqual(await panels(), [true, true, false]);
  assert.equal(await client.evaluate(`document.activeElement.getAttribute('aria-expanded')`), 'true');
  await key('Tab');
  assert.equal(await client.evaluate(`document.activeElement===document.querySelectorAll('[data-perspective] button')[2]`), true);
  await key('Enter');
  assert.deepEqual(await panels(), [true, true, true], 'Opening the third perspective does not close another');
  const expandedAX = (await client.call('Accessibility.getFullAXTree')).nodes.filter(node => !node.ignored).map(node => node.name?.value || '').join(' ');
  for (const p of mission.perspectives) {
    assert(expandedAX.includes(p.summary), 'Expanded summary is accessible');
    assert(!expandedAX.includes(p.details), 'Expansion does not reveal full speech');
  }
  await named('Ocultar perspectiva de ' + mission.perspectives[1].actorName);
  assert.deepEqual(await panels(), [true, false, true]);
  await named('Ver perspectiva de ' + mission.perspectives[1].actorName);
  await invitationAccess('perspectivas expandidas', prefix);
  assert.deepEqual(await client.evaluate('window.__perspectiveSpeech'), [], 'Reading never starts speech');
  await click('Ouvir');
  const speech = await client.evaluate('window.__perspectiveSpeech');
  for (const p of mission.perspectives) {
    assert(speech[0].includes(p.summary), 'Narration includes the visible summary');
    assert(!speech[0].includes(p.details), 'Narration never includes full speech in this stage');
  }
  await click('Parar');
  // Collapsed text must not be narrated on mobile.
  await named('Ocultar perspectiva de ' + mission.perspectives[1].actorName);
  await click('Ouvir');
  assert.equal(await client.evaluate(`window.__perspectiveSpeech[1].includes(${JSON.stringify(mission.perspectives[1].summary)})`), false);
  await click('Parar');
  await named('Ver perspectiva de ' + mission.perspectives[1].actorName);
  await client.evaluate(`void Object.defineProperty(window,'speechSynthesis',window.__perspectiveSpeechDescriptor)`);
  const alreadyExtra = await client.evaluate(`document.documentElement.dataset.textSize==='xlarge'`);
  await preferences(true);
  await layout('perspectivas-' + mission.id, prefix, mission.id === 'missao-1');
  if (!alreadyExtra) await preferences(false);
  await resize(390);
  await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'saved perspectives');
  await click('Retomar'); await phase('MISSION_SITUATION');
  await client.wait(`document.querySelector('${selector}')`, 'restored perspectives');
  assert.deepEqual(await panels(), [true, false, false], 'Reload restores the mobile default');
  await resize(1440);
  assert.deepEqual(await panels(), [true, true, true], 'Desktop remains fully visible after a mobile reload');
  const after = await room();
  assert.deepEqual(after.individualChoices, before.individualChoices);
  assert.equal(after.chosenCollectiveActionId, before.chosenCollectiveActionId);
  assert.deepEqual(after.fortuneCards, before.fortuneCards);
  report.checks.push({ mission: mission.id, perspectives: mission.perspectives.length, desktopAllVisible: true, mobileIndependent: true, keyboard: true, summaryOnly: true, fullSpeechAbsent: true, narrationSeparated: true, reloaded: true });
}
async function audioControls() {
  const voices = await client.evaluate('speechSynthesis.getVoices().length');
  await client.evaluate(`(()=>{window.__nativeVoice=[];window.__nativeSpeak=speechSynthesis.speak;speechSynthesis.speak=function(utterance){for(const event of ['start','end','error'])utterance.addEventListener(event,e=>window.__nativeVoice.push({event,error:e.error}));return window.__nativeSpeak.call(this,utterance)}})()`);
  await click('Ouvir'); await delay(1200);
  const nativeEvents = await client.evaluate('window.__nativeVoice');
  await client.evaluate(`(()=>{const stop=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Parar');if(stop&&!stop.disabled)stop.click();speechSynthesis.speak=window.__nativeSpeak})()`);
  await delay(100);
  await client.evaluate(`window.__speechDescriptor=Object.getOwnPropertyDescriptor(window,'speechSynthesis');window.__audio={spoken:[],pauses:0,resumes:0,cancels:0};void Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{paused:false,speak(u){window.__audio.spoken.push({text:u.text,rate:u.rate});u.onboundary?.({charIndex:12})},pause(){this.paused=true;window.__audio.pauses++},resume(){this.paused=false;window.__audio.resumes++},cancel(){window.__audio.cancels++}}})`);
  await click('Ouvir'); await click('Pausar'); await click('Continuar'); await click('Pausar');
  await client.evaluate(`(()=>{const select=document.querySelector('select');select.value='1.5';select.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  await click('Continuar'); await click('Parar');
  const audio = await client.evaluate('window.__audio');
  assert.equal(audio.spoken.length, 2); assert.equal(audio.spoken[1].rate, 1.5); assert(audio.pauses && audio.resumes && audio.cancels);
  assert(audio.spoken[0].text.includes('Sou '));
  assert(audio.spoken[0].text.includes('Tenho um desafio para você! Que tal aprofundar seus conhecimentos sobre ética e integridade?'));
  report.audio = { nativeVoices: voices, nativeEvents, controls: audio, limitation: 'Native start probed; controls verified with deterministic speech mock; audible pronunciation not certified' };
  await client.evaluate(`void Object.defineProperty(window,'speechSynthesis',window.__speechDescriptor)`);
}
async function channelActivity(index, correct, prefix, inspect = false) {
  const before = await room();
  const invitation = await client.evaluate(`document.querySelector('[data-channel-invitation]')?.textContent.trim()`);
  assert.equal(invitation, 'Explore os Canais de Atendimento e ganhe pontos!');
  assert(!/[0-9]/.test(invitation));
  await client.evaluate(`document.querySelector('button[aria-label="Canais"]').focus()`);
  await named('Canais'); await client.wait(`document.querySelector('[data-channel-activity]')`, 'voluntary channels');
  assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]')?.dataset.channelQuestion`), CHANNEL_ACTIVITY_QUESTIONS[index].id, 'Opens directly with the pending question');
  assert(await client.evaluate(`document.querySelector('[data-channel-progress]').innerText.includes('${index} de 5')`), 'Access does not award or mark answers');
  await client.evaluate(`[...document.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.includes('Ouvidoria / Canal de Manifestação')).click()`);
  assert(await client.evaluate(`document.querySelector('[data-channel-progress]').innerText.includes('${index} de 5')`), 'Informative channel changes do not score');
  const question = CHANNEL_ACTIVITY_QUESTIONS[index];
  const savedBefore = await client.evaluate(`localStorage.getItem('entre-nos-channel-activity-v1-'+${JSON.stringify(before.journeyId)}+'-'+${JSON.stringify(question.id)})`);
  assert.equal(savedBefore, null);
  await named('Pergunta ' + (index + 1));
  assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]')?.dataset.channelQuestion`), question.id);
  assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da atividade dos Canais"] button').length`), 3);
  if (inspect) await layout('atividade-canais-pergunta-' + index, prefix, true);
  const answer = correct ? question.correctIndex : (question.correctIndex + 1) % 3;
  await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da atividade dos Canais"] button')[${answer}].focus()`); await key('Enter');
  await click('Confirmar resposta dos Canais');
  assert.equal(await client.evaluate(`document.activeElement.hasAttribute('data-channel-feedback')`), true);
  assert(await client.evaluate(`document.querySelector('[data-channel-feedback]').innerText.includes(${JSON.stringify(correct ? '+4 pontos' : '0 ponto, sem penalidade')})`));
  const keyName = 'entre-nos-channel-activity-v1-' + before.journeyId + '-' + question.id;
  const saved = await client.evaluate(`localStorage.getItem(${JSON.stringify(keyName)})`);
  await client.evaluate(`document.querySelector('[aria-label="Alternativas da atividade dos Canais"] button').click()`);
  assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(keyName)})`), saved);
  if (inspect) await layout('atividade-canais-' + index, prefix, true);
  await key('Escape');
  assert.equal(await client.evaluate(`document.activeElement.getAttribute('aria-label')`), 'Canais');
  assert.deepEqual(await room(), before, 'Voluntary activity must not mutate mission progress or decisions');
  await named('Canais'); await client.wait(`document.querySelector('[data-channel-activity]')`, 'reopened channels');
  if (index === 4) {
    assert(await client.evaluate(`Boolean(document.querySelector('[data-channel-complete]'))`));
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question]').length`), 0);
    assert(await client.evaluate(`Boolean(document.querySelector('[aria-label="Conteúdo educativo do canal"]'))`));
  } else assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]')?.dataset.channelQuestion`), CHANNEL_ACTIVITY_QUESTIONS[index + 1].id, 'Reopening advances to the next unanswered question');
  await named('Pergunta ' + (index + 1) + ' respondida');
  assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da atividade dos Canais"] button:not(:disabled)').length`), 0);
  assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(keyName)})`), saved);
  await named('Fechar modal');
  report.checks.push({ voluntaryQuestion: question.id, correct, uniqueAward: true, missionUnchanged: true, keyboard: true });
}
async function evaluationAndComposition(prefix) {
  const before = await room();
  await client.evaluate(`[...document.querySelectorAll('section')].find(s=>s.getAttribute('aria-label')?.startsWith('Identifica')).querySelectorAll('button')[2].click()`);
  await client.wait(`document.body.innerText.includes('Compartilhe sua jornada')`, 'composition');
  const after = await room(); assert.equal(after.finalGuardianId, 'ravi'); assert.deepEqual(after.historyLog, before.historyLog);
  await layout('composicao', prefix, true);
  await client.evaluate(`window.__createBlob=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.__lastBlob=blob;return window.__createBlob(blob)}`);
  await click('Salvar imagem'); await client.wait(`document.body.innerText.includes('Imagem pronta')`, 'PNG download');
  assert.equal(await client.evaluate('window.__lastBlob.type'), 'image/png');
  assert(await client.evaluate('window.__lastBlob.size>10000'));
  // Exercise the actual invite control without sending anything to another application.
  await client.evaluate(`void Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__invite=data}})`);
  await click('Convidar alguém para jogar');
  assert.equal(await client.evaluate('window.__invite.url'), server.origin + '/' + prefix);
  await click('Avaliar experiência');
  await client.evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Auditoria <script>inofensivo</script>');input.dispatchEvent(new Event('input',{bubbles:true}))})();window.__originalOpen=window.open.bind(window);window.open=(...args)=>{window.__printWindow=window.__originalOpen(...args);if(window.__printWindow)window.__printWindow.focus=()=>{};return window.__printWindow}`);
  await click('Gerar PDF');
  await client.wait(`window.__printWindow?.document.body.innerText.includes('Avaliação da experiência')`, 'printable evaluation');
  assert(await client.evaluate(`window.__printWindow.document.body.innerText.includes('Auditoria <script>inofensivo</script>')`));
  assert.equal(await client.evaluate(`window.__printWindow.document.querySelectorAll('script').length`), 0);
  const targets = await (await fetch(`http://127.0.0.1:${debuggingPort}/json/list`)).json();
  const popup = targets.find(target => target.type === 'page' && target.title.includes('Avaliação Entre Nós'));
  assert(popup, 'Printable evaluation target missing');
  const printer = await DevTools.open(popup.webSocketDebuggerUrl);
  const pdf = await printer.call('Page.printToPDF', { printBackground: true });
  const pdfBytes = Buffer.from(pdf.data, 'base64'); assert.equal(pdfBytes.subarray(0, 4).toString(), '%PDF');
  await writeFile(path.join(artifactFolder, (prefix ? 'subpasta' : 'raiz') + '-avaliacao.pdf'), pdfBytes); printer.close();
  await client.evaluate('window.__printWindow.close()');
  await click('Fechar');
  report.checks.push({ prefix, composition: true, png: true, invite: server.origin + '/' + prefix, printableEvaluation: true, emailSent: false });
}

try {
  const candidates = [process.env.ENTRE_NOS_BROWSER, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean);
  let executable;
  for (const candidate of candidates) { try { await access(candidate); executable = candidate; break; } catch {} }
  if (!executable) throw Error('Set ENTRE_NOS_BROWSER to an installed Edge/Chromium executable.');
  server = await staticSiteServer(siteRoot);
  for (const prefix of ['', 'entre-nos/']) for (const endpoint of ['api/game', 'api/admin/metrics', '.env', 'server.ts']) {
    const result = await fetch(server.origin + '/' + prefix + endpoint, { method: endpoint === 'api/game' ? 'POST' : 'GET' });
    assert([404, 405].includes(result.status)); report.checks.push({ path: '/' + prefix + endpoint, status: result.status });
  }
  for (const prefix of ['', 'entre-nos/']) for (const entry of inventory.files) {
    const response = await fetch(server.origin + '/' + prefix + entry.path); assert.equal(response.status, 200, entry.path);
    assert.equal((await response.arrayBuffer()).byteLength, entry.bytes);
  }
  browser = spawn(executable, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + temp, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { debuggingPort = Number((await readFile(path.join(temp, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await delay(100); } }
  if (!debuggingPort) throw Error('Browser debugging endpoint unavailable');
  const targets = await (await fetch(`http://127.0.0.1:${debuggingPort}/json/list`)).json();
  client = await DevTools.open(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await client.call('Page.enable'); await client.call('Runtime.enable'); await client.call('Network.enable');
  await client.call('Network.setCacheDisabled', { cacheDisabled: true });
  client.on('Network.requestWillBeSent', event => {
    if (/^https?:/.test(event.request.url) && !event.request.url.startsWith(server.origin + '/')) report.externalInitiators.push({ url: event.request.url, initiator: event.initiator });
  });
  client.on('Runtime.exceptionThrown', event => report.runtimeErrors.push(event.exceptionDetails.text));
  client.on('Network.responseReceived', event => { if (event.response.status >= 400 && !event.response.url.endsWith('/favicon.ico')) report.failedResources.push({ url: event.response.url, status: event.response.status }); });
  client.on('Fetch.requestPaused', event => {
    const url = event.request.url;
    const isApi = /\/api\//.test(url);
    if (isApi) report.apiAttempts.push(url);
    if (isApi || !url.startsWith(server.origin + '/')) {
      report.blockedRequests.push(url); void client.call('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' }).catch(() => {});
    } else void client.call('Fetch.continueRequest', { requestId: event.requestId }).catch(() => {});
  });
  await client.call('Fetch.enable', { patterns: [{ urlPattern: 'http*', requestStage: 'Request' }] });

  for (const [caseIndex, prefix] of ['', 'entre-nos/'].entries()) {
    await client.call('Storage.clearDataForOrigin', { origin: server.origin, storageTypes: 'all' });
    await client.call('Page.navigate', { url: server.origin + '/' + prefix });
    await journeySelector(prefix, true);
    await click('Começar');
    await client.wait(`document.querySelector('#player-nickname')`, 'welcome');
    await client.evaluate('document.fonts.ready');
    assert(await client.evaluate(`document.fonts.check('16px Nunito')`));
    await layout('abertura', prefix, true);
    const guardianNames = Object.values(CHARACTERS).map(character => character.name);
    async function assertNoGuardianIdentity() {
      assert.equal(await client.evaluate(`Boolean(document.querySelector('img[src*="/rin"],img[src*="/wa."],img[src*="/wa_"],img[src*="/satori"],img[src*="/yuki"]'))`), false);
      for (const name of guardianNames) assert.equal(await client.evaluate(`document.body.innerText.includes(${JSON.stringify(name)})`), false, 'Premature Guardian identity: ' + name);
    }
    await assertNoGuardianIdentity();
    await named('Canais');
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-activity]').length`), 0);
    await named('Fechar modal');
    assert.equal(await client.evaluate(`Object.keys(localStorage).filter(k=>k.startsWith('entre-nos-channel-activity-')).length`),0);
    assert.equal(await client.evaluate(`document.querySelectorAll('button[aria-label^="Conhecer avatar "]').length`), 4);
    await named('Regras'); await client.wait(`document.querySelector('[role=dialog]')`, 'rules');
    await assertNoGuardianIdentity(); await layout('regras-sem-identidades', prefix);
    await named('Fechar');
    report.checks.push({ prefix, progressiveDiscovery: 'No Guardian identities in welcome or rules; four avatar choices preserved' });
    for (const avatar of PLAYER_AVATARS) {
      await named('Conhecer avatar ' + avatar.name); await client.wait(`document.querySelector('[role=dialog]')?.contains(document.activeElement)`, 'focus');
      for (let i = 0; i < 4; i++) { await key('Tab', Boolean(i % 2)); assert(await client.evaluate(`document.querySelector('[role=dialog]').contains(document.activeElement)`)); }
      await key('Escape'); assert.equal(await client.evaluate(`Boolean(document.querySelector('[role=dialog]'))`), false);
    }
    await named('Conhecer avatar ' + PLAYER_AVATARS[caseIndex].name); await click('Escolher avatar');
    await click('Começar'); await phase('BOARD_SELECT');
    await selectorRoundTrip(prefix);
    const first = await room(); assert.equal(Object.keys(first.players).length, 4);
    const bots = Object.values(first.players).filter(p => p.isBot); assert.equal(bots.length, 3); assert(!bots.some(p => p.variantIndex === caseIndex));
    const journeyId = first.journeyId, questions = [], guardians = [], fortunes = [];
    assert.equal(first.learningRulesVersion,4);
    await invitationAccess('mapa',prefix);
    await client.evaluate(`document.querySelector('[data-channel-invitation]').focus()`); await key('Enter');
    await client.wait(`document.querySelector('[data-channel-question]')`, 'invitation opens activity');
    await named('Pergunta 4'); await key('Escape');
    assert.equal(await client.evaluate(`document.activeElement.hasAttribute('data-channel-invitation')`),true);
    await click('Explore os Canais de Atendimento e ganhe pontos!');
    assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]').dataset.channelQuestion`),'cv-4');
    await named('Fechar modal');
    await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'pending question saved');
    await click('Retomar'); await phase('BOARD_SELECT');
    await click('Explore os Canais de Atendimento e ganhe pontos!');
    assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]').dataset.channelQuestion`),'cv-4');
    assert(await client.evaluate(`document.querySelector('[data-channel-progress]').innerText.includes('0 de 5')`));
    await named('Pergunta 1'); await named('Fechar modal');
    report.checks.push({pendingQuestionPreserved:true,invitationKeyboard:true,accessWithoutPoints:true,prefix});
    if (!caseIndex) await channelActivity(0,true,prefix,true);
    await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'voluntary board resume');
    await click('Retomar'); await phase('BOARD_SELECT');
    await named('Canais'); await client.wait(`document.querySelector('[data-channel-progress]')`, 'voluntary progress resumed');
    assert(await client.evaluate(`document.querySelector('[data-channel-progress]').innerText.includes('${!caseIndex ? 1 : 0} de 5')`));
    await named('Fechar modal');
    for (let missionIndex = 0; missionIndex < 4; missionIndex++) {
      await client.evaluate(`document.querySelectorAll('.territory-region')[${missionIndex}].click()`); await click('Explorar esta região →'); await phase('MISSION_SITUATION');
      assert(await client.evaluate(`document.body.innerText.includes('Seu papel:')`));
      await invitationAccess('narrativa',prefix);
      const perspectiveMissionId = (await room()).activeMissionId;
      await perspectives(MISSIONS.find(m => m.id === perspectiveMissionId), prefix);
      if (!missionIndex) await layout('situacao', prefix);
      await click('Desafio dos Guardiões da Integridade'); await phase('MISSION_GUARDIAN');
      assert.equal(await client.evaluate(`document.querySelector('#guardian-challenge-title')?.textContent`), 'Desafio dos Guardiões da Integridade');
      assert.equal(await client.evaluate(`document.querySelector('[data-guardian-invitation]')?.textContent`), 'Tenho um desafio para você! Que tal aprofundar seus conhecimentos sobre ética e integridade?');
      assert.equal(await client.evaluate(`document.querySelector('[data-guardian-invitation]')?.getAttribute('data-narration')`), 'story');
      assert(!await client.evaluate(`document.body.innerText.toLowerCase().includes('seu guardião')`));
      assert(await client.evaluate(`document.body.innerText.includes('Iniciar: 0 ponto.')`));
      assert(!await client.evaluate(`document.querySelector('[aria-labelledby="guardian-challenge-title"]').innerText.includes('Uma voz ainda não ouvida')`));
      await layout('convite-guardioes-' + missionIndex, prefix, missionIndex === 0);
      await invitationAccess('desafio dos Guardiões',prefix);
      await client.wait(`[...document.querySelectorAll('button')].some(b=>b.textContent==='Iniciar desafio'&&!b.disabled)`, 'challenge ready');
      const guardianAX = (await client.call('Accessibility.getFullAXTree')).nodes.filter(node => !node.ignored);
      assert(guardianAX.some(node => node.role?.value === 'heading' && node.name?.value === 'Desafio dos Guardiões da Integridade'));
      await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Iniciar desafio').focus()`);
      await key('Enter');
      let state = await room(); const missionId = state.activeMissionId, encounter = state.guardianEncounters[missionId];
      const question = GUARDIAN_QUESTIONS.find(q => q.id === encounter.questionId); assert(question); questions.push(question.id); guardians.push(encounter.guardianId);
      assert.equal(await client.evaluate(`document.querySelector('#guardian-encounter-title')?.textContent`), CHARACTERS[encounter.guardianId].name);
      report.checks.push({ mission: missionId, guardian: encounter.guardianId, integrityTitle: true, invitationExact: true, accessibleTitle: true, keyboardStart: true });
      for (const [id, character] of Object.entries(CHARACTERS)) if (id !== encounter.guardianId) assert.equal(await client.evaluate(`document.body.innerText.includes(${JSON.stringify(character.name)})`), false);
      if (!missionIndex) {
        const normal = await client.evaluate(`parseFloat(getComputedStyle(document.querySelector('[data-question-id]')).fontSize)`);
        await preferences(true);
        assert((await client.evaluate(`parseFloat(getComputedStyle(document.querySelector('[data-question-id]')).fontSize)`)) > normal);
        await layout('guardiao-extra', prefix, true); if (!caseIndex) await audioControls();
      }
      const answer = !caseIndex ? question.isTrue : !question.isTrue;
      await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(answer ? 'Verdadeiro' : 'Falso')}).focus()`); await key('Enter');
      await client.wait(`document.body.innerText.includes('Continuar para minha decisão')`, 'guardian feedback');
      assert.equal(await client.evaluate(`document.activeElement.getAttribute('role')`), 'status');
      if (!missionIndex) {
        await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'saved journey');
        await click('Retomar'); await phase('MISSION_GUARDIAN');
        assert.equal((await room()).guardianEncounters[missionId].answer, answer);
        assert.equal(await client.evaluate(`document.documentElement.dataset.textSize`), 'xlarge');
      }
      await invitationAccess('desafio respondido',prefix);
      await click('Continuar para minha decisão'); await phase('MISSION_EXPLORE');
      await invitationAccess('escolha da decisão',prefix);
      if (!caseIndex && missionIndex < 3) await channelActivity(missionIndex+1,true,prefix,missionIndex===0);
      else { await named('Canais'); await named('Fechar modal'); }
      if (!missionIndex) await layout('decisao', prefix, true);
      await client.evaluate(`document.querySelector('[role=button]').focus()`); await key('Enter');
      await client.wait(`${roomExpression}?.individualChoices[${roomExpression}?.hostId]`, 'decision');
      state = await room(); const humanChoice = state.individualChoices[state.hostId];
      await click('Ver as escolhas dos participantes'); await phase('MISSION_REVEAL');
      await invitationAccess('escolhas dos participantes',prefix);
      if (!missionIndex) {
        await click('Rever detalhes das alternativas');
        assert.equal(await client.evaluate(`document.querySelector('button[aria-expanded="true"]')?.getAttribute('aria-controls')===document.querySelector('[aria-label="Revisão das alternativas"]')?.id`), true);
        assert.equal(await client.evaluate(`document.querySelector('[aria-label="Revisão das alternativas"]').hidden`), false);
        assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Revisão das alternativas"] article').length`), 3);
        assert.equal((await room()).individualChoices[state.hostId], humanChoice);
        await layout('rever-alternativas', prefix, true);
        await invitationAccess('revisão das alternativas',prefix);
        await click('Ocultar detalhes');
        assert.equal(await client.evaluate(`document.querySelector('[aria-label="Revisão das alternativas"]').hidden`), true);
      }
      if (!missionIndex) await layout('participantes', prefix, true);
      await click('Ver o que aconteceu'); await phase('MISSION_CONSEQUENCE'); assert.equal((await room()).chosenCollectiveActionId, humanChoice);
      await invitationAccess('consequência antes da carta',prefix);
      await client.evaluate(`window.__random=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=array=>{array.fill(0);return array}`);
      const outcome = ['caminhos', 'reves', 'caminhos', 'segunda_chance'][missionIndex];
      const legacyCase = caseIndex === 1 && missionIndex === 3;
      if (legacyCase) await client.evaluate(`localStorage.setItem('entre-nos-card-scenario-'+${JSON.stringify(journeyId)}+'-'+${JSON.stringify(missionId)}+'-segunda_chance','sc-1');localStorage.setItem('entre-nos-reflection-'+${JSON.stringify(journeyId)}+'-'+${JSON.stringify(missionId)}+'-sc-1','1')`);
      await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim().endsWith('Carta '+${{ segunda_chance: 2, reves: 1, caminhos: 3 }[outcome]})).click()`);
      await client.wait(`${roomExpression}?.fortuneCards[${JSON.stringify(missionId)}]`, 'fortune');
      await client.evaluate('crypto.getRandomValues=window.__random');
      assert.equal((await room()).fortuneCards[missionId].outcome, outcome); fortunes.push(outcome);
      if (outcome !== 'sorte') {
        await client.wait(`document.querySelector('[data-card-question]')`, 'card question');
        await invitationAccess('carta '+outcome,prefix);
        const id = await client.evaluate(`document.querySelector('[data-card-question]').dataset.cardQuestion`);
        if (legacyCase) {
          assert.equal(await client.evaluate(`document.querySelector('[data-card-question]').dataset.cardVersion`), '1');
          assert(await client.evaluate(`document.body.innerText.includes(${JSON.stringify(LEGACY_SECOND_CHANCE_SCENARIOS[0].prompt)})`));
          assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da pergunta da carta"] button:not(:disabled)').length`), 0);
          assert(await client.evaluate(`document.body.innerText.includes('sem bônus retroativo')`));
        } else {
          const q = [...SECOND_CHANCE_SCENARIOS, ...SETBACK_SCENARIOS, ...PATH_SCENARIOS].find(q => q.id === id); assert(q);
          assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da pergunta da carta"] button').length`), 3);
          const answerIndex = caseIndex === 0 ? q.correctIndex : (q.correctIndex + 1) % 3;
          await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da pergunta da carta"] button')[${answerIndex}].focus()`); await key('Enter');
          await click('Confirmar resposta');
          assert.equal(await client.evaluate(`document.activeElement.hasAttribute('data-card-feedback')`), true);
          assert(await client.evaluate(`document.querySelector('[data-card-feedback]').innerText.includes(${JSON.stringify(!caseIndex ? '+5 pontos de conhecimento' : '+0 pontos de conhecimento')})`));
          const recordKey = 'entre-nos-card-knowledge-v2-' + journeyId + '-' + missionId;
          const recordBefore = await client.evaluate(`localStorage.getItem(${JSON.stringify(recordKey)})`);
          await client.evaluate(`document.querySelector('[aria-label="Alternativas da pergunta da carta"] button').click()`);
          assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(recordKey)})`), recordBefore);
          if (!missionIndex) {
            await layout('carta-feedback', prefix, true);
            await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'saved card');
            await click('Retomar'); await phase('MISSION_CONSEQUENCE');
            await client.wait(`document.querySelector('[data-card-feedback]')`, 'restored card feedback');
            assert.equal(await client.evaluate(`localStorage.getItem(${JSON.stringify(recordKey)})`), recordBefore);
            assert.equal((await room()).chosenCollectiveActionId, humanChoice);
          }
        }
      }
      await invitationAccess('carta respondida '+outcome,prefix);
      if (!missionIndex) {
        await layout('consequencia', prefix, true);
        if (!caseIndex) legacySnapshot = await client.evaluate(`Object.fromEntries(['entre-nos-solo','guardioes_room_code','guardioes_player_id','guardioes_session_token'].map(k=>[k,localStorage.getItem(k)]))`);
      }
      await click(missionIndex === 3 ? 'Ver resumo e medalha' : 'Próxima missão →'); await phase(missionIndex === 3 ? 'GAME_SUMMARY' : 'BOARD_SELECT');
      if(missionIndex<3) await invitationAccess('mapa após missão',prefix);
    }
    assert.equal(new Set(guardians).size, 4);
    assert.equal(await client.evaluate(`document.querySelector('[data-channel-summary]').textContent`), !caseIndex ? '16 de 20' : '0 de 20');
    assert(await client.evaluate(`document.body.innerText.includes('Medalha Caminhos da Escuta')`));
    await invitationAccess('resumo e encerramento',prefix);
    if (caseIndex) {
      assert(await client.evaluate(`document.body.innerText.includes('0 de 5 perguntas respondidas')`));
      report.checks.push({summaryWithZeroVoluntaryAnswers:true,medalUnblocked:true});
      for(let i=0;i<5;i++) await channelActivity(i,false,prefix,i===0||i===4);
    } else await channelActivity(4,true,prefix,true);
    const expected = !caseIndex ? 100 : 0;
    const maximum = !caseIndex ? 100 : 95;
    await client.wait(`document.body.innerText.includes('${expected} de ${maximum} pontos disponíveis')`, 'learning score');
    assert(await client.evaluate(`document.body.innerText.includes('${!caseIndex ? 20 : 0} de ${!caseIndex ? 20 : 15} pontos de conhecimento disponíveis')`));
    for (const name of guardianNames) assert(await client.evaluate(`document.body.innerText.includes(${JSON.stringify(name)})`), 'Final Guardian choice missing: ' + name);
    await layout('resumo', prefix, true); await evaluationAndComposition(prefix);
    await invitationAccess('composição final',prefix);
    assert(!await client.evaluate(`document.body.innerText.toLowerCase().includes('seu guardião')`));
    await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Ver resumo')`, 'saved summary');
    await click('Ver resumo'); await phase('GAME_SUMMARY'); assert.equal((await room()).finalGuardianId, 'ravi');
    if (!caseIndex) version3Snapshot = await client.evaluate(`Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))`);
    await client.evaluate('window.confirm=()=>true'); await click('Jogar novamente'); await phase('BOARD_SELECT');
    const restarted = await room(); assert.notEqual(restarted.journeyId, journeyId); assert.deepEqual(restarted.guardianEncounters, {});
    assert(!await client.evaluate(`Boolean(localStorage.getItem('entre-nos-learning-'+${JSON.stringify(restarted.journeyId)}))`));
    await named('Início'); await client.wait(`document.querySelector('[data-journey-progress]')`, 'independent attempts');
    assert(await client.evaluate(`[...document.querySelectorAll('button')].some(b=>b.textContent.startsWith('Retomar partida anterior')&&b.textContent.includes('4 de 4'))`));
    assert(await client.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('Retomar partida anterior')&&b.textContent.includes('4 de 4'));b.click();return true})()`));
    await phase('GAME_SUMMARY');
    assert.equal((await room()).journeyId, first.journeyId);
    await client.wait(`document.body.innerText.includes('${expected} de ${maximum} pontos disponíveis')`, 'restored score without duplicate awards');
    await named('Início'); await click('Recomeçar');
    await client.wait(`document.querySelector('#player-nickname')`, 'new attempt avatar');
    assert(await client.evaluate(`document.querySelector('button[aria-label="Conhecer avatar ${PLAYER_AVATARS[caseIndex].name}"]').getAttribute('aria-pressed')==='true'`));
    await named('Conhecer avatar ' + PLAYER_AVATARS[(caseIndex + 1) % 4].name); await click('Escolher avatar');
    await click('Começar'); await phase('BOARD_SELECT');
    const third = await room(); assert.notEqual(third.journeyId, first.journeyId); assert.notEqual(third.journeyId, restarted.journeyId);
    assert.equal(third.players[third.hostId].variantIndex, (caseIndex + 1) % 4);
    assert.equal(third.completedMissionIds.length, 0);

    report.cases.push({ prefix: '/' + prefix, avatar: PLAYER_AVATARS[caseIndex].name, completedMissions: 4, guardians, questions, learningRulesVersion:4, channelPoints:!caseIndex?20:0, channelAnswered:5, learning: expected, maximum, fortunes, cardKnowledge: !caseIndex ? 20 : 0, cardMaximum: !caseIndex ? 20 : 15, legacyAnswerPreserved: caseIndex === 1, restart: 'fresh identity and no inherited credits', resumed: true });
    console.log('Verified static journey: /' + prefix);
  }
  // Rule-3 compatibility: saved answers remain credited under the former rule; v4 voluntary records are ignored.
  await client.evaluate(`(()=>{const saved=${JSON.stringify(version3Snapshot)};const data=JSON.parse(saved['entre-nos-solo']);data.rooms.find(([code])=>code===saved.guardioes_room_code)[1].learningRulesVersion=3;saved['entre-nos-solo']=JSON.stringify(data);localStorage.clear();for(const [k,v] of Object.entries(saved))localStorage.setItem(k,v)})()`);
  await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Ver resumo')`, 'version 3 resume');
  await click('Ver resumo'); await phase('GAME_SUMMARY');
  assert.equal((await room()).learningRulesVersion,3);
  await client.wait(`document.body.innerText.includes('100 de 100 pontos disponíveis')`, 'version 3 score unchanged');
  assert(await client.evaluate(`document.body.innerText.includes('Encontro com o Guardião: +5')`));
  await named('Canais'); assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-activity]').length`),0);
  assert(await client.evaluate(`document.querySelector('[role=dialog]').innerText.includes('Sem pontuação')`));
  await named('Fechar modal');
  report.checks.push({legacyRulesVersion:3,total:100,openingPointsPreserved:20,noVoluntaryRetroactiveBonus:true});
  await client.evaluate(`(()=>{const data=JSON.parse(localStorage.getItem('entre-nos-solo'));data.rooms.find(([code])=>code===localStorage.getItem('guardioes_room_code'))[1].phase='MISSION_EXPLORE';localStorage.setItem('entre-nos-solo',JSON.stringify(data))})()`);
  await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'legacy decision invitation');
  await click('Retomar'); await phase('MISSION_EXPLORE');
  assert.equal(await client.evaluate(`document.querySelector('[data-channel-invitation]')?.textContent.trim()`), 'Explore os Canais de Atendimento e ganhe pontos!');
  await layout('convite-amarelo-legado', 'entre-nos/', true);
  // Restore a genuine consequence snapshot, removing only the new rule marker and retaining an old Sorte.
  await client.evaluate(`(()=>{const saved=${JSON.stringify(legacySnapshot)};const data=JSON.parse(saved['entre-nos-solo']);const old=data.rooms.find(([code])=>code===saved.guardioes_room_code)[1];delete old.learningRulesVersion;old.fortuneCards[old.activeMissionId]={cardIndex:0,outcome:'sorte'};saved['entre-nos-solo']=JSON.stringify(data);localStorage.clear();for(const [k,v] of Object.entries(saved))localStorage.setItem(k,v)})()`);
  await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'legacy Sorte saved journey');
  await click('Retomar'); await phase('MISSION_CONSEQUENCE');
  await client.wait(`document.body.innerText.includes('Sorteio: +3 pontos')`, 'legacy Sorte +3');
  assert.equal((await room()).learningRulesVersion, undefined);
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-card-question]').length`),0);
  await layout('sorte-legada', 'entre-nos/', true);
  await click('Próxima missão →'); await phase('BOARD_SELECT');
  report.checks.push({legacySorte:true,originalBonus:3,noRetroactiveQuestion:true,resumed:true});
  // The pilot visits four missions. Exercise the two additional catalog missions
  // through view-only restored snapshots, without changing the production journey.
  for (const mission of MISSIONS.filter(m => !report.checks.some(c => c.mission === m.id && c.desktopAllVisible))) {
    await client.evaluate(`(()=>{const data=JSON.parse(localStorage.getItem('entre-nos-solo'));const state=data.rooms.find(([code])=>code===localStorage.getItem('guardioes_room_code'))[1];state.phase='MISSION_SITUATION';state.activeMissionId=${JSON.stringify(mission.id)};localStorage.setItem('entre-nos-solo',JSON.stringify(data))})()`);
    await client.call('Page.reload'); await client.wait(`document.body.innerText.includes('Retomar')`, 'additional catalog mission');
    await click('Retomar'); await phase('MISSION_SITUATION');
    await perspectives(mission, 'entre-nos/');
  }
  assert.deepEqual(report.apiAttempts, []); assert.deepEqual(report.blockedRequests, []); assert.deepEqual(report.runtimeErrors, []); assert.deepEqual(report.failedResources, []);
  report.finishedAt = new Date().toISOString(); report.passed = true;
} catch (error) {
  report.passed = false; report.error = String(error.stack || error); process.exitCode = 1;
  console.error(report.error);
  if (client) {
    report.lastScreen = await client.evaluate('document.body.innerText.slice(-3000)').catch(() => null);
    const shot = await client.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }).catch(() => null);
    if (shot) await writeFile(path.join(artifactFolder, 'falha.png'), Buffer.from(shot.data, 'base64'));
    console.error(report.lastScreen);
  }
} finally {
  await writeFile(path.join(artifactFolder, 'resultados.json'), JSON.stringify(report, null, 2) + '\n');
  if (client) { await client.call('Browser.close').catch(() => {}); client.close(); }
  if (browser && browser.exitCode === null) browser.kill();
  if (server) await server.close();
}
console.log(JSON.stringify({ passed: report.passed, cases: report.cases.length, dimensions: report.dimensions.length, apiAttempts: report.apiAttempts, blockedRequests: report.blockedRequests, results: path.relative(projectRoot, path.join(artifactFolder, 'resultados.json')) }));
