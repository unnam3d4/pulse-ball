const fs=require('fs'),assert=require('assert/strict');
// Use an externally provided Playwright installation; it is not a game dependency.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const html=fs.readFileSync(__dirname+'/../index.html','utf8').replace('requestAnimationFrame(frame);bootstrap();',`globalThis.__qa={get g(){return g},get mode(){return mode},get best(){return best},get unlocked(){return unlocked},get pauseReasons(){return [...pauseReasons]},get audio(){return audio},openDialog,loadLevel,setLanguage,mergeExternalProgress,saveProgress,showMenu,showLevelPicker,showSettings,draw};requestAnimationFrame(frame);bootstrap();`);
async function mockSdk(p){await p.addInitScript(()=>{
 globalThis.sdkTrace=[];globalThis.sdkEvents={};globalThis.adCallbacks=null;
 const trace=s=>sdkTrace.push(s);
 globalThis.YaGames={init:async()=>({environment:{i18n:{lang:'en'}},on:(n,f)=>sdkEvents[n]=f,
 getStorage:async()=>({getItem:()=>null,setItem:()=>trace('safe-save')}),getPlayer:async()=>({getData:async()=>({pulseBallSave:{best:[{level:'Первый импульс',stars:20,time:55}],unlocked:1}}),setData:async data=>{globalThis.lastCloud=data;trace('cloud-save')}}),
 features:{LoadingAPI:{ready:()=>trace(document.querySelector('#bootScreen').hidden?'ready-interactive':'ready-too-early')},GameplayAPI:{start:()=>trace('start'),stop:()=>trace('stop')}},
 adv:{showBannerAdv:async()=>trace('banner-show'),hideBannerAdv:async()=>trace('banner-hide'),showRewardedVideo:({callbacks})=>{globalThis.adCallbacks=callbacks;callbacks.onOpen()},showFullscreenAdv:({callbacks})=>{globalThis.adCallbacks=callbacks;callbacks.onOpen()}}
 })};
})}
(async()=>{
 const b=await chromium.launch();let failed=0;
 const tests={
  'corrupt modern save preserves legacy':async p=>{
   await p.addInitScript(()=>{localStorage.setItem('pulse-ball-progress-v2','{bad');localStorage.setItem('pulse-ball-save-v1',JSON.stringify([{level:'Первый импульс',stars:20,time:44}]))});await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>__qa.best[0]?.stars),20);
  },
  'modern and legacy merge without losing best':async p=>{
   await p.addInitScript(()=>{localStorage.setItem('pulse-ball-progress-v2',JSON.stringify({unlocked:0,best:[{level:'Первый импульс',stars:2,time:55}]}));localStorage.setItem('pulse-ball-save-v1',JSON.stringify([{level:'Первый импульс',stars:20,time:44}]))});await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>__qa.best[0]?.stars),20);
  },
  'platform pause during storage load retained':async p=>{
   await p.addInitScript(()=>{let handlers={};globalThis.YaGames={init:async()=>({environment:{i18n:{lang:'en'}},on:(n,f)=>handlers[n]=f,getStorage:async()=>{await new Promise(r=>setTimeout(r,30));handlers.game_api_pause?.();return {getItem:()=>null}},getPlayer:async()=>({getData:async()=>({})})})}});await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});await p.click('#continueButton');assert.notEqual(await p.evaluate(()=>__qa.mode),'playing');
  },
  'blur blocks rewarded restart until focus':async p=>{
   await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});await p.evaluate(()=>{__qa.loadLevel(0,true);__qa.openDialog('lost');YandexPlatform.showRewarded=async cb=>{cb();dispatchEvent(new Event('blur'))};document.querySelector('#dialogRewarded').hidden=false});await p.click('#dialogRewarded');assert.notEqual(await p.evaluate(()=>__qa.mode),'playing');
  },
  'touch ground is above buttons':async p=>{
   await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});await p.click('#continueButton');const v=await p.evaluate(()=>{const s=document.querySelector('#stage').getBoundingClientRect(),b=document.querySelector('.touch-btn').getBoundingClientRect();return {ground:s.top+480*game.getContext('2d').getTransform().d*s.height/game.height,button:b.top}});assert.ok(v.ground+8<v.button,JSON.stringify(v));
  },
  'SDK ready, language, cloud merge and rewarded restore':async p=>{
   await mockSdk(p);await p.addInitScript(()=>localStorage.setItem('pulse-ball-save-v1',JSON.stringify([{level:'Первый импульс',stars:15,time:40}])));
   await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});
   assert.deepEqual(await p.evaluate(()=>({lang:document.documentElement.lang,stars:__qa.best[0].stars,time:__qa.best[0].time,ready:sdkTrace.filter(t=>t.startsWith('ready'))})),{lang:'en',stars:20,time:40,ready:['ready-interactive']});
   await p.click('#continueButton');await p.evaluate(()=>{__qa.g.status='lost';__qa.g.health=0;__qa.g.player.boosted=true;__qa.g.player.slopeMomentum=.3;__qa.openDialog('lost')});await p.click('#dialogRewarded');
   assert.equal(await p.evaluate(()=>__qa.mode),'lost');
   await p.evaluate(()=>{sdkEvents.game_api_pause();adCallbacks.onRewarded();adCallbacks.onRewarded();adCallbacks.onClose()});
   assert.equal(await p.evaluate(()=>__qa.mode),'platformPaused');
   await p.evaluate(()=>sdkEvents.game_api_resume());
   assert.equal(await p.evaluate(()=>__qa.mode),'playing');
   assert.deepEqual(await p.evaluate(()=>[__qa.g.health,__qa.g.player.boosted,__qa.g.player.slopeMomentum]),[3,false,0]);
   await p.evaluate(()=>{__qa.g.status='lost';__qa.g.health=0;__qa.openDialog('lost')});await p.click('#dialogRewarded');await p.evaluate(()=>adCallbacks.onClose());
   assert.equal(await p.evaluate(()=>__qa.g.health),0);assert.equal(await p.evaluate(()=>__qa.mode),'lost');
   await p.reload();await p.locator('#bootScreen').waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>__qa.best[0].time),40);
  },
  'fullscreen transition waits for portal resume':async p=>{
   await mockSdk(p);await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});
   await p.evaluate(()=>{__qa.loadLevel(1,true);__qa.g.status='won';__qa.openDialog('won')});await p.click('#dialogPrimary');
   await p.evaluate(()=>{sdkEvents.game_api_pause();adCallbacks.onClose(true)});assert.equal(await p.evaluate(()=>__qa.g.index),1);
   await p.evaluate(()=>sdkEvents.game_api_resume());assert.equal(await p.evaluate(()=>__qa.g.index),2);assert.equal(await p.evaluate(()=>__qa.mode),'playing');
  },
  'small landscape result keeps every action visible':async p=>{
   await p.setViewportSize({width:640,height:480});await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});
   for(const lang of ['ru','en']){await p.evaluate(l=>{__qa.setLanguage(l);__qa.loadLevel(0,true);__qa.openDialog('won')},lang);
    for(const id of ['dialogPrimary','dialogSecondary','dialogMenu']){const r=await p.locator('#'+id).boundingBox();assert.ok(r&&r.y>=0&&r.y+r.height<=480,id+' clipped in '+lang)}
   }
  },
  'orientation, resize and manual pause preserve player state':async p=>{
   await p.goto('http://pulse.test');await p.locator('#bootScreen').waitFor({state:'hidden'});await p.click('#continueButton');await p.evaluate(()=>{PulseGame.platformPause('test');__qa.g.player.vy=-300});
   const before=await p.evaluate(()=>[__qa.g.player.x,__qa.g.player.y,__qa.g.player.vy]);
   for(const [width,height] of [[448,320],[375,667],[667,375],[844,390],[1280,720]]){await p.setViewportSize({width,height});await p.evaluate(()=>new Promise(requestAnimationFrame));assert.deepEqual(await p.evaluate(()=>[__qa.g.player.x,__qa.g.player.y,__qa.g.player.vy]),before)}
   await p.evaluate(()=>{PulseGame.platformResume('test');dispatchEvent(new Event('blur'));dispatchEvent(new Event('focus'))});assert.equal(await p.evaluate(()=>__qa.mode),'paused');
  }
 };
 for(const [name,fn] of Object.entries(tests)){const c=await b.newContext({viewport:{width:568,height:320},isMobile:true,hasTouch:true});const p=await c.newPage();await p.route('http://pulse.test/**',r=>r.fulfill({contentType:'text/html',body:html}));try{await fn(p);console.log('PASS',name)}catch(e){failed++;console.log('FAIL',name,e.message)}await c.close()}
 await b.close();process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
