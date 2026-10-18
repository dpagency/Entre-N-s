import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleClientMessage, restore, snapshot, type GameConnection} from '../src/game/engine';
import {MISSIONS} from '../src/data/missions';
import {PRE_TEST_QUESTIONS,POST_TEST_QUESTIONS} from '../src/data/evaluations';
import type {ClientMessage} from '../src/types/game';
function fresh() {restore({rooms:[],tokens:[],evaluations:[],feedback:[]});}
function client() {const frames:any[]=[];const ws:GameConnection={readyState:1,send:data=>frames.push(JSON.parse(data))}; return {frames,ws,send:(msg:ClientMessage)=>handleClientMessage(ws,msg)};}
const answers = (questions:typeof PRE_TEST_QUESTIONS) => Object.fromEntries(questions.map(q=>[q.id,q.options[0].id]));
test('solo pilot completes four distinct regions and reaches medal summary', () => {
 fresh(); const c=client();
 c.send({type:'CREATE_ROOM',nickname:'Teste',characterId:'alex',variantIndex:0});
 const room=()=>snapshot().rooms[0][1];
 c.send({type:'START_GAME'});
 assert.equal(room().phase,'BOARD_SELECT');
 assert.equal(Object.values(room().players).filter(p=>p.isBot).length,3);
 const firstFour = ['praca','sala','oficina','portal'].map(region => MISSIONS.find(m=>m.regionId===region)!);
 for (const mission of firstFour) {
  c.send({type:'VOTE_DESTINATION',regionId:mission.regionId});
  c.send({type:'CONFIRM_DESTINATION'});
  assert.equal(room().phase,'MISSION_SITUATION');
  assert.equal(room().activeMissionId,mission.id);
  c.send({type:'EXPLORE_MISSION'});
  assert.equal(room().phase,'MISSION_EXPLORE');
  const humanId = Object.values(room().players).find(p => !p.isBot)!.id;
  const selectedAction = mission.actions[room().completedMissionIds.length % mission.actions.length].id;
  c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:selectedAction});
  assert.equal(room().individualChoices[humanId],selectedAction);
  assert.equal(room().phase,'MISSION_EXPLORE');
  c.send({type:'PROCEED_TO_REVEAL'});
  assert.equal(room().phase,'MISSION_REVEAL');
  c.send({type:'OPEN_COLLECTIVE_VOTE'});
  if(room().phase==='MISSION_TF_CHALLENGE') {
   c.send({type:'SUBMIT_TF_ANSWER',answer:true});
   c.send({type:'PROCEED_AFTER_CONSEQUENCE'});
  }
  assert.equal(room().phase,'MISSION_CONSEQUENCE');
  assert.equal(room().chosenCollectiveActionId,selectedAction, 'consequence must reflect the human choice');
  c.send({type:'PROCEED_AFTER_CONSEQUENCE'});
  assert.equal(room().phase,'MISSION_CONSEQUENCE');
  c.send({type:'DRAW_FORTUNE_CARD',cardIndex:0});
  assert.ok(room().fortuneCards?.[mission.id]);
  c.send({type:'PROCEED_AFTER_CONSEQUENCE'});
 }
 assert.equal(room().phase,'GAME_SUMMARY');
 assert.equal(room().completedMissionIds.length,4);
 assert.equal(new Set(room().completedMissionIds).size,4);
});
test('solo choice remains visible until explicit reveal',()=>{
 fresh();const c=client();c.send({type:'CREATE_ROOM',nickname:'Teste',characterId:'alex',variantIndex:0});
 const room=()=>snapshot().rooms[0][1];
 c.send({type:'START_GAME'});
 c.send({type:'VOTE_DESTINATION',regionId:'praca'});c.send({type:'CONFIRM_DESTINATION'});c.send({type:'EXPLORE_MISSION'});
 c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:MISSIONS[0].actions[0].id});
 assert.equal(room().phase,'MISSION_EXPLORE');
 c.send({type:'PROCEED_TO_REVEAL'});
 assert.equal(room().phase,'MISSION_REVEAL');
});

test('confirmed solo choice cannot be replaced, even after a guardian power',()=>{
 fresh();const c=client();
 c.send({type:'CREATE_ROOM',nickname:'Teste',characterId:'ravi',variantIndex:0});
 const room=()=>snapshot().rooms[0][1];
 c.send({type:'START_GAME'});
 c.send({type:'VOTE_DESTINATION',regionId:'praca'});
 c.send({type:'CONFIRM_DESTINATION'});
 c.send({type:'EXPLORE_MISSION'});
 const mission=MISSIONS.find(m=>m.id===room().activeMissionId)!;
 const first=mission.actions[0].id;
 const alternative=mission.actions[1].id;
 c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:first});
 const humanId=Object.values(room().players).find(p=>!p.isBot)!.id;
 assert.equal(room().individualChoices[humanId],first);
 c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:alternative});
 assert.equal(room().individualChoices[humanId],first);
 c.send({type:'USE_POWER',powerType:'ravi'});
 assert.equal(room().individualChoices[humanId],first);
 c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:alternative});
 assert.equal(room().individualChoices[humanId],first);
 c.send({type:'PROCEED_TO_REVEAL'});
 assert.equal(room().phase,'MISSION_REVEAL');
 assert.equal(room().individualChoices[humanId],first);
});

test('each chosen guardian guides the human without replacing their decision', () => {
 for (const guardian of ['alex', 'joana', 'ravi', 'bia'] as const) {
  fresh();
  const c = client();
  c.send({type:'CREATE_ROOM', nickname:'Pessoa participante', characterId:guardian, variantIndex:0});
  const room = () => snapshot().rooms[0][1];
  c.send({type:'START_GAME'});
  const human = Object.values(room().players).find(p => !p.isBot)!;
  const bots = Object.values(room().players).filter(p => p.isBot);
  assert.equal(human.characterId, guardian);
  assert.equal(bots.length, 3);
  assert.equal(new Set(bots.map(p => p.characterId)).size, 3);
  assert.ok(bots.every(p => p.characterId !== guardian));
  c.send({type:'VOTE_DESTINATION',regionId:'praca'});
  c.send({type:'CONFIRM_DESTINATION'});
  c.send({type:'EXPLORE_MISSION'});
  const mission = MISSIONS.find(m => m.id === room().activeMissionId)!;
  const chosen = mission.actions[0].id;
  c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:chosen});
  const differentPower = (['alex','joana','ravi','bia'] as const).find(id => id !== guardian)!;
  c.send({type:'USE_POWER',powerType:differentPower});
  assert.equal(room().players[human.id].hasUsedPower, false, 'another guardian power must not be usable');
  c.send({type:'USE_POWER',powerType:guardian});
  assert.equal(room().players[human.id].hasUsedPower, true);
  c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:mission.actions[1].id});
  assert.equal(room().individualChoices[human.id],chosen);
  c.send({type:'PROCEED_TO_REVEAL'});
  assert.equal(room().phase,'MISSION_REVEAL');
 }
});
