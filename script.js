// QAIRU Games — Main Script
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ========================================================
   1. Marquee Text
   ======================================================== */
const mqEl = $('#mq');
if (mqEl) {
  mqEl.innerHTML = ('QAIRU ✦ GAMES ✦ MINIMAX ✦ ОСНОВЫ ИИ ✦ КЛАД ✦ PLAY ✦ ').repeat(14);
}

/* ========================================================
   2. Web Audio Effects (Synthesizer, zero assets needed)
   ======================================================== */
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('qairu_muted') === '1';
    this.updateUI();
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('qairu_muted', this.muted ? '1' : '0');
    this.updateUI();
    if (!this.muted) {
      this.playTap();
    }
  }

  updateUI() {
    const btn = $('#sndToggle');
    const icon = $('#sndIcon');
    if (!btn || !icon) return;
    if (this.muted) {
      btn.classList.add('muted');
      icon.textContent = '🔇';
      btn.setAttribute('aria-label', 'Включить звук');
    } else {
      btn.classList.remove('muted');
      icon.textContent = '🔊';
      btn.setAttribute('aria-label', 'Выключить звук');
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.08) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  playTap() {
    this.playTone(620, 'sine', 0.06, 0.05);
  }

  playMove(isAi = false) {
    if (isAi) {
      this.playTone(340, 'triangle', 0.12, 0.09);
    } else {
      this.playTone(820, 'sine', 0.08, 0.07);
    }
  }

  playFlip() {
    this.playTone(480, 'sine', 0.07, 0.06);
  }

  playMatch() {
    if (this.muted) return;
    this.playTone(523.25, 'triangle', 0.14, 0.08);
    setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.08), 80);
    setTimeout(() => this.playTone(783.99, 'sine', 0.22, 0.08), 160);
  }

  playWin() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.28, 0.1), i * 110);
    });
  }

  playTie() {
    if (this.muted) return;
    this.playTone(440, 'sine', 0.14, 0.07);
    setTimeout(() => this.playTone(554.37, 'sine', 0.2, 0.07), 100);
  }
}

const sfx = new SoundFX();
$('#sndToggle')?.addEventListener('click', () => sfx.toggle());

/* ========================================================
   3. Confetti Celebration Effect
   ======================================================== */
const confettiCanvas = $('#confettiCanvas');
let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimId = null;

function resizeConfetti() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

function triggerConfetti(count = 70) {
  if (!confettiCanvas || !confettiCtx) return;
  resizeConfetti();
  const colors = ['#ff2e93', '#ffffff', '#4cc9f0', '#ffc145', '#7cf0b5'];
  
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.4 + (Math.random() * 60 - 30),
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 5,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  if (!confettiAnimId) {
    runConfetti();
  }
}

function runConfetti() {
  if (!confettiCtx) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35; // gravity
    p.rotation += p.vRot;
    p.opacity -= 0.012;

    if (p.opacity <= 0 || p.y > confettiCanvas.height + 20) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.opacity);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;

    if (p.shape === 'rect') {
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  }

  if (confettiParticles.length > 0) {
    confettiAnimId = requestAnimationFrame(runConfetti);
  } else {
    confettiAnimId = null;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ========================================================
   4. Tabs Switching
   ======================================================== */
const stages = [...$$('.stage')];
const tabsContainer = $('#tabs');

if (tabsContainer) {
  tabsContainer.onclick = e => {
    const b = e.target.closest('.tab');
    if (!b) return;
    sfx.playTap();
    $$('.tab').forEach(t => {
      t.classList.remove('on');
      t.setAttribute('aria-selected', 'false');
    });
    b.classList.add('on');
    b.setAttribute('aria-selected', 'true');
    stages.forEach((s, i) => s.classList.toggle('on', i == b.dataset.g));
  };
}

/* ========================================================
   5. Hero Spotlight on Mousemove
   ======================================================== */
const heroEl = $('.hero');
if (heroEl) {
  heroEl.onmousemove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px');
  };
}

/* ========================================================
   6. Scroll Reveal Observer & Navbar Scroll State
   ======================================================== */
const io = new IntersectionObserver(
  entries => entries.forEach(x => x.isIntersecting && x.target.classList.add('v')),
  { threshold: 0.12 }
);
$$('.rv').forEach(e => io.observe(e));

const navEl = $('nav');
const backToTopBtn = $('#backToTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (navEl) {
    navEl.classList.toggle('scrolled', y > 40);
  }
  if (backToTopBtn) {
    backToTopBtn.classList.toggle('visible', y > 400);
  }
}, { passive: true });

if (backToTopBtn) {
  backToTopBtn.onclick = () => {
    sfx.playTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

/* ========================================================
   7. Tic-Tac-Toe vs Minimax (Unbeatable AI)
   ======================================================== */
const W = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

let B = Array(9).fill(null);
let sc = [0, 0, 0]; // [Player, Draws, AI]
let over = false;
let aiThinking = false;
let winCombo = null;

function checkWin(b) {
  for (const [a, c, d] of W) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], combo: [a, c, d] };
    }
  }
  if (!b.includes(null)) {
    return { winner: 'D', combo: null };
  }
  return null;
}

// Minimax algorithm
function mm(b, p) {
  const w = checkWin(b);
  if (w) {
    return { s: w.winner === 'O' ? 1 : w.winner === 'X' ? -1 : 0 };
  }
  let best = { s: p === 'O' ? -2 : 2 };
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = p;
      const r = mm(b, p === 'O' ? 'X' : 'O');
      b[i] = null;
      if (p === 'O' ? r.s > best.s : r.s < best.s) {
        best = { s: r.s, m: i };
      }
    }
  }
  return best;
}

function drawT() {
  const boardEl = $('#tb');
  if (!boardEl) return;
  boardEl.innerHTML = B.map((v, i) => {
    const isWinCell = winCombo && winCombo.includes(i);
    const classes = [
      v === 'O' ? 'o' : '',
      isWinCell ? 'win-cell' : ''
    ].filter(Boolean).join(' ');
    
    return `<button data-i="${i}" class="${classes}" ${v || over || aiThinking ? 'disabled' : ''} aria-label="Клетка ${i + 1}: ${v || 'пусто'}">${v === 'X' ? '✕' : v === 'O' ? '○' : ''}</button>`;
  }).join('');
}

function end() {
  const res = checkWin(B);
  if (!res) return false;
  
  over = true;
  winCombo = res.combo;
  const w = res.winner;
  const k = w === 'X' ? 0 : w === 'D' ? 1 : 2;
  sc[k]++;
  ['w1', 'w2', 'w3'].forEach((id, i) => {
    const el = $('#' + id);
    if (el) el.textContent = sc[i];
  });

  const ts = $('#ts');
  if (w === 'X') {
    ts.innerHTML = '<i>Ты победил! Невероятно!</i>';
    sfx.playWin();
    triggerConfetti(90);
  } else if (w === 'D') {
    ts.innerHTML = '<i>Ничья! Ты устоял против Minimax!</i>';
    sfx.playTie();
    triggerConfetti(50);
  } else {
    ts.innerHTML = 'Победил <i>ИИ (Minimax)</i>';
    sfx.playMove(true);
  }

  drawT();
  return true;
}

function ttt() {
  sfx.playTap();
  B = Array(9).fill(null);
  over = false;
  aiThinking = false;
  winCombo = null;
  const ts = $('#ts');
  if (ts) ts.textContent = 'Твой ход';
  drawT();
}

const tbEl = $('#tb');
if (tbEl) {
  tbEl.onclick = e => {
    const b = e.target.closest('button');
    if (!b || over || aiThinking) return;
    const idx = parseInt(b.dataset.i, 10);
    if (B[idx]) return;

    // Player move
    B[idx] = 'X';
    sfx.playMove(false);
    drawT();

    if (end()) return;

    // AI move with a small thinking delay for realism
    aiThinking = true;
    const ts = $('#ts');
    if (ts) ts.innerHTML = '<i>ИИ вычисляет ход...</i>';
    drawT();

    setTimeout(() => {
      if (!over) {
        const bestMove = mm(B, 'O').m;
        if (bestMove !== undefined && bestMove !== null) {
          B[bestMove] = 'O';
          sfx.playMove(true);
        }
        aiThinking = false;
        if (!end()) {
          if (ts) ts.textContent = 'Твой ход';
          drawT();
        }
      } else {
        aiThinking = false;
      }
    }, 180);
  };
}

ttt();

/* ========================================================
   8. Memory Game
   ======================================================== */
let first = null;
let lock = false;
let mv = 0;
let pairs = 0;

function updateBestScoreDisplay() {
  const chip = $('#bestScoreChip');
  if (!chip) return;
  const best = localStorage.getItem('qairu_mem_best');
  chip.textContent = best ? `Рекорд: ${best} ходов` : 'Рекорд: —';
}

function mem() {
  sfx.playTap();
  const s = ['◆', '●', '▲', '★', '♥', '♣', '✦', '☾'];
  const a = [...s, ...s].sort(() => Math.random() - 0.5);
  mv = 0;
  pairs = 0;
  first = null;
  lock = false;
  const ms = $('#ms');
  if (ms) ms.textContent = 'Ходов: 0';
  updateBestScoreDisplay();

  const mb = $('#mb');
  if (mb) {
    mb.innerHTML = a.map(x => `
      <button class="card" data-s="${x}" aria-label="Карточка">
        <div>
          <span class="a">?</span>
          <span class="b">${x}</span>
        </div>
      </button>
    `).join('');
  }
}

const mbEl = $('#mb');
if (mbEl) {
  mbEl.onclick = e => {
    const c = e.target.closest('.card');
    if (!c || lock || c.classList.contains('f') || c.classList.contains('m')) return;
    
    sfx.playFlip();
    c.classList.add('f');

    if (!first) {
      first = c;
      return;
    }

    mv++;
    const ms = $('#ms');
    if (ms) ms.textContent = 'Ходов: ' + mv;

    if (first.dataset.s === c.dataset.s) {
      // Match found
      sfx.playMatch();
      first.classList.add('m');
      c.classList.add('m');
      first = null;
      pairs++;

      if (pairs === 8) {
        // Game completed
        sfx.playWin();
        triggerConfetti(100);
        if (ms) ms.innerHTML = `<i>Победа за ${mv} ходов! 🎉</i>`;

        // Check best record
        const oldBest = localStorage.getItem('qairu_mem_best');
        if (!oldBest || mv < parseInt(oldBest, 10)) {
          localStorage.setItem('qairu_mem_best', mv.toString());
          updateBestScoreDisplay();
        }
      }
    } else {
      // No match
      lock = true;
      const f = first;
      first = null;
      setTimeout(() => {
        f.classList.remove('f');
        c.classList.remove('f');
        lock = false;
      }, 750);
    }
  };
}

mem();

/* ========================================================
   9. Interactive 3D Card Hover on Desktop
   ======================================================== */
const cards = $$('.pc[data-tilt]');
cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--px', `${x}px`);
    card.style.setProperty('--py', `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
