// ─── カードの絵柄（8ペア） ───
const EMOJIS = ['🐶', '🐱', '🐻', '🦊', '🐸', '🐵', '🦋', '🐙'];

// ─── 状態変数 ───
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let lockBoard = false;

// ─── DOM ───
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const pairsEl = document.getElementById('pairs');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart');

// ─── シャッフル (Fisher-Yates) ───
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── ボード生成 ───
function createBoard() {
  boardEl.innerHTML = '';
  const deck = shuffle([...EMOJIS, ...EMOJIS]); // 16枚

  deck.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back"></div>
        <div class="card-front">${emoji}</div>
      </div>
    `;

    card.addEventListener('click', () => flipCard(card));
    boardEl.appendChild(card);
  });
}

// ─── カードをめくる ───
function flipCard(card) {
  // ロック中・既にめくられている・同じカードクリックは無視
  if (lockBoard) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;
  if (flippedCards.length >= 2) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  // 2枚めくったら判定
  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    lockBoard = true;
    checkMatch();
  }
}

// ─── マッチ判定 ───
function checkMatch() {
  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.emoji === card2.dataset.emoji;

  if (isMatch) {
    // マッチ成功
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    score += 100;
    scoreEl.textContent = score;
    pairsEl.textContent = EMOJIS.length - matchedPairs;

    flippedCards = [];
    lockBoard = false;

    // 全ペア完成チェック
    if (matchedPairs === EMOJIS.length) {
      setTimeout(() => {
        // ボーナス：残りターンが少ないほど高得点
        const bonus = Math.max(0, (30 - moves) * 10);
        score += bonus;
        scoreEl.textContent = score;
        messageEl.textContent = `🎉 クリア！ スコア: ${score} （ボーナス +${bonus}）`;
        launchConfetti();
      }, 500);
    }
  } else {
    // マッチ失敗：少し待って裏返す
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      lockBoard = false;
    }, 900);
  }
}

// ─── リスタート ───
restartBtn.addEventListener('click', () => {
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  score = 0;
  lockBoard = false;

  scoreEl.textContent = '0';
  movesEl.textContent = '0';
  pairsEl.textContent = EMOJIS.length;
  messageEl.textContent = '';

  createBoard();
});

// ─── 紙吹雪エフェクト（簡易版） ───
function launchConfetti() {
  const colors = ['#e94560', '#facc15', '#22c55e', '#3b82f6', '#f97316'];

  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${Math.random() * 100}vw;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 1000;
      opacity: ${0.7 + Math.random() * 0.3};
      animation: fall ${1.5 + Math.random() * 2}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }

  // アニメーション定義
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes fall {
        0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ─── 初回ロード ───
createBoard();
