import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,mkdtemp,access} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {JOURNEY2_MISSIONS} from '../src/data/journey2Missions.ts';
import {JOURNEY2_EDITORIAL} from '../src/data/journey2Editorial.ts';
import {GUARDIAN_QUESTIONS} from '../src/data/pilot.ts';
import {PATH_SCENARIOS} from '../src/data/pathScenarios.ts';
import {SECOND_CHANCE_SCENARIOS,SETBACK_SCENARIOS} from '../src/data/fortuneScenarios.ts';
import {CHANNEL_ACTIVITY_QUESTIONS} from '../src/data/channelActivity.ts';
import {REGIONS} from '../src/data/regions.ts';
import {dialoguePages} from '../src/services/dialoguePages.ts';
import {restoreLegacyBrowserFixture} from './legacy-browser-fixture.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
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

const origin = process.env.ENTRE_NOS_LOCAL_URL || 'http://127.0.0.1:5173';
assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const output = path.resolve(process.env.ENTRE_NOS_LOCAL_REPORT || 'artifacts/development/journey2-integrada-20261031/browser');
await mkdir(output, { recursive: true });
const profile = await mkdtemp(path.join(os.tmpdir(), 'entre-nos-j2-'));
const report = { passed: false, cases: [], layouts: [], errors: [], api: [] };
let browser, client;
const quoted = JSON.stringify;
const stateJS = `(()=>{const d=JSON.parse(localStorage.getItem('entre-nos-solo')||'null');return d?.rooms.find(([c])=>c===localStorage.getItem('guardioes_room_code'))?.[1]})()`;
const state = () => client.evaluate(stateJS);
const phase = async p => {
  await client.wait(`${stateJS}?.phase===${quoted(p)}`, p);
  if (/^MISSION_|^BOARD_SELECT$|^GAME_SUMMARY$/.test(p)) {
    await client.wait(`document.querySelectorAll('[data-channel-invitation]').length===1`, 'one channels invitation');
  }
};
async function click(text) {
  const match = text.startsWith('Carta ') ? `b.textContent.includes(${quoted(text)})` : `b.textContent.trim()===${quoted(text)}`;
  const js = `[...document.querySelectorAll('button')].find(b=>b.getClientRects().length&&!b.disabled&&${match})`;
  await client.wait(js, text); await client.evaluate(`${js}.click()`); await delay(40);
}
async function select(selector) { await client.evaluate(`document.querySelector(${quoted(selector)}).click()`); await delay(40); }
async function named(text) { await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${quoted(text)}).click()`); await delay(40); }
const narrative = () => client.evaluate(`[...document.querySelectorAll('[data-narrative-index] [data-narration]')].map(el=>el.textContent).join(' ')`);
async function layout(label, width, capture = false) {
  assert.equal(await client.evaluate('document.documentElement.scrollWidth>innerWidth'), false, label);
  report.layouts.push({ label, width });
  if (capture) { await client.evaluate('window.scrollTo(0,0)'); const shot = await client.call('Page.captureScreenshot', { format: 'png' }); await writeFile(path.join(output, `${label}-${width}.png`), Buffer.from(shot.data, 'base64')); }
}
async function participate(width, wrong, label) {
  await client.wait(`document.querySelector('[data-channel-question]')`, 'mission channel question');
  assert.equal(await client.evaluate(`document.querySelector('[role="dialog"]').textContent.includes('O desafio é opcional')`), false);
  const before = await state();
  const questionId = await client.evaluate(`document.querySelector('[data-channel-question]').dataset.channelQuestion`);
  const question = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === questionId);
  assert(question);
  assert.equal(before.missionChannelActivity.missions[before.activeMissionId].answer, undefined);
  await client.call('Input.dispatchKeyEvent', {type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert(await client.evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`));
  await client.call('Input.dispatchKeyEvent', {type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await client.wait(`!document.querySelector('[role="dialog"]')`,'escape closes channels');
  assert.deepEqual((await state()).dialoguePositions, before.dialoguePositions);
  await select('[data-channel-invitation]');
  assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]').dataset.channelQuestion`), questionId);
  const option = wrong ? (question.correctIndex + 1) % 3 : question.correctIndex;
  await client.evaluate(`[...document.querySelectorAll('[role="group"][aria-label="Alternativas da atividade dos Canais"] button')][${option}].focus()`);
  for (const type of ['keyDown','keyUp']) await client.call('Input.dispatchKeyEvent', {type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
  await click('Confirmar resposta dos Canais');
  await client.wait(`document.querySelector('[data-channel-feedback]')`, 'mission channel feedback');
  assert.equal((await state()).missionChannelActivity.missions[before.activeMissionId].answer, option);
  await layout(label+'-channels', width, true);
  await named('Fechar modal');
  const answered = (await state()).missionChannelActivity;
  await select('[data-channel-invitation]');
  assert(await client.evaluate(`!!document.querySelector('[data-channel-feedback]')`));
  assert.equal(await client.evaluate(`document.querySelectorAll('[aria-label="Alternativas da atividade dos Canais"] button:not(:disabled)').length`),0);
  if (label === 'j2-m01' || label === 'j2-m03') {
    await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Fechar pergunta').focus()`);
  } else await client.evaluate(`document.querySelector('[data-channel-id="ouvidoria"]').focus()`);
  for (const type of ['keyDown','keyUp']) await client.call('Input.dispatchKeyEvent', {type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
  await client.wait(`!document.querySelector('[data-mission-channel-activity]')`, 'information replaces answered activity');
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question], [data-channel-feedback], [aria-label="Alternativas da atividade dos Canais"]').length`),0);
  for (const id of ['etica','rh','ouvidoria','corregedoria','acolhimento']) {
    await select(`[data-channel-id="${id}"]`);
    assert(await client.evaluate(`!!document.querySelector('#channel-educational-content')`));
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question], [data-channel-feedback]').length`),0);
    assert.equal(await client.evaluate(`document.activeElement===document.querySelector('[data-channel-heading]')`),true);
    const box = await client.evaluate(`(()=>{const r=document.querySelector('[data-channel-heading]').getBoundingClientRect();const parent=document.querySelector('[data-channel-heading]').closest('[role="dialog"]').getBoundingClientRect();return {top:r.top,bottom:r.bottom,parentTop:parent.top,parentBottom:parent.bottom}})()`);
    assert(box.top>=box.parentTop && box.bottom<=box.parentBottom, 'selected channel title visible');
  }
  await layout(label+'-information', width, true);
  await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Voltar ao jogo').focus()`);
  for (const type of ['keyDown','keyUp']) await client.call('Input.dispatchKeyEvent', {type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
  await client.wait(`!document.querySelector('[role="dialog"]')`, 'return to game');
  await select('[data-channel-invitation]');
  assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question], [data-channel-feedback]').length`),0);
  await named('Fechar modal');
  assert.deepEqual((await state()).missionChannelActivity, answered);
  assert.deepEqual((await state()).dialoguePositions, before.dialoguePositions);
}
try {
  let executable;
  for (const p of ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe']) { try { await access(p); executable = p; break; } catch {} }
  assert(executable);
  browser = spawn(executable, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let port;
  for (let i = 0; i < 100; i++) { try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await delay(100); } }
  assert(port);
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  client = await DevTools.open(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await client.call('Page.enable'); await client.call('Runtime.enable'); await client.call('Network.enable');
  client.on('Runtime.exceptionThrown', e => report.errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
  client.on('Network.requestWillBeSent', e => { if (e.request.url.startsWith(origin + '/api/')) report.api.push(e.request.url); });
  client.on('Page.javascriptDialogOpening', () => { void client.call('Page.handleJavaScriptDialog', { accept: true }); });
  await client.call('Page.addScriptToEvaluateOnNewDocument', { source: `window.__speech=[];window.__cancel=0;Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>window.__cancel++,pause:()=>{},resume:()=>{},speak:u=>window.__speech.push(u.text)}});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};` });
  let firstAttempt;
  for (const [caseIndex, width] of [1440, 390].entries()) {
    await client.call('Emulation.setDeviceMetricsOverride', { width, height: 960, mobile: width < 768, deviceScaleFactor: 1 });
    await client.call('Page.navigate', { url: origin });
    await client.wait(`document.querySelector('[data-journey=entre-escolhas-e-cuidados] [data-start-journey]:not(:disabled)')`, 'local journey');
    await named('Canais');
    assert.equal(await client.evaluate(`[...document.querySelectorAll('[role="dialog"] button')].some(b=>b.textContent.trim()==='Voltar ao jogo')`), false);
    await click('Fechar');
    await select('[data-journey=entre-escolhas-e-cuidados] [data-start-journey]');
    await client.wait(`document.querySelector('[data-journey-opening]')`, 'opening');
    const opening = [JOURNEY2_EDITORIAL.opening.title, ...JOURNEY2_EDITORIAL.opening.paragraphs];
    for (const text of opening) assert(await client.evaluate(`document.querySelector('[data-journey-opening-text]').textContent.includes(${quoted(text)})`));
    await click('Começar jornada'); await client.wait(`document.querySelector('#player-nickname')`, 'avatar');
    assert.equal(await client.evaluate(`[...document.querySelectorAll('button')].filter(b=>b.getAttribute('aria-label')?.startsWith('Conhecer avatar')).length`), 4);
    await client.evaluate(`document.querySelector('form').requestSubmit()`); await phase('BOARD_SELECT');
    await restoreLegacyBrowserFixture(client); await phase('BOARD_SELECT');
    const attempt = (await state()).journeyId;
    await select('[data-channel-invitation]');
    assert.equal(await client.evaluate(`!!document.querySelector('[data-channel-question]')`), false);
    assert.equal(await client.evaluate(`[...document.querySelectorAll('[role="dialog"] button')].some(b=>b.textContent.trim()==='Voltar ao jogo')`), false);
    await named('Fechar modal');
    assert.deepEqual((await state()).missionChannelActivity.missions, {});
    if (!caseIndex) firstAttempt = attempt; else assert.notEqual(attempt, firstAttempt);
    for (const [missionIndex, mission] of JOURNEY2_MISSIONS.entries()) {
      await client.evaluate(`[...document.querySelectorAll('button.territory-region')].find(b=>!b.disabled&&b.textContent.includes(${quoted(REGIONS[mission.regionId].name)})).click()`);
      await click('Explorar esta região →'); await phase('MISSION_SITUATION'); assert.equal((await state()).activeMissionId, mission.id);
      const pages = dialoguePages(mission.dialogue);
      for (let step = 0; step < pages.length; step++) {
        const page = pages[step];
        await client.wait(`document.querySelector('[data-narrative-index]')?.dataset.narrativeIndex==='${step}'`, 'dialogue');
        for (let turn = page.start; turn <= page.end; turn++) assert((await narrative()).includes(mission.dialogue[turn].text));
        assert.equal(await client.evaluate(`document.querySelectorAll('[data-mission-dialogue] [data-dialogue-turn]').length`),page.end-page.start+1);
        assert(await client.evaluate(`document.querySelector('[data-mission-dialogue]').textContent.includes('Trecho ${step+1} de ${pages.length}')`));
        assert.equal(await client.evaluate(`document.querySelectorAll('[data-narrative-index]').length`), 1);
        assert.equal(await client.evaluate(`document.querySelectorAll('[data-mission-dialogue] img').length`), 0);
        if (step === 3 || (missionIndex === 0 && step === 1)) await layout(mission.id+'-named-dialogue',width,true);
        if (mission.dialogue.slice(page.start,page.end+1).some(t=>t.speaker === 'Caio')) await layout('caio-dialogue', width, true);
        if (step === 1 && missionIndex === 0) {
          await click('Ouvir');
          for (let turn=page.start;turn<=page.end;turn++) assert((await client.evaluate('window.__speech.at(-1)')).includes(mission.dialogue[turn].text));
          await client.call('Page.reload'); await click('Retomar'); await phase('MISSION_SITUATION'); assert.equal((await state()).dialoguePositions[mission.id], page.end);
        }
        if (step === 2 && missionIndex < 3) {
          await select('[data-channel-invitation]'); await client.wait(`document.querySelector('[role=dialog]')`, 'channels');
          await participate(width, !!caseIndex, mission.id);
          if (missionIndex === 0) {
            const saved = await state(); await client.call('Page.reload'); await click('Retomar'); await phase('MISSION_SITUATION');
            assert.deepEqual((await state()).missionChannelActivity, saved.missionChannelActivity);
            assert.equal((await state()).dialoguePositions[mission.id], page.end);
          }
        }
        if (step < pages.length - 1) {
          await client.evaluate(`document.querySelector('[data-narrative-next]').focus()`);
          for (const type of ['keyDown','keyUp']) await client.call('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
        } else await layout(mission.id + '-dialogue', width, true);
      }
      await click('Desafio dos Guardiões da Integridade'); await phase('MISSION_GUARDIAN'); await click('Iniciar desafio');
      await client.wait(`document.querySelector('[data-question-id]')`, 'guardian');
      const questionId = await client.evaluate(`document.querySelector('[data-question-id]').dataset.questionId`);
      const guardianQuestion = GUARDIAN_QUESTIONS.find(q => q.id === questionId);
      await click((caseIndex ? !guardianQuestion.isTrue : guardianQuestion.isTrue) ? 'Verdadeiro' : 'Falso'); await click('Tomar uma decisão'); await phase('MISSION_EXPLORE');
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-mission-choice]').length`), 4);
      for (const action of mission.actions) assert(await client.evaluate(`document.querySelector(${quoted('[data-mission-choice=' + action.id + ']')}).textContent.includes(${quoted(action.title)})`));
      await layout(mission.id + '-choices', width, true);
      const option = caseIndex ? [0, 3, 1, 0][missionIndex] : missionIndex < 2 ? 1 : 2;
      await client.evaluate(`document.querySelector(${quoted('[data-mission-choice=' + mission.actions[option].id + ']')}).focus()`);
      for (const type of ['keyDown', 'keyUp']) await client.call('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, ...(type === 'keyDown' ? { text: '\r' } : {}) });
      await click('Conhecer outras escolhas'); await phase('MISSION_REVEAL'); await click('Ver o que aconteceu'); await phase('MISSION_CONSEQUENCE');
      const outcome = [mission.actions[option].consequenceSummary, mission.actions[option].pedagogicalFeedback, mission.finalReflection];
      for (let i = 0; i < outcome.length; i++) { assert((await narrative()).includes(outcome[i])); await layout(mission.id + '-outcome-' + i, width, i === 0); if (i < outcome.length - 1) await click('Próximo trecho'); }
      assert.equal((await state()).chosenCollectiveActionId, mission.actions[option].id);
      await click('Carta 1'); await client.wait(`document.querySelector('[data-card-question]')`, 'card');
      const cardId = await client.evaluate(`document.querySelector('[data-card-question]').dataset.cardQuestion`);
      assert(!/missão|missões|retratad[oa]/i.test(await client.evaluate(`document.querySelector('[data-card-question] [data-narration]').textContent`)));
      const card = [...PATH_SCENARIOS, ...SECOND_CHANCE_SCENARIOS, ...SETBACK_SCENARIOS].find(q => q.id === cardId);
      await client.evaluate(`[...document.querySelectorAll('button')].filter(b=>b.closest('[aria-label]')?.getAttribute('aria-label')==='Alternativas da pergunta da carta')[${caseIndex ? (card.correctIndex + 1) % 3 : card.correctIndex}].click()`);
      await click('Confirmar resposta'); await client.wait(`document.querySelector('[data-card-feedback]')`, 'card feedback');
      if (missionIndex === 3) {
        await click('Participar dos Canais de Atendimento');
        assert.equal((await state()).phase, 'MISSION_CONSEQUENCE');
        await participate(width, !!caseIndex, mission.id);
      }
      await click(missionIndex === 3 ? 'Ver resumo e medalha' : 'Próxima missão →'); await phase(missionIndex === 3 ? 'GAME_SUMMARY' : 'BOARD_SELECT');
    }
    for (const paragraph of JOURNEY2_EDITORIAL.closing.paragraphs) assert(await client.evaluate(`document.querySelector('[data-journey-closing]').textContent.includes(${quoted(paragraph)})`));
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-journey-closing] [data-narrative-reader]').length`),0);
    assert.equal(new Set(Object.values((await state()).missionChannelActivity.missions).map(r=>r.questionId)).size,4);
    const link = await client.evaluate(`(()=>{const a=[...document.querySelectorAll('a')].find(a=>a.textContent.includes('Conhecer o Guia Lilás'));return a&&{href:a.href,target:a.target,rel:a.rel}})()`);
    assert.equal(link.href, JOURNEY2_EDITORIAL.closing.url); assert.equal(link.target, '_blank'); assert(link.rel.includes('noopener'));
    await select('[data-channel-invitation]');
    assert.equal(await client.evaluate(`!!document.querySelector('[data-channel-question]')`),false);
    await named('Fechar modal'); const total = caseIndex ? 0 : 100;
    await client.wait(`document.querySelector('[data-learning-total]')?.textContent.includes('${total} de 100 pontos disponíveis')`, 'score'); await layout('summary', width, true);
    await client.call('Page.reload'); await click('Ver resumo'); await phase('GAME_SUMMARY'); assert.equal((await state()).journeyId, attempt);
    assert(await client.evaluate(`document.querySelector('[data-learning-total]')?.textContent.includes('${total} de 100 pontos disponíveis')`));
    await client.evaluate('window.scrollTo(0,0)');
    const closingClip=await client.evaluate(`(()=>{const r=document.querySelector('[data-journey-closing]').getBoundingClientRect();const y=Math.max(0,r.top+scrollY-16);return {x:0,y,width:innerWidth,height:document.documentElement.scrollHeight-y,scale:1}})()`);
    const closingShot=await client.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:closingClip}); await writeFile(path.join(output,`closing-${width}.png`),Buffer.from(closingShot.data,'base64'));
    await click('Voltar às jornadas');
    await client.wait(`document.querySelector('[data-journey=entre-escolhas-e-cuidados]').textContent.includes('4 de 4')`, 'preserved result');
    report.cases.push({ width, attempt, missions: 4, dialogueTurns: 30, dialoguePages: JOURNEY2_MISSIONS.map(m=>dialoguePages(m.dialogue).length), total, guide: link.href, resumePreserved: true, channelParticipations:4, narrativePortraits:0, singleClosing:true });
  }
  await select('[data-journey=cidade-dos-encontros] [data-start-journey]'); await client.wait(`document.querySelector('#player-nickname')`, 'original avatar');
  assert.equal(await client.evaluate(`!!document.querySelector('[data-journey-opening]')`), false);
  await client.evaluate(`document.querySelector('form').requestSubmit()`); await phase('BOARD_SELECT'); assert.equal((await state()).journeyDefinitionId, 'cidade-dos-encontros'); assert.equal((await state()).completedMissionIds.length, 0);
  await named('Início'); await client.wait(`document.querySelector('[data-journey=entre-escolhas-e-cuidados]').textContent.includes('4 de 4')`, 'independent progress');
  assert.deepEqual(report.errors, []); assert.deepEqual(report.api, []); report.passed = true;
} catch (error) {
  report.error = String(error.stack || error); process.exitCode = 1; console.error(report.error);
  if (client) { report.lastScreen = await client.evaluate('document.body.innerText').catch(() => ''); console.error(report.lastScreen); }
} finally {
  await writeFile(path.join(output, 'resultados.json'), JSON.stringify(report, null, 2));
  if (client) { await client.call('Browser.close').catch(() => {}); client.close(); } if (browser && browser.exitCode === null) browser.kill();
}
console.log(JSON.stringify({ passed: report.passed, cases: report.cases.length, layouts: report.layouts.length, errors: report.errors }));

