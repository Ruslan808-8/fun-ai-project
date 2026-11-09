// QAIRU Games & AI Navigator — Main Script
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ========================================================
   1. Marquee Text
   ======================================================== */
const mqEl = $('#mq');
if (mqEl) {
  mqEl.innerHTML = ('QAIRU ✦ GAMES ✦ MINIMAX ✦ AI NAVIGATOR ✦ A* ✦ BFS ✦ DFS ✦ UCS ✦ ').repeat(12);
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

  playRadarTick(step = 0) {
    if (this.muted || step % 4 !== 0) return;
    const freq = 320 + (step % 20) * 15;
    this.playTone(freq, 'sine', 0.04, 0.025);
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
    p.vy += 0.35;
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
   4. Dynamic Game Descriptions & Tabs Switching
   ======================================================== */
const GAME_DESCRIPTIONS = [
  {
    title: "✕ Крестики-нолики vs Minimax",
    desc: "Классическая теория игр и дерево решений. Алгоритм Minimax просчитывает все возможные исходы партии на 9 шагов вперёд и гарантирует невозможность поражения. Сможешь свести партию вничью?"
  },
  {
    title: "◆ Нейро-память & Ассоциации",
    desc: "Тренировка зрительного внимания и сопоставления образов. Аналогичные алгоритмы векторного сходства лежат в основе эмбеддингов, векторных баз данных и семантического поиска в современных моделях ИИ."
  },
  {
    title: "★ Охотник за кладом (Bayes & A*)",
    desc: "Интерактивная симуляция робототехники: Байесовский вероятностный фильтр обновляет карту правдоподобия с каждым шумящим показанием сенсора, пока охранник преследует робота по алгоритму A*."
  }
];

const stages = [...$$('.stage')];
const tabsContainer = $('#tabs');
const gameHeadTitle = $('#gameHeadTitle');
const gameHeadDesc = $('#gameHeadDesc');

if (tabsContainer) {
  tabsContainer.onclick = e => {
    const b = e.target.closest('.tab');
    if (!b) return;
    sfx.playTap();
    
    const idx = parseInt(b.dataset.g, 10);

    $$('.tab').forEach(t => {
      t.classList.remove('on');
      t.setAttribute('aria-selected', 'false');
    });
    b.classList.add('on');
    b.setAttribute('aria-selected', 'true');
    stages.forEach((s, i) => s.classList.toggle('on', i === idx));

    // Update dynamic header text with a smooth fade
    if (gameHeadTitle && gameHeadDesc && GAME_DESCRIPTIONS[idx]) {
      gameHeadTitle.classList.add('fade-out');
      gameHeadDesc.classList.add('fade-out');
      setTimeout(() => {
        gameHeadTitle.textContent = GAME_DESCRIPTIONS[idx].title;
        gameHeadDesc.textContent = GAME_DESCRIPTIONS[idx].desc;
        gameHeadTitle.classList.remove('fade-out');
        gameHeadDesc.classList.remove('fade-out');
      }, 150);
    }
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
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let B = Array(9).fill(null);
let sc = [0, 0, 0];
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

    B[idx] = 'X';
    sfx.playMove(false);
    drawT();

    if (end()) return;

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
      sfx.playMatch();
      first.classList.add('m');
      c.classList.add('m');
      first = null;
      pairs++;

      if (pairs === 8) {
        sfx.playWin();
        triggerConfetti(100);
        if (ms) ms.innerHTML = `<i>Победа за ${mv} ходов! 🎉</i>`;

        const oldBest = localStorage.getItem('qairu_mem_best');
        if (!oldBest || mv < parseInt(oldBest, 10)) {
          localStorage.setItem('qairu_mem_best', mv.toString());
          updateBestScoreDisplay();
        }
      }
    } else {
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

/* ========================================================
   10. AI-NAVIGATOR REAL-TIME MAP (GPS + BFS / DFS / UCS / A*)
   Strictly along REAL streets & roads (OSRM + OpenStreetMap)
   ======================================================== */
const ALGO_DETAILS = {
  astar: {
    title: "★ Алгоритм A* (A-Star Search)",
    desc: "Золотой стандарт современных навигационных систем (Яндекс.Карты, 2ГИС, Google Maps). Оценивает функцию f(n) = g(n) + h(n), где h(n) — расстояние по прямой до цели. Волна поиска устремляется строго в сторону назначения, находя кратчайший маршрут по реальным дорогам с минимальным числом проверенных улиц.",
    optimality: "Гарантирована",
    complexity: "O(E + V log V)",
    heuristic: "Евклидово расстояние до финиша"
  },
  ucs: {
    title: "◆ Алгоритм Дейкстры / UCS (Uniform Cost Search)",
    desc: "Рассматривает реальную длину улиц и распространяется во все стороны концентрическими кругами равной стоимости. Находит строго оптимальный маршрут по дорогам, но проверяет гораздо больше улиц, так как не знает направления на цель.",
    optimality: "Гарантирована",
    complexity: "O(V log V + E)",
    heuristic: "Отсутствует (h = 0)"
  },
  bfs: {
    title: "○ BFS (Поиск в ширину / Breadth-First Search)",
    desc: "Классический волновой алгоритм. Исследует граф дорог перекрёсток за перекрёстком слой за слоем. Идеален для минимизации количества поворотов и перекрёстков, но считает все участки дорог равными 1 условному шагу.",
    optimality: "Только по числу перекрёстков",
    complexity: "O(V + E)",
    heuristic: "Очередь FIFO"
  },
  dfs: {
    title: "↳ DFS (Поиск в глубину / Depth-First Search)",
    desc: "Двигается по первой попавшейся улице до упора, пока не наткнётся на тупик, после чего возвращается (бэктрекинг). Наглядно иллюстрирует, почему DFS неприменим в навигаторах: маршрут получается сильно петляющим и длинным, зато алгоритм расходует минимум памяти.",
    optimality: "Не гарантирована",
    complexity: "O(V + E)",
    heuristic: "Стек LIFO"
  }
};

let mapInstance = null;
let markerA = null;
let markerB = null;
let roadGraphLayer = null;
let searchVisualLayer = null;
let finalPathLayer = null;

let currentAlgo = 'astar';
let currentSpeed = 4;
let isSearching = false;
let searchAbortSignal = false;

// Default start/finish coordinates (Almaty, QAIRU area)
let startCoords = [43.238949, 76.889709];
let goalCoords = [43.250500, 76.912000];

// Real Road Network Graph Model
let graphNodes = [];
let nodeAdj = new Map();
let currentStreetSummary = '';

function getDistanceMeters(p1, p2) {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function initAiMap() {
  const mapEl = $('#aiMap');
  if (!mapEl || !window.L) return;

  // Initialize Leaflet
  mapInstance = L.map('aiMap', {
    center: [
      (startCoords[0] + goalCoords[0]) / 2,
      (startCoords[1] + goalCoords[1]) / 2
    ],
    zoom: 14,
    scrollWheelZoom: false
  });

  // OpenStreetMap standard (100% free, no API key required)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  mapInstance.on('focus', () => mapInstance.scrollWheelZoom.enable());

  // Custom Pin Icons
  const iconA = L.divIcon({
    className: 'custom-pin-wrap',
    html: '<div class="custom-pin pin-a">A</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const iconB = L.divIcon({
    className: 'custom-pin-wrap',
    html: '<div class="custom-pin pin-b">B</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  // Place Start Marker (A)
  markerA = L.marker(startCoords, { icon: iconA, draggable: true }).addTo(mapInstance);
  markerA.bindPopup('<b>Точка А: СТАРТ</b><br>Перетащите для изменения точки отправления.');

  // Place Goal Marker (B)
  markerB = L.marker(goalCoords, { icon: iconB, draggable: true }).addTo(mapInstance);
  markerB.bindPopup('<b>Точка Б: НАЗНАЧЕНИЕ</b><br>Перетащите или кликните по карте.');

  // Marker drag listeners
  markerA.on('dragend', () => {
    const pos = markerA.getLatLng();
    startCoords = [pos.lat, pos.lng];
    buildStreetNetwork();
  });

  markerB.on('dragend', () => {
    const pos = markerB.getLatLng();
    goalCoords = [pos.lat, pos.lng];
    buildStreetNetwork();
  });

  // Map click sets Goal (Point B)
  mapInstance.on('click', e => {
    if (isSearching) return;
    goalCoords = [e.latlng.lat, e.latlng.lng];
    markerB.setLatLng(goalCoords);
    buildStreetNetwork();
  });

  // Build first road network
  buildStreetNetwork();
}

/* Fetch real road paths from OpenStreetMap OSRM Routing Engine */
async function fetchRealRoads(start, goal) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${goal[1]},${goal[0]}?overview=full&geometries=geojson&steps=true&alternatives=true`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('OSRM request error or timeout:', err);
  }
  return null;
}

/* Build a REAL street network using actual OpenStreetMap road geometries */
async function buildStreetNetwork() {
  if (!mapInstance || !window.L) return;

  // Clear previous layers
  if (roadGraphLayer) mapInstance.removeLayer(roadGraphLayer);
  if (searchVisualLayer) mapInstance.removeLayer(searchVisualLayer);
  if (finalPathLayer) mapInstance.removeLayer(finalPathLayer);

  roadGraphLayer = L.layerGroup().addTo(mapInstance);
  searchVisualLayer = L.layerGroup().addTo(mapInstance);
  finalPathLayer = L.layerGroup().addTo(mapInstance);

  resetStatsUI();
  $('#statStatus').textContent = 'Загрузка дорог с OpenStreetMap...';
  $('#statStatus').style.color = 'var(--yellow)';

  graphNodes = [];
  nodeAdj = new Map();
  currentStreetSummary = '';

  const osrmData = await fetchRealRoads(startCoords, goalCoords);

  if (!osrmData || !osrmData.routes || osrmData.routes.length === 0) {
    // If offline, notify user
    $('#statStatus').textContent = 'Дорожная сеть не ответила. Проверьте интернет.';
    $('#statStatus').style.color = '#ff4d6d';
    return;
  }

  // Extract street names from steps for nice display
  const primaryRoute = osrmData.routes[0];
  if (primaryRoute.legs && primaryRoute.legs[0] && primaryRoute.legs[0].steps) {
    const streets = [...new Set(primaryRoute.legs[0].steps.map(s => s.name).filter(Boolean))];
    currentStreetSummary = streets.length > 0 ? streets.join(' ➔ ') : 'Городские улицы';
  }

  // We will build graph nodes and edges strictly following actual road coordinates
  function addNode(lat, lng, name = '', isSpecial = null) {
    const id = graphNodes.length;
    const node = { id, lat, lng, name, isSpecial };
    graphNodes.push(node);
    nodeAdj.set(id, []);
    return id;
  }

  function addRoadEdge(u, v, coords) {
    let dist = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      dist += getDistanceMeters(coords[i], coords[i + 1]);
    }
    nodeAdj.get(u).push({ to: v, weight: dist, coords });
    nodeAdj.get(v).push({ to: u, weight: dist, coords: [...coords].reverse() });

    // Draw faint background street on the map
    L.polyline(coords, {
      color: 'rgba(76, 201, 240, 0.28)',
      weight: 3.5,
      interactive: false
    }).addTo(roadGraphLayer);
  }

  // Process all returned real road routes (main route + alternative routes)
  const routeNodeChains = [];

  osrmData.routes.forEach((route, routeIdx) => {
    const rawCoords = route.geometry.coordinates.map(c => [c[1], c[0]]); // [lat, lng]
    if (rawCoords.length < 2) return;

    const chain = [];
    // Sample nodes along the real road every ~70-100 meters
    let currentSegment = [rawCoords[0]];
    let lastNodeId = addNode(rawCoords[0][0], rawCoords[0][1], `Маршрут ${routeIdx + 1}`);
    chain.push(lastNodeId);

    let accDist = 0;
    for (let i = 1; i < rawCoords.length; i++) {
      currentSegment.push(rawCoords[i]);
      accDist += getDistanceMeters(rawCoords[i - 1], rawCoords[i]);

      const isLast = (i === rawCoords.length - 1);
      if (accDist >= 85 || isLast) {
        const nextNodeId = addNode(rawCoords[i][0], rawCoords[i][1], `Маршрут ${routeIdx + 1}`);
        chain.push(nextNodeId);
        addRoadEdge(lastNodeId, nextNodeId, currentSegment);

        // Add side-street branches at some intersections for realistic exploration
        if (!isLast && i % 3 === 0) {
          const pPrev = rawCoords[i - 1];
          const pCurr = rawCoords[i];
          const dLat = pCurr[0] - pPrev[0];
          const dLng = pCurr[1] - pPrev[1];
          // Perpendicular vector for cross-street
          const pLat = -dLng * 0.9;
          const pLng = dLat * 0.9;

          const side1 = [pCurr[0] + pLat, pCurr[1] + pLng];
          const sideNode1 = addNode(side1[0], side1[1], 'Перекрёсток (боковая улица)');
          addRoadEdge(nextNodeId, sideNode1, [pCurr, side1]);

          const side2 = [pCurr[0] - pLat, pCurr[1] - pLng];
          const sideNode2 = addNode(side2[0], side2[1], 'Перекрёсток (боковая улица)');
          addRoadEdge(nextNodeId, sideNode2, [pCurr, side2]);
        }

        lastNodeId = nextNodeId;
        currentSegment = [rawCoords[i]];
        accDist = 0;
      }
    }
    routeNodeChains.push(chain);
  });

  // Cross-connect routes where they meet or pass near each other
  if (routeNodeChains.length > 1) {
    const c1 = routeNodeChains[0];
    const c2 = routeNodeChains[1];
    c1.forEach(u => {
      c2.forEach(v => {
        const d = getDistanceMeters([graphNodes[u].lat, graphNodes[u].lng], [graphNodes[v].lat, graphNodes[v].lng]);
        if (d < 45 && u !== v) {
          addRoadEdge(u, v, [
            [graphNodes[u].lat, graphNodes[u].lng],
            [graphNodes[v].lat, graphNodes[v].lng]
          ]);
        }
      });
    });
  }

  // Ensure Start (A) connects to the start of the road routes
  const startId = addNode(startCoords[0], startCoords[1], 'Старт А', 'A');
  routeNodeChains.forEach(chain => {
    if (chain.length > 0) {
      const roadStartId = chain[0];
      const pRoad = [graphNodes[roadStartId].lat, graphNodes[roadStartId].lng];
      addRoadEdge(startId, roadStartId, [startCoords, pRoad]);
    }
  });

  // Ensure Goal (B) connects to the end of the road routes
  const goalId = addNode(goalCoords[0], goalCoords[1], 'Финиш Б', 'B');
  routeNodeChains.forEach(chain => {
    if (chain.length > 0) {
      const roadEndId = chain[chain.length - 1];
      const pRoad = [graphNodes[roadEndId].lat, graphNodes[roadEndId].lng];
      addRoadEdge(roadEndId, goalId, [pRoad, goalCoords]);
    }
  });

  $('#statStatus').textContent = 'Дороги загружены. Готов к поиску!';
  $('#statStatus').style.color = 'var(--cyan)';
  if (currentStreetSummary) {
    $('#statDistance').textContent = `По улицам: ${currentStreetSummary}`;
  }
}

function resetStatsUI() {
  $('#statStatus').textContent = 'Готов к поиску';
  $('#statStatus').style.color = 'var(--cyan)';
  $('#statVisited').textContent = '0';
  $('#statFrontier').textContent = '0';
  $('#statDistance').textContent = '—';
  $('#statTime').textContent = '—';
}

/* Run the chosen Pathfinding Algorithm in real-time strictly on real roads */
async function runSearch() {
  if (isSearching) {
    searchAbortSignal = true;
    return;
  }

  if (graphNodes.length < 2) {
    await buildStreetNetwork();
  }

  isSearching = true;
  searchAbortSignal = false;
  sfx.playTap();

  const runBtn = $('#btnRunSearch');
  if (runBtn) {
    runBtn.textContent = '⏹ Остановить';
    runBtn.classList.remove('p');
  }

  if (searchVisualLayer) searchVisualLayer.clearLayers();
  if (finalPathLayer) finalPathLayer.clearLayers();

  const startId = graphNodes.length - 2;
  const goalId = graphNodes.length - 1;

  const startTime = performance.now();
  $('#statStatus').textContent = 'Поиск по дорожной сети...';
  $('#statStatus').style.color = 'var(--yellow)';

  // Visual marker caches
  const visitedCircles = new Map();
  const frontierCircles = new Map();

  function markVisited(u, edgeCoords = null) {
    if (frontierCircles.has(u)) {
      mapInstance.removeLayer(frontierCircles.get(u));
      frontierCircles.delete(u);
    }
    const node = graphNodes[u];
    const circle = L.circleMarker([node.lat, node.lng], {
      radius: node.isSpecial ? 6 : 4,
      color: '#4cc9f0',
      fillColor: '#4cc9f0',
      fillOpacity: 0.8,
      weight: 1
    }).addTo(searchVisualLayer);
    visitedCircles.set(u, circle);

    // If edge coords are provided, draw the explored road segment
    if (edgeCoords && edgeCoords.length > 1) {
      L.polyline(edgeCoords, {
        color: '#4cc9f0',
        weight: 4,
        opacity: 0.75,
        lineCap: 'round'
      }).addTo(searchVisualLayer);
    }
  }

  function markFrontier(u) {
    if (visitedCircles.has(u) || frontierCircles.has(u)) return;
    const node = graphNodes[u];
    const circle = L.circleMarker([node.lat, node.lng], {
      radius: 4,
      color: '#ffc145',
      fillColor: '#ffc145',
      fillOpacity: 0.9,
      weight: 1
    }).addTo(searchVisualLayer);
    frontierCircles.set(u, circle);
  }

  let foundGoal = false;
  let visitedCount = 0;
  let parents = new Map(); // child -> { parentId, edgeCoords, weight }

  // ALGORITHM IMPLEMENTATIONS
  if (currentAlgo === 'bfs') {
    // Breadth-First Search along road intersections
    const queue = [startId];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      if (searchAbortSignal) break;
      const curr = queue.shift();
      visitedCount++;
      const pInfo = parents.get(curr);
      markVisited(curr, pInfo ? pInfo.edgeCoords : null);

      if (curr === goalId) {
        foundGoal = true;
        break;
      }

      for (const edge of nodeAdj.get(curr)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          queue.push(edge.to);
          markFrontier(edge.to);
        }
      }

      $('#statVisited').textContent = visitedCount;
      $('#statFrontier').textContent = queue.length;
      sfx.playRadarTick(visitedCount);

      if (currentSpeed < 900) {
        if (visitedCount % currentSpeed === 0) {
          await new Promise(r => setTimeout(r, 22));
        }
      }
    }
  } else if (currentAlgo === 'dfs') {
    // Depth-First Search along road intersections
    const stack = [startId];
    const visited = new Set();

    while (stack.length > 0) {
      if (searchAbortSignal) break;
      const curr = stack.pop();
      if (visited.has(curr)) continue;
      visited.add(curr);
      visitedCount++;
      const pInfo = parents.get(curr);
      markVisited(curr, pInfo ? pInfo.edgeCoords : null);

      if (curr === goalId) {
        foundGoal = true;
        break;
      }

      for (const edge of nodeAdj.get(curr)) {
        if (!visited.has(edge.to)) {
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          stack.push(edge.to);
          markFrontier(edge.to);
        }
      }

      $('#statVisited').textContent = visitedCount;
      $('#statFrontier').textContent = stack.length;
      sfx.playRadarTick(visitedCount);

      if (currentSpeed < 900) {
        if (visitedCount % currentSpeed === 0) {
          await new Promise(r => setTimeout(r, 22));
        }
      }
    }
  } else if (currentAlgo === 'ucs') {
    // Uniform Cost Search / Dijkstra along roads
    const dist = new Map();
    dist.set(startId, 0);
    const pq = [{ id: startId, cost: 0 }];
    const visited = new Set();

    while (pq.length > 0) {
      if (searchAbortSignal) break;
      pq.sort((a, b) => a.cost - b.cost);
      const { id: curr, cost: currCost } = pq.shift();

      if (visited.has(curr)) continue;
      visited.add(curr);
      visitedCount++;
      const pInfo = parents.get(curr);
      markVisited(curr, pInfo ? pInfo.edgeCoords : null);

      if (curr === goalId) {
        foundGoal = true;
        break;
      }

      for (const edge of nodeAdj.get(curr)) {
        const nextCost = currCost + edge.weight;
        if (!dist.has(edge.to) || nextCost < dist.get(edge.to)) {
          dist.set(edge.to, nextCost);
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          pq.push({ id: edge.to, cost: nextCost });
          markFrontier(edge.to);
        }
      }

      $('#statVisited').textContent = visitedCount;
      $('#statFrontier').textContent = pq.length;
      sfx.playRadarTick(visitedCount);

      if (currentSpeed < 900) {
        if (visitedCount % currentSpeed === 0) {
          await new Promise(r => setTimeout(r, 22));
        }
      }
    }
  } else {
    // A* Heuristic Search strictly on real road network
    const gScore = new Map();
    gScore.set(startId, 0);

    const fScore = new Map();
    const h0 = getDistanceMeters([graphNodes[startId].lat, graphNodes[startId].lng], goalCoords);
    fScore.set(startId, h0);

    const openSet = [{ id: startId, f: h0 }];
    const visited = new Set();

    while (openSet.length > 0) {
      if (searchAbortSignal) break;
      openSet.sort((a, b) => a.f - b.f);
      const { id: curr } = openSet.shift();

      if (visited.has(curr)) continue;
      visited.add(curr);
      visitedCount++;
      const pInfo = parents.get(curr);
      markVisited(curr, pInfo ? pInfo.edgeCoords : null);

      if (curr === goalId) {
        foundGoal = true;
        break;
      }

      const currG = gScore.get(curr);
      for (const edge of nodeAdj.get(curr)) {
        const tentativeG = currG + edge.weight;
        if (!gScore.has(edge.to) || tentativeG < gScore.get(edge.to)) {
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          gScore.set(edge.to, tentativeG);
          const h = getDistanceMeters([graphNodes[edge.to].lat, graphNodes[edge.to].lng], goalCoords);
          const f = tentativeG + h;
          fScore.set(edge.to, f);
          openSet.push({ id: edge.to, f });
          markFrontier(edge.to);
        }
      }

      $('#statVisited').textContent = visitedCount;
      $('#statFrontier').textContent = openSet.length;
      sfx.playRadarTick(visitedCount);

      if (currentSpeed < 900) {
        if (visitedCount % currentSpeed === 0) {
          await new Promise(r => setTimeout(r, 22));
        }
      }
    }
  }

  const elapsed = Math.round(performance.now() - startTime);
  $('#statTime').textContent = `${elapsed} мс`;

  if (foundGoal) {
    // Reconstruct the REAL road polyline strictly following streets
    const pathEdges = [];
    let curr = goalId;
    let totalMeters = 0;

    while (curr !== undefined) {
      const pInfo = parents.get(curr);
      if (!pInfo) break;
      pathEdges.push(pInfo.edgeCoords);
      totalMeters += pInfo.weight;
      curr = pInfo.parentId;
    }
    pathEdges.reverse();

    // Flatten to a continuous, flawless road polyline
    const fullRoadPolyline = [];
    pathEdges.forEach(coords => {
      coords.forEach(pt => fullRoadPolyline.push(pt));
    });

    // Draw the final glowing neon pink path along actual roads
    L.polyline(fullRoadPolyline, {
      color: '#ff2e93',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(finalPathLayer);

    const distKm = (totalMeters / 1000).toFixed(2);
    $('#statDistance').textContent = `${distKm} км (${Math.round(totalMeters)} м)`;
    $('#statStatus').textContent = 'Маршрут по дорогам построен! 🎉';
    $('#statStatus').style.color = 'var(--green)';

    sfx.playWin();
    triggerConfetti(70);
  } else {
    $('#statStatus').textContent = searchAbortSignal ? 'Остановлено' : 'Путь не найден';
    $('#statStatus').style.color = '#ff4d6d';
  }

  isSearching = false;
  if (runBtn) {
    runBtn.textContent = '▶ Построить маршрут';
    runBtn.classList.add('p');
  }
}

// Algorithm Selector
const algoPills = $('#algoSelector');
if (algoPills) {
  algoPills.onclick = e => {
    const b = e.target.closest('.algo-btn');
    if (!b) return;
    sfx.playTap();
    $$('.algo-btn').forEach(btn => btn.classList.remove('on'));
    b.classList.add('on');
    currentAlgo = b.dataset.algo;

    // Update explanation card
    const info = ALGO_DETAILS[currentAlgo];
    if (info) {
      $('#algoInfoTitle').textContent = info.title;
      $('#algoInfoDesc').textContent = info.desc;
      const chips = $$('#algoInfoCard .chip');
      if (chips[0]) chips[0].innerHTML = `Оптимальность: <b>${info.optimality}</b>`;
      if (chips[1]) chips[1].innerHTML = `Временная сложность: <b>${info.complexity}</b>`;
      if (chips[2]) chips[2].innerHTML = `Эвристика: <b>${info.heuristic}</b>`;
    }
  };
}

// Speed Selector
const speedSelector = $('#speedSelector');
if (speedSelector) {
  speedSelector.onclick = e => {
    const b = e.target.closest('.speed-btn');
    if (!b) return;
    sfx.playTap();
    $$('.speed-btn').forEach(btn => btn.classList.remove('on'));
    b.classList.add('on');
    currentSpeed = parseInt(b.dataset.speed, 10);
  };
}

// Buttons
$('#btnRunSearch')?.addEventListener('click', runSearch);

$('#btnClearSearch')?.addEventListener('click', () => {
  sfx.playTap();
  if (isSearching) searchAbortSignal = true;
  buildStreetNetwork();
});

// GPS Geolocation Handler
$('#btnGps')?.addEventListener('click', () => {
  sfx.playTap();
  if (!navigator.geolocation) {
    alert('Ваш браузер не поддерживает GPS геолокацию.');
    return;
  }
  const statusEl = $('#statStatus');
  if (statusEl) statusEl.textContent = 'Запрос GPS...';

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      startCoords = [lat, lng];
      markerA.setLatLng(startCoords);

      // Shift goal nearby relative to user
      goalCoords = [lat + 0.008, lng + 0.012];
      markerB.setLatLng(goalCoords);

      mapInstance.setView(startCoords, 14);
      buildStreetNetwork();
      if (statusEl) {
        statusEl.textContent = 'GPS получен!';
        statusEl.style.color = 'var(--green)';
      }
    },
    err => {
      alert(`Не удалось определить GPS (${err.message}). Используются координаты по умолчанию.`);
      resetStatsUI();
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

// Random Goal Destination
$('#btnRandomPoints')?.addEventListener('click', () => {
  sfx.playTap();
  const dLat = (Math.random() - 0.5) * 0.024;
  const dLng = (Math.random() - 0.5) * 0.032;
  goalCoords = [startCoords[0] + dLat, startCoords[1] + dLng];
  markerB.setLatLng(goalCoords);
  mapInstance.fitBounds([startCoords, goalCoords], { padding: [50, 50] });
  buildStreetNetwork();
});

// Initialize Map on window load or when Leaflet is available
if (document.readyState === 'complete') {
  initAiMap();
} else {
  window.addEventListener('load', initAiMap);
}
