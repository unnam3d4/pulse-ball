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
