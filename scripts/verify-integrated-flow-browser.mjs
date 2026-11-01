import { spawn } from 'node:child_process';
import { access, readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { DevTools, delay } from './browser-devtools.mjs';
import { MISSIONS } from '../src/data/missions.ts';
import { JOURNEY2_MISSIONS } from '../src/data/journey2Missions.ts';
import { JOURNEY2_EDITORIAL } from '../src/data/journey2Editorial.ts';
import { dialoguePages } from '../src/services/dialoguePages.ts';
import { GUARDIAN_IDS, GUARDIAN_QUESTIONS } from '../src/data/pilot.ts';
import { PATH_SCENARIOS } from '../src/data/pathScenarios.ts';
import { SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS } from '../src/data/fortuneScenarios.ts';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../src/data/channelActivity.ts';
import { REGIONS } from '../src/data/regions.ts';
import { JOURNEYS } from '../src/data/journeys.ts';

const origin = process.env.ENTRE_NOS_LOCAL_URL || 'http://127.0.0.1:5173';
assert(['127.0.0.1','localhost'].includes(new URL(origin).hostname));
const output = path.resolve(process.env.ENTRE_NOS_LOCAL_REPORT || 'artifacts/development/revisao-integrada-20261101/browser');
await mkdir(output, { recursive: true });
const report = { passed: false, cases: [], layouts: [], errors: [], api: [] };
const quote = JSON.stringify;
let browser, client;
const stateJS = `(()=>{const s=JSON.parse(localStorage.getItem('entre-nos-solo')||'null');return s?.rooms.find(([id])=>id===localStorage.getItem('guardioes_room_code'))?.[1]})()`;
const state = () => client.evaluate(stateJS);
const phase = name => client.wait(`${stateJS}?.phase===${quote(name)}`, name);
async function button(text, keyboard = true) {
  const selector = `[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.getClientRects().length&&b.textContent.trim()===${quote(text)})`;
  await client.wait(selector, text);
  await client.evaluate(selector + (keyboard ? '.focus()' : '.click()'));
  if (keyboard) for (const type of ['keyDown','keyUp']) await client.call('Input.dispatchKeyEvent', {type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
  await delay(35);
}
async function select(selector) { await client.wait(`document.querySelector(${quote(selector)})`, selector); await client.evaluate(`document.querySelector(${quote(selector)}).click()`); await delay(35); }
async function named(name) { await select(`[aria-label=${quote(name)}]`); }
async function captureBlock(selector, label, width, parent = false) {
  await client.evaluate('window.scrollTo(0,0)');
  const clip = await client.evaluate(`(()=>{let el=document.querySelector(${quote(selector)});if(${parent})el=el.parentElement;const r=el.getBoundingClientRect();return {x:0,y:Math.max(0,r.top+scrollY-12),width:innerWidth,height:r.height+24,scale:1}})()`);
  const shot = await client.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
  await writeFile(path.join(output,`${label}-${width}.png`),Buffer.from(shot.data,'base64'));
}
async function checkLayout(label, width, capture = false) {
  assert.equal(await client.evaluate('document.documentElement.scrollWidth>innerWidth'), false, label);
  const clipped = await client.evaluate(`!![...document.querySelectorAll('[data-dialogue-turn] p, [data-mission-outcome] p, [data-channel-question]')].find(p=>p.getClientRects().length&&(p.scrollWidth>p.clientWidth+1||p.scrollHeight>p.clientHeight+1))`);
  assert.equal(clipped, false, label+' text clipping');
  report.layouts.push({label,width});
  if (capture) {
    await client.evaluate('window.scrollTo(0,0)');
    const shot = await client.call('Page.captureScreenshot',{format:'png'});
    await writeFile(path.join(output,`${label}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
}
async function resume(id, expected, before) {
  await client.call('Page.reload');
  const buttonJS = `[...document.querySelectorAll('[data-journey=${id}] button')].find(b=>b.textContent.trim()==='Retomar'||b.textContent.trim()==='Ver resumo')`;
  await client.wait(buttonJS, 'resume'); await client.evaluate(buttonJS+'.click()'); await phase(expected);
  const after = await state();
  for (const key of ['journeyId','historyLog','cardChallenges','guardianEncounters','missionChannelActivity','completedMissionIds']) assert.deepEqual(after[key],before[key]);
  assert.equal(await client.evaluate(`!!document.querySelector('[data-learning-confetti]')`), false, 'No celebration on reload');
}
async function celebration(expected) {
  if (expected) {
    await client.wait(`document.querySelector('[data-learning-confetti]')`, 'correct answer confetti');
    assert.equal(await client.evaluate(`getComputedStyle(document.querySelector('[data-learning-confetti] span')).animationName`),'learning-confetti-fall');
  }
  else assert.equal(await client.evaluate(`!!document.querySelector('[data-learning-confetti]')`),false,'No confetti for an error/reduced motion');
}
try {
  const profile=await mkdtemp(path.join(os.tmpdir(),'entre-nos-integrated-'));
  let executable;
  for(const p of ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe']){try{await access(p);executable=p;break;}catch{}}
  assert(executable);
  browser=spawn(executable,['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let port;
  for(let i=0;i<100;i++){try{port=Number((await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await delay(100);}}
  const tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json();
  client=await DevTools.open(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await client.call('Page.enable');await client.call('Runtime.enable');await client.call('Network.enable');
  client.on('Runtime.exceptionThrown', e=>report.errors.push(e.exceptionDetails.exception?.description||e.exceptionDetails.text));
  client.on('Network.requestWillBeSent',e=>{if(e.request.url.startsWith(origin+'/api/'))report.api.push(e.request.url);});
  client.on('Page.javascriptDialogOpening',()=>{void client.call('Page.handleJavaScriptDialog',{accept:true});});
  await client.call('Page.addScriptToEvaluateOnNewDocument',{source:`window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>{},pause:()=>{},resume:()=>{},speak:u=>window.__spoken.push(u.text)}});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};`});
  for(const width of [1440,390])for(const id of ['cidade-dos-encontros','entre-escolhas-e-cuidados']) {
    const correct = width===1440;
    const reduced = correct && id==='entre-escolhas-e-cuidados';
    const missions = id==='cidade-dos-encontros'?JOURNEYS[0].missionIds.map(id=>MISSIONS.find(m=>m.id===id)):JOURNEY2_MISSIONS;
    await client.call('Emulation.setDeviceMetricsOverride',{width,height:960,mobile:width<768,deviceScaleFactor:1});
    await client.call('Page.navigate',{url:origin});
    await client.wait(`document.querySelector('[data-journey=${id}] [data-start-journey]:not(:disabled)')`,'select journey');
    await select(`[data-journey=${id}] [data-start-journey]`);
    if(id==='entre-escolhas-e-cuidados') {
      await client.wait(`document.querySelector('[data-journey-opening-text]')`,'unified opening');
      for(const text of [JOURNEY2_EDITORIAL.opening.title,...JOURNEY2_EDITORIAL.opening.paragraphs]) assert(await client.evaluate(`document.querySelector('[data-journey-opening-text]').textContent.includes(${quote(text)})`));
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-journey-opening] [data-narrative-next]').length`),0);
      await checkLayout('opening-'+id,width,true); await button('Começar jornada');
    }
    await client.wait(`document.querySelector('#player-nickname')`,'avatar');
    assert.equal(await client.evaluate(`document.querySelectorAll('button[aria-label^="Conhecer avatar "]').length`),4);
    await client.evaluate(`document.querySelector('form').requestSubmit()`);await phase('BOARD_SELECT');
    const attempt=(await state()).journeyId;assert.equal((await state()).missionFlowVersion,2);
    await named('Acessibilidade');
    if((await client.evaluate(`document.documentElement.dataset.reducedMotion==='true'`))!==reduced)await named('Reduzir Animações');
    await button('Concluir');
    const seenChannels=[];
    for(const [index,mission] of missions.entries()) {
      await client.evaluate(`[...document.querySelectorAll('button.territory-region')].find(b=>!b.disabled&&b.textContent.includes(${quote(REGIONS[mission.regionId].name)})).click()`);
      await button('Explorar esta região →');await phase('MISSION_SITUATION');
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-invitation]').length`),0);
      // Free consultation never reserves an educational question before its stage.
      await named('Canais');await client.wait(`document.querySelector('[role=dialog]')`,'free channels');
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question]').length`),0);
      await button('Voltar ao jogo');assert.equal((await state()).phase,'MISSION_SITUATION');
      if(mission.dialogue)for(const [i,page]of dialoguePages(mission.dialogue).entries()) {
        await client.wait(`document.querySelector('[data-narrative-index]')?.dataset.narrativeIndex==='${i}'`,'paired scene');
        for(let t=page.start;t<=page.end;t++)assert(await client.evaluate(`document.querySelector('[data-dialogue-turn="${t}"]').textContent.includes(${quote(mission.dialogue[t].text)})`));
        assert.equal(await client.evaluate(`!![...document.querySelectorAll('[data-mission-dialogue] h2')].find(h=>h.textContent==='Narração')`),false);
        await checkLayout(mission.id+'-scene-'+i,width,i===1);
        if(i<dialoguePages(mission.dialogue).length-1)await button('Próximo trecho');
      }
      await button('Tomar uma decisão');await phase('MISSION_EXPLORE');
      assert.equal((await state()).guardianEncounters[mission.id].questionId,undefined);
      assert.equal(await client.evaluate(`!!document.querySelector('[data-learning-confetti]')`),false);
      const choice=mission.actions[index%mission.actions.length];
      if(mission.dialogue)await select(`[data-mission-choice=${choice.id}]`);else await named(choice.title);
      assert.equal(await client.evaluate(`!!document.querySelector('[data-learning-confetti]')`),false,'Dilemmas are never celebrated');
      await button(mission.dialogue?'Conhecer outras escolhas':'Ver as escolhas dos participantes');await phase('MISSION_REVEAL');
      await checkLayout(mission.id+'-participants',width,index===0);
      await button('E depois da sua escolha?');await phase('MISSION_CONSEQUENCE');
      for(const text of [choice.consequenceSummary,choice.pedagogicalFeedback,...(mission.finalReflection?[mission.finalReflection]:[])])assert(await client.evaluate(`document.querySelector('[data-mission-outcome]').textContent.includes(${quote(text)})`));
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-mission-outcome] [data-narrative-next]').length`),0);
      await checkLayout(mission.id+'-outcome',width,true);
      if(index===0)await captureBlock('[data-mission-outcome]',mission.id+'-cards-transition',width,true);
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-fortune-index]').length`),0,'Cards must be on the next screen');
      await button('Vamos ao Desafio das Cartas do Destino!');await phase('MISSION_CARDS');
      assert.equal(await client.evaluate(`!!document.querySelector('[data-mission-outcome]')`),false);
      assert.equal((await state()).fortuneCards[mission.id],undefined);
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-fortune-index]').length`),3);
      assert.equal(await client.evaluate(`[...document.querySelectorAll('[data-fortune-index]')].some(b=>/Revés|Segunda chance|Caminhos/.test(b.textContent))`),false);
      const center = await client.evaluate(`(()=>{const c=[...document.querySelectorAll('[data-fortune-index]')].map(b=>b.getBoundingClientRect());return (c[0].left+c[2].right)/2})()`);
      assert(Math.abs(center-width/2)<3,'Cards centered');
      await checkLayout(mission.id+'-cards-closed',width,true);
      await client.evaluate(`[...document.querySelectorAll('button')].find(b=>!b.disabled&&b.textContent.includes('Carta 1')).click()`);
      await client.wait(`document.querySelector('[data-card-question]')`,'card');
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-fortune-index][aria-pressed=true]').length`),1);
      assert.equal(await client.evaluate(`[...document.querySelectorAll('[data-fortune-index]:not([aria-pressed=true])')].some(b=>/Revés|Segunda chance|Caminhos/.test(b.textContent))`),false);
      await checkLayout(mission.id+'-cards-revealed',width,true);
      const cardId=await client.evaluate(`document.querySelector('[data-card-question]').dataset.cardQuestion`);
      assert(!/missão|missões|retratad[oa]/i.test(await client.evaluate(`document.querySelector('[data-card-question] [data-narration]').textContent`)));
      const card=[...PATH_SCENARIOS,...SECOND_CHANCE_SCENARIOS,...SETBACK_SCENARIOS].find(q=>q.id===cardId);assert(card);
      const cardAnswer=correct?card.correctIndex:(card.correctIndex+1)%3;
      await select(`[aria-label="Alternativas da pergunta da carta"] button:nth-child(${cardAnswer+1})`);await button('Confirmar resposta');
      await celebration(correct&&!reduced);
      await client.wait(`${stateJS}?.cardChallenges?.[${quote(mission.id)}]`,'card mirrored to snapshot');
      if(index===0)await resume(id,'MISSION_CARDS',await state());
      await button('Continuar para os Guardiões');await phase('MISSION_GUARDIAN');
      await client.wait(`document.querySelector('[data-question-id]')`,'immediate guardian question');
      assert.equal(await client.evaluate(`[...document.querySelectorAll('button')].some(b=>b.textContent==='Iniciar desafio')`),false);
      assert.equal(await client.evaluate(`!!document.querySelector('[data-guardian-invitation]')`),false);
      const qid=(await state()).guardianEncounters[mission.id].questionId;
      const guardian=GUARDIAN_QUESTIONS.find(q=>q.id===qid);assert(guardian);
      await checkLayout(mission.id+'-guardian',width,true);
      if (index === 0) {
        const normal = await client.evaluate(`parseFloat(getComputedStyle(document.querySelector('[data-question-id]')).fontSize)`);
        await named('Acessibilidade'); await button('Extra'); await button('Concluir');
        assert(await client.evaluate(`parseFloat(getComputedStyle(document.querySelector('[data-question-id]')).fontSize)`) > normal);
        await checkLayout(mission.id+'-guardian-extra',width,true);
        await named('Acessibilidade'); await button('Padrão'); await button('Concluir');
      }
      await button((correct?guardian.isTrue:!guardian.isTrue)?'Verdadeiro':'Falso');await celebration(correct&&!reduced);
      if(index===1)await resume(id,'MISSION_GUARDIAN',await state());
      await button('Continuar para os Canais de Atendimento');await phase('MISSION_CHANNELS');
      await client.wait(`document.querySelector('[data-channel-question]')`,'channels question');
      const channelId=await client.evaluate(`document.querySelector('[data-channel-question]').dataset.channelQuestion`);
      seenChannels.push(channelId);assert.equal(new Set(seenChannels).size,seenChannels.length);
      const channel=CHANNEL_ACTIVITY_QUESTIONS.find(q=>q.id===channelId);assert(channel);
      if(index===0) {
        const pending=await state();await client.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        assert.equal((await state()).phase,'MISSION_CHANNELS');await button('Continuar desafio dos Canais');
        assert.equal(await client.evaluate(`document.querySelector('[data-channel-question]').dataset.channelQuestion`),channelId);
        assert.deepEqual((await state()).missionChannelActivity,pending.missionChannelActivity);
      }
      const channelAnswer=correct?channel.correctIndex:(channel.correctIndex+1)%3;
      await select(`[aria-label="Alternativas da atividade dos Canais"] button:nth-child(${channelAnswer+1})`);await button('Confirmar resposta dos Canais');await celebration(correct&&!reduced);
      await checkLayout(mission.id+'-channels-feedback',width,true);
      if(index===2)await resume(id,'MISSION_CHANNELS',await state());
      if(index%2===0)await button('Fechar pergunta');else await select('[data-channel-id=ouvidoria]');
      assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question], [data-channel-feedback]').length`),0);
      await checkLayout(mission.id+'-channels-information',width,index===0);
      await button('Voltar ao jogo');await phase(index===3?'GAME_SUMMARY':'BOARD_SELECT');
      assert.equal((await state()).completedMissionIds.length,index+1);
    }
    const total=correct?100:0;
    await client.wait(`document.querySelector('[data-learning-total]')?.textContent.includes('${total} de 100 pontos disponíveis')`,'preserved total');
    const end=await state();
    const guardians=Object.values(end.guardianEncounters).map(e=>e.guardianId);
    assert.deepEqual([...new Set(guardians)].sort(),[...GUARDIAN_IDS].sort());
    assert(await client.evaluate(`document.body.innerText.includes('Com qual Guardião você mais se identificou nesta jornada?')`));
    assert.equal(await client.evaluate(`document.querySelectorAll('[data-score-category]').length`),3);
    for(const [category,maximum]of [['guardians',60],['channels',20],['cards',20]])assert(await client.evaluate(`document.querySelector('[data-score-category=${category}]').textContent.includes('${correct?maximum:0} de ${maximum}')`));
    assert.equal(await client.evaluate(`document.querySelector('[aria-label="Pontuação de aprendizagem"]').textContent.includes('Regra anterior')`),false);
    await resume(id,'GAME_SUMMARY',end);
    if(id==='entre-escolhas-e-cuidados')assert(await client.evaluate(`!![...document.querySelectorAll('a')].find(a=>a.href===${quote(JOURNEY2_EDITORIAL.closing.url)})`));
    await checkLayout('summary-'+id,width,true);
    await captureBlock('[aria-label="Pontuação de aprendizagem"]','learning-summary-'+id,width);
    await named('Canais');assert.equal(await client.evaluate(`document.querySelectorAll('[data-channel-question]').length`),0);await button('Fechar');
    await named('Início');
    report.cases.push({journey:id,width,missions:4,total,reducedMotion:reduced,guardians,closedCards:true,compactSummary:true,resumed:['cards','guardian','channels','summary'],order:['narrative','decision','participants','outcome','cards','guardian','channels','next']});
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.api,[]);report.passed=true;
}catch(error){report.error=String(error.stack||error);console.error(report.error);if(client){report.lastScreen=await client.evaluate('document.body.innerText').catch(()=>'');console.error(report.lastScreen);}process.exitCode=1;}
finally{await writeFile(path.join(output,'resultados.json'),JSON.stringify(report,null,2));if(client){await client.call('Browser.close').catch(()=>{});client.close();}if(browser&&browser.exitCode===null)browser.kill();}
console.log(JSON.stringify({passed:report.passed,cases:report.cases.length,layouts:report.layouts.length,errors:report.errors}));
