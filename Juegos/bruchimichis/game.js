(function () {
  "use strict";

  const STORAGE_KEY = "bruchimichis-v1";
  const GRAVITY = 0.55;
  const FINISH_X = 0.92;

  GameI18n.init("bruchimichis");

  const COLOR_VALUES = [
    { value: "gris", key: "colorGray" },
    { value: "negro", key: "colorBlack" },
    { value: "cafe", key: "colorBrown" },
    { value: "blanco", key: "colorWhite" },
    { value: "negro y blanco", key: "colorBlackWhite" },
    { value: "blanco y cafe", key: "colorWhiteBrown" },
  ];

  const COLOR_MAP = {
    negro: { a: "#1a1a1a", b: "#1a1a1a" },
    cafe: { a: "#8b5a2b", b: "#8b5a2b" },
    blanco: { a: "#f2f2f2", b: "#f2f2f2" },
    gris: { a: "#808080", b: "#808080" },
    "negro y blanco": { a: "#1a1a1a", b: "#f2f2f2" },
    "blanco y cafe": { a: "#f2f2f2", b: "#8b5a2b" },
  };

  const state = {
    cats: [],
    selectedId: null,
    mode: "title",
    drag: null,
    race: null,
    animId: 0,
  };

  const ui = {
    playCanvas: document.getElementById("playCanvas"),
    raceCanvas: document.getElementById("raceCanvas"),
    playHint: document.getElementById("playHint"),
    raceStatus: document.getElementById("raceStatus"),
    raceHint: document.getElementById("raceHint"),
    selectColor: document.getElementById("selectColor"),
  };

  function fillColorSelect() {
    if (!ui.selectColor) return;
    const current = ui.selectColor.value || "blanco";
    const fallbacks = {
      colorBlack: "Negro",
      colorBrown: "Café",
      colorWhite: "Blanco",
      colorGray: "Gris",
      colorBlackWhite: "Negro y blanco",
      colorWhiteBrown: "Blanco y café",
    };
    ui.selectColor.innerHTML = "";
    COLOR_VALUES.forEach(({ value, key }) => {
      const opt = document.createElement("option");
      opt.value = value;
      const translated = GameI18n.t(key);
      opt.textContent = translated === key ? fallbacks[key] || value : translated;
      ui.selectColor.appendChild(opt);
    });
    ui.selectColor.value = COLOR_VALUES.some((c) => c.value === current) ? current : "blanco";
  }

  function refreshHints() {
    const sel = state.cats.find((c) => c.id === state.selectedId);
    if (sel) {
      ui.playHint.textContent = GameI18n.t("selected", { name: `${sel.nombre} (${sel.raza})`, wins: sel.wins });
    } else if (state.cats.length) {
      ui.playHint.textContent = GameI18n.t("playHintTap");
    } else {
      ui.playHint.textContent = GameI18n.t("playHintCreate");
    }
  }

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((el) => {
      el.classList.toggle("active", el.id === `screen${name}`);
    });
    state.mode = name;
    if (name === "Create") fillColorSelect();
    if (name === "Play") startPlayLoop();
    else if (name === "Race") startRace();
    else stopLoop();
  }

  function stopLoop() {
    if (state.animId) cancelAnimationFrame(state.animId);
    state.animId = 0;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cats: state.cats }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      state.cats = (JSON.parse(raw).cats || []).map(normalizeCat);
      if (state.cats.length) state.selectedId = state.cats[0].id;
    } catch {
      state.cats = [];
    }
  }

  function normalizeCat(c) {
    return {
      id: c.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nombre: String(c.nombre || GameI18n.t("defaultCat")).slice(0, 24),
      color: COLOR_MAP[c.color] ? c.color : "blanco",
      raza: String(c.raza || "Mestizo").slice(0, 32),
      x: Number(c.x) || 120,
      y: Number(c.y) || -80,
      vy: Number(c.vy) || 0,
      wins: Number(c.wins) || 0,
      scale: Number(c.scale) || 1,
      fatness: Number(c.fatness) || 1,
      falling: c.falling === true,
    };
  }

  function catSize(cat) {
    return 36 * cat.scale;
  }

  function hitTest(cat, x, y, pad) {
    const s = catSize(cat) * (pad || 1);
    const w = s * 1.45 * cat.fatness;
    const h = s * 1.35;
    return x >= cat.x - w / 2 && x <= cat.x + w / 2 && y >= cat.y - h && y <= cat.y + 12;
  }

  function drawCat(ctx, cat, opts) {
    const o = opts || {};
    const s = catSize(cat) * (o.scaleMul || 1);
    const fat = cat.fatness * (o.fatMul || 1);
    const colors = COLOR_MAP[cat.color] || COLOR_MAP.blanco;
    const x = cat.x;
    const y = cat.y;
    const selected = cat.id === state.selectedId;
    const twoTone = colors.a !== colors.b;
    const belly = twoTone ? colors.b : shade(colors.a, 18);

    ctx.save();
    ctx.translate(x, y);
    if (o.flip) ctx.scale(-1, 1);

    if (selected && !o.noRing) {
      ctx.strokeStyle = "#ffb6c1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.42, s * 1.05 * fat + 10, s * 0.82 + 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cola esponjosa
    ctx.strokeStyle = colors.a;
    ctx.lineWidth = s * 0.14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.62 * fat, -s * 0.08);
    ctx.bezierCurveTo(s * 1.15, -s * 0.55, s * 1.35, -s * 0.15, s * 1.2, s * 0.12);
    ctx.stroke();

    // Patas traseras
    drawPaw(ctx, -s * 0.28 * fat, s * 0.08, s * 0.16, colors.a);
    drawPaw(ctx, s * 0.28 * fat, s * 0.08, s * 0.16, colors.a);

    // Cuerpo
    ctx.fillStyle = colors.a;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.18, s * 0.62 * fat, s * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Panza
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.1, s * 0.42 * fat, s * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Patas delanteras
    drawPaw(ctx, -s * 0.38 * fat, -s * 0.02, s * 0.14, colors.a);
    drawPaw(ctx, s * 0.38 * fat, -s * 0.02, s * 0.14, colors.a);

    // Cabeza
    ctx.fillStyle = colors.a;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.62, s * 0.46 * fat, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mejillas más anchas
    ctx.beginPath();
    ctx.ellipse(-s * 0.28 * fat, -s * 0.55, s * 0.14, s * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.28 * fat, -s * 0.55, s * 0.14, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orejas
    drawEar(ctx, -s * 0.3, -s * 0.92, s * 0.22, colors.a, -1);
    drawEar(ctx, s * 0.3, -s * 0.92, s * 0.22, colors.a, 1);

    // Franjas en gatos bicolor
    if (twoTone) {
      ctx.fillStyle = colors.b;
      ctx.beginPath();
      ctx.ellipse(-s * 0.12 * fat, -s * 0.72, s * 0.1, s * 0.14, -0.3, 0, Math.PI * 2);
      ctx.ellipse(s * 0.12 * fat, -s * 0.72, s * 0.1, s * 0.14, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bigotes
    ctx.strokeStyle = "rgb(255 255 255 / 0.75)";
    ctx.lineWidth = Math.max(1, s * 0.025);
    ctx.lineCap = "round";
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 3; i += 1) {
        const ang = -0.08 + i * 0.08;
        ctx.beginPath();
        ctx.moveTo(side * s * 0.18, -s * 0.52);
        ctx.lineTo(side * s * 0.62, -s * (0.5 + ang));
        ctx.stroke();
      }
    });

    // Ojos
    const eyeY = -s * 0.64;
    const eyeX = s * 0.15;
    ctx.fillStyle = "#1a1028";
    ctx.beginPath();
    ctx.ellipse(-eyeX, eyeY, s * 0.065, s * 0.09, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeX, eyeY, s * 0.065, s * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-eyeX + s * 0.02, eyeY - s * 0.025, s * 0.022, 0, Math.PI * 2);
    ctx.arc(eyeX + s * 0.02, eyeY - s * 0.025, s * 0.022, 0, Math.PI * 2);
    ctx.fill();

    // Nariz y boca
    ctx.fillStyle = "#ffb6c1";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.56);
    ctx.lineTo(-s * 0.05, -s * 0.5);
    ctx.lineTo(s * 0.05, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c97b8b";
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.quadraticCurveTo(-s * 0.08, -s * 0.44, -s * 0.1, -s * 0.4);
    ctx.moveTo(0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.08, -s * 0.44, s * 0.1, -s * 0.4);
    ctx.stroke();

    // Nombre
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgb(0 0 0 / 0.35)";
    ctx.lineWidth = 3;
    ctx.font = `bold ${Math.max(10, s * 0.26)}px Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.strokeText(cat.nombre, 0, s * 0.42);
    ctx.fillText(cat.nombre, 0, s * 0.42);

    ctx.restore();
  }

  function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((n >> 16) & 255) + amount);
    const g = Math.min(255, ((n >> 8) & 255) + amount);
    const b = Math.min(255, (n & 255) + amount);
    return `rgb(${r},${g},${b})`;
  }

  function drawEar(ctx, ex, ey, size, color, side) {
    const tipX = ex + side * size * 0.08;
    const tipY = ey - size * 0.15;
    const outerX = ex - side * size * 0.42;
    const outerY = ey - size * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey + size * 0.35);
    ctx.lineTo(outerX, outerY);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffb6c1";
    ctx.beginPath();
    ctx.moveTo(ex - side * size * 0.05, ey + size * 0.05);
    ctx.lineTo(ex - side * size * 0.28, ey - size * 0.32);
    ctx.lineTo(ex + side * size * 0.02, ey - size * 0.08);
    ctx.closePath();
    ctx.fill();
  }

  function drawPaw(ctx, px, py, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffb6c1";
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(px + i * size * 0.28, py + size * 0.35, size * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resizeCanvas(canvas) {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
  }

  function groundY(canvas) {
    return canvas.height - 36;
  }

  function updatePlayPhysics(canvas) {
    const ground = groundY(canvas);
    state.cats.forEach((cat) => {
      if (state.drag?.id === cat.id) return;
      const h = catSize(cat) * 1.15;
      if (cat.falling || cat.y < ground - h) {
        cat.vy += GRAVITY;
        cat.y += cat.vy;
        if (cat.y >= ground - h) {
          cat.y = ground - h;
          cat.vy = 0;
          cat.falling = false;
        }
      }
    });
  }

  function renderPlay() {
    const canvas = ui.playCanvas;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const ground = groundY(canvas);

    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, w, h * 0.72);

    const grad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    grad.addColorStop(0, "#7cb342");
    grad.addColorStop(1, "#558b2f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(0, ground + 4, w, h - ground);

    state.cats.forEach((cat) => drawCat(ctx, cat));

    refreshHints();
  }

  function playLoop() {
    if (state.mode !== "Play") return;
    resizeCanvas(ui.playCanvas);
    updatePlayPhysics(ui.playCanvas);
    renderPlay();
    state.animId = requestAnimationFrame(playLoop);
  }

  function startPlayLoop() {
    stopLoop();
    resizeCanvas(ui.playCanvas);
    playLoop();
  }

  function spawnCat(data) {
    const canvas = ui.playCanvas;
    const w = canvas.width || 800;
    const cat = normalizeCat({
      ...data,
      x: 80 + Math.random() * Math.max(100, w - 160),
      y: -60 - Math.random() * 40,
      vy: 0,
      falling: true,
    });
    state.cats.push(cat);
    state.selectedId = cat.id;
    save();
    return cat;
  }

  function createCatFromForm() {
    const nombre = document.getElementById("inputNombre").value.trim();
    const color = document.getElementById("selectColor").value;
    const raza = document.getElementById("inputRaza").value.trim() || "Mestizo";
    if (!nombre) {
      alert(GameI18n.t("alertName"));
      return;
    }
    showScreen("Play");
    spawnCat({ nombre, color, raza });
  }

  function startRace() {
    if (state.cats.length < 1) {
      alert(GameI18n.t("alertNeedCat"));
      showScreen("Title");
      return;
    }
    if (state.cats.length === 1) {
      state.selectedId = state.cats[0].id;
    }
    if (!state.selectedId) {
      alert(GameI18n.t("alertPickBeforeRace"));
      showScreen("Play");
      return;
    }

    resizeCanvas(ui.raceCanvas);
    const lanes = state.cats.map((cat, i) => ({
      cat,
      lane: i,
      progress: 0,
      speed: 0.0012 + Math.random() * 0.0004,
      finished: false,
    }));

    state.race = {
      lanes,
      running: true,
      winner: null,
      countdown: 0,
    };
    ui.raceStatus.textContent = GameI18n.t("raceClickScreen");
    ui.raceHint.textContent = GameI18n.t("yourCat", { name: state.cats.find((c) => c.id === state.selectedId)?.nombre || "?" });
    stopLoop();
    raceLoop();
  }

  function boostSelectedCat() {
    const race = state.race;
    if (!race?.running || race.winner) return;
    const lane = race.lanes.find((l) => l.cat.id === state.selectedId);
    if (!lane || lane.finished) return;
    lane.speed += 0.00055;
    ui.raceStatus.textContent = GameI18n.t("raceBoostKeep", { name: lane.cat.nombre });
  }

  function finishRace(winnerLane) {
    const race = state.race;
    if (!race || race.winner) return;
    race.winner = winnerLane.cat.id;
    race.running = false;
    const cat = winnerLane.cat;
    cat.wins += 1;
    cat.scale = 1 + cat.wins * 0.14;
    cat.fatness = 1 + cat.wins * 0.16;
    save();
    ui.raceStatus.textContent = GameI18n.t("raceWin", { name: cat.nombre });
    ui.raceHint.textContent = GameI18n.t("raceAfterWin");
  }

  function renderRace() {
    const canvas = ui.raceCanvas;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const race = state.race;
    if (!race) return;

    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#c4a574";
    ctx.fillRect(0, h * 0.2, w, h * 0.65);

    const laneH = (h * 0.6) / Math.max(1, race.lanes.length);

    race.lanes.forEach((lane, i) => {
      const y = h * 0.22 + i * laneH + laneH * 0.5;
      const finishX = w * FINISH_X;

      ctx.strokeStyle = "rgb(255 255 255 / 0.25)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(40, y + laneH * 0.35);
      ctx.lineTo(finishX, y + laneH * 0.35);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fff";
      ctx.fillRect(finishX, y - laneH * 0.35, 6, laneH * 0.7);

      const runX = 50 + lane.progress * (finishX - 60);
      drawCat(ctx, { ...lane.cat, x: runX, y }, { scaleMul: 0.85, noRing: lane.cat.id !== state.selectedId });

      if (lane.cat.id === state.selectedId) {
        ctx.fillStyle = "#ffb6c1";
        ctx.font = "bold 12px Segoe UI";
        ctx.fillText("★ TU GATO", runX, y - laneH * 0.42);
      }
    });
  }

  function updateRace() {
    const race = state.race;
    if (!race?.running) return;

    race.lanes.forEach((lane) => {
      if (lane.finished) return;
      lane.progress += lane.speed * 16;
      if (lane.progress >= 1) {
        lane.progress = 1;
        lane.finished = true;
        if (!race.winner) finishRace(lane);
      }
    });
  }

  function raceLoop() {
    if (state.mode !== "Race") return;
    resizeCanvas(ui.raceCanvas);
    updateRace();
    renderRace();
    state.animId = requestAnimationFrame(raceLoop);
  }

  function pickCatAt(x, y) {
    for (let i = state.cats.length - 1; i >= 0; i -= 1) {
      if (hitTest(state.cats[i], x, y)) return state.cats[i];
    }
    return null;
  }

  function bindPlayEvents() {
    const canvas = ui.playCanvas;

    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const cat = pickCatAt(x, y);
      if (cat) {
        state.selectedId = cat.id;
        state.drag = { id: cat.id, offX: x - cat.x, offY: y - cat.y };
        cat.falling = false;
        cat.vy = 0;
        canvas.setPointerCapture(e.pointerId);
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!state.drag) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const cat = state.cats.find((c) => c.id === state.drag.id);
      if (!cat) return;
      cat.x = x - state.drag.offX;
      cat.y = Math.min(y - state.drag.offY, groundY(canvas) - catSize(cat) * 1.15);
      cat.falling = false;
      cat.vy = 0;
    });

    const endDrag = () => {
      if (state.drag) save();
      state.drag = null;
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
  }

  function bindRaceEvents() {
    ui.raceCanvas.addEventListener("click", () => boostSelectedCat());
    ui.raceCanvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") boostSelectedCat();
    });
  }

  function bindEvents() {
    document.getElementById("btnPlay").addEventListener("click", () => showScreen("Play"));
    document.getElementById("btnCreate").addEventListener("click", () => showScreen("Create"));
    document.getElementById("btnRace").addEventListener("click", () => showScreen("Race"));
    document.getElementById("btnBackFromCreate").addEventListener("click", () => showScreen("Title"));
    document.getElementById("btnSaveCat").addEventListener("click", createCatFromForm);
    document.getElementById("btnBackTitle").addEventListener("click", () => showScreen("Title"));
    document.getElementById("btnCreatePlay").addEventListener("click", () => showScreen("Create"));
    document.getElementById("btnRacePlay").addEventListener("click", () => showScreen("Race"));
    document.getElementById("btnBackPlay").addEventListener("click", () => showScreen("Play"));

    if (/\/Juegos\//i.test(decodeURIComponent(location.pathname))) {
      document.getElementById("btnBackAdmin").hidden = false;
    }

    bindPlayEvents();
    bindRaceEvents();
    window.addEventListener("resize", () => {
      if (state.mode === "Play") resizeCanvas(ui.playCanvas);
      if (state.mode === "Race") resizeCanvas(ui.raceCanvas);
    });
  }

  function boot() {
    load();
    fillColorSelect();
    bindEvents();
    GameI18n.onChange(() => {
      GameI18n.applyDom();
      fillColorSelect();
      if (state.mode === "Play") refreshHints();
    });
  }

  boot();
})();
