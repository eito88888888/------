// ════════════════════════════════════════
// 🧟 NEON SURVIVAL GAME v2
// ホーム / ショップ / 武器 / コイン
// ════════════════════════════════════════

(function () {
  'use strict';

  // ── 武器定義 ─────────────────────────────
  // 初期装備: ダメージ1, 連射力1, 攻撃範囲1 を基準
  const WEAPONS = [
    { id: 'pistol',   name: 'ピストル',           damage: 1,   fireRate: 1,   range: 1,   cost: 0,   color: '#4ce0ff', bulletR: 5, icon: '🔫', desc: 'バランスの取れた基本武器' },
    { id: 'assault',  name: 'アサルトライフル',   damage: 3,   fireRate: 3,   range: 0.5, cost: 50,  color: '#ffd040', bulletR: 4, icon: '🔫', desc: '高速連射！射程は短め' },
    { id: 'rocket',   name: 'ロケットランチャー', damage: 10,  fireRate: 0.1, range: 1,   cost: 100, color: '#ff5a5a', bulletR: 8, icon: '🚀', desc: '超火力！連射は遅い' },
    { id: 'shotgun',  name: 'ショットガン',       damage: 2,   fireRate: 0.8, range: 0.6, cost: 75,  color: '#ff8a3d', bulletR: 4, icon: '🔫', desc: '5連発の散弾をばらまく', pellets: 5 },
    { id: 'smg',      name: 'サブマシンガン',     damage: 1.5, fireRate: 5,   range: 0.7, cost: 80,  color: '#ffe040', bulletR: 3, icon: '🔫', desc: '超高速連射の弾幕' },
    { id: 'sniper',   name: 'スナイパーライフル', damage: 8,   fireRate: 0.3, range: 2.5, cost: 120, color: '#6aff6a', bulletR: 6, icon: '🎯', desc: '超長射程の一撃' },
    { id: 'laser',    name: 'レーザーガン',       damage: 4,   fireRate: 2,   range: 1.5, cost: 150, color: '#4ce0ff', bulletR: 5, icon: '⚡', desc: '高精度の光線を連射' },
    { id: 'plasma',   name: 'プラズマキャノン',   damage: 6,   fireRate: 0.5, range: 1.2, cost: 180, color: '#c46bff', bulletR: 7, icon: '🔮', desc: '広範囲にダメージ' },
    { id: 'gatling',  name: 'ガトリングガン',     damage: 2,   fireRate: 6,   range: 0.8, cost: 200, color: '#ff6a6a', bulletR: 3, icon: '🔫', desc: '最速の弾幕を形成' },
    { id: 'mega',     name: 'メガブラスター',     damage: 15,  fireRate: 0.05, range: 1.5, cost: 300, color: '#ff4ce0', bulletR: 9, icon: '💥', desc: '究極の破壊力！' },
  ];

  // ── ガチャ・装備定義 ─────────────────────
  const GACHA_COST = 50;
  const GACHA_ITEMS = [
    // 通常装備（コモン）
    { id: 'iron_helmet',   name: 'アイアンヘルメット',       slot: 'helmet',   icon: '🪖', desc: '最大HP+1',       effect: { type: 'maxhp',  mult: 1 }, rarity: 'common' },
    { id: 'steel_chest',   name: 'スチールチェストプレート', slot: 'chest',    icon: '🦺', desc: '被ダメージ30%軽減', effect: { type: 'armor',  mult: 0.3 }, rarity: 'common' },
    { id: 'speed_leggings',name: 'スピードレギンス',         slot: 'leggings', icon: '👖', desc: '弾の射程+50%',     effect: { type: 'range',  mult: 1.5 }, rarity: 'common' },
    { id: 'speed_boots',   name: 'スピードブーツ',           slot: 'boots',    icon: '👢', desc: 'スピードが1.5倍',   effect: { type: 'speed',  mult: 1.5 }, rarity: 'common' },
    { id: 'power_potion',  name: 'パワーアップポーション',   slot: 'support',  icon: '🧪', desc: '攻撃力が1.5倍',     effect: { type: 'damage', mult: 1.5 }, rarity: 'common' },
    // ドラゴン装備（レア）
    { id: 'dragon_helmet',   name: 'ドラゴンヘルメット',       slot: 'helmet',   icon: '🐉', desc: '最大HP+2',       effect: { type: 'maxhp',  mult: 2 }, rarity: 'rare' },
    { id: 'dragon_chest',    name: 'ドラゴンチェストプレート', slot: 'chest',    icon: '🐉', desc: '被ダメージ45%軽減', effect: { type: 'armor',  mult: 0.45 }, rarity: 'rare' },
    { id: 'dragon_leggings', name: 'ドラゴンレギンス',         slot: 'leggings', icon: '🐲', desc: '弾の射程2倍',     effect: { type: 'range',  mult: 2 }, rarity: 'rare' },
    { id: 'dragon_boots',    name: 'ドラゴンブーツ',           slot: 'boots',    icon: '🐉', desc: 'スピードが2倍',   effect: { type: 'speed',  mult: 2 }, rarity: 'rare' },
    { id: 'dragon_potion',   name: 'ドラゴンポーション',       slot: 'support',  icon: '🐉', desc: '攻撃力が3倍',     effect: { type: 'damage', mult: 3 }, rarity: 'rare' },
    // ナイト装備（コモン）
    { id: 'knight_helmet',   name: 'ナイトヘルメット',       slot: 'helmet',   icon: '🛡️', desc: '最大HP+2',       effect: { type: 'maxhp',  mult: 2 }, rarity: 'common' },
    { id: 'knight_chest',    name: 'ナイトチェストプレート', slot: 'chest',    icon: '🛡️', desc: '被ダメージ40%軽減', effect: { type: 'armor',  mult: 0.4 }, rarity: 'common' },
    { id: 'knight_leggings', name: 'ナイトレギンス',         slot: 'leggings', icon: '🦿', desc: '弾の射程+75%',     effect: { type: 'range',  mult: 1.75 }, rarity: 'common' },
    { id: 'knight_boots',    name: 'ナイトブーツ',           slot: 'boots',    icon: '🥾', desc: 'スピードが1.75倍', effect: { type: 'speed',  mult: 1.75 }, rarity: 'common' },
    { id: 'regen_potion',    name: 'リジェネポーション',     slot: 'support',  icon: '💚', desc: '時間でHP回復',     effect: { type: 'regen',  mult: 1 }, rarity: 'common' },
    // ゴールド装備（レア）
    { id: 'gold_helmet',   name: 'ゴールドヘルメット',       slot: 'helmet',   icon: '👑', desc: '最大HP+3',       effect: { type: 'maxhp',  mult: 3 }, rarity: 'rare' },
    { id: 'gold_chest',    name: 'ゴールドチェストプレート', slot: 'chest',    icon: '👑', desc: '被ダメージ50%軽減', effect: { type: 'armor',  mult: 0.5 }, rarity: 'rare' },
    { id: 'gold_leggings', name: 'ゴールドレギンス',         slot: 'leggings', icon: '👑', desc: '弾の射程2.5倍',     effect: { type: 'range',  mult: 2.5 }, rarity: 'rare' },
    { id: 'gold_boots',    name: 'ゴールドブーツ',           slot: 'boots',    icon: '👑', desc: 'スピードが2.5倍',   effect: { type: 'speed',  mult: 2.5 }, rarity: 'rare' },
    { id: 'gold_potion',   name: 'ゴールドポーション',       slot: 'support',  icon: '✨', desc: '時間でHP回復（大）', effect: { type: 'regen',  mult: 2 }, rarity: 'rare' },
  ];
  const EQUIP_SLOTS = [
    { id: 'helmet',  name: 'ヘルメット',       icon: '🪖' },
    { id: 'chest',   name: 'チェストプレート', icon: '🦺' },
    { id: 'leggings',name: 'レギンス',         icon: '👖' },
    { id: 'boots',   name: 'ブーツ',           icon: '👢' },
    { id: 'support', name: 'サポートアイテム', icon: '🎒' },
  ];

  // ── 定数 ─────────────────────────────────
  const BASE_COOLDOWN   = 260;   // ms（連射力1の時の発射間隔）
  const BASE_BULLET_LIFE = 1.5;  // sec（攻撃範囲1の時の弾の寿命）
  const PLAYER_R        = 14;
  const PLAYER_SPEED    = 260;
  const MAX_HP          = 3;
  const BULLET_SPEED    = 420;
  const POWERUP_CHANCE  = 0.08;

  // ── DOM ──────────────────────────────────
  const homeScreen   = document.getElementById('homeScreen');
  const shopScreen   = document.getElementById('shopScreen');
  const gameScreen   = document.getElementById('gameScreen');
  const equipScreen  = document.getElementById('equipScreen');
  const shopBtn      = document.getElementById('shopBtn');
  const homeStartBtn = document.getElementById('homeStartBtn');
  const shopBackBtn  = document.getElementById('shopBackBtn');
  const homeGoldEl   = document.getElementById('homeGold');
  const shopGoldEl   = document.getElementById('shopGold');
  const equippedNameEl= document.getElementById('equippedName');
  const shopListEl   = document.getElementById('shopList');
  const gachaBtn     = document.getElementById('gachaBtn');
  const gachaBtn10   = document.getElementById('gachaBtn10');
  const gachaModal   = document.getElementById('gachaModal');
  const gachaResultEl= document.getElementById('gachaResult');
  const gachaCloseBtn= document.getElementById('gachaCloseBtn');
  const gachaChestWrap = document.getElementById('gachaChestWrap');
  const gachaChest   = document.getElementById('gachaChest');
  const chestTextEl  = document.getElementById('chestText');
  const equipBtn     = document.getElementById('equipBtn');
  const equipBackBtn = document.getElementById('equipBackBtn');
  const equipGoldEl  = document.getElementById('equipGold');
  const equipListEl  = document.getElementById('equipList');
  const canvas       = document.getElementById('gameCanvas');
  const ctx          = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const overlay      = document.getElementById('overlay');
  const overlayTtl   = document.getElementById('overlayTitle');
  const overlayMsg   = document.getElementById('overlayText');
  const gameOverBtn  = document.getElementById('gameOverBtn');
  const ui_score     = document.getElementById('score');
  const ui_hp        = document.getElementById('hp');
  const ui_wave      = document.getElementById('wave');
  const ui_gold      = document.getElementById('gold');
  const ui_hiscore   = document.getElementById('highscore');
  const resetBtn     = document.getElementById('resetBtn');
  const gameHomeBtn  = document.getElementById('gameHomeBtn');
  const goldStageBtn = document.getElementById('goldStageBtn');
  const timerInfoEl  = document.getElementById('timerInfo');
  const timerEl      = document.getElementById('timer');
  const codeInput    = document.getElementById('codeInput');
  const codeBtn      = document.getElementById('codeBtn');
  const codeMsg      = document.getElementById('codeMsg');
  const adminModal        = document.getElementById('adminModal');
  const adminGoldInput    = document.getElementById('adminGoldInput');
  const adminGoldSetBtn   = document.getElementById('adminGoldSetBtn');
  const adminUnlockWeaponsBtn = document.getElementById('adminUnlockWeaponsBtn');
  const adminUnlockEquipBtn   = document.getElementById('adminUnlockEquipBtn');
  const adminCloseBtn     = document.getElementById('adminCloseBtn');
  const adminMsg          = document.getElementById('adminMsg');
  const skinBtn       = document.getElementById('skinBtn');

  // ── 永続データ ───────────────────────────
  let gold           = Number(localStorage.getItem('survivalGold') || 0);
  let ownedWeapons   = JSON.parse(localStorage.getItem('survivalWeapons') || '["pistol"]');
  let equippedId     = localStorage.getItem('survivalEquipped') || 'pistol';
  let highScore      = Number(localStorage.getItem('survivalHigh') || 0);
  let ownedEquipment = JSON.parse(localStorage.getItem('survivalEquipOwned') || '[]');
  let equippedEquipment = JSON.parse(localStorage.getItem('survivalEquipEquipped') || '{}');
  let goldFreeUsed = localStorage.getItem('survivalGoldFreeUsed') === '1';
  var goldFreeSession = false; // 初回無料セッション中かどうか
  const SKIN_ORDER = ['anime', 'classic', 'neon'];
  const SKIN_LABELS = { anime: 'アニメ', classic: 'クラシック', neon: 'ネオン' };
  var skinStyle = localStorage.getItem('survivalSkin') || 'anime';
  if (SKIN_ORDER.indexOf(skinStyle) === -1) skinStyle = 'anime';
  function saveSkin() { localStorage.setItem('survivalSkin', skinStyle); }
  function getSkinLabel() { return SKIN_LABELS[skinStyle] || 'アニメ'; }

  // ── コード ───────────────────────────────
  const CODES = {
    'NEON1000':  { gold: 1000,  label: '1000G' },
    'ZOMBIE500': { gold: 500,   label: '500G' },
    'GOLD10000': { gold: 10000, label: '10000G' },
    'GOD':       { admin: true, label: '管理者' },
  };
  let usedCodes = JSON.parse(localStorage.getItem('survivalCodes') || '[]');
  function saveUsedCodes() { localStorage.setItem('survivalCodes', JSON.stringify(usedCodes)); }
  function showCodeMsg(text, ok) {
    codeMsg.textContent = text;
    codeMsg.classList.remove('hidden', 'ok', 'err');
    codeMsg.classList.add(ok ? 'ok' : 'err');
    clearTimeout(showCodeMsg._t);
    showCodeMsg._t = setTimeout(function () { codeMsg.classList.add('hidden'); }, 4000);
  }
  function redeemCode() {
    var code = (codeInput.value || '').trim().normalize('NFKC').toUpperCase();
    if (!code) { showCodeMsg('コードを入力してください', false); return; }
    if (usedCodes.indexOf(code) >= 0) { showCodeMsg('このコードは使用済みです', false); return; }
    var item = CODES[code];
    if (!item) { showCodeMsg('無効なコードです', false); return; }
    codeInput.value = '';
    // 管理者コードは何度でも使える（使用済みにしない）
    if (item.admin) {
      openAdminPanel();
      return;
    }
    usedCodes.push(code);
    saveUsedCodes();
    gold += item.gold;
    saveGold();
    updateHomeUI();
    showCodeMsg('🎉 ' + item.label + ' を獲得しました！', true);
  }

  // ── 管理者パネル ─────────────────────────
  function openAdminPanel() {
    adminModal.classList.remove('hidden');
    adminGoldInput.value = gold;
    adminMsg.classList.add('hidden');
  }
  function closeAdminPanel() {
    adminModal.classList.add('hidden');
  }
  function showAdminMsg(text, ok) {
    adminMsg.textContent = text;
    adminMsg.classList.remove('hidden', 'ok', 'err');
    adminMsg.classList.add(ok ? 'ok' : 'err');
    clearTimeout(showAdminMsg._t);
    showAdminMsg._t = setTimeout(function () { adminMsg.classList.add('hidden'); }, 3000);
  }
  function adminSetGold() {
    var v = parseInt(adminGoldInput.value, 10);
    if (isNaN(v) || v < 0) { showAdminMsg('正しい金額を入力してください', false); return; }
    gold = v;
    saveGold();
    updateHomeUI();
    showAdminMsg('💰 ゴールドを ' + v + 'G に設定しました', true);
  }
  function adminUnlockWeapons() {
    WEAPONS.forEach(function (w) { if (ownedWeapons.indexOf(w.id) === -1) ownedWeapons.push(w.id); });
    saveOwned();
    showAdminMsg('🔫 全武器を解放しました', true);
  }
  function adminUnlockEquip() {
    GACHA_ITEMS.forEach(function (it) { if (ownedEquipment.indexOf(it.id) === -1) ownedEquipment.push(it.id); });
    saveOwnedEquip();
    showAdminMsg('🎒 全装備を解放しました', true);
  }
  function toggleSkin() {
    var index = SKIN_ORDER.indexOf(skinStyle);
    var nextIndex = (index + 1) % SKIN_ORDER.length;
    skinStyle = SKIN_ORDER[nextIndex];
    saveSkin();
    skinBtn.textContent = getSkinLabel();
  }

  function getWeapon() { return WEAPONS.find(w => w.id === equippedId) || WEAPONS[0]; }
  function saveGold() { localStorage.setItem('survivalGold', String(gold)); }
  function saveOwned() { localStorage.setItem('survivalWeapons', JSON.stringify(ownedWeapons)); }
  function saveEquipped() { localStorage.setItem('survivalEquipped', equippedId); }
  function saveOwnedEquip() { localStorage.setItem('survivalEquipOwned', JSON.stringify(ownedEquipment)); }
  function saveEquippedEquip() { localStorage.setItem('survivalEquipEquipped', JSON.stringify(equippedEquipment)); }

  // 装備効果の取得
  function getEquipSpeedMult() {
    var id = equippedEquipment['boots'];
    if (!id) return 1;
    var it = GACHA_ITEMS.find(function (x) { return x.id === id; });
    return (it && it.effect.type === 'speed') ? it.effect.mult : 1;
  }
  function getEquipDamageMult() {
    var id = equippedEquipment['support'];
    if (!id) return 1;
    var it = GACHA_ITEMS.find(function (x) { return x.id === id; });
    return (it && it.effect.type === 'damage') ? it.effect.mult : 1;
  }
  function getEquipMaxHpBonus() {
    var id = equippedEquipment['helmet'];
    if (!id) return 0;
    var it = GACHA_ITEMS.find(function (x) { return x.id === id; });
    return (it && it.effect.type === 'maxhp') ? it.effect.mult : 0;
  }
  function getEquipArmorChance() {
    var id = equippedEquipment['chest'];
    if (!id) return 0;
    var it = GACHA_ITEMS.find(function (x) { return x.id === id; });
    return (it && it.effect.type === 'armor') ? it.effect.mult : 0;
  }
  function getEquipRangeMult() {
    var id = equippedEquipment['leggings'];
    if (!id) return 1;
    var it = GACHA_ITEMS.find(function (x) { return x.id === id; });
    return (it && it.effect.type === 'range') ? it.effect.mult : 1;
  }
  function getEquipRegen() {
    var id = equippedEquipment['support'];
    if (!id) return 0;
    var it = GACHA_ITEMS.find(function (x) { return x.id === id; });
    return (it && it.effect.type === 'regen') ? it.effect.mult : 0;
  }
  function getMaxHp() {
    return MAX_HP + getEquipMaxHpBonus();
  }

  // ── ゲーム内状態 ─────────────────────────
  var player = { x: W/2, y: H/2, hp: MAX_HP, invulnUntil: 0, fireCooldown: 0, speedMult: 1, rapidUntil: 0 };
  var bullets = [];
  var enemies = [];
  var powerups = [];
  var coins = [];
  var particles = [];
  var scoreVal = 0, waveNum = 1, frameCount = 0, shakeTimer = 0, flashAlpha = 0;
  var spawnTimer = 0, survivalTime = 0, lastTime = 0;
  var gameState = 'home'; // 'home' | 'shop' | 'playing' | 'dead'

  // ゴールドステージ用
  var gameMode = 'normal'; // 'normal' | 'gold'
  var goldStageTimer = 120;
  var normalTimer = 180;

  // ── キー操作 ─────────────────────────────
  const pressedKeys = {};
  window.addEventListener('keydown', function (e) {
    pressedKeys[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    if (gameState === 'dead' && (e.code === 'Space' || e.code === 'Enter')) {
      goToHome(); e.preventDefault();
    }
  });
  window.addEventListener('keyup', function (e) { delete pressedKeys[e.code]; });

  // ── モバイル操作 ─────────────────────────
  var mobileMap = { btnUp:{x:0,y:-1}, btnDown:{x:0,y:1}, btnLeft:{x:-1,y:0}, btnRight:{x:1,y:0} };
  var mobileDir = { x:0, y:0 };
  Object.keys(mobileMap).forEach(function (id) {
    var d = mobileMap[id];
    var el = document.getElementById(id);
    if (!el) return;
    function apply(on) {
      if (on) { mobileDir.x = d.x; mobileDir.y = d.y; }
      else if (mobileDir.x === d.x && mobileDir.y === d.y) { mobileDir.x = 0; mobileDir.y = 0; }
    }
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); apply(true); });
    el.addEventListener('pointerup',   function (e) { e.preventDefault(); apply(false); });
    el.addEventListener('pointerleave',function (e) { e.preventDefault(); apply(false); });
  });

  // ── ユーティリティ ───────────────────────
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

  // ═══════════════════════════════════════
  //  画面遷移
  // ═══════════════════════════════════════
  function showScreen(name) {
    homeScreen.classList.toggle('hidden', name !== 'home');
    shopScreen.classList.toggle('hidden', name !== 'shop');
    gameScreen.classList.toggle('hidden', name !== 'game');
    equipScreen.classList.toggle('hidden', name !== 'equip');
  }

  function goToHome() {
    gameState = 'home';
    saveGold();
    showScreen('home');
    updateHomeUI();
  }

  function goToShop() {
    gameState = 'shop';
    showScreen('shop');
    buildShop();
  }

  function goToEquip() {
    gameState = 'equip';
    showScreen('equip');
    buildEquip();
  }

  function goToGame() {
    gameMode = 'normal';
    showScreen('game');
    gameState = 'playing';
    startGame();
  }

  function goToGoldStage() {
    if (!goldFreeUsed) {
      // 初回は無料
      goldFreeUsed = true;
      localStorage.setItem('survivalGoldFreeUsed', '1');
      goldFreeSession = true;
    } else {
      if (gold < 1000) return;
      gold -= 1000;
      saveGold();
      goldFreeSession = false;
    }
    gameMode = 'gold';
    showScreen('game');
    gameState = 'playing';
    startGame();
  }

  // ═══════════════════════════════════════
  //  ホーム画面
  // ═══════════════════════════════════════
  function updateHomeUI() {
    homeGoldEl.textContent = gold;
    var w = getWeapon();
    equippedNameEl.textContent = w.icon + ' ' + w.name;
    equippedNameEl.style.color = w.color;

    // ゴールドステージボタンの状態
    if (!goldFreeUsed) {
      goldStageBtn.classList.remove('locked');
      goldStageBtn.querySelector('.card-desc').textContent = '初回無料！ 全敵ゴールド & 時間制限2分';
    } else if (gold >= 1000) {
      goldStageBtn.classList.remove('locked');
      goldStageBtn.querySelector('.card-desc').textContent = '1000Gで挑戦！ 全敵ゴールド & 時間制限2分';
    } else {
      goldStageBtn.classList.add('locked');
      goldStageBtn.querySelector('.card-desc').textContent = '1000Gで挑戦！ 全敵ゴールド & 時間制限2分';
    }

    // ガチャボタンの状態
    if (gold >= GACHA_COST) {
      gachaBtn.classList.remove('locked');
    } else {
      gachaBtn.classList.add('locked');
    }
    if (gold >= GACHA_COST * 10) {
      gachaBtn10.classList.remove('locked');
    } else {
      gachaBtn10.classList.add('locked');
    }
  }

  // ═══════════════════════════════════════
  //  ショップ
  // ═══════════════════════════════════════
  function buildShop() {
    shopGoldEl.textContent = gold;
    shopListEl.innerHTML = '';
    WEAPONS.forEach(function (w) {
      var owned    = ownedWeapons.indexOf(w.id) !== -1;
      var equipped = w.id === equippedId;

      var div = document.createElement('div');
      div.className = 'shop-weapon' + (owned ? ' owned' : '') + (equipped ? ' equipped' : '');

      var btnHtml;
      if (equipped) {
        btnHtml = '<button class="weapon-btn btn-equipped" disabled>装備中</button>';
      } else if (owned) {
        btnHtml = '<button class="weapon-btn btn-equip" data-action="equip" data-id="' + w.id + '">装備</button>';
      } else if (gold >= w.cost) {
        btnHtml = '<button class="weapon-btn btn-buy" data-action="buy" data-id="' + w.id + '">' + w.cost + 'G 購入</button>';
      } else {
        btnHtml = '<button class="weapon-btn btn-locked" disabled>' + w.cost + 'G (不足)</button>';
      }

      div.innerHTML =
        '<div class="weapon-icon">' + w.icon + '</div>' +
        '<div class="weapon-info">' +
          '<div class="weapon-name" style="color:' + w.color + '">' + w.name + '</div>' +
          '<div class="weapon-stats">DMG ' + w.damage + ' ｜ 連射 ' + w.fireRate + ' ｜ 射程 ' + w.range + '</div>' +
          '<div class="weapon-desc">' + w.desc + '</div>' +
        '</div>' +
        btnHtml;

      shopListEl.appendChild(div);
    });

    // ボタンイベント
    shopListEl.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (action === 'buy')   buyWeapon(id);
        if (action === 'equip') equipWeapon(id);
      });
    });
  }

  function buyWeapon(id) {
    var w = WEAPONS.find(function (x) { return x.id === id; });
    if (!w || ownedWeapons.indexOf(id) !== -1 || gold < w.cost) return;
    gold -= w.cost;
    ownedWeapons.push(id);
    saveGold(); saveOwned();
    buildShop();
  }

  function equipWeapon(id) {
    if (ownedWeapons.indexOf(id) === -1) return;
    equippedId = id;
    saveEquipped();
    buildShop();
  }

  // ═══════════════════════════════════════
  //  ガチャ
  // ═══════════════════════════════════════
  function rollGachaItem() {
    // レア度による重み付き抽選（レアは低確率）
    var totalWeight = 0;
    GACHA_ITEMS.forEach(function (it) {
      totalWeight += it.rarity === 'rare' ? 1 : 3;
    });
    var roll = Math.random() * totalWeight;
    var item = GACHA_ITEMS[0];
    for (var i = 0; i < GACHA_ITEMS.length; i++) {
      roll -= GACHA_ITEMS[i].rarity === 'rare' ? 1 : 3;
      if (roll <= 0) { item = GACHA_ITEMS[i]; break; }
    }
    return item;
  }

  function pullGacha(count) {
    count = count || 1;
    var cost = GACHA_COST * count;
    if (gold < cost) return;
    gold -= cost;
    saveGold();

    var results = [];
    var hasRare = false;

    // 10連はレア1個確定
    var rareGuarantee = count > 1;
    var guaranteedRare = null;
    if (rareGuarantee) {
      var rareItems = GACHA_ITEMS.filter(function (it) { return it.rarity === 'rare'; });
      guaranteedRare = rareItems[Math.floor(Math.random() * rareItems.length)];
    }

    for (var n = 0; n < count; n++) {
      var item;
      if (rareGuarantee && n === count - 1 && !hasRare) {
        item = guaranteedRare; // 9連でレアが出なかった場合、最後はレア確定
      } else {
        item = rollGachaItem();
      }
      if (item.rarity === 'rare') hasRare = true;

      var isNew = ownedEquipment.indexOf(item.id) === -1;
      if (isNew) {
        ownedEquipment.push(item.id);
        saveOwnedEquip();
      } else {
        // 重複時は10G返金
        gold += 10;
        saveGold();
      }
      results.push({ item: item, isNew: isNew });
    }

    // 結果HTMLを生成
    var html = '';
    results.forEach(function (r) {
      var item = r.item;
      var rarityHtml = item.rarity === 'rare'
        ? '<div class="gacha-result-rare">✨ レア！</div>'
        : '<div class="gacha-result-common">コモン</div>';
      html += '<div class="gacha-result-item' + (count > 1 ? ' multi' : '') + '">' +
        '<span class="big-icon">' + item.icon + '</span>' +
        rarityHtml +
        (r.isNew
          ? '<div class="gacha-result-new">NEW!</div>'
          : '<div class="gacha-result-dup">重複</div>') +
        '<div>' + item.name + '</div>' +
        (count === 1 ? '<div style="font-size:13px;opacity:.7">' + item.desc + '</div>' : '') +
        '</div>';
    });

    if (count > 1) {
      var newCount = results.filter(function (r) { return r.isNew; }).length;
      html = '<div class="gacha-summary">🎉 新アイテム ' + newCount + ' 個入手！</div>' +
        '<div class="gacha-result-grid">' + html + '</div>';
    }

    // ── 宝箱演出 ──
    gachaResultEl.innerHTML = '';
    gachaChestWrap.classList.remove('hidden');
    gachaChest.classList.remove('open');
    gachaChest.classList.add('shaking');
    chestTextEl.textContent = count > 1 ? '10連ガチャを引いています...' : 'ガチャを引いています...';
    gachaModal.classList.remove('hidden');
    gachaModal.querySelector('.gacha-modal-content').classList.toggle('wide', count > 1);
    gachaCloseBtn.disabled = true;

    // 1.2秒後に宝箱が開く
    setTimeout(function () {
      gachaChest.classList.remove('shaking');
      gachaChest.classList.add('open');
      chestTextEl.textContent = '✨ 開封！';
      // 0.6秒後に結果を表示
      setTimeout(function () {
        gachaChestWrap.classList.add('hidden');
        gachaResultEl.innerHTML = html;
        gachaCloseBtn.disabled = false;
      }, 600);
    }, 1200);

    updateHomeUI();
  }

  function closeGacha() {
    gachaModal.classList.add('hidden');
    gachaChest.classList.remove('shaking', 'open');
    gachaChestWrap.classList.add('hidden');
    gachaCloseBtn.disabled = false;
    gachaModal.querySelector('.gacha-modal-content').classList.remove('wide');
  }

  // ═══════════════════════════════════════
  //  装備画面
  // ═══════════════════════════════════════
  function buildEquip() {
    equipGoldEl.textContent = gold;
    equipListEl.innerHTML = '';

    EQUIP_SLOTS.forEach(function (slot) {
      var div = document.createElement('div');
      div.className = 'equip-slot';

      var equippedId = equippedEquipment[slot.id] || null;
      var ownedInSlot = GACHA_ITEMS.filter(function (it) {
        return it.slot === slot.id && ownedEquipment.indexOf(it.id) !== -1;
      });

      var html = '<div class="equip-slot-header">' +
        '<span class="equip-slot-icon">' + slot.icon + '</span>' +
        '<span class="equip-slot-name">' + slot.name + '</span>' +
        '</div>';

      if (equippedId) {
        var eq = GACHA_ITEMS.find(function (it) { return it.id === equippedId; });
        html += '<div class="equip-current">装備中: ' + eq.icon + ' ' + eq.name + '（' + eq.desc + '）</div>';
        html += '<button class="equip-item-btn" data-action="unequip" data-slot="' + slot.id + '">外す</button>';
      } else {
        html += '<div class="equip-current empty">装備なし</div>';
      }

      if (ownedInSlot.length > 0) {
        ownedInSlot.forEach(function (it) {
          var isEquipped = equippedId === it.id;
          var rarityTag = it.rarity === 'rare' ? ' ✨' : '';
          html += '<button class="equip-item-btn' + (isEquipped ? ' equipped' : '') + (it.rarity === 'rare' ? ' rare' : '') + '" data-action="equip" data-slot="' + slot.id + '" data-item="' + it.id + '"' + (isEquipped ? ' disabled' : '') + '>' + it.icon + ' ' + it.name + rarityTag + '</button>';
        });
      } else {
        html += '<div class="equip-hint">ガチャで入手しよう！</div>';
      }

      div.innerHTML = html;
      equipListEl.appendChild(div);
    });

    equipListEl.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        var slot = btn.getAttribute('data-slot');
        if (action === 'unequip') {
          delete equippedEquipment[slot];
          saveEquippedEquip();
          buildEquip();
          return;
        }
        var item = btn.getAttribute('data-item');
        equippedEquipment[slot] = item;
        saveEquippedEquip();
        buildEquip();
      });
    });
  }

  // ═══════════════════════════════════════
  //  ゲーム開始 / ゲームオーバー
  // ═══════════════════════════════════════
  function startGame() {
    player     = { x: W/2, y: H/2, hp: getMaxHp(), invulnUntil: 0, fireCooldown: 0, speedMult: 1, rapidUntil: 0, equipSpeedMult: getEquipSpeedMult(), regenTimer: 0 };
    bullets    = [];
    enemies    = [];
    powerups   = [];
    coins      = [];
    particles  = [];
    scoreVal   = 0;
    waveNum    = 1;
    survivalTime = 0;
    spawnTimer = 0;
    shakeTimer = 0;
    flashAlpha = 0;
    frameCount = 0;
    goldStageTimer = 120;
    normalTimer = 180;

    // ゴールドステージモード
    if (gameMode === 'gold') {
      player.hp = 999999;
      timerInfoEl.classList.remove('hidden');
    } else {
      timerInfoEl.classList.remove('hidden');
      goldFreeSession = false;
    }

    overlay.classList.add('hidden-overlay');
    updateUI();
  }

  function dieGame(cleared) {
    gameState = 'dead';
    shakeTimer = 0.6;
    flashAlpha = 0.5;
    if (scoreVal > highScore) {
      highScore = scoreVal;
      localStorage.setItem('survivalHigh', String(highScore));
    }
    saveGold();

    if (gameMode === 'gold') {
      // ゴールドステージ: 時間切れでクリア
      var bonus = Math.floor(survivalTime) * 5;
      gold += bonus;
      saveGold();
      burst(player.x, player.y, '#ffd040', 30);
      overlayTtl.textContent = '👑 ゴールドステージ クリア！';
      overlayMsg.innerHTML =
        'ボーナス: <strong>' + bonus + 'G</strong><br>' +
        'スコア: <strong>' + scoreVal + '</strong><br>' +
        '💀 敵を倒した数: ' + enemies.length + '<br>' +
        '💰 所持ゴールド: <strong>' + gold + 'G</strong>';
    } else if (cleared) {
      // 通常モード: タイムアップでクリア
      var bonus = Math.floor(survivalTime) * 3;
      gold += bonus;
      saveGold();
      burst(player.x, player.y, '#ffd040', 30);
      overlayTtl.textContent = '🎉 クリア！';
      overlayMsg.innerHTML =
        '3分間生き残った！<br>' +
        'ボーナス: <strong>' + bonus + 'G</strong><br>' +
        'スコア: <strong>' + scoreVal + '</strong><br>' +
        'ウェーブ: ' + waveNum + '<br>' +
        '💰 所持ゴールド: <strong>' + gold + 'G</strong>';
    } else {
      burst(player.x, player.y, '#4ce0ff', 30);
      overlayTtl.textContent = '💀 ゲームオーバー';
      overlayMsg.innerHTML =
        'スコア: <strong>' + scoreVal + '</strong><br>' +
        'ウェーブ: ' + waveNum + '<br>' +
        '生存時間: ' + Math.floor(survivalTime) + '秒<br>' +
        '💰 所持ゴールド: <strong>' + gold + 'G</strong>';
    }
    gameOverBtn.textContent = 'ホームに戻る';
    timerInfoEl.classList.add('hidden');
    overlay.classList.remove('hidden-overlay');
    updateUI();
  }

  // ═══════════════════════════════════════
  //  パーティクル
  // ═══════════════════════════════════════
  function burst(cx, cy, color, count) {
    for (var i = 0; i < count; i++) {
      var ang = rand(0, Math.PI * 2);
      var spd = rand(50, 260);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: rand(0.3, 0.8), maxLife: 0.8,
        size: rand(2, 5), color: color
      });
    }
  }

  function updateParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ═══════════════════════════════════════
  //  敵スポーン
  // ═══════════════════════════════════════
  function spawnEnemy() {
    var side = Math.floor(rand(0, 4));
    var x, y;
    var m = 30;
    if (side === 0) { x = rand(m, W - m); y = -m; }
    else if (side === 1) { x = rand(m, W - m); y = H + m; }
    else if (side === 2) { x = -m; y = rand(m, H - m); }
    else { x = W + m; y = rand(m, H - m); }

    var roll = Math.random();
    var type;
    if (roll < 0.6) type = 'basic';
    else if (roll < 0.85) type = 'fast';
    else type = 'tank';

    var speedBoost = 1 + (waveNum - 1) * 0.06;
    var waveHp = Math.floor(waveNum / 3);
    // 初回無料セッション中は3枚、通常は10枚
    var goldDrop = goldFreeSession ? 3 : 10;
    // 初回無料セッション中は敵の体力が半分
    var hpMult = goldFreeSession ? 0.5 : 1;
    var e;
    if (gameMode === 'gold') {
      // ゴールドステージ: 全敵が金色
      // 丸(ベーシック)×3 / 三角(ファスト)×3 / 四角(タンク)変更なし
      if (type === 'basic') {
        e = { x:x, y:y, r:14, hp:Math.max(1, Math.ceil((2+waveHp)*3*hpMult)), maxHp:Math.max(1, Math.ceil((2+waveHp)*3*hpMult)), speed:90*speedBoost, color:'#ffd040', type:type, score:100, coinDrop:goldDrop };
      } else if (type === 'fast') {
        e = { x:x, y:y, r:10, hp:Math.max(1, Math.ceil((2+waveHp)*3*hpMult)), maxHp:Math.max(1, Math.ceil((2+waveHp)*3*hpMult)), speed:150*speedBoost, color:'#ffcc00', type:type, score:150, coinDrop:goldDrop };
      } else {
        e = { x:x, y:y, r:20, hp:Math.max(1, Math.ceil((5+waveHp*2)*hpMult)), maxHp:Math.max(1, Math.ceil((5+waveHp*2)*hpMult)), speed:60*speedBoost, color:'#ffaa00', type:type, score:300, coinDrop:goldDrop };
      }
    } else {
      // 丸(ベーシック)×3 / 三角(ファスト)×3 / 四角(タンク)変更なし
      if (type === 'basic') {
        e = { x:x, y:y, r:14, hp:(2+waveHp)*3, maxHp:(2+waveHp)*3, speed:90*speedBoost, color:'#ff5a5a', type:type, score:100, coinDrop:1 };
      } else if (type === 'fast') {
        e = { x:x, y:y, r:10, hp:(2+waveHp)*3, maxHp:(2+waveHp)*3, speed:150*speedBoost, color:'#ffa040', type:type, score:150, coinDrop:1 };
      } else {
        e = { x:x, y:y, r:20, hp:5+waveHp*2, maxHp:5+waveHp*2, speed:60*speedBoost, color:'#c46bff', type:type, score:300, coinDrop:1 };
      }
    }
    enemies.push(e);
  }

  // ═══════════════════════════════════════
  //  コイン
  // ═══════════════════════════════════════
  function spawnCoins(cx, cy, totalValue) {
    // 大量のコインをまとめて価値を持たせる（最大10枚に分割）
    var numCoins = Math.min(totalValue, 10);
    var perCoin = Math.floor(totalValue / numCoins);
    for (var i = 0; i < numCoins; i++) {
      var ang = rand(0, Math.PI * 2);
      var spd = rand(40, 130);
      coins.push({
        x: cx + rand(-8, 8),
        y: cy + rand(-8, 8),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 6, life: 14,
        bob: rand(0, Math.PI * 2),
        value: perCoin
      });
    }
  }

  function updateCoins(dt) {
    for (var i = coins.length - 1; i >= 0; i--) {
      var c = coins[i];
      c.vx *= 0.95; c.vy *= 0.95;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.life -= dt;
      c.bob += dt * 4;

      // プレイヤーに引き寄せ
      var d = dist(player.x, player.y, c.x, c.y);
      if (d < 65 && d > 0) {
        var pull = (1 - d / 65) * 220;
        var a = Math.atan2(player.y - c.y, player.x - c.x);
        c.x += Math.cos(a) * pull * dt;
        c.y += Math.sin(a) * pull * dt;
      }

      // 取得
      if (d < PLAYER_R + c.r + 5) {
        gold += c.value;
        saveGold();
        burst(c.x, c.y, '#ffd040', 3);
        coins.splice(i, 1);
        continue;
      }
      if (c.life <= 0) coins.splice(i, 1);
    }
  }

  function drawCoins() {
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      var bob = Math.sin(c.bob) * 2;
      var alpha = c.life < 2 ? c.life / 2 : 1;
      ctx.globalAlpha = alpha;

      // グロー
      ctx.shadowColor = '#ffd040';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffd040';
      ctx.beginPath();
      ctx.arc(c.x, c.y + bob, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 内側
      ctx.fillStyle = '#fff8c0';
      ctx.beginPath();
      ctx.arc(c.x, c.y + bob, c.r * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 価値表示
      ctx.fillStyle = '#805800';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.value > 1 ? c.value : '$', c.x, c.y + bob + 1);

      ctx.globalAlpha = 1;
    }
  }

  // ═══════════════════════════════════════
  //  パワーアップ
  // ═══════════════════════════════════════
  function spawnPowerup(x, y) {
    if (Math.random() > POWERUP_CHANCE) return;
    var types = ['heal','rapid','speed'];
    powerups.push({ x:x, y:y, r:12, type:types[Math.floor(rand(0,types.length))], life:8 });
  }

  // ═══════════════════════════════════════
  //  弾発射
  // ═══════════════════════════════════════
  function fireBullet() {
    var w = getWeapon();
    var dmgMult = getEquipDamageMult();
    var target = null, best = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var d = dist(player.x, player.y, enemies[i].x, enemies[i].y);
      if (d < best) { best = d; target = enemies[i]; }
    }
    var baseAng;
    if (target) baseAng = Math.atan2(target.y - player.y, target.x - player.x);
    else baseAng = rand(0, Math.PI * 2);

    // ショットガン等の散弾対応
    var pellets = w.pellets || 1;
    var spread = 0.16; // 散弾の広がり角（ラジアン）
    for (var p = 0; p < pellets; p++) {
      var ang = baseAng;
      if (pellets > 1) {
        ang = baseAng + (p - (pellets - 1) / 2) * spread;
      }
      bullets.push({
        x: player.x, y: player.y,
        vx: Math.cos(ang) * BULLET_SPEED,
        vy: Math.sin(ang) * BULLET_SPEED,
        r: w.bulletR,
        life: BASE_BULLET_LIFE * w.range * getEquipRangeMult(),
        damage: w.damage * dmgMult,
        color: w.color
      });
    }
  }

  // ═══════════════════════════════════════
  //  メインアップデート
  // ═══════════════════════════════════════
  function update(dt) {
    frameCount++;
    if (shakeTimer > 0) shakeTimer -= dt;
    if (flashAlpha > 0) flashAlpha -= dt * 1.5;
    if (gameState !== 'playing') return;

    survivalTime += dt;
    updateParticles(dt);
    var w = getWeapon();

    // タイマー
    if (gameMode === 'gold') {
      goldStageTimer -= dt;
      if (goldStageTimer <= 0) {
        goldStageTimer = 0;
        dieGame(); // 時間切れでクリア
        return;
      }
    } else {
      normalTimer -= dt;
      if (normalTimer <= 0) {
        normalTimer = 0;
        dieGame(true); // 3分でゲームクリア
        return;
      }
    }

    // プレイヤー移動
    var mx = 0, my = 0;
    if (pressedKeys['ArrowLeft']  || pressedKeys['KeyA']) mx -= 1;
    if (pressedKeys['ArrowRight'] || pressedKeys['KeyD']) mx += 1;
    if (pressedKeys['ArrowUp']    || pressedKeys['KeyW']) my -= 1;
    if (pressedKeys['ArrowDown']  || pressedKeys['KeyS']) my += 1;
    if (mx === 0 && my === 0) { mx = mobileDir.x; my = mobileDir.y; }
    var mag = Math.hypot(mx, my);
    if (mag > 0) {
      var spd = PLAYER_SPEED * player.speedMult * player.equipSpeedMult;
      player.x += (mx / mag) * spd * dt;
      player.y += (my / mag) * spd * dt;
    }
    player.x = clamp(player.x, PLAYER_R + 4, W - PLAYER_R - 4);
    player.y = clamp(player.y, PLAYER_R + 4, H - PLAYER_R - 4);

    // 射撃（スペースキーのみ）
    player.fireCooldown -= dt * 1000;
    var interval = (performance.now() < player.rapidUntil)
      ? BASE_COOLDOWN / w.fireRate * 0.45
      : BASE_COOLDOWN / w.fireRate;
    if (player.fireCooldown <= 0 && pressedKeys['Space']) {
      fireBullet();
      player.fireCooldown = interval;
    }

    // 弾移動
    for (var bi = bullets.length - 1; bi >= 0; bi--) {
      var b = bullets[bi];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) bullets.splice(bi, 1);
    }

    // 敵移動
    for (var ei = 0; ei < enemies.length; ei++) {
      var e = enemies[ei];
      var ea = Math.atan2(player.y - e.y, player.x - e.x);
      e.x += Math.cos(ea) * e.speed * dt;
      e.y += Math.sin(ea) * e.speed * dt;
    }

    // パワーアップ
    for (var pi = powerups.length - 1; pi >= 0; pi--) {
      powerups[pi].life -= dt;
      powerups[pi].x += Math.sin(frameCount * 0.05 + powerups[pi].r) * 0.3;
      if (powerups[pi].life <= 0) powerups.splice(pi, 1);
    }

    // コイン
    updateCoins(dt);

    // 弾 vs 敵
    for (var bi2 = bullets.length - 1; bi2 >= 0; bi2--) {
      var bu = bullets[bi2];
      for (var ei2 = enemies.length - 1; ei2 >= 0; ei2--) {
        var en = enemies[ei2];
        if (dist(bu.x, bu.y, en.x, en.y) < bu.r + en.r) {
          en.hp -= bu.damage;
          burst(bu.x, bu.y, en.color, 6);
          bullets.splice(bi2, 1);
          if (en.hp <= 0) {
            scoreVal += en.score;
            burst(en.x, en.y, en.color, 16);
            spawnCoins(en.x, en.y, en.coinDrop);
            spawnPowerup(en.x, en.y);
            enemies.splice(ei2, 1);
          }
          break;
        }
      }
    }

    // 敵 vs プレイヤー
    var now = performance.now();
    if (now >= player.invulnUntil) {
      for (var ei3 = enemies.length - 1; ei3 >= 0; ei3--) {
        var en2 = enemies[ei3];
        if (dist(player.x, player.y, en2.x, en2.y) < PLAYER_R + en2.r) {
          if (gameMode !== 'gold') {
            // チェストプレート: 被ダメージ軽減（確率でブロック）
            if (Math.random() >= getEquipArmorChance()) {
              player.hp--;
            } else {
              burst(player.x, player.y, '#4ce0ff', 10);
            }
          }
          player.invulnUntil = now + 1200;
          shakeTimer = 0.4; flashAlpha = 0.4;
          burst(player.x, player.y, '#ff5555', 14);
          enemies.splice(ei3, 1);
          if (player.hp <= 0) { dieGame(); return; }
          break;
        }
      }
    }

    // パワーアップ取得
    for (var pi2 = powerups.length - 1; pi2 >= 0; pi2--) {
      var pu = powerups[pi2];
      if (dist(player.x, player.y, pu.x, pu.y) < PLAYER_R + pu.r) {
        if (pu.type === 'heal') {
          player.hp = Math.min(getMaxHp(), player.hp + 1);
          burst(pu.x, pu.y, '#4cff6a', 12);
        } else if (pu.type === 'rapid') {
          player.rapidUntil = now + 5000;
          burst(pu.x, pu.y, '#ffd040', 12);
        } else if (pu.type === 'speed') {
          player.speedMult = 1.6;
          setTimeout(function () { player.speedMult = 1; }, 5000);
          burst(pu.x, pu.y, '#4ce0ff', 12);
        }
        powerups.splice(pi2, 1);
      }
    }

    // サポート装備: 時間でHP回復
    if (gameMode !== 'gold') {
      var regen = getEquipRegen();
      if (regen > 0) {
        if (player.hp >= getMaxHp()) {
          player.regenTimer = 60 / regen; // 満タン時はタイマーをリセット
        } else {
          player.regenTimer -= dt;
          if (player.regenTimer <= 0) {
            player.hp++;
            player.regenTimer = 60 / regen;
            burst(player.x, player.y, '#4cff6a', 6);
          }
        }
      }
    }

    // ウェーブ
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      var cnt;
      var interval;
      if (gameMode === 'gold') {
        cnt = Math.min(2 + Math.floor(waveNum / 2), 8);
        interval = Math.max(0.4, 1.5 - waveNum * 0.1);
      } else {
        cnt = Math.min(1 + Math.floor(waveNum / 2), 4);
        interval = Math.max(0.8, 2.2 - waveNum * 0.12);
      }
      for (var si = 0; si < cnt; si++) spawnEnemy();
      spawnTimer = interval;
    }
    var newWave = Math.floor(survivalTime / 12) + 1;
    if (newWave > waveNum) {
      waveNum = newWave;
      burst(player.x, player.y, '#ffd040', 20);
    }

    updateUI();
  }

  // ═══════════════════════════════════════
  //  クラシックキャラクター描画
  // ═══════════════════════════════════════

  function drawPlayerClassic() {
    var now = performance.now();
    var invuln = now < player.invulnUntil;
    if (invuln && Math.floor(now / 80) % 2 === 0) return;
    ctx.shadowColor = '#4ce0ff'; ctx.shadowBlur = 22; ctx.fillStyle = '#4ce0ff';
    ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aef4ff';
    ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_R * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a041f';
    ctx.beginPath(); ctx.arc(player.x - 4, player.y - 3, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(player.x + 4, player.y - 3, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  function drawZombieClassic(e) {
    var glowSize = gameMode === 'gold' ? 22 : 14;
    ctx.shadowColor = e.color; ctx.shadowBlur = glowSize; ctx.fillStyle = e.color;
    if (e.type === 'fast') {
      var ea = Math.atan2(player.y - e.y, player.x - e.x);
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(ea) * e.r, e.y + Math.sin(ea) * e.r);
      ctx.lineTo(e.x + Math.cos(ea + 2.4) * e.r, e.y + Math.sin(ea + 2.4) * e.r);
      ctx.lineTo(e.x + Math.cos(ea - 2.4) * e.r, e.y + Math.sin(ea - 2.4) * e.r);
      ctx.closePath(); ctx.fill();
    } else if (e.type === 'tank') {
      ctx.save(); ctx.translate(e.x, e.y);
      ctx.rotate(Math.atan2(player.y - e.y, player.x - e.x));
      ctx.fillRect(-e.r, -e.r, e.r * 2, e.r * 2);
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawPlayerNeon() {
    var now = performance.now();
    var invuln = now < player.invulnUntil;
    if (invuln && Math.floor(now / 80) % 2 === 0) return;

    var aimAng = -Math.PI / 2;
    var best = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var d = dist(player.x, player.y, enemies[i].x, enemies[i].y);
      if (d < best) { best = d; aimAng = Math.atan2(enemies[i].y - player.y, enemies[i].x - player.x); }
    }

    var moving = pressedKeys['ArrowLeft'] || pressedKeys['ArrowRight'] || pressedKeys['ArrowUp'] || pressedKeys['ArrowDown'] ||
                 pressedKeys['KeyA'] || pressedKeys['KeyD'] || pressedKeys['KeyW'] || pressedKeys['KeyS'] ||
                 mobileDir.x !== 0 || mobileDir.y !== 0;
    var walkPhase = frameCount * (moving ? 0.4 : 0.15);
    var bob = Math.sin(walkPhase) * (moving ? 3 : 1);

    ctx.save();
    ctx.translate(player.x, player.y + bob);
    ctx.rotate(aimAng);

    ctx.shadowColor = '#ff4fd8';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff4fd8';
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(6, -12, 10, 10);
    ctx.fillStyle = '#ffd9b3';
    ctx.beginPath(); ctx.arc(0, -8, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4ef2ff';
    ctx.beginPath(); ctx.ellipse(-3, -8, 2.2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, -8, 2.2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-2.6, -8.8, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.4, -8.8, 0.8, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#ff8ae6';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-9, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(9, -6); ctx.stroke();

    ctx.restore();
  }

  function drawZombieNeon(e) {
    var ang = Math.atan2(player.y - e.y, player.x - e.x);
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(ang);

    var glow = ctx.createRadialGradient(0, 0, 2, 0, 0, e.r * 2.6);
    glow.addColorStop(0, '#7ef9ff55');
    glow.addColorStop(1, '#00000000');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, e.r * 2.6, 0, Math.PI * 2); ctx.fill();

    if (e.type === 'fast') {
      ctx.fillStyle = '#7ef9ff';
      ctx.beginPath(); ctx.moveTo(0, -e.r); ctx.lineTo(e.r, 0); ctx.lineTo(0, e.r); ctx.lineTo(-e.r, 0); ctx.closePath(); ctx.fill();
    } else if (e.type === 'tank') {
      ctx.fillStyle = '#ffb84d';
      ctx.fillRect(-e.r, -e.r, e.r * 2, e.r * 2);
    } else {
      ctx.fillStyle = '#ff4fd8';
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2d1238';
      ctx.beginPath(); ctx.arc(-3, -2, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -2, 2.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  // ═══════════════════════════════════════
  //  アニメ風キャラクター描画
  // ═══════════════════════════════════════

  // プレイヤー（アニメ風ヒーロー）
  function drawPlayer() {
    var now = performance.now();
    var invuln = now < player.invulnUntil;
    if (invuln && Math.floor(now / 80) % 2 === 0) return;

    // 照準方向（一番近い敵）
    var aimAng = -Math.PI / 2;
    var best = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var d = dist(player.x, player.y, enemies[i].x, enemies[i].y);
      if (d < best) { best = d; aimAng = Math.atan2(enemies[i].y - player.y, enemies[i].x - player.x); }
    }

    // 移動中かどうか
    var moving = pressedKeys['ArrowLeft'] || pressedKeys['ArrowRight'] || pressedKeys['ArrowUp'] || pressedKeys['ArrowDown'] ||
                 pressedKeys['KeyA'] || pressedKeys['KeyD'] || pressedKeys['KeyW'] || pressedKeys['KeyS'] ||
                 mobileDir.x !== 0 || mobileDir.y !== 0;
    var walkPhase = frameCount * (moving ? 0.35 : 0.12);
    var bob = Math.sin(walkPhase) * (moving ? 2 : 1);
    var swing = Math.sin(walkPhase) * (moving ? 3.5 : 1.5);

    ctx.save();
    ctx.translate(player.x, player.y + bob);
    ctx.rotate(aimAng);
    ctx.scale(1.15, 1.15);

    // ネオンのオーラ
    ctx.shadowColor = '#4ce0ff'; ctx.shadowBlur = 14;

    // 影
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0, 14, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();

    // 脚
    ctx.strokeStyle = '#2b2b4d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-4 + swing, 13); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(4 - swing, 13); ctx.stroke();

    // 体（青いジャケット）
    ctx.fillStyle = '#2f6fd6';
    ctx.strokeStyle = '#16305e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 1, 8.5, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // ジャケットのハイライト
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.beginPath(); ctx.ellipse(-2, -2, 3, 4, 0.3, 0, Math.PI * 2); ctx.fill();

    // 腕（前方へ）
    ctx.strokeStyle = '#2f6fd6'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-9, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(9, -6); ctx.stroke();
    // 手
    ctx.fillStyle = '#ffd9b3';
    ctx.beginPath(); ctx.arc(-9, -6, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -6, 2.2, 0, Math.PI * 2); ctx.fill();

    // 銃（前方へ）
    ctx.fillStyle = '#3a3a5a';
    ctx.strokeStyle = '#1a1a2a'; ctx.lineWidth = 1.5;
    ctx.fillRect(7, -14, 4, 11);
    ctx.strokeRect(7, -14, 4, 11);

    // 頭
    ctx.fillStyle = '#ffd9b3';
    ctx.strokeStyle = '#3a2a5a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -8, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 髪（アニメ風ツンツン）
    ctx.fillStyle = '#3a2a5a';
    ctx.beginPath();
    ctx.moveTo(-7.5, -9);
    ctx.lineTo(-7, -16);
    ctx.lineTo(-4, -13);
    ctx.lineTo(-2, -18);
    ctx.lineTo(1, -13);
    ctx.lineTo(4, -17);
    ctx.lineTo(6, -12);
    ctx.lineTo(7.5, -9);
    ctx.closePath();
    ctx.fill();

    // 目（アニメ風の大きな目）
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(-3, -8, 2.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, -8, 2.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a3a';
    ctx.beginPath(); ctx.arc(-3, -8, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, -8, 1.5, 0, Math.PI * 2); ctx.fill();
    // ハイライト
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-2.4, -8.8, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.6, -8.8, 0.7, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // ゾンビ共通：向きを合わせて描画
  function drawZombie(e) {
    var ang = Math.atan2(player.y - e.y, player.x - e.x);
    ctx.save();
    ctx.translate(e.x, e.y);
    // ネオンのオーラ
    var auraR = e.r * 2.4;
    var aura = ctx.createRadialGradient(0, 0, 2, 0, 0, auraR);
    aura.addColorStop(0, e.color + '66');
    aura.addColorStop(1, e.color + '00');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, auraR, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(ang);
    if (e.type === 'fast') drawZombieBlue(e);
    else if (e.type === 'tank') drawZombieFat(e);
    else drawZombieNormal(e);
    ctx.restore();
  }

  // 普通のゾンビ（丸）
  function drawZombieNormal(e) {
    var gold = gameMode === 'gold';
    var skin = gold ? '#ffd040' : '#7fb069';
    var skinDark = gold ? '#c98f1a' : '#4a6a2a';
    var cloth = gold ? '#b8860b' : '#5a4a3a';
    var clothDark = gold ? '#8a6a1a' : '#3a2a2a';
    var hair = gold ? '#8a6a1a' : '#3a3a2a';
    var eye = gold ? '#ff5a5a' : '#ff2a2a';

    var bob = Math.sin(frameCount * 0.2 + e.x) * 1.5;
    ctx.translate(0, bob);

    // 影
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(0, 13, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

    // 脚（よろよろ）
    ctx.strokeStyle = clothDark; ctx.lineWidth = 4; ctx.lineCap = 'round';
    var swing = Math.sin(frameCount * 0.2 + e.x) * 3;
    ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-4 + swing, 13); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(4 - swing, 13); ctx.stroke();

    // 体（ボロボロの服）
    ctx.fillStyle = cloth;
    ctx.strokeStyle = clothDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 1, 8, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 服の破れ
    ctx.fillStyle = skinDark;
    ctx.beginPath(); ctx.ellipse(0, 3, 5, 4, 0, 0, Math.PI * 2); ctx.fill();

    // 腕（前方に伸ばす）
    ctx.strokeStyle = skin; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-11, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(11, -2); ctx.stroke();
    // 手
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(-11, -2, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -2, 2.2, 0, Math.PI * 2); ctx.fill();

    // 頭
    ctx.fillStyle = skin;
    ctx.strokeStyle = skinDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -8, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 髪（ボサボサ）
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-7, -9);
    ctx.lineTo(-6, -15);
    ctx.lineTo(-3, -12);
    ctx.lineTo(0, -16);
    ctx.lineTo(3, -12);
    ctx.lineTo(6, -14);
    ctx.lineTo(7, -9);
    ctx.closePath();
    ctx.fill();

    // 目（血走った目）
    ctx.fillStyle = '#ffd9b3';
    ctx.beginPath(); ctx.ellipse(-3, -8, 2.4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, -8, 2.4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = eye;
    ctx.beginPath(); ctx.arc(-3, -8, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, -8, 1.3, 0, Math.PI * 2); ctx.fill();

    // 口（ギザギザ）
    ctx.strokeStyle = skinDark; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(3, -4); ctx.stroke();
  }

  // 青色のゾンビ（三角・速い）
  function drawZombieBlue(e) {
    var gold = gameMode === 'gold';
    var skin = gold ? '#ffd040' : '#5a9bd4';
    var skinDark = gold ? '#c98f1a' : '#1a3a5a';
    var cloth = gold ? '#b8860b' : '#2a4a7a';
    var clothDark = gold ? '#8a6a1a' : '#1a2a4a';
    var hair = gold ? '#8a6a1a' : '#2a4a7a';
    var eye = gold ? '#ff5a5a' : '#aef4ff';

    var bob = Math.sin(frameCount * 0.35 + e.x) * 2;
    ctx.translate(0, bob);

    // 影
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(0, 12, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();

    // 脚（速いので動きが大きい）
    ctx.strokeStyle = clothDark; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    var swing = Math.sin(frameCount * 0.35 + e.x) * 4;
    ctx.beginPath(); ctx.moveTo(-3.5, 5); ctx.lineTo(-3.5 + swing, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3.5, 5); ctx.lineTo(3.5 - swing, 12); ctx.stroke();

    // 体（細身・青い肌）
    ctx.fillStyle = cloth;
    ctx.strokeStyle = clothDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0.5, 6.5, 7.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 腕
    ctx.strokeStyle = skin; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-5.5, 0); ctx.lineTo(-9, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5.5, 0); ctx.lineTo(9, -3); ctx.stroke();
    // 手
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(-9, -3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -3, 2, 0, Math.PI * 2); ctx.fill();

    // 頭
    ctx.fillStyle = skin;
    ctx.strokeStyle = skinDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -7, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 髪（三角っぽいツンツン）
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-6.5, -8);
    ctx.lineTo(-5, -15);
    ctx.lineTo(-2, -11);
    ctx.lineTo(0, -17);
    ctx.lineTo(2, -11);
    ctx.lineTo(5, -15);
    ctx.lineTo(6.5, -8);
    ctx.closePath();
    ctx.fill();

    // 目（光る青い目）
    ctx.fillStyle = eye;
    ctx.beginPath(); ctx.ellipse(-2.5, -7, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(2.5, -7, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinDark;
    ctx.beginPath(); ctx.arc(-2.5, -7, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.5, -7, 1, 0, Math.PI * 2); ctx.fill();
  }

  // デブゾンビ（四角・タンク）
  function drawZombieFat(e) {
    var gold = gameMode === 'gold';
    var skin = gold ? '#ffd040' : '#a06bd4';
    var skinDark = gold ? '#c98f1a' : '#3a1a5a';
    var cloth = gold ? '#b8860b' : '#4a2a6a';
    var clothDark = gold ? '#8a6a1a' : '#2a1a3a';
    var hair = gold ? '#8a6a1a' : '#4a3a5a';
    var eye = gold ? '#ff5a5a' : '#ff5a5a';

    var bob = Math.sin(frameCount * 0.15 + e.x) * 1;
    ctx.translate(0, bob);

    // 影（大きい）
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0, 15, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

    // 脚（太い）
    ctx.strokeStyle = clothDark; ctx.lineWidth = 6; ctx.lineCap = 'round';
    var swing = Math.sin(frameCount * 0.15 + e.x) * 2;
    ctx.beginPath(); ctx.moveTo(-6, 7); ctx.lineTo(-6 + swing, 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 7); ctx.lineTo(6 - swing, 15); ctx.stroke();

    // 体（デブ・紫の肌）
    ctx.fillStyle = cloth;
    ctx.strokeStyle = clothDark; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 2, 12, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // お腹
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(0, 5, 8, 6, 0, 0, Math.PI * 2); ctx.fill();

    // 腕（太い）
    ctx.strokeStyle = skin; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 1); ctx.lineTo(-13, -1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 1); ctx.lineTo(13, -1); ctx.stroke();
    // 手
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(-13, -1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -1, 3, 0, Math.PI * 2); ctx.fill();

    // 頭（小さい）
    ctx.fillStyle = skin;
    ctx.strokeStyle = skinDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 髪（薄い）
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(-4, -13);
    ctx.lineTo(-1, -11);
    ctx.lineTo(2, -14);
    ctx.lineTo(5, -11);
    ctx.lineTo(6, -9);
    ctx.closePath();
    ctx.fill();

    // 目（小さく怒った目）
    ctx.fillStyle = '#ffd9b3';
    ctx.beginPath(); ctx.ellipse(-2.5, -8, 2, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(2.5, -8, 2, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = eye;
    ctx.beginPath(); ctx.arc(-2.5, -8, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.5, -8, 1.2, 0, Math.PI * 2); ctx.fill();

    // 口（怒った口）
    ctx.strokeStyle = skinDark; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2.5, -4.5); ctx.lineTo(2.5, -4.5); ctx.stroke();
  }

  // ═══════════════════════════════════════
  //  描画
  // ═══════════════════════════════════════
  function draw() {
    if (gameState !== 'playing' && gameState !== 'dead') {
      // ホーム / ショップではキャンバス描画なし
      return;
    }

    ctx.save();

    // 画面揺れ
    if (shakeTimer > 0) {
      var intensity = shakeTimer * 14;
      ctx.translate(rand(-intensity, intensity), rand(-intensity, intensity));
    }

    // 背景
    var bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.75);
    if (gameMode === 'gold') {
      bgGrad.addColorStop(0, '#1a1200');
      bgGrad.addColorStop(1, '#0a0800');
    } else {
      bgGrad.addColorStop(0, '#120a24');
      bgGrad.addColorStop(1, '#060310');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // グリッド
    ctx.strokeStyle = gameMode === 'gold' ? 'rgba(255,200,60,.07)' : 'rgba(140,80,255,.07)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (var gy = 0; gy <= H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    // パワーアップ
    for (var pi = 0; pi < powerups.length; pi++) {
      var p = powerups[pi];
      var pulse = 1 + Math.sin(frameCount * 0.1 + p.r) * 0.15;
      var pColor = p.type === 'heal' ? '#4cff6a' : p.type === 'rapid' ? '#ffd040' : '#4ce0ff';
      ctx.shadowColor = pColor; ctx.shadowBlur = 16; ctx.fillStyle = pColor;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0a041f'; ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'heal' ? '+' : p.type === 'rapid' ? 'R' : 'S', p.x, p.y + 1);
    }

    // コイン
    drawCoins();

    // 敵
    for (var ei = 0; ei < enemies.length; ei++) {
      var e = enemies[ei];
      if (skinStyle === 'anime') drawZombie(e);
      else if (skinStyle === 'classic') drawZombieClassic(e);
      else drawZombieNeon(e);
      // タンクHPバー
      if (e.type === 'tank' && e.hp < e.maxHp) {
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(e.x - e.r, e.y - e.r - 8, e.r * 2, 4);
        ctx.fillStyle = '#ff6a6a';
        ctx.fillRect(e.x - e.r, e.y - e.r - 8, e.r * 2 * (e.hp / e.maxHp), 4);
      }
    }

    // 弾
    for (var bi = 0; bi < bullets.length; bi++) {
      var b = bullets[bi];
      ctx.shadowColor = b.color; ctx.shadowBlur = 12; ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // プレイヤー
    if (skinStyle === 'anime') drawPlayer();
    else if (skinStyle === 'classic') drawPlayerClassic();
    else drawPlayerNeon();

    // パーティクル
    for (var ppi = 0; ppi < particles.length; ppi++) {
      var pp = particles[ppi];
      var alpha = clamp(pp.life / pp.maxLife, 0, 1);
      ctx.globalAlpha = alpha; ctx.fillStyle = pp.color;
      ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.size * alpha, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ダメージフラッシュ
    if (flashAlpha > 0) {
      ctx.fillStyle = 'rgba(255,60,60,' + clamp(flashAlpha, 0, 0.5) + ')';
      ctx.fillRect(-20, -20, W + 40, H + 40);
    }

    ctx.restore();
  }

  // ═══════════════════════════════════════
  //  UI 更新
  // ═══════════════════════════════════════
  function updateUI() {
    ui_score.textContent = scoreVal;
    ui_wave.textContent = waveNum;
    ui_hiscore.textContent = highScore;
    ui_gold.textContent = gold;
    if (gameMode === 'gold') {
      ui_hp.innerHTML = '<div class="hp-seg full infinite">∞</div>';
      timerEl.classList.add('gold-timer');
      timerEl.classList.remove('normal-timer');
      var timeLeft = Math.ceil(goldStageTimer);
      timerEl.textContent = timeLeft;
      timerEl.classList.toggle('urgent', timeLeft <= 10);
    } else {
      timerEl.classList.remove('gold-timer');
      timerEl.classList.add('normal-timer');
      var timeLeft = Math.ceil(normalTimer);
      timerEl.textContent = timeLeft;
      timerEl.classList.toggle('urgent', timeLeft <= 10);
      var maxHp = getMaxHp();
      var html = '';
      for (var i = 0; i < maxHp; i++) {
        html += '<div class="hp-seg' + (i < player.hp ? ' full' : '') + '"></div>';
      }
      ui_hp.innerHTML = html;
    }
  }

  // ═══════════════════════════════════════
  //  ループ & 初期化
  // ═══════════════════════════════════════
  function loop(timestamp) {
    var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // イベント
  shopBtn.addEventListener('click', goToShop);
  homeStartBtn.addEventListener('click', goToGame);
  goldStageBtn.addEventListener('click', goToGoldStage);
  shopBackBtn.addEventListener('click', goToHome);
  gameHomeBtn.addEventListener('click', goToHome);
  gameOverBtn.addEventListener('click', goToHome);
  gachaBtn.addEventListener('click', function () { pullGacha(1); });
  gachaBtn10.addEventListener('click', function () { pullGacha(10); });
  codeBtn.addEventListener('click', redeemCode);
  codeInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') redeemCode(); });
  adminGoldSetBtn.addEventListener('click', adminSetGold);
  adminUnlockWeaponsBtn.addEventListener('click', adminUnlockWeapons);
  adminUnlockEquipBtn.addEventListener('click', adminUnlockEquip);
  adminCloseBtn.addEventListener('click', closeAdminPanel);
  skinBtn.addEventListener('click', toggleSkin);
  gachaCloseBtn.addEventListener('click', closeGacha);
  equipBtn.addEventListener('click', goToEquip);
  equipBackBtn.addEventListener('click', goToHome);
  resetBtn.addEventListener('click', function () {
    if (!confirm('すべてのデータをリセットしますか？\n（ゴールド・武器・ハイスコア・装備）')) return;
    localStorage.removeItem('survivalGold');
    localStorage.removeItem('survivalWeapons');
    localStorage.removeItem('survivalEquipped');
    localStorage.removeItem('survivalHigh');
    localStorage.removeItem('survivalEquipOwned');
    localStorage.removeItem('survivalEquipEquipped');
    localStorage.removeItem('survivalGoldFreeUsed');
    localStorage.removeItem('survivalCodes');
    localStorage.removeItem('survivalSkin');
    gold = 0;
    ownedWeapons = ['pistol'];
    equippedId = 'pistol';
    highScore = 0;
    ownedEquipment = [];
    equippedEquipment = {};
    goldFreeUsed = false;
    goldFreeSession = false;
    usedCodes = [];
    skinStyle = 'anime';
    skinBtn.textContent = 'アニメ';
    updateHomeUI();
  });

  // 初期表示
  showScreen('home');
  updateHomeUI();

  requestAnimationFrame(function (ts) {
    lastTime = ts;
    loop(ts);
  });

  skinBtn.textContent = getSkinLabel();

})();
