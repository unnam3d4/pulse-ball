import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Run with an installed Playwright browser. QA hooks are injected into the served
// document only; no debug controls or state mutation hooks ship in the game.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PULSE_QA_NODE_MODULES
  ? path.join(process.env.PULSE_QA_NODE_MODULES, 'playwright') : 'playwright');
const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const seam = `
  globalThis.__playerQA={get game(){return g;},get mode(){return mode;},draw,ball,handleEvents,loadLevel,start,openDialog,
    expression(){return typeof playerExpression==='function'?playerExpression(g):'neutral';},
    setTime(t){visualTime=t;},freeze(){mode='qa';},unlock(){unlocked=E.levels.length-1;},
    capture(){draw();return canvas.toDataURL();},
    capturePlayer(){
      const x=g.player.x,y=g.player.y,oldCamera=camera;
      try{g.player.x=96;g.player.y=96;camera=0;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ball(g.player);return Array.from(ctx.getImageData(64,64,64,64).data);}
      finally{g.player.x=x;g.player.y=y;camera=oldCamera;}
    },
    setGame(game){g=game;camera=0;},
    getCache(){return typeof playerSpriteCache!=='undefined'?playerSpriteCache.size:0;},
    artLoaded(){return typeof playerArt!=='undefined'?playerArt.size:0;}
  };
`;
const marker = '  requestAnimationFrame(frame);bootstrap();';
assert.ok(html.includes(marker), 'Game boot insertion point missing');
const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204);return res.end(); }
  if (req.url.startsWith('/audio/')) {
    res.setHeader('Content-Type', 'audio/mpeg');
    return fs.createReadStream(path.join(root, req.url)).pipe(res);
  }
  if (req.url.startsWith('/assets/player/')) {
    res.setHeader('Content-Type','image/webp');
    return fs.createReadStream(path.join(root,req.url)).pipe(res);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html.replace(marker, seam + marker));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({headless:true, ...(process.platform === 'win32' ? {channel:'chrome'} : {})});
  const page = await browser.newPage({viewport:{width:1280,height:800}});
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForSelector('#bootScreen[hidden]', {state:'attached'});
  assert.equal(await page.evaluate(()=>__playerQA.artLoaded()),5,'All hero assets must load before play');
  await page.locator('#continueButton').click();
  await page.evaluate(() => __playerQA.freeze());
  const events = await page.evaluate(() => {
    const q=__playerQA; q.setTime(10);q.game.player.invincible=0;
    const before=JSON.stringify(q.capturePlayer());
    q.game.events=[{type:'star',x:150,y:420}];q.handleEvents();
    return {mood:q.expression(),changed:before!==JSON.stringify(q.capturePlayer())};
  });
  assert.equal(events.mood, 'happy', 'Collecting a star must briefly change the expression');
  assert.equal(events.changed, true, 'Expression must change actual rendered pixels');
  const overlays = await page.evaluate(() => {
    const q=__playerQA;q.setTime(10);q.game.player.invincible=0;
    const plain=q.capturePlayer(),result=[];
    for(const ability of ['shield','superCharge']){
      q.game[ability]=ability==='shield'?1:100;
      const active=q.capturePlayer();let changed=0;
      for(let y=0;y<64;y++)for(let x=0;x<64;x++){
        if(Math.hypot(x+.5-32,y+.5-32)>21)continue;
        const i=(y*64+x)*4;
        if(active.slice(i,i+4).some((v,j)=>v!==plain[i+j]))changed++;
      }
      result.push({ability,changed});q.game[ability]=0;
    }
    return result;
  });
  for(const result of overlays)assert.equal(result.changed,0,`${result.ability} must not draw across the shell or face`);
  const states = await page.evaluate(() => {
    const q=__playerQA;
    const results=[];
    for (const [type,want] of [['hurt','hurt'],['superPulse','determined'],['shieldBreak','focused']]) {
      q.setTime(20+results.length);q.game.events=[{type,x:150,y:420,dir:1}];q.handleEvents();
      results.push({type,want,got:q.expression()});
    }
    q.game.status='won';results.push({type:'win',want:'victory',got:q.expression()});
    q.game.status='lost';results.push({type:'loss',want:'defeat',got:q.expression()});
    q.game.status='playing';q.setTime(100);q.game.player.vy=650;q.game.player.grounded=false;
    results.push({type:'fall',want:'scared',got:q.expression()});
    q.game.player.vy=0;q.game.player.grounded=true;q.game.player.vx=220;
    results.push({type:'run',want:'focused',got:q.expression()});
    return results;
  });
  for (const row of states) assert.equal(row.got,row.want,`${row.type} expression`);
  const integrity = await page.evaluate(() => {
    const q=__playerQA;q.setGame(PulseBallEngine.createGame(0));q.setTime(150);
    const before=JSON.stringify(q.game),cache=q.getCache();
    let allocations=0;
    const original=document.createElement;
    document.createElement=function(name,...args){if(name==='canvas')allocations++;return original.call(this,name,...args);};
    try { for(let i=0;i<400;i++){q.game.player.face=i%2?1:-1;q.ball(q.game.player);} }
    finally {document.createElement=original;}
    q.game.player.face=1;
    return {unchanged:before===JSON.stringify(q.game),allocations,cache:q.getCache(),initialCache:cache};
  });
  assert.equal(integrity.unchanged,true,'Drawing must not mutate gameplay state');
  assert.equal(integrity.allocations,0,'Warm player rendering must allocate no canvases');
  assert.equal(integrity.cache,integrity.initialCache,'Player sprite cache must remain bounded');
  await page.evaluate(() => {__playerQA.unlock();__playerQA.loadLevel(1,true);__playerQA.freeze();});
  assert.equal(await page.evaluate(() => __playerQA.expression()),'neutral','Level transition must reset transient emotions');
  await page.evaluate(() => {__playerQA.loadLevel(1,true);__playerQA.freeze();});
  assert.equal(await page.evaluate(() => __playerQA.game.health),3,'Restart must preserve the existing reset behavior');
  const stalled=await browser.newPage();
  await stalled.route('**/hero-defeat.webp',()=>{});
  await stalled.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'domcontentloaded'});
  await stalled.waitForSelector('#bootScreen[hidden]',{state:'attached',timeout:6000});
  assert.equal(await stalled.evaluate(()=>__playerQA.artLoaded()),4,'Startup must continue using available art when a cosmetic request stalls');
  await stalled.close();
  assert.deepEqual(errors,[],'No JavaScript errors');
  console.log('Player visuals: event expressions, rendered pixels, gameplay isolation, cache, restart and transition passed.');
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
