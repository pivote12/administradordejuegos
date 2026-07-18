(function () {
  "use strict";

  GameI18n.init("shape-bowl-race");

  const STORAGE_KEY = "shape-bowl-race-data";
  const WORLD_W = 960;
  const WORLD_H = 540;
  const BALL_RADIUS = 28;
  const BALL_BORDER_PX = 3;
  const GRAVITY_ZONE_START = 120;
  const GRAVITY_ZONE_FULL = 280;
  const GRAVITY_MAX = 0.42;
  const SPACE_DAMPING = 0.992;
  const AIR_DAMPING = 0.985;
  const WALL_BOUNCE = 0.72;
  const FLOOR_BOUNCE = 0.55;
  const BALL_RESTITUTION = 0.82;
  const MAX_THROW_SPEED = 18;
  const THROW_SCALE = 0.14;
  const MIN_BALLS_RACE = 2;

  const BOWL = {
    cx: 400,
    innerR: 140,
    wall: 14,
    openHalf: 0.52,
    get arcCenterY() {
      return 330;
    },
    get rimY() {
      return this.arcCenterY - this.innerR;
    }
  };

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenPartidas: document.getElementById("screenPartidas"),
    screenWorld: document.getElementById("screenWorld"),
    screenMake: document.getElementById("screenMake"),
    screenBowlRace: document.getElementById("screenBowlRace"),
    screenEarnings: document.getElementById("screenEarnings"),
    partidaList: document.getElementById("partidaList"),
    partidaEmpty: document.getElementById("partidaEmpty"),
    inputPartidaName: document.getElementById("inputPartidaName"),
    worldTitle: document.getElementById("worldTitle"),
    worldMeta: document.getElementById("worldMeta"),
    worldHint: document.getElementById("worldHint"),
    worldArena: document.getElementById("worldArena"),
    worldBalls: document.getElementById("worldBalls"),
    bowlCanvas: document.getElementById("bowlCanvas"),
    bowlMeta: document.getElementById("bowlMeta"),
    bowlStatus: document.getElementById("bowlStatus"),
    earningsList: document.getElementById("earningsList"),
    earningsEmpty: document.getElementById("earningsEmpty"),
    inputName: document.getElementById("inputName"),
    inputColor: document.getElementById("inputColor"),
    inputColor2: document.getElementById("inputColor2"),
    inputBorderColor: document.getElementById("inputBorderColor"),
    inputTextColor: document.getElementById("inputTextColor"),
    checkRainbow: document.getElementById("checkRainbow"),
    checkMonochrome: document.getElementById("checkMonochrome"),
    checkBorder: document.getElementById("checkBorder"),
    checkText: document.getElementById("checkText"),
    labelColor1: document.getElementById("labelColor1"),
    monoBlock: document.getElementById("monoBlock"),
    monoRow: document.getElementById("monoRow"),
    borderRow: document.getElementById("borderRow"),
    textRow: document.getElementById("textRow"),
    makePreview: document.getElementById("makePreview"),
    makePreviewFill: document.getElementById("makePreviewFill"),
    makePreviewText: document.getElementById("makePreviewText"),
    makePreviewName: document.getElementById("makePreviewName")
  };

  const state = {
    partidas: [],
    currentPartidaId: null,
    activePartidaSessionId: null,
    balls: [],
    draft: defaultDraft(),
    drag: null,
    running: false,
    frameId: null,
    bowl: {
      active: false,
      balls: [],
      offsetX: 0,
      offsetY: 0,
      drag: null,
      frameId: null,
      finished: false
    }
  };

  let saveToastTimer = null;
  const bowlCtx = ui.bowlCanvas.getContext("2d");

  function defaultDraft() {
    return {
      name: "",
      color: "#4cc9f0",
      color2: "#f72585",
      border: false,
      borderColor: "#1b263b",
      textEnabled: true,
      textColor: "#ffffff",
      rainbow: false,
      monochrome: false
    };
  }

  function refreshI18n() {
    GameI18n.applyDom(document);
    renderWorld();
    renderPartidaList();
    if (ui.screenEarnings.classList.contains("active")) {
      renderEarnings();
    }
    if (state.bowl.active) {
      updateBowlMeta();
    }
    updateMakeUi();
    renderMakePreview();
  }

  GameI18n.onChange(refreshI18n);

  function normalizeBall(ball) {
    return {
      id: ball.id || `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: String(ball.name || "Ball").slice(0, 24),
      color: ball.color || "#4cc9f0",
      color2: ball.color2 || "#f72585",
      border: !!ball.border,
      borderColor: ball.borderColor || "#1b263b",
      textEnabled: ball.textEnabled !== false,
      textColor: ball.textColor || "#ffffff",
      rainbow: !!ball.rainbow,
      monochrome: !!ball.monochrome,
      radius: BALL_RADIUS
    };
  }

  function normalizePartida(partida) {
    const wins = partida.wins && typeof partida.wins === "object" ? partida.wins : {};
    return {
      id: partida.id || `p-${Date.now()}`,
      name: String(partida.name || "Game").slice(0, 32),
      createdAt: partida.createdAt || Date.now(),
      balls: Array.isArray(partida.balls) ? partida.balls.map(serializeBall) : [],
      wins: { ...wins }
    };
  }

  function serializeBall(ball) {
    return {
      id: ball.id,
      name: ball.name,
      color: ball.color,
      color2: ball.color2,
      border: ball.border,
      borderColor: ball.borderColor,
      textEnabled: ball.textEnabled,
      textColor: ball.textColor,
      rainbow: ball.rainbow,
      monochrome: ball.monochrome,
      x: ball.x,
      y: ball.y,
      vx: ball.vx,
      vy: ball.vy
    };
  }

  function getCurrentPartida() {
    return state.partidas.find((p) => p.id === state.currentPartidaId) || null;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.partidas)) {
        state.partidas = data.partidas.map(normalizePartida);
        state.currentPartidaId = data.currentPartidaId || null;
        if (state.currentPartidaId && getCurrentPartida()) {
          loadBallsFromPartida();
        }
      }
    } catch (_err) {
      state.partidas = [];
      state.currentPartidaId = null;
    }
  }

  function save() {
    syncBallsToCurrentPartida();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          partidas: state.partidas.map((p) => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt,
            balls: Array.isArray(p.balls) ? p.balls : [],
            wins: p.wins && typeof p.wins === "object" ? { ...p.wins } : {}
          })),
          currentPartidaId: state.currentPartidaId
        })
      );
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  function showSaveToast(ok, message) {
    const toast = document.getElementById("saveToast");
    if (!toast) return;
    toast.textContent = message || GameI18n.t(ok ? "saved" : "saveError");
    toast.hidden = false;
    clearTimeout(saveToastTimer);
    saveToastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function loadBallsFromPartida() {
    const partida = getCurrentPartida();
    if (!partida) {
      state.balls = [];
      state.activePartidaSessionId = null;
      return;
    }
    state.balls = partida.balls.map((ball) => hydrateBall(ball));
    state.activePartidaSessionId = state.currentPartidaId;
  }

  function hydrateBall(ball) {
    const normalized = normalizeBall(ball);
    return {
      ...normalized,
      x: ball.x ?? 80 + Math.random() * (WORLD_W - 160),
      y: ball.y ?? 80 + Math.random() * (WORLD_H - 160),
      vx: ball.vx ?? (Math.random() - 0.5) * 2,
      vy: ball.vy ?? (Math.random() - 0.5) * 2,
      dragging: false
    };
  }

  function syncBallsToCurrentPartida() {
    const partida = getCurrentPartida();
    if (!partida || state.activePartidaSessionId !== state.currentPartidaId) return;
    partida.balls = state.balls.map(serializeBall);
  }

  function getPartidaWins() {
    const partida = getCurrentPartida();
    if (!partida) return {};
    if (!partida.wins || typeof partida.wins !== "object") partida.wins = {};
    return partida.wins;
  }

  function getBallWins(ballId) {
    return Number(getPartidaWins()[ballId]) || 0;
  }

  function addBallWin(ballId) {
    const wins = getPartidaWins();
    wins[ballId] = (Number(wins[ballId]) || 0) + 1;
    const ok = save();
    showSaveToast(ok, ok ? GameI18n.t("earningsSaved") : GameI18n.t("saveError"));
  }

  function resetAllWins() {
    const partida = getCurrentPartida();
    if (partida) partida.wins = {};
  }

  function showScreen(name) {
    const screens = {
      title: ui.screenTitle,
      partidas: ui.screenPartidas,
      world: ui.screenWorld,
      make: ui.screenMake,
      bowlRace: ui.screenBowlRace,
      earnings: ui.screenEarnings
    };
    Object.entries(screens).forEach(([key, el]) => {
      if (el) el.classList.toggle("active", key === name);
    });

    if (name === "world") {
      startWorldLoop();
      renderWorld();
    } else if (name === "bowlRace") {
      stopWorldLoop();
      endDrag();
      startBowlRace();
    } else if (name === "earnings") {
      stopWorldLoop();
      endDrag();
      stopBowlRace();
      renderEarnings();
    } else if (name === "partidas") {
      stopWorldLoop();
      endDrag();
      stopBowlRace();
      renderPartidaList();
    } else if (name === "make") {
      stopWorldLoop();
      endDrag();
    } else {
      stopWorldLoop();
      endDrag();
      stopBowlRace();
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderPartidaList() {
    ui.partidaList.innerHTML = "";
    const sorted = [...state.partidas].sort((a, b) => b.createdAt - a.createdAt);
    ui.partidaEmpty.hidden = sorted.length > 0;

    sorted.forEach((partida) => {
      const li = document.createElement("li");
      li.className = "list-item";

      const main = document.createElement("div");
      main.className = "list-item-main";
      const count = partida.balls.length;
      main.innerHTML = `<strong>${escapeHtml(partida.name)}</strong><span>${GameI18n.t("ballsMeta", { n: count })}</span>`;
      main.addEventListener("click", () => openPartida(partida.id));

      const actions = document.createElement("div");
      actions.className = "list-item-actions";

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn-delete-partida";
      del.title = GameI18n.t("deleteGame");
      del.textContent = "🗑";
      del.addEventListener("click", (event) => {
        event.stopPropagation();
        deletePartida(partida.id, partida.name);
      });

      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "→";
      arrow.addEventListener("click", () => openPartida(partida.id));

      actions.appendChild(del);
      actions.appendChild(arrow);
      li.appendChild(main);
      li.appendChild(actions);
      ui.partidaList.appendChild(li);
    });
  }

  function deletePartida(id, name) {
    const label = String(name || GameI18n.t("games"));
    if (!confirm(GameI18n.t("deleteGameConfirm", { name: label }))) return;

    state.partidas = state.partidas.filter((p) => p.id !== id);
    if (state.currentPartidaId === id) {
      state.currentPartidaId = null;
      state.balls = [];
      state.activePartidaSessionId = null;
      renderPartidaList();
      save();
      showScreen("partidas");
      return;
    }
    renderPartidaList();
    save();
  }

  function createPartida(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return;
    const partida = normalizePartida({
      id: `p-${Date.now()}`,
      name: trimmed,
      createdAt: Date.now(),
      balls: []
    });
    state.partidas.push(partida);
    ui.inputPartidaName.value = "";
    save();
    openPartida(partida.id);
  }

  function openPartida(id) {
    if (state.currentPartidaId && state.currentPartidaId !== id) {
      syncBallsToCurrentPartida();
    }
    state.currentPartidaId = id;
    loadBallsFromPartida();
    const partida = getCurrentPartida();
    if (partida) ui.worldTitle.textContent = partida.name;
    showScreen("world");
  }

  function hexToRgb(hex) {
    const value = String(hex || "#000").replace("#", "");
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function isDarkColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.52;
  }

  function ballLabel(name) {
    const clean = String(name || "").trim();
    if (!clean) return "?";
    const letters = clean.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");
    const digits = clean.replace(/\D/g, "");
    let text = (letters.slice(0, 2) || clean.slice(0, 2)).toUpperCase();
    if (digits.length) text += digits[0];
    return text.slice(0, 4);
  }

  function applyBallLook(node, fill, text, data, mini) {
    const cfg = normalizeBall(data);
    node.className = "ball" + (mini ? " mini" : "");
    node.classList.toggle("has-border", cfg.border);
    node.style.setProperty("--ball-color", cfg.color);
    node.style.setProperty("--ball-color2", cfg.color2);
    if (cfg.border) node.style.setProperty("--ball-border", cfg.borderColor);

    fill.className = "ball-fill";
    if (cfg.rainbow) {
      fill.classList.add("rainbow", isDarkColor(cfg.color) ? "is-dark" : "is-light");
      fill.style.background = cfg.color;
    } else if (cfg.monochrome) {
      fill.classList.add("monochrome");
      fill.style.background = cfg.color;
    } else {
      fill.style.background = cfg.color;
    }

    if (text) {
      if (cfg.textEnabled) {
        text.hidden = false;
        text.textContent = ballLabel(cfg.name);
        text.style.color = cfg.textColor;
      } else {
        text.hidden = true;
        text.textContent = "";
      }
    }
  }

  function buildBallNode(data, mini) {
    const wrap = document.createElement("div");
    const fill = document.createElement("div");
    const text = document.createElement("span");
    text.className = "ball-text";
    wrap.appendChild(fill);
    wrap.appendChild(text);
    applyBallLook(wrap, fill, text, data, mini);
    return { wrap, fill, text };
  }

  function getArenaLayout() {
    const rect = ui.worldArena.getBoundingClientRect();
    const scale = Math.min(rect.width / WORLD_W, rect.height / WORLD_H);
    const offsetX = (rect.width - WORLD_W * scale) / 2;
    const offsetY = (rect.height - WORLD_H * scale) / 2;
    return { rect, scale, offsetX, offsetY };
  }

  function worldToScreen(x, y) {
    const { scale, offsetX, offsetY } = getArenaLayout();
    return { x: offsetX + x * scale, y: offsetY + y * scale };
  }

  function clientToWorld(clientX, clientY) {
    const { rect, scale, offsetX, offsetY } = getArenaLayout();
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale
    };
  }

  function renderWorld() {
    const { scale } = getArenaLayout();
    const count = state.balls.length;
    ui.worldMeta.textContent = GameI18n.t("ballsMeta", { n: count });
    ui.worldHint.hidden = count > 0;
    ui.worldBalls.innerHTML = "";

    state.balls.forEach((ball) => {
      const outer = document.createElement("div");
      const screen = worldToScreen(ball.x, ball.y);
      const diam = ball.radius * 2 * scale;
      outer.className = "world-ball-wrap";
      outer.dataset.id = ball.id;
      outer.style.left = `${screen.x}px`;
      outer.style.top = `${screen.y}px`;
      const { wrap } = buildBallNode(ball, true);
      wrap.style.setProperty("--ball-size", `${diam}px`);
      wrap.style.setProperty("--ball-border-width", `${BALL_BORDER_PX}px`);
      outer.appendChild(wrap);
      ui.worldBalls.appendChild(outer);
    });
  }

  function updateBallNodePosition(ball) {
    const node = ui.worldBalls.querySelector(`[data-id="${ball.id}"]`);
    if (!node) return;
    const screen = worldToScreen(ball.x, ball.y);
    node.style.left = `${screen.x}px`;
    node.style.top = `${screen.y}px`;
  }

  function getBallById(id) {
    return state.balls.find((b) => b.id === id) || null;
  }

  function hitTestBall(worldX, worldY) {
    for (let i = state.balls.length - 1; i >= 0; i -= 1) {
      const ball = state.balls[i];
      const dx = worldX - ball.x;
      const dy = worldY - ball.y;
      if (dx * dx + dy * dy <= ball.radius * ball.radius) return ball;
    }
    return null;
  }

  function getGravityStrength(y) {
    if (y < GRAVITY_ZONE_START) return 0;
    const t = (y - GRAVITY_ZONE_START) / (GRAVITY_ZONE_FULL - GRAVITY_ZONE_START);
    return GRAVITY_MAX * Math.min(1, Math.max(0, t));
  }

  function getDamping(y) {
    return y < GRAVITY_ZONE_START ? SPACE_DAMPING : AIR_DAMPING;
  }

  function clampVelocity(ball) {
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > MAX_THROW_SPEED) {
      const scale = MAX_THROW_SPEED / speed;
      ball.vx *= scale;
      ball.vy *= scale;
    }
  }

  function resolveWallCollision(ball) {
    const r = ball.radius;
    if (ball.x - r < 0) {
      ball.x = r;
      ball.vx = Math.abs(ball.vx) * WALL_BOUNCE;
    }
    if (ball.x + r > WORLD_W) {
      ball.x = WORLD_W - r;
      ball.vx = -Math.abs(ball.vx) * WALL_BOUNCE;
    }
    if (ball.y - r < 0) {
      ball.y = r;
      ball.vy = Math.abs(ball.vy) * WALL_BOUNCE;
    }
    if (ball.y + r > WORLD_H) {
      ball.y = WORLD_H - r;
      ball.vy = -Math.abs(ball.vy) * FLOOR_BOUNCE;
      ball.vx *= 0.98;
    }
  }

  function resolveBallCollision(a, b) {
    if (a.dragging || b.dragging) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.radius + b.radius;
    if (dist >= minDist || dist < 0.001) return;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
    const relVx = a.vx - b.vx;
    const relVy = a.vy - b.vy;
    const closing = relVx * nx + relVy * ny;
    if (closing < 0) {
      const impulse = (-(1 + BALL_RESTITUTION) * closing) / 2;
      a.vx += impulse * nx;
      a.vy += impulse * ny;
      b.vx -= impulse * nx;
      b.vy -= impulse * ny;
    }
  }

  function resolveAllBallCollisions() {
    for (let i = 0; i < state.balls.length; i += 1) {
      for (let j = i + 1; j < state.balls.length; j += 1) {
        resolveBallCollision(state.balls[i], state.balls[j]);
      }
    }
  }

  function separateTouching(moving, other) {
    const dx = moving.x - other.x;
    const dy = moving.y - other.y;
    const dist = Math.hypot(dx, dy);
    const minDist = moving.radius + other.radius;
    if (dist >= minDist || dist < 0.001) {
      if (dist < 0.001 && minDist > 0) moving.x = other.x + minDist;
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    moving.x = other.x + nx * minDist;
    moving.y = other.y + ny * minDist;
  }

  function clampBallPosition(ball) {
    const r = ball.radius;
    ball.x = Math.max(r, Math.min(WORLD_W - r, ball.x));
    ball.y = Math.max(r, Math.min(WORLD_H - r, ball.y));
  }

  function resolveDragTouches(dragged) {
    state.balls.forEach((other) => {
      if (other.id !== dragged.id) separateTouching(dragged, other);
    });
    clampBallPosition(dragged);
  }

  function pushDragSample(drag, x, y) {
    const now = performance.now();
    drag.samples.push({ x, y, t: now });
    if (drag.samples.length > 6) drag.samples.shift();
  }

  function velocityFromDragSamples(samples) {
    if (!samples || samples.length < 2) return { vx: 0, vy: 0 };
    const newest = samples[samples.length - 1];
    const oldest = samples[0];
    const dt = (newest.t - oldest.t) / 1000;
    if (dt <= 0.001) return { vx: 0, vy: 0 };
    return {
      vx: ((newest.x - oldest.x) / dt) * THROW_SCALE,
      vy: ((newest.y - oldest.y) / dt) * THROW_SCALE
    };
  }

  function startDrag(event, ballId) {
    const ball = getBallById(ballId);
    if (!ball) return;
    event.preventDefault();
    event.stopPropagation();
    const world = clientToWorld(event.clientX, event.clientY);
    ball.dragging = true;
    state.drag = {
      ballId,
      offsetX: world.x - ball.x,
      offsetY: world.y - ball.y,
      pointerId: event.pointerId,
      samples: []
    };
    pushDragSample(state.drag, ball.x, ball.y);
    const node = ui.worldBalls.querySelector(`[data-id="${ballId}"]`);
    if (node) node.classList.add("is-dragging");
    ui.worldArena.setPointerCapture(event.pointerId);
  }

  function onDragMove(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) return;
    const ball = getBallById(state.drag.ballId);
    if (!ball) return;
    const world = clientToWorld(event.clientX, event.clientY);
    ball.x = world.x - state.drag.offsetX;
    ball.y = world.y - state.drag.offsetY;
    resolveDragTouches(ball);
    pushDragSample(state.drag, ball.x, ball.y);
    updateBallNodePosition(ball);
  }

  function endDrag(event) {
    if (!state.drag) return;
    if (event && event.pointerId !== state.drag.pointerId) return;
    const ball = getBallById(state.drag.ballId);
    const node = ui.worldBalls.querySelector(`[data-id="${state.drag.ballId}"]`);
    if (ball) {
      const throwVel = velocityFromDragSamples(state.drag.samples);
      ball.vx = throwVel.vx;
      ball.vy = throwVel.vy;
      clampVelocity(ball);
      ball.dragging = false;
    }
    if (node) node.classList.remove("is-dragging");
    try {
      ui.worldArena.releasePointerCapture(state.drag.pointerId);
    } catch (_err) {
      /* ignore */
    }
    state.drag = null;
  }

  function stepWorld() {
    if (!state.balls.length) return;
    if (!state.balls.some((b) => !b.dragging)) return;

    state.balls.forEach((ball) => {
      if (ball.dragging) return;
      ball.vy += getGravityStrength(ball.y);
      const damping = getDamping(ball.y);
      ball.vx *= damping;
      ball.vy *= damping;
      ball.x += ball.vx;
      ball.y += ball.vy;
      resolveWallCollision(ball);
    });
    resolveAllBallCollisions();
    state.balls.forEach((ball) => {
      if (!ball.dragging) updateBallNodePosition(ball);
    });
  }

  function tickWorld() {
    stepWorld();
    state.frameId = requestAnimationFrame(tickWorld);
  }

  function startWorldLoop() {
    if (state.running) return;
    state.running = true;
    state.frameId = requestAnimationFrame(tickWorld);
  }

  function stopWorldLoop() {
    state.running = false;
    if (state.frameId) {
      cancelAnimationFrame(state.frameId);
      state.frameId = null;
    }
  }

  function readDraft() {
    state.draft = {
      name: ui.inputName.value.trim(),
      color: ui.inputColor.value,
      color2: ui.inputColor2.value,
      border: ui.checkBorder.checked,
      borderColor: ui.inputBorderColor.value,
      textEnabled: ui.checkText.checked,
      textColor: ui.inputTextColor.value,
      rainbow: ui.checkRainbow.checked,
      monochrome: ui.checkMonochrome.checked
    };
    updateMakeUi();
    renderMakePreview();
  }

  function syncDraftToControls() {
    const d = state.draft;
    ui.inputName.value = d.name;
    ui.inputColor.value = d.color;
    ui.inputColor2.value = d.color2;
    ui.inputBorderColor.value = d.borderColor;
    ui.inputTextColor.value = d.textColor;
    ui.checkRainbow.checked = d.rainbow;
    ui.checkMonochrome.checked = d.monochrome;
    ui.checkBorder.checked = d.border;
    ui.checkText.checked = d.textEnabled;
    updateMakeUi();
    renderMakePreview();
  }

  function updateMakeUi() {
    const d = state.draft;
    ui.labelColor1.textContent = d.monochrome && !d.rainbow ? GameI18n.t("color1") : GameI18n.t("color");
    ui.monoBlock.hidden = d.rainbow;
    ui.monoRow.hidden = !d.monochrome || d.rainbow;
    ui.borderRow.hidden = !d.border;
    ui.textRow.hidden = !d.textEnabled;
  }

  function renderMakePreview() {
    const unnamed = GameI18n.t("unnamed");
    ui.makePreviewName.textContent = state.draft.name || unnamed;
    applyBallLook(ui.makePreview, ui.makePreviewFill, ui.makePreviewText, state.draft, false);
  }

  function openMake() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGame"));
      showScreen("partidas");
      return;
    }
    state.draft = defaultDraft();
    syncDraftToControls();
    showScreen("make");
  }

  function saveBall() {
    readDraft();
    if (!state.draft.name) {
      alert(GameI18n.t("alertBallName"));
      ui.inputName.focus();
      return;
    }
    const ball = hydrateBall({
      ...normalizeBall(state.draft),
      x: 80 + Math.random() * (WORLD_W - 160),
      y: 80 + Math.random() * (WORLD_H - 160),
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5
    });
    resetAllWins();
    state.balls.push(ball);
    save();
    showScreen("world");
  }

  function renderEarnings() {
    ui.earningsList.innerHTML = "";
    if (!state.balls.length) {
      ui.earningsEmpty.hidden = false;
      return;
    }
    ui.earningsEmpty.hidden = true;

    const rows = state.balls
      .map((ball) => ({ ball, count: getBallWins(ball.id) }))
      .sort((a, b) => b.count - a.count || a.ball.name.localeCompare(b.ball.name, "en"));

    rows.forEach(({ ball, count }) => {
      const li = document.createElement("li");
      li.className = "win-row";
      const mini = buildBallNode(ball, true);
      mini.wrap.style.setProperty("--ball-size", "40px");
      const name = document.createElement("span");
      name.textContent = ball.name;
      const badge = document.createElement("span");
      badge.className = "wins-badge";
      badge.textContent = GameI18n.t("earningsBadge", { n: count });
      li.appendChild(mini.wrap);
      li.appendChild(name);
      li.appendChild(badge);
      ui.earningsList.appendChild(li);
    });
  }

  function openEarnings() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGameShort"));
      showScreen("partidas");
      return;
    }
    showScreen("earnings");
  }

  function openBowlRaceScreen() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGameShort"));
      showScreen("partidas");
      return;
    }
    if (state.balls.length < MIN_BALLS_RACE) {
      alert(GameI18n.t("alertMinBalls", { n: MIN_BALLS_RACE, have: state.balls.length }));
      return;
    }
    showScreen("bowlRace");
  }

  function getBowlArcCenter() {
    return {
      cx: BOWL.cx + state.bowl.offsetX,
      cy: BOWL.arcCenterY + state.bowl.offsetY
    };
  }

  function canvasPointerPos(event) {
    const rect = ui.bowlCanvas.getBoundingClientRect();
    const scaleX = ui.bowlCanvas.width / rect.width;
    const scaleY = ui.bowlCanvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function isPointInOpening(x, y, cx, cy) {
    const dx = x - cx;
    const dy = y - cy;
    const angle = Math.atan2(dy, dx);
    const openCenter = -Math.PI / 2;
    let diff = angle - openCenter;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) < BOWL.openHalf && y < cy + 20;
  }

  function hitTestBowl(x, y) {
    const { cx, cy } = getBowlArcCenter();
    const rim = getBowlRimPoints(cx, cy);
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);

    if (y >= rim.rimY - 24 && y <= cy + BOWL.innerR + BOWL.wall && x >= rim.leftX - 28 && x <= rim.rightX + 28) {
      return true;
    }
    if (dist <= BOWL.innerR + BOWL.wall + 6 && !isPointInOpening(x, y, cx, cy)) {
      return true;
    }
    return false;
  }

  function getBowlRimPoints(cx, cy) {
    const leftAngle = -Math.PI / 2 - BOWL.openHalf;
    const rightAngle = -Math.PI / 2 + BOWL.openHalf;
    return {
      leftX: cx + Math.cos(leftAngle) * BOWL.innerR,
      leftY: cy + Math.sin(leftAngle) * BOWL.innerR,
      rightX: cx + Math.cos(rightAngle) * BOWL.innerR,
      rightY: cy + Math.sin(rightAngle) * BOWL.innerR,
      rimY: cy - BOWL.innerR,
      leftAngle,
      rightAngle
    };
  }

  function spawnRaceBall(ball, index, total) {
    const { cx, cy } = getBowlArcCenter();
    const rim = getBowlRimPoints(cx, cy);
    const ballR = 20;
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const rowCount = Math.min(cols, total - row * cols);
    const innerWidth = rim.rightX - rim.leftX - ballR * 2;
    const spreadX = rowCount <= 1 ? 0 : (col / (rowCount - 1) - 0.5) * innerWidth;
    const stackY = rim.rimY + ballR + 6 + row * (ballR * 1.75);
    return {
      ...normalizeBall(ball),
      sourceId: ball.id,
      x: cx + spreadX + (Math.random() - 0.5) * 4,
      y: stackY + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      radius: ballR,
      active: true
    };
  }

  function startBowlRace() {
    stopBowlRace();
    const total = state.balls.length;
    state.bowl = {
      active: true,
      balls: state.balls.map((b, i) => spawnRaceBall(b, i, total)),
      offsetX: 0,
      offsetY: 0,
      drag: null,
      frameId: null,
      finished: false
    };
    ui.bowlStatus.textContent = GameI18n.t("bowlReady");
    updateBowlMeta();
    state.bowl.frameId = requestAnimationFrame(bowlTick);
  }

  function stopBowlRace() {
    if (state.bowl.frameId) {
      cancelAnimationFrame(state.bowl.frameId);
      state.bowl.frameId = null;
    }
    state.bowl.active = false;
    state.bowl.drag = null;
  }

  function updateBowlMeta() {
    const active = state.bowl.balls.filter((b) => b.active).length;
    ui.bowlMeta.textContent = GameI18n.t("bowlRemaining", { n: active });
  }

  function onBowlPointerDown(event) {
    if (!state.bowl.active || state.bowl.finished) return;
    const pos = canvasPointerPos(event);
    if (!hitTestBowl(pos.x, pos.y)) return;

    event.preventDefault();
    state.bowl.drag = {
      pointerId: event.pointerId,
      lastX: pos.x,
      lastY: pos.y,
      lastT: performance.now(),
      vx: 0,
      vy: 0
    };
    ui.bowlCanvas.setPointerCapture(event.pointerId);
    ui.bowlCanvas.style.cursor = "grabbing";
  }

  function onBowlPointerMove(event) {
    if (!state.bowl.drag || event.pointerId !== state.bowl.drag.pointerId) {
      if (state.bowl.active && !state.bowl.finished) {
        const pos = canvasPointerPos(event);
        ui.bowlCanvas.style.cursor = hitTestBowl(pos.x, pos.y) ? "grab" : "default";
      }
      return;
    }

    const pos = canvasPointerPos(event);
    const drag = state.bowl.drag;
    const dx = pos.x - drag.lastX;
    const dy = pos.y - drag.lastY;
    const now = performance.now();
    const dt = Math.max(0.008, (now - drag.lastT) / 1000);

    drag.vx = dx / dt;
    drag.vy = dy / dt;
    drag.lastX = pos.x;
    drag.lastY = pos.y;
    drag.lastT = now;

    // Solo mueve el tazón. Las pelotitas siguen con física y reaccionan a las paredes.
    state.bowl.offsetX += dx;
    state.bowl.offsetY += dy;

    const impulseScale = 0.045;
    state.bowl.balls.forEach((ball) => {
      if (!ball.active) return;
      ball.vx += dx * impulseScale;
      ball.vy += dy * impulseScale;
    });
  }

  function onBowlPointerUp(event) {
    if (!state.bowl.drag) return;
    if (event && event.pointerId !== state.bowl.drag.pointerId) return;

    const drag = state.bowl.drag;
    state.bowl.balls.forEach((ball) => {
      if (ball.active) {
        ball.vx += drag.vx * 0.05;
        ball.vy += drag.vy * 0.05;
      }
    });

    state.bowl.drag = null;
    ui.bowlCanvas.style.cursor = "default";
    try {
      if (event) ui.bowlCanvas.releasePointerCapture(event.pointerId);
    } catch (_err) {
      /* ignore */
    }
  }

  function isBallInOpeningZone(ball, cx, cy) {
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const angle = Math.atan2(dy, dx);
    const openCenter = -Math.PI / 2;
    let diff = angle - openCenter;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return Math.abs(diff) < BOWL.openHalf;
  }

  function didBallExitFromTop(ball) {
    const { cx, cy } = getBowlArcCenter();
    const rim = getBowlRimPoints(cx, cy);
    const exitY = rim.rimY - 8;

    if (ball.y + ball.radius > exitY) {
      return false;
    }

    const lipPad = ball.radius * 0.45;
    if (ball.x < rim.leftX - lipPad || ball.x > rim.rightX + lipPad) {
      return false;
    }

    return isBallInOpeningZone(ball, cx, cy);
  }

  function resolveBowlWall(ball) {
    const { cx, cy } = getBowlArcCenter();
    const rim = getBowlRimPoints(cx, cy);
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.hypot(dx, dy);
    const maxInside = BOWL.innerR - ball.radius;
    const inOpening = isBallInOpeningZone(ball, cx, cy);
    const aboveRim = ball.y + ball.radius < rim.rimY;

    if (aboveRim && inOpening) {
      return;
    }

    const lipInset = ball.radius * 0.25;
    if (ball.y + ball.radius > rim.rimY - 4) {
      if (ball.x < rim.leftX + lipInset) {
        ball.x = rim.leftX + lipInset;
        ball.vx = Math.max(0, ball.vx) * 0.55 + 0.4;
      }
      if (ball.x > rim.rightX - lipInset) {
        ball.x = rim.rightX - lipInset;
        ball.vx = Math.min(0, ball.vx) * 0.55 - 0.4;
      }
    }

    if (dist > maxInside && dist > 0.001 && !inOpening) {
      const nx = dx / dist;
      const ny = dy / dist;
      ball.x = cx + nx * maxInside;
      ball.y = cy + ny * maxInside;
      const dot = ball.vx * nx + ball.vy * ny;
      if (dot > 0) {
        ball.vx -= dot * nx * 1.6;
        ball.vy -= dot * ny * 1.6;
      }
    }

    const floorY = cy + BOWL.innerR - ball.radius;
    if (ball.y > floorY) {
      ball.y = floorY;
      ball.vy *= -0.5;
      ball.vx *= 0.92;
    }
  }

  function stepBowlPhysics() {
    const dragging = !!state.bowl.drag;
    const bowlVx = dragging ? state.bowl.drag.vx * 0.00035 : 0;
    const bowlVy = dragging ? state.bowl.drag.vy * 0.00035 : 0;

    state.bowl.balls.forEach((ball) => {
      if (!ball.active) return;
      // Mientras arrastrás, las pelotas siguen cayendo/rebotando y reciben el movimiento del tazón.
      ball.vx += bowlVx;
      ball.vy += bowlVy + 0.28;
      ball.vx *= 0.986;
      ball.vy *= 0.986;
      ball.x += ball.vx;
      ball.y += ball.vy;
      resolveBowlWall(ball);

      state.bowl.balls.forEach((other) => {
        if (other === ball || !other.active) return;
        const dx = other.x - ball.x;
        const dy = other.y - ball.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ball.radius + other.radius;
        if (dist >= minDist || dist < 0.001) return;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        ball.x -= nx * overlap * 0.5;
        ball.y -= ny * overlap * 0.5;
        other.x += nx * overlap * 0.5;
        other.y += ny * overlap * 0.5;
      });

      if (didBallExitFromTop(ball)) {
        ball.active = false;
        ball.vx += (Math.random() - 0.5) * 2;
        ball.vy -= 4 + Math.random() * 2;
      }
    });
  }

  function checkBowlWinner() {
    const active = state.bowl.balls.filter((b) => b.active);
    updateBowlMeta();
    if (state.bowl.finished) return;
    if (active.length === 1) {
      state.bowl.finished = true;
      const winner = active[0];
      addBallWin(winner.sourceId);
      ui.bowlStatus.textContent = GameI18n.t("bowlWinner", { name: winner.name });
    } else if (active.length === 0) {
      state.bowl.finished = true;
      ui.bowlStatus.textContent = GameI18n.t("bowlNoWinner");
    }
  }

  function drawBallOnCanvas(ball) {
    const grad = bowlCtx.createRadialGradient(
      ball.x - ball.radius * 0.3,
      ball.y - ball.radius * 0.3,
      ball.radius * 0.1,
      ball.x,
      ball.y,
      ball.radius
    );
    grad.addColorStop(0, ball.color);
    grad.addColorStop(1, ball.monochrome ? ball.color2 : ball.color);
    bowlCtx.fillStyle = grad;
    bowlCtx.beginPath();
    bowlCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    bowlCtx.fill();
    if (ball.border) {
      bowlCtx.strokeStyle = ball.borderColor;
      bowlCtx.lineWidth = 3;
      bowlCtx.stroke();
    }
    if (ball.textEnabled) {
      bowlCtx.fillStyle = ball.textColor;
      bowlCtx.font = `bold ${Math.round(ball.radius * 0.75)}px Segoe UI, sans-serif`;
      bowlCtx.textAlign = "center";
      bowlCtx.textBaseline = "middle";
      bowlCtx.fillText(ballLabel(ball.name), ball.x, ball.y);
    }
  }

  function drawBowl() {
    const w = ui.bowlCanvas.width;
    const h = ui.bowlCanvas.height;
    const { cx, cy } = getBowlArcCenter();
    const rim = getBowlRimPoints(cx, cy);

    bowlCtx.clearRect(0, 0, w, h);
    const bg = bowlCtx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0d1f35");
    bg.addColorStop(1, "#081018");
    bowlCtx.fillStyle = bg;
    bowlCtx.fillRect(0, 0, w, h);

    bowlCtx.fillStyle = "#1a2a40";
    bowlCtx.fillRect(0, h - 40, w, 40);

    bowlCtx.save();

    const leftRimX = rim.leftX;
    const rightRimX = rim.rightX;

    bowlCtx.fillStyle = "rgba(18, 34, 58, 0.55)";
    bowlCtx.beginPath();
    bowlCtx.moveTo(leftRimX, rim.leftY);
    bowlCtx.arc(cx, cy, BOWL.innerR, rim.leftAngle, rim.rightAngle, true);
    bowlCtx.lineTo(rightRimX, rim.rightY);
    bowlCtx.closePath();
    bowlCtx.fill();
    bowlCtx.restore();

    state.bowl.balls.forEach((ball) => {
      if (ball.active || ball.y < h + 40) drawBallOnCanvas(ball);
    });

    bowlCtx.save();

    bowlCtx.strokeStyle = "#ffd166";
    bowlCtx.lineWidth = BOWL.wall;
    bowlCtx.lineCap = "round";
    bowlCtx.lineJoin = "round";
    bowlCtx.beginPath();
    bowlCtx.moveTo(leftRimX, rim.leftY);
    bowlCtx.arc(cx, cy, BOWL.innerR, rim.leftAngle, rim.rightAngle, true);
    bowlCtx.lineTo(rightRimX, rim.rightY);
    bowlCtx.stroke();
    bowlCtx.restore();
  }

  function bowlTick() {
    if (!state.bowl.active) return;
    stepBowlPhysics();
    checkBowlWinner();
    drawBowl();
    state.bowl.frameId = requestAnimationFrame(bowlTick);
  }

  function setupBackToAdminButton() {
    const btn = document.getElementById("btnBackToAdmin");
    if (!btn) return;
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    if (/\/Juegos\//i.test(path)) btn.hidden = false;
  }

  function bindMakeInputs() {
    [
      ui.inputName,
      ui.inputColor,
      ui.inputColor2,
      ui.inputBorderColor,
      ui.inputTextColor,
      ui.checkRainbow,
      ui.checkMonochrome,
      ui.checkBorder,
      ui.checkText
    ].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", () => {
        if (el === ui.checkRainbow && ui.checkRainbow.checked) ui.checkMonochrome.checked = false;
        if (el === ui.checkMonochrome && ui.checkMonochrome.checked) ui.checkRainbow.checked = false;
        readDraft();
      });
    });
  }

  function bindEvents() {
    setupBackToAdminButton();

    document.getElementById("btnGoPartidas").addEventListener("click", () => {
      if (window.GameMusic) window.GameMusic.start();
      if (state.currentPartidaId && getCurrentPartida()) {
        if (!state.activePartidaSessionId) loadBallsFromPartida();
        const partida = getCurrentPartida();
        ui.worldTitle.textContent = partida.name;
        showScreen("world");
        return;
      }
      renderPartidaList();
      showScreen("partidas");
    });

    document.getElementById("btnBackTitle").addEventListener("click", () => showScreen("title"));
    document.getElementById("formNewPartida").addEventListener("submit", (event) => {
      event.preventDefault();
      createPartida(ui.inputPartidaName.value);
    });

    document.getElementById("btnBackPartidas").addEventListener("click", () => {
      syncBallsToCurrentPartida();
      save();
      renderPartidaList();
      showScreen("partidas");
    });

    document.getElementById("btnCreateBall").addEventListener("click", openMake);
    document.getElementById("btnBowlRace").addEventListener("click", openBowlRaceScreen);
    document.getElementById("btnEarnings").addEventListener("click", openEarnings);
    document.getElementById("btnBackFromBowl").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnBackFromEarnings").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnBackWorld").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnCancelMake").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnSaveBall").addEventListener("click", saveBall);

    ui.bowlCanvas.addEventListener("pointerdown", onBowlPointerDown);
    ui.bowlCanvas.addEventListener("pointermove", onBowlPointerMove);
    ui.bowlCanvas.addEventListener("pointerup", onBowlPointerUp);
    ui.bowlCanvas.addEventListener("pointercancel", onBowlPointerUp);

    ui.worldArena.addEventListener("pointerdown", (event) => {
      if (state.drag) return;
      const world = clientToWorld(event.clientX, event.clientY);
      const ball = hitTestBall(world.x, world.y);
      if (ball) startDrag(event, ball.id);
    });
    ui.worldArena.addEventListener("pointermove", (event) => {
      if (state.drag) {
        onDragMove(event);
        return;
      }
      const world = clientToWorld(event.clientX, event.clientY);
      ui.worldArena.style.cursor = hitTestBall(world.x, world.y) ? "grab" : "default";
    });
    ui.worldArena.addEventListener("pointerup", endDrag);
    ui.worldArena.addEventListener("pointercancel", endDrag);
    window.addEventListener("resize", () => {
      if (ui.screenWorld.classList.contains("active")) renderWorld();
    });
  }

  load();
  bindMakeInputs();
  bindEvents();
  refreshI18n();
})();
