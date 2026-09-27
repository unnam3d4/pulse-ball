const fs=require('fs'),vm=require('vm');
vm.runInThisContext(fs.readFileSync(__dirname+'/../index.html','utf8').match(/<script id="engine">([\s\S]*?)<\/script>/)[1]);
const E=PulseBallEngine,results=[];
for(let i=0;i<18;i++){
 const base=E.createGame(i);base.expansionEnabled=false;const l=base.level,row={level:i+1,gaps:[],stars:[],checkpoint:l.checkpoint};
 const bridges=[l.bridge,...(l.extraSwitches||[]).map(s=>s.bridge),...(l.orbTargets||[]).map(t=>t.slice(2))].filter(b=>b[0]>=0&&b[1]>b[0]).map(b=>({x:b[0],y:480,w:b[1]-b[0],h:300,bridge:true}));
 const surfaces=[...base.ground,...base.platforms,...bridges];
 // A kinematic audit: real engine, hazards excluded only for reachability trials.
 function trial(x,y,dir,jump,pulse,phase=0,frames=240,hold=null){
  const g=E.createGame(i);g.expansionEnabled=false;g.enemies=[];g.spikes=[];g.time=phase;g.checkpoint.active=true;g.ground.push(...bridges);
  Object.assign(g.player,{x,y:y-22,vx:dir*325,vy:0,grounded:true,coyote:.1});
  let maxX=x,minX=x,minY=y;const taken=new Set();let landed=[];
  for(let f=0;f<frames;f++){
   const usePulse=pulse&&!g.pulseHeld&&(g.boostPads.some(b=>Math.abs(b.x-g.player.x)<40&&Math.abs(b.y-g.player.y-22)<45)||g.relays.some(n=>Math.hypot(n.x-g.player.x,n.y-g.player.y)<110)||g.breakables.some(b=>Math.abs(b.x-g.player.x)<100));
   E.step(g,{right:dir>0,left:dir<0,jump:hold===null?jump&&(!g.player.grounded||!g.jumpHeld):f<hold,pulse:hold===null?usePulse:pulse&&f%32===0},1/120);
   if(g.health<3||g.status==='lost')break;
   maxX=Math.max(maxX,g.player.x);minX=Math.min(minX,g.player.x);minY=Math.min(minY,g.player.y);
   g.stars.forEach((s,j)=>{if(s.taken)taken.add(j)});
   if(g.player.grounded)landed.push(g.player.x);
  }
  return {maxX,minX,minY,taken,landed};
 }
 for(let j=0;j<l.ground.length-1;j++){
  const a=l.ground[j][1],b=l.ground[j+1][0];
  const bridge=(l.bridge[0]===a&&l.bridge[1]===b)||(l.extraSwitches||[]).some(s=>s.bridge[0]===a&&s.bridge[1]===b)||(l.orbTargets||[]).some(t=>t[2]===a&&t[3]===b);
  if(bridge){row.gaps.push({a,b,route:'mechanism'});continue;}
  let passes=[];
  const phases=[0,...l.moving.filter(m=>m[0]+m[2]+m[3]>a-550&&m[0]-m[3]<b+200).flatMap(m=>[Math.PI/(2*m[4]),3*Math.PI/(2*m[4])])];
  for(const phase of phases){
   let passed=false;
   const sources=surfaces.filter(s=>s.x<a&&s.x+s.w>a-550);
   for(const s of sources){for(let x=Math.max(s.x+25,a-550);x<=Math.min(s.x+s.w-8,a+30);x+=20){
    for(const jump of [true,false]){const t=trial(x,s.y,1,jump,true,phase,360);if(t.landed.some(x=>x>=b+22)){passed=true;break}}if(passed)break;
   }if(passed)break;}
   passes.push(passed);
  }
  row.gaps.push({a,b,phases,passes});
 }
 // Collect every star in local trajectories. A result proves a local input route,
 // not a clean campaign playthrough nor reachability of its launch surface.
 const found=new Set();
 for(const s of surfaces){for(let x=s.x+24;x<s.x+s.w-12;x+=55){
  if(!base.stars.some((st,j)=>!found.has(j)&&Math.abs(st.x-x)<430))continue;
  for(const dir of [1,-1])for(const jump of [true,false]){
   const t=trial(x,s.y,dir,jump,true);for(const j of t.taken)found.add(j);
  }
 }}
 for(let j=0;j<base.stars.length;j++)if(!found.has(j)){
  const st=base.stars[j];
  outer:for(const s of surfaces){for(let x=Math.max(s.x+23,st.x-600);x<Math.min(s.x+s.w-10,st.x+400,l.finish-45);x+=12){
   for(const dir of [1,-1,0])for(const hold of [0,8,16,24,40,80,120]){
    const t=trial(x,s.y,dir,true,true,0,300,hold);for(const k of t.taken)found.add(k);if(found.has(j))break outer;
   }
  }}
 }
 row.unreachedStars=base.stars.flatMap((s,j)=>found.has(j)?[]:[{j,x:s.x,y:s.y}]);row.starCount=base.stars.length;
 results.push(row);console.log(`Level ${i+1}: ${row.starCount-row.unreachedStars.length}/${row.starCount} local star routes; ${row.gaps.filter(g=>g.route==='mechanism'||g.passes.every(Boolean)).length}/${row.gaps.length} gap routes`);
}
if(results.some(r=>r.unreachedStars.length||r.gaps.some(g=>g.passes?.some(v=>!v))))process.exitCode=1;
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(results,null,2));
