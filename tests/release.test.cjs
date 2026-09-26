// Development-only tests. The release archive contains index.html only.
const fs=require('node:fs'),vm=require('node:vm');
const test=require('node:test'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const engineContext=vm.createContext({});vm.runInContext(scripts[1],engineContext);const E=engineContext.PulseBallEngine;
test('all inline JavaScript parses',()=>scripts.forEach(s=>new vm.Script(s)));
test('every campaign level has a clean start-to-finish input replay',()=>{
 const {step,controls,routes}=require('./campaign-routes.json');assert.equal(routes.length,18);
 for(const route of routes){
  const g=E.createGame(route.level-1);
  for(const [a,frames] of route.spans)for(let f=0;f<frames;f++){
   E.step(g,controls[a],step);assert.equal(g.health,3,`level ${route.level}: replay damage at ${g.player.x}`);
  }
  assert.equal(g.status,'won',`level ${route.level}: replay did not finish`);
 }
});
test('18 levels retain safe checkpoint landing margins',()=>{
 assert.equal(E.levels.length,18);
 E.levels.forEach((l,i)=>{
  assert.ok(l.ground.some(([a,b])=>l.checkpoint>=a+50&&l.checkpoint<=b-50),`level ${i+1}: checkpoint on ledge`);
  for(const phase of [0,2,4,6]){
   const g=E.createGame(i);g.time=phase;g.spawn={x:l.checkpoint,y:440};g.checkpoint.active=true;Object.assign(g.player,{x:l.checkpoint,y:440});
   for(let f=0;f<360;f++)E.step(g,{},1/120);
   assert.equal(g.health,3,`level ${i+1}: unsafe respawn`);assert.ok(g.player.grounded);
  }
 });
});
test('orb receivers can be activated and create the intended bridge',()=>{
 E.levels.forEach((l,i)=>(l.orbs||[]).forEach((_,j)=>{
  const g=E.createGame(i),o=g.orbs[j],target=g.orbTargets[o.target];
  Object.assign(g.player,{x:o.x-o.dir*65,y:o.y,vx:0,vy:0,face:o.dir,invincible:10});
  E.step(g,{pulse:true},1/120);
  assert.ok(o.active,`level ${i+1}: orb ${j+1} did not launch`);
  for(let f=0;f<480&&!target.on;f++)E.step(g,{},1/120);
  assert.ok(target.on,`level ${i+1}: orb ${j+1} missed receiver`);
  assert.ok(g.ground.some(s=>s.orbBridge&&s.x===target.bridgeStart&&s.w===target.bridgeEnd-target.bridgeStart));
 }));
});
test('crate and switch puzzles open bridges through normal Pulse actions',()=>{
 E.levels.forEach((l,i)=>{
  if(l.switch<0)return;
  const g=E.createGame(i),c=g.crates[0];
  function fire(x){Object.assign(g.player,{x,y:458,vx:0,vy:0,face:1,invincible:10});g.pulseHeld=false;g.pulseCooldown=0;E.step(g,{pulse:true},1/120)}
  fire(l.switch-65);
  for(let n=0;n<8&&!g.bridgeOn;n++)fire(c.x-60);
  assert.ok(g.bridgeOn,`level ${i+1}: crate misses plate or is blocked`);
 });
});
function saveContext(){
 const c=vm.createContext({E,best:[],unlocked:0});
 const src=scripts[2];
 const record=src.slice(src.indexOf('  function recordFor('),src.indexOf('  function ratingFor('));
 const merge=src.slice(src.indexOf('  function mergeExternalProgress('),src.indexOf('  function fit('));
 vm.runInContext(record+merge,c);return c;
}
test('save merging is monotonic, rejects invalid records, and migrates legacy arrays',()=>{
 const c=saveContext(),name=E.levels[0].name;
 c.mergeExternalProgress([{level:name,stars:20,time:44}]);
 c.mergeExternalProgress({unlocked:0,best:[{level:name,stars:2,time:55}]});
 c.mergeExternalProgress('{broken');
 assert.equal(c.best[0].stars,20);assert.equal(c.best[0].time,44);assert.equal(c.unlocked,1);
 c.mergeExternalProgress({unlocked:2.5,best:[{level:name,stars:-2,time:-4}]});
 assert.equal(c.best[0].stars,20);assert.equal(c.unlocked,2);
 c.mergeExternalProgress({unlocked:Infinity,best:[{level:name,stars:24,time:39}]});
 assert.equal(c.best[0].stars,24);assert.equal(c.best[0].time,39);assert.equal(c.unlocked,2);
});
async function platform(){
 const handlers={},calls=[];let callbacks;
 const sdk={environment:{i18n:{lang:'en'}},on:(n,f)=>handlers[n]=f,
  getStorage:async()=>{handlers.game_api_pause?.();return {getItem:()=>null,setItem(){}}},
  getPlayer:async()=>({getData:async()=>({}),setData:async()=>{}}),
  features:{LoadingAPI:{ready:()=>calls.push('ready')},GameplayAPI:{start:()=>calls.push('start'),stop:()=>calls.push('stop')}},
  adv:{showRewardedVideo:o=>{callbacks=o.callbacks},showFullscreenAdv:o=>{callbacks=o.callbacks},showBannerAdv:async()=>{},hideBannerAdv:async()=>{}}};
 const c=vm.createContext({navigator:{language:'ru'},location:{hostname:'localhost',search:''},URLSearchParams,setTimeout,clearTimeout,YaGames:{init:async()=>sdk},PulseGame:{platformPause:r=>calls.push('pause:'+r),platformResume:r=>calls.push('resume:'+r)}});
 vm.runInContext(scripts[0],c);await c.YandexPlatform.readyPromise;
 return {p:c.YandexPlatform,calls,callbacks:()=>callbacks};
}
test('startup pauses are observed while storage is loading; ready is sent once',async()=>{
 const {p,calls}=await platform();assert.ok(calls.includes('pause:platform'));assert.ok(!calls.includes('ready'));p.notifyGameReady();p.notifyGameReady();assert.equal(calls.filter(c=>c==='ready').length,1);
});
test('reward requires onRewarded and is granted only once',async()=>{
 const {p,callbacks}=await platform();let rewards=0;
 let promise=p.showRewarded(()=>rewards++);callbacks().onOpen();callbacks().onClose();assert.equal(await promise,false);callbacks().onRewarded();assert.equal(rewards,0);
 promise=p.showRewarded(()=>rewards++);callbacks().onOpen();callbacks().onRewarded();callbacks().onRewarded();callbacks().onClose();assert.equal(await promise,true);assert.equal(rewards,1);
 promise=p.showRewarded(()=>rewards++);callbacks().onError();assert.equal(await promise,false);assert.equal(rewards,1);
});
