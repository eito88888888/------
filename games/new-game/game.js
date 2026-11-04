"use strict";
const root=document.getElementById("game-root");
const canvas=document.createElement("canvas");canvas.width=960;canvas.height=540;root.appendChild(canvas);
const ctx=canvas.getContext("2d"), W=canvas.width, H=canvas.height;
const keys={}, player={x:80,y:420,w:28,h:52,vx:0,vy:0,ground:false,jumps:0,detached:false};
const body={x:80,y:420,w:18,h:18,vx:0,vy:0,active:false};
let camera=0,hearts=3,started=false,won=false,jumpPressed=false,spacePressed=false,last=0,currentStage=0;
let clearedStages=[];try{clearedStages=JSON.parse(localStorage.getItem("immortal-cleared-stages")||"[]");}catch(e){clearedStages=[];}
function saveClearedStage(stage){if(!clearedStages.includes(stage)){clearedStages.push(stage);localStorage.setItem("immortal-cleared-stages",JSON.stringify(clearedStages));}updateWarpList();}
const TOTAL_STAGES=20;
const STAGE_LENGTHS=[2400,3100,2200,3400,2600,2900,3600,2300,3200,2700,3800,2500,3300,3000,3900,2800,3500,2400,3700,3000];
const STAGE_STARTS=[];let worldWidth=0;
for(let i=0;i<TOTAL_STAGES;i++){STAGE_STARTS[i]=worldWidth;worldWidth+=STAGE_LENGTHS[i]+160;}
const stageStart=i=>STAGE_STARTS[i],stageLength=i=>STAGE_LENGTHS[i];
const blood=[];
const worlds={platforms:[],spikes:[],crystals:[],gimmicks:[],rooms:[]};
const gimmickNames=["古代の階段","逆風","落ちる床","時計塔の床","闇の吊り橋","巨大トゲ","光の回廊","重力反転床","氷原","影の通路","鐘楼","迷いの鏡","赤い回廊","砂時計","雷雲","骨の橋","霧の回廊","太陽の門","深淵の塔","王の門"];
function updateWarpList(){const select=document.getElementById("stageWarp");if(!select)return;select.innerHTML='<option value="">クリア済みステージを選択</option>'+clearedStages.slice().sort((a,b)=>a-b).map(s=>`<option value="${s}">ステージ${s+1}：${gimmickNames[s]||"古代の遺跡"}</option>`).join("");}
document.getElementById("warpButton").onclick=()=>{const select=document.getElementById("stageWarp");const stage=Number(select.value);if(!Number.isInteger(stage)||!clearedStages.includes(stage))return;currentStage=stage;player.x=stageStart(stage)+80;player.y=420;player.vx=player.vy=0;player.w=28;player.h=52;player.detached=false;body.active=false;camera=stageStart(stage);won=false;started=true;updateHud();};
updateWarpList();

for(let s=0;s<TOTAL_STAGES;s++){
 const o=stageStart(s),len=stageLength(s);
 worlds.platforms.push({x:o-100,y:490,w:len*.34,h:80,stage:s});
 worlds.platforms.push({x:o+len*.39,y:490,w:len*.22,h:80,stage:s});
 worlds.platforms.push({x:o+len*.67,y:490,w:len*.33,h:80,stage:s});
 const count=4+s%4;
 for(let i=0;i<count;i++){
  const x=o+220+i*(len*.74/count), y=350-(i%4)*65, w=120+(s*31+i*19)%110;
  worlds.platforms.push({x,y,w,h:20,stage:s,moving:s%5===0,baseY:y,phase:i*1.2});
 }
 for(let i=0;i<3+s%3;i++) worlds.spikes.push({x:o+500+i*(len*.82/(3+s%3)),y:470,w:70+(s+i)%3*18,h:20,stage:s});
 for(let i=0;i<6;i++) worlds.crystals.push({x:o+180+i*(len-400)/5,y:155+(i*83+s*47)%280,got:false,stage:s});
 if(s%4===1) worlds.gimmicks.push({type:"wind",x:o+len*.28,w:len*.38,power:s%8===1?-0.18:0.18,stage:s});
 if(s%4===2) worlds.gimmicks.push({type:"collapse",x:o+len*.42,w:200,y:490,stage:s});
 if(s%4===3) worlds.gimmicks.push({type:"movingGate",x:o+len*.58,y:220+(s%3)*50,w:120,h:170,stage:s});
 const roomX=o+len-520;
 worlds.rooms.push({x:roomX,y:315,w:410,h:175,stage:s});
 worlds.platforms.push({x:roomX,y:490,w:410,h:18,stage:s,room:true});
 worlds.platforms.push({x:roomX,y:315,w:18,h:175,stage:s,room:true});
 worlds.platforms.push({x:roomX+392,y:315,w:18,h:175,stage:s,room:true});
 worlds.crystals.push({x:roomX+330,y:405,got:false,hidden:true,stage:s});
 // 古代通路はステージごとに位置と幅を変える
 const tunnelX=o+650+s*37%700, tunnelY=190+(s%4)*15;
 worlds.platforms.push({x:tunnelX,y:tunnelY,w:9,h:155-(s%3)*20,stage:s,tunnel:true});
 worlds.platforms.push({x:tunnelX,y:tunnelY,w:250+(s%4)*35,h:9,stage:s,tunnel:true});
 worlds.platforms.push({x:tunnelX+250+(s%4)*35,y:tunnelY,w:9,h:155-(s%3)*20,stage:s,tunnel:true});
}

function overlay(title,text,button,onClick){
 const el=document.createElement("div");el.className="overlay";
 el.innerHTML=`<div class="overlay-box"><h2>${title}</h2><p>${text}</p><button>${button}</button></div>`;
 root.appendChild(el);el.querySelector("button").onclick=()=>{el.remove();if(onClick)onClick();};
}
function showOpening(){
 const pages=[
  ["静かな村の日々","主人公は、ただの村人だった。<br>毎朝畑を耕し、夜には村の灯火を守って暮らしていた。","次へ"],
  ["不死の力","ある夜、古びた祠の青い光に触れた。<br>主人公は死なない身体と、身体を切り離せる力を手に入れた。","次へ"],
  ["移動とジャンプ","← →キーで移動。↑キーでジャンプ。<br>切断中は二段ジャンプができる。","操作を試す"],
  ["切断と再接続","スペースキーで上下に切断。切り離した上半身は狭い場所へ進める。<br>下半身の近くまで戻り、スペースキーで再接続。","旅を始める"]
 ];let i=0;
 const show=()=>overlay(pages[i][0],pages[i][1],pages[i][2],()=>{i++;if(i<pages.length)show();else{started=true;reset(false);}});show();
}
showOpening();
document.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowUp"," "].includes(e.key))e.preventDefault();keys[e.key.toLowerCase()]=true;});
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
document.getElementById("soundButton").onclick=()=>{const b=document.getElementById("soundButton");b.textContent=b.textContent==="🔊"?"🔇":"🔊";};
function reset(full){player.x=stageStart(currentStage)+80;player.y=420;player.vx=player.vy=0;player.w=28;player.h=52;player.detached=false;body.active=false;camera=stageStart(currentStage);if(full)hearts=3;updateHud();}
function updateHud(){document.getElementById("heartCount").textContent=hearts;document.getElementById("abilityText").textContent=player.detached?"切離中":"通常";document.getElementById("progressText").textContent=`ステージ ${currentStage+1}/${TOTAL_STAGES}`;}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function respawn(){hearts--;if(hearts<=0)hearts=3;player.x=stageStart(currentStage)+80;player.y=420;player.vx=player.vy=0;player.detached=false;player.w=28;player.h=52;body.active=false;updateHud();}
function spawnBlood(x,y){for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,s=1.5+Math.random()*4.5;blood.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:45+Math.random()*25,size:2+Math.random()*4});}}
function detach(){if(player.detached)return;body.w=18;body.h=18;body.x=player.x+(player.w-18)/2;body.y=player.y+26;body.vy=1;body.active=true;spawnBlood(player.x+14,player.y+26);player.detached=true;player.w=14;player.h=18;player.x+=7;updateHud();}
function jump(){const max=player.detached?2:1;if(player.ground||player.jumps<max){player.vy=player.detached&&player.jumps>0?-12:-13;player.ground=false;player.jumps++;}}

function update(dt){
 if(!started||won)return;
 if(!player.detached&&player.h!==52){player.y-=52-player.h;player.w=28;player.h=52;}
 player.vx+=(keys.arrowleft?-0.75:keys.arrowright?.75:0)*dt;player.vx*=Math.pow(.82,dt);player.vx=Math.max(-5.1,Math.min(5.1,player.vx));
 if(keys.arrowup&&!jumpPressed)jump();jumpPressed=!!keys.arrowup;
 if(keys[" "]&&!spacePressed){if(!player.detached)detach();else{player.detached=false;player.w=28;player.h=52;player.x-=7;player.y-=34;player.vx=player.vy=0;player.ground=false;body.active=false;spawnBlood(player.x+14,player.y+26);}updateHud();}spacePressed=!!keys[" "]; 
 const current=worlds.platforms.filter(p=>p.stage===currentStage).map(p=>p.moving?{...p,y:p.baseY+Math.sin(performance.now()/900+p.phase)*35}:p);
 const wind=worlds.gimmicks.find(g=>g.stage===currentStage&&g.type==="wind"&&player.x>=g.x&&player.x<=g.x+g.w);
 if(wind)player.vx+=wind.power*dt;
 player.vy=Math.min(15,player.vy+.58*dt);player.x+=player.vx*dt;player.y+=player.vy*dt;player.ground=false;
 for(const p of current){if(hit(player,p)){const oldBottom=player.y+player.h-player.vy*dt;if(player.vy>=0&&oldBottom<=p.y+9){player.y=p.y-player.h;player.vy=0;player.ground=true;player.jumps=0;}else if(player.vy<0&&player.y-player.vy*dt>=p.y+p.h-4){player.y=p.y+p.h;player.vy=0;}else player.x-=player.vx*dt;}}
 player.x=Math.max(stageStart(currentStage)-40,Math.min(stageStart(currentStage)+stageLength(currentStage)-player.w,player.x));
 if(player.y>690)respawn();
 if(body.active){body.vy=Math.min(12,body.vy+.58*dt);body.y+=body.vy*dt;for(const p of current)if(body.vy>=0&&hit(body,p)&&body.y+body.h-body.vy*dt<=p.y+8){body.y=p.y-body.h;body.vy=0;}}
 for(const s of worlds.spikes.filter(s=>s.stage===currentStage)){if(hit(player,s)){if(!player.detached){detach();player.vy=-8;}else respawn();break;}}
 for(const c of worlds.crystals.filter(c=>c.stage===currentStage))if(!c.got&&Math.hypot(player.x-c.x,player.y-c.y)<28)c.got=true;
 if(player.x>=stageStart(currentStage)+stageLength(currentStage)-55){nextStage();}
 blood.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.18*dt;p.life-=dt;});for(let i=blood.length-1;i>=0;i--)if(blood[i].life<=0)blood.splice(i,1);
 camera+=(Math.max(stageStart(currentStage),Math.min(stageStart(currentStage)+stageLength(currentStage)-W,player.x-W*.38))-camera)*.09;updateHud();
}
function nextStage(){if(!started)return;saveClearedStage(currentStage);started=false;if(currentStage<TOTAL_STAGES-1){const next=currentStage+1;overlay(`ステージ${currentStage+1}クリア`,gimmickNames[currentStage]+"を越えた。<br>次は"+gimmickNames[next]+"へ。","次のステージへ",()=>{currentStage=next;player.x=stageStart(currentStage)+80;player.y=420;player.vx=player.vy=0;player.w=28;player.h=52;player.detached=false;body.active=false;camera=stageStart(currentStage);updateHud();started=true;});}else{won=true;saveClearedStage(TOTAL_STAGES-1);overlay("不死の力に目覚めた","20のステージを越えた。<br>村人は伝説の不死者となった。","もう一度",()=>{won=false;started=true;currentStage=0;worlds.crystals.forEach(c=>c.got=false);reset(true);});}}

function draw(){ctx.clearRect(0,0,W,H);const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,["#91acc2","#5e728f","#a18b80"][currentStage%3]);sky.addColorStop(1,["#bda981","#b77d63","#4b5263"][currentStage%3]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(-camera,0);
 const now=performance.now(),o=stageStart(currentStage),len=stageLength(currentStage);
 ctx.fillStyle="#202731";ctx.fillRect(o-100,490,len+200,70);ctx.fillStyle="#515f42";ctx.fillRect(o-100,477,len+200,18);
 worlds.platforms.filter(p=>p.stage===currentStage).forEach(p=>{let y=p.y;if(p.moving)y=p.baseY+Math.sin(now/900+p.phase)*35;ctx.fillStyle=p.room?"#554f68":p.moving?"#718f8a":"#696252";ctx.fillRect(p.x,y,p.w,p.h);ctx.fillStyle="#9e9a7b";ctx.fillRect(p.x,y,p.w,5);});
 worlds.rooms.filter(r=>r.stage===currentStage).forEach(r=>{ctx.fillStyle="rgba(8,12,24,.74)";ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle="#b692c8";ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.fillStyle="#dfc7ff";ctx.font="15px sans-serif";ctx.fillText("隠し部屋",r.x+150,r.y+30);});
 worlds.gimmicks.filter(g=>g.stage===currentStage).forEach(g=>{ctx.fillStyle=g.type==="wind"?"rgba(180,220,255,.22)":"rgba(190,80,80,.28)";ctx.fillRect(g.x,g.type=== "wind"?220:g.y,g.w,g.type=== "wind"?220:20);});
 worlds.spikes.filter(s=>s.stage===currentStage).forEach(s=>{ctx.fillStyle="#ddd8c7";for(let x=s.x;x<s.x+s.w;x+=16){ctx.beginPath();ctx.moveTo(x,s.y+s.h);ctx.lineTo(x+8,s.y);ctx.lineTo(x+16,s.y+s.h);ctx.fill();}});
 worlds.crystals.filter(c=>c.stage===currentStage).forEach(c=>{if(c.got)return;ctx.fillStyle=c.hidden?"#dfa4ff":"#8ef4d2";ctx.save();ctx.translate(c.x,c.y);ctx.rotate(now/700);ctx.fillRect(-7,-7,14,14);ctx.restore();});
 ctx.fillStyle="#d6b46b";ctx.fillRect(o+len-70,300,14,190);ctx.beginPath();ctx.arc(o+len-63,300,45,0,Math.PI*2);ctx.fill();
 if(body.active){ctx.fillStyle="#304d3d";ctx.fillRect(body.x,body.y,body.w,body.h);ctx.fillStyle="#d7d0a9";ctx.fillRect(body.x,body.y+body.h*.62,5,7);ctx.fillRect(body.x+13,body.y+body.h*.62,5,7);}
 drawPlayer(player.x,player.y,player.w,player.h,player.detached);ctx.fillStyle="#9d0712";blood.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life/18);ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
 ctx.restore();
}
function drawPlayer(x,y,w,h,head){ctx.save();ctx.translate(x,y);ctx.fillStyle="#71866a";ctx.fillRect(w*.18,0,w*.64,h*(head?1:.4));ctx.fillStyle="#304d3d";ctx.fillRect(0,h*(head?.38:.38),w,h*(head?.62:.62));ctx.fillStyle="#2a201d";ctx.fillRect(w*.18,0,w*.64,h*.12);ctx.fillStyle="#1d1715";ctx.fillRect(w*.26,h*.12,w*.11,h*.08);ctx.fillRect(w*.63,h*.12,w*.11,h*.08);ctx.fillStyle="#b41420";ctx.fillRect(w*.43,h*.27,w*.14,h*.06);ctx.restore();}
function loop(t){const dt=Math.min(2,(t-last)/16.67||1);last=t;update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
