import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const root=process.cwd(),html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const sandbox={};vm.runInNewContext(scripts[1],sandbox);const E=sandbox.PulseBallEngine;
const failures=[];
function check(name,run){try{run();console.log('PASS',name);}catch(e){failures.push(name+': '+e.message);console.error('FAIL',name,e.message);}}
function fixture(){const g=E.createGame(0);g.expansionEnabled=true;g.player.x=500;g.player.y=458;g.player.grounded=true;g.player.invincible=0;g.enemies=[];g.spikes=[];return g;}
for(const hazard of ['enemy','spike','projectile','wave','web','fall'])check('shield protects '+hazard,()=>{
  for(const shield of [0,1]){
    const g=fixture();g.shield=shield;
    if(hazard==='enemy')g.enemies.push({x:500,y:458,min:450,max:550,dir:1,speed:0,stun:0,alert:0,type:'normal'});
    if(hazard==='spike')g.spikes.push({hitX:490,hitY:440,hitW:20,hitH:40});
    if(hazard==='projectile')g.projectiles.push({x:500,y:458,vx:0,vy:0,life:2});
    if(hazard==='wave')g.waveShots.push({x:500,dir:1,speed:0,life:2});
    if(hazard==='web')g.webShots.push({x:500,y:458,vx:0,vy:0,life:2});
    if(hazard==='fall')g.player.y=800;
    E.step(g,{},1/120);
    assert.equal(g.health,shield?3:2,'health after impact');
    assert.equal(g.shield,0,'exactly one shield is consumed');
    assert.ok(g.events.some(e=>e.type===(shield?'shieldBreak':'hurt')),'correct impact event');
    if(shield){assert.ok(g.player.invincible>0);assert.ok(!g.events.some(e=>e.type==='hurt'));for(let i=0;i<20;i++)E.step(g,{},1/120);assert.equal(g.health,3,'contact during shield grace does not deal repeated damage');}
    if(hazard==='fall')assert.ok(g.player.y<720,'fall returns to safe spawn');
  }
});
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PULSE_QA_NODE_MODULES?path.join(process.env.PULSE_QA_NODE_MODULES,'playwright'):'playwright');
const seam=`globalThis.__runtimeQA={get g(){return g},freeze(){mode='qa'},
 prepare(){g=E.createGame(0);g.player.y=458;g.player.grounded=true;mode='playing';accumulator=0;},
 tick(ms){const raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;try{frame(last+ms)}finally{window.requestAnimationFrame=raf}},
 resolution(){return {width:canvas.width,height:canvas.height,viewW,viewH}},
 pause(){clearInput();mode='qa'},draw};`;
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost').pathname;
  if(url==='/'){res.setHeader('Content-Type','text/html');res.end(html.replace('  requestAnimationFrame(frame);bootstrap();',seam+'\n  requestAnimationFrame(frame);bootstrap();'));return;}
  const f=path.resolve(root,'.'+url);
  if(f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile()){res.setHeader('Content-Type',f.endsWith('.webp')?'image/webp':f.endsWith('.mp3')?'audio/mpeg':'text/plain');fs.createReadStream(f).pipe(res);return;}
  res.writeHead(204);res.end();
});
let browser;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})});
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForSelector('#bootScreen[hidden]',{state:'attached'});await page.locator('#continueButton').click();
 const result=await page.evaluate(()=>{
   const q=__runtimeQA;q.freeze();const initial=q.resolution();q.prepare();
   // Both events can arrive before the next simulation step under rendering load.
   window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));
   window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));q.tick(17);const jumpVy=q.g.player.vy;
   q.prepare();q.g.jumpHeld=true;window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));q.tick(17);const repeatJumpVy=q.g.player.vy;
   q.prepare();const jump=document.querySelector('.touch-btn[data-key="jump"]');jump.dispatchEvent(new PointerEvent('pointerdown',{pointerId:12,pointerType:'touch',bubbles:true}));jump.dispatchEvent(new PointerEvent('pointerup',{pointerId:12,pointerType:'touch',bubbles:true}));q.tick(17);const touchJumpVy=q.g.player.vy;
   q.prepare();window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));q.pause();q.prepare();q.tick(17);const afterPauseVy=q.g.player.vy;
   // Sustained slow frames should lower only the backing bitmap resolution.
   q.prepare();for(let i=0;i<100;i++)q.tick(40);const slow=q.resolution();q.freeze();return {initial,slow,jumpVy,repeatJumpVy,touchJumpVy,afterPauseVy};
 });
 check('short jump press survives between frames',()=>assert.ok(result.jumpVy<0,JSON.stringify(result)));
 check('release and repress survives a previously held jump',()=>assert.ok(result.repeatJumpVy<0,JSON.stringify(result)));
 check('short touch jump survives between frames',()=>assert.ok(result.touchJumpVy<0,JSON.stringify(result)));
 check('pause clears queued jump',()=>assert.equal(result.afterPauseVy,0));
 check('desktop bitmap has a pixel budget',()=>assert.ok(result.initial.width*result.initial.height<=2100000,JSON.stringify(result.initial)));
 check('slow frames lower bitmap size without changing world geometry',()=>{assert.ok(result.slow.width<result.initial.width);assert.equal(result.slow.viewW,result.initial.viewW);assert.equal(result.slow.viewH,result.initial.viewH);});
 check('runtime has no JavaScript errors',()=>assert.deepEqual(errors,[]));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
assert.deepEqual(failures,[],'Runtime regressions');
