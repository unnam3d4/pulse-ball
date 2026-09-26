// Development-only expansion checks. The Yandex archive still contains index.html only.
const fs=require('node:fs'),vm=require('node:vm');
const test=require('node:test'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const engine=html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const c=vm.createContext({});vm.runInContext(engine,c);const E=c.PulseBallEngine;

test('requested trap families escalate across levels 6-18',()=>{
  const expected={
    6:['fall'],7:['fall','retract'],8:['phase','retract'],9:['phase','saw'],10:['electric','saw'],
    11:['conveyor','electric','saw','spider'],12:['mine','worm','phase'],13:['turret','worm','conveyor','spider'],
    14:['press','saw','worm','spider'],15:['pendulum','mine','electric','spider'],
    16:['press','turret','saw','worm','crumble','spider'],17:['wave','pendulum','turret','retract','worm','spider'],
    18:['conveyor','retract','phase','turret','press','pendulum','worm','saw','wave','spider']
  };
  for(const [level,types] of Object.entries(expected)){
    const p=E.expansionPlans[Number(level)-1];assert.ok(p,'level '+level+' plan missing');
    for(const type of types)assert.ok(p[type]?.length,'level '+level+' missing '+type);
  }
});

test('levels 11-18 have three-stage bosses with distinct mechanics',()=>{
  const weak=['pulse','mine','relay','press','orb','node','receiver','final'];
  for(let i=10;i<18;i++){
    const g=E.createGame(i);assert.ok(g.boss,'level '+(i+1)+' boss missing');
    assert.equal(g.boss.hp,3);assert.equal(g.boss.weak,weak[i-10]);
    assert.ok(g.bossCheckpoint&&g.bossCheckpoint.x<g.finish.x);
    assert.ok(g.boss.arenaStart<g.finish.x);
  }
});

test('boss weakness rules reject wrong sources and allow the intended source',()=>{
  for(let i=10;i<18;i++){
    const g=E.createGame(i),b=g.boss;b.active=true;
    const wrong=['pulse','mine','relay','press','orb','node','receiver'].find(s=>s!==E.bossExpected(b));
    assert.equal(E.damageBoss(g,wrong),false,'level '+(i+1)+' accepted wrong source');
    while(!b.defeated){
      const source=E.bossExpected(b);b.invuln=0;
      assert.equal(E.damageBoss(g,source),true,'level '+(i+1)+' rejected '+source);
    }
    assert.equal(b.hp,0);assert.equal(b.defeated,true);
  }
});

test('all expansion levels simulate safely at the spawn without script errors',()=>{
  for(let i=5;i<18;i++){
    const g=E.createGame(i);
    for(let f=0;f<1200&&g.status==='playing';f++)E.step(g,{},1/120);
    assert.ok(['playing','lost'].includes(g.status),'level '+(i+1)+' invalid status');
    assert.ok(Number.isFinite(g.player.x)&&Number.isFinite(g.player.y),'level '+(i+1)+' non-finite player state');
  }
});

test('creature and trap runtime objects are initialized with readable telegraphs',()=>{
  const l12=E.createGame(11);assert.ok(l12.mines.length&&l12.worms.length);
  const l13=E.createGame(12);assert.ok(l13.turrets.length&&l13.spiders.some(s=>s.type==='spitter'));
  const l14=E.createGame(13);assert.ok(l14.presses.length&&l14.spiders.some(s=>s.type==='ambush'));
  const l16=E.createGame(15);assert.ok(l16.platforms.some(p=>p.trapKind==='crumble'));
  const l18=E.createGame(17);assert.ok(l18.worms.length&&l18.spiders.length&&l18.waves.length);
  assert.ok(l12.mines.every(m=>m.armed===0&&!m.exploded));
  assert.ok(l12.worms.every(w=>w.state==='dormant'));
});


test('level 6 comfort bridge is already solid and cannot softlock the player',()=>{
  const g=E.createGame(5),[a,b]=g.level.bridge;
  assert.equal(g.bridgeOn,true);
  assert.ok(g.ground.some(s=>s.comfortBridge&&s.x===a&&s.w===b-a),'level 6 bridge is not physically present');
});

test('falling and disappearing platforms are optional because solid ground exists below them',()=>{
  for(let i=5;i<18;i++){
    const g=E.createGame(i);
    for(const p of g.platforms.filter(p=>p.trapKind==='fall'||p.trapKind==='phase'||p.trapKind==='crumble')){
      if(p.trapKind==='crumble')continue; // crumble bridge is deliberately used later as a timed crossing.
      assert.ok(g.ground.some(s=>p.x>=s.x+20&&p.x+p.w<=s.x+s.w-20),
        'level '+(i+1)+' '+p.trapKind+' platform became a mandatory gap support at '+p.x);
    }
  }
});

test('late-campaign recorded route remains geometry-safe with the expansion enabled',()=>{
  const routes=require('./campaign-routes.json'),{step,controls}=routes;
  for(const route of routes.routes.filter(r=>r.level>=6)){
    const g=E.createGame(route.level-1);g.player.invincible=1e6;
    const stopX=g.boss?g.boss.arenaStart-70:Infinity;let reachedBoss=false;
    outer: for(const [a,frames] of route.spans)for(let f=0;f<frames;f++){
      E.step(g,controls[a],step);g.player.invincible=1e6;
      assert.ok(g.health===3,'level '+route.level+' suffered fall/geometry damage at '+Math.round(g.player.x));
      assert.ok(Number.isFinite(g.player.x)&&Number.isFinite(g.player.y),'level '+route.level+' non-finite player state');
      if(g.boss&&g.player.x>=stopX){reachedBoss=true;break outer;}
      if(!g.boss&&g.status==='won')break outer;
    }
    if(g.boss)assert.ok(reachedBoss,'level '+route.level+' recorded route cannot reach boss arena');
    else assert.equal(g.status,'won','level '+route.level+' expansion route cannot finish');
  }
});

test('checkpoints, exits and boss entries keep a clear hazard buffer',()=>{
  const hazardX=g=>[
    ...g.retractSpikes.map(v=>v.x+v.w/2),...g.saws.map(v=>v.baseX),...g.presses.map(v=>v.x),
    ...g.electricFloors.map(v=>v.x+v.w/2),...g.mines.map(v=>v.x),...g.pendulums.map(v=>v.x),
    ...g.turrets.map(v=>v.x),...g.worms.map(v=>v.x),...g.spiders.map(v=>v.baseX)
  ];
  for(let i=5;i<18;i++){
    const g=E.createGame(i),critical=[g.level.checkpoint,g.level.finish];
    if(g.boss)critical.push(g.bossCheckpoint.x,g.boss.arenaStart);
    for(const x of hazardX(g))for(const q of critical)
      assert.ok(Math.abs(x-q)>=70,'level '+(i+1)+' hazard too close to critical point '+q+' at '+x);
  }
});

test('legacy under-platform rails and ghost bridge stripes are removed',()=>{
  assert.ok(!html.includes('railX=s.base-s.range-camera'));
  assert.ok(!html.includes("rgba(86,219,242,.16)"));
  assert.ok(!html.includes("rgba(224,252,255,.42)"));
});
