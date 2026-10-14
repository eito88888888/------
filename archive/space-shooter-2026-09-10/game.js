// ════════════════════════════════════════
// 🚀 SPACE SHOOTER GAME
// Canvasベースの縦スクロール型シューティング
// ════════════════════════════════════════

(function(){
  'use strict';

  // ── Canvas設定 ─────────────────────────────
  const WIDTH = 380;
  const HEIGHT = 490;

  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // CSSサイズ調整用（キャンバスの論理解像度とは別）
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // ── DOM要素 ────────────────────────────────
  const overlay     = document.getElementById('overlay');
  const overlayTtl  = document.getElementById('overlayTitle');
  const overlayMsg  = document.getElementById('overlayText');
  const btn         = document.getElementById('startBtn');
  const ui_score    = document.getElementById('score');
  const ui_lives    = document.getElementById('lives');
  const ui_level    = document.getElementById('level');
  const ui_hiscore  = document.getElementById('highscore');

  // ── 定数 ───────────────────────────────────
  const PLAYER_W = 118;
  const PLAYER_H = 132;
  const BULLET_SPEED = -430;       // px/sec (上向き)
  const ENEMY_BASE_YSPD = 122;     // base enemy falling speed
  const MAX_LIVES = 3;
  const SHIP_COOLDOWN = 260;       // ms between shots
  const POWERUP_CHANCE = 320;      // ~1/x chance per killed enemy

  // ── 状態管理 ───────────────────────────────
  let playerX = WIDTH / 2;
  let livesLeft = MAX_LIVES;
  let levelNum = 1;
  let scoreVal = 0;
  let highScore = Number(localStorage.getItem('spaceShooterHigh') || 0);
  let bullets = [];
  let enemies = [];
  let particles = [];
  let powerups = [];

  let shootCooldownTimer = 0;
  let spawnAccumulator = 900;      // ms counter till next spawn
  let invulnUntil = 3000;           // timestamp ms – respawn protection
  let playingState = 'menu';        // 'playing' | 'dead'
  let pausedFlag = false;
  let frameCount = 0;
  let shakeAmount = 210;            // screen-shake intensity decay
  let flashAlpha = 280;

  // starfield layers
  const starsFar  = Array.from({length: 145}, genStar.bind(null, 0.0016));
  const starsNear = Array.from({length: 155}, genStar.bind(null, 002));

  function genStar(speedFactor){ return { x:Math.random(), y:Math.random(), s:(speedFactor+0.004)*HEIGHT }; }

  // keyboard handling
  const pressedKeys = {};
  window.addEventListener('keydown', ev=>{
    pressedKeys[ev.code]=true;
    if(['ArrowRight','ArrowLeft'].includes(ev.code)) ev.preventDefault();
    if(ev.repeat===false && ev.code==='Space'){
      fireBullet(true);
      ev.preventDefault();
    }
  });
  window.addEventListener('keyup', ev=>{ delete pressedKeys[ev.code]; });

  // mouse/touch steering
  let steerTargetActive=false, steerPointerPos={x:WIDTH/2,y:HEIGHT*.845};
  canvas.addEventListener('pointermove', ev=>steerByEvent(ev));
  canvas.addEventListener('touchmove', ev=>{ ev.preventDefault(); steerByEvent(ev.touches?.[0]||ev);},{passive:false});
  canvas.addEventListener('pointerdown', ev=>fireFromPoint());
  canvas.addEventListener('touchstart', ev=>{ ev.preventDefault(); fireFromPoint();},{passive:false});

  function steerByEvent(e){
    const rect = canvas.getBoundingClientRect();
    const cx=(rect.left+rect.right)/2;
    const cy=(rect.top+rect.bottom)/2;
    const sx=cx-rect.width*(PLAYER_W/WIDTH)*(0.04)+cx*0;//placeholder
    void sx;
    const nx = ((e.clientX)-rect.left)/(rect.width );
    const ny = ((e.clientY)-rect.top )/(rect.height);
    steerPointerPos.x=nx*WIDTH;
    steerPointerPos.y=ny*HEIGHT;
    steerTargetActive=true;
  }
  function fireFromPoint(){ fireBullet(false); }


  // ── High-score init ────────────────────────
  ui_hiscore.textContent = String(highScore);


  // ── Utility helpers ────────────────────────
  function clamp(v,a,b){ return v<a?a:v>b?b:v; }
  function rand(a,b){ return a+(b-a)*Math.random(); }
  function dist(x1,y1,x2,y2){ return Math.hypot(x2-x1,y2-y1); }

  // ── Reset round ────────────────────────────
  function resetGame(fullReset){
    bullets=[];
    enemies=[];
    particles=[];
    powerups=[];
    playerX=WIDTH/2;
    if(fullReset){
      livesLeft=MAX_LIVES;
      levelNum=1;
      scoreVal=0;
    }
    shootCooldownTimer=0;
    spawnAccumulator=650;
    invulnUntil=performance.now()+950;
    pauseOff();

    drawUIStats();
  }

  function beginPlaying(fromMenu){
    playingState='playing';
    hideOverlay();
    resetGame(Boolean(fromMenu));
  }

  function togglePause(){
    pausedFlag=!pausedFlag;
    if(pausedFlag){showSimpleMessage('一時停止⏸　もう一度押すと再開');}
    else hideOverlaySilent();
  }

  // ── Shooting ───────────────────────────────
  function fireBullet(isKeyboardShot){
    if(!playing()) return;
    if(shootCooldownTimer<=0){
      bullets.push({
        x:playerX,
        y:HEIGHT-(PLAYER_H*0.545),
        w:7,h:19,s:BULLET_SPEED
      });
      shootCooldownTimer=SHIP_COOLDOWN;
      tinyFlash(playerX, HEIGHT-(PLAYER_H*0.575));
    }else if(isKeyboardShot&&shootCooldownTimer>0){
      // hold-to-fire handled elsewhere; still respect cooldown silently
    }
  }

  // continuous autofire while holding Space
  let heldFireInterval=-1;
  window.setInterval(()=>{},0);// placeholder removed below


  // ── Spawning enemies ───────────────────────
  function maybeSpawnEnemy(deltaSec){
    spawnAccumulator-=deltaSec*1000;
    if(spawnAccumulator<=0){
      spawnOneWave(getLevelSpeedMult());
      spawnAccumulator=getNextGapMillis();
    }
  }

  function getLevelSpeedMult(){ return 1+ (levelNum-1)*0.085; }
  function getNextGapMillis(){
    const lvlBoost=Math.min(levelNum-1,7)*-205;
    return Math.max(330,(rand(760,1240))+lvlBoost);
  }

  function spawnOneWave(multiplier){
    const count=1+floorRandWeighted();
    for(let k=0;k<count;k++){
      const kindRoll=Math.random();
      let hp,wdt,hgt,colr,pnts,vspdMul,tag;
      if(kindRoll<0.585){ tag='basic';hp=1;wdt=hgt=102;pnts=100;colr='#ef5350';vspdMul=.985;}
      else if(kindRoll<0.855){tag='fast';hp=1;wdt=hgt=116;pnts=150;colr='#fb8c00';vspdMul=1.475;}
      else {tag='heavy';hp=3;wdt=hgt=142;pnts=400;colr='#aa47dd';vspdMul=.665;}

      const ex=rand(wdt,WIDTH-wdt);
      enemies.push({
        x:ex,y:-hgt,w:wdt,h:hgt,hp,maxHP:hp,
        colr,pnts,tag,
        vy:(ENEMY_BASE_YSPD*vspdMul*multiplier)+(Math.sin(frameCount*0.011+k)*18)
      });
    }
  }

  function floorRandWeighted(){
    const r=Math.random();
    if(r<0.675)return 0;
    if(r<0.925)return 1;
    return 2;
  }

  // ── Power-ups ──────────────────────────────
  function rollPowerupAt(ex,ey){
    if(Math.random()>(1/POWERUP_CHANCE))return;
    const t=['heal'][Math.floor(Math.random()*['heal'].length)];
    powerups.push({x:ex,y:ey,w:106,h:106,k:t,vy:152});
  }

  // ── Particles ──────────────────────────────
  function burstExplosion(x,y,nColour,massScale){
    const n=massScale??1;
    for(let i=0;i<(massScale>=2?26:15*n);i++){
      const ang=rand(0,Math.PI*2), sp=rand(40,235*massScale);
      particles.push({
        x:x,y:y,
        vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
        life:rand(.285,.685), age:0,
        size:rand(2.2,4.9)*massScale,
        colour:i%3?'#ffca6b':'#ffeeae',
        grav:420
      });
    }
    sparkRing(nColour,x,y,massScale);
  }

  function sparkRing(colr,cx,cy,mscale){
    for(let i=0;i<9;i++){
      const ang=i/9*Math.PI*2;
      particles.push({
        x:cx,y:cy,vx:Math.cos(ang)*158*mscale,vy:Math.sin(ang)*158*mscale,
        life:.325,age:0,size:3.1*mscale,colour:colr,grav:290,fadingSpark:true
      });
    }
  }

  function tinyFlash(tx,ty){
    for(let i=0;i<4;i++)particles.push({
      x:tx,y:ty,vx:rand(-60,60),vy:rand(-270,-120),life:.195,age:0,size:2.4,colour:'#afeaff',grav:600
    });
  }

  // ── Collision helper ───────────────────────
  function circleHit(b,e){
    const bx=b.w/2,by=b.h/2;
    const rx=e.w/2, ry=e.h/2;
    const dx=Math.abs(b.x+e.w/2 -(bx+b.x)), dy=Math.abs(b.y-by)-(e.h/2);
    // simplified bounding-circle overlap
    return dist(b.x,b.y,e.x+e.w/2,e.y+e.h/2)< b.w/2+e.w/2 ;
  }

  // ── Main update tick ───────────────────────
  function updateLoop(timeStamp){

    const deltaMSec = Math.min(clampedDelta(lastTime,timeStamp), 033);
    lastTime=timeStamp;
    frameCount++;

    if(shakeAmount>0) shakeAmount*=0.912;
    if(flashAlpha>0) flashAlpha*=0.905;

    if(starsScrollOffset<-starsNear.s*someConst) starsScrollOffset+=someConst;


    if(playing()){
      // timers
      if(shootCooldownTimer>0) shootCooldownTimer-=deltaMSec;

      // movement : arrows OR pointer-steering
      const arrowDir=pressedKeys['ArrowRight']?-0:pressedKeys['ArrowLeft']?-1:(pressedKeys['ArrowRight']?1:0);
      const ax =(arrowDir)? arrowDir : 0;
      let mvAxis=ax;
      if(steerTargetActive){
        const diff=steerPointerPos.x-playerX;
        if(Math.abs(diff)>1.2){ mvAxis=diff/Math.abs(diff); }
      }
      playerX=clamp(playerX+mvAxis*318*deltaMSec/1000 , PLAYER_W/2+6, WIDTH-PLAYER_W/2-6 );

      // bullets travel upward
      for(const bl of bullets){ bl.y+=bl.s*deltaMSec/1000; }
      bullets=bullets.filter(bl=> bl.y>-30);

      // enemies descend
      for(const en of enemies){ en.y+=en.vy*deltaMSec/1000; }
      enemies=enemies.filter(en=> en.y-en.h<HEIGHT+40);

      // powerups drift downward
      for(const pu of powerups){pu.y+=pu.vy*deltaMSec/1000;}
      powerups=powerups.filter(pu=>pu.y<pu.h+HEIGHT+30);

      // particle physics
      advanceParticles(deltaMSec);

      // spawning cadence
      maybeSpawnEnemy(deltaMSec);

      // collisions → damage resolution
      collideEverything();

      // win condition -> escalate levels every N kills
      evaluateProgression();

      // death?
      if(livesLeft<=0){ dieSequence(); }
    } else {
      // ambient drifting during menus/deaths too
      advanceStarsOnly(deltaMSec);
      advanceParticles(deltaMSec);
    }

    drawScene();
    requestAnimationFrame(updateLoop);
  }

  var lastTime=performance.now();
  var clampedDelta=(last,d)=>{const dlt=d-last;return dlt>0?(dlt>040?040:dlt):016;};

  // star scrolling constants
  var starsScrollOffset=0;
  var someConst=1;

  function advanceStarsOnly(dsec){
    starsScrollOffset+=dsec*0.012;
  }

  function advanceParticles(dsec){
    for(const pt of particles){
      pt.age+=dsec/1000;
      pt.vx*=0.982; pt.vy*=0.984;
      pt.vy+=pt.grav*dsec/1000;
      pt.x+=pt.vx*dsec/1000; pt.y+=pt.vy*dsec/1000;
    }
    particles=particles.filter(pt=>pt.life>pt.age);
  }

  function collideEverything(){

    // --- Bullets × Enemies ---
    outerloop:{
      for(let bi=bullets.length-1;bi>=0;bi--){
        const bul=bullets[bi];

        innerloop:{ for(let ei=enemies.length-1;ei>=0;ei-- ){
          const en=enemies[ei];
          if(dist(bul.x,bul.y,en.x+en.w/2,en.y+en.h/2) <= (bul.w/2+en.w/2)){
            // hit!
            en.hp--;
            bullets.splice(bi,1);
            tinyFlash(bul.x,bul.y);
            if(en.hp<=0){
              destroyEnemy(ei);
            }
            break innerloop;
          }}}
      }}
    // note: labelled loops avoided due to readability—using flags instead
    // recompute simpler approach below because splice indexes shift mid-loop :
    cleanupCollisionsPassTwo();


    // --- Player collision ---
    const plCX=playerX,plCY=HEIGHT-(PLAYER_H*0.435);
    const pr=PLAYER_W*0.335;

    // enemies touching ship ?
    for(let ei=enemies.length-1;ei>=0;ei--){
      const en=enemies[ei];
      if(invulnerableYet())break;
      if(dist(plCX,plCY,en.x+en.w/2,en.y+en.h/2) < pr+en.w/2){
        hurtPlayerOnce();
        explodeShipArea(en.x+en.w/2,en.y+en.h/2);
        enemies.splice(ei,1);
        break;
      }
    }

    // power-up pickup
    for(let pi=powerups.length-1;pi>=0;pi--){
      const pu=powerups[pi];
      if(dist(plCX,plCY,pu.x+pu.w/2,pu.y+pu.h/2)<pr+pu.w/2){
        healLife();
        ringEffect('#7CFCAA',pu.x+pu.w/2,pu.y+pu.h/2);
        powerups.splice(pi,1);
      }
    }
  }

  function cleanupCollisionsPassTwo(){
    // second sweep ensures we didn’t leave dead-but-not-deleted heavy ships alive
    for(let ei=enemies.length-1;ei>=0;ei--){
      if(enemies[ei].hp<=0){destroyEnemy(ei);}
    }
  }

  function destroyEnemy(idx){
    const en=enemies[idx];
    scoreAdd(en.pnts);
    burstExplosion(en.x+en.w/2,en.y+en.h/2,'#ff7847',en.tag==='heavy'?2.1:1);
    rollPowerupAt(en.x+en.w/2,en.y+en.h/2);
    enemies.splice(idx,1);
  }

  function hurtPlayerOnce(){
    livesLeft--;
    drawUIStats();
    shakeAmount=310;
    flashAlpha=390;
    invulnUntil=performance.now()+980;
    if(livesLeft>0){
      burstExplosion(playerX,HEIGHT-(PLAYER_H*0.455),'#fc5252',1.035);
    }
  }

  function explodeShipArea(hitX,hitY){
    burstExplosion(hitX,hitY,'#fa8072',1.025);
  }

  function invulnerableYet(){ return performance.now()<invulnUntil; }

  function healLife(){
    if(livesLeft<MAX_LIVES){livesLeft++;}
    else {scoreAdd(350);}
    drawUIStats();
  }

  function ringEffect(color,cxx,cyy){
    for(let i=0;i<14;i++){
      const ag=i/14*Math.PI*2;
      particles.push({x:cxx,y:cyy,vx:Math.cos(ag)*212,vy:Math.sin(ag)*212,life:.425,age:0,size:3.4,colour:color,grav:0});
    }
  }

  function scoreAdd(addAmt){
    scoreVal+=addAmt;
    animateUiPop(document.getElementById('score'));
    if(scoreVal>highScore){highScore=scoreVal;localStorage.setItem('spaceShooterHigh',String(highScore));ui_hiscore.textContent=String(highScore);}
    drawUIStats();
  }

  function animateUiPop(el){
    el.classList.remove('score-pop');void el.offsetWidth;el.classList.add('score-pop');
  }

  function evaluateProgression(){
    // Level rises roughly every 850 pts gained beyond thresholds
    const wanted=1+Math.floor(scoreVal/750);
    if(wanted>levelNum){
      levelNum=wanted;
      ui_level.textContent=String(levelNum);
      banner(`LEVEL UP!! Lv.${levelNum}`);
      burstExplosion(WIDTH/2,HEIGHT*0.315,'#ffffbe',1.055);
    }
  }

  function dieSequence(){
    playingState='dead';
    explosionBigCenter();
    localStorage.setItem('spaceShooterHigh',String(highScore));
    setTimeout(()=>{
      showEndScreen();
    },680);
  }

  function explosionBigCenter(){
    burstExplosion(playerX,HEIGHT-(PLAYER_H*0.445),'#ff7043',2.625);
    shakeAmount=410;flashAlpha=450;
  }

  // ── Drawing ────────────────────────────────
  function drawScene(){
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    ctx.save();
    if(shakeAmount>0.5){
      ctx.translate(
        (Math.random()-0.485)*shakeAmount*0.006 ,
        (Math.random()-0.515)*shakeAmount*0.005
      );
    }

    paintBackdrop();
    drawEntitiesLayer();
    drawUILayerInside(ctx);

    ctx.restore();

    if(flashAlpha>0){
      ctx.fillStyle=`rgba(255,214,148,${Math.min(1,flashAlpha/440)})`;
      ctx.globalCompositeOperation='screen';
      ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.globalCompositeOperation='source-over';
    }
  }

  function paintBackdrop(){
    // deep gradient sky
    const grad=ctx.createLinearGradient(0,0,0,HEIGHT);
    grad.addColorStop(0,'#030614');
    grad.addColorStop(.555,'#081026');
    grad.addColorStop(1,'#101735');
    ctx.fillStyle=grad;ctx.fillRect(0,0,WIDTH,HEIGHT);

    // nebula glows
    ctx.globalAlpha=.075;
    ctx.beginPath();ctx.arc(WIDTH*.295,HEIGHT*.305,154,0,Math.PI*2);ctx.fillStyle='#274bd8';ctx.fill();
    ctx.beginPath();ctx.arc(WIDTH*.795,HEIGHT*.645,172,0,Math.PI*2);ctx.fillStyle='#933ce0';ctx.fill();
    ctx.globalAlpha=1;

    // parallax stars
    drawParallaxStars(starsFar, 0.018, '#cad8ea');
    drawParallaxStars(starsNear, 0.042, '#ffffff');
  }

  function drawParallaxStars(list,speeds,fillClr){
    ctx.fillStyle=fillClr;
    for(const st of list){
      const yy=(st.y*HEIGHT +(frameCount*speeds)%HEIGHT)%HEIGHT;
      ctx.globalAlpha=0.345+st.s*0.028;
      ctx.fillRect(st.x*WIDTH,yy,1.015,1.415);
    }
    ctx.globalAlpha=1;
  }

  function drawEntitiesLayer(){
    // power ups behind everything-ish
    for(const pu of powerups){drawHeartPickup(pu);}

    // enemies
    for(const en of enemies){drawAlienShape(en);}

    // bullets glowing bolts
    for(const bu of bullets){
      ctx.shadowBlur=16;ctx.shadowColor='#bef0ff';
      ctx.strokeStyle='#eafcff';ctx.lineCap='round';ctx.lineJoin='round';
      ctx.lineWidth=bu.w*0.062;
      ctx.beginPath();ctx.moveTo(bu.x,bu.y+bu.h/2);ctx.lineTo(bu.x,bu.y-bu.h/2);ctx.stroke();
      ctx.fillStyle='#cbebff';ctx.fillRect(bu.x-bu.w/2,bu.y-bu.h/2,bu.w,bu.h);
      ctx.shadowBlur=0;
    }

    // particles additive sparks
    ctx.globalCompositeOperation='lighter';
    for(const pt of particles){
      const alpha=clamp(1-pt.age/pt.life,0,1);
      ctx.globalAlpha=alpha;
      ctx.fillStyle=pt.colour;
      ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';


    // ---- THE PLAYER SHIP ----
    if(playing() || (!playing() && livesLeft>0)){
      drawSpaceship(playerX,HEIGHT-(PLAYER_H*0.465),(invulnerableYet() ? blinkPhase():1));
    }
  }

  function blinkPhase(){ return (Math.floor(Date.now()/090)%2===0)?0.385:1; }

  function drawSpaceship(cx,topY,glowStrength){
    ctx.save();
    ctx.translate(cx,topY);
    ctx.scale(1,1);
    ctx.globalAlpha=glowStrength;

    // engine flame flicker
    const flamLen=rand(13,26);
    ctx.shadowBlur=24;ctx.shadowColor='#ff9633';
    ctx.fillStyle='#ffdb7a';
    ctx.beginPath();
    ctx.moveTo(-7,PLAYER_H*0.395);
    ctx.lineTo(0,PLAYER_H*0.495+flamLen);
    ctx.lineTo(+7,PLAYER_H*0.398);
    ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;

    // hull body
    ctx.shadowBlur=21;ctx.shadowColor='#5599ff';
    ctx.fillStyle='#223766';
    roundedTriBody(ctx);
    ctx.fill();

    // cockpit glass
    ctx.fillStyle='#7fd4ff';
    ellipseFill(ctx,0,-PLAYER_H*0.052,PLAYER_W*0.117,PLAYER_H*0.078);
    ctx.fillStyle='#dffaff';
    ellipseFill(ctx,-PLAYER_W*0.031,-PLAYER_H*0.072,PLAYER_W*0.048,PLAYER_H*0.032);

    // wing accents
    ctx.strokeStyle='#3568c8';ctx.lineWidth=3.4;
    ctx.beginPath();ctx.moveTo(-PLAYER_W*0.238,PLAYER_H*0.095);ctx.lineTo(-PLAYER_W*0.086,PLAYER_H*-0.021);ctx.stroke();
    ctx.beginPath();ctx.moveTo(PLAYER_W*0.242,PLAYER_H*0.096);ctx.lineTo(PLAYER_W*0.088,PLAYER_H*-0.019);ctx.stroke();

    ctx.shadowBlur=0;
    ctx.restore();
  }

  function roundedTriBody(g){
    g.beginPath();
    g.moveTo(0,-PLAYER_H*0.462);
    g.bezierCurveTo(PLAYER_W*0.098,-PLAYER_H*0.268,PLAYER_W*0.246,PLAYER_H*0.058,PLAYER_W*0.258,PLAYER_H*0.198);
    g.lineTo(PLAYER_W*0.141,PLAYER_H*0.262);
    g.lineTo(PLAYER_W*0.061,PLAYER_H*0.184);
    g.lineTo(-PLAYER_W*0.063,PLAYER_H*0.186);
    g.lineTo(-PLAYER_W*0.143,PLAYER_H*0.264);
    g.lineTo(-PLAYER_W*0.259,PLAYER_H*0.199);
    g.bezierCurveTo(-PLAYER_W*0.247,PLAYER_H*0.056,-PLAYER_W*0.099,-PLAYER_H*0.269,0,-PLAYER_H*0.463);
    g.closePath();
  }

  function ellipseFill(g,cx,cy,rx,ry){
    g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill();
  }

  function drawAlienShape(en){
    ctx.save();
    ctx.translate(en.x+en.w/2,en.y+en.h/2);
    ctx.shadowBlur=15;ctx.shadowColor=en.colr+'88';
    ctx.fillStyle=en.colr;

    switch(en.tag){
      case 'fast':
        diamondMonster(ctx,en.w,en.h);
        break;
      case 'heavy':
        tankBehemoth(ctx,en.w,en.h);
        break;
      default:
        blobInvader(ctx,en.w,en.h);
    }

    // HP bars for heavies
    if(en.maxHP>1){
      ctx.shadowBlur=0;
      const bw=en.w*0.725,bh=6;
      ctx.fillStyle='rgba(232,236,253,.188)';
      ctx.fillRect(-bw/2,en.h*0.352,bw,bh);
      ctx.fillStyle='#ffda6b';
      ctx.fillRect(-bw/2,en.h*0.353,bw*(en.hp/en.maxHP),bh-1.6);
    }
    ctx.restore();
  }

  function blobInvader(g,w,h){
    g.beginPath();
    g.arc(0,0,w*0.272,0,Math.PI*2);g.fill();
    // eyes
    g.fillStyle='#071022';
    g.beginPath();g.arc(-w*0.087,-h*0.036,w*0.043,0,Math.PI*2);g.fill();
    g.beginPath();g.arc( w*0.089,-h*0.034,w*0.044,0,Math.PI*2);g.fill();
    g.fillStyle='#feeeee';
    g.beginPath();g.arc(-w*0.079,-h*0.051,w*0.014,0,Math.PI*2);g.fill();
    g.beginPath();g.arc( w*0.097,-h*0.049,w*0.013,0,Math.PI*2);g.fill();
    // mouth zigzag
    g.strokeStyle=g.fillStyle;g.lineWidth=2.6;g.lineJoin='round';
    g.beginPath();g.moveTo(-w*0.092,h*0.068);
    g.lineTo(-w*0.046,h*0.113);g.lineTo(0,h*0.069);g.lineTo(w*0.047,h*0.114);g.lineTo(w*0.093,h*0.067);g.stroke();
  }

  function diamondMonster(g,w,h){
    g.beginPath();
    g.moveTo(0,-h*0.278);g.lineTo(w*0.282,0);g.lineTo(0,h*0.281);g.lineTo(-w*0.283,0);g.closePath();g.fill();
    g.fillStyle='#241233';
    g.beginPath();g.arc(-w*0.073,-h*0.008,w*0.039,0,Math.PI*2);g.fill();
    g.beginPath();g.arc( w*0.074,-h*0.007,w*0.038,0,Math.PI*2);g.fill();
  }

  function tankBehemoth(g,w,h){
    g.roundRect?.call(g,-w*0.312,-h*0.302,w*0.624,h*0.604,[w*0.065]);
    g.fill();
    g.fillStyle='#311447';
    g.beginPath();g.arc(-w*0.103,-h*0.024,w*0.057,0,Math.PI*2);g.fill();
    g.beginPath();g.arc( w*0.107,-h*0.023,w*0.059,0,Math.PI*2);g.fill();
    g.fillStyle='#efe3ff';
    g.font=`bold ${Math.round(w*0.147)}px monospace`;
    g.textAlign='center';g.textBaseline='alphabetic';
    g.fillText('★',0,h*0.182);
  }

  function drawHeartPickup(pu){
    ctx.save();
    ctx.translate(pu.x+pu.w/2,pu.y+pu.h/2);
    const pulse=1+Math.sin(Date.now()/222)*0.083;
    ctx.scale(pulse,pulse);
    heartGlyph(ctx,pu.w*0.292,'#ff5470');
    ctx.restore();
  }

  function heartGlyph(g,sz,clr){
    g.save();
    g.shadowBlur=18;g.shadowColor=clr;
    g.fillStyle=clr;
    g.beginPath();
    g.moveTo(0, sz*0.955);
    g.bezierCurveTo(-sz*1.365,-sz*0.288,-sz*0.512,-sz*1.192,0,-sz*0.418);
    g.bezierCurveTo(sz*0.514,-sz*1.193,sz*1.366,-sz*0.287,0,sz*0.956);
    g.closePath();g.fill();
    g.restore();
  }

  function drawUILayerInside(g){
    // subtle vignette
    const vig=g.createRadialGradient(WIDTH/2,HEIGHT/2,HEIGHT*0.322,WIDTH/2,HEIGHT/2,HEIGHT*0.742);
    vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,.372)');
    g.fillStyle=vig;g.fillRect(0,0,WIDTH,HEIGHT);

    // low-life warning tint
    if(livesLeft===1 && playing()){
      g.fillStyle=`rgba(${(Date.now()%620<310)?'226,52,52':'234,111,111'},.077)`;g.fillRect(0,0,WIDTH,HEIGHT);
    }
  }

  // ── Banner toast ───────────────────────────
  let bannerQueue=[]
  function banner(text){
    bannerQueue.unshift({txt:text,end:performance.now()+920});
  }
  // drawn separately post-frame
  function flushBanners(){
    const now=performance.now();
    bannerQueue=bannerQueue.filter(b=>now<b.end);
    if(!bannerQueue.length)return;
    const latest=bannerQueue[bannerQueue.length-1];
    const prog=clamp((latest.end-now)/920,0,1);
    ctx.save();
    ctx.globalAlpha=prog;
    ctx.font='bold 25px Segoe UI,Tahoma,Verdana,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowBlur=22;ctx.shadowColor='#7fd0ff';
    ctx.fillStyle='#eafcff';
    ctx.fillText(latest.txt,WIDTH/2,HEIGHT*0.342);
    ctx.restore();
  }

  // ── HUD drawing (DOM side) ─────────────────
  function drawUIStats(){
    ui_score.textContent=String(scoreVal);
    ui_lives.textContent=livesBarEmojis();
    ui_level.textContent=String(levelNum);
  }
  function livesBarEmojis(){
    let str='';
    for(let i=0;i<MAX_LIVES;i++)str+= i<livesLeft?'❤️':'🤍';
    return str.trim().slice(0,MAX_LIVES*2);
  }

  // ── Menu overlays ──────────────────────────
  function showSimpleMessage(msg){
    overlay.style.display='flex';
    overlay.querySelector('.hidden-overlay')
    overlayTtl.textContent='📢';
    overlayMsg.innerText=msg;
    btn.textContent='続行 ▶';
    btn.onclick=togglePauseSafe;
  }
  function togglePauseSafe(){hideOverlay();togglePause();}

  function showEndScreen(){
    overlay.style.display='flex';
    overlayTtl.textContent='☠️ ミッション終了 ☠️';
    overlayMsg.innerHTML=
      `<br><big style="font-size:127%">最終スコア&nbsp;<b style="color:#ffe080;">${scoreVal}</b></big>`+
      `<br>到達レベル&nbsp;&nbsp;Lv.${levelNum}`+
      `${scoreVal>=highScore?'<br>🏆 NEW HIGH SCORE !!':''}<br><small>最高記録&nbsp;${highScore}</small>`;
    btn.textContent='🔁 もう一回遊ぶ';
    btn.onclick=beginAgainHandler;
  }

  function beginAgainHandler(){ beginPlaying(true); }

  function hideOverlay(){ overlay.classList.add('hidden-overlay'); }
  function hideOverlaySilent(){ overlay.classList.add('hidden-overlay'); }
  function playButtonClicked(){ beginPlaying(true); }

  function playing(){ return playingState==='playing'; }

  // wire primary CTA
  btn.addEventListener('click',()=>{
    if(btn.textContent.includes('▶')){togglePauseSafe();return;}
    beginPlaying(true);
  });

  // Escape pauses
  window.addEventListener('keydown',ev=>{ if(ev.key==='Escape'&&playing())togglePause(); });

  // prevent accidental context-menu on mobile-longpress
  canvas.addEventListener('contextmenu',ev=>ev.preventDefault());

  // kick-off RAF loop
  requestAnimationFrame(updateLoop);

  // expose little hook for console fun/testing
  window.__ss_debug={
    _state:()=>({score:scoreVal,lives:livesLeft,level:levelNum,enemies:enemies.length})
  };
})();
