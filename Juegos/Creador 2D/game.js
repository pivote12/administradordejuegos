(function () {
  "use strict";

  const STORAGE_KEY = "2d-creator-world-v2";
  const SPAWN_KEY = "0,0";
  const TILE = 48;
  const PLAYER_RADIUS = 14;
  const PLAYER_SPEED = 180;
  const SKIN_COLOR = "#FFDBAC";
  const PINK_COLOR = "#FF69B4";
  const VOID_FALL_TIME = 0.55;

  function funcLabel(funcion) {
    const map = {
      none: "funcNone",
      createChar: "funcChar",
      teleport: "funcTeleport",
      smaller: "funcSmaller",
      pink: "funcPink",
    };
    return window.GameI18n ? GameI18n.t(map[funcion] || "funcNone") : funcion;
  }

  const ELEMENTS = [
    { sym: "H", color: "#e2e8f0", name: "Hidrógeno" },
    { sym: "O", color: "#ef4444", name: "Oxígeno" },
    { sym: "C", color: "#334155", name: "Carbono" },
    { sym: "N", color: "#3b82f6", name: "Nitrógeno" },
    { sym: "Na", color: "#a78bfa", name: "Sodio" },
    { sym: "Fe", color: "#f59e0b", name: "Hierro" },
  ];

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenGame: document.getElementById("screenGame"),
    hud: document.getElementById("hud"),
    canvas: document.getElementById("gameCanvas"),
    btnEditor: document.getElementById("btnEditor"),
    btnCloseEditor: document.getElementById("btnCloseEditor"),
    editorPanel: document.getElementById("editorPanel"),
    toolList: document.getElementById("toolList"),
    inputBlockName: document.getElementById("inputBlockName"),
    inputBlockColor: document.getElementById("inputBlockColor"),
    inputBlockFuncion: document.getElementById("inputBlockFuncion"),
    btnCreateBlock: document.getElementById("btnCreateBlock"),
    playerTag: document.getElementById("playerTag"),
    hudHint: document.getElementById("hudHint"),
    microOverlay: document.getElementById("microOverlay"),
    microStatus: document.getElementById("microStatus"),
  };

  const state = {
    editorOpen: false,
    selectedTool: null,
    customBlocks: [],
    blocks: new Map(),
    nextBlockId: 1,
    keys: new Set(),
    players: [],
    activePlayer: 0,
    hoverCell: null,
    camera: { x: 0, y: 0 },
    lastTriggerCell: null,
    fallTimer: 0,
    falling: false,
    canCreateBlocks: true,
    createCharUsed: false,
    mode: "main",
    rainbowPhase: 0,
    micro: null,
  };

  let ctx;
  let gameStarted = false;
  let lastTime = 0;
  let animId = null;

  function blockKey(x, y) {
    return `${x},${y}`;
  }

  function showScreen(name) {
    ui.screenTitle.classList.toggle("active", name === "title");
    ui.screenGame.classList.toggle("active", name === "game");
  }

  function makePlayer(x, y, label) {
    return { x, y, pink: false, label, fallOffset: 0 };
  }

  function getActivePlayer() {
    return state.players[state.activePlayer];
  }

  function defaultSpawnBlock() {
    return {
      x: 0,
      y: 0,
      color: "#ffffff",
      name: "Bloque del spawn",
      isSpawn: true,
      typeId: "spawn",
      funcion: "none",
    };
  }

  function setBlock(block) {
    state.blocks.set(blockKey(block.x, block.y), block);
  }

  function removeBlock(key) {
    if (key === SPAWN_KEY) return false;
    const block = state.blocks.get(key);
    if (!block || block.isSpawn) return false;
    state.blocks.delete(key);
    return true;
  }

  function hasCreateCharOnMap() {
    for (const block of state.blocks.values()) {
      if (block.funcion === "createChar") return true;
    }
    return false;
  }

  function saveWorld() {
    const payload = {
      customBlocks: state.customBlocks,
      nextBlockId: state.nextBlockId,
      canCreateBlocks: state.canCreateBlocks,
      createCharUsed: state.createCharUsed,
      players: state.players,
      activePlayer: state.activePlayer,
      blocks: Array.from(state.blocks.values()).filter((b) => !b.isSpawn),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function loadWorld() {
    state.blocks.clear();
    state.customBlocks = [];
    state.nextBlockId = 1;
    state.canCreateBlocks = true;
    state.createCharUsed = false;
    state.players = [makePlayer(TILE * 0.5, TILE * 0.5, "P1")];
    state.activePlayer = 0;
    setBlock(defaultSpawnBlock());

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.customBlocks = Array.isArray(data.customBlocks) ? data.customBlocks : [];
      state.nextBlockId = Number.isFinite(data.nextBlockId) ? data.nextBlockId : 1;
      state.canCreateBlocks = data.canCreateBlocks !== false;
      state.createCharUsed = Boolean(data.createCharUsed);
      if (Array.isArray(data.players) && data.players.length) {
        state.players = data.players.map((p, i) => ({
          x: p.x,
          y: p.y,
          pink: Boolean(p.pink),
          label: p.label || (i === 0 ? "P1" : "P2"),
          fallOffset: 0,
        }));
      }
      state.activePlayer = Number.isFinite(data.activePlayer) ? data.activePlayer : 0;
      (data.blocks || []).forEach((block) => {
        if (block.isSpawn) return;
        const key = blockKey(block.x, block.y);
        if (key === SPAWN_KEY) return;
        setBlock(block);
      });
    } catch {
      /* ignore */
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function funcionMeta(funcion) {
    return funcLabel(funcion);
  }

  function renderToolList() {
    ui.toolList.innerHTML = "";

    const goma = document.createElement("li");
    goma.innerHTML = `
      <button type="button" class="tool-item${state.selectedTool === "goma" ? " selected" : ""}" data-tool="goma">
        <span class="tool-swatch goma" aria-hidden="true"></span>
        <span>
          <span class="tool-name">${window.GameI18n ? GameI18n.t("eraser") : "Goma"}</span>
          <span class="tool-meta">${window.GameI18n ? GameI18n.t("eraserHint") : "Borra bloques (no el spawn)"}</span>
        </span>
      </button>`;
    ui.toolList.appendChild(goma);

    state.customBlocks.forEach((blockType) => {
      const item = document.createElement("li");
      const swatchClass = blockType.funcion === "none" ? "" : " fn";
      item.innerHTML = `
        <button type="button" class="tool-item${state.selectedTool === blockType.id ? " selected" : ""}" data-tool="${blockType.id}">
          <span class="tool-swatch${swatchClass}" style="background:${blockType.color}" aria-hidden="true"></span>
          <span>
            <span class="tool-name">${escapeHtml(blockType.name)}</span>
            <span class="tool-meta">${escapeHtml(funcionMeta(blockType.funcion))}</span>
          </span>
        </button>`;
      ui.toolList.appendChild(item);
    });

    ui.toolList.querySelectorAll("[data-tool]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedTool = button.dataset.tool;
        renderToolList();
      });
    });
  }

  function createCustomBlock() {
    if (!state.canCreateBlocks) {
      alert(window.GameI18n ? GameI18n.t("alertNoCreate") : "Ya no puedes crear nuevos bloques.");
      return;
    }

    const name = ui.inputBlockName.value.trim();
    const color = ui.inputBlockColor.value;
    const funcion = ui.inputBlockFuncion.value;

    if (!name) {
      alert(window.GameI18n ? GameI18n.t("alertBlockName") : "Escribe un nombre para el bloque.");
      return;
    }

    if (funcion === "createChar") {
      if (state.createCharUsed || hasCreateCharOnMap()) {
        alert(window.GameI18n ? GameI18n.t("alertCharOnce") : "La función «Crea un personaje» solo se puede colocar una vez en el mundo.");
        return;
      }
    }

    const blockType = {
      id: `custom-${state.nextBlockId++}`,
      name,
      color,
      funcion,
    };
    state.customBlocks.push(blockType);
    state.selectedTool = blockType.id;
    ui.inputBlockName.value = "";
    renderToolList();
    saveWorld();
  }

  function getSelectedBlockType() {
    if (!state.selectedTool || state.selectedTool === "goma") return null;
    return state.customBlocks.find((b) => b.id === state.selectedTool) || null;
  }

  function toggleEditor(forceOpen) {
    state.editorOpen = typeof forceOpen === "boolean" ? forceOpen : !state.editorOpen;
    ui.editorPanel.hidden = !state.editorOpen;
  }

  function hasNeighbor(x, y) {
    return (
      state.blocks.has(blockKey(x + 1, y)) ||
      state.blocks.has(blockKey(x - 1, y)) ||
      state.blocks.has(blockKey(x, y + 1)) ||
      state.blocks.has(blockKey(x, y - 1))
    );
  }

  function canPlaceAt(x, y) {
    if (state.blocks.has(blockKey(x, y))) return false;
    return hasNeighbor(x, y);
  }

  function placeBlockAt(x, y) {
    const blockType = getSelectedBlockType();
    if (!blockType || !canPlaceAt(x, y)) return;

    if (blockType.funcion === "createChar" && (state.createCharUsed || hasCreateCharOnMap())) {
      alert(window.GameI18n ? GameI18n.t("alertCharOnly") : "Solo puedes colocar un bloque con «Crea un personaje».");
      return;
    }

    setBlock({
      x,
      y,
      color: blockType.color,
      name: blockType.name,
      isSpawn: false,
      typeId: blockType.id,
      funcion: blockType.funcion,
    });
    saveWorld();
  }

  function eraseBlockAt(x, y) {
    if (removeBlock(blockKey(x, y))) saveWorld();
  }

  function screenToWorld(sx, sy) {
    const rect = ui.canvas.getBoundingClientRect();
    const cx = sx - rect.left;
    const cy = sy - rect.top;
    const wx = cx + state.camera.x - ui.canvas.width / 2;
    const wy = cy + state.camera.y - ui.canvas.height / 2;
    return { x: Math.floor(wx / TILE), y: Math.floor(wy / TILE) };
  }

  function handleCanvasClick(event) {
    if (state.mode !== "main" || !state.editorOpen || !state.selectedTool) return;
    const cell = screenToWorld(event.clientX, event.clientY);
    if (state.selectedTool === "goma") {
      eraseBlockAt(cell.x, cell.y);
    } else {
      placeBlockAt(cell.x, cell.y);
    }
  }

  function handleCanvasMove(event) {
    if (state.mode !== "main" || !state.editorOpen) {
      state.hoverCell = null;
      return;
    }
    state.hoverCell = screenToWorld(event.clientX, event.clientY);
  }

  function canWalkAt(px, py) {
    const gx = Math.floor(px / TILE);
    const gy = Math.floor(py / TILE);
    return state.blocks.has(blockKey(gx, gy));
  }

  function respawnAtSpawn(player) {
    player.x = TILE * 0.5;
    player.y = TILE * 0.5;
    player.fallOffset = 0;
  }

  function teleportRandom(player) {
    const cells = Array.from(state.blocks.values());
    if (!cells.length) return;
    const target = cells[Math.floor(Math.random() * cells.length)];
    player.x = target.x * TILE + TILE * 0.5;
    player.y = target.y * TILE + TILE * 0.5;
  }

  function triggerFunction(block, gx, gy) {
    const key = blockKey(gx, gy);
    const player = getActivePlayer();

    switch (block.funcion) {
      case "createChar":
        if (state.createCharUsed || state.players.length >= 2) return;
        state.createCharUsed = true;
        state.players.push(makePlayer(player.x, player.y, "P2"));
        removeBlock(key);
        saveWorld();
        break;
      case "teleport":
        teleportRandom(player);
        break;
      case "pink":
        player.pink = true;
        saveWorld();
        break;
      case "smaller":
        startMicroGame();
        break;
      default:
        break;
    }
  }

  function checkFunctionTriggers() {
    const player = getActivePlayer();
    const gx = Math.floor(player.x / TILE);
    const gy = Math.floor(player.y / TILE);
    const key = blockKey(gx, gy);
    if (key === state.lastTriggerCell) return;
    state.lastTriggerCell = key;
    const block = state.blocks.get(key);
    if (!block || block.isSpawn || block.funcion === "none") return;
    triggerFunction(block, gx, gy);
  }

  function updateVoid(dt) {
    const player = getActivePlayer();
    if (canWalkAt(player.x, player.y)) {
      state.fallTimer = 0;
      state.falling = false;
      player.fallOffset = 0;
      return;
    }

    state.falling = true;
    state.fallTimer += dt;
    player.fallOffset = Math.min(40, state.fallTimer * 80);

    if (state.fallTimer >= VOID_FALL_TIME) {
      respawnAtSpawn(player);
      state.fallTimer = 0;
      state.falling = false;
      state.lastTriggerCell = null;
    }
  }

  function updatePlayer(dt) {
    if (state.falling) return;

    const player = getActivePlayer();
    let dx = 0;
    let dy = 0;
    if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) dy -= 1;
    if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) dy += 1;
    if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) dx -= 1;
    if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) dx += 1;

    if (dx === 0 && dy === 0) return;

    const len = Math.hypot(dx, dy) || 1;
    dx = (dx / len) * PLAYER_SPEED * dt;
    dy = (dy / len) * PLAYER_SPEED * dt;

    const nextX = player.x + dx;
    if (canWalkAt(nextX, player.y)) player.x = nextX;

    const nextY = player.y + dy;
    if (canWalkAt(player.x, nextY)) player.y = nextY;

    checkFunctionTriggers();
  }

  function switchPlayer() {
    if (state.players.length < 2) return;
    state.activePlayer = state.activePlayer === 0 ? 1 : 0;
    state.lastTriggerCell = null;
    updatePlayerTag();
  }

  function updatePlayerTag() {
    const p = getActivePlayer();
    ui.playerTag.textContent = p ? p.label : "P1";
    ui.playerTag.hidden = state.players.length < 2;
  }

  function loseRandomBlock() {
    if (state.customBlocks.length > 0) {
      const idx = Math.floor(Math.random() * state.customBlocks.length);
      const removed = state.customBlocks.splice(idx, 1)[0];
      for (const [key, block] of state.blocks.entries()) {
        if (block.typeId === removed.id) state.blocks.delete(key);
      }
      alert(window.GameI18n ? GameI18n.t("alertLostBlock", { name: removed.name }) : `Perdiste el bloque «${removed.name}».`);
    } else {
      state.canCreateBlocks = false;
      alert(window.GameI18n ? GameI18n.t("alertNoBlocksLeft") : "No te quedan bloques creados. Perdiste la habilidad de crear nuevos bloques.");
    }
    saveWorld();
    renderToolList();
  }

  function startMicroGame() {
    const player = getActivePlayer();
    const items = ELEMENTS.map((el, i) => ({
      ...el,
      x: 80 + (i % 3) * 90 + Math.random() * 30,
      y: 80 + Math.floor(i / 3) * 90 + Math.random() * 30,
      collected: false,
    }));

    state.mode = "micro";
    state.micro = {
      player: { x: ui.canvas.width / 2, y: ui.canvas.height / 2, r: 7 },
      items,
      microbes: Array.from({ length: 5 }, () => ({
        x: Math.random() * ui.canvas.width,
        y: Math.random() * ui.canvas.height,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        r: 10,
      })),
      returnPos: { x: player.x, y: player.y },
    };
    ui.microOverlay.hidden = false;
    ui.editorPanel.hidden = true;
    state.editorOpen = false;
    updateMicroStatus();
  }

  function endMicroGame(won) {
    const player = getActivePlayer();
    if (state.micro?.returnPos) {
      player.x = state.micro.returnPos.x;
      player.y = state.micro.returnPos.y;
    }
    if (!won) loseRandomBlock();
    state.mode = "main";
    state.micro = null;
    ui.microOverlay.hidden = true;
    state.lastTriggerCell = null;
    saveWorld();
  }

  function updateMicroStatus() {
    if (!state.micro) return;
    const left = state.micro.items.filter((i) => !i.collected).length;
    if (left === 0) {
      ui.microStatus.textContent = "¡Todos recolectados! Pulsa Espacio para mezclar.";
    } else {
      ui.microStatus.textContent = `Faltan ${left} elementos. Recógelos y pulsa Espacio para mezclar.`;
    }
  }

  function updateMicro(dt) {
    const m = state.micro;
    if (!m) return;

    let dx = 0;
    let dy = 0;
    if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) dy -= 1;
    if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) dy += 1;
    if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) dx -= 1;
    if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) dx += 1;

    const len = Math.hypot(dx, dy) || 1;
    m.player.x += (dx / len) * 140 * dt;
    m.player.y += (dy / len) * 140 * dt;
    m.player.x = Math.max(m.player.r, Math.min(ui.canvas.width - m.player.r, m.player.x));
    m.player.y = Math.max(m.player.r, Math.min(ui.canvas.height - m.player.r, m.player.y));

    m.items.forEach((item) => {
      if (item.collected) return;
      const dist = Math.hypot(m.player.x - item.x, m.player.y - item.y);
      if (dist < m.player.r + 14) {
        item.collected = true;
        updateMicroStatus();
      }
    });

    m.microbes.forEach((bug) => {
      bug.x += bug.vx * dt;
      bug.y += bug.vy * dt;
      if (bug.x < bug.r || bug.x > ui.canvas.width - bug.r) bug.vx *= -1;
      if (bug.y < bug.r || bug.y > ui.canvas.height - bug.r) bug.vy *= -1;
      const dist = Math.hypot(m.player.x - bug.x, m.player.y - bug.y);
      if (dist < m.player.r + bug.r) {
        endMicroGame(false);
      }
    });

    if (state.keys.has("Space") && m.items.every((i) => i.collected)) {
      endMicroGame(true);
    }
  }

  function resizeCanvas() {
    ui.canvas.width = window.innerWidth;
    ui.canvas.height = window.innerHeight;
  }

  function drawRainbowBlock(px, py, time) {
    const stripes = 6;
    const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
    const stripeH = TILE / stripes;
    for (let i = 0; i < stripes; i++) {
      const offset = Math.floor(time * 2 + i) % colors.length;
      ctx.fillStyle = colors[offset];
      ctx.fillRect(px, py + i * stripeH, TILE, stripeH + 1);
    }
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 9px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPAWN", px + TILE / 2, py + TILE / 2 + 3);
  }

  function drawBlock(block, time) {
    const px = block.x * TILE - state.camera.x + ui.canvas.width / 2;
    const py = block.y * TILE - state.camera.y + ui.canvas.height / 2;

    if (block.isSpawn) {
      drawRainbowBlock(px, py, time);
      return;
    }

    ctx.fillStyle = block.color;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);

    if (block.funcion && block.funcion !== "none") {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      const label = block.funcion === "createChar" ? "👤" :
        block.funcion === "teleport" ? "✨" :
        block.funcion === "smaller" ? "🔬" :
        block.funcion === "pink" ? "🌸" : "•";
      ctx.fillText(label, px + TILE / 2, py + TILE / 2 + 3);
    }
  }

  function drawFace(px, py, radius, pink) {
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = pink ? PINK_COLOR : SKIN_COLOR;
    ctx.fill();
    ctx.strokeStyle = pink ? "#be185d" : "#c49a6c";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(px - radius * 0.32, py - radius * 0.15, radius * 0.12, 0, Math.PI * 2);
    ctx.arc(px + radius * 0.32, py - radius * 0.15, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py + radius * 0.18, radius * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  function drawPlayerEntity(player, isActive) {
    const px = player.x - state.camera.x + ui.canvas.width / 2;
    const py = player.y - state.camera.y + ui.canvas.height / 2 + player.fallOffset;
    const alpha = state.falling && player === getActivePlayer() ? 1 - state.fallTimer / VOID_FALL_TIME : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (!isActive) ctx.globalAlpha *= 0.55;

    drawFace(px, py, PLAYER_RADIUS, player.pink);

    if (isActive) {
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.font = "bold 10px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(player.label, px, py - PLAYER_RADIUS - 8);
    }

    ctx.restore();
  }

  function drawPreview() {
    if (!state.editorOpen || !state.hoverCell) return;
    const { x, y } = state.hoverCell;
    const px = x * TILE - state.camera.x + ui.canvas.width / 2;
    const py = y * TILE - state.camera.y + ui.canvas.height / 2;

    if (state.selectedTool === "goma") {
      const block = state.blocks.get(blockKey(x, y));
      if (!block || block.isSpawn) return;
      ctx.fillStyle = "rgba(251, 113, 133, 0.45)";
    } else {
      const blockType = getSelectedBlockType();
      if (!blockType || !canPlaceAt(x, y)) return;
      ctx.fillStyle = blockType.color + "88";
    }

    ctx.fillRect(px, py, TILE, TILE);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
  }

  function renderMain(time) {
    ctx.fillStyle = "#0c4a6e";
    ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const startGX = Math.floor((state.camera.x - ui.canvas.width / 2) / TILE) - 1;
    const startGY = Math.floor((state.camera.y - ui.canvas.height / 2) / TILE) - 1;
    const endGX = startGX + Math.ceil(ui.canvas.width / TILE) + 3;
    const endGY = startGY + Math.ceil(ui.canvas.height / TILE) + 3;

    for (let gx = startGX; gx <= endGX; gx++) {
      for (let gy = startGY; gy <= endGY; gy++) {
        const px = gx * TILE - state.camera.x + ui.canvas.width / 2;
        const py = gy * TILE - state.camera.y + ui.canvas.height / 2;
        if (!state.blocks.has(blockKey(gx, gy))) {
          ctx.fillStyle = "rgba(2,6,23,0.35)";
          ctx.fillRect(px, py, TILE, TILE);
        }
        ctx.strokeRect(px, py, TILE, TILE);
      }
    }

    state.blocks.forEach((block) => drawBlock(block, time));

    state.players.forEach((player, i) => {
      drawPlayerEntity(player, i === state.activePlayer);
    });

    drawPreview();
  }

  function renderMicro() {
    const m = state.micro;
    if (!m) return;

    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);

    m.items.forEach((item) => {
      if (item.collected) return;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.sym, item.x, item.y + 4);
    });

    m.microbes.forEach((bug) => {
      ctx.beginPath();
      ctx.arc(bug.x, bug.y, bug.r, 0, Math.PI * 2);
      ctx.fillStyle = "#22d3ee";
      ctx.fill();
      ctx.strokeStyle = "#0e7490";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(bug.x - 3, bug.y - 2, 2, 0, Math.PI * 2);
      ctx.arc(bug.x + 3, bug.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    drawFace(m.player.x, m.player.y, m.player.r, false);
  }

  function render(time) {
    if (state.mode === "micro") {
      renderMicro();
    } else {
      renderMain(time);
    }
  }

  function gameLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    state.rainbowPhase = time * 0.001;

    if (state.mode === "micro") {
      updateMicro(dt);
    } else {
      const active = getActivePlayer();
      state.camera.x = active.x;
      state.camera.y = active.y;
      updateVoid(dt);
      updatePlayer(dt);
    }

    render(time);
    animId = requestAnimationFrame(gameLoop);
  }

  function bindEvents() {
    if (bindEvents.done) return;
    bindEvents.done = true;

    ui.btnEditor.addEventListener("click", () => toggleEditor());
    ui.btnCloseEditor.addEventListener("click", () => toggleEditor(false));
    ui.btnCreateBlock.addEventListener("click", createCustomBlock);

    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyZ" && state.mode === "main") {
        switchPlayer();
        return;
      }
      if (e.code === "Space" && state.mode === "micro") {
        e.preventDefault();
      }
      state.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => state.keys.delete(e.code));
    window.addEventListener("resize", resizeCanvas);

    ui.canvas.addEventListener("click", handleCanvasClick);
    ui.canvas.addEventListener("mousemove", handleCanvasMove);
    ui.canvas.addEventListener("mouseleave", () => { state.hoverCell = null; });
  }

  function startGame() {
    if (gameStarted) return;
    gameStarted = true;

    showScreen("game");
    ui.hud.hidden = false;

    ctx = ui.canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear el canvas 2D.");

    resizeCanvas();
    loadWorld();
    updatePlayerTag();
    renderToolList();
    bindEvents();
    lastTime = performance.now();
    animId = requestAnimationFrame(gameLoop);
  }

  window.startGame = startGame;
})();
