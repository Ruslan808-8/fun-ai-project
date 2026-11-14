// QAIRU Games & AI Navigator — Main Script
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ========================================================
1. Marquee Text
   ======================================================== */
const mqEl = $('#mq');
if (mqEl) {
  mqEl.innerHTML = ('QAIRU ✦ GAMES ✦ PULSE PROTOCOL FPS ✦ HMM & MDP ✦ AI NAVIGATOR ✦ A* ✦ BFS ✦ DFS ✦ UCS ✦ ').repeat(12);
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
    title: "⚡ Pulse Protocol FPS (HMM & MDP)",
    desc: "3D-шутер от первого лица с искусственным интеллектом: фильтр частиц на скрытых марковских моделях (HMM) для отслеживания невидимых угроз по шумным сенсорам и алгоритм Value Iteration (MDP) для автономного автопилота станции."
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
const cards = $$('.pc[data-tilt], .cmap-card[data-tilt]');
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

// Course Map Cards Click Navigation
$$('.cmap-card').forEach(card => {
  card.addEventListener('click', () => {
    sfx.playTap();
    const targetGame = card.dataset.game;
    const targetAlgo = card.dataset.algo;
    if (targetGame !== undefined) {
      const tab = $(`#tabs .tab[data-g="${targetGame}"]`);
      if (tab) tab.click();
    }
    if (targetAlgo) {
      const btn = $(`#algoSelector .algo-btn[data-algo="${targetAlgo}"]`);
      if (btn) btn.click();
    }
  });
});

/* ========================================================
10. AI-NAVIGATOR REAL-TIME MAP (GPS + BFS / DFS / UCS / A*)
   Real Neighborhood Road Graph via Overpass API + OSRM Fallback
   ======================================================== */
const ALGO_DETAILS = {
  astar: {
    title: "★ Алгоритм A* (A-Star Search)",
    desc: "Золотой стандарт современных навигационных систем (Яндекс.Карты, 2ГИС, Google Maps). Оценивает функцию f(n) = g(n) + w·h(n), где h(n) — расстояние по прямой до цели. При w ≤ 1 эвристика допустима и путь гарантированно оптимален; при w > 1 поиск ускоряется за счёт потери оптимальности.",
    optimality: "Гарантирована (при w ≤ 1)",
    complexity: "O(E + V log V)",
    heuristic: "Геодезическое расстояние до финиша"
  },
  ucs: {
    title: "◆ Алгоритм Дейкстры / UCS (Uniform Cost Search)",
    desc: "Рассматривает реальную длину улиц и распространяется во все стороны волнами равной стоимости (частный случай A* при w = 0). Находит строго оптимальный маршрут по дорогам, но проверяет гораздо больше улиц, так как не знает направления на цель.",
    optimality: "Гарантирована",
    complexity: "O(V log V + E)",
    heuristic: "Отсутствует (h = 0)"
  },
  bfs: {
    title: "○ BFS (Поиск в ширину / Breadth-First Search)",
    desc: "Классический волновой алгоритм. Исследует граф дорог перекрёсток за перекрёстком слой за слоем. Идеален для минимизации количества перекрёстков, но не учитывает длину улиц.",
    optimality: "Только по числу перекрёстков",
    complexity: "O(V + E)",
    heuristic: "Очередь FIFO"
  },
  dfs: {
    title: "↳ DFS (Поиск в глубину / Depth-First Search)",
    desc: "Двигается по первой попавшейся улице до упора, пока не наткнётся на тупик, после чего возвращается (бэктрекинг). Наглядно иллюстрирует, почему DFS неприменим в навигаторах: маршрут сильно петляет и уходит в соседние кварталы.",
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
let heuristicWeight = 1.0;
let isSearching = false;
let searchAbortSignal = false;
let benchmarkLayerGroup = null;
let lastBenchmarkData = null;

// Default start/finish coordinates (Almaty, QAIRU area)
let startCoords = [43.238949, 76.889709];
let goalCoords = [43.250500, 76.912000];

// Real Road Network Graph Model
let graphNodes = [];
let nodeAdj = new Map();
let graphStartId = -1;
let graphGoalId = -1;
let currentStreetSummary = '';
let networkBuildSeq = 0;

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

  mapInstance = L.map('aiMap', {
    center: [
      (startCoords[0] + goalCoords[0]) / 2,
      (startCoords[1] + goalCoords[1]) / 2
    ],
    zoom: 14,
    scrollWheelZoom: false
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  mapInstance.on('focus', () => mapInstance.scrollWheelZoom.enable());

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

  markerA = L.marker(startCoords, { icon: iconA, draggable: true }).addTo(mapInstance);
  markerA.bindPopup('<b>Точка А: СТАРТ</b><br>Перетащите для изменения точки отправления.');

  markerB = L.marker(goalCoords, { icon: iconB, draggable: true }).addTo(mapInstance);
  markerB.bindPopup('<b>Точка Б: НАЗНАЧЕНИЕ</b><br>Перетащите или кликните по карте.');

  markerA.on('dragend', () => {
    if (isSearching) searchAbortSignal = true;
    const pos = markerA.getLatLng();
    startCoords = [pos.lat, pos.lng];
    buildStreetNetwork();
  });

  markerB.on('dragend', () => {
    if (isSearching) searchAbortSignal = true;
    const pos = markerB.getLatLng();
    goalCoords = [pos.lat, pos.lng];
    buildStreetNetwork();
  });

  mapInstance.on('click', e => {
    if (isSearching) return;
    goalCoords = [e.latlng.lat, e.latlng.lng];
    markerB.setLatLng(goalCoords);
    buildStreetNetwork();
  });

  roadGraphLayer = L.layerGroup().addTo(mapInstance);
  searchVisualLayer = L.layerGroup().addTo(mapInstance);
  finalPathLayer = L.layerGroup().addTo(mapInstance);
  benchmarkLayerGroup = L.layerGroup().addTo(mapInstance);

  mapInstance.fitBounds([startCoords, goalCoords], { padding: [50, 50] });
  buildStreetNetwork();
}

function addGraphNode(lat, lng, name = '', isSpecial = null) {
  const id = graphNodes.length;
  const node = { id, lat, lng, name, isSpecial };
  graphNodes.push(node);
  nodeAdj.set(id, []);
  return id;
}

function addRoadEdge(u, v, coords) {
  if (u === v) return;
  let dist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    dist += getDistanceMeters(coords[i], coords[i + 1]);
  }
  if (dist < 1) {
    dist = getDistanceMeters([graphNodes[u].lat, graphNodes[u].lng], [graphNodes[v].lat, graphNodes[v].lng]);
  }
  nodeAdj.get(u).push({ to: v, weight: dist, coords });
  nodeAdj.get(v).push({ to: u, weight: dist, coords: [...coords].reverse() });

  if (roadGraphLayer) {
    L.polyline(coords, {
      color: 'rgba(76, 201, 240, 0.28)',
      weight: 3.5,
      interactive: false
    }).addTo(roadGraphLayer);
  }
}

function ensureGraphConnectivity(startId, goalId) {
  let guard = 0;
  while (guard++ < 100) {
    const q = [startId];
    const reachable = new Set([startId]);
    while (q.length > 0) {
      const curr = q.shift();
      if (curr === goalId) return true;
      for (const edge of (nodeAdj.get(curr) || [])) {
        if (!reachable.has(edge.to)) {
          reachable.add(edge.to);
          q.push(edge.to);
        }
      }
    }

    let bestU = startId;
    let bestV = goalId;
    let minD = Infinity;
    for (const u of reachable) {
      const pu = [graphNodes[u].lat, graphNodes[u].lng];
      for (let v = 0; v < graphNodes.length; v++) {
        if (!reachable.has(v)) {
          const pv = [graphNodes[v].lat, graphNodes[v].lng];
          const d = getDistanceMeters(pu, pv);
          if (d < minD) {
            minD = d;
            bestU = u;
            bestV = v;
          }
        }
      }
    }

    if (minD === Infinity) return false;
    const p1 = [graphNodes[bestU].lat, graphNodes[bestU].lng];
    const p2 = [graphNodes[bestV].lat, graphNodes[bestV].lng];
    addRoadEdge(bestU, bestV, [p1, p2]);
  }
  return false;
}

/* Overpass API (OpenStreetMap real street graph) with fallback mirror */
async function fetchOverpassRoads(south, west, north, east) {
  const query = `[out:json][timeout:6];(way["highway"~"^(trunk|primary|secondary|tertiary|residential|unclassified|living_street|primary_link|secondary_link|tertiary_link)$"](${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}););out body;>;out skel qt;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const endpoint of endpoints) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.elements) && data.elements.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn(`Overpass (${endpoint}) fallback:`, err.message);
    }
  }
  return null;
}

function buildGraphFromOverpass(data, start, goal) {
  const osmNodes = new Map();
  const ways = [];

  for (const el of data.elements) {
    if (el.type === 'node') {
      osmNodes.set(el.id, [el.lat, el.lon]);
    } else if (el.type === 'way' && Array.isArray(el.nodes) && el.nodes.length >= 2) {
      ways.push(el);
    }
  }

  if (ways.length === 0 || osmNodes.size === 0) return false;

  const nodeFreq = new Map();
  for (const w of ways) {
    for (const nid of w.nodes) {
      nodeFreq.set(nid, (nodeFreq.get(nid) || 0) + 1);
    }
  }

  const osmToGraph = new Map();
  const streetNames = new Set();

  function getOrCreateGNode(nid, streetName) {
    if (osmToGraph.has(nid)) return osmToGraph.get(nid);
    const coords = osmNodes.get(nid);
    if (!coords) return null;
    const gid = addGraphNode(coords[0], coords[1], streetName);
    osmToGraph.set(nid, gid);
    return gid;
  }

  for (const way of ways) {
    const streetName = (way.tags && (way.tags['name:ru'] || way.tags.name || way.tags.highway)) || 'Улица';
    if (way.tags && (way.tags['name:ru'] || way.tags.name)) {
      streetNames.add(way.tags['name:ru'] || way.tags.name);
    }

    const wNodes = way.nodes;
    let prevGid = getOrCreateGNode(wNodes[0], streetName);
    let segmentPolyline = [osmNodes.get(wNodes[0])];
    let segmentDist = 0;

    for (let i = 1; i < wNodes.length; i++) {
      const nid = wNodes[i];
      const pt = osmNodes.get(nid);
      if (!pt) continue;

      segmentPolyline.push(pt);
      segmentDist += getDistanceMeters(segmentPolyline[segmentPolyline.length - 2], pt);

      const isEnd = (i === wNodes.length - 1);
      const isIntersection = (nodeFreq.get(nid) || 0) > 1;
      const isFarEnough = (segmentDist >= 85);

      if (isEnd || isIntersection || isFarEnough) {
        const currGid = getOrCreateGNode(nid, streetName);
        if (currGid !== null && prevGid !== null && currGid !== prevGid) {
          addRoadEdge(prevGid, currGid, segmentPolyline);
        }
        prevGid = currGid;
        segmentPolyline = [pt];
        segmentDist = 0;
      }
    }
  }

  if (graphNodes.length < 4) return false;

  let nearestStart = 0;
  let dStartMin = Infinity;
  let nearestGoal = 0;
  let dGoalMin = Infinity;

  for (let i = 0; i < graphNodes.length; i++) {
    const pt = [graphNodes[i].lat, graphNodes[i].lng];
    const ds = getDistanceMeters(pt, start);
    if (ds < dStartMin) { dStartMin = ds; nearestStart = i; }
    const dg = getDistanceMeters(pt, goal);
    if (dg < dGoalMin) { dGoalMin = dg; nearestGoal = i; }
  }

  graphStartId = addGraphNode(start[0], start[1], 'Старт А', 'A');
  addRoadEdge(graphStartId, nearestStart, [start, [graphNodes[nearestStart].lat, graphNodes[nearestStart].lng]]);

  graphGoalId = addGraphNode(goal[0], goal[1], 'Финиш Б', 'B');
  addRoadEdge(nearestGoal, graphGoalId, [[graphNodes[nearestGoal].lat, graphNodes[nearestGoal].lng], goal]);

  ensureGraphConnectivity(graphStartId, graphGoalId);

  const streetsList = [...streetNames].slice(0, 4);
  currentStreetSummary = streetsList.length > 0 ? streetsList.join(', ') : 'Квартал OpenStreetMap';
  return true;
}

/* Fallback: Fetch real road paths from OpenStreetMap OSRM Routing Engine */
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

function buildGraphFromOSRM(osrmData, start, goal) {
  if (!osrmData || !osrmData.routes || osrmData.routes.length === 0) return false;

  const primaryRoute = osrmData.routes[0];
  if (primaryRoute.legs && primaryRoute.legs[0] && primaryRoute.legs[0].steps) {
    const streets = [...new Set(primaryRoute.legs[0].steps.map(s => s.name).filter(Boolean))];
    currentStreetSummary = streets.length > 0 ? streets.join(' ➔ ') : 'Городские улицы';
  }

  const routeNodeChains = [];

  osrmData.routes.forEach((route, routeIdx) => {
    const rawCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);
    if (rawCoords.length < 2) return;

    const chain = [];
    let currentSegment = [rawCoords[0]];
    let lastNodeId = addGraphNode(rawCoords[0][0], rawCoords[0][1], `Маршрут ${routeIdx + 1}`);
    chain.push(lastNodeId);

    let accDist = 0;
    for (let i = 1; i < rawCoords.length; i++) {
      currentSegment.push(rawCoords[i]);
      accDist += getDistanceMeters(rawCoords[i - 1], rawCoords[i]);

      const isLast = (i === rawCoords.length - 1);
      if (accDist >= 85 || isLast) {
        const nextNodeId = addGraphNode(rawCoords[i][0], rawCoords[i][1], `Маршрут ${routeIdx + 1}`);
        chain.push(nextNodeId);
        addRoadEdge(lastNodeId, nextNodeId, currentSegment);

        if (!isLast && i % 2 === 0) {
          const pPrev = rawCoords[i - 1];
          const pCurr = rawCoords[i];
          const dLat = pCurr[0] - pPrev[0];
          const dLng = pCurr[1] - pPrev[1];
          const pLat = -dLng * 0.95;
          const pLng = dLat * 0.95;

          const side1 = [pCurr[0] + pLat, pCurr[1] + pLng];
          const sideNode1 = addGraphNode(side1[0], side1[1], 'Перекрёсток (боковая улица)');
          addRoadEdge(nextNodeId, sideNode1, [pCurr, side1]);

          const side2 = [pCurr[0] - pLat, pCurr[1] - pLng];
          const sideNode2 = addGraphNode(side2[0], side2[1], 'Перекрёсток (боковая улица)');
          addRoadEdge(nextNodeId, sideNode2, [pCurr, side2]);

          if (chain.length >= 3 && i % 4 === 0) {
            const loopNodeId = chain[chain.length - 3];
            const pLoop = [graphNodes[loopNodeId].lat, graphNodes[loopNodeId].lng];
            addRoadEdge(sideNode1, loopNodeId, [side1, pLoop]);
          }
        }

        lastNodeId = nextNodeId;
        currentSegment = [rawCoords[i]];
        accDist = 0;
      }
    }
    routeNodeChains.push(chain);
  });

  if (routeNodeChains.length > 1) {
    const c1 = routeNodeChains[0];
    const c2 = routeNodeChains[1];
    c1.forEach(u => {
      c2.forEach(v => {
        const d = getDistanceMeters([graphNodes[u].lat, graphNodes[u].lng], [graphNodes[v].lat, graphNodes[v].lng]);
        if (d < 65 && u !== v) {
          addRoadEdge(u, v, [
            [graphNodes[u].lat, graphNodes[u].lng],
            [graphNodes[v].lat, graphNodes[v].lng]
          ]);
        }
      });
    });
  }

  graphStartId = addGraphNode(start[0], start[1], 'Старт А', 'A');
  routeNodeChains.forEach(chain => {
    if (chain.length > 0) {
      const roadStartId = chain[0];
      const pRoad = [graphNodes[roadStartId].lat, graphNodes[roadStartId].lng];
      addRoadEdge(graphStartId, roadStartId, [start, pRoad]);
    }
  });

  graphGoalId = addGraphNode(goal[0], goal[1], 'Финиш Б', 'B');
  routeNodeChains.forEach(chain => {
    if (chain.length > 0) {
      const roadEndId = chain[chain.length - 1];
      const pRoad = [graphNodes[roadEndId].lat, graphNodes[roadEndId].lng];
      addRoadEdge(roadEndId, graphGoalId, [pRoad, goal]);
    }
  });

  ensureGraphConnectivity(graphStartId, graphGoalId);
  return true;
}

function clearBenchmarkPaths() {
  if (benchmarkLayerGroup) {
    benchmarkLayerGroup.clearLayers();
  }
}

/* Build a REAL street network using actual OpenStreetMap road geometries */
async function buildStreetNetwork() {
  if (!mapInstance || !window.L) return;

  const mySeq = ++networkBuildSeq;

  if (roadGraphLayer) mapInstance.removeLayer(roadGraphLayer);
  if (searchVisualLayer) mapInstance.removeLayer(searchVisualLayer);
  if (finalPathLayer) mapInstance.removeLayer(finalPathLayer);
  clearBenchmarkPaths();

  roadGraphLayer = L.layerGroup().addTo(mapInstance);
  searchVisualLayer = L.layerGroup().addTo(mapInstance);
  finalPathLayer = L.layerGroup().addTo(mapInstance);

  resetStatsUI();
  $('#statStatus').textContent = 'Загрузка реальных дорог OpenStreetMap...';
  $('#statStatus').style.color = 'var(--yellow)';

  graphNodes = [];
  nodeAdj = new Map();
  graphStartId = -1;
  graphGoalId = -1;
  currentStreetSummary = '';
  lastBenchmarkData = null;

  const directDist = getDistanceMeters(startCoords, goalCoords);
  const padLat = Math.min(0.012, Math.max(0.005, Math.abs(startCoords[0] - goalCoords[0]) * 0.45));
  const padLng = Math.min(0.016, Math.max(0.007, Math.abs(startCoords[1] - goalCoords[1]) * 0.45));

  const south = Math.min(startCoords[0], goalCoords[0]) - padLat;
  const north = Math.max(startCoords[0], goalCoords[0]) + padLat;
  const west = Math.min(startCoords[1], goalCoords[1]) - padLng;
  const east = Math.max(startCoords[1], goalCoords[1]) + padLng;

  let sourceName = '';
  let ok = false;

  // 1. Try Overpass API for urban neighborhood grids (up to 12 km apart)
  if (directDist <= 12000) {
    const overpassData = await fetchOverpassRoads(south, west, north, east);
    if (mySeq !== networkBuildSeq) return;
    if (overpassData) {
      ok = buildGraphFromOverpass(overpassData, startCoords, goalCoords);
      if (ok) {
        sourceName = 'OpenStreetMap (Overpass)';
      }
    }
  }

  // 2. Fallback to OSRM + cross-network
  if (!ok) {
    const osrmData = await fetchRealRoads(startCoords, goalCoords);
    if (mySeq !== networkBuildSeq) return;
    if (osrmData && buildGraphFromOSRM(osrmData, startCoords, goalCoords)) {
      ok = true;
      sourceName = 'OSRM + Сетка кварталов';
    }
  }

  if (mySeq !== networkBuildSeq) return;

  if (!ok || graphNodes.length < 2 || graphStartId < 0 || graphGoalId < 0) {
    $('#statStatus').textContent = 'Дорожная сеть не ответила. Проверьте интернет.';
    $('#statStatus').style.color = '#ff4d6d';
    if ($('#statSource')) $('#statSource').textContent = 'Ошибка сети';
    return;
  }

  $('#statStatus').textContent = 'Дороги загружены. Готов к поиску!';
  $('#statStatus').style.color = 'var(--cyan)';
  if ($('#statSource')) {
    $('#statSource').textContent = `${sourceName} • ${graphNodes.length} узл.`;
  }
  if (currentStreetSummary) {
    $('#statDistance').textContent = `Улицы: ${currentStreetSummary}`;
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

  if (graphNodes.length < 2 || graphStartId < 0 || graphGoalId < 0) {
    await buildStreetNetwork();
    if (graphNodes.length < 2 || graphStartId < 0 || graphGoalId < 0) return;
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
  clearBenchmarkPaths();

  const startId = graphStartId;
  const goalId = graphGoalId;

  const startTime = performance.now();
  $('#statStatus').textContent = 'Поиск по дорожной сети...';
  $('#statStatus').style.color = 'var(--yellow)';

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
  const parents = new Map();

  if (currentAlgo === 'bfs') {
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

      for (const edge of (nodeAdj.get(curr) || [])) {
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

      if (currentSpeed < 900 && visitedCount % currentSpeed === 0) {
        await new Promise(r => setTimeout(r, 22));
      }
    }
  } else if (currentAlgo === 'dfs') {
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

      for (const edge of (nodeAdj.get(curr) || [])) {
        if (!visited.has(edge.to)) {
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          stack.push(edge.to);
          markFrontier(edge.to);
        }
      }

      $('#statVisited').textContent = visitedCount;
      $('#statFrontier').textContent = stack.length;
      sfx.playRadarTick(visitedCount);

      if (currentSpeed < 900 && visitedCount % currentSpeed === 0) {
        await new Promise(r => setTimeout(r, 22));
      }
    }
  } else if (currentAlgo === 'ucs') {
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

      for (const edge of (nodeAdj.get(curr) || [])) {
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

      if (currentSpeed < 900 && visitedCount % currentSpeed === 0) {
        await new Promise(r => setTimeout(r, 22));
      }
    }
  } else {
    // Weighted A*: f(n) = g(n) + w * h(n)
    const gScore = new Map();
    gScore.set(startId, 0);

    const h0 = getDistanceMeters([graphNodes[startId].lat, graphNodes[startId].lng], goalCoords);
    const openSet = [{ id: startId, f: heuristicWeight * h0, h: h0 }];
    const visited = new Set();

    while (openSet.length > 0) {
      if (searchAbortSignal) break;
      openSet.sort((a, b) => (a.f - b.f) || (a.h - b.h));
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
      for (const edge of (nodeAdj.get(curr) || [])) {
        const tentativeG = currG + edge.weight;
        if (!gScore.has(edge.to) || tentativeG < gScore.get(edge.to)) {
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          gScore.set(edge.to, tentativeG);
          const h = getDistanceMeters([graphNodes[edge.to].lat, graphNodes[edge.to].lng], goalCoords);
          const f = tentativeG + heuristicWeight * h;
          openSet.push({ id: edge.to, f, h });
          markFrontier(edge.to);
        }
      }

      $('#statVisited').textContent = visitedCount;
      $('#statFrontier').textContent = openSet.length;
      sfx.playRadarTick(visitedCount);

      if (currentSpeed < 900 && visitedCount % currentSpeed === 0) {
        await new Promise(r => setTimeout(r, 22));
      }
    }
  }

  const elapsed = Math.round(performance.now() - startTime);
  $('#statTime').textContent = `${elapsed} мс`;

  if (foundGoal) {
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

    const fullRoadPolyline = [];
    pathEdges.forEach(coords => {
      coords.forEach(pt => fullRoadPolyline.push(pt));
    });

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

/* ==========================================================================
   Режим «Битва алгоритмов» (Benchmark & Headless Search)
   ========================================================================== */
const ALGO_BMARK_CONFIG = {
  astar: { name: 'A* (Weighted)', color: '#ff2e93', desc: 'Эвристический поиск' },
  ucs:   { name: 'UCS (Дейкстра)', color: '#00f5d4', desc: 'Равномерная стоимость' },
  bfs:   { name: 'BFS (В ширину)', color: '#ffbe0b', desc: 'Волновой фронт' },
  dfs:   { name: 'DFS (В глубину)', color: '#b5179e', desc: 'Стековый обход' }
};

function runHeadlessSearch(algo, weight = 1.0) {
  if (graphNodes.length < 2 || graphStartId < 0 || graphGoalId < 0) return null;
  const startId = graphStartId;
  const goalId = graphGoalId;
  const startTime = performance.now();

  let visitedCount = 0;
  let maxFrontier = 0;
  let foundGoal = false;
  const parents = new Map();

  if (algo === 'bfs') {
    const queue = [startId];
    const visited = new Set([startId]);
    maxFrontier = 1;
    while (queue.length > 0) {
      if (queue.length > maxFrontier) maxFrontier = queue.length;
      const curr = queue.shift();
      visitedCount++;
      if (curr === goalId) {
        foundGoal = true;
        break;
      }
      for (const edge of (nodeAdj.get(curr) || [])) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          queue.push(edge.to);
        }
      }
    }
  } else if (algo === 'dfs') {
    const stack = [startId];
    const visited = new Set();
    maxFrontier = 1;
    while (stack.length > 0) {
      if (stack.length > maxFrontier) maxFrontier = stack.length;
      const curr = stack.pop();
      if (visited.has(curr)) continue;
      visited.add(curr);
      visitedCount++;
      if (curr === goalId) {
        foundGoal = true;
        break;
      }
      for (const edge of (nodeAdj.get(curr) || [])) {
        if (!visited.has(edge.to)) {
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          stack.push(edge.to);
        }
      }
    }
  } else if (algo === 'ucs') {
    const dist = new Map();
    dist.set(startId, 0);
    const pq = [{ id: startId, cost: 0 }];
    const visited = new Set();
    maxFrontier = 1;
    while (pq.length > 0) {
      if (pq.length > maxFrontier) maxFrontier = pq.length;
      pq.sort((a, b) => a.cost - b.cost);
      const { id: curr, cost: currCost } = pq.shift();
      if (visited.has(curr)) continue;
      visited.add(curr);
      visitedCount++;
      if (curr === goalId) {
        foundGoal = true;
        break;
      }
      for (const edge of (nodeAdj.get(curr) || [])) {
        const nextCost = currCost + edge.weight;
        if (!dist.has(edge.to) || nextCost < dist.get(edge.to)) {
          dist.set(edge.to, nextCost);
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          pq.push({ id: edge.to, cost: nextCost });
        }
      }
    }
  } else {
    const gScore = new Map();
    gScore.set(startId, 0);
    const h0 = getDistanceMeters([graphNodes[startId].lat, graphNodes[startId].lng], goalCoords);
    const openSet = [{ id: startId, f: weight * h0, h: h0 }];
    const visited = new Set();
    maxFrontier = 1;
    while (openSet.length > 0) {
      if (openSet.length > maxFrontier) maxFrontier = openSet.length;
      openSet.sort((a, b) => (a.f - b.f) || (a.h - b.h));
      const { id: curr } = openSet.shift();
      if (visited.has(curr)) continue;
      visited.add(curr);
      visitedCount++;
      if (curr === goalId) {
        foundGoal = true;
        break;
      }
      const currG = gScore.get(curr);
      for (const edge of (nodeAdj.get(curr) || [])) {
        const tentativeG = currG + edge.weight;
        if (!gScore.has(edge.to) || tentativeG < gScore.get(edge.to)) {
          parents.set(edge.to, { parentId: curr, edgeCoords: edge.coords, weight: edge.weight });
          gScore.set(edge.to, tentativeG);
          const h = getDistanceMeters([graphNodes[edge.to].lat, graphNodes[edge.to].lng], goalCoords);
          const f = tentativeG + weight * h;
          openSet.push({ id: edge.to, f, h });
        }
      }
    }
  }

  const execTime = Math.max(0.1, +(performance.now() - startTime).toFixed(1));
  const pathCoords = [];
  let pathLength = 0;
  if (foundGoal) {
    const pathEdges = [];
    let curr = goalId;
    while (curr !== undefined) {
      const pInfo = parents.get(curr);
      if (!pInfo) break;
      pathEdges.push(pInfo.edgeCoords);
      pathLength += pInfo.weight;
      curr = pInfo.parentId;
    }
    pathEdges.reverse();
    pathEdges.forEach(coords => {
      coords.forEach(pt => pathCoords.push(pt));
    });
  }

  return {
    algo,
    found: foundGoal,
    visitedCount,
    maxFrontier,
    pathLength: Math.round(pathLength),
    pathCoords,
    execTime
  };
}

function setActiveBenchmarkRow(algoId = null) {
  $$('#bmarkTableBody .bmark-row').forEach(row => {
    row.classList.toggle('active', algoId !== null && row.dataset.algo === algoId);
  });
}

function highlightBenchmarkPath(algoId) {
  if (!lastBenchmarkData || !lastBenchmarkData[algoId] || !mapInstance) return;
  const r = lastBenchmarkData[algoId];
  if (!r.found || !r.pathCoords || r.pathCoords.length === 0) return;

  if (!benchmarkLayerGroup) {
    benchmarkLayerGroup = L.layerGroup().addTo(mapInstance);
  }
  benchmarkLayerGroup.clearLayers();

  if (searchVisualLayer) searchVisualLayer.clearLayers();
  if (finalPathLayer) finalPathLayer.clearLayers();

  const cfg = ALGO_BMARK_CONFIG[algoId] || { color: '#ff2e93', name: algoId };

  L.polyline(r.pathCoords, {
    color: cfg.color,
    weight: 10,
    opacity: 0.35,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(benchmarkLayerGroup);

  const poly = L.polyline(r.pathCoords, {
    color: cfg.color,
    weight: 5,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(benchmarkLayerGroup);

  poly.bindPopup(`<b>${cfg.name}</b><br>Длина: <b>${r.pathLength} м</b><br>Исследовано: <b>${r.visitedCount}</b> узл.<br>Время: <b>${r.execTime} мс</b>`).openPopup();

  setActiveBenchmarkRow(algoId);

  $('#statStatus').textContent = `Показан маршрут: ${cfg.name} (${r.pathLength} м)`;
  $('#statStatus').style.color = cfg.color;
  $('#statDistance').textContent = `${(r.pathLength / 1000).toFixed(2)} км (${r.pathLength} м)`;
  $('#statVisited').textContent = r.visitedCount;
  $('#statFrontier').textContent = r.maxFrontier;
  $('#statTime').textContent = `${r.execTime} мс`;
}

function showAllBenchmarkPaths() {
  if (!lastBenchmarkData || !mapInstance) return;
  if (!benchmarkLayerGroup) {
    benchmarkLayerGroup = L.layerGroup().addTo(mapInstance);
  }
  benchmarkLayerGroup.clearLayers();

  if (searchVisualLayer) searchVisualLayer.clearLayers();
  if (finalPathLayer) finalPathLayer.clearLayers();

  setActiveBenchmarkRow(null);

  const drawOrder = [
    { id: 'dfs', weight: 4, opacity: 0.75, dashArray: '6, 8' },
    { id: 'bfs', weight: 4, opacity: 0.8,  dashArray: '3, 6' },
    { id: 'ucs', weight: 5, opacity: 0.85, dashArray: null },
    { id: 'astar', weight: 6, opacity: 0.95, dashArray: null }
  ];

  drawOrder.forEach(item => {
    const r = lastBenchmarkData[item.id];
    if (!r || !r.found || !r.pathCoords || r.pathCoords.length === 0) return;
    const cfg = ALGO_BMARK_CONFIG[item.id];

    const poly = L.polyline(r.pathCoords, {
      color: cfg.color,
      weight: item.weight,
      opacity: item.opacity,
      dashArray: item.dashArray,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(benchmarkLayerGroup);

    poly.bindTooltip(`${cfg.name}: ${r.pathLength} м (узлов: ${r.visitedCount})`, { sticky: true });
  });

  $('#statStatus').textContent = 'Отображены все 4 маршрута на одной карте';
  $('#statStatus').style.color = 'var(--cyan)';
}

async function runBenchmark() {
  if (isSearching) {
    searchAbortSignal = true;
    await new Promise(r => setTimeout(r, 60));
  }

  if (graphNodes.length < 2 || graphStartId < 0 || graphGoalId < 0) {
    await buildStreetNetwork();
  }
  if (graphNodes.length < 2 || graphStartId < 0 || graphGoalId < 0) return;

  sfx.playTap();

  const list = ['astar', 'ucs', 'bfs', 'dfs'];
  const results = {};
  for (const a of list) {
    results[a] = runHeadlessSearch(a, a === 'astar' ? heuristicWeight : 1.0);
  }
  lastBenchmarkData = results;

  const validLengths = Object.values(results).filter(r => r && r.found && r.pathLength > 0).map(r => r.pathLength);
  const minLen = validLengths.length ? Math.min(...validLengths) : 0;
  const maxVisited = Math.max(...Object.values(results).map(r => r ? r.visitedCount : 0), 1);

  const tbody = $('#bmarkTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    list.forEach(aKey => {
      const r = results[aKey];
      const cfg = ALGO_BMARK_CONFIG[aKey];
      const tr = document.createElement('tr');
      tr.className = 'bmark-row';
      tr.dataset.algo = aKey;

      let optBadge = '';
      if (!r || !r.found) {
        optBadge = '<span class="opt-badge bad">Не найден</span>';
      } else if (r.pathLength === minLen) {
        optBadge = '<span class="opt-badge good">Оптимален (100%)</span>';
      } else {
        const diffPct = minLen > 0 ? Math.round(((r.pathLength - minLen) / minLen) * 100) : 0;
        const cls = diffPct <= 10 ? 'warn' : 'bad';
        optBadge = `<span class="opt-badge ${cls}">+${diffPct}% (${r.pathLength - minLen} м)</span>`;
      }

      const astarWeightSuffix = aKey === 'astar' ? ` <span style="font-size:11px;opacity:0.75;">(w=${heuristicWeight.toFixed(1)})</span>` : '';

      tr.innerHTML = `
        <td>
          <div class="bmark-algo-cell">
            <span class="bmark-dot" style="background:${cfg.color};"></span>
            <b>${cfg.name}${astarWeightSuffix}</b>
          </div>
        </td>
        <td><b style="color:${cfg.color};font-size:14px;">${r ? r.visitedCount : '—'}</b></td>
        <td>${r && r.found ? `${r.pathLength} м` : '—'}</td>
        <td>${optBadge}</td>
        <td>${r ? r.maxFrontier : '—'}</td>
        <td>${r ? `${r.execTime} мс` : '—'}</td>
        <td>
          <button class="bmark-btn-show" data-algo="${aKey}">Показать</button>
        </td>
      `;

      tr.addEventListener('click', () => {
        sfx.playTap();
        highlightBenchmarkPath(aKey);
      });

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.bmark-btn-show').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        sfx.playTap();
        highlightBenchmarkPath(btn.dataset.algo);
      });
    });
  }

  const barsContainer = $('#bmarkBars');
  if (barsContainer) {
    barsContainer.innerHTML = '';
    list.forEach(aKey => {
      const r = results[aKey];
      const cfg = ALGO_BMARK_CONFIG[aKey];
      const count = r ? r.visitedCount : 0;
      const pct = Math.max(3, Math.round((count / maxVisited) * 100));

      const row = document.createElement('div');
      row.className = 'bmark-bar-row';
      row.innerHTML = `
        <span class="bmark-bar-name" style="color:${cfg.color};">${cfg.name}</span>
        <div class="bmark-bar-track">
          <div class="bmark-bar-fill" style="width:${pct}%;background:${cfg.color};"></div>
        </div>
        <span class="bmark-bar-val">${count} узл.</span>
      `;
      barsContainer.appendChild(row);
    });
  }

  const summaryEl = $('#bmarkSummary');
  if (summaryEl) {
    const aRes = results['astar'];
    const ucsRes = results['ucs'];
    const dfsRes = results['dfs'];

    let comparisonText = '';
    if (aRes && ucsRes && aRes.visitedCount > 0) {
      if (ucsRes.visitedCount > aRes.visitedCount) {
        const ratio = (ucsRes.visitedCount / aRes.visitedCount).toFixed(1);
        comparisonText = `в <b>${ratio}×</b> меньше, чем UCS (${ucsRes.visitedCount} узл.)`;
      } else if (ucsRes.visitedCount === aRes.visitedCount) {
        comparisonText = `столько же, сколько и UCS (${ucsRes.visitedCount} узл.)`;
      } else {
        comparisonText = `против <b>${ucsRes.visitedCount}</b> узл. у UCS`;
      }
    }

    const astarOptText = aRes && aRes.found && aRes.pathLength === minLen
      ? 'гарантированно кратчайший'
      : `субоптимальный (${aRes ? aRes.pathLength : 0} м вместо ${minLen} м)`;

    summaryEl.innerHTML = `
      ⚡ <b>Анализ:</b> A* (w=${heuristicWeight.toFixed(1)}) исследовал <b>${aRes ? aRes.visitedCount : 0}</b> узлов — ${comparisonText}, найдя <b>${astarOptText}</b> путь. DFS проверил <b>${dfsRes ? dfsRes.visitedCount : 0}</b> узлов и выдал маршрут длиной <b>${dfsRes && dfsRes.found ? dfsRes.pathLength : 0} м</b>.
    `;
  }

  const bmarkCard = $('#benchmarkCard');
  if (bmarkCard) {
    bmarkCard.style.display = 'flex';
    bmarkCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showAllBenchmarkPaths();
  sfx.playWin();
}

function updateAlgoInfoCard() {
  const info = ALGO_DETAILS[currentAlgo];
  if (!info) return;
  $('#algoInfoTitle').textContent = info.title;
  $('#algoInfoDesc').textContent = info.desc;
  const chips = $$('#algoInfoCard .chip');
  if (chips[0]) chips[0].innerHTML = `Оптимальность: <b>${info.optimality}</b>`;
  if (chips[1]) chips[1].innerHTML = `Временная сложность: <b>${info.complexity}</b>`;
  if (chips[2]) {
    if (currentAlgo === 'astar') {
      const modeLabel = heuristicWeight > 1
        ? '(Inadmissible)'
        : (heuristicWeight === 0 ? '(w=0 · Дейкстра)' : '(Admissible)');
      chips[2].innerHTML = `Эвристика: <b>h(n) × ${heuristicWeight.toFixed(1)} ${modeLabel}</b>`;
    } else {
      chips[2].innerHTML = `Эвристика: <b>${info.heuristic}</b>`;
    }
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
    updateAlgoInfoCard();
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
  const statusEl = $('#statStatus');
  if (!navigator.geolocation) {
    if (statusEl) {
      statusEl.textContent = 'GPS не поддерживается браузером';
      statusEl.style.color = '#ff4d6d';
    }
    return;
  }
  if (statusEl) {
    statusEl.textContent = 'Запрос GPS геолокации...';
    statusEl.style.color = 'var(--yellow)';
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      startCoords = [lat, lng];
      markerA.setLatLng(startCoords);

      goalCoords = [lat + 0.008, lng + 0.012];
      markerB.setLatLng(goalCoords);

      mapInstance.setView(startCoords, 14);
      buildStreetNetwork();
      if (statusEl) {
        statusEl.textContent = 'GPS получен! Точка А установлена';
        statusEl.style.color = 'var(--green)';
      }
    },
    err => {
      console.warn('GPS error:', err);
      if (statusEl) {
        statusEl.textContent = 'GPS недоступен. Используются стандартные координаты';
        statusEl.style.color = 'var(--yellow)';
      }
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

// Random Goal Destination (guaranteed 600–1600 m from Point A)
$('#btnRandomPoints')?.addEventListener('click', () => {
  sfx.playTap();
  if (isSearching) searchAbortSignal = true;
  const angle = Math.random() * Math.PI * 2;
  const distMeters = 650 + Math.random() * 950;
  const dLat = (distMeters * Math.cos(angle)) / 111320;
  const dLng = (distMeters * Math.sin(angle)) / (111320 * Math.cos(startCoords[0] * Math.PI / 180));
  goalCoords = [startCoords[0] + dLat, startCoords[1] + dLng];
  markerB.setLatLng(goalCoords);
  mapInstance.fitBounds([startCoords, goalCoords], { padding: [50, 50] });
  buildStreetNetwork();
});

// Heuristic Weight Slider (f(n) = g(n) + w * h(n))
const sliderWeight = $('#sliderWeight');
if (sliderWeight) {
  sliderWeight.addEventListener('input', e => {
    heuristicWeight = parseFloat(e.target.value);
    const valEl = $('#valWeight');
    if (valEl) valEl.textContent = `w = ${heuristicWeight.toFixed(1)}`;

    const badge = $('#badgeWeight');
    if (badge) {
      if (heuristicWeight === 0) {
        badge.textContent = 'UCS / Дейкстра (w=0)';
        badge.className = 'weight-badge zero';
      } else if (heuristicWeight === 1.0) {
        badge.textContent = 'Допустимая (A*, w=1)';
        badge.className = 'weight-badge admissible';
      } else if (heuristicWeight > 1.0) {
        badge.textContent = 'Недопустимая (Жадный / Weighted)';
        badge.className = 'weight-badge inadmissible';
      } else {
        badge.textContent = 'Допустимая (Консервативная)';
        badge.className = 'weight-badge admissible';
      }
    }

    if (currentAlgo !== 'astar') {
      $$('.algo-btn').forEach(btn => btn.classList.toggle('on', btn.dataset.algo === 'astar'));
      currentAlgo = 'astar';
    }
    updateAlgoInfoCard();
  });
}

// Benchmark Event Listeners
$('#btnBenchmark')?.addEventListener('click', runBenchmark);

$('#btnCloseBenchmark')?.addEventListener('click', () => {
  sfx.playTap();
  const card = $('#benchmarkCard');
  if (card) card.style.display = 'none';
  clearBenchmarkPaths();
  setActiveBenchmarkRow(null);
});

$('#btnShowAllPaths')?.addEventListener('click', () => {
  sfx.playTap();
  showAllBenchmarkPaths();
});

// Initialize Map
if (document.readyState === 'complete') {
  initAiMap();
} else {
  window.addEventListener('load', initAiMap);
}