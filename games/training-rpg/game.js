(() => {
  "use strict";

  const canvas = document.getElementById("world");
  const ctx = canvas.getContext("2d");
  const worldColumn = canvas.closest(".world-column");
  const miniMapCanvas = document.getElementById("miniMap");
  const miniMapCtx = miniMapCanvas.getContext("2d");
  const dialogLayer = document.getElementById("dialogLayer");
  const dialogCard = document.getElementById("dialogCard");
  const toast = document.getElementById("toast");
  const characterSelect = document.getElementById("characterSelect");
  const characterChoices = document.getElementById("characterChoices");
  const encounterOverlay = document.getElementById("encounterOverlay");
  const castleVictoryOverlay = document.getElementById("castleVictoryOverlay");
  const castleVictoryTitle = document.getElementById("castleVictoryTitle");
  const SAVE_SLOT_ID = window.TrainingRpgActiveSlotId || "slot-1";
  const START_NEW_GAME = window.TrainingRpgStartNew === true;
  const WORLD = { width: 4100, height: 3200 };
  const MAGIC_GATE = { x: WORLD.width / 2, y: WORLD.height / 2 };
  const MAX_LEVEL = 100;
  const MAIN_CASTLE_COUNT = 5;
  const REALM_CASTLE_COUNT = 5;
  const FINAL_CASTLE_INDEX = MAIN_CASTLE_COUNT + REALM_CASTLE_COUNT;
  const BOSS_REALM = { width: 2600, height: 1800, gate: { x: 180, y: 1550 }, town: { x: 400, y: 1450 } };
  const DUNGEON = { width: 900, height: 600, roomNames: ["仕掛けの間", "石の回廊", "守護者の回廊", "ボスの間"] };
  const CASTLES = [
    { id: "green", name: "みどりの古城", x: 3570, y: 2630, mechanic: "runes", hint: "紋章を左・右・中央の順に調べよう", ability: { id: "forest-heal", name: "森のいやし", emoji: "🍃", description: "こうげきのたびにHPを4回復する。" }, boss: { name: "グランガード", emoji: "🦁", level: 12, hp: 190, attack: 18, xp: 190, gold: 180 } },
    { id: "tide", name: "みなもの水城", x: 2320, y: 680, mechanic: "boulder", hint: "大岩を押して床のスイッチに乗せよう", ability: { id: "tide-guard", name: "潮の結界", emoji: "🌊", description: "受けるダメージを3減らす。" }, boss: { name: "アクアドラ", emoji: "🐉", level: 16, hp: 250, attack: 22, xp: 260, gold: 240 } },
    { id: "ember", name: "ほのおの城", x: 1980, y: 1650, mechanic: "bells", hint: "鐘を右・左・中央の順に鳴らそう", ability: { id: "flame-power", name: "炎のちから", emoji: "🔥", description: "こうげきダメージが4増える。" }, boss: { name: "フレアライオン", emoji: "🦁", level: 20, hp: 320, attack: 26, xp: 330, gold: 300 } },
    { id: "sky", name: "かぜの天空城", x: 720, y: 1910, mechanic: "levers", hint: "3つのレバーを石碑の模様と同じにしよう", ability: { id: "wind-step", name: "風の身かわし", emoji: "💨", description: "20%の確率で相手の攻撃をよける。" }, boss: { name: "テンペスト", emoji: "🦅", level: 24, hp: 395, attack: 30, xp: 420, gold: 370 } },
    { id: "moon", name: "月影の鏡城", x: 3540, y: 500, mechanic: "mirrors", hint: "鏡を回して光の道を出口までつなごう", ability: { id: "moon-mirror", name: "月影の鏡", emoji: "🌙", description: "とくぎのダメージが25%増える。" }, boss: { name: "ルナミラージュ", emoji: "🦄", level: 28, hp: 480, attack: 34, xp: 520, gold: 450 } },
    { id: "abyss", name: "深淵の城", x: 540, y: 350, world: "boss", mechanic: "prisms", hint: "深淵の結晶を青・紫・白の順に調べよう", ability: { id: "abyss-strike", name: "深淵の一撃", emoji: "🌑", description: "攻撃ダメージが6増える。" }, boss: { name: "アビスロード", emoji: "🐙", level: 32, hp: 540, attack: 38, xp: 600, gold: 520 } },
    { id: "iron", name: "鋼鉄の城", x: 2200, y: 450, world: "boss", mechanic: "torches", hint: "たいまつを「消・点・点」にしよう", ability: { id: "iron-wall", name: "鉄壁の守り", emoji: "🛡️", description: "受けるダメージを4減らす。" }, boss: { name: "アイアンキング", emoji: "🤖", level: 36, hp: 610, attack: 42, xp: 680, gold: 590 } },
    { id: "storm", name: "雷鳴の城", x: 700, y: 1030, world: "boss", mechanic: "orbs", hint: "雷の球を左・中央・右の順に調べよう", ability: { id: "storm-surge", name: "雷鳴の力", emoji: "⚡", description: "すべての攻撃ダメージが15%増える。" }, boss: { name: "サンダーロード", emoji: "🐲", level: 40, hp: 690, attack: 46, xp: 760, gold: 660 } },
    { id: "crystal", name: "水晶の城", x: 2050, y: 1320, world: "boss", mechanic: "constellation", hint: "水晶の向きを「左・上・下」に合わせよう", ability: { id: "crystal-heart", name: "水晶の心", emoji: "💎", description: "最大HPが25増える。" }, boss: { name: "クリスタルクイーン", emoji: "🦋", level: 44, hp: 780, attack: 50, xp: 850, gold: 740 } },
    { id: "eclipse", name: "日蝕の城", x: 1320, y: 260, world: "boss", mechanic: "chimes", hint: "日蝕の鐘を右・中央・左の順に鳴らそう", ability: { id: "eclipse-drain", name: "日蝕の吸収", emoji: "🌘", description: "とくぎを使うとHPを10回復する。" }, boss: { name: "エクリプスドラゴン", emoji: "🐉", level: 48, hp: 880, attack: 55, xp: 1000, gold: 850 } },
    { id: "overlord", name: "魔王の城", x: BOSS_REALM.width / 2, y: BOSS_REALM.height / 2, world: "boss", final: true, mechanic: "final", hint: "10種類すべての仕掛けを突破して、魔王の間へ進もう", ability: null, boss: { name: "魔王のマジモン", emoji: "👿", level: 100, hp: 1800, attack: 78, xp: 2500, gold: 2500 } }
  ].map((castle) => ({ ...castle, boss: { ...castle.boss, monster: castle.boss.name, id: `${castle.id}-boss`, kind: "boss" } }));
  const FINAL_GIMMICKS = [
    { id: "runes", name: "紋章", hint: "紋章を左・右・中央の順に調べよう" },
    { id: "boulder", name: "大岩", hint: "大岩を押して床のスイッチに乗せよう" },
    { id: "bells", name: "鐘", hint: "鐘を右・左・中央の順に鳴らそう" },
    { id: "levers", name: "レバー", hint: "3つのレバーを ON・OFF・ON にしよう" },
    { id: "mirrors", name: "鏡", hint: "鏡を回して光の道を出口までつなごう" },
    { id: "prisms", name: "結晶", hint: "結晶を青・紫・白の順に調べよう" },
    { id: "torches", name: "たいまつ", hint: "たいまつを「消・点・点」にしよう" },
    { id: "orbs", name: "雷の球", hint: "雷の球を左・中央・右の順に調べよう" },
    { id: "constellation", name: "星座の水晶", hint: "水晶の向きを「左・上・下」に合わせよう" },
    { id: "chimes", name: "日蝕の鐘", hint: "鐘を右・中央・左の順に鳴らそう" }
  ];
  const characters = [
    { id: "goro", name: "ゴロー", emoji: "🐕", role: "たいりょく自慢", description: "元気いっぱいの犬。体力が高く、長く戦える。", hp: 50, attack: 10, defense: 5, color: "#fff0d9", evolutions: [
      { level: 10, name: "ゴロウル", emoji: "🐺", role: "たくましいオオカミ", hp: 85, attack: 16, defense: 12, color: "#e9e4d7" },
      { level: 30, name: "ゴロガード", emoji: "🦁", role: "百獣の守り手", hp: 130, attack: 25, defense: 20, color: "#f5e4ad" }
    ] },
    { id: "waniru", name: "ワニール", emoji: "🐊", role: "こうげき自慢", description: "力持ちのワニ。攻撃力が高く、大ダメージ。", hp: 10, attack: 20, defense: 5, color: "#e5f1d9", evolutions: [
      { level: 10, name: "ワニザウル", emoji: "🐲", role: "きょうりゅうの大アゴ", hp: 55, attack: 34, defense: 12, color: "#d8ebcf" },
      { level: 30, name: "ワニキング", emoji: "🐉", role: "水辺の王者", hp: 95, attack: 50, defense: 22, color: "#c5e1c4" }
    ] },
    { id: "kametaro", name: "カメタロウ", emoji: "🐢", role: "ぼうぎょ自慢", description: "がんじょうな亀。防御力が高く、ダメージを抑える。", hp: 23, attack: 10, defense: 20, color: "#e2f0e2", evolutions: [
      { level: 10, name: "カメガメ", emoji: "🐢", role: "大地の甲羅", hp: 60, attack: 16, defense: 38, color: "#d7ebd8" },
      { level: 30, name: "カメダイオ", emoji: "🐉", role: "不落の守護竜", hp: 105, attack: 26, defense: 58, color: "#c5e4d0" }
    ] }
  ];
  const towns = [
    { id: "midori", name: "みどり町", icon: "🏡", x: 420, y: 430, color: "#b9d89f", shop: "こもれび商店", greeting: "森のめぐみがいっぱいの町。", items: ["potion", "captureBall", "experience", "leaf"] },
    { id: "minato", name: "みなと町", icon: "⛵", x: 1690, y: 390, color: "#a9d8d1", shop: "うみかぜマート", greeting: "海の風と、元気が出るおみせ。", items: ["potion", "captureBall", "experience", "tide"] },
    { id: "akari", name: "あかり町", icon: "🏮", x: 1190, y: 1280, color: "#edc396", shop: "ほのおの道具屋", greeting: "ちょっぴりあったかい温泉の町。", items: ["potion", "captureBall", "experience", "ember"] },
    { id: "hoshi", name: "ほしぞら町", icon: "🌠", x: 3180, y: 500, color: "#c5b7df", shop: "ほしあかり雑貨店", greeting: "星がよく見える静かな町。夜のおさんぽにぴったり。", items: ["potion", "captureBall", "experience", "stardust"] },
    { id: "kazehama", name: "かぜはま町", icon: "💨", x: 3700, y: 1080, color: "#a9cfce", shop: "そよかぜ道具店", greeting: "高台から海風が吹きぬける町。", items: ["potion", "captureBall", "experience", "feather"] },
    { id: "sangosho", name: "さんご町", icon: "🐚", x: 3360, y: 1870, color: "#e7b4a9", shop: "さんごの市場", greeting: "色とりどりの貝がらが見つかる海辺の町。", items: ["potion", "captureBall", "experience", "coral"] },
    { id: "tsuki", name: "つきみ町", icon: "🌙", x: 2560, y: 2810, color: "#b7c8e3", shop: "おつきさま商会", greeting: "湖に月が映る、ゆったりした町。", items: ["potion", "captureBall", "experience", "moon"] },
    { id: "soramachi", name: "そらまち", icon: "☁️", x: 1520, y: 2470, color: "#b3d4e5", shop: "そらいろストア", greeting: "高原のお花と、澄んだ空が自慢の町。", items: ["potion", "captureBall", "experience", "cloud"] },
    { id: "yukiyama", name: "ゆきやま町", icon: "❄️", x: 420, y: 2320, color: "#c9d9e8", shop: "ゆきだるま商店", greeting: "雪景色のきれいな山あいの町。あたたかくしてね。", items: ["potion", "captureBall", "experience", "snow"] },
    { id: "kinoko", name: "きのこの里", icon: "🍄", x: 560, y: 1510, color: "#d4c49e", shop: "きのこ薬舗", greeting: "森のめぐみを使った、ふしぎな道具がいっぱい。", items: ["potion", "captureBall", "experience", "mushroom"] }
  ];
  const products = {
    potion: { name: "きずぐすり", emoji: "🧪", price: 18, description: "バトル中、自分のHPを20回復。" },
    captureBall: { name: "ゲットボール", emoji: "🔴", price: 20, description: "野生モンスターを捕まえる道具。弱らせると成功しやすい。" },
    experience: { name: "まなびのノート", emoji: "📘", price: 24, description: "使うと経験値を20獲得。いくつでも買えるよ。" },
    leaf: { name: "わかばのおまもり", emoji: "🍀", price: 35, description: "次のバトルの攻撃力がアップ。みどり町限定。", attackBonus: 7, defenseBonus: 0 },
    tide: { name: "しおかぜチャーム", emoji: "🐚", price: 35, description: "次のバトルで受けるダメージを軽減。みなと町限定。", attackBonus: 0, defenseBonus: 3 },
    ember: { name: "ほのおのバッジ", emoji: "🔥", price: 35, description: "次のバトルで攻撃力と防御力がアップ。あかり町限定。", attackBonus: 7, defenseBonus: 3 },
    stardust: { name: "星くずのペンダント", emoji: "🌟", price: 42, description: "次のバトルの攻撃力が大きくアップ。", attackBonus: 11, defenseBonus: 0 },
    feather: { name: "そよかぜの羽", emoji: "🪶", price: 38, description: "次のバトルで受けるダメージを軽減。", attackBonus: 0, defenseBonus: 5 },
    coral: { name: "さんごのブローチ", emoji: "🪸", price: 44, description: "次のバトルで攻撃力と防御力がアップ。", attackBonus: 6, defenseBonus: 3 },
    moon: { name: "月光のおまもり", emoji: "🌙", price: 46, description: "次のバトルの攻撃力が大きくアップ。", attackBonus: 12, defenseBonus: 0 },
    cloud: { name: "雲のクッション", emoji: "☁️", price: 40, description: "次のバトルで受けるダメージを軽減。", attackBonus: 0, defenseBonus: 6 },
    snow: { name: "ゆきやまマフラー", emoji: "🧣", price: 45, description: "次のバトルで攻撃力と防御力がアップ。", attackBonus: 5, defenseBonus: 5 },
    mushroom: { name: "きのこのおまもり", emoji: "🍄", price: 42, description: "次のバトルの攻撃力と防御力がアップ。", attackBonus: 7, defenseBonus: 2 }
  };
  const bossTown = { id: "bossTown", name: "ボスマジモン町", icon: "🌌", x: BOSS_REALM.town.x, y: BOSS_REALM.town.y, color: "#b7a3d8", shop: "ゲート商会", greeting: "異世界の力を秘めた道具がそろっている。", items: ["potion", "captureBall", "experience", "stardust", "cloud", "moon"] };
  const trainers = [
    { id: "hana", name: "はな", title: "おはなトレーナー", monster: "ミツバ", emoji: "🐰", level: 2, hp: 34, attack: 7, xp: 24, gold: 26, x: 650, y: 555, color: "#dc8fa6" },
    { id: "kai", name: "カイ", title: "うみべのトレーナー", monster: "アワン", emoji: "🦦", level: 3, hp: 43, attack: 8, xp: 34, gold: 38, x: 1480, y: 535, color: "#72aab2" },
    { id: "renga", name: "レンガ", title: "やまみちトレーナー", monster: "ポカリ", emoji: "🐻", level: 4, hp: 53, attack: 10, xp: 46, gold: 52, x: 945, y: 1090, color: "#c78057" },
    { id: "yui", name: "ユイ", title: "ほしぞらトレーナー", monster: "キラリン", emoji: "🦉", level: 5, hp: 60, attack: 10, xp: 52, gold: 58, x: 2840, y: 700, color: "#8a79ad" },
    { id: "toma", name: "トウマ", title: "ゆきやまトレーナー", monster: "ユキポン", emoji: "🐧", level: 6, hp: 68, attack: 11, xp: 60, gold: 64, x: 820, y: 2200, color: "#739ab4" },
    { id: "nagi", name: "ナギ", title: "さんごトレーナー", monster: "サンゴン", emoji: "🦀", level: 7, hp: 76, attack: 12, xp: 68, gold: 72, x: 3050, y: 1830, color: "#cb7c69" },
    { id: "suzu", name: "スズ", title: "つきみトレーナー", monster: "ルナモ", emoji: "🐱", level: 8, hp: 86, attack: 13, xp: 78, gold: 82, x: 2220, y: 2660, color: "#8491bf" }
  ];
  const patches = [
    { id: "meadow", x: 835, y: 680, monster: "ハネッコ", emoji: "🐤", level: 1, hp: 25, attack: 5, xp: 13, gold: 8, kind: "wild" },
    { id: "woods", x: 1130, y: 570, monster: "モリモン", emoji: "🦝", level: 2, hp: 33, attack: 7, xp: 18, gold: 11, kind: "wild" },
    { id: "shore", x: 1780, y: 740, monster: "ぷかり", emoji: "🐸", level: 3, hp: 40, attack: 8, xp: 24, gold: 14, kind: "wild" },
    { id: "hills", x: 1360, y: 1050, monster: "コロガル", emoji: "🦔", level: 4, hp: 50, attack: 10, xp: 31, gold: 17, kind: "wild" },
    { id: "south", x: 500, y: 1120, monster: "モコリン", emoji: "🐑", level: 2, hp: 32, attack: 6, xp: 17, gold: 10, kind: "wild" },
    { id: "starlight", x: 2780, y: 540, monster: "キラボシ", emoji: "🦉", level: 5, hp: 55, attack: 10, xp: 38, gold: 20, kind: "wild" },
    { id: "breeze", x: 3800, y: 1430, monster: "そよまる", emoji: "🦋", level: 6, hp: 63, attack: 11, xp: 44, gold: 23, kind: "wild" },
    { id: "coral", x: 3150, y: 2050, monster: "サンゴン", emoji: "🦀", level: 7, hp: 70, attack: 12, xp: 50, gold: 26, kind: "wild" },
    { id: "snow", x: 720, y: 2510, monster: "ユキポン", emoji: "🐧", level: 6, hp: 64, attack: 11, xp: 45, gold: 22, kind: "wild" },
    { id: "cloud", x: 1770, y: 2220, monster: "くもたろう", emoji: "🐏", level: 7, hp: 72, attack: 12, xp: 51, gold: 26, kind: "wild" },
    { id: "moon", x: 2850, y: 2900, monster: "ルナモ", emoji: "🐈", level: 8, hp: 84, attack: 13, xp: 60, gold: 30, kind: "wild" }
  ];
  const starterGrass = [
    { id: "starter-waniru", starterId: "waniru", x: 3570, y: 2465 },
    { id: "starter-goro", starterId: "goro", x: 1980, y: 1485 },
    { id: "starter-kametaro", starterId: "kametaro", x: 2320, y: 845 }
  ];
  const buffStock = Object.fromEntries(Object.keys(products).filter((id) => products[id].attackBonus || products[id].defenseBonus).map((id) => [id, 0]));
  const defaultCastle = { active: false, castleId: 0, room: 0, playerX: 100, playerY: 300 };
  const defaultCastleProgress = () => ({ solved: false, progress: 0, boulderSteps: 0, levers: [0, 0, 0], mirrors: [0, 0, 0], finalStep: 0, bossDefeated: false });
  const defaultRealm = { active: false, playerX: BOSS_REALM.gate.x, playerY: BOSS_REALM.gate.y, storySeen: false };
  const defaults = { x: 475, y: 525, facing: 0, characterId: null, party: [], level: 1, xp: 0, gold: 80, wins: 0, potions: 0, captureBalls: 2, seenMonsters: [], capturedMonsters: [], starterCatchUsed: [], monsterLevels: {}, defeated: [], stock: buffStock, buff: null, patchReady: {}, patchRefresh: {}, castle: defaultCastle, castles: CASTLES.map(defaultCastleProgress), realm: defaultRealm, gameCleared: false };
  function allBossesDefeatedMain(progress) {
    return Array.isArray(progress) && MAIN_CASTLE_COUNT <= progress.length && progress.slice(0, MAIN_CASTLE_COUNT).every((castle) => castle?.bossDefeated === true);
  }
  function allBossesDefeatedRealm(progress) {
    return allBossesDefeatedMain(progress)
      && progress.length >= FINAL_CASTLE_INDEX
      && progress.slice(MAIN_CASTLE_COUNT, FINAL_CASTLE_INDEX).every((castle) => castle?.bossDefeated === true);
  }
  function unlockedCastleAbilities() {
    return CASTLES.filter((castle, index) => castle.ability && state.castles[index].bossDefeated).map((castle) => castle.ability);
  }
  let saveWritesEnabled = true;
  const state = loadState();
  if (!state.party.length && state.characterId) state.party.push(state.characterId);
  const keys = new Set();
  const FORWARD_KEYS = new Set(["arrowup", "w"]);
  const BACKWARD_KEYS = new Set(["arrowdown", "s"]);
  const LEFT_KEYS = new Set(["arrowleft", "a"]);
  const RIGHT_KEYS = new Set(["arrowright", "d"]);
  const DOUBLE_TAP_WINDOW = 320;
  const TURN_SPEED = 2.8;
  let battle = null;
  let toastTimer;
  let castleVictoryTimer;
  let lastTime = 0;
  let saveTime = 0;
  let grassStepDistance = 0;
  let nextWildEncounterAt = 0;
  let encounterAnimation = false;
  let lastForwardTapAt = null;
  let lastBackwardTapAt = null;
  let forwardSprintActive = false;
  let cameraHeading = state.facing;
  let camera = null;

  function loadState() {
    try {
      const saved = START_NEW_GAME ? null : window.TrainingRpgSaveStorage.loadSlot(SAVE_SLOT_ID);
      if (!saved || typeof saved !== "object") return { ...defaults, defeated: [], stock: { ...defaults.stock }, patchReady: {} };
      const gameCleared = saved.gameCleared === true || saved.castles?.[FINAL_CASTLE_INDEX]?.bossDefeated === true;
      const resetFinalCastle = saved.castle?.active === true
        && saved.castle?.castleId === FINAL_CASTLE_INDEX
        && !gameCleared
        && !Number.isInteger(saved.castles?.[FINAL_CASTLE_INDEX]?.finalStep);
      const level = gameCleared
        ? MAX_LEVEL
        : Number.isFinite(saved.level) ? Math.min(MAX_LEVEL, Math.max(1, Math.floor(saved.level))) : defaults.level;
      const monsterLevels = Object.fromEntries(
        Object.entries(saved.monsterLevels && typeof saved.monsterLevels === "object" ? saved.monsterLevels : {})
          .filter(([id, value]) => (characters.some((character) => character.id === id) || patches.some((patch) => patch.id === id)) && Number.isInteger(value))
          .map(([id, value]) => [id, Math.min(MAX_LEVEL, Math.max(1, value))])
      );
      if (gameCleared && Array.isArray(saved.party)) {
        saved.party.filter((id) => patches.some((patch) => patch.id === id)).forEach((id) => { monsterLevels[id] = MAX_LEVEL; });
      }
      return {
        ...defaults, ...saved,
        level,
        xp: level >= MAX_LEVEL ? 0 : Number.isFinite(saved.xp) ? Math.max(0, Math.floor(saved.xp)) : defaults.xp,
        characterId: characters.some((character) => character.id === saved.characterId) ? saved.characterId : null,
        party: Array.isArray(saved.party)
          ? [...new Set(saved.party.filter((id) => (characters.some((character) => character.id === id) && id === saved.characterId) || (saved.capturedMonsters?.includes(id) && (patches.some((patch) => patch.id === id) || allBossesDefeatedMain(saved.castles) && characters.some((character) => character.id === id)))))].slice(0, 3)
          : characters.some((character) => character.id === saved.characterId) ? [saved.characterId] : [],
        x: Number.isFinite(saved.x) ? Math.max(50, Math.min(WORLD.width - 50, saved.x)) : defaults.x,
        y: Number.isFinite(saved.y) ? Math.max(50, Math.min(WORLD.height - 50, saved.y)) : defaults.y,
        facing: Number.isFinite(saved.facing) ? Math.atan2(Math.sin(saved.facing), Math.cos(saved.facing)) : defaults.facing,
        defeated: Array.isArray(saved.defeated) ? saved.defeated.filter((id) => trainers.some((t) => t.id === id)) : [],
        captureBalls: Number.isSafeInteger(saved.captureBalls) && saved.captureBalls >= 0 ? saved.captureBalls : defaults.captureBalls,
        seenMonsters: Array.isArray(saved.seenMonsters) ? [...new Set(saved.seenMonsters.filter((id) => CASTLES.some((castle) => castle.boss.id === id) || patches.some((patch) => patch.id === id) || characters.some((character) => character.id === id)))] : [],
        capturedMonsters: Array.isArray(saved.capturedMonsters) ? [...new Set(saved.capturedMonsters.filter((id) => patches.some((patch) => patch.id === id) || allBossesDefeatedMain(saved.castles) && characters.some((character) => character.id === id)))] : [],
        starterCatchUsed: Array.isArray(saved.starterCatchUsed) ? [...new Set(saved.starterCatchUsed.filter((id) => characters.some((character) => character.id === id)))] : [],
        monsterLevels,
        gameCleared,
        stock: { ...defaults.stock, ...(saved.stock && typeof saved.stock === "object" ? saved.stock : {}) },
        patchReady: saved.patchReady && typeof saved.patchReady === "object" ? saved.patchReady : {},
        patchRefresh: saved.patchRefresh && typeof saved.patchRefresh === "object" ? saved.patchRefresh : {},
        castle: {
          ...defaultCastle,
          ...(saved.castle && typeof saved.castle === "object" ? saved.castle : {}),
          active: saved.castle?.active === true,
          castleId: Number.isInteger(saved.castle?.castleId) ? Math.max(0, Math.min(CASTLES.length - 1, saved.castle.castleId)) : 0,
          room: resetFinalCastle ? 0 : Number.isInteger(saved.castle?.room) ? Math.max(0, Math.min(3, saved.castle.room)) : 0,
          playerX: resetFinalCastle ? 105 : Number.isFinite(saved.castle?.playerX) ? Math.max(60, Math.min(840, saved.castle.playerX)) : defaultCastle.playerX,
          playerY: resetFinalCastle ? 300 : Number.isFinite(saved.castle?.playerY) ? Math.max(100, Math.min(500, saved.castle.playerY)) : defaultCastle.playerY
        },
        realm: {
          ...defaultRealm,
          ...(saved.realm && typeof saved.realm === "object" ? saved.realm : {}),
          active: saved.realm?.active === true && allBossesDefeatedMain(saved.castles),
          playerX: Number.isFinite(saved.realm?.playerX) ? Math.max(80, Math.min(BOSS_REALM.width - 80, saved.realm.playerX)) : defaultRealm.playerX,
          playerY: Number.isFinite(saved.realm?.playerY) ? Math.max(80, Math.min(BOSS_REALM.height - 80, saved.realm.playerY)) : defaultRealm.playerY,
          storySeen: saved.realm?.storySeen === true
        },
        castles: CASTLES.map((_, index) => {
          const legacy = index === 0 && saved.castle && typeof saved.castle === "object";
          const savedProgress = Array.isArray(saved.castles) ? saved.castles[index] : null;
          const progress = savedProgress || (legacy ? { solved: saved.castle.solved?.[0] || saved.castle.solved?.[1] || saved.castle.solved?.[2], progress: saved.castle.progress?.[0] || 0, boulderSteps: saved.castle.boulderSteps, bossDefeated: saved.castle.bossDefeated } : null) || {};
          const finalStep = Number.isInteger(progress.finalStep) ? Math.max(0, Math.min(FINAL_GIMMICKS.length, progress.finalStep)) : 0;
          return {
            ...defaultCastleProgress(),
            ...progress,
            solved: index === FINAL_CASTLE_INDEX
              ? progress.bossDefeated === true || finalStep >= FINAL_GIMMICKS.length
              : progress.solved === true || Array.isArray(progress.solved) && progress.solved.some(Boolean),
            progress: Number.isInteger(progress.progress) ? Math.max(0, Math.min(3, progress.progress)) : Array.isArray(progress.progress) ? Math.max(0, ...progress.progress) : 0,
            boulderSteps: Number.isInteger(progress.boulderSteps) ? Math.max(0, Math.min(3, progress.boulderSteps)) : 0,
            levers: Array.isArray(progress.levers) ? [0, 1, 2].map((i) => progress.levers[i] === 1 ? 1 : 0) : [0, 0, 0],
            mirrors: Array.isArray(progress.mirrors) ? [0, 1, 2].map((i) => Number.isInteger(progress.mirrors[i]) ? ((progress.mirrors[i] % 4) + 4) % 4 : 0) : [0, 0, 0],
            finalStep,
            bossDefeated: progress.bossDefeated === true
          };
        })
      };
    } catch (error) {
      console.warn("セーブデータを読み込めませんでした。", error);
      saveWritesEnabled = false;
      return { ...defaults, defeated: [], stock: { ...defaults.stock }, patchReady: {} };
    }
  }

  function save(notifySuccess = false) {
    if (!saveWritesEnabled) {
      if (notifySuccess) showToast("読み込みに問題があったため、セーブを停止しています。");
      return false;
    }
    try {
      window.TrainingRpgSaveStorage.saveSlot(SAVE_SLOT_ID, state);
      if (notifySuccess) showToast("セーブしました。");
      return true;
    } catch (error) {
      console.warn("セーブデータを保存できませんでした。", error);
      showToast("保存できませんでした。ブラウザーの空き容量をご確認ください。");
      return false;
    }
  }
  const threshold = () => 30 + (state.level - 1) * 18;
  function characterFormAt(character, level) {
    let form = character;
    for (const evolution of character.evolutions) {
      if (level < evolution.level) break;
      form = { ...character, ...evolution };
    }
    return form;
  }
  const activeCastleData = () => CASTLES[state.castle.castleId];
  const activeCastleProgress = () => state.castles[state.castle.castleId];
  const sequenceMechanics = ["runes", "bells", "prisms", "orbs", "chimes"];
  const castleSequence = (castle) => ({
    runes: [0, 2, 1],
    bells: [2, 0, 1],
    prisms: [1, 2, 0],
    orbs: [0, 1, 2],
    chimes: [2, 1, 0]
  })[castle.mechanic];
  const castleTogglePattern = (castle) => castle.mechanic === "torches" ? "011" : "101";
  const castleRotationPattern = (castle) => castle.mechanic === "constellation" ? "302" : "130";
  function monsterById(id) {
    const character = characters.find((entry) => entry.id === id);
    if (character) return { ...characterFormAt(character, state.level), id, level: state.level };
    const patch = patches.find((entry) => entry.id === id);
    return patch ? { ...patch, id, name: patch.monster, level: state.monsterLevels[id] || patch.level, defense: Math.max(1, Math.floor(patch.level * 1.5)), color: "#e8f0df" } : null;
  }
  const playerCharacter = () => {
    const activeId = battle?.party?.[battle.partyIndex]?.id;
    return monsterById(activeId || state.party[0] || state.characterId);
  };
  const mainRealmUnlocked = () => allBossesDefeatedMain(state.castles);
  const finalCastleUnlocked = () => allBossesDefeatedRealm(state.castles);
  function visibleBossRealmCastles() {
    const castles = CASTLES.slice(MAIN_CASTLE_COUNT, FINAL_CASTLE_INDEX).map((castle, offset) => ({
      castle,
      index: MAIN_CASTLE_COUNT + offset
    }));
    if (finalCastleUnlocked()) castles.push({ castle: CASTLES[FINAL_CASTLE_INDEX], index: FINAL_CASTLE_INDEX });
    return castles;
  }
  const canUseMonster = (id) => id === state.characterId
    || state.capturedMonsters.includes(id) && (patches.some((patch) => patch.id === id) || mainRealmUnlocked() && characters.some((character) => character.id === id));
  const starterCaptureGuaranteeAvailable = (id) => characters.some((character) => character.id === id)
    && !state.starterCatchUsed.includes(id);
  function starterGrassZones() {
    if (!mainRealmUnlocked()) return [];
    return starterGrass.flatMap((zone) => {
      if (zone.starterId === state.characterId || state.capturedMonsters.includes(zone.starterId)) return [];
      const character = characters.find((entry) => entry.id === zone.starterId);
      if (!character) return [];
      const form = characterFormAt(character, 1);
      return [{ ...form, ...zone, monster: character.name, speciesId: character.id, name: "やせいのマジモン", level: 1, xp: 28, gold: 16, kind: "wild" }];
    });
  }
  const maxPlayerHp = () => playerCharacter()
    ? playerCharacter().hp + Math.max(0, playerCharacter().level - 1) * 8 + (unlockedCastleAbilities().some((ability) => ability.id === "crystal-heart") ? 25 : 0)
    : 38;
  function announceLevelChange(previousLevel) {
    const character = characters.find((entry) => entry.id === state.characterId);
    if (!character) return;
    const previousForm = characterFormAt(character, previousLevel);
    const currentForm = characterFormAt(character, state.level);
    if (previousForm.name !== currentForm.name) {
      const evolutions = character.evolutions.filter((evolution) => evolution.level > previousLevel && evolution.level <= state.level);
      showToast(evolutions.length > 1
        ? `${character.name}が${evolutions.length}段階進化して、${currentForm.name}になった！`
        : `${previousForm.name}は${currentForm.name}に進化した！`);
    } else if (state.level > previousLevel) {
      showToast(`${currentForm.name}が Lv.${state.level} にレベルアップ！`);
    }
  }
  const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }
  function showCastleCelebration(castleName) {
    castleVictoryTitle.textContent = `${castleName}制覇！！`;
    castleVictoryOverlay.hidden = false;
    castleVictoryOverlay.classList.remove("is-active");
    clearTimeout(castleVictoryTimer);
    requestAnimationFrame(() => castleVictoryOverlay.classList.add("is-active"));
    castleVictoryTimer = setTimeout(() => {
      castleVictoryOverlay.classList.remove("is-active");
      castleVictoryOverlay.hidden = true;
    }, 2800);
  }
  function openDialog(content) {
    dialogCard.innerHTML = content;
    dialogLayer.hidden = false;
    dialogCard.querySelector(".dialog-close")?.focus();
  }
  function closeDialog() {
    dialogLayer.hidden = true;
    dialogCard.innerHTML = "";
  }
  function openGameMenu() {
    if (battle || encounterAnimation) {
      showToast("冒険中のイベントが終わってからメニューを開いてね。");
      return;
    }
    openDialog(`<button class="dialog-close" type="button" aria-label="閉じる">×</button><p class="dialog-kicker">ADVENTURE MENU</p><h2 id="dialogTitle">ゲームメニュー</h2><p class="dialog-copy">冒険の進み具合を保存できます。</p><div class="shop-list"><button class="primary-button full-button" type="button" data-save-now>セーブする</button><button class="secondary-button full-button" type="button" data-return-title>タイトルへ戻る</button></div>`);
  }
  function updateHud() {
    const character = playerCharacter();
    document.getElementById("goldValue").textContent = state.gold;
    document.getElementById("levelValue").textContent = state.level;
    document.getElementById("trainingLevel").textContent = state.level;
    const levelCapped = state.level >= MAX_LEVEL;
    document.getElementById("xpText").textContent = levelCapped ? "レベルMAX" : `${state.xp} / ${threshold()}`;
    document.getElementById("xpBar").style.width = levelCapped ? "100%" : `${Math.min(100, state.xp / threshold() * 100)}%`;
    document.getElementById("trainCost").textContent = levelCapped ? "MAX" : `${threshold()} XP`;
    document.getElementById("trainButton").disabled = levelCapped || state.xp < threshold();
    document.getElementById("winCount").textContent = state.wins;
    document.getElementById("trainerCount").textContent = `${state.defeated.length} / ${trainers.length}`;
    document.getElementById("potionCount").textContent = state.potions;
    document.getElementById("captureBallCount").textContent = state.captureBalls;
    const dexTotal = characters.length + patches.length + CASTLES.length;
    const dexRegistered = new Set([state.characterId, ...state.capturedMonsters].filter(Boolean)).size + state.castles.filter((castle) => castle.bossDefeated).length;
    document.getElementById("dexCount").textContent = `${dexRegistered} / ${dexTotal}`;
    const nextCastleIndex = state.castles.findIndex((castle) => !castle.bossDefeated);
    document.getElementById("questText").textContent = state.gameCleared
      ? "全クリア！世界に平和が戻った！"
      : nextCastleIndex < 0
        ? "すべての城を攻略！"
        : nextCastleIndex === FINAL_CASTLE_INDEX
          ? state.realm.active ? "異世界の中央に現れた魔王の城へ！" : "ゲートから異世界の魔王の城へ！"
      : nextCastleIndex >= MAIN_CASTLE_COUNT && !state.realm.active
        ? "魔法のゲートからボスマジモン町へ！"
        : `${CASTLES[nextCastleIndex].name}のボスに挑戦しよう`;
    document.getElementById("magimonPortrait").textContent = character?.emoji || "❔";
    document.getElementById("magimonPortrait").style.background = character?.color || "#f0f3ed";
    document.getElementById("playerName").textContent = character?.name || "マジモン未選択";
    document.getElementById("playerStats").textContent = character ? `攻 ${character.attack} · 防 ${character.defense}` : "最初にキャラクターを選ぼう";
    document.getElementById("mapPlayerLegend").textContent = "🧑 トレーナー";
    document.getElementById("mapMagimonLegend").textContent = `${character?.emoji || "❔"} ${character?.name || "マジモン"}`;
    const currentPlayerHp = battle ? battle.playerHp : maxPlayerHp();
    document.getElementById("playerHpText").textContent = character ? `${currentPlayerHp} / ${maxPlayerHp()}` : "—";
    document.getElementById("playerHpBar").style.width = character ? `${Math.max(0, currentPlayerHp / maxPlayerHp() * 100)}%` : "0%";
    document.getElementById("partyButton").textContent = `手持ちを編成する (${state.party.length}/3)`;
    document.getElementById("partyButton").disabled = Boolean(battle);
  }
  function renderCharacterChoices() {
    characterChoices.innerHTML = characters.map((character) => `
      <button class="character-choice" type="button" data-character="${character.id}">
        <span class="choice-portrait" style="background:${character.color}">${character.emoji}</span>
        <span class="choice-name">${character.name}</span>
        <span class="choice-role">${character.role}</span>
        <span class="choice-description">${character.description}</span>
        <span class="choice-stats"><span>❤️ HP <strong>${character.hp}</strong></span><span>⚔️ 攻 <strong>${character.attack}</strong></span><span>🛡️ 防 <strong>${character.defense}</strong></span></span>
        <span class="choice-start">このキャラクターで冒険！</span>
      </button>`).join("");
  }
  characterChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-character]");
    if (!button) return;
    state.characterId = button.dataset.character;
    state.party = [state.characterId];
    keys.clear();
    characterSelect.hidden = true;
    updateHud();
    save();
  });
  function openPartyMenu() {
    if (battle) { showToast("戦闘中は手持ちを交換できないよ。"); return; }
    const owned = [...new Set([state.characterId, ...state.capturedMonsters].filter(Boolean))];
    const choices = owned.map((id) => {
      const monster = monsterById(id);
      if (!monster) return "";
      const index = state.party.indexOf(id);
      const action = index >= 0
        ? index === 0 ? "先頭のマジモン" : "手持ちから外す"
        : state.party.length < 3 ? "手持ちに加える" : "手持ちがいっぱい";
      const disabled = index < 0 && state.party.length >= 3;
      return `<article class="party-choice ${index >= 0 ? "is-selected" : ""}"><span class="dex-emoji" style="background:${monster.color || "#eef2e8"}">${monster.emoji}</span><span class="dex-info"><strong>${escapeHtml(monster.name)}</strong><small>Lv.${monster.level} · HP ${monster.hp} · 攻 ${monster.attack}</small></span><button class="buy-button" type="button" data-party-id="${id}" ${disabled ? "disabled" : ""}>${action}</button></article>`;
    }).join("");
    openDialog(`<button class="dialog-close" type="button" aria-label="閉じる">×</button><p class="dialog-kicker">YOUR MAGIMON PARTY</p><h2 id="dialogTitle">手持ちマジモン (${state.party.length}/3)</h2><p class="dialog-copy">最初のマジモン、またはゲットしたマジモンを3匹まで選べるよ。先頭のマジモンがフィールドを一緒に歩くよ。</p><div class="shop-list">${choices}</div>`);
  }
  function togglePartyMember(id) {
    if (battle) { showToast("戦闘中は手持ちを交換できないよ。"); return; }
    const currentIndex = state.party.indexOf(id);
    if (currentIndex >= 0) {
      if (state.party.length === 1) { showToast("手持ちは1匹以上必要だよ。"); return; }
      if (currentIndex > 0) state.party.splice(currentIndex, 1);
      else { state.party.shift(); state.party.push(id); }
    } else if (state.party.length < 3 && canUseMonster(id)) {
      state.party.push(id);
    } else {
      showToast("手持ちは3匹までだよ。");
      return;
    }
    updateHud();
    save();
    openPartyMenu();
  }
  function addExperience(amount) {
    if (state.level >= MAX_LEVEL) { state.xp = 0; return; }
    const previousLevel = state.level;
    state.xp += amount;
    while (state.level < MAX_LEVEL && state.xp >= threshold()) {
      state.xp -= threshold();
      state.level++;
    }
    if (state.level >= MAX_LEVEL) state.xp = 0;
    announceLevelChange(previousLevel);
  }
  function trainPlayer() {
    if (state.level >= MAX_LEVEL || state.xp < threshold()) return;
    const previousLevel = state.level;
    state.xp -= threshold();
    state.level++;
    if (state.level >= MAX_LEVEL) state.xp = 0;
    updateHud(); save();
    announceLevelChange(previousLevel);
  }
  function trainerTeam(trainer) {
    const trainerIndex = trainers.indexOf(trainer);
    const otherMonsters = [0, 1].map((offset) => {
      const species = patches[(trainerIndex * 2 + offset) % patches.length];
      return {
        id: `${trainer.id}-${offset + 2}`,
        name: trainer.name,
        title: trainer.title,
        monster: species.monster,
        emoji: species.emoji,
        level: trainer.level,
        hp: trainer.hp,
        attack: trainer.attack,
        defense: Math.max(0, Math.floor(trainer.level / 2)),
        xp: 0,
        gold: 0,
        kind: "trainer"
      };
    });
    return [{ ...trainer, defense: Math.max(0, Math.floor(trainer.level / 2)), kind: "trainer" }, ...otherMonsters];
  }
  function townAt(x = state.x, y = state.y) { return towns.find((town) => Math.hypot(town.x - x, town.y - y) < 160); }
  function openMonsterDex() {
    const starterEntries = characters.map((character) => {
      const current = character.id === state.characterId;
      const caught = state.capturedMonsters.includes(character.id);
      const unlocked = current || caught || mainRealmUnlocked();
      const form = current ? playerCharacter() : character;
      const stage = current ? character.evolutions.filter((evolution) => state.level >= evolution.level).length + 1 : 1;
      const evolutionPath = [character.name, ...character.evolutions.map((evolution) => `${evolution.name} (Lv.${evolution.level})`)].map(escapeHtml).join(" → ");
      return `<article class="dex-entry ${current || caught ? "is-caught" : unlocked ? "is-seen" : "is-unknown"}"><span class="dex-emoji" style="background:${unlocked ? form.color : "#edf0e9"}">${unlocked ? form.emoji : "❔"}</span><span class="dex-info"><strong>${unlocked ? escapeHtml(form.name) : "？？？"}</strong><small>${unlocked ? `HP ${form.hp} · 攻 ${form.attack} · 防 ${form.defense}` : "第1章クリア後、対応する城の近くに出現"}</small>${unlocked ? `<small class="dex-evolution-path">${evolutionPath}</small>` : ""}</span><span class="dex-status">${current ? `冒険中 · ${stage}段階` : caught ? "GET!" : unlocked ? "草むらで探そう" : "未解放"}</span></article>`;
    });
    const wildEntries = patches.map((patch) => {
      const caught = state.capturedMonsters.includes(patch.id);
      const seen = caught || state.seenMonsters.includes(patch.id);
      const label = caught ? "GET!" : seen ? "発見！" : "？？？";
      const name = seen ? escapeHtml(patch.monster) : "？？？";
      const emoji = seen ? patch.emoji : "❔";
      const details = caught ? `Lv.${patch.level} · HP ${patch.hp} · 攻 ${patch.attack}` : seen ? `Lv.${patch.level} · まだ仲間になっていない` : "まだ出会っていない";
      return `<article class="dex-entry ${caught ? "is-caught" : seen ? "is-seen" : "is-unknown"}"><span class="dex-emoji">${emoji}</span><span class="dex-info"><strong>${name}</strong><small>${details}</small></span><span class="dex-status">${label}</span></article>`;
    });
    const bossEntries = CASTLES.map((castle, index) => {
      const seen = state.seenMonsters.includes(castle.boss.id);
      const defeated = state.castles[index].bossDefeated;
      const ability = castle.ability ? `<small>${castle.ability.emoji} 能力「${escapeHtml(castle.ability.name)}」 · ${escapeHtml(castle.ability.description)}</small>` : "";
      return `<article class="dex-entry ${defeated ? "is-caught" : seen ? "is-seen" : "is-unknown"}"><span class="dex-emoji">${seen ? castle.boss.emoji : "❔"}</span><span class="dex-info"><strong>${seen ? escapeHtml(castle.boss.name) : "？？？"}</strong><small>${seen ? `Lv.${castle.boss.level} · ${escapeHtml(castle.name)}のボス` : `${escapeHtml(castle.name)} · 未発見`}</small>${ability}</span><span class="dex-status">${defeated ? castle.final ? "撃破・全クリア" : "撃破・能力獲得" : seen ? "発見！" : "？？？"}</span></article>`;
    });
    const entries = [...starterEntries, ...wildEntries, ...bossEntries].join("");
    const registeredCount = new Set([state.characterId, ...state.capturedMonsters].filter(Boolean)).size + state.castles.filter((castle) => castle.bossDefeated).length;
    const totalCount = characters.length + patches.length + CASTLES.length;
    openDialog(`<button class="dialog-close" type="button" aria-label="閉じる">×</button><p class="dialog-kicker">YOUR MONSTER COLLECTION</p><h2 id="dialogTitle">マジモン図鑑</h2><p class="dialog-copy">最初に選んだ1匹と野生マジモン、10の城のボス、最後の城の魔王を登録。第1章の城をすべて攻略すると、残りの2匹がそれぞれの城の近くに現れるよ。図鑑登録数：${registeredCount} / ${totalCount}</p><div class="dex-list">${entries}</div>`);
  }
  function openShop(town) {
    const items = town.items.map((id) => {
      const item = products[id];
      const owned = id === "potion" ? `${state.potions}個` : id === "captureBall" ? `${state.captureBalls}個` : id === "experience" ? state.level >= MAX_LEVEL ? "レベルMAX" : "使うたび +20 XP" : `${state.stock[id] || 0}個`;
      const unavailable = state.gold < item.price || id === "experience" && state.level >= MAX_LEVEL;
      return `<article class="shop-item"><span class="shop-emoji">${item.emoji}</span><span><strong>${item.name} · ${owned}</strong><small>${item.description}</small></span><button class="buy-button" type="button" data-buy="${id}" data-town="${town.id}" ${unavailable ? "disabled" : ""}>${item.price} G</button></article>`;
    }).join("");
    openDialog(`<button class="dialog-close" type="button" aria-label="閉じる">×</button><p class="dialog-kicker">${town.icon} ${town.name}のおみせ</p><h2 id="dialogTitle">${town.shop}</h2><p class="dialog-copy">${town.greeting}<br>お買いものを選んでね。</p><div class="shop-list">${items}</div>`);
  }
  function buyItem(id, townId) {
    const item = products[id];
    const town = towns.find((entry) => entry.id === townId) || (bossTown.id === townId ? bossTown : null);
    if (!town) { showToast("お店を見つけられませんでした。"); return; }
    if (id === "experience" && state.level >= MAX_LEVEL) { showToast("レベルは上限のLv.100だよ。"); return; }
    if (!item || state.gold < item.price) return;
    state.gold -= item.price;
    if (id === "potion") state.potions++;
    else if (id === "captureBall") state.captureBalls++;
    else if (id === "experience") addExperience(20);
    else state.stock[id] = (state.stock[id] || 0) + 1;
    updateHud(); save();
    openShop(town);
    showToast(`${item.name}を買ったよ！`);
  }
  function startBattle(opponent) {
    if (battle || encounterAnimation || !dialogLayer.hidden) return;
    if (opponent.kind === "trainer" && state.defeated.includes(opponent.id)) return;
    if (opponent.kind === "wild" && state.patchReady[opponent.id] === false) { showToast("草むらは静かだね。少し歩くと、また出会えそう。"); return; }
    if (opponent.kind === "boss" && !state.seenMonsters.includes(opponent.id)) state.seenMonsters.push(opponent.id);
    const speciesId = opponent.speciesId || opponent.id;
    if (opponent.kind === "wild" && !state.seenMonsters.includes(speciesId)) {
      state.seenMonsters.push(speciesId);
      save();
    }
    const buff = Object.keys(products).find((id) => (products[id].attackBonus || products[id].defenseBonus) && state.stock[id] > 0) || null;
    if (buff) { state.stock[buff]--; state.buff = buff; }
    const hpBonus = unlockedCastleAbilities().some((ability) => ability.id === "crystal-heart") ? 25 : 0;
    const party = state.party.map((id) => {
      const monster = monsterById(id);
      return { id, currentHp: monster.hp + Math.max(0, monster.level - 1) * 8 + hpBonus };
    });
    const team = opponent.kind === "trainer" ? (opponent.team || [opponent]) : null;
    const firstOpponent = team ? team[0] : opponent;
    battle = {
      opponent: { ...firstOpponent, currentHp: firstOpponent.hp },
      trainerTeam: team,
      trainerIndex: 0,
      party,
      partyIndex: 0,
      playerHp: party[0]?.currentHp || 0,
      log: opponent.kind === "trainer" ? `${opponent.name}が3匹のマジモンで勝負をしかけてきた！` : opponent.kind === "boss" ? `${opponent.monster}が立ちはだかった！` : `草むらから${opponent.monster}があらわれた！`,
      busy: false
    };
    if (buff) battle.log += ` ${products[buff].name}の効果が発動！`;
    renderBattle();
  }
  function renderBattle() {
    if (!battle) return;
    const enemy = battle.opponent;
    const done = Boolean(battle.result);
    const alreadyCaught = enemy.kind === "wild" && state.capturedMonsters.includes(enemy.speciesId || enemy.id);
    const starterGuarantee = enemy.kind === "wild" && starterCaptureGuaranteeAvailable(enemy.speciesId || enemy.id);
    const captureAction = enemy.kind === "wild" && !alreadyCaught
      ? `<button class="capture-button" type="button" data-battle="capture" ${battle.busy || state.captureBalls < 1 ? "disabled" : ""}>${starterGuarantee ? "🎁 初回ゲット確定" : "🔴 ゲットボール"} (${state.captureBalls})</button>`
      : "";
    const actions = done ? `<button class="primary-button full-button" type="button" data-battle="finish">${battle.reward?.gameCleared ? "エンディングを閉じて制覇を祝う" : battle.reward?.castleClear ? "城の外へ出て制覇を祝う！" : "フィールドにもどる"}</button>` :
      `<div class="battle-actions"><button class="primary-button" type="button" data-battle="attack" ${battle.busy ? "disabled" : ""}>⚔️ ${playerCharacter()?.name || "マジモン"}のこうげき</button><button class="secondary-button" type="button" data-battle="special" ${battle.busy ? "disabled" : ""}>✨ ${playerCharacter()?.name || "マジモン"}のとくぎ</button><button class="secondary-button" type="button" data-battle="potion" ${battle.busy || state.potions < 1 || battle.playerHp >= maxPlayerHp() ? "disabled" : ""}>🧪 きずぐすり (${state.potions})</button>${captureAction}<button class="secondary-button" type="button" data-battle="run" ${battle.busy || enemy.kind === "trainer" || enemy.kind === "boss" ? "disabled" : ""}>🏃 にげる</button></div>`;
    const title = done ? battle.reward?.gameCleared ? "全クリア！" : battle.result === "caught" ? "ゲット成功！" : battle.result === "win" ? "やったね！" : battle.result === "lose" ? "おつかれさま" : "ぶじに離れたよ" : "モンスターバトル";
    const endingScreen = battle.reward?.gameCleared
      ? `<section class="ending-screen" aria-label="ゲームクリア"><span>🏆</span><p>GAME CLEAR</p><strong>世界に平和が戻った！</strong><small>魔王のマジモンを倒し、11個すべての城を攻略したよ。</small></section>`
      : "";
    const abilityReward = battle.reward?.ability
      ? `<br><strong>${battle.reward.ability.emoji} 能力「${escapeHtml(battle.reward.ability.name)}」を獲得！</strong><br>${escapeHtml(battle.reward.ability.description)}`
      : "";
    const newStory = battle.reward?.storyStarted
      ? "<br><strong>新しいストーリーが始まった！</strong><br>マップ中央に魔法のゲートが開いた。ゲートの先のボスマジモン町へ向かおう！"
      : "";
    const reward = done && battle.reward ? `<div class="result-box${battle.reward.gameCleared ? " is-ending" : ""}"><strong>+${battle.reward.xp} XP</strong>　 · 　<strong>+${battle.reward.gold} G</strong><br>いっしょに強くなったね！${abilityReward}${newStory}</div>` : "";
    const teamStatus = battle.trainerTeam ? `<p class="battle-team-count">${battle.opponent.name}の手持ち ${battle.trainerIndex + 1} / 3</p>` : "";
    const partyStatus = battle.party.map((member, index) => {
      const monster = monsterById(member.id);
      return `<span class="${index === battle.partyIndex ? "is-active" : ""} ${member.currentHp <= 0 ? "is-fainted" : ""}">${monster?.emoji || "❔"} ${escapeHtml(monster?.name || "マジモン")}</span>`;
    }).join("");
    const abilityStatus = unlockedCastleAbilities();
    const abilityLine = abilityStatus.length ? `<p class="battle-team-count">習得能力：${abilityStatus.map((ability) => `${ability.emoji} ${escapeHtml(ability.name)}`).join(" ・ ")}</p>` : "";
    openDialog(`<p class="dialog-kicker">${battle.reward?.gameCleared ? "THE END · 魔王の城" : enemy.kind === "trainer" ? `⚔️ ${escapeHtml(enemy.title)}` : enemy.kind === "boss" ? "🏰 古城のボス" : "🌿 やせいのモンスター"}</p><h2 id="dialogTitle">${title}</h2>
      ${teamStatus}
      ${abilityLine}
      ${endingScreen}
      <div class="battle-hero"><div class="battle-monster">${enemy.emoji}</div><div><h3>${escapeHtml(enemy.monster)} <small>Lv.${enemy.level}</small></h3><p>${escapeHtml(enemy.name || "やせいのモンスター")} · HP ${enemy.currentHp} / ${enemy.hp}</p><div class="battle-hp hp-track"><i style="width:${Math.max(0,enemy.currentHp/enemy.hp*100)}%;background:#e5a181"></i></div></div></div>
      <div class="battle-hero"><div class="battle-monster">${playerCharacter()?.emoji || "❔"}</div><div><h3>${playerCharacter()?.name || "マジモン"} <small>Lv.${state.level}</small></h3><p>HP ${battle.playerHp} / ${maxPlayerHp()}</p><div class="battle-hp hp-track"><i style="width:${Math.max(0,battle.playerHp/maxPlayerHp()*100)}%"></i></div></div></div>
      <div class="battle-party-list">${partyStatus}</div>
      ${reward}<p class="battle-log" aria-live="polite">${escapeHtml(battle.log)}</p>${actions}`);
  }
  function enemyTurn() {
    if (!battle || battle.result) return;
    const enemy = battle.opponent;
    const characterDefense = playerCharacter()?.defense || 0;
    const itemDefense = state.buff ? products[state.buff]?.defenseBonus || 0 : 0;
    const abilities = unlockedCastleAbilities();
    if (abilities.some((ability) => ability.id === "wind-step") && Math.random() < .2) {
      battle.log = `風の身かわし！${playerCharacter()?.name || "マジモン"}は攻撃をよけた！`;
      battle.busy = false; updateHud(); renderBattle();
      return;
    }
    const tideGuard = abilities.some((ability) => ability.id === "tide-guard") ? 3 : 0;
    const ironWall = abilities.some((ability) => ability.id === "iron-wall") ? 4 : 0;
    const playerDamage = Math.max(1, enemy.attack - characterDefense - itemDefense - tideGuard - ironWall);
    battle.playerHp = Math.max(0, battle.playerHp - playerDamage);
    battle.party[battle.partyIndex].currentHp = battle.playerHp;
    battle.log = `${enemy.monster}の反撃！${playerCharacter()?.name || "あなた"}は ${playerDamage} ダメージ。`;
    if (battle.playerHp <= 0) {
      const next = battle.party.findIndex((member, index) => index > battle.partyIndex && member.currentHp > 0);
      if (next >= 0) {
        battle.partyIndex = next;
        battle.playerHp = battle.party[next].currentHp;
        battle.log += ` ${playerCharacter()?.name}に交代！`;
      } else {
        state.gold = Math.max(0, state.gold - 5);
        battle.result = "lose";
        battle.log = "手持ちが全員たおれた…。町で準備して、また挑戦しよう！（5 Gを落とした）";
      }
    }
    battle.busy = false; updateHud(); save(); renderBattle();
  }
  function attack(kind) {
    if (!battle || battle.busy || battle.result) return;
    battle.busy = true;
    if (kind === "potion") {
      if (state.potions < 1 || battle.playerHp >= maxPlayerHp()) { battle.busy = false; return; }
      state.potions--; battle.playerHp = Math.min(maxPlayerHp(), battle.playerHp + 20);
      battle.log = `きずぐすりを使った！${playerCharacter()?.name || "あなた"}のHPが回復。`;
    } else {
      const base = (playerCharacter()?.attack || 7) + state.level * 2;
      const abilities = unlockedCastleAbilities();
      const moonBoost = kind === "special" && abilities.some((ability) => ability.id === "moon-mirror") ? 1.25 : 1;
      const stormBoost = abilities.some((ability) => ability.id === "storm-surge") ? 1.15 : 1;
      const power = Math.round((kind === "special" ? base * 1.55 : base) * moonBoost * stormBoost);
      const boost = state.buff ? products[state.buff]?.attackBonus || 0 : 0;
      const castleBonus = (abilities.some((ability) => ability.id === "flame-power") ? 4 : 0)
        + (abilities.some((ability) => ability.id === "abyss-strike") ? 6 : 0);
      const damage = power + boost + castleBonus + Math.floor(Math.random() * 5);
      battle.opponent.currentHp = Math.max(0, battle.opponent.currentHp - damage);
      battle.log = `${kind === "special" ? `${playerCharacter()?.name || "マジモン"}のとくぎ！` : `${playerCharacter()?.name || "マジモン"}のこうげき！`} ${battle.opponent.monster}に ${damage} ダメージ！`;
      const healing = (abilities.some((ability) => ability.id === "forest-heal") ? 4 : 0)
        + (kind === "special" && abilities.some((ability) => ability.id === "eclipse-drain") ? 10 : 0);
      if (healing) {
        const healed = Math.min(healing, maxPlayerHp() - battle.playerHp);
        if (healed > 0) {
          battle.playerHp += healed;
          battle.party[battle.partyIndex].currentHp = battle.playerHp;
          battle.log += ` 能力の効果でHPが${healed}回復！`;
        }
      }
      if (battle.opponent.currentHp <= 0) {
        if (battle.trainerTeam && battle.trainerIndex < battle.trainerTeam.length - 1) {
          battle.trainerIndex++;
          const nextOpponent = battle.trainerTeam[battle.trainerIndex];
          battle.opponent = { ...nextOpponent, currentHp: nextOpponent.hp };
          battle.log += ` ${nextOpponent.monster}が出てきた！`;
          battle.busy = false;
          updateHud(); renderBattle(); setTimeout(enemyTurn, 420);
        } else finishBattle("win");
        return;
      }
    }
    updateHud(); renderBattle(); setTimeout(enemyTurn, 420);
  }
  function throwCaptureBall() {
    if (!battle || battle.busy || battle.result || battle.opponent.kind !== "wild" || state.captureBalls < 1) return;
    battle.busy = true;
    state.captureBalls--;
    const enemy = battle.opponent;
    const speciesId = enemy.speciesId || enemy.id;
    const guaranteedStarterCatch = starterCaptureGuaranteeAvailable(speciesId);
    if (guaranteedStarterCatch) state.starterCatchUsed.push(speciesId);
    const chance = Math.min(.9, .25 + (1 - enemy.currentHp / enemy.hp) * .65);
    if (guaranteedStarterCatch || Math.random() < chance) {
      if (!state.capturedMonsters.includes(speciesId)) state.capturedMonsters.push(speciesId);
      if (state.party.length < 3 && !state.party.includes(speciesId)) state.party.push(speciesId);
      battle.log = state.party.includes(speciesId) ? `${enemy.monster}をゲット！手持ちに加わったよ！` : `${enemy.monster}をゲット！手持ちの編成で選べるよ！`;
      finishBattle("caught");
      return;
    }
    battle.log = `${enemy.monster}はボールから出てきた！HPを減らすとゲットしやすくなるよ。`;
    updateHud();
    save();
    renderBattle();
    setTimeout(enemyTurn, 420);
  }
  function finishBattle(result) {
    if (!battle) return;
    battle.result = result; battle.busy = false;
    if (result === "win" || result === "caught") {
      const enemy = battle.opponent;
      const rewardSource = battle.trainerTeam ? battle.trainerTeam[0] : enemy;
      const firstBossClear = result === "win" && enemy.kind === "boss" && !activeCastleProgress().bossDefeated;
      const gameCleared = result === "win" && enemy.kind === "boss" && activeCastleData().final === true;
      const abilityReward = firstBossClear
        ? activeCastleData().ability
        : null;
      state.wins++; state.gold += rewardSource.gold; addExperience(rewardSource.xp);
      battle.reward = {
        xp: rewardSource.xp,
        gold: rewardSource.gold,
        ability: abilityReward,
        storyStarted: firstBossClear && state.castle.castleId === MAIN_CASTLE_COUNT - 1,
        gameCleared,
        castleClear: firstBossClear ? activeCastleData().name : null
      };
      if (gameCleared) {
        state.gameCleared = true;
        state.level = MAX_LEVEL;
        state.xp = 0;
        state.party.forEach((id) => { state.monsterLevels[id] = MAX_LEVEL; });
      }
      if (result === "win") battle.log = enemy.kind === "boss" ? `${enemy.monster}を倒した！古城の攻略達成！` : battle.trainerTeam ? `${battle.trainerTeam[0].name}の3匹に勝った！` : `${enemy.monster}に勝った！`;
      if (battle.trainerTeam && !state.defeated.includes(battle.trainerTeam[0].id)) state.defeated.push(battle.trainerTeam[0].id);
      if (enemy.kind === "boss") {
        activeCastleProgress().bossDefeated = true;
        if (battle.reward.castleClear && state.castle.active) leaveCastle(true);
      }
      if (enemy.kind === "wild") markPatchAway(enemy.id);
    } else if (result === "run") {
      if (battle.opponent.kind === "wild") markPatchAway(battle.opponent.id);
      battle.log = "草むらから離れたよ。";
    }
    state.buff = null; updateHud(); save(); renderBattle();
  }
  function markPatchAway(id) {
    state.patchReady[id] = false;
    state.patchRefresh[id] = Date.now() + 12000;
  }
  function grassPatchAt(x = state.x, y = state.y) {
    return [...patches, ...starterGrassZones()].find((patch) => {
      if (state.patchReady[patch.id] === false || Math.hypot(x - patch.x, y - patch.y) >= 82) return false;
      if (towns.some((town) => Math.hypot(x - town.x, y - town.y) < 160)) return false;
      return true;
    }) || null;
  }
  function triggerGrassEncounter(zone, immediate = false) {
    if (battle || encounterAnimation || !dialogLayer.hidden || (!immediate && Date.now() < nextWildEncounterAt) || state.patchReady[zone.id] === false) return;
    const species = zone.starterId ? zone : patches[Math.floor(Math.random() * patches.length)];
    nextWildEncounterAt = Date.now() + 3000;
    grassStepDistance = 0;
    const opponent = { ...species, id: zone.id, speciesId: species.speciesId || species.id, kind: "wild" };
    encounterAnimation = true;
    keys.clear();
    document.getElementById("encounterEmoji").textContent = species.emoji;
    document.getElementById("encounterName").textContent = species.monster;
    encounterOverlay.hidden = false;
    encounterOverlay.classList.remove("is-active");
    requestAnimationFrame(() => encounterOverlay.classList.add("is-active"));
    setTimeout(() => {
      encounterOverlay.classList.remove("is-active");
      encounterOverlay.hidden = true;
      encounterAnimation = false;
      startBattle(opponent);
    }, 1400);
  }
  function refreshWildlife() {
    let refreshed = false;
    [...patches, ...starterGrassZones()].forEach((patch) => {
      if (state.patchReady[patch.id] === false && Date.now() >= (state.patchRefresh[patch.id] || 0)) {
        state.patchReady[patch.id] = true;
        delete state.patchRefresh[patch.id];
        refreshed = true;
      }
    });
    if (refreshed) save();
  }
  function finishBattleAndClose() {
    const castleClear = battle?.reward?.castleClear;
    battle = null;
    closeDialog();
    updateHud();
    if (castleClear) showCastleCelebration(castleClear);
  }
  function nearestInteraction() {
    let nearest = null, best = Infinity;
    trainers.filter((t) => !state.defeated.includes(t.id)).forEach((trainer) => {
      const distance = Math.hypot(state.x-trainer.x,state.y-trainer.y);
      if (distance < best) { nearest={type:"trainer",entity:trainer,distance}; best=distance; }
    });
    const town=townAt();
    if(town){const distance=Math.hypot(state.x-town.x,state.y-town.y);if(distance<best)nearest={type:"shop",entity:town,distance};}
    CASTLES.slice(0, MAIN_CASTLE_COUNT).forEach((castle, index) => {
      const distance = Math.hypot(state.x - castle.x, state.y - castle.y);
      if (distance < best) { nearest = { type: "castle", entity: castle, index, distance }; best = distance; }
    });
    if (mainRealmUnlocked()) {
      const distance = Math.hypot(state.x - MAGIC_GATE.x, state.y - MAGIC_GATE.y);
      if (distance < best) { nearest = { type: "gate", entity: MAGIC_GATE, distance }; best = distance; }
    }
    return nearest && nearest.distance < (nearest.type === "castle" ? 155 : 95) ? nearest : null;
  }
  function interact() {
    if(encounterAnimation || !dialogLayer.hidden)return;
    if (state.castle.active) { interactCastle(); return; }
    if (state.realm.active) { interactBossRealm(); return; }
    const target=nearestInteraction();
    if(!target){showToast("近くにはだれもいないみたい。草むらや町を探してみよう。");return;}
    if(target.type==="trainer")startBattle({...target.entity,kind:"trainer",team:trainerTeam(target.entity)});
    else if(target.type==="shop")openShop(target.entity);
    else if (target.type === "castle") openCastleEntrance(target.entity, target.index);
    else openMagicGate();
  }
  function openMagicGate() {
    if (!mainRealmUnlocked()) { showToast("5つの城をすべて攻略すると、魔法のゲートが開くよ。"); return; }
    openDialog(`<button class="dialog-close" type="button" aria-label="閉じる">×</button><p class="dialog-kicker">A NEW STORY BEGINS</p><h2 id="dialogTitle">魔法のゲート</h2><p class="dialog-copy">5つの城を攻略した力に反応して、ゲートが開いた！向こう側にはボスマジモン町と、新たな5つの城が待っている。</p><button class="primary-button full-button" type="button" data-realm-enter>🌌 ボスマジモン町へ進む</button>`);
  }
  function enterBossRealm() {
    if (!mainRealmUnlocked()) { showToast("先に5つの城をすべて攻略しよう。"); return; }
    state.realm.active = true;
    state.realm.playerX = BOSS_REALM.gate.x + 120;
    state.realm.playerY = BOSS_REALM.gate.y;
    state.realm.storySeen = true;
    keys.clear();
    closeDialog();
    updateHud();
    save();
  }
  function leaveBossRealm() {
    state.realm.active = false;
    state.x = MAGIC_GATE.x;
    state.y = MAGIC_GATE.y;
    keys.clear();
    updateHud();
    save();
    showToast("魔法のゲートを通って、ひだまり地方に戻った。");
  }
  function interactBossRealm() {
    const { playerX, playerY } = state.realm;
    const gateDistance = Math.hypot(playerX - BOSS_REALM.gate.x, playerY - BOSS_REALM.gate.y);
    if (gateDistance < 115) { leaveBossRealm(); return; }
    const townDistance = Math.hypot(playerX - bossTown.x, playerY - bossTown.y);
    if (townDistance < 125) { openShop(bossTown); return; }
    const nearbyCastle = visibleBossRealmCastles().map(({ castle, index }) => ({
      castle,
      index,
      distance: Math.hypot(playerX - castle.x, playerY - castle.y)
    })).sort((a, b) => a.distance - b.distance)[0];
    if (nearbyCastle && nearbyCastle.distance < 145) {
      openCastleEntrance(nearbyCastle.castle, nearbyCastle.index);
      return;
    }
    showToast("町のお店や城の近くで E を押して調べよう。");
  }
  function openCastleEntrance(castle, index) {
    const progress = state.castles[index];
    if (index > 0 && !state.castles[index - 1].bossDefeated) {
      showToast(`${CASTLES[index - 1].name}のボスを先に倒そう。`);
      return;
    }
    const status = castle.final
      ? progress.bossDefeated ? "魔王のマジモンを撃破した！この城の攻略は完了しているよ。" : `10種類の仕掛けをすべて突破しよう。奥には${castle.boss.name} Lv.${castle.boss.level}が待ち受けている！撃破すると冒険者と手持ちがLv.100になるよ。`
      : progress.bossDefeated ? `ボス撃破済み。能力「${castle.ability.name}」を獲得しているよ。もう一度探索することもできるよ。` : `第${index + 1}の城。仕掛け：「${castle.hint}」を解くと、ボス撃破で能力「${castle.ability.name}」を獲得できるよ。`;
    openDialog(`<button class="dialog-close" type="button" aria-label="閉じる">×</button><p class="dialog-kicker">CASTLE ${index + 1} / ${CASTLES.length}</p><h2 id="dialogTitle">${castle.name}</h2><p class="dialog-copy">${status}<br>矢印キーで歩き、仕掛けや扉の近くで E を押してね。</p><button class="primary-button full-button" type="button" data-castle-enter="${index}">🏰 城に入る</button>`);
  }
  function enterCastle(index) {
    if (index > 0 && !state.castles[index - 1].bossDefeated) { showToast("前の城のボスを倒してから進もう。"); return; }
    state.castle.active = true;
    state.castle.castleId = index;
    state.castle.room = 0;
    state.castle.playerX = 105;
    state.castle.playerY = 300;
    keys.clear();
    closeDialog();
    updateHud();
    save();
  }
  function leaveCastle(suppressToast = false) {
    state.castle.active = false;
    state.castle.room = 0;
    state.castle.playerX = 105;
    state.castle.playerY = 300;
    keys.clear();
    updateHud();
    save();
    if (!suppressToast) showToast("古城の外に出たよ。");
  }
  function moveCastleRoom(room, x) {
    state.castle.room = room;
    state.castle.playerX = x;
    state.castle.playerY = 300;
    keys.clear();
    save();
  }
  function completeCastlePuzzle(castle, progress) {
    if (castle.final) {
      const completed = FINAL_GIMMICKS[progress.finalStep];
      progress.finalStep++;
      progress.progress = 0;
      progress.boulderSteps = 0;
      progress.levers = [0, 0, 0];
      progress.mirrors = [0, 0, 0];
      state.castle.playerX = 105;
      progress.solved = progress.finalStep >= FINAL_GIMMICKS.length;
      showToast(progress.solved
        ? "10種類すべての仕掛けが動いた！魔王の間への扉が開いたよ。"
        : `${completed.name}の仕掛けを突破！次は「${FINAL_GIMMICKS[progress.finalStep].name}」だよ。`);
    } else {
      progress.solved = true;
      showToast(`${castle.name}の仕掛けが動いた！東の扉が開いたよ。`);
    }
    save();
  }
  function interactCastle() {
    const dungeon = state.castle;
    const progress = activeCastleProgress();
    const castle = activeCastleData();
    const mechanic = castle.final ? FINAL_GIMMICKS[progress.finalStep]?.id : castle.mechanic;
    const puzzleCastle = { ...castle, mechanic };
    const { room, playerX, playerY } = dungeon;
    if (playerX < 100 && Math.abs(playerY - 300) < 105) {
      if (room === 0) leaveCastle();
      else moveCastleRoom(room - 1, 800);
      return;
    }
    if (playerX > 800 && Math.abs(playerY - 300) < 105) {
      if (room < 3) {
        if (room === 0 && !progress.solved) { showToast("この城の仕掛けを先に解こう。"); return; }
        moveCastleRoom(room + 1, 100);
      } else {
        showToast(`${castle.boss.name}に近づいて E で勝負しよう。`);
      }
      return;
    }
    if (room === 0 && sequenceMechanics.includes(mechanic)) {
      const positions = [250, 450, 650];
      const index = positions.findIndex((x) => Math.hypot(playerX - x, playerY - 260) < 125);
      if (index < 0) { showToast("仕掛けの近くで E を押して調べよう。"); return; }
      const sequence = castleSequence(puzzleCastle);
      const expected = sequence[progress.progress];
      if (index !== expected) {
        progress.progress = index === sequence[0] ? 1 : 0;
        showToast("順番がちがうみたい。ヒントを見てやり直そう。");
        save();
      } else {
        progress.progress++;
        if (progress.progress === sequence.length) {
          completeCastlePuzzle(castle, progress);
        } else {
          showToast(`仕掛けが動いた！あと${sequence.length - progress.progress}つ。`);
          save();
        }
      }
      return;
    }
    if (room === 0 && mechanic === "boulder") {
      const boulderX = 350 + progress.boulderSteps * 70;
      if (Math.hypot(playerX - boulderX, playerY - 300) >= 130) { showToast("大きな岩の近くで E を押して押そう。"); return; }
      if (progress.boulderSteps < 3) { progress.boulderSteps++; dungeon.playerX = boulderX + 30; }
      if (progress.boulderSteps === 3) completeCastlePuzzle(castle, progress);
      else { showToast("岩を押した！床のスイッチまで運ぼう。"); save(); }
      return;
    }
    if (room === 0 && (mechanic === "levers" || mechanic === "torches")) {
      const index = [280, 450, 620].findIndex((x) => Math.hypot(playerX - x, playerY - 260) < 125);
      if (index < 0) { showToast(mechanic === "torches" ? "たいまつの近くで E を押して切り替えよう。" : "レバーの近くで E を押して切り替えよう。"); return; }
      progress.levers[index] = progress.levers[index] ? 0 : 1;
      const pattern = castleTogglePattern(puzzleCastle);
      if (progress.levers.join("") === pattern) completeCastlePuzzle(castle, progress);
      else {
        showToast(mechanic === "torches" ? "たいまつを切り替えた。正解は「消・点・点」だよ。" : "レバーを切り替えた。模様は「ON・OFF・ON」だよ。");
        save();
      }
      return;
    }
    if (room === 0 && (mechanic === "mirrors" || mechanic === "constellation")) {
      const index = [280, 450, 620].findIndex((x) => Math.hypot(playerX - x, playerY - 260) < 125);
      if (index < 0) { showToast(mechanic === "constellation" ? "水晶の近くで E を押して向きを変えよう。" : "鏡の近くで E を押して回そう。"); return; }
      progress.mirrors[index] = (progress.mirrors[index] + 1) % 4;
      const pattern = castleRotationPattern(puzzleCastle);
      if (progress.mirrors.join("") === pattern) completeCastlePuzzle(castle, progress);
      else {
        showToast(mechanic === "constellation" ? "水晶の向きを変えた。上・左・下に合わせよう。" : `鏡${index + 1}を回した。3つの光の向きを合わせよう。`);
        save();
      }
      return;
    }
    if (room === 3 && !progress.bossDefeated && Math.hypot(playerX - 700, playerY - 300) < 160) {
      startBattle({ ...castle.boss });
      save();
      return;
    }
    if (room === 3 && progress.bossDefeated) showToast("この城のボスはもういないよ。");
    else showToast("近くに調べられるものがないよ。");
  }
  document.getElementById("trainButton").addEventListener("click",trainPlayer);
  document.getElementById("dexButton").addEventListener("click",openMonsterDex);
  document.getElementById("partyButton").addEventListener("click",openPartyMenu);
  document.getElementById("gameMenuButton").addEventListener("click",openGameMenu);
  dialogLayer.addEventListener("click",(event)=>{
    if(event.target===dialogLayer){if(!battle)closeDialog();return;}
    const close=event.target.closest(".dialog-close");
    if(close){closeDialog();return;}
    const saveNow=event.target.closest("[data-save-now]");
    if(saveNow){closeDialog();save(true);return;}
    const returnTitle=event.target.closest("[data-return-title]");
    if(returnTitle){
      if(save())window.location.reload();
      else if(!saveWritesEnabled)showToast("セーブできないため、タイトルへ戻れません。");
      return;
    }
    const enterRealmButton=event.target.closest("[data-realm-enter]");
    if(enterRealmButton){enterBossRealm();return;}
    const enterCastleButton=event.target.closest("[data-castle-enter]");
    if(enterCastleButton){enterCastle(Number(enterCastleButton.dataset.castleEnter));return;}
    const partyButton=event.target.closest("[data-party-id]");
    if(partyButton){togglePartyMember(partyButton.dataset.partyId);return;}
    const buy=event.target.closest("[data-buy]");
    if(buy){buyItem(buy.dataset.buy,buy.dataset.town);return;}
    const action=event.target.closest("[data-battle]");
    if(!action||!battle)return;
    if(action.dataset.battle==="finish")finishBattleAndClose();
    else if(action.dataset.battle==="run")finishBattle("run");
    else if(action.dataset.battle==="capture")throwCaptureBall();
    else attack(action.dataset.battle);
  });
  dialogLayer.addEventListener("keydown",(event)=>{if(event.key==="Escape"&&!battle)closeDialog();});
  window.addEventListener("keydown",(event)=>{
    if(!state.characterId)return;
    const key = event.key.toLowerCase();
    const isArrow = ["arrowup","arrowdown","arrowleft","arrowright"].includes(key);
    if(isArrow){
      event.preventDefault();
    }
    if(encounterAnimation)return;
    if(event.key===" ")event.preventDefault();
    if(key==="e"&&!event.repeat)interact();
    if(event.key==="Escape"&&battle?.result)finishBattleAndClose();
    if(event.key===" ")return;
    if(event.target.matches("input,textarea,select,button")&&!event.target.closest("[hidden]"))return;
    if(!dialogLayer.hidden&&(isArrow||["w","a","s","d"].includes(key)))return;
    if (isArrow || ["w","a","s","d"].includes(key)) {
      if (!event.repeat && !state.castle.active && !state.realm.active) {
        const now = performance.now();
        if (FORWARD_KEYS.has(key)) {
          if (lastForwardTapAt !== null && now - lastForwardTapAt <= DOUBLE_TAP_WINDOW) {
            forwardSprintActive = true;
            lastForwardTapAt = null;
          } else {
            lastForwardTapAt = now;
          }
        } else if (BACKWARD_KEYS.has(key)) {
          if (lastBackwardTapAt !== null && now - lastBackwardTapAt <= DOUBLE_TAP_WINDOW) {
            state.facing = normalizeAngle(state.facing + Math.PI);
            lastBackwardTapAt = null;
            save();
            saveTime = now;
            return;
          }
          lastBackwardTapAt = now;
        }
      }
      keys.add(key);
      return;
    }
    keys.add(key);
  });
  window.addEventListener("keyup",(event)=>{
    const key = event.key.toLowerCase();
    keys.delete(key);
    if (FORWARD_KEYS.has(key) && ![...FORWARD_KEYS].some((forwardKey) => keys.has(forwardKey))) {
      forwardSprintActive = false;
    }
    if (!state.castle.active && !state.realm.active && (LEFT_KEYS.has(key) || RIGHT_KEYS.has(key))
      && ![...LEFT_KEYS, ...RIGHT_KEYS].some((turnKey) => keys.has(turnKey))) {
      save();
      saveTime = performance.now();
    }
  });
  window.addEventListener("blur",()=>{
    keys.clear();
    forwardSprintActive = false;
    lastForwardTapAt = null;
    lastBackwardTapAt = null;
  });
  window.addEventListener("resize",resizeCanvas);
  function resizeCanvas(){
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const miniRect=miniMapCanvas.getBoundingClientRect();
    miniMapCanvas.width=Math.max(1,Math.round(miniRect.width*ratio));
    miniMapCanvas.height=Math.max(1,Math.round(miniRect.height*ratio));
    miniMapCtx.setTransform(ratio,0,0,ratio,0,0);
  }
  function rounded(x,y,w,h,r,fill){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  }
  function projectPoint(x, y) {
    const dx = x - state.x, dy = y - state.y;
    const forward = dx * camera.forwardX + dy * camera.forwardY;
    const side = dx * camera.rightX + dy * camera.rightY;
    const depth = camera.distance + forward;
    if (depth < 28) return null;
    const scale = camera.focal / depth;
    return {
      x: camera.width / 2 + side * scale,
      y: camera.horizon + camera.eyeHeight * scale,
      scale,
      depth,
      forward
    };
  }
  function drawWorld(time) {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const turn = Math.atan2(Math.sin(state.facing - cameraHeading), Math.cos(state.facing - cameraHeading));
    cameraHeading += turn * .09;
    camera = {
      width,
      viewportHeight: height,
      focal: height * .92,
      horizon: height * .26,
      distance: 160,
      eyeHeight: 95,
      forwardX: Math.sin(cameraHeading),
      forwardY: -Math.cos(cameraHeading),
      rightX: Math.cos(cameraHeading),
      rightY: Math.sin(cameraHeading)
    };
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (state.castle.active) {
      worldColumn.classList.remove("is-boss-realm");
      worldColumn.classList.add("is-castle-interior");
      drawCastleWorld(time);
      return;
    }
    worldColumn.classList.remove("is-castle-interior");
    if (state.realm.active) {
      worldColumn.classList.add("is-boss-realm");
      drawBossRealm(time);
      return;
    }
    worldColumn.classList.remove("is-boss-realm");
    document.getElementById("movementHint").innerHTML = "左右 <kbd>A</kbd>/<kbd>←</kbd>旋回 · 前後 <kbd>W</kbd>/<kbd>↑</kbd> <kbd>S</kbd>/<kbd>↓</kbd>移動 · 前進2回（2回目を長押し）で加速 · 後退2回で反転";
    document.getElementById("contextHint").innerHTML = "話す・調べる <kbd>E</kbd>";
    document.querySelector(".world-label").textContent = "FOLLOW CAMERA · ひだまり地方";
    document.querySelector(".minimap-wrap > span").textContent = "WORLD MAP";
    document.querySelector(".map-chip").textContent = "🧭 ひだまり地方";
    drawSkyAndGround();
    drawPonds();
    drawGroundTufts();
    drawGrass();
    towns.forEach(drawTown);
    CASTLES.slice(0, MAIN_CASTLE_COUNT).forEach(drawCastle);
    if (mainRealmUnlocked()) drawMagicGate();
    patches.forEach((patch) => drawPatch(patch, time));
    starterGrassZones().forEach((patch) => drawPatch(patch, time));
    trainers.forEach(drawTrainer);
    drawPlayer(time);
    drawPartner(time);

    const near = nearestInteraction();
    const inGrass = grassPatchAt();
    document.getElementById("nearbyHint").textContent = near
      ? `${near.type === "shop" ? "🏠" : near.type === "castle" ? "🏰" : near.type === "gate" ? "🌀" : "✦"} ${near.type === "shop" ? `${near.entity.name} · Eでお店` : near.type === "castle" ? `${near.entity.name} · Eで入る` : near.type === "gate" ? "魔法のゲート · Eで入る" : `${near.entity.name} · Eでバトル`}`
      : inGrass ? "🌿 草むらに入るとマジモンがあらわれるよ" : "";
    const town = townAt();
    document.getElementById("locationName").textContent = town ? town.name : "ひだまり地方";
    document.getElementById("locationHint").textContent = near?.type === "castle" ? `Eで${near.entity.name}に入る` : near?.type === "gate" ? "Eで新しい世界へ" : town ? `${town.shop}があるよ` : inGrass ? "入るとすぐマジモンがあらわれるよ" : "草むらを探してみよう";
    document.getElementById("mapPlayerLegend").textContent = "🧑 トレーナー";
    drawMiniMap();
  }
  function drawMiniMap() {
    const width = miniMapCanvas.clientWidth, height = miniMapCanvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * ratio), pixelHeight = Math.round(height * ratio);
    if (miniMapCanvas.width !== pixelWidth || miniMapCanvas.height !== pixelHeight) {
      miniMapCanvas.width = pixelWidth;
      miniMapCanvas.height = pixelHeight;
    }
    miniMapCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    miniMapCtx.clearRect(0, 0, width, height);
    miniMapCtx.fillStyle = "#dcebd0";
    miniMapCtx.fillRect(0, 0, width, height);
    miniMapCtx.fillStyle = "rgba(132, 195, 199, .72)";
    [[250,870,145,86],[1940,970,135,90],[1070,190,115,56]].forEach(([x,y,rx,ry]) => {
      miniMapCtx.beginPath();
      miniMapCtx.ellipse(x / WORLD.width * width, y / WORLD.height * height, rx / WORLD.width * width, ry / WORLD.height * height, 0, 0, Math.PI * 2);
      miniMapCtx.fill();
    });
    miniMapCtx.strokeStyle = "rgba(255,255,255,.4)";
    miniMapCtx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      miniMapCtx.beginPath();
      miniMapCtx.moveTo(width * i / 4, 0);
      miniMapCtx.lineTo(width * i / 4, height);
      miniMapCtx.stroke();
    }
    for (let i = 1; i < 3; i++) {
      miniMapCtx.beginPath();
      miniMapCtx.moveTo(0, height * i / 3);
      miniMapCtx.lineTo(width, height * i / 3);
      miniMapCtx.stroke();
    }
    towns.forEach((town) => {
      const x = town.x / WORLD.width * width, y = town.y / WORLD.height * height;
      miniMapCtx.fillStyle = "#fffdf4";
      miniMapCtx.beginPath(); miniMapCtx.arc(x, y, 4, 0, Math.PI * 2); miniMapCtx.fill();
      miniMapCtx.fillStyle = "#5b875e";
      miniMapCtx.beginPath(); miniMapCtx.arc(x, y, 2.5, 0, Math.PI * 2); miniMapCtx.fill();
    });
    miniMapCtx.font = "12px sans-serif";
    miniMapCtx.textAlign = "center";
    CASTLES.slice(0, MAIN_CASTLE_COUNT).forEach((castle, index) => {
      const castleX = castle.x / WORLD.width * width, castleY = castle.y / WORLD.height * height;
      miniMapCtx.fillText(state.castles[index].bossDefeated ? "🏰" : index > 0 && !state.castles[index - 1].bossDefeated ? "🔒" : `🏰${index + 1}`, castleX, castleY + 4);
    });
    if (mainRealmUnlocked()) {
      miniMapCtx.fillText("🌀", MAGIC_GATE.x / WORLD.width * width, MAGIC_GATE.y / WORLD.height * height + 4);
    }
    const playerX = state.x / WORLD.width * width, playerY = state.y / WORLD.height * height;
    miniMapCtx.fillStyle = "rgba(255,255,255,.9)";
    miniMapCtx.beginPath(); miniMapCtx.arc(playerX, playerY, 6, 0, Math.PI * 2); miniMapCtx.fill();
    miniMapCtx.fillStyle = "#437caf";
    miniMapCtx.beginPath(); miniMapCtx.arc(playerX, playerY, 4, 0, Math.PI * 2); miniMapCtx.fill();
    miniMapCtx.save();
    miniMapCtx.translate(playerX, playerY);
    miniMapCtx.rotate(state.facing);
    miniMapCtx.fillStyle = "#fff";
    miniMapCtx.beginPath(); miniMapCtx.moveTo(0, -3); miniMapCtx.lineTo(2, 2); miniMapCtx.lineTo(-2, 2); miniMapCtx.closePath(); miniMapCtx.fill();
    miniMapCtx.restore();
  }
  function drawSkyAndGround() {
    const sky = ctx.createLinearGradient(0, 0, 0, camera.horizon);
    sky.addColorStop(0, "#a9d8e6");
    sky.addColorStop(1, "#e1edcf");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, camera.width, camera.viewportHeight);
    ctx.fillStyle = "#83b987";
    ctx.beginPath();
    ctx.moveTo(0, camera.horizon + 8);
    ctx.quadraticCurveTo(camera.width * .2, camera.horizon - 20, camera.width * .39, camera.horizon + 7);
    ctx.quadraticCurveTo(camera.width * .68, camera.horizon - 27, camera.width, camera.horizon + 5);
    ctx.lineTo(camera.width, camera.viewportHeight);
    ctx.lineTo(0, camera.viewportHeight);
    ctx.closePath();
    ctx.fill();
    const ground = ctx.createLinearGradient(0, camera.horizon, 0, camera.viewportHeight);
    ground.addColorStop(0, "rgba(181, 216, 151, .35)");
    ground.addColorStop(.55, "rgba(183, 217, 153, .92)");
    ground.addColorStop(1, "#b7d99a");
    ctx.fillStyle = ground;
    ctx.fillRect(0, camera.horizon, camera.width, camera.viewportHeight - camera.horizon);
  }
  function drawGroundTufts() {
    for (let gx = 24; gx < WORLD.width; gx += 54) {
      for (let gy = 24; gy < WORLD.height; gy += 54) {
        const hash = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;
        if (hash < .68 || towns.some((town) => Math.hypot(town.x - gx, town.y - gy) < 190)) continue;
        const point = projectPoint(gx, gy);
        if (!point || point.y < camera.horizon + 8 || point.y > camera.viewportHeight || point.x < -5 || point.x > camera.width + 5 || point.scale < .12) continue;
        const s = Math.min(point.scale, 1.5);
        ctx.strokeStyle = hash > .88 ? "rgba(248, 231, 154, .7)" : "rgba(85, 139, 73, .55)";
        ctx.lineWidth = Math.max(.6, s * 1.2);
        ctx.beginPath();
        ctx.moveTo(point.x - 3 * s, point.y);
        ctx.lineTo(point.x - 4 * s, point.y - 5 * s);
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x + 1 * s, point.y - 6 * s);
        ctx.moveTo(point.x + 3 * s, point.y);
        ctx.lineTo(point.x + 5 * s, point.y - 4 * s);
        ctx.stroke();
      }
    }
  }
  function drawPonds() {
    [[250, 870, 145, 86], [1940, 970, 135, 90], [1070, 190, 115, 56]].forEach(([x, y, rx, ry]) => {
      const point = projectPoint(x, y);
      if (!point || point.y < camera.horizon || point.scale < .08) return;
      const scale = Math.min(point.scale, 1.5);
      ctx.fillStyle = "#83c2c0";
      ctx.beginPath(); ctx.ellipse(point.x, point.y, rx * scale, Math.max(2, ry * scale * .55), 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = Math.max(1, 3 * scale);
      ctx.beginPath(); ctx.ellipse(point.x, point.y, rx * scale * .91, Math.max(1, ry * scale * .46), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.beginPath(); ctx.ellipse(point.x - 25 * scale, point.y - 7 * scale, 20 * scale, 3 * scale, -.14, 0, Math.PI * 2); ctx.fill();
    });
  }
  function drawGrass() {
    const items = [];
    for (let gx = 50; gx < WORLD.width; gx += 118) {
      for (let gy = 50; gy < WORLD.height; gy += 118) {
        const hash = Math.abs(Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453) % 1;
        const x = gx + hash * 44, y = gy + ((hash * 973) % 1) * 44;
        if (towns.some((town) => Math.hypot(town.x - x, town.y - y) < 245)) continue;
        if (patches.some((patch) => Math.hypot(patch.x - x, patch.y - y) < 90)) continue;
        if (Math.hypot(state.x - x, state.y - y) < 70) continue;
        const point = projectPoint(x, y);
        if (!point || point.y < camera.horizon || point.y > camera.viewportHeight + 35 || point.x < -90 || point.x > camera.width + 90 || point.scale < .09) continue;
        if (hash > .91) items.push({ point, hash });
      }
    }
    items.sort((a, b) => a.point.y - b.point.y);
    items.forEach(({ point }) => {
      const scale = Math.min(point.scale, 1.5);
      ctx.fillStyle = "#d9bd79";
      ctx.beginPath(); ctx.ellipse(point.x, point.y, 18 * scale, 9 * scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f5eddb";
      ctx.beginPath(); ctx.ellipse(point.x - 5 * scale, point.y - 3 * scale, 7 * scale, 4 * scale, -.4, 0, Math.PI * 2); ctx.fill();
    });
  }
  function drawTown(town) {
    const center = projectPoint(town.x, town.y);
    if (!center || center.y < camera.horizon - 60 || center.y > camera.viewportHeight + 120 || center.scale < .09) return;
    ctx.fillStyle = town.color;
    const townScale = Math.min(center.scale, 1.2);
    ctx.beginPath(); ctx.ellipse(center.x, center.y, 135 * townScale, 55 * townScale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.26)";
    ctx.beginPath(); ctx.ellipse(center.x, center.y, 108 * townScale, 38 * townScale, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const x = town.x - 128 + i * 64, y = town.y - 58 + (i % 2) * 18;
      const point = projectPoint(x, y);
      if (!point || point.scale < .08) continue;
      const s = Math.min(point.scale, 1.4);
      ctx.fillStyle = "rgba(60,77,53,.17)";
      ctx.beginPath(); ctx.ellipse(point.x, point.y, 22 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#a77c5c";
      ctx.beginPath(); ctx.moveTo(point.x - 22 * s, point.y - 27 * s); ctx.lineTo(point.x, point.y - 49 * s); ctx.lineTo(point.x + 22 * s, point.y - 27 * s); ctx.closePath(); ctx.fill();
      rounded(point.x - 19 * s, point.y - 28 * s, 38 * s, 29 * s, 5 * s, ["#fae9bd", "#f0f3db", "#f7dfb0"][i % 3]);
      ctx.fillStyle = "#bc986b"; ctx.fillRect(point.x - 5 * s, point.y - 15 * s, 10 * s, 16 * s);
    }
    const shop = projectPoint(town.x, town.y + 75);
    if (shop && shop.scale > .1 && shop.y < camera.viewportHeight - 20) {
      const s = Math.min(shop.scale, 1.3);
      rounded(shop.x - 31 * s, shop.y - 34 * s, 62 * s, 34 * s, 5 * s, "#56865d");
      ctx.fillStyle = "#fff8df"; ctx.textAlign = "center"; ctx.font = `bold ${Math.max(6, Math.min(12, 9 * s))}px sans-serif`;
      ctx.fillText("SHOP", shop.x, shop.y - 12 * s);
    }
    ctx.fillStyle = "#355f42"; ctx.textAlign = "center"; ctx.font = `bold ${Math.max(8, Math.min(14, 12 * center.scale))}px sans-serif`;
    ctx.fillText(`${town.icon} ${town.name}`, center.x, center.y - 72 * townScale);
  }
  function drawCastle(castle, index) {
    const point = projectPoint(castle.x, castle.y);
    if (!point || point.y < camera.horizon - 100 || point.y > camera.viewportHeight + 150 || point.scale < .08) return;
    const s = Math.min(point.scale, 1.15);
    const { x, y } = point;
    const defeated = state.castles[index].bossDefeated;
    ctx.fillStyle = "rgba(35,48,37,.28)";
    ctx.beginPath(); ctx.ellipse(x, y, 105 * s, 27 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ["#69645e", "#4d7376", "#98604c", "#657b94", "#72648b"][index];
    ctx.fillRect(x - 70 * s, y - 100 * s, 140 * s, 100 * s);
    ctx.fillStyle = ["#80756a", "#5f8a8b", "#bb7551", "#7894ab", "#8f7eaa"][index];
    ctx.fillRect(x - 100 * s, y - 128 * s, 45 * s, 128 * s);
    ctx.fillRect(x + 55 * s, y - 128 * s, 45 * s, 128 * s);
    ctx.fillStyle = ["#514a46", "#38575c", "#653d34", "#45556a", "#4e465f"][index];
    ctx.beginPath();
    ctx.moveTo(x - 108 * s, y - 128 * s); ctx.lineTo(x - 78 * s, y - 174 * s); ctx.lineTo(x - 48 * s, y - 128 * s); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 48 * s, y - 128 * s); ctx.lineTo(x + 78 * s, y - 174 * s); ctx.lineTo(x + 108 * s, y - 128 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#4a4039";
    ctx.beginPath(); ctx.roundRect(x - 19 * s, y - 59 * s, 38 * s, 59 * s, [18 * s, 18 * s, 0, 0]); ctx.fill();
    ctx.fillStyle = "#d9c48d";
    ctx.beginPath(); ctx.arc(x, y - 30 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "center"; ctx.font = `bold ${Math.max(9, 13 * s)}px sans-serif`;
    ctx.fillStyle = defeated ? "#d9c48d" : "rgba(255,255,247,.95)";
    ctx.fillText(`🏰 ${castle.name}`, x, y - 188 * s);
    ctx.font = `bold ${Math.max(7, 9 * s)}px sans-serif`;
    ctx.fillText(defeated ? "攻略済み" : `第${index + 1}の城`, x, y - 171 * s);
  }
  function drawMagicGate() {
    const point = projectPoint(MAGIC_GATE.x, MAGIC_GATE.y);
    if (!point || point.y < camera.horizon - 100 || point.y > camera.viewportHeight + 150 || point.scale < .08) return;
    const s = Math.min(point.scale, 1.15), { x, y } = point;
    ctx.fillStyle = "rgba(35,25,70,.36)";
    ctx.beginPath(); ctx.ellipse(x, y, 65 * s, 20 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(111,82,196,.38)";
    ctx.beginPath(); ctx.ellipse(x, y - 54 * s, 37 * s, 57 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#d5b9ff"; ctx.lineWidth = Math.max(2, 6 * s);
    ctx.beginPath(); ctx.ellipse(x, y - 54 * s, 37 * s, 57 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = "center"; ctx.font = `${Math.max(28, 48 * s)}px sans-serif`;
    ctx.fillText("🌀", x, y - 39 * s);
    ctx.fillStyle = "#fff8ff"; ctx.font = `bold ${Math.max(9, 13 * s)}px sans-serif`;
    ctx.fillText("魔法のゲート", x, y - 125 * s);
  }
  function drawBossRealm(time) {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    const sx = width / BOSS_REALM.width, sy = height / BOSS_REALM.height;
    const point = (location) => ({ x: location.x * sx, y: location.y * sy });
    document.querySelector(".map-chip").textContent = "🌌 ボスマジモン町";
    document.querySelector(".world-label").textContent = "BOSS MONSTER WORLD";
    document.getElementById("movementHint").innerHTML = "画面方向へ移動 <kbd>W</kbd>/<kbd>A</kbd>/<kbd>S</kbd>/<kbd>D</kbd> · <kbd>↑</kbd>/<kbd>←</kbd>/<kbd>↓</kbd>/<kbd>→</kbd>";
    document.getElementById("contextHint").innerHTML = "町・城で調べる <kbd>E</kbd>";
    ctx.fillStyle = "#171b37";
    ctx.fillRect(0, 0, width, height);
    const land = ctx.createLinearGradient(0, 0, width, height);
    land.addColorStop(0, "#413f70");
    land.addColorStop(.55, "#293c63");
    land.addColorStop(1, "#4c325d");
    ctx.fillStyle = land;
    ctx.beginPath(); ctx.ellipse(width / 2, height / 2, width * .47, height * .44, -.12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(115,190,207,.2)";
    [[350,700,220,110],[2220,920,180,130],[1230,1510,260,90]].forEach(([x,y,rx,ry]) => {
      ctx.beginPath(); ctx.ellipse(x * sx, y * sy, rx * sx, ry * sy, -.2, 0, Math.PI * 2); ctx.fill();
    });
    const gate = point(BOSS_REALM.gate), town = point(bossTown);
    const realmCastles = visibleBossRealmCastles();
    ctx.strokeStyle = "rgba(239,214,255,.62)";
    ctx.lineWidth = Math.max(3, 10 * Math.min(sx, sy));
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(gate.x, gate.y); ctx.lineTo(town.x, town.y); ctx.stroke();
    realmCastles.forEach(({ castle }) => {
      const castlePoint = point(castle);
      ctx.beginPath(); ctx.moveTo(town.x, town.y); ctx.lineTo(castlePoint.x, castlePoint.y); ctx.stroke();
    });
    ctx.lineCap = "butt";
    ctx.textAlign = "center";
    realmCastles.filter(({ castle }) => !castle.final).forEach(({ castle, index }) => {
      const castlePoint = point(castle);
      const defeated = state.castles[index].bossDefeated;
      ctx.fillStyle = defeated ? "#b5d88c" : "#bba5dc";
      ctx.beginPath(); ctx.arc(castlePoint.x, castlePoint.y, Math.max(20, 33 * Math.min(sx, sy)), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = defeated ? "#ecffd3" : "#f1dcff"; ctx.lineWidth = Math.max(2, 4 * Math.min(sx, sy)); ctx.stroke();
      ctx.font = `${Math.max(20, 34 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.fillText("🏰", castlePoint.x, castlePoint.y + 11 * sy);
      ctx.font = `bold ${Math.max(10, 14 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillStyle = "#fff9ff";
      ctx.fillText(`第${index - MAIN_CASTLE_COUNT + 1}城 · ${castle.name}`, castlePoint.x, castlePoint.y - 48 * sy);
      ctx.fillText(defeated ? "攻略済み" : "ボスに挑戦", castlePoint.x, castlePoint.y + 53 * sy);
    });
    const finalCastle = realmCastles.find(({ castle }) => castle.final);
    if (finalCastle) {
      const castlePoint = point(finalCastle.castle), defeated = state.castles[finalCastle.index].bossDefeated;
      ctx.fillStyle = defeated ? "#9dc87e" : "#c85567";
      ctx.beginPath(); ctx.arc(castlePoint.x, castlePoint.y, Math.max(34, 54 * Math.min(sx, sy)), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = defeated ? "#eaffd7" : "#ffe0b9"; ctx.lineWidth = Math.max(3, 6 * Math.min(sx, sy)); ctx.stroke();
      ctx.font = `${Math.max(32, 52 * Math.min(sx, sy))}px sans-serif`; ctx.fillStyle = "#fff";
      ctx.fillText("🏰", castlePoint.x, castlePoint.y + 17 * sy);
      ctx.font = `bold ${Math.max(12, 17 * Math.min(sx, sy))}px sans-serif`; ctx.fillStyle = "#fff5e8";
      ctx.fillText("最終城 · 魔王の城", castlePoint.x, castlePoint.y - 72 * sy);
      ctx.fillText(defeated ? "世界に平和が戻った" : "魔王 Lv.100", castlePoint.x, castlePoint.y + 80 * sy);
    }
    ctx.fillStyle = "#eddcaa";
    ctx.beginPath(); ctx.roundRect(town.x - 85 * sx, town.y - 45 * sy, 170 * sx, 90 * sy, 16); ctx.fill();
    ctx.strokeStyle = "#fff0bc"; ctx.lineWidth = Math.max(2, 4 * Math.min(sx, sy)); ctx.stroke();
    ctx.font = `${Math.max(24, 38 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText("🏘️", town.x, town.y + 9 * sy);
    ctx.font = `bold ${Math.max(11, 16 * Math.min(sx, sy))}px sans-serif`; ctx.fillStyle = "#453652";
    ctx.fillText("ボスマジモン町", town.x, town.y - 60 * sy);
    const gatePoint = point(BOSS_REALM.gate);
    ctx.font = `${Math.max(27, 44 * Math.min(sx, sy))}px sans-serif`; ctx.fillText("🌀", gatePoint.x, gatePoint.y + 14 * sy);
    ctx.font = `bold ${Math.max(10, 14 * Math.min(sx, sy))}px sans-serif`; ctx.fillStyle = "#fff9ff";
    ctx.fillText("ひだまり地方へのゲート", gatePoint.x, gatePoint.y - 38 * sy);
    const player = point({ x: state.realm.playerX, y: state.realm.playerY });
    const bob = Math.sin(time / 160) * 3 * Math.min(sx, sy);
    ctx.font = `${Math.max(23, 36 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText("🧑", player.x, player.y + bob);
    ctx.font = `${Math.max(18, 27 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText(playerCharacter()?.emoji || "❔", player.x + 30 * sx, player.y + 9 * sy - bob * .5);

    const gateDistance = Math.hypot(state.realm.playerX - BOSS_REALM.gate.x, state.realm.playerY - BOSS_REALM.gate.y);
    const townDistance = Math.hypot(state.realm.playerX - bossTown.x, state.realm.playerY - bossTown.y);
    const nearbyCastle = visibleBossRealmCastles().map(({ castle, index }) => ({
      castle,
      index,
      distance: Math.hypot(state.realm.playerX - castle.x, state.realm.playerY - castle.y)
    })).sort((a, b) => a.distance - b.distance)[0];
    document.getElementById("nearbyHint").textContent = gateDistance < 130
      ? "🌀 Eでひだまり地方へ戻る"
      : townDistance < 150
        ? "🏠 ボスマジモン町 · Eでお店"
        : nearbyCastle && nearbyCastle.distance < 175
          ? `🏰 ${nearbyCastle.castle.name} · Eで入る`
          : finalCastleUnlocked() ? "10個の城を制覇！異世界の中央に魔王の城が現れたよ。" : "城を順番に攻略しよう。町のお店も利用できるよ。";
    document.getElementById("locationName").textContent = townDistance < 170 ? bossTown.name : "異世界";
    document.getElementById("locationHint").textContent = gateDistance < 130
      ? "Eで魔法のゲートから戻る"
      : townDistance < 150 ? `${bossTown.shop}があるよ` : finalCastleUnlocked() ? "異世界の中心に最後の城が現れた！" : "5つの異世界の城があるよ";
    document.getElementById("mapPlayerLegend").textContent = "🧑 トレーナー";
  }
  function drawCastleWorld(time) {
    const { width, viewportHeight: height } = camera;
    const sx = width / DUNGEON.width, sy = height / DUNGEON.height;
    const castle = activeCastleData();
    const progress = activeCastleProgress();
    const mechanic = castle.final ? FINAL_GIMMICKS[progress.finalStep]?.id : castle.mechanic;
    const puzzleCastle = { ...castle, mechanic };
    document.querySelector(".map-chip").textContent = `🏰 ${castle.name}`;
    document.getElementById("movementHint").innerHTML = "画面方向へ移動 <kbd>W</kbd>/<kbd>A</kbd>/<kbd>S</kbd>/<kbd>D</kbd> · <kbd>↑</kbd>/<kbd>←</kbd>/<kbd>↓</kbd>/<kbd>→</kbd>";
    document.getElementById("contextHint").innerHTML = "仕掛けを調べる <kbd>E</kbd>";
    ctx.fillStyle = "#272a2b";
    ctx.fillRect(0, 0, width, height);
    const stone = ctx.createLinearGradient(0, 20 * sy, 0, height);
    stone.addColorStop(0, "#625a50");
    stone.addColorStop(1, "#393b3b");
    ctx.fillStyle = stone;
    ctx.beginPath(); ctx.roundRect(25 * sx, 22 * sy, 850 * sx, 556 * sy, 20 * Math.min(sx, sy)); ctx.fill();
    ctx.strokeStyle = "#97866e"; ctx.lineWidth = Math.max(2, 5 * Math.min(sx, sy));
    ctx.stroke();
    ctx.fillStyle = "#81725e";
    ctx.fillRect(48 * sx, 46 * sy, 804 * sx, 508 * sy);
    for (let x = 58; x < 850; x += 56) {
      for (let y = 52; y < 555; y += 52) {
        ctx.fillStyle = ((Math.floor(x / 56) + Math.floor(y / 52)) % 2) ? "rgba(255,240,201,.055)" : "rgba(30,31,31,.08)";
        ctx.fillRect(x * sx, y * sy, 54 * sx, 50 * sy);
      }
    }
    ctx.strokeStyle = "rgba(232,213,175,.22)";
    ctx.lineWidth = Math.max(1, 2 * Math.min(sx, sy));
    ctx.strokeRect(70 * sx, 68 * sy, 760 * sx, 464 * sy);
    ctx.fillStyle = "#28292a";
    ctx.fillRect(0, 0, width, 28 * sy);
    ctx.fillRect(0, height - 23 * sy, width, 23 * sy);
    ctx.fillRect(0, 0, 25 * sx, height);
    ctx.fillRect(width - 25 * sx, 0, 25 * sx, height);
    ctx.fillStyle = "#a58b5e";
    ctx.fillRect(0, 268 * sy, 50 * sx, 64 * sy);
    ctx.fillRect(width - 50 * sx, 268 * sy, 50 * sx, 64 * sy);
    ctx.fillStyle = "#fff2c7";
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.max(11, 17 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText(state.castle.room === 0 ? "出口" : "戻る", 24 * sx, 260 * sy);
    if (state.castle.room < 3) {
      ctx.fillStyle = state.castle.room > 0 || progress.solved ? "#74b66f" : "#b55c4d";
      ctx.fillRect(width - 50 * sx, 268 * sy, 50 * sx, 64 * sy);
      ctx.fillStyle = "#fff2c7";
      ctx.fillText("進む", width - 24 * sx, 260 * sy);
    }
    const room = state.castle.room;
    ctx.fillStyle = "#fff3d4";
    ctx.font = `bold ${Math.max(16, 24 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText(`${castle.name} · ${DUNGEON.roomNames[room]}`, width / 2, 42 * sy);
    ctx.font = `${Math.max(10, 14 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillStyle = "rgba(255,248,226,.84)";
    const finalGimmick = castle.final && !progress.solved ? FINAL_GIMMICKS[progress.finalStep] : null;
    const firstRoomHint = castle.final
      ? progress.solved ? "10種類の仕掛けを突破した！魔王の間へ進もう" : `仕掛け ${progress.finalStep + 1} / ${FINAL_GIMMICKS.length} · ${finalGimmick.hint}`
      : castle.hint;
    const hints = [firstRoomHint, "静かな回廊を進もう。出口は右側だよ", "守護者の回廊を進もう。出口は右側だよ", progress.bossDefeated ? "ボスを撃破した！左の扉から戻ろう" : `${castle.boss.name}に近づいて E で勝負`];
    ctx.textAlign = "left";
    ctx.fillText(hints[room], 78 * sx, 71 * sy);
    if (room === 0 && sequenceMechanics.includes(mechanic)) {
      const positions = [250, 450, 650];
      const sequence = castleSequence(puzzleCastle);
      const symbols = {
        runes: ["Ⅰ", "Ⅱ", "Ⅲ"],
        bells: ["左", "中", "右"],
        prisms: ["白", "青", "紫"],
        orbs: ["左", "中", "右"],
        chimes: ["左", "中", "右"]
      }[mechanic];
      const colors = {
        runes: ["#7a7864", "#7a7864", "#7a7864"],
        bells: ["#706a67", "#706a67", "#706a67"],
        prisms: ["#b6dff0", "#6588d4", "#a46bd1"],
        orbs: ["#4c7fc5", "#726bc9", "#d18b4d"],
        chimes: ["#d9b866", "#b8c5da", "#8d92c4"]
      }[mechanic];
      positions.forEach((x, index) => {
        const px = x * sx, py = 260 * sy;
        const lit = sequence.slice(0, progress.progress).includes(index) || progress.solved;
        ctx.fillStyle = lit ? "#f5d477" : colors[index];
        if (mechanic === "prisms") {
          ctx.beginPath(); ctx.moveTo(px, py - 39 * sy); ctx.lineTo(px + 35 * sx, py); ctx.lineTo(px, py + 39 * sy); ctx.lineTo(px - 35 * sx, py); ctx.closePath(); ctx.fill();
        } else if (mechanic === "chimes") {
          ctx.beginPath(); ctx.roundRect(px - 25 * sx, py - 32 * sy, 50 * sx, 64 * sy, 14); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(px, py, 37 * Math.min(sx, sy), 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = lit ? "#fff2b0" : "#e4d6ef"; ctx.lineWidth = 3 * Math.min(sx, sy); ctx.stroke();
        ctx.fillStyle = "#fff8e6"; ctx.font = `bold ${Math.max(13, 20 * Math.min(sx, sy))}px sans-serif`;
        ctx.fillText(symbols[index], px, py + 7 * sy);
      });
    } else if (room === 0 && mechanic === "boulder") {
      const targetX = 350 + 3 * 70;
      ctx.fillStyle = progress.solved ? "#77b775" : "#6e9a76";
      ctx.beginPath(); ctx.ellipse(targetX * sx, 300 * sy, 49 * sx, 29 * sy, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c8e0a2"; ctx.lineWidth = 4 * Math.min(sx, sy);
      ctx.beginPath(); ctx.ellipse(targetX * sx, 300 * sy, 35 * sx, 18 * sy, 0, 0, Math.PI * 2); ctx.stroke();
      const boulderX = 350 + progress.boulderSteps * 70;
      ctx.fillStyle = "#aaa398"; ctx.beginPath(); ctx.arc(boulderX * sx, 300 * sy, 31 * Math.min(sx, sy), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e0d3bd"; ctx.lineWidth = 3 * Math.min(sx, sy); ctx.stroke();
      ctx.fillStyle = "#5b5147"; ctx.font = `bold ${Math.max(18, 30 * Math.min(sx, sy))}px sans-serif`; ctx.fillText("◆", boulderX * sx, 310 * sy);
      ctx.fillStyle = "#fff3d4"; ctx.font = `${Math.max(10, 14 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillText(`岩を押した回数 ${progress.boulderSteps} / 3`, width / 2, 390 * sy);
    } else if (room === 0 && (mechanic === "levers" || mechanic === "torches")) {
      [280, 450, 620].forEach((x, index) => {
        const on = progress.levers[index] === 1;
        if (mechanic === "torches") {
          ctx.fillStyle = "#59453e"; ctx.fillRect((x - 15) * sx, 270 * sy, 30 * sx, 65 * sy);
          ctx.fillStyle = on ? "#ffb84f" : "#5c5350"; ctx.beginPath(); ctx.ellipse(x * sx, 256 * sy, 15 * sx, (on ? 26 : 15) * sy, 0, 0, Math.PI * 2); ctx.fill();
          if (on) { ctx.fillStyle = "rgba(255,172,55,.22)"; ctx.beginPath(); ctx.arc(x * sx, 254 * sy, 38 * Math.min(sx, sy), 0, Math.PI * 2); ctx.fill(); }
        } else {
          ctx.fillStyle = on ? "#70b878" : "#71695e"; ctx.fillRect((x - 24) * sx, 250 * sy, 48 * sx, 85 * sy);
          ctx.strokeStyle = "#e7d8b8"; ctx.lineWidth = 3 * Math.min(sx, sy); ctx.strokeRect((x - 24) * sx, 250 * sy, 48 * sx, 85 * sy);
          ctx.strokeStyle = on ? "#d9f6b6" : "#c5b99f"; ctx.lineWidth = 9 * Math.min(sx, sy);
          ctx.beginPath(); ctx.moveTo(x * sx, 307 * sy); ctx.lineTo((x + (on ? 16 : -16)) * sx, 276 * sy); ctx.stroke();
        }
      });
      ctx.fillStyle = "#d9f6b6"; ctx.font = `bold ${Math.max(12, 19 * Math.min(sx, sy))}px sans-serif`; ctx.textAlign = "center";
      ctx.fillText(mechanic === "torches" ? "正解：消 ・ 点 ・ 点" : "正解：ON ・ OFF ・ ON", width / 2, 390 * sy);
    } else if (room === 0 && (mechanic === "mirrors" || mechanic === "constellation")) {
      [280, 450, 620].forEach((x, index) => {
        const turns = progress.mirrors[index];
        if (mechanic === "constellation") {
          ctx.fillStyle = "#dcecff"; ctx.beginPath(); ctx.arc(x * sx, 260 * sy, 34 * Math.min(sx, sy), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#6b5b97"; ctx.font = `bold ${Math.max(24, 34 * Math.min(sx, sy))}px sans-serif`;
          ctx.fillText(["↑", "→", "↓", "←"][turns], x * sx, 272 * sy);
        } else {
          ctx.fillStyle = "#b9dbe5"; ctx.beginPath(); ctx.roundRect((x - 31) * sx, 228 * sy, 62 * sx, 64 * sy, 8); ctx.fill();
          ctx.strokeStyle = "#f4fbff"; ctx.lineWidth = 5 * Math.min(sx, sy);
          ctx.beginPath();
          if (turns % 2) { ctx.moveTo((x - 21) * sx, 280 * sy); ctx.lineTo((x + 21) * sx, 240 * sy); }
          else { ctx.moveTo((x - 21) * sx, 240 * sy); ctx.lineTo((x + 21) * sx, 280 * sy); }
          ctx.stroke();
          ctx.fillStyle = "#fff4b8"; ctx.font = `bold ${Math.max(13, 20 * Math.min(sx, sy))}px sans-serif`;
          ctx.fillText(["↗", "↘", "↖", "↙"][turns], x * sx, 335 * sy);
        }
      });
      ctx.fillStyle = "#fff3d4"; ctx.font = `${Math.max(10, 14 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillText(mechanic === "constellation" ? "向き：← ・ ↑ ・ ↓" : "光の向き：↘ ・ ↙ ・ ↗", width / 2, 390 * sy);
    } else if (room === 1 || room === 2) {
      ctx.fillStyle = "rgba(25,27,27,.42)";
      ctx.fillRect(100 * sx, 170 * sy, 700 * sx, 260 * sy);
      ctx.strokeStyle = room === 1 ? "#b1a27d" : "#91a8ba";
      ctx.lineWidth = 6 * Math.min(sx, sy);
      [150, 750].forEach((x) => {
        ctx.strokeRect(x * sx, 130 * sy, 28 * sx, 340 * sy);
        ctx.beginPath(); ctx.moveTo((x - 12) * sx, 130 * sy); ctx.lineTo((x + 14) * sx, 105 * sy); ctx.lineTo((x + 42) * sx, 130 * sy); ctx.stroke();
      });
      ctx.fillStyle = room === 1 ? "rgba(217,197,143,.2)" : "rgba(145,186,208,.2)";
      ctx.fillRect(190 * sx, 250 * sy, 520 * sx, 100 * sy);
    } else if (room === 3 && !progress.bossDefeated) {
      ctx.fillStyle = "rgba(35,30,27,.45)";
      ctx.beginPath(); ctx.ellipse(700 * sx, 313 * sy, 54 * sx, 17 * sy, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${Math.max(43, 74 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillText(castle.boss.emoji, 700 * sx, 305 * sy);
      ctx.fillStyle = "#fff6dc"; ctx.font = `bold ${Math.max(12, 17 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillText(castle.boss.name, 700 * sx, 345 * sy);
      ctx.fillStyle = "#d77d67";
      ctx.fillRect(648 * sx, 354 * sy, 104 * sx, 8 * sy);
    } else {
      ctx.fillStyle = "#e5d7a8";
      ctx.font = `${Math.max(46, 70 * Math.min(sx, sy))}px sans-serif`;
      ctx.fillText("✨", 700 * sx, 310 * sy);
    }
    const bob = Math.sin(time / 160) * 3 * Math.min(sx, sy);
    ctx.fillStyle = "rgba(23,26,26,.36)";
    ctx.beginPath(); ctx.ellipse(state.castle.playerX * sx, state.castle.playerY * sy + 8 * sy, 22 * sx, 8 * sy, 0, 0, Math.PI * 2); ctx.fill();
    ctx.font = `${Math.max(24, 38 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText("🧑", state.castle.playerX * sx, state.castle.playerY * sy + bob);
    ctx.font = `${Math.max(19, 30 * Math.min(sx, sy))}px sans-serif`;
    ctx.fillText(playerCharacter()?.emoji || "❔", (state.castle.playerX + 34) * sx, (state.castle.playerY + 9) * sy - bob * .5);
    const puzzlePositions = [250, 450, 650];
    const nearPuzzle = room === 0 && (sequenceMechanics.includes(mechanic) || mechanic === "levers" || mechanic === "torches" || mechanic === "mirrors" || mechanic === "constellation") && puzzlePositions.some((x) => Math.hypot(state.castle.playerX - x, state.castle.playerY - 260) < 125);
    const nearBoulder = room === 0 && mechanic === "boulder" && Math.hypot(state.castle.playerX - (350 + progress.boulderSteps * 70), state.castle.playerY - 300) < 130;
    const roomHint = room === 3 && Math.hypot(state.castle.playerX - 700, state.castle.playerY - 300) < 160 && !progress.bossDefeated
      ? `⚔ ${castle.boss.name} · Eでバトル`
      : nearPuzzle ? mechanic === "runes" ? "✦ Eで紋章を調べる" : mechanic === "bells" ? "🔔 Eで鐘を鳴らす" : mechanic === "levers" ? "⚙ Eでレバーを切り替える" : mechanic === "torches" ? "🔥 Eでたいまつを切り替える" : mechanic === "constellation" ? "💎 Eで水晶の向きを変える" : mechanic === "mirrors" ? "🪞 Eで鏡を回す" : "✦ Eで仕掛けを調べる"
        : nearBoulder ? "🪨 Eで岩を押す"
      : state.castle.playerX < 100 && Math.abs(state.castle.playerY - 300) < 105
        ? room === 0 ? `Eで${castle.name}の外へ出る` : "Eで前の部屋へ戻る"
        : state.castle.playerX > 800 && Math.abs(state.castle.playerY - 300) < 105
          ? room < 3 ? room > 0 || progress.solved ? "Eで次の部屋へ進む" : "仕掛けを解くと扉が開く" : ""
          : "仕掛けの近くで E を押して調べる";
    document.getElementById("nearbyHint").textContent = roomHint;
    document.getElementById("locationName").textContent = `${castle.name} · ${DUNGEON.roomNames[room]}`;
    document.getElementById("locationHint").textContent = room === 3 && progress.bossDefeated ? "ボスを撃破！左の扉から戻ろう" : `部屋 ${room + 1} / 4 · Eで調べる`;
    document.querySelector(".world-label").textContent = "CASTLE DUNGEON";
    document.querySelector(".minimap-wrap > span").textContent = "CASTLE MAP";
    document.getElementById("mapPlayerLegend").textContent = "🧑 トレーナー";
  }
  function drawPatch(patch, time) {
    const point = projectPoint(patch.x, patch.y);
    if (!point || point.y < camera.horizon || point.y > camera.viewportHeight + 30 || point.scale < .09) return;
    const { x, y } = point;
    const scale = Math.min(point.scale, 1.8);
    const ready = state.patchReady[patch.id] !== false;
    ctx.fillStyle = ready ? "#66a35d" : "#85b779";
    ctx.beginPath(); ctx.ellipse(x, y, 42 * scale, 14 * scale, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 9; i++) {
      const bladeX = x + (-30 + i * 8) * scale, bladeY = y + 3 * scale;
      ctx.strokeStyle = i % 2 ? "#4f8e57" : "#92bf72"; ctx.lineWidth = Math.max(1, 2.5 * scale);
      ctx.beginPath(); ctx.moveTo(bladeX, bladeY); ctx.quadraticCurveTo(bladeX - 3 * scale, bladeY - 14 * scale, bladeX + (i % 2 ? 7 : -7) * scale, bladeY - 25 * scale); ctx.stroke();
    }
    ctx.textAlign = "center";
    if (ready) {
      ctx.fillStyle = "#fff7d9"; ctx.font = `bold ${Math.max(11, Math.min(20, 18 * scale))}px sans-serif`;
      ctx.fillText("✦", x, y - 28 * scale + Math.sin(time / 230 + patch.x) * 2);
    } else {
      ctx.font = `${Math.max(10, Math.min(19, 17 * scale))}px sans-serif`; ctx.fillText("🌱", x, y + 5 * scale);
    }
  }
  function drawTrainer(trainer) {
    if (state.defeated.includes(trainer.id)) return;
    const point = projectPoint(trainer.x, trainer.y);
    if (!point || point.y < camera.horizon || point.y > camera.viewportHeight + 60 || point.x < -80 || point.x > camera.width + 80 || point.scale < .08) return;
    drawPerson(point, trainer.color, trainer.name, false);
  }
  function drawPerson(point, color, label, player) {
    const { x, y, scale } = point;
    const s = Math.min(scale, 2);
    ctx.fillStyle = "rgba(45,76,45,.22)";
    ctx.beginPath(); ctx.ellipse(x, y, 14 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = player ? "#344f68" : color;
    ctx.beginPath(); ctx.roundRect(x - 10 * s, y - 32 * s, 20 * s, 30 * s, 6 * s); ctx.fill();
    ctx.fillStyle = "#f2c99e";
    ctx.beginPath(); ctx.arc(x, y - 42 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = player ? "#496d52" : "#5b5549";
    ctx.beginPath(); ctx.ellipse(x, y - 47 * s, 9 * s, 5 * s, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = player ? "#f5eee0" : "#fff";
    ctx.fillRect(x - 6 * s, y - 12 * s, 12 * s, 4 * s);
    if (label && scale > .24) {
      ctx.fillStyle = "rgba(255,255,247,.92)";
      ctx.beginPath(); ctx.roundRect(x - 24 * s, y - 68 * s, 48 * s, 14 * s, 5 * s); ctx.fill();
      ctx.fillStyle = "#526a53"; ctx.textAlign = "center"; ctx.font = `bold ${Math.max(7, 8 * s)}px sans-serif`;
      ctx.fillText(label, x, y - 58 * s);
    }
  }
  function drawPlayer(time) {
    const point = projectPoint(state.x, state.y);
    if (!point) return;
    const bob = Math.sin(time / 150) * 1.2;
    point.y += bob;
    drawPerson(point, "#487ca1", "トレーナー", true);
  }
  function drawPartner(time) {
    const character = playerCharacter();
    if (!character || !camera) return;
    const sideX = camera.forwardX * 5 + camera.rightX * 42;
    const sideY = camera.forwardY * 5 + camera.rightY * 42;
    const point = projectPoint(state.x + sideX, state.y + sideY);
    if (!point || point.y < camera.horizon || point.y > camera.viewportHeight + 50 || point.x < -60 || point.x > camera.width + 60) return;
    const { x, y, scale } = point;
    const size = Math.max(16, Math.min(38, 29 * scale));
    const bob = Math.sin(time / 170 + 1) * 2 * Math.min(scale, 2);
    ctx.fillStyle = "rgba(45,76,45,.2)";
    ctx.beginPath(); ctx.ellipse(x, y, 13 * scale, 5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "center";
    ctx.font = `${size}px sans-serif`;
    ctx.fillText(character.emoji, x, y - 7 * scale + bob);
    if (scale > .24) {
      ctx.fillStyle = "rgba(255,255,247,.92)";
      ctx.beginPath(); ctx.roundRect(x - 31 * scale, y - 47 * scale, 62 * scale, 14 * scale, 5 * scale); ctx.fill();
      ctx.fillStyle = "#526a53";
      ctx.font = `bold ${Math.max(7, 8 * scale)}px sans-serif`;
      ctx.fillText(character.name, x, y - 37 * scale);
    }
  }
  function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }
  function updateMovement(delta){
    if(!dialogLayer.hidden || encounterAnimation)return;
    if (state.castle.active) { updateCastleMovement(delta); return; }
    if (state.realm.active) { updateBossRealmMovement(delta); return; }
    const turnRight = keys.has("arrowright") || keys.has("d");
    const turnLeft = keys.has("arrowleft") || keys.has("a");
    const turnDirection = Number(turnRight) - Number(turnLeft);
    if (turnDirection) state.facing = normalizeAngle(state.facing + turnDirection * TURN_SPEED * delta / 1000);

    const forward = keys.has("arrowup") || keys.has("w");
    const backward = keys.has("arrowdown") || keys.has("s");
    const direction = Number(forward) - Number(backward);
    let distance = 0;
    if (direction) {
      const speed = direction > 0 && forwardSprintActive ? 180 : 150;
      distance = speed * delta / 1000 * direction;
      const previousGrass = grassPatchAt();
      state.x = Math.max(30, Math.min(WORLD.width - 30, state.x + Math.sin(cameraHeading) * distance));
      state.y = Math.max(30, Math.min(WORLD.height - 30, state.y - Math.cos(cameraHeading) * distance));
      const grass = grassPatchAt();
      if (!grass) {
        grassStepDistance = 0;
      } else if (!previousGrass || grass.id !== previousGrass.id) {
        grassStepDistance = 0;
        triggerGrassEncounter(grass, true);
        if (encounterAnimation) return;
      } else {
        grassStepDistance += Math.abs(distance);
        while (grassStepDistance >= 45) {
          grassStepDistance -= 45;
          if (Date.now() >= nextWildEncounterAt && Math.random() < .055) {
            triggerGrassEncounter(grass);
            return;
          }
        }
      }
    }
    if ((turnDirection || direction) && performance.now() - saveTime > 1500) {
      save();
      saveTime = performance.now();
    }
  }
  function updateBossRealmMovement(delta) {
    let dx = 0, dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx--;
    if (keys.has("arrowright") || keys.has("d")) dx++;
    if (keys.has("arrowup") || keys.has("w")) dy--;
    if (keys.has("arrowdown") || keys.has("s")) dy++;
    if (!dx && !dy) return;
    const distance = 180 * delta / 1000, length = Math.hypot(dx, dy);
    state.realm.playerX = Math.max(70, Math.min(BOSS_REALM.width - 70, state.realm.playerX + dx / length * distance));
    state.realm.playerY = Math.max(70, Math.min(BOSS_REALM.height - 70, state.realm.playerY + dy / length * distance));
    if (performance.now() - saveTime > 1500) { save(); saveTime = performance.now(); }
  }
  function updateCastleMovement(delta) {
    let dx = 0, dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx--;
    if (keys.has("arrowright") || keys.has("d")) dx++;
    if (keys.has("arrowup") || keys.has("w")) dy--;
    if (keys.has("arrowdown") || keys.has("s")) dy++;
    if (!dx && !dy) return;
    const distance = 175 * delta / 1000, length = Math.hypot(dx, dy);
    state.castle.playerX = Math.max(75, Math.min(825, state.castle.playerX + dx / length * distance));
    state.castle.playerY = Math.max(110, Math.min(490, state.castle.playerY + dy / length * distance));
    state.facing = Math.atan2(dx, -dy);
    if (performance.now() - saveTime > 1500) { save(); saveTime = performance.now(); }
  }
  function frame(time){
    const delta=lastTime?Math.min(time-lastTime,50):16;lastTime=time;updateMovement(delta);refreshWildlife();drawWorld(time);requestAnimationFrame(frame);
  }
  function resizeCanvas(){
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));
    ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  resizeCanvas();
  updateHud();
  renderCharacterChoices();
  characterSelect.hidden = Boolean(state.characterId);
  requestAnimationFrame(frame);
})();
