(function () {
  "use strict";

  const STORAGE_KEY = "object-battle-v1";
  const HUB_W = 800;
  const HUB_H = 480;
  const OBJ_SIZE = 36;
  const HUB_SPEED = 170;
  const HUB_JUMP = 340;
  const HUB_GRAVITY = 950;
  const SKY_Y = -OBJ_SIZE * 2;
  const FLOOR_Y = HUB_H - 56;

  const { MOUTHS, SHAPE_LIST, drawObject } = window.ObjectBattleShapes;

  GameI18n.init("object-battle");

  function refreshI18nUi() {
    GameI18n.applyDom();
    renderPartidaList();
    updateWorldMeta();
    if (state.draft) ui.makePreviewName.textContent = state.draft.name || GameI18n.t("unnamed");
  }

  function defaultDraft() {
    return {
      name: "",
      shapeId: SHAPE_LIST[0]?.id || "cup",
      color: "#4cc9f0",
      mouth: "smile",
    };
  }

  const state = {
    partidas: [],
    currentPartidaId: null,
    activePartidaSessionId: null,
    objects: [],
    controlOrder: [],
    activeControl: 0,
    draft: defaultDraft(),
    keys: new Set(),
    hubLoopId: null,
    hubLast: 0,
    battle: null,
  };

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenPartidas: document.getElementById("screenPartidas"),
    screenWorld: document.getElementById("screenWorld"),
    screenMake: document.getElementById("screenMake"),
    screenBattle: document.getElementById("screenBattle"),
    screenBFDIs: document.getElementById("screenBFDIs"),
    screenHistory: document.getElementById("screenHistory"),
    hubCanvas: document.getElementById("hubCanvas"),
    partidaList: document.getElementById("partidaList"),
    partidaEmpty: document.getElementById("partidaEmpty"),
    inputPartidaName: document.getElementById("inputPartidaName"),
    worldTitle: document.getElementById("worldTitle"),
    worldMeta: document.getElementById("worldMeta"),
    makePreviewCanvas: document.getElementById("makePreviewCanvas"),
    makePreviewName: document.getElementById("makePreviewName"),
    inputName: document.getElementById("inputName"),
    selectShape: document.getElementById("selectShape"),
    inputColor: document.getElementById("inputColor"),
    selectMouth: document.getElementById("selectMouth"),
  };

  let hubCtx;
  let previewCtx;

  function escapeHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function normalizeObject(data) {
    return {
      id: data.id || `o-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: String(data.name || "Object").slice(0, 24),
      shapeId: data.shapeId || SHAPE_LIST[0]?.id || "cup",
      color: data.color || "#4cc9f0",
      mouth: data.mouth || "smile",
    };
  }

  function hydrateObject(obj, fromSky) {
    const n = normalizeObject(obj);
    return {
      ...n,
      x: obj.x ?? HUB_W * 0.3 + Math.random() * HUB_W * 0.4,
      y: fromSky ? SKY_Y - Math.random() * 80 : (obj.y ?? FLOOR_Y - OBJ_SIZE),
      vy: fromSky ? 0 : (obj.vy ?? 0),
      onGround: false,
    };
  }

  function serializeObject(obj) {
    return {
      id: obj.id,
      name: obj.name,
      shapeId: obj.shapeId,
      color: obj.color,
      mouth: obj.mouth,
      x: obj.x,
      y: obj.y,
    };
  }

  function getCurrentPartida() {
    return state.partidas.find((p) => p.id === state.currentPartidaId) || null;
  }

  function normalizePartida(p) {
    return {
      id: p.id || `p-${Date.now()}`,
      name: String(p.name || "Game").slice(0, 32),
      createdAt: p.createdAt || Date.now(),
      objects: Array.isArray(p.objects) ? p.objects.map(serializeObject) : [],
      controlOrder: Array.isArray(p.controlOrder) ? [...p.controlOrder] : [],
      bfdiWins: p.bfdiWins && typeof p.bfdiWins === "object" ? { ...p.bfdiWins } : {},
      battleHistory: Array.isArray(p.battleHistory) ? p.battleHistory.map((h) => ({ ...h })) : [],
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.partidas = (data.partidas || []).map(normalizePartida);
      state.currentPartidaId = data.currentPartidaId || null;
      if (state.currentPartidaId && getCurrentPartida()) loadObjectsFromPartida();
    } catch {
      state.partidas = [];
    }
  }

  function syncObjectsToPartida() {
    const p = getCurrentPartida();
    if (!p || state.activePartidaSessionId !== state.currentPartidaId) return;
    p.objects = state.objects.map(serializeObject);
    p.controlOrder = [...state.controlOrder];
  }

  function save() {
    syncObjectsToPartida();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        partidas: state.partidas.map(normalizePartida),
        currentPartidaId: state.currentPartidaId,
      })
    );
  }

  function loadObjectsFromPartida() {
    const p = getCurrentPartida();
    if (!p) {
      state.objects = [];
      state.controlOrder = [];
      return;
    }
    state.objects = p.objects.map((o) => hydrateObject(o, false));
    state.controlOrder = p.controlOrder.length
      ? p.controlOrder.filter((id) => state.objects.some((o) => o.id === id))
      : state.objects.map((o) => o.id);
    state.objects.forEach((o) => {
      if (!state.controlOrder.includes(o.id)) state.controlOrder.push(o.id);
    });
    state.activePartidaSessionId = state.currentPartidaId;
    state.activeControl = 0;
  }

  function getActiveObject() {
    const id = state.controlOrder[state.activeControl];
    return state.objects.find((o) => o.id === id) || state.objects[0];
  }

  function switchCharacter() {
    if (state.controlOrder.length < 2) return;
    state.activeControl = (state.activeControl + 1) % state.controlOrder.length;
    updateWorldMeta();
  }

  function updateWorldMeta() {
    const obj = getActiveObject();
    const label = obj ? `P${state.controlOrder.indexOf(obj.id) + 1}` : "—";
    ui.worldMeta.textContent = GameI18n.t("objectsMeta", { n: state.objects.length });
  }

  function showScreen(name) {
    const map = {
      title: ui.screenTitle,
      partidas: ui.screenPartidas,
      world: ui.screenWorld,
      make: ui.screenMake,
      battle: ui.screenBattle,
      bfdis: ui.screenBFDIs,
      history: ui.screenHistory,
    };
    Object.entries(map).forEach(([k, el]) => el?.classList.toggle("active", k === name));
    if (name === "world") startHubLoop();
    else stopHubLoop();
    if (name === "bfdis") renderBFDIs();
    if (name === "history") renderHistory();
  }

  function renderPartidaList() {
    ui.partidaList.innerHTML = "";
    const sorted = [...state.partidas].sort((a, b) => b.createdAt - a.createdAt);
    ui.partidaEmpty.hidden = sorted.length > 0;
    sorted.forEach((p) => {
      const li = document.createElement("li");
      li.className = "list-item";
      const main = document.createElement("div");
      main.className = "list-item-main";
      main.innerHTML = `<strong>${escapeHtml(p.name)}</strong><span>${GameI18n.t("partidaObjects", { n: p.objects.length })}</span>`;
      main.addEventListener("click", () => openPartida(p.id));
      const actions = document.createElement("div");
      actions.className = "list-item-actions";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn-delete-partida";
      del.textContent = "🗑";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${p.name}"?`)) {
          state.partidas = state.partidas.filter((x) => x.id !== p.id);
          if (state.currentPartidaId === p.id) state.currentPartidaId = null;
          save();
          renderPartidaList();
        }
      });
      actions.appendChild(del);
      li.appendChild(main);
      li.appendChild(actions);
      ui.partidaList.appendChild(li);
    });
  }

  function createPartida(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return;
    const p = normalizePartida({ id: `p-${Date.now()}`, name: trimmed, createdAt: Date.now(), objects: [] });
    state.partidas.push(p);
    ui.inputPartidaName.value = "";
    save();
    openPartida(p.id);
  }

  function openPartida(id) {
    state.currentPartidaId = id;
    loadObjectsFromPartida();
    ui.worldTitle.textContent = getCurrentPartida().name;
    updateWorldMeta();
    save();
    showScreen("world");
  }

  function populateShapeSelect() {
    ui.selectShape.innerHTML = "";
    const objects = SHAPE_LIST.filter((s) => s.kind !== "number");
    const numbers = SHAPE_LIST.filter((s) => s.kind === "number");
    const addGroup = (label, items) => {
      const og = document.createElement("optgroup");
      og.label = label;
      items.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.label;
        og.appendChild(opt);
      });
      ui.selectShape.appendChild(og);
    };
    addGroup("Objects", objects);
    addGroup("Numbers", numbers);
  }

  function populateMouthSelect() {
    ui.selectMouth.innerHTML = "";
    MOUTHS.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.label;
      ui.selectMouth.appendChild(opt);
    });
  }

  function readDraft() {
    state.draft = {
      name: ui.inputName.value.trim(),
      shapeId: ui.selectShape.value,
      color: ui.inputColor.value,
      mouth: ui.selectMouth.value,
    };
    renderMakePreview();
  }

  function syncDraftToControls() {
    const d = state.draft;
    ui.inputName.value = d.name;
    ui.selectShape.value = d.shapeId;
    ui.inputColor.value = d.color;
    ui.selectMouth.value = d.mouth;
    renderMakePreview();
  }

  function renderMakePreview() {
    if (!previewCtx) return;
    const d = state.draft;
    ui.makePreviewName.textContent = d.name || GameI18n.t("unnamed");
    previewCtx.clearRect(0, 0, 140, 140);
    previewCtx.fillStyle = "#1e293b";
    previewCtx.fillRect(0, 0, 140, 140);
    drawObject(previewCtx, { shapeId: d.shapeId, color: d.color, mouth: d.mouth, name: d.name }, 70, 72, 90);
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

  function saveObject() {
    readDraft();
    if (!state.draft.name) {
      alert(GameI18n.t("alertEnterName"));
      return;
    }
    const obj = hydrateObject(normalizeObject(state.draft), true);
    state.objects.push(obj);
    state.controlOrder.push(obj.id);
    state.activeControl = state.controlOrder.length - 1;
    save();
    updateWorldMeta();
    showScreen("world");
  }

  function updateHub(dt) {
    const active = getActiveObject();
    if (!active) return;

    let dx = 0;
    if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) dx -= 1;
    if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) dx += 1;

    const onFloor = active.y + OBJ_SIZE / 2 >= FLOOR_Y - 2;

    if (onFloor && !state.keys.has("Space")) {
      if (dx) active.x += (dx / Math.abs(dx)) * HUB_SPEED * dt;
      active.vy = 0;
      active.onGround = true;
      active.y = FLOOR_Y - OBJ_SIZE / 2;
    } else {
      active.onGround = false;
      if (dx && (!state.keys.has("Space") || active.vy < 0)) {
        active.x += (dx / Math.abs(dx)) * HUB_SPEED * 0.65 * dt;
      }
      active.vy += HUB_GRAVITY * dt;
      active.y += active.vy * dt;
    }

    if (state.keys.has("Space") && active.onGround) {
      active.vy = -HUB_JUMP;
      active.onGround = false;
    }

    active.x = Math.max(OBJ_SIZE, Math.min(HUB_W - OBJ_SIZE, active.x));
    if (active.y > HUB_H + 80) {
      active.y = SKY_Y;
      active.vy = 0;
    }
  }

  function renderHub() {
    if (!hubCtx) return;
    const grad = hubCtx.createLinearGradient(0, 0, 0, HUB_H);
    grad.addColorStop(0, "#7dd3fc");
    grad.addColorStop(0.55, "#38bdf8");
    grad.addColorStop(1, "#0c4a6e");
    hubCtx.fillStyle = grad;
    hubCtx.fillRect(0, 0, HUB_W, HUB_H);

    hubCtx.fillStyle = "#365314";
    hubCtx.fillRect(0, FLOOR_Y, HUB_W, HUB_H - FLOOR_Y);
    hubCtx.fillStyle = "#4d7c0f";
    hubCtx.fillRect(0, FLOOR_Y, HUB_W, 10);

    const active = getActiveObject();
    state.objects.forEach((obj) => {
      hubCtx.save();
      hubCtx.globalAlpha = obj === active ? 1 : 0.55;
      drawObject(hubCtx, obj, obj.x, obj.y, OBJ_SIZE * 2);
      hubCtx.restore();
    });
  }

  function hubLoop(time) {
    const dt = Math.min((time - state.hubLast) / 1000, 0.05);
    state.hubLast = time;
    updateHub(dt);
    renderHub();
    state.hubLoopId = requestAnimationFrame(hubLoop);
  }

  function startHubLoop() {
    if (!ui.hubCanvas) return;
    hubCtx = ui.hubCanvas.getContext("2d");
    ui.hubCanvas.width = HUB_W;
    ui.hubCanvas.height = HUB_H;
    state.hubLast = performance.now();
    stopHubLoop();
    state.hubLoopId = requestAnimationFrame(hubLoop);
  }

  function stopHubLoop() {
    if (state.hubLoopId) cancelAnimationFrame(state.hubLoopId);
    state.hubLoopId = null;
  }

  function getAliveContestants() {
    if (!state.battle) return [];
    return state.battle.aliveIds
      .map((id) => state.objects.find((o) => o.id === id))
      .filter(Boolean);
  }

  function startBattle() {
    if (state.objects.length < 2) {
      alert(GameI18n.t("alertNeed2"));
      return;
    }
    state.battle = {
      aliveIds: state.objects.map((o) => o.id),
      elimOrder: [],
      phase: "challenge",
      lastChallenge: null,
      ufeIds: [],
    };
    showScreen("battle");
    runNextChallenge();
  }

  function runNextChallenge() {
    const b = state.battle;
    const alive = getAliveContestants();
    if (alive.length <= 1) {
      finishBattle(alive[0]?.id);
      return;
    }
    if (alive.length <= 3) {
      b.phase = "final";
      b.ufeIds = alive.map((c) => c.id);
      showFinalVote();
      return;
    }
    b.phase = "challenge";
    const { challenge, results } = window.BFDIBattle.runChallengeScores(alive);
    b.lastChallenge = { challenge, results };
    b.ufeIds = window.BFDIBattle.getBottomThree(results, alive.length);
    document.getElementById("battlePhaseHint").textContent = GameI18n.t("contestantsRemain", { n: alive.length });
    document.getElementById("battleChallengeTitle").textContent = challenge.name;
    document.getElementById("battleChallengeDesc").textContent = challenge.desc;
    const resEl = document.getElementById("battleResults");
    resEl.innerHTML = results
      .map(
        (r, i) =>
          `<li class="battle-row${b.ufeIds.includes(r.id) ? " danger" : ""}"><span>#${i + 1} ${escapeHtml(r.name)}</span><span>${r.score} pts</span></li>`
      )
      .join("");
    document.getElementById("battleVoteBlock").hidden = true;
    document.getElementById("battleFinalBlock").hidden = true;
    document.getElementById("btnNextChallenge").hidden = true;
    document.getElementById("btnSubmitVotes").hidden = false;
    showVoteUI("battleVoteList", b.ufeIds, "btnSubmitVotes");
    document.getElementById("battleVoteBlock").hidden = false;
  }

  function showVoteUI(listId, ids, btnId) {
    const list = document.getElementById(listId);
    list.innerHTML = "";
    ids.forEach((id) => {
      const obj = state.objects.find((o) => o.id === id);
      if (!obj) return;
      const li = document.createElement("li");
      li.className = "vote-row";
      li.innerHTML = `<span>${escapeHtml(obj.name)}</span><input type="number" min="0" value="0" data-vote-id="${id}" />`;
      list.appendChild(li);
    });
    document.getElementById(btnId).hidden = false;
  }

  function readVotes(listId) {
    const votes = {};
    document.querySelectorAll(`#${listId} input[data-vote-id]`).forEach((inp) => {
      votes[inp.dataset.voteId] = Math.max(0, Number(inp.value) || 0);
    });
    return votes;
  }

  function eliminateByVotes(votes) {
    let max = -1;
    let target = null;
    Object.entries(votes).forEach(([id, v]) => {
      if (v > max) {
        max = v;
        target = id;
      }
    });
    if (!target && Object.keys(votes).length) target = Object.keys(votes)[0];
    return target;
  }

  function submitEliminationVote() {
    const b = state.battle;
    const votes = readVotes("battleVoteList");
    const outId = eliminateByVotes(votes);
    if (!outId) return;
    b.aliveIds = b.aliveIds.filter((id) => id !== outId);
    const obj = state.objects.find((o) => o.id === outId);
    b.elimOrder.push({ id: outId, name: obj?.name || "?", votes: votes[outId] || 0 });
    document.getElementById("battleVoteBlock").hidden = true;
    if (b.aliveIds.length <= 3) {
      b.phase = "final";
      b.ufeIds = [...b.aliveIds];
      showFinalVote();
    } else {
      document.getElementById("btnNextChallenge").hidden = false;
    }
  }

  function showFinalVote() {
    const b = state.battle;
    const alive = getAliveContestants();
    document.getElementById("battlePhaseHint").textContent = GameI18n.t("final3");
    document.getElementById("battleChallengeTitle").textContent = GameI18n.t("finalVote");
    document.getElementById("battleChallengeDesc").textContent = GameI18n.t("finalVoteDesc");
    document.getElementById("battleResults").innerHTML = alive
      .map((c) => `<li class="battle-row"><span>${escapeHtml(c.name)}</span><span>Finalist</span></li>`)
      .join("");
    document.getElementById("battleVoteBlock").hidden = true;
    document.getElementById("battleFinalBlock").hidden = false;
    document.getElementById("btnNextChallenge").hidden = true;
    showVoteUI("battleFinalList", b.aliveIds, "btnPickWinner");
  }

  function pickWinner() {
    const b = state.battle;
    const votes = readVotes("battleFinalList");
    const winId = eliminateByVotes(votes);
    finishBattle(winId);
  }

  function finishBattle(winnerId) {
    const b = state.battle;
    const p = getCurrentPartida();
    if (!p || !b) return;
    const winner = state.objects.find((o) => o.id === winnerId);
    const order = [...b.elimOrder.map((e) => e.name)];
    if (winner) order.push(winner.name);
    if (winner) {
      if (!p.bfdiWins) p.bfdiWins = {};
      p.bfdiWins[winner.id] = (Number(p.bfdiWins[winner.id]) || 0) + 1;
    }
    if (!p.battleHistory) p.battleHistory = [];
    p.battleHistory.unshift({
      id: `b-${Date.now()}`,
      date: Date.now(),
      order,
      winner: winner?.name || "—",
    });
    state.battle = null;
    save();
    alert(winner ? GameI18n.t("bfdiWin", { name: winner.name }) : GameI18n.t("battleEnded"));
    showScreen("world");
  }

  function renderBFDIs() {
    const p = getCurrentPartida();
    const list = document.getElementById("bfdiList");
    const empty = document.getElementById("bfdiEmpty");
    list.innerHTML = "";
    const wins = p?.bfdiWins || {};
    const entries = state.objects.filter((o) => (wins[o.id] || 0) > 0);
    empty.hidden = entries.length > 0;
    entries.forEach((o) => {
      const li = document.createElement("li");
      li.className = "win-item";
      li.innerHTML = `<strong>${escapeHtml(o.name)}</strong><span>${wins[o.id]} BFDI${wins[o.id] === 1 ? "" : "s"}</span>`;
      list.appendChild(li);
    });
  }

  function renderHistory() {
    const p = getCurrentPartida();
    const list = document.getElementById("historyList");
    const empty = document.getElementById("historyEmpty");
    list.innerHTML = "";
    const hist = p?.battleHistory || [];
    empty.hidden = hist.length > 0;
    hist.forEach((h) => {
      const li = document.createElement("li");
      li.className = "history-item";
      const date = new Date(h.date).toLocaleString();
      li.innerHTML = `<strong>${GameI18n.t("historyWon", { winner: escapeHtml(h.winner) })}</strong><span>${date}</span><ol>${h.order.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ol>`;
      list.appendChild(li);
    });
  }

  function setupAdminLink() {
    const btn = document.getElementById("btnBackToAdmin");
    if (btn && /\/Juegos\//i.test(decodeURIComponent(location.pathname))) btn.hidden = false;
  }

  function bindEvents() {
    document.getElementById("btnGoPartidas").addEventListener("click", () => {
      if (window.GameMusic) window.GameMusic.start();
      showScreen("partidas");
    });
    document.getElementById("btnBackTitle").addEventListener("click", () => showScreen("title"));
    document.getElementById("formNewPartida").addEventListener("submit", (e) => {
      e.preventDefault();
      createPartida(ui.inputPartidaName.value);
    });
    document.getElementById("btnBackPartidas").addEventListener("click", () => {
      syncObjectsToPartida();
      save();
      renderPartidaList();
      showScreen("partidas");
    });
    document.getElementById("btnCreateObject").addEventListener("click", openMake);
    document.getElementById("btnBattleBFDI").addEventListener("click", startBattle);
    document.getElementById("btnBFDIs").addEventListener("click", () => showScreen("bfdis"));
    document.getElementById("btnHistory").addEventListener("click", () => showScreen("history"));
    document.getElementById("btnBackFromBattle").addEventListener("click", () => {
      state.battle = null;
      showScreen("world");
    });
    document.getElementById("btnBackFromBFDIs").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnBackFromHistory").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnSubmitVotes").addEventListener("click", submitEliminationVote);
    document.getElementById("btnPickWinner").addEventListener("click", pickWinner);
    document.getElementById("btnNextChallenge").addEventListener("click", runNextChallenge);
    document.getElementById("btnBackWorld").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnCancelMake").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnSaveObject").addEventListener("click", saveObject);

    ui.inputName.addEventListener("input", readDraft);
    ui.selectShape.addEventListener("change", readDraft);
    ui.inputColor.addEventListener("input", readDraft);
    ui.selectMouth.addEventListener("change", readDraft);

    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyZ" && ui.screenWorld.classList.contains("active")) switchCharacter();
      state.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => state.keys.delete(e.code));
  }

  function boot() {
    populateShapeSelect();
    populateMouthSelect();
    previewCtx = ui.makePreviewCanvas?.getContext("2d");
    load();
    setupAdminLink();
    bindEvents();
    renderPartidaList();
    showScreen("title");
    GameI18n.onChange(refreshI18nUi);
  }

  boot();
})();
