import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/game';
import metricsHandler from '../api/admin/metrics';
function response() {return {code:200,data:null as any,status(n:number){this.code=n;return this;},json(data:any){this.data=data;return this;},setHeader(){}};}
test('API persists a room across requests and lets a second device join', async()=>{
 const original=globalThis.fetch;let state:string|null=null,lock:string|null=null;
 process.env.UPSTASH_REDIS_REST_URL='https://example.test';process.env.UPSTASH_REDIS_REST_TOKEN='test';process.env.ADMIN_PASSKEY='test-admin';
 globalThis.fetch=async (_url,options)=>{
  const c=JSON.parse(String(options?.body));let result:any=null;
  if(c[0]==='SET' && c[1]==='entre-nos:lock'){if(!lock){lock=c[2];result='OK';}}
  if(c[0]==='GET') result=state;
  if(c[0]==='EVAL' && c[2]===2){if(lock===c[5]){state=c[6];result=1;} else result=0;}
  if(c[0]==='EVAL' && c[2]===1){if(lock===c[4]){lock=null;result=1;}else result=0;}
  return new Response(JSON.stringify({result}),{status:200});
 };
 try {
  const first=response();await handler({method:'POST',body:{message:{type:'CREATE_ROOM',nickname:'A',characterId:'alex',variantIndex:0}}},first);
  assert.equal(first.code,200);const a=first.data.frames.find((f:any)=>f.type==='ROOM_JOINED');assert.ok(a.sessionToken);
  const second=response();await handler({method:'POST',body:{message:{type:'JOIN_ROOM',roomCode:a.roomCode,nickname:'B',characterId:'bia',variantIndex:0}}},second);assert.equal(second.code,200);
  const b=second.data.frames.find((f:any)=>f.type==='ROOM_JOINED');assert.equal(Object.keys(b.state.players).length,2);
  const send=async (session:any,message?:any)=>{const r=response();await handler({method:'POST',body:{sessionToken:session.sessionToken,roomCode:session.roomCode,message}},r);assert.equal(r.code,200);return r.data.frames.filter((f:any)=>f.state).at(-1);};
  await send(b,{type:'TOGGLE_READY'});await send(a,{type:'START_GAME'});
  const poll=await send(a);assert.equal(poll.state.phase,'BOARD_SELECT');
  const metrics=response();await metricsHandler({method:'GET',headers:{authorization:'Bearer test-admin'}},metrics);assert.equal(metrics.code,200);assert.equal(metrics.data.evaluation.preEvaluationsCount,0);
  const bad=response();await handler({method:'POST',body:{sessionToken:'invalid',roomCode:a.roomCode}},bad);assert.equal(bad.code,401);
 } finally {globalThis.fetch=original;delete process.env.UPSTASH_REDIS_REST_URL;delete process.env.UPSTASH_REDIS_REST_TOKEN;delete process.env.ADMIN_PASSKEY;}
});
test('unconfigured backend returns explicit 503, never silently accepts a game',async()=>{
 const r=response();await handler({method:'POST',body:{}},r);assert.equal(r.code,503);
});
