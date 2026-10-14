// ════════════════════════════════════════
// 🐍 SNAKE GAME
// Canvasベースのクラシックスネークゲーム
// ════════════════════════════════════════

(function () {
  'use strict';

  // ── Canvas設定 ─────────────────────────────
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // グリッド設定 (10×10)
  const CELL = W / 10;
  const COLS = 10;
  const ROWS = 10;

  // ── DOM要素 ────────────────────────────────
  const overlay    = document.getElementById('overlay');
  const overlayTtl = document.getElementById('overlayTitle');
  const overlayMsg = document.getElementById('overlayText');
  const btn        = document.getElementById('startBtn');
  const homeBtn    = document.getElementById('homeBtn');
  const homeScreen = document.getElementById('homeScreen');
  const homeStart  = document.getElementById('homeStartBtn');
  const ui_score   = document.getElementById('score');
  const ui_length  = document.getElementById('length');
  const ui_level   = document.getElementById('level');
  const ui_hiscore = document.getElementById('highscore');

  // ── キャラクター・背景データ ─────────────────
  const CHARACTERS = [
    { id: 'green',  name: 'グリーン',   emoji: '🐍', head: '#4ce04c', tail: '#2a7a2a' },
    { id: 'blue',   name: 'ブルー',     emoji: '🐉', head: '#4cb8ff', tail: '#2a5a9a' },
    { id: 'red',    name: 'レッド',     emoji: '🔥', head: '#ff5a5a', tail: '#9a2a2a' },
    { id: 'purple', name: 'パープル',   emoji: '🔮', head: '#c46bff', tail: '#6a2a9a' },
    { id: 'orange', name: 'オレンジ',   emoji: '🍊', head: '#ffa040', tail: '#9a5a1a' },
    { id: 'pink',   name: 'ピンク',     emoji: '🌸', head: '#ff7ab8', tail: '#9a3a6a' },
  ];

  const BACKGROUNDS = [
    { id: 'forest', name: 'フォレスト', emoji: '🌿', top: '#0f2a10', bottom: '#060e06', grid: 'rgba(60,140,60,.08)' },
    { id: 'ocean',  name: 'オーシャン', emoji: '🌊', top: '#0a1a2a', bottom: '#040a12', grid: 'rgba(60,140,200,.08)' },
    { id: 'night',  name: 'ナイト',     emoji: '🌌', top: '#1a0f2a', bottom: '#0a0612', grid: 'rgba(140,60,200,.08)' },
    { id: 'magma',  name: 'マグマ',     emoji: '🌋', top: '#2a1008', bottom: '#120604', grid: 'rgba(200,100,40,.08)' },
    { id: 'desert', name: 'デザート',   emoji: '🏜️', top: '#2a2410', bottom: '#121006', grid: 'rgba(200,180,60,.08)' },
  ];

  // ── 衣装データ ─────────────────────────────
  const COSTUMES = [
    { id: 'normal',  name: 'ノーマル',   emoji: '🎽', preview: 'linear-gradient(135deg,#4ce04c,#2a7a2a)' },
    { id: 'striped', name: 'ストライプ', emoji: '🦓', preview: 'repeating-linear-gradient(45deg,#4ce04c 0 6px,#2a7a2a 6px 12px)' },
    { id: 'spotted', name: 'ドット',     emoji: '🐆', preview: 'radial-gradient(circle at 30% 30%,#4ce04c 0 8px,#2a7a2a 8px 100%)' },
    { id: 'checker', name: 'チェック',   emoji: '🏁', preview: 'repeating-conic-gradient(#4ce04c 0 25%,#2a7a2a 0 50%)' },
    { id: 'rainbow', name: 'レインボー', emoji: '🌈', preview: 'linear-gradient(135deg,#ff5a5a,#ffa040,#ffe040,#4ce04c,#4cb8ff,#c46bff)' },
    { id: 'gold',    name: 'ゴールド',   emoji: '✨', preview: 'linear-gradient(135deg,#ffe066,#b8860b)' },
  ];

  // ── 選択状態 (localStorageで保存) ────────────
  let selectedChar = CHARACTERS.find(c => c.id === localStorage.getItem('snakeChar')) || CHARACTERS[0];
  let selectedBg   = BACKGROUNDS.find(b => b.id === localStorage.getItem('snakeBg')) || BACKGROUNDS[0];
  let selectedCostume = COSTUMES.find(c => c.id === localStorage.getItem('snakeCostume')) || COSTUMES[0];

  // ── 定数 ───────────────────────────────────
  const INITIAL_SPEED  = 140;
  const MIN_SPEED      = 55;
  const SPEED_STEP     = 4;
  const LEVEL_UP_EVERY = 5;
  const INITIAL_LENGTH = 3;

  // ── 状態管理 ───────────────────────────────
  let snake       = [];
  let direction   = { x: 1, y: 0 };
  let nextDir     = { x: 1, y: 0 };
  let food        = null;
  let scoreVal    = 0;
  let levelNum    = 1;
  let highScore   = Number(localStorage.getItem('snakeHigh') || 0);
  let moveTimer   = 0;
  let moveInterval = INITIAL_SPEED;
  let gameState   = 'home';
  let particles   = [];
  let frameCount  = 0;
  let shakeTimer  = 0;
  let comboText   = null;

  // ── キー操作 ───────────────────────────────
  const DIR_MAP = {
    ArrowUp:    { x: 0, y: -1 },
    ArrowDown:  { x: 0, y: 1 },
    ArrowLeft:  { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    KeyW:       { x: 0, y: -1 },
    KeyS:       { x: 0, y: 1 },
    KeyA:       { x: -1, y: 0 },
    KeyD:       { x: 1, y: 0 },
  };

  window.addEventListener('keydown', (e) => {
    if (gameState === 'home' || gameState === 'dead') {
      if (e.code === 'Space' || e.code === 'Enter') { startGame(); e.preventDefault(); }
      return;
    }
    const d = DIR_MAP[e.code];
    if (d) {
      e.preventDefault();
      if (d.x !== -direction.x || d.y !== -direction.y) {
        nextDir = d;
      }
    }
  });

  // ── モバイルコントローラー ───────────────────
  const mobileMap = {
    btnUp:    { x: 0, y: -1 },
    btnDown:  { x: 0, y: 1 },
    btnLeft:  { x: -1, y: 0 },
    btnRight: { x: 1, y: 0 },
  };
  Object.entries(mobileMap).forEach(([id, d]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (gameState === 'home' || gameState === 'dead') { startGame(); return; }
      if (d.x !== -direction.x || d.y !== -direction.y) {
        nextDir = d;
      }
    });
  });

  // ── スワイプ操作 ────────────────────────────
  let touchStartX = 0, touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (gameState !== 'playing') return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 20) return;
    let d;
    if (absDx > absDy) {
      d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    if (d.x !== -direction.x || d.y !== -direction.y) {
      nextDir = d;
    }
  }, { passive: true });

  // ── オーバーレイ制御 ───────────────────────
  function showOverlay() { overlay.classList.remove('hidden-overlay'); }
  function hideOverlay() { overlay.classList.add('hidden-overlay'); }

  // ── ユーティリティ ─────────────────────────
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // ── ホーム画面制御 ─────────────────────────
  function showHome() {
    gameState = 'home';
    homeScreen.classList.remove('hidden');
    hideOverlay();
  }
  function hideHome() {
    homeScreen.classList.add('hidden');
  }

  // ── テーマ適用 ─────────────────────────────
  function applyTheme() {
    document.body.style.background =
      'radial-gradient(ellipse at center, ' + selectedBg.top + ' 40%, ' + selectedBg.bottom + ')';
  }

  // ── 選択ボタン生成 ─────────────────────────
  function buildSelectors() {
    const charEl = document.getElementById('charSelect');
    const costumeEl = document.getElementById('costumeSelect');
    const bgEl = document.getElementById('bgSelect');

    CHARACTERS.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'select-btn' + (c.id === selectedChar.id ? ' selected' : '');
      b.dataset.id = c.id;
      b.innerHTML =
        '<span class="preview" style="background:linear-gradient(135deg,' + c.head + ',' + c.tail + ')"></span>' +
        '<span class="name">' + c.emoji + ' ' + c.name + '</span>';
      b.addEventListener('click', () => {
        selectedChar = c;
        localStorage.setItem('snakeChar', c.id);
        refreshSelectors();
      });
      charEl.appendChild(b);
    });

    COSTUMES.forEach((co) => {
      const b = document.createElement('button');
      b.className = 'select-btn' + (co.id === selectedCostume.id ? ' selected' : '');
      b.dataset.id = co.id;
      b.innerHTML =
        '<span class="preview" style="background:' + co.preview + '"></span>' +
        '<span class="name">' + co.emoji + ' ' + co.name + '</span>';
      b.addEventListener('click', () => {
        selectedCostume = co;
        localStorage.setItem('snakeCostume', co.id);
        refreshSelectors();
      });
      costumeEl.appendChild(b);
    });

    BACKGROUNDS.forEach((bg) => {
      const b = document.createElement('button');
      b.className = 'select-btn' + (bg.id === selectedBg.id ? ' selected' : '');
      b.dataset.id = bg.id;
      b.innerHTML =
        '<span class="preview" style="background:radial-gradient(circle at 30% 30%,' + bg.top + ',' + bg.bottom + ')"></span>' +
        '<span class="name">' + bg.emoji + ' ' + bg.name + '</span>';
      b.addEventListener('click', () => {
        selectedBg = bg;
        localStorage.setItem('snakeBg', bg.id);
        refreshSelectors();
        applyTheme();
      });
      bgEl.appendChild(b);
    });
  }

  function refreshSelectors() {
    document.querySelectorAll('#charSelect .select-btn').forEach((el) => {
      el.classList.toggle('selected', el.dataset.id === selectedChar.id);
    });
    document.querySelectorAll('#costumeSelect .select-btn').forEach((el) => {
      el.classList.toggle('selected', el.dataset.id === selectedCostume.id);
    });
    document.querySelectorAll('#bgSelect .select-btn').forEach((el) => {
      el.classList.toggle('selected', el.dataset.id === selectedBg.id);
    });
  }

  // ── スネーク初期化 ─────────────────────────
  function initSnake() {
    snake = [];
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);
    for (let i = 0; i < INITIAL_LENGTH; i++) {
      snake.push({ x: startX - i, y: startY });
    }
    direction = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
  }

  // ── 食べ物スポーン ─────────────────────────
  function spawnFood() {
    const occupied = new Set(snake.map(s => s.x + ',' + s.y));
    const free = [];
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        if (!occupied.has(x + ',' + y)) free.push({ x, y });
      }
    }
    if (free.length === 0) { winGame(); return; }
    food = free[randInt(0, free.length - 1)];
    food.spawnTime = performance.now();
  }

  // ── ゲーム開始 ─────────────────────────────
  function startGame() {
    gameState = 'playing';
    scoreVal = 0;
    levelNum = 1;
    moveInterval = INITIAL_SPEED;
    moveTimer = 0;
    particles = [];
    comboText = null;
    initSnake();
    spawnFood();
    hideOverlay();
    updateUI();
  }

  // ── ゲームオーバー ─────────────────────────
  function dieGame() {
    gameState = 'dead';
    shakeTimer = 0.5;
    if (scoreVal > highScore) {
      highScore = scoreVal;
      localStorage.setItem('snakeHigh', String(highScore));
    }
    snake.forEach((s) => {
      burst(s.x * CELL + CELL / 2, s.y * CELL + CELL / 2, '#ff5555', 3);
    });
    overlayTtl.textContent = '💀 ゲームオーバー';
    overlayMsg.innerHTML = 'スコア: <strong>' + scoreVal + '</strong><br>スネークの長さ: ' + snake.length + '<br>レベル: ' + levelNum;
    btn.textContent = 'もう一度プレイ';
    showOverlay();
    updateUI();
  }

  // ── 勝利 ──────────────────────────────────
  function winGame() {
    gameState = 'dead';
    overlayTtl.textContent = '🎉 完全クリア！';
    overlayMsg.innerHTML = '全セルを埋め尽くしました！<br>スコア: <strong>' + scoreVal + '</strong>';
    btn.textContent = 'もう一度プレイ';
    showOverlay();
    updateUI();
  }

  // ── パーティクル ───────────────────────────
  function burst(cx, cy, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = rand(0, Math.PI * 2);
      const spd = rand(40, 180);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: rand(0.3, 0.7),
        maxLife: 0.7,
        size: rand(2, 5),
        color: color,
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ── メインアップデート ─────────────────────
  function update(dt) {
    frameCount++;
    updateParticles(dt);

    if (comboText) {
      comboText.life -= dt;
      comboText.y -= 40 * dt;
      if (comboText.life <= 0) comboText = null;
    }
    if (shakeTimer > 0) shakeTimer -= dt;

    if (gameState !== 'playing') return;

    moveTimer += dt * 1000;
    if (moveTimer < moveInterval) return;
    moveTimer -= moveInterval;

    direction = { x: nextDir.x, y: nextDir.y };

    var head = snake[0];
    var nx = head.x + direction.x;
    var ny = head.y + direction.y;

    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) { dieGame(); return; }

    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === nx && snake[i].y === ny) { dieGame(); return; }
    }

    snake.unshift({ x: nx, y: ny });

    if (food && nx === food.x && ny === food.y) {
      scoreVal += 10 * levelNum;
      burst(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, '#a0ff60', 12);
      var txt = '+' + (10 * levelNum);
      comboText = { text: txt, x: food.x * CELL + CELL / 2, y: food.y * CELL, life: 0.8, maxLife: 0.8 };

      var eaten = snake.length - INITIAL_LENGTH;
      if (eaten > 0 && eaten % LEVEL_UP_EVERY === 0) {
        levelNum++;
        moveInterval = Math.max(MIN_SPEED, INITIAL_SPEED - (levelNum - 1) * SPEED_STEP);
        comboText.text = txt + ' LEVEL UP!';
      }
      spawnFood();
    } else {
      snake.pop();
    }
    updateUI();
  }

  // ── 衣装に応じたセグメント色 ───────────────
  function segmentColor(seg, i, t, headRgb, tailRgb) {
    var r, g, b;
    switch (selectedCostume.id) {
      case 'striped':
        // 交互に明暗のストライプ
        var factor = (i % 2 === 0) ? 1 : 0.5;
        r = Math.round(headRgb[0] * factor);
        g = Math.round(headRgb[1] * factor);
        b = Math.round(headRgb[2] * factor);
        break;
      case 'checker':
        // 市松模様
        var checker = ((seg.x + seg.y) % 2 === 0) ? 1 : 0.5;
        r = Math.round((headRgb[0] + (tailRgb[0] - headRgb[0]) * t) * checker);
        g = Math.round((headRgb[1] + (tailRgb[1] - headRgb[1]) * t) * checker);
        b = Math.round((headRgb[2] + (tailRgb[2] - headRgb[2]) * t) * checker);
        break;
      case 'rainbow':
        // 虹色グラデーション
        var hue = (i * 36) % 360;
        var rgb = hslToRgb(hue / 360, 0.85, 0.55);
        r = rgb[0]; g = rgb[1]; b = rgb[2];
        break;
      case 'gold':
        // 金色
        r = Math.round(255 - t * 40);
        g = Math.round(215 - t * 30);
        b = Math.round(60 + t * 20);
        break;
      default:
        // normal: キャラクター色のグラデーション
        r = Math.round(headRgb[0] + (tailRgb[0] - headRgb[0]) * t);
        g = Math.round(headRgb[1] + (tailRgb[1] - headRgb[1]) * t);
        b = Math.round(headRgb[2] + (tailRgb[2] - headRgb[2]) * t);
    }
    return [r, g, b];
  }

  // ── 描画 ──────────────────────────────────
  function draw() {
    ctx.save();

    if (shakeTimer > 0) {
      var intensity = shakeTimer * 12;
      ctx.translate(rand(-intensity, intensity), rand(-intensity, intensity));
    }

    // 背景
    var bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    bgGrad.addColorStop(0, selectedBg.top);
    bgGrad.addColorStop(1, selectedBg.bottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // グリッド線
    ctx.strokeStyle = selectedBg.grid;
    ctx.lineWidth = 1;
    for (var x = 0; x <= W; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (var y = 0; y <= H; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 食べ物
    if (food) {
      var fx = food.x * CELL + CELL / 2;
      var fy = food.y * CELL + CELL / 2;
      var pulse = 1 + Math.sin(frameCount * 0.12) * 0.12;
      var fSize = (CELL / 2 - 2) * pulse;

      ctx.shadowColor = '#ff6060';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ff4040';
      ctx.beginPath();
      ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath();
      ctx.arc(fx - 2, fy - 2, fSize * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#3a7a20';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy - fSize);
      ctx.lineTo(fx + 2, fy - fSize - 4);
      ctx.stroke();
    }

    // スネーク
    var headRgb = hexToRgb(selectedChar.head);
    var tailRgb = hexToRgb(selectedChar.tail);
    snake.forEach(function (seg, i) {
      var sx = seg.x * CELL;
      var sy = seg.y * CELL;
      var isHead = i === 0;
      var t = i / Math.max(snake.length - 1, 1);

      var rgb = segmentColor(seg, i, t, headRgb, tailRgb);
      var r = rgb[0], g = rgb[1], b = rgb[2];

      if (isHead) {
        ctx.shadowColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.shadowBlur = 14;
      }

      var pad = 1;
      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      ctx.beginPath();
      ctx.roundRect(sx + pad, sy + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 6 : 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ドット衣装: 斑点を描画
      if (selectedCostume.id === 'spotted' && !isHead) {
        ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.beginPath();
        ctx.arc(sx + CELL * 0.3, sy + CELL * 0.35, CELL * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + CELL * 0.7, sy + CELL * 0.65, CELL * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isHead) {
        ctx.fillStyle = '#fff';
        var eyeR = CELL * 0.15;
        var pupilR = CELL * 0.075;
        var q1 = CELL * 0.3;
        var q2 = CELL * 0.7;
        var q3 = CELL * 0.35;
        var q4 = CELL * 0.65;
        var ex1, ey1, ex2, ey2;
        if (direction.x === 1) {
          ex1 = sx + q4; ey1 = sy + q1;
          ex2 = sx + q4; ey2 = sy + q2;
        } else if (direction.x === -1) {
          ex1 = sx + q3; ey1 = sy + q1;
          ex2 = sx + q3; ey2 = sy + q2;
        } else if (direction.y === -1) {
          ex1 = sx + q1; ey1 = sy + q3;
          ex2 = sx + q2; ey2 = sy + q3;
        } else {
          ex1 = sx + q1; ey1 = sy + q4;
          ex2 = sx + q2; ey2 = sy + q4;
        }
        ctx.beginPath(); ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(ex1, ey1, pupilR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey2, pupilR, 0, Math.PI * 2); ctx.fill();
      }
    });

    // パーティクル
    particles.forEach(function (p) {
      var alpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // コンボテキスト
    if (comboText) {
      var ca = clamp(comboText.life / comboText.maxLife, 0, 1);
      ctx.globalAlpha = ca;
      ctx.fillStyle = '#a0ff60';
      ctx.font = 'bold 18px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comboText.text, comboText.x, comboText.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ── UI更新 ────────────────────────────────
  function updateUI() {
    ui_score.textContent = scoreVal;
    ui_length.textContent = snake.length;
    ui_level.textContent = levelNum;
    ui_hiscore.textContent = highScore;
  }

  // ── ゲームループ ───────────────────────────
  var lastTime = 0;
  function loop(timestamp) {
    var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // ── 初期化 ────────────────────────────────
  ui_hiscore.textContent = highScore;
  initSnake();
  buildSelectors();
  applyTheme();
  draw();

  btn.addEventListener('click', startGame);
  homeStart.addEventListener('click', () => {
    hideHome();
    startGame();
  });
  homeBtn.addEventListener('click', showHome);

  requestAnimationFrame(function (ts) {
    lastTime = ts;
    loop(ts);
  });

})();
