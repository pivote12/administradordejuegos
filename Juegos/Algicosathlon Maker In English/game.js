(function () {
  "use strict";

  const STORAGE_KEY = "algicosathlon-maker-in-english-data";
  const WORLD_W = 800;
  const WORLD_H = 500;
  const GRAVITY_ZONE_START = WORLD_H * 0.58;
  const GRAVITY_ZONE_FULL = WORLD_H * 0.88;
  const GRAVITY_MAX = 0.11;
  const SPACE_DAMPING = 0.9996;
  const AIR_DAMPING = 0.9975;
  const WALL_BOUNCE = 0.82;
  const FLOOR_BOUNCE = 0.58;
  const BALL_RESTITUTION = 0.88;
  const THROW_SCALE = 0.92;
  const MAX_THROW_SPEED = 18;
  const BALL_RADIUS = 26;
  const BALL_BORDER_PX = 3;
  const MIN_BALLS_ATHLON = 2;

  GameI18n.init("algicosathlon-maker-english");

  function refreshAlgicosathlonI18n() {
    GameI18n.applyDom();
    renderPartidaList();
    renderWorld();
    updateMakeUi();
    renderMakePreview();
    if (ui.screenWinStorage?.classList.contains("active")) {
      renderWinStorage();
    }
  }

  const REJOIN_EVERY_BALLS = 5;
  const VIEWER_VOTING_MIN_ACTIVE = 4;
  const BALL_SAVE_PREFIX = "algicosathlon-maker-in-english-balls";
  const FOLDER_IDB_NAME = "algicosathlon-maker-in-english-folder-db";
  const FOLDER_IDB_STORE = "handles";
  const FOLDER_HANDLE_KEY = "save-folder";
  const BOARD_W = 400;
  const BOARD_H = 560;
  const PLINKO_GOAL = 10000;
  const MAX_VISUAL_BALLS = 40;
  const CHALLENGE_MAX_MS = 22000;

  const CHALLENGE_TYPES = [
    {
      id: "plinko",
      name: "Plinko",
      emoji: "🎰",
      desc: "Balls fall through the pegs. Goal: 10,000."
    },
    {
      id: "stayOnPlatform",
      name: "Stay On Platform",
      emoji: "🟩",
      desc: "Stay on the platform while it shrinks."
    },
    {
      id: "pumpSurvival",
      name: "Pump Survival",
      emoji: "📦",
      desc: "Escape the box before the others. Last one out wins!"
    }
  ];


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

  const state = {
    partidas: [],
    currentPartidaId: null,
    activePartidaSessionId: null,
    balls: [],
    draft: defaultDraft(),
    running: false,
    frameId: null,
    drag: null,
    athlon: null,
    athlonAllOutCombat: false,
    athlonViewerVoting: false,
    athlonBallsBackup: null,
    fileSave: {
      directoryHandle: null,
      folderName: ""
    }
  };

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenPartidas: document.getElementById("screenPartidas"),
    screenWorld: document.getElementById("screenWorld"),
    screenMake: document.getElementById("screenMake"),
    screenAlgicosathlon: document.getElementById("screenAlgicosathlon"),
    screenWinStorage: document.getElementById("screenWinStorage"),
    screenGuardar: document.getElementById("screenGuardar"),
    athlonMeta: document.getElementById("athlonMeta"),
    athlonEmoji: document.getElementById("athlonEmoji"),
    athlonChallengeName: document.getElementById("athlonChallengeName"),
    athlonChallengeDesc: document.getElementById("athlonChallengeDesc"),
    athlonStats: document.getElementById("athlonStats"),
    athlonLog: document.getElementById("athlonLog"),
    athlonRoster: document.getElementById("athlonRoster"),
    athlonScoreboard: document.getElementById("athlonScoreboard"),
    athlonLayout: document.getElementById("athlonLayout"),
    athlonMain: document.getElementById("athlonMain"),
    athlonRejoinsInfo: document.getElementById("athlonRejoinsInfo"),
    btnStartAthlon: document.getElementById("btnStartAthlon"),
    btnNextChallenge: document.getElementById("btnNextChallenge"),
    btnRestartAthlon: document.getElementById("btnRestartAthlon"),
    btnRestartFromScoreboard: document.getElementById("btnRestartFromScoreboard"),
    rejoinPicker: document.getElementById("rejoinPicker"),
    rejoinList: document.getElementById("rejoinList"),
    elimPicker: document.getElementById("elimPicker"),
    elimList: document.getElementById("elimList"),
    viewerVotePicker: document.getElementById("viewerVotePicker"),
    viewerVoteOptions: document.getElementById("viewerVoteOptions"),
    viewerVoteLogList: document.getElementById("viewerVoteLogList"),
    viewerVoteTally: document.getElementById("viewerVoteTally"),
    inputViewerName: document.getElementById("inputViewerName"),
    btnFinishViewerVoting: document.getElementById("btnFinishViewerVoting"),
    athlonScreenTitle: document.getElementById("athlonScreenTitle"),
    btnSkipRejoin: document.getElementById("btnSkipRejoin"),
    btnUseRejoin: document.getElementById("btnUseRejoin"),
    athlonArenaWrap: document.getElementById("athlonArenaWrap"),
    challengeBoard: document.getElementById("challengeBoard"),
    challengeMap: document.getElementById("challengeMap"),
    challengeEntities: document.getElementById("challengeEntities"),
    challengeStatus: document.getElementById("challengeStatus"),
    winList: document.getElementById("winList"),
    winEmpty: document.getElementById("winEmpty"),
    partidaList: document.getElementById("partidaList"),
    partidaEmpty: document.getElementById("partidaEmpty"),
    btnCombatirTodos: document.getElementById("btnCombatirTodos"),
    btnGuardar: document.getElementById("btnGuardar"),
    guardarFolderName: document.getElementById("guardarFolderName"),
    guardarStatus: document.getElementById("guardarStatus"),
    btnPickFolder: document.getElementById("btnPickFolder"),
    btnSaveToFolder: document.getElementById("btnSaveToFolder"),
    btnLoadFromFolder: document.getElementById("btnLoadFromFolder"),
    btnDownloadBalls: document.getElementById("btnDownloadBalls"),
    btnUploadBalls: document.getElementById("btnUploadBalls"),
    inputUploadBalls: document.getElementById("inputUploadBalls"),
    inputPartidaName: document.getElementById("inputPartidaName"),
    worldTitle: document.getElementById("worldTitle"),
    worldArena: document.getElementById("worldArena"),
    worldBalls: document.getElementById("worldBalls"),
    worldMeta: document.getElementById("worldMeta"),
    worldHint: document.getElementById("worldHint"),
    makePreview: document.getElementById("makePreview"),
    makePreviewFill: document.getElementById("makePreviewFill"),
    makePreviewText: document.getElementById("makePreviewText"),
    makePreviewName: document.getElementById("makePreviewName"),
    labelColor1: document.getElementById("labelColor1"),
    monoBlock: document.getElementById("monoBlock"),
    monoRow: document.getElementById("monoRow"),
    borderRow: document.getElementById("borderRow"),
    textRow: document.getElementById("textRow"),
    inputName: document.getElementById("inputName"),
    inputColor: document.getElementById("inputColor"),
    inputColor2: document.getElementById("inputColor2"),
    inputBorderColor: document.getElementById("inputBorderColor"),
    inputTextColor: document.getElementById("inputTextColor"),
    checkRainbow: document.getElementById("checkRainbow"),
    checkMonochrome: document.getElementById("checkMonochrome"),
    checkBorder: document.getElementById("checkBorder"),
    checkText: document.getElementById("checkText")
  };

  function setGuardarStatus(message, ok) {
    if (!ui.guardarStatus) {
      return;
    }
    ui.guardarStatus.textContent = message || "";
    ui.guardarStatus.classList.toggle("err", ok === false);
  }

  function updateGuardarFolderLabel() {
    if (!ui.guardarFolderName) {
      return;
    }
    ui.guardarFolderName.textContent = state.fileSave.folderName || "No folder selected";
  }

  function supportsDirectoryPicker() {
    return typeof window.showDirectoryPicker === "function";
  }

  function openFolderDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(FOLDER_IDB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(FOLDER_IDB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function storeDirectoryHandle(handle) {
    const db = await openFolderDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FOLDER_IDB_STORE, "readwrite");
      tx.objectStore(FOLDER_IDB_STORE).put(handle, FOLDER_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadStoredDirectoryHandle() {
    if (!supportsDirectoryPicker()) {
      return null;
    }
    try {
      const db = await openFolderDb();
      const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction(FOLDER_IDB_STORE, "readonly");
        const req = tx.objectStore(FOLDER_IDB_STORE).get(FOLDER_HANDLE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      if (!handle) {
        return null;
      }
      const ok = await verifyDirectoryPermission(handle, true, false);
      if (!ok) {
        await clearStoredDirectoryHandle();
        return null;
      }
      return handle;
    } catch (_err) {
      return null;
    }
  }

  async function verifyDirectoryPermission(handle, readWrite, requestIfNeeded = true) {
    const opts = { mode: readWrite ? "readwrite" : "read" };
    try {
      if ((await handle.queryPermission(opts)) === "granted") {
        return true;
      }
      if (!requestIfNeeded) {
        return false;
      }
      if ((await handle.requestPermission(opts)) === "granted") {
        return true;
      }
    } catch (_err) {
      return false;
    }
    return false;
  }

  async function clearStoredDirectoryHandle() {
    state.fileSave.directoryHandle = null;
    state.fileSave.folderName = "";
    updateGuardarFolderLabel();
    try {
      const db = await openFolderDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(FOLDER_IDB_STORE, "readwrite");
        tx.objectStore(FOLDER_IDB_STORE).delete(FOLDER_HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (_err) {
      /* sin carpeta guardada */
    }
  }

  async function initFileSaveFolder() {
    const handle = await loadStoredDirectoryHandle();
    if (handle) {
      state.fileSave.directoryHandle = handle;
      state.fileSave.folderName = handle.name;
      updateGuardarFolderLabel();
    }
  }

  async function pickSaveFolder() {
    if (!supportsDirectoryPicker()) {
      setGuardarStatus("Your browser cannot pick a folder. Use download / upload file.", false);
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      state.fileSave.directoryHandle = handle;
      state.fileSave.folderName = handle.name;
      await storeDirectoryHandle(handle);
      updateGuardarFolderLabel();
      setGuardarStatus(`Folder selected: ${handle.name}`, true);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setGuardarStatus("Could not select folder.", false);
      }
    }
  }

  function supportsOpenFilePicker() {
    return typeof window.showOpenFilePicker === "function";
  }

  function syncDraftFromEditor() {
    if (!ui.inputName) {
      return;
    }
    readDraft();
  }

  function ballDesignFromDraft(draft) {
    const normalized = normalizeBall(draft);
    return {
      name: normalized.name,
      color: normalized.color,
      color2: normalized.color2,
      border: normalized.border,
      borderColor: normalized.borderColor,
      textEnabled: normalized.textEnabled,
      textColor: normalized.textColor,
      rainbow: normalized.rainbow,
      monochrome: normalized.monochrome
    };
  }

  function parseBallDesignFromExport(data) {
    if (data?.ball && typeof data.ball === "object") {
      return ballDesignFromDraft(data.ball);
    }
    if (Array.isArray(data?.partidas)) {
      for (const partida of data.partidas) {
        if (partida?.balls?.[0]) {
          return ballDesignFromDraft(partida.balls[0]);
        }
      }
    }
    throw new Error("Invalid file");
  }

  function buildSingleBallExport() {
    syncDraftFromEditor();
    if (!state.draft.name) {
      throw new Error("NO_NAME");
    }
    return {
      version: 2,
      savedAt: Date.now(),
      app: "algicosathlon-maker-in-english",
      ball: ballDesignFromDraft(state.draft)
    };
  }

  function ballSaveFilename(name) {
    const slug = String(name || "ball")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "ball";
    return `${BALL_SAVE_PREFIX}-${slug}.json`;
  }

  function applyBallDesignToEditor(data) {
    const design = parseBallDesignFromExport(data);
    state.draft = {
      ...defaultDraft(),
      ...design
    };
    syncDraftToControls();
  }

  function finishBallLoadToEditor(ballName) {
    showScreen("make");
    setGuardarStatus(`Loaded "${ballName}" into editor`, true);
    showSaveToast(true, "Ball loaded into editor");
  }

  async function writeBallJsonToFolder(handle, filename, data) {
    const payload = JSON.stringify(data, null, 2);
    const fileHandle = await handle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(payload);
    await writable.close();
  }

  async function pickBallJsonFile(startInHandle) {
    if (!supportsOpenFilePicker()) {
      return null;
    }
    const opts = {
      multiple: false,
      types: [
        {
          description: "Algicosathlon ball",
          accept: { "application/json": [".json"] }
        }
      ]
    };
    if (startInHandle) {
      opts.startIn = startInHandle;
    }
    const [fileHandle] = await window.showOpenFilePicker(opts);
    return fileHandle;
  }

  async function readBallJsonFile(fileHandle) {
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  }

  async function savePelotitasToFolder() {
    const handle = state.fileSave.directoryHandle;
    if (!handle) {
      setGuardarStatus("Choose a folder first.", false);
      return;
    }
    try {
      syncDraftFromEditor();
      if (!state.draft.name) {
        setGuardarStatus("Enter a name in the editor before saving.", false);
        showScreen("make");
        return;
      }
      const ok = await verifyDirectoryPermission(handle, true);
      if (!ok) {
        setGuardarStatus("No permission to write to the folder.", false);
        return;
      }
      const data = buildSingleBallExport();
      const filename = ballSaveFilename(state.draft.name);
      await writeBallJsonToFolder(handle, filename, data);
      setGuardarStatus(`Saved "${state.draft.name}" as ${filename}`, true);
      showSaveToast(true, "Ball saved");
    } catch (err) {
      if (err?.message === "NO_NAME") {
        setGuardarStatus("Enter a name in the editor before saving.", false);
        showScreen("make");
        return;
      }
      console.error(err);
      setGuardarStatus("Error saving to folder.", false);
    }
  }

  async function loadPelotitasFromFolder() {
    try {
      if (!supportsOpenFilePicker()) {
        setGuardarStatus("Use «Upload .json» to pick a file.", false);
        ui.inputUploadBalls?.click();
        return;
      }
      const handle = state.fileSave.directoryHandle;
      if (handle) {
        const ok = await verifyDirectoryPermission(handle, true);
        if (!ok) {
          setGuardarStatus("No permission to read the folder.", false);
          return;
        }
      }
      const fileHandle = await pickBallJsonFile(handle || undefined);
      const data = await readBallJsonFile(fileHandle);
      applyBallDesignToEditor(data);
      finishBallLoadToEditor(state.draft.name);
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error(err);
      setGuardarStatus("Invalid file or could not load.", false);
    }
  }

  function downloadPelotitasFile() {
    try {
      syncDraftFromEditor();
      if (!state.draft.name) {
        setGuardarStatus("Enter a name in the editor before saving.", false);
        showScreen("make");
        return;
      }
      const data = buildSingleBallExport();
      const filename = ballSaveFilename(state.draft.name);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      setGuardarStatus(`Downloaded ${filename}`, true);
    } catch (err) {
      if (err?.message === "NO_NAME") {
        setGuardarStatus("Enter a name in the editor before saving.", false);
        showScreen("make");
        return;
      }
      setGuardarStatus("Could not download.", false);
    }
  }

  function uploadPelotitasFile(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ""));
        applyBallDesignToEditor(data);
        finishBallLoadToEditor(state.draft.name);
      } catch (err) {
        console.error(err);
        setGuardarStatus("Invalid file.", false);
      }
    };
    reader.readAsText(file);
  }

  function openGuardar() {
    syncDraftFromEditor();
    setGuardarStatus("");
    updateGuardarFolderLabel();
    if (ui.btnPickFolder) {
      ui.btnPickFolder.hidden = !supportsDirectoryPicker();
    }
    showScreen("guardar");
  }

  function getCurrentPartida() {
    return state.partidas.find((p) => p.id === state.currentPartidaId) || null;
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

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
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

  function syncBallsToCurrentPartida() {
    const partida = getCurrentPartida();
    if (!partida || state.athlonAllOutCombat) {
      return;
    }
    if (state.activePartidaSessionId !== state.currentPartidaId) {
      return;
    }
    partida.balls = state.balls.map(serializeBall);
  }

  let saveToastTimer = null;

  function serializePartidaForStorage(partida) {
    return {
      id: partida.id,
      name: partida.name,
      createdAt: partida.createdAt,
      balls: Array.isArray(partida.balls) ? partida.balls : [],
      wins: partida.wins && typeof partida.wins === "object" ? { ...partida.wins } : {}
    };
  }

  function save() {
    syncBallsToCurrentPartida();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          partidas: state.partidas.map(serializePartidaForStorage),
          currentPartidaId: state.currentPartidaId
        })
      );
      return true;
    } catch (err) {
      console.error("Could not save:", err);
      return false;
    }
  }

  function showSaveToast(ok, message) {
    const toast = document.getElementById("saveToast");
    if (!toast) {
      return;
    }
    toast.textContent = message || (ok ? "Saved" : "Error saving");
    toast.hidden = false;
    clearTimeout(saveToastTimer);
    saveToastTimer = setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "Saved";
    }, 2200);
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

  function getPartidaWins() {
    const partida = getCurrentPartida();
    if (!partida) {
      return {};
    }
    if (!partida.wins || typeof partida.wins !== "object") {
      partida.wins = {};
    }
    return partida.wins;
  }

  function getBallWins(ballId) {
    const wins = getPartidaWins();
    return Number(wins[ballId]) || 0;
  }

  function addBallWin(ballId) {
    const ath = state.athlon;
    if (ath?.allOutCombat) {
      const contestant = ath.contestants.find((c) => c.id === ballId);
      const partidaId = contestant?.sourcePartidaId;
      const sourceBallId = contestant?.sourceBallId;
      if (partidaId && sourceBallId) {
        const partida = state.partidas.find((p) => p.id === partidaId);
        if (partida) {
          if (!partida.wins || typeof partida.wins !== "object") {
            partida.wins = {};
          }
          partida.wins[sourceBallId] = (Number(partida.wins[sourceBallId]) || 0) + 1;
          const saved = save();
          showSaveToast(
            saved,
            saved ? `Win saved (${partida.name})` : "Error saving win"
          );
          return;
        }
      }
    }

    const wins = getPartidaWins();
    wins[ballId] = (Number(wins[ballId]) || 0) + 1;
    const saved = save();
    showSaveToast(saved, saved ? "Win saved" : "Error saving win");
  }

  function resetAllWins() {
    const partida = getCurrentPartida();
    if (partida) {
      partida.wins = {};
    }
  }

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

  function getArenaLayout() {
    const rect = ui.worldArena.getBoundingClientRect();
    const scale = Math.min(rect.width / WORLD_W, rect.height / WORLD_H);
    const offsetX = (rect.width - WORLD_W * scale) / 2;
    const offsetY = (rect.height - WORLD_H * scale) / 2;
    return { rect, scale, offsetX, offsetY };
  }

  function worldToScreen(x, y) {
    const { scale, offsetX, offsetY } = getArenaLayout();
    return {
      x: offsetX + x * scale,
      y: offsetY + y * scale
    };
  }

  function hitTestBall(worldX, worldY) {
    for (let i = state.balls.length - 1; i >= 0; i -= 1) {
      const ball = state.balls[i];
      const dx = worldX - ball.x;
      const dy = worldY - ball.y;
      if (dx * dx + dy * dy <= ball.radius * ball.radius) {
        return ball;
      }
    }
    return null;
  }

  function showScreen(name) {
    const screens = {
      title: ui.screenTitle,
      partidas: ui.screenPartidas,
      world: ui.screenWorld,
      make: ui.screenMake,
      algicosathlon: ui.screenAlgicosathlon,
      winStorage: ui.screenWinStorage,
      guardar: ui.screenGuardar
    };
    Object.entries(screens).forEach(([key, el]) => {
      if (el) {
        el.classList.toggle("active", key === name);
      }
    });

    if (name === "world") {
      startWorldLoop();
      renderWorld();
    } else if (name === "algicosathlon") {
      stopWorldLoop();
      endDrag();
      renderAthlonSetup();
    } else if (name === "winStorage") {
      stopWorldLoop();
      stopVisualChallenge();
      endDrag();
      renderWinStorage();
    } else if (name === "partidas") {
      stopWorldLoop();
      endDrag();
      renderPartidaList();
    } else if (name === "make") {
      stopWorldLoop();
      endDrag();
    } else {
      stopWorldLoop();
      stopVisualChallenge();
      if (name !== "make") {
        endDrag();
      }
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
    updateCombatirTodosButton();
  }

  function deletePartida(id, name) {
    const label = String(name || "this game");
    if (!confirm(GameI18n.t("deleteGameConfirm", { name: label }))) {
      return;
    }

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
    if (!trimmed) {
      return;
    }
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

  function getTotalBallsAllPartidas() {
    return state.partidas.reduce((sum, partida) => sum + (partida.balls?.length || 0), 0);
  }

  function collectAllPartidaBalls() {
    const merged = [];

    state.partidas.forEach((partida) => {
      partida.balls.forEach((ball) => {
        merged.push({
          ...hydrateBall(ball),
          id: `${partida.id}__${ball.id}`,
          sourcePartidaId: partida.id,
          sourceBallId: ball.id,
          partidaName: partida.name
        });
      });
    });

    const nameCounts = new Map();
    merged.forEach((ball) => {
      nameCounts.set(ball.name, (nameCounts.get(ball.name) || 0) + 1);
    });

    merged.forEach((ball) => {
      if ((nameCounts.get(ball.name) || 0) > 1) {
        ball.name = `${ball.name} · ${ball.partidaName}`;
      }
    });

    return merged;
  }

  function restoreAfterAllOutCombat() {
    if (!state.athlonAllOutCombat || !state.athlonBallsBackup) {
      return;
    }
    state.balls = state.athlonBallsBackup.balls;
    state.activePartidaSessionId = state.athlonBallsBackup.sessionId;
    state.athlonAllOutCombat = false;
    state.athlonBallsBackup = null;
  }

  function updateCombatirTodosButton() {
    if (!ui.btnCombatirTodos) {
      return;
    }
    const total = getTotalBallsAllPartidas();
    const canFightAll = state.partidas.length >= 2 && total >= MIN_BALLS_ATHLON;
    ui.btnCombatirTodos.hidden = state.partidas.length < 2;
    ui.btnCombatirTodos.disabled = !canFightAll;
    ui.btnCombatirTodos.title = canFightAll
      ? "Algicosathlon with all balls from every game"
      : `You need at least ${MIN_BALLS_ATHLON} balls in total across all games`;
  }

  function openPartida(id) {
    if (state.currentPartidaId && state.currentPartidaId !== id) {
      syncBallsToCurrentPartida();
    }
    state.currentPartidaId = id;
    loadBallsFromPartida();
    const partida = getCurrentPartida();
    if (partida) {
      ui.worldTitle.textContent = partida.name;
    }
    updateCombatirTodosButton();
    showScreen("world");
  }

  function clientToWorld(clientX, clientY) {
    const { rect, scale, offsetX, offsetY } = getArenaLayout();
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale
    };
  }

  function clampBallPosition(ball) {
    const r = ball.radius;
    ball.x = Math.max(r, Math.min(WORLD_W - r, ball.x));
    ball.y = Math.max(r, Math.min(WORLD_H - r, ball.y));
  }

  function separateTouching(moving, other) {
    const dx = moving.x - other.x;
    const dy = moving.y - other.y;
    const dist = Math.hypot(dx, dy);
    const minDist = moving.radius + other.radius;
    if (dist >= minDist || dist < 0.001) {
      if (dist < 0.001 && minDist > 0) {
        moving.x = other.x + minDist;
      }
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    moving.x = other.x + nx * minDist;
    moving.y = other.y + ny * minDist;
  }

  function resolveDragTouches(dragged) {
    state.balls.forEach((other) => {
      if (other.id === dragged.id) {
        return;
      }
      separateTouching(dragged, other);
    });
    clampBallPosition(dragged);
  }

  function getGravityStrength(y) {
    if (y < GRAVITY_ZONE_START) {
      return 0;
    }
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
    if (a.dragging || b.dragging) {
      return;
    }

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.radius + b.radius;
    if (dist >= minDist || dist < 0.001) {
      return;
    }

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

  function pushDragSample(drag, x, y) {
    const now = performance.now();
    drag.samples.push({ x, y, t: now });
    if (drag.samples.length > 6) {
      drag.samples.shift();
    }
  }

  function velocityFromDragSamples(samples) {
    if (!samples || samples.length < 2) {
      return { vx: 0, vy: 0 };
    }
    const newest = samples[samples.length - 1];
    const oldest = samples[0];
    const dt = (newest.t - oldest.t) / 1000;
    if (dt <= 0.001) {
      return { vx: 0, vy: 0 };
    }
    return {
      vx: ((newest.x - oldest.x) / dt) * THROW_SCALE,
      vy: ((newest.y - oldest.y) / dt) * THROW_SCALE
    };
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
    if (!clean) {
      return "?";
    }
    const letters = clean.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");
    const digits = clean.replace(/\D/g, "");
    let text = (letters.slice(0, 2) || clean.slice(0, 2)).toUpperCase();
    if (digits.length) {
      text += digits[0];
    }
    return text.slice(0, 4);
  }

  function applyBallLook(node, fill, text, data, mini) {
    const cfg = normalizeBall(data);
    node.className = "ball" + (mini ? " mini" : "");
    node.classList.toggle("has-border", cfg.border);
    node.style.setProperty("--ball-color", cfg.color);
    node.style.setProperty("--ball-color2", cfg.color2);
    if (cfg.border) {
      node.style.setProperty("--ball-border", cfg.borderColor);
    }

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
    fill.className = "ball-fill";
    const text = document.createElement("span");
    text.className = "ball-text";
    wrap.appendChild(fill);
    wrap.appendChild(text);
    applyBallLook(wrap, fill, text, data, mini);
    return { wrap, fill, text };
  }

  function updateBallNodePosition(ball) {
    const node = ui.worldBalls.querySelector(`[data-id="${ball.id}"]`);
    if (!node) {
      return;
    }
    const screen = worldToScreen(ball.x, ball.y);
    node.style.left = `${screen.x}px`;
    node.style.top = `${screen.y}px`;
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
    ui.makePreviewName.textContent = state.draft.name || GameI18n.t("unnamed");
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

  function getRejoinCount(ballCount) {
    return Math.floor(Math.max(0, ballCount - 1) / REJOIN_EVERY_BALLS);
  }

  function getAthlonChallengeCount(ballCount) {
    return Math.max(1, ballCount - 1);
  }

  function appendExtraChallenge(ath) {
    const index = ath.challenges.length;
    const type = CHALLENGE_TYPES[index % CHALLENGE_TYPES.length];
    ath.challenges.push({
      ...type,
      round: index + 1
    });
  }

  function canUseRejoin() {
    const ath = state.athlon;
    if (!ath || ath.finished || ath.challengeRunning) {
      return false;
    }
    if (ath.awaitingEliminationChoice || ath.awaitingRejoinChoice || ath.awaitingViewerVoting) {
      return false;
    }
    const rejoinsLeft = ath.rejoinsTotal - ath.rejoinsUsed;
    return rejoinsLeft > 0 && ath.eliminated.length > 0;
  }

  function updateUseRejoinButton() {
    if (!ui.btnUseRejoin) {
      return;
    }
    const ath = state.athlon;
    const show = ath && !ath.finished && !ath.challengeRunning && canUseRejoin();
    ui.btnUseRejoin.hidden = !show;
    if (show) {
      const left = ath.rejoinsTotal - ath.rejoinsUsed;
      ui.btnUseRejoin.textContent = `Use rejoin (${left} remaining)`;
      ui.btnUseRejoin.disabled = false;
    }
  }

  function buildChallengeList(count) {
    const list = [];
    for (let i = 0; i < count; i += 1) {
      const type = CHALLENGE_TYPES[i % CHALLENGE_TYPES.length];
      list.push({
        ...type,
        round: i + 1
      });
    }
    return list;
  }

  function showAthlonScoreboard(show) {
    if (ui.athlonScoreboard) {
      ui.athlonScoreboard.hidden = !show;
    }
    if (ui.athlonMain) {
      ui.athlonMain.hidden = show;
    }
    if (ui.athlonLayout) {
      ui.athlonLayout.hidden = show;
    }
    if (ui.screenAlgicosathlon) {
      ui.screenAlgicosathlon.classList.toggle("scoreboard-mode", show);
    }
  }

  function showChallengeArena(show) {
    if (ui.athlonArenaWrap) {
      ui.athlonArenaWrap.hidden = !show;
    }
  }

  function stopVisualChallenge() {
    if (!state.athlon?.visual) {
      return;
    }
    state.athlon.visual.running = false;
    if (state.athlon.visual.frameId) {
      cancelAnimationFrame(state.athlon.visual.frameId);
      state.athlon.visual.frameId = null;
    }
  }

  function setChallengeStatus(text) {
    if (ui.challengeStatus) {
      ui.challengeStatus.textContent = text;
    }
  }

  function getBoardScale() {
    const rect = ui.challengeBoard.getBoundingClientRect();
    return Math.min(rect.width / BOARD_W, rect.height / BOARD_H);
  }

  function buildPlinkoMap() {
    const pegs = [];
    const rowCount = 6;
    const pegGapX = 56;
    const pegGapY = 52;
    const pegStartY = 95;

    for (let row = 0; row < rowCount; row += 1) {
      const cols = row % 2 === 0 ? 6 : 5;
      const rowWidth = (cols - 1) * pegGapX;
      const startX = (BOARD_W - rowWidth) / 2;
      for (let col = 0; col < cols; col += 1) {
        pegs.push({ x: startX + col * pegGapX, y: pegStartY + row * pegGapY, r: 4 });
      }
    }

    const multOptions = ["+50", "+100", "+250", "+500", "+1000", "x2"];
    const multGap = 60;
    const multRowWidth = (multOptions.length - 1) * multGap;
    const multStartX = (BOARD_W - multRowWidth) / 2;
    const multipliers = multOptions.map((option, index) => ({
      x: multStartX + index * multGap,
      y: 518,
      r: 22,
      option
    }));

    return {
      spawn: { x: BOARD_W / 2, y: 42 },
      pegs,
      multipliers
    };
  }

  function buildPumpSurvivalMap() {
    const boxLeft = 72;
    const boxRight = BOARD_W - 72;
    const boxWidth = boxRight - boxLeft;
    return {
      box: { left: boxLeft, right: boxRight, top: 88, bottom: 440 },
      // Casi el ancho de la caja: menos huecos laterales por donde se escapan las pelotitas.
      block: { width: boxWidth - 6, height: 28, minY: 385, maxY: 255, speed: 0.0024 },
      escapeOrder: [],
      durationMs: 18000
    };
  }

  function buildStayOnPlatformMap() {
    return {
      platformY: BOARD_H - 72,
      platformCenterX: BOARD_W / 2,
      startWidth: BOARD_W * 0.88,
      minWidth: 52,
      durationMs: 14000
    };
  }

  function buildChallengeMap(challenge) {
    if (challenge.id === "plinko") {
      return buildPlinkoMap();
    }
    if (challenge.id === "stayOnPlatform") {
      return buildStayOnPlatformMap();
    }
    if (challenge.id === "pumpSurvival") {
      return buildPumpSurvivalMap();
    }
    return { spawn: { x: 0, y: 0 } };
  }

  function parseMultOption(option) {
    const op = String(option || "+50").trim();
    if (/^x/i.test(op)) {
      return { type: "mul", value: parseFloat(op.slice(1)) || 2 };
    }
    return { type: "add", value: parseInt(op.replace("+", ""), 10) || 50 };
  }

  function applyMultScore(score, option) {
    const p = parseMultOption(option);
    if (p.type === "mul") {
      return Math.floor(score * p.value);
    }
    return score + p.value;
  }

  function renderChallengeMap(challenge, map) {
    ui.challengeMap.innerHTML = "";
    ui.challengeBoard.className = `challenge-board type-${challenge.id}`;

    if (challenge.id === "plinko") {
      const spawn = document.createElement("div");
      spawn.className = "challenge-spawn";
      spawn.style.left = `${(map.spawn.x / BOARD_W) * 100}%`;
      spawn.style.top = `${(map.spawn.y / BOARD_H) * 100}%`;
      ui.challengeMap.appendChild(spawn);

      map.pegs.forEach((peg) => {
        const el = document.createElement("div");
        el.className = "challenge-peg";
        const size = peg.r * 2;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${(peg.x / BOARD_W) * 100}%`;
        el.style.top = `${(peg.y / BOARD_H) * 100}%`;
        ui.challengeMap.appendChild(el);
      });

      map.multipliers.forEach((mult) => {
        const el = document.createElement("div");
        el.className = "challenge-mult";
        el.textContent = mult.option;
        const size = mult.r * 2;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${(mult.x / BOARD_W) * 100}%`;
        el.style.top = `${(mult.y / BOARD_H) * 100}%`;
        ui.challengeMap.appendChild(el);
      });
    }

    if (challenge.id === "stayOnPlatform") {
      const plat = document.createElement("div");
      plat.className = "challenge-platform";
      plat.style.width = `${(map.startWidth / BOARD_W) * 100}%`;
      plat.style.left = `${((BOARD_W - map.startWidth) / 2 / BOARD_W) * 100}%`;
      plat.style.top = `${(map.platformY / BOARD_H) * 100}%`;
      ui.challengeMap.appendChild(plat);
      const voidZone = document.createElement("div");
      voidZone.className = "challenge-void";
      ui.challengeMap.appendChild(voidZone);
    }

    if (challenge.id === "pumpSurvival") {
      const box = document.createElement("div");
      box.className = "challenge-pump-box";
      box.style.left = `${(map.box.left / BOARD_W) * 100}%`;
      box.style.top = `${(map.box.top / BOARD_H) * 100}%`;
      box.style.width = `${((map.box.right - map.box.left) / BOARD_W) * 100}%`;
      box.style.height = `${((map.box.bottom - map.box.top) / BOARD_H) * 100}%`;
      ui.challengeMap.appendChild(box);

      const block = document.createElement("div");
      block.className = "challenge-pump-block";
      block.style.width = `${(map.block.width / BOARD_W) * 100}%`;
      block.style.height = `${(map.block.height / BOARD_H) * 100}%`;
      block.style.left = `${((BOARD_W - map.block.width) / 2 / BOARD_W) * 100}%`;
      const startY = (map.block.minY + map.block.maxY) / 2;
      block.style.top = `${(startY / BOARD_H) * 100}%`;
      ui.challengeMap.appendChild(block);
    }
  }

  function createRuntimeBall(contestant, map, challengeId, totalCount) {
    const base = {
      id: contestant.id,
      name: contestant.name,
      color: contestant.color,
      color2: contestant.color2,
      border: contestant.border,
      borderColor: contestant.borderColor,
      textEnabled: contestant.textEnabled,
      textColor: contestant.textColor,
      rainbow: contestant.rainbow,
      monochrome: contestant.monochrome,
      roundScore: 0,
      rankScore: 0,
      tieBreak: 0,
      visible: true,
      landed: false
    };

    if (challengeId === "stayOnPlatform") {
      return {
        ...base,
        radius: Math.max(6, Math.min(11, 280 / Math.max(8, totalCount))),
        x: map.platformCenterX + (Math.random() - 0.5) * map.startWidth * 0.55,
        y: map.platformY - 14,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 0,
        fell: false,
        fellAt: null
      };
    }

    if (challengeId === "pumpSurvival") {
      const pad = 24;
      const innerW = map.box.right - map.box.left - pad * 2;
      const innerH = map.box.bottom - map.box.top - pad * 2;
      return {
        ...base,
        radius: Math.max(6, Math.min(11, 260 / Math.max(8, totalCount))),
        x: map.box.left + pad + Math.random() * innerW,
        y: map.box.top + pad + Math.random() * innerH * 0.55,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.2,
        escaped: false,
        insideMs: 0
      };
    }

    const spawn = map.spawn || { x: BOARD_W / 2, y: 42 };
    return {
      ...base,
      radius: Math.max(6, Math.min(11, 280 / Math.max(8, totalCount))),
      x: spawn.x + (Math.random() - 0.5) * 24,
      y: spawn.y,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 0,
      multCooldown: 0,
      stuckFrames: 0
    };
  }

  function renderVisualBalls(runtimeBalls) {
    ui.challengeEntities.innerHTML = "";
    const scale = getBoardScale();
    const boardW = ui.challengeBoard.clientWidth || BOARD_W;

    runtimeBalls.forEach((ball) => {
      if (!ball.visible) {
        return;
      }

      const wrap = document.createElement("div");
      wrap.className = "challenge-ball-wrap";
      wrap.dataset.id = ball.id;

      if (ball.progress !== undefined) {
        wrap.classList.add("race");
        wrap.style.top = `${4 + (ball.lane % 20) * 4.5}%`;
        wrap.style.left = `${Math.min(96, ball.progress * 0.92 + 2)}%`;
      } else {
        wrap.style.left = `${(ball.x / BOARD_W) * 100}%`;
        wrap.style.top = `${(ball.y / BOARD_H) * 100}%`;
      }

      const { wrap: ballNode } = buildBallNode(ball, true);
      const diam = ball.radius * 2 * scale * (boardW / BOARD_W);
      ballNode.style.setProperty("--ball-size", `${Math.max(14, diam)}px`);
      ballNode.style.setProperty("--ball-border-width", "2px");
      wrap.appendChild(ballNode);

      ui.challengeEntities.appendChild(wrap);
    });
  }

  function updateVisualBall(ball) {
    const node = ui.challengeEntities.querySelector(`[data-id="${ball.id}"]`);
    if (!node || !ball.visible) {
      return;
    }
    if (ball.progress !== undefined) {
      node.style.left = `${Math.min(96, ball.progress * 0.92 + 2)}%`;
    } else {
      node.style.left = `${(ball.x / BOARD_W) * 100}%`;
      node.style.top = `${(ball.y / BOARD_H) * 100}%`;
    }
  }

  function resolvePegHit(ball, peg) {
    const dx = ball.x - peg.x;
    const dy = ball.y - peg.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDist = ball.radius + peg.r;
    if (dist >= minDist) {
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist + 0.5;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      const bounce = 1.85;
      ball.vx -= bounce * dot * nx;
      ball.vy -= bounce * dot * ny;
    }
    ball.vx += -ny * 0.32;
    ball.vy += nx * 0.12;
  }

  function resolveBallPair(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDist = a.radius + b.radius;
    if (dist >= minDist) {
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist + 0.3;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
  }

  function stepPlinkoBall(ball, map, visual) {
    if (ball.multCooldown > 0) {
      ball.multCooldown -= 1;
    }
    ball.vy += 0.32;
    ball.vx *= 0.999;
    ball.vy *= 0.999;
    ball.x += ball.vx;
    ball.y += ball.vy;

    const r = ball.radius;
    if (ball.x - r < 0) {
      ball.x = r;
      ball.vx = Math.abs(ball.vx) * 0.75;
    }
    if (ball.x + r > BOARD_W) {
      ball.x = BOARD_W - r;
      ball.vx = -Math.abs(ball.vx) * 0.75;
    }
    if (ball.y - r < 0) {
      ball.y = r;
      ball.vy = Math.abs(ball.vy) * 0.6;
    }
    if (ball.y + r > BOARD_H) {
      ball.y = BOARD_H - r;
      ball.vy = -Math.abs(ball.vy) * 0.55;
      ball.vx *= 0.98;
    }

    for (let pass = 0; pass < 2; pass += 1) {
      map.pegs.forEach((peg) => resolvePegHit(ball, peg));
    }

    if (ball.multCooldown <= 0) {
      map.multipliers.forEach((mult) => {
        const dx = ball.x - mult.x;
        const dy = ball.y - mult.y;
        const hitR = ball.radius + mult.r - 4;
        if (dx * dx + dy * dy <= hitR * hitR && ball.y > 370) {
          ball.roundScore = applyMultScore(ball.roundScore, mult.option);
          ball.multCooldown = 35;
          ball.x = map.spawn.x + (Math.random() - 0.5) * 16;
          ball.y = map.spawn.y;
          ball.vx = (Math.random() - 0.5) * 1.5;
          ball.vy = 0;
          if (ball.roundScore >= PLINKO_GOAL) {
            visual.goalReached = true;
          }
        }
      });
    }

    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed < 0.2) {
      ball.stuckFrames += 1;
    } else {
      ball.stuckFrames = 0;
    }
    if (ball.stuckFrames > 22) {
      ball.vx += (Math.random() - 0.5) * 2.5;
      ball.vy += 1.1;
      ball.stuckFrames = 0;
    }
  }

  function getPumpBlockY(map, elapsed) {
    const mid = (map.block.minY + map.block.maxY) / 2;
    const amp = (map.block.maxY - map.block.minY) / 2;
    return mid + Math.sin(elapsed * map.block.speed) * amp;
  }

  function resolvePumpBlock(ball, blockY, map) {
    const block = map.block;
    const left = (BOARD_W - block.width) / 2;
    const right = left + block.width;
    const top = blockY - block.height / 2;
    const bottom = blockY + block.height / 2;
    const closestX = Math.max(left, Math.min(ball.x, right));
    const closestY = Math.max(top, Math.min(ball.y, bottom));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDist = ball.radius;
    if (dist >= minDist) {
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist + 0.4;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    if (ny < -0.3) {
      ball.vy = Math.min(ball.vy, -2.8 - Math.random() * 1.2);
    } else if (ny > 0.3) {
      ball.vy = Math.max(ball.vy, 1.5);
    }
    ball.vx += nx * 0.8;
    ball.vy += ny * 0.8;
  }

  function clampPumpVelocity(ball) {
    const maxV = 7.5;
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > maxV) {
      const scale = maxV / speed;
      ball.vx *= scale;
      ball.vy *= scale;
    }
  }

  function isInPumpEscapeSlot(ball, map) {
    const { box } = map;
    const r = ball.radius;
    return ball.x > box.left + r && ball.x < box.right - r;
  }

  function constrainPumpBox(ball, map) {
    if (ball.escaped) {
      return;
    }
    const { box } = map;
    const r = ball.radius;
    const inset = 0.6;

    if (ball.x - r < box.left) {
      ball.x = box.left + r + inset;
      ball.vx = Math.abs(ball.vx) * 0.72;
    }
    if (ball.x + r > box.right) {
      ball.x = box.right - r - inset;
      ball.vx = -Math.abs(ball.vx) * 0.72;
    }
    if (ball.y + r > box.bottom) {
      ball.y = box.bottom - r - inset;
      ball.vy = -Math.abs(ball.vy) * 0.62;
      ball.vx *= 0.96;
    }
    // Esquinas superiores: solo la abertura central permite salir hacia arriba.
    if (!isInPumpEscapeSlot(ball, map) && ball.y - r < box.top) {
      ball.y = box.top + r + inset;
      ball.vy = Math.abs(ball.vy) * 0.62;
    }
  }

  function settlePumpCollisions(active, map, blockY) {
    for (let pass = 0; pass < 3; pass += 1) {
      active.forEach((ball) => {
        resolvePumpBlock(ball, blockY, map);
      });
      for (let i = 0; i < active.length; i += 1) {
        for (let j = i + 1; j < active.length; j += 1) {
          resolveBallPair(active[i], active[j]);
        }
      }
      active.forEach((ball) => {
        clampPumpVelocity(ball);
        constrainPumpBox(ball, map);
      });
    }
  }

  function ballEscapedPumpBox(ball, map) {
    const { box } = map;
    const r = ball.radius;
    return ball.y - r < box.top + 4 && isInPumpEscapeSlot(ball, map);
  }

  function markPumpEscape(ball, map, elapsed) {
    if (ball.escaped) {
      return;
    }
    ball.escaped = true;
    const order = map.escapeOrder.length;
    map.escapeOrder.push({ id: ball.id, time: elapsed, order });
    ball.roundScore = 200 + order * 120;
    ball.vy = -1.5 - Math.random();
    ball.vx += (Math.random() - 0.5) * 2;
  }

  function finalizeStayOnPlatformScores(runtimeBalls, elapsed) {
    runtimeBalls.forEach((ball) => {
      const survivalMs = ball.fellAt ?? elapsed;
      ball.rankScore = survivalMs;
      ball.tieBreak = -ball.lane;
      ball.roundScore = Math.floor(survivalMs / 50);
    });
  }

  function finalizePumpScores(runtimeBalls, map, elapsed) {
    runtimeBalls.forEach((ball) => {
      const entry = map.escapeOrder.find((e) => e.id === ball.id);
      if (entry) {
        // Gana la última en salir: quien sale antes queda peor clasificada.
        ball.rankScore = 1_000_000 + entry.order;
        ball.tieBreak = entry.time;
        ball.roundScore = entry.order + 1;
        return;
      }
      // Sigue dentro al final = mejor que quien salió antes del tiempo.
      const insideMs = ball.insideMs ?? elapsed;
      ball.rankScore = 2_000_000_000 + insideMs;
      ball.tieBreak = -ball.lane;
      ball.roundScore = Math.floor(insideMs / 100) + 1000;
    });
  }

  function finalizePlinkoScores(runtimeBalls) {
    runtimeBalls.forEach((ball) => {
      ball.rankScore = ball.roundScore;
      ball.tieBreak = -ball.lane;
    });
  }

  function finalizeChallengeScores(challenge, runtimeBalls, map, elapsed) {
    if (challenge.id === "stayOnPlatform") {
      finalizeStayOnPlatformScores(runtimeBalls, elapsed);
    } else if (challenge.id === "pumpSurvival") {
      finalizePumpScores(runtimeBalls, map, elapsed);
    } else if (challenge.id === "plinko") {
      finalizePlinkoScores(runtimeBalls);
    } else {
      runtimeBalls.forEach((ball) => {
        ball.rankScore = ball.roundScore;
        ball.tieBreak = ball.lane;
      });
    }
  }

  function stepPumpSurvival(visual) {
    const map = visual.map;
    const elapsed = performance.now() - visual.startedAt;
    const blockY = getPumpBlockY(map, elapsed);
    visual.blockY = blockY;

    const blockEl = ui.challengeMap?.querySelector(".challenge-pump-block");
    if (blockEl) {
      blockEl.style.top = `${(blockY / BOARD_H) * 100}%`;
    }

    const active = visual.runtimeBalls.filter((b) => !b.escaped);

    active.forEach((ball) => {
      ball.insideMs = elapsed;
      ball.vy += 0.14;
      ball.vx *= 0.988;
      ball.vy *= 0.988;
      ball.vx += (Math.random() - 0.5) * 0.08;
      ball.x += ball.vx;
      ball.y += ball.vy;
      clampPumpVelocity(ball);
      resolvePumpBlock(ball, blockY, map);
      constrainPumpBox(ball, map);
    });

    settlePumpCollisions(active, map, blockY);

    active.forEach((ball) => {
      if (ballEscapedPumpBox(ball, map)) {
        markPumpEscape(ball, map, elapsed);
      }
    });

    visual.runtimeBalls.forEach((ball) => {
      if (!ball.escaped) {
        return;
      }
      ball.vy += 0.1;
      ball.y += ball.vy;
      ball.x += ball.vx * 0.98;
    });
  }

  function stepStayOnPlatform(visual) {
    const map = visual.map;
    const elapsed = performance.now() - visual.startedAt;
    const t = Math.min(1, elapsed / map.durationMs);
    visual.platformWidth = map.startWidth - (map.startWidth - map.minWidth) * t;

    const platEl = ui.challengeMap?.querySelector(".challenge-platform");
    if (platEl) {
      platEl.style.width = `${(visual.platformWidth / BOARD_W) * 100}%`;
      platEl.style.left = `${((BOARD_W - visual.platformWidth) / 2 / BOARD_W) * 100}%`;
    }

    const halfW = visual.platformWidth / 2;
    const platTop = map.platformY - 8;

    visual.runtimeBalls.forEach((ball) => {
      if (ball.fell) {
        return;
      }

      ball.vx += (Math.random() - 0.5) * 0.12;
      ball.vx *= 0.985;
      ball.vy += 0.22;
      ball.x += ball.vx;
      ball.y += ball.vy;

      const onPlatform =
        ball.y + ball.radius >= platTop - 4 &&
        ball.y + ball.radius <= map.platformY + 16 &&
        Math.abs(ball.x - map.platformCenterX) <= halfW - ball.radius;

      if (onPlatform) {
        ball.y = platTop - ball.radius;
        ball.vy = 0;
      } else if (ball.y > map.platformY + 40) {
        ball.fell = true;
        ball.fellAt = elapsed;
      }
    });
  }

  function pickVisibleBallIds(runtimeBalls) {
    if (runtimeBalls.length <= MAX_VISUAL_BALLS) {
      return new Set(runtimeBalls.map((b) => b.id));
    }
    const sorted = [...runtimeBalls].sort((a, b) => b.roundScore - a.roundScore);
    const ids = new Set(sorted.slice(0, MAX_VISUAL_BALLS).map((b) => b.id));
    return ids;
  }

  function startVisualChallenge(challenge, contestants, onComplete) {
    stopVisualChallenge();
    showChallengeArena(true);

    const map = buildChallengeMap(challenge);

    const runtimeBalls = contestants.map((c, index) => {
      const ball = createRuntimeBall(c, map, challenge.id, contestants.length);
      ball.lane = index;
      return ball;
    });

    const visual = {
      running: true,
      frameId: null,
      challenge,
      map,
      runtimeBalls,
      totalCount: runtimeBalls.length,
      startedAt: performance.now(),
      goalReached: false,
      platformWidth: map.startWidth || BOARD_W,
      onComplete,
      renderDirty: true,
      lastVisibleKey: "",
      lastStatusAt: 0
    };

    state.athlon.visual = visual;
    renderChallengeMap(challenge, map);
    renderVisualBalls(runtimeBalls);
    setChallengeStatus(`${contestants.length} balls competing…`);

    const tick = () => {
      if (!visual.running) {
        return;
      }

      const elapsed = performance.now() - visual.startedAt;
      const ids = pickVisibleBallIds(visual.runtimeBalls);
      visual.runtimeBalls.forEach((ball) => {
        ball.visible = ids.has(ball.id);
      });

      if (challenge.id === "plinko") {
        for (let sub = 0; sub < 2; sub += 1) {
          visual.runtimeBalls.forEach((ball) => stepPlinkoBall(ball, map, visual));
          visual.runtimeBalls.forEach((a, i) => {
            visual.runtimeBalls.forEach((b, j) => {
              if (i < j) {
                resolveBallPair(a, b);
              }
            });
          });
        }
        if (!visual.lastStatusAt || elapsed - visual.lastStatusAt >= 350) {
          visual.lastStatusAt = elapsed;
          const leader = [...visual.runtimeBalls].sort((a, b) => b.roundScore - a.roundScore)[0];
          setChallengeStatus(
            `Plinko · Goal ${PLINKO_GOAL} · Leader: ${leader.name}`
          );
        }
      } else if (challenge.id === "stayOnPlatform") {
        stepStayOnPlatform(visual);
        const standing = visual.runtimeBalls.filter((b) => !b.fell).length;
        setChallengeStatus(`Stay On Platform · ${standing}/${visual.runtimeBalls.length} standing`);
      } else if (challenge.id === "pumpSurvival") {
        stepPumpSurvival(visual);
        const escaped = map.escapeOrder.length;
        const inside = visual.runtimeBalls.filter((b) => !b.escaped).length;
        setChallengeStatus(`Pump Survival · ${escaped} escaped · ${inside} inside`);
      }

      const visibleBalls = visual.runtimeBalls.filter((b) => b.visible);
      const visibleKey = visibleBalls.map((b) => b.id).join(",");
      if (visibleKey !== visual.lastVisibleKey) {
        visual.lastVisibleKey = visibleKey;
        renderVisualBalls(visibleBalls);
      } else {
        visibleBalls.forEach((ball) => updateVisualBall(ball));
      }

      let done = false;
      if (challenge.id === "plinko") {
        done =
          elapsed > CHALLENGE_MAX_MS ||
          (visual.goalReached && elapsed > 9000) ||
          (elapsed > 8000 &&
            visual.runtimeBalls.every((b) => b.roundScore >= PLINKO_GOAL * 0.35));
      } else if (challenge.id === "stayOnPlatform") {
        done = elapsed > map.durationMs || visual.runtimeBalls.every((b) => b.fell);
      } else if (challenge.id === "pumpSurvival") {
        done =
          map.escapeOrder.length >= visual.runtimeBalls.length ||
          elapsed > map.durationMs;
      }

      if (done) {
        finalizeChallengeScores(challenge, visual.runtimeBalls, map, elapsed);
        visual.running = false;
        showChallengeArena(false);
        onComplete(visual.runtimeBalls);
        return;
      }

      visual.frameId = requestAnimationFrame(tick);
    };

    visual.frameId = requestAnimationFrame(tick);
  }

  function createAthlonContestant(ball) {
    return {
      ...normalizeBall(ball),
      active: true,
      lastRank: null,
      sourcePartidaId: ball.sourcePartidaId || null,
      sourceBallId: ball.sourceBallId || null,
      partidaName: ball.partidaName || null
    };
  }

  function initAthlonState() {
    const ballCount = state.balls.length;
    const challengeCount = getAthlonChallengeCount(ballCount);
    const rejoinsTotal = getRejoinCount(ballCount);
    const challenges = buildChallengeList(challengeCount);

    state.athlon = {
      seed: Date.now(),
      ballCount,
      baseChallengeCount: challengeCount,
      allOutCombat: !!state.athlonAllOutCombat,
      rejoinsTotal,
      rejoinsUsed: 0,
      challengeIndex: 0,
      challenges,
      contestants: state.balls.map(createAthlonContestant),
      eliminated: [],
      finished: false,
      winnerId: null,
      log: [],
      visual: null,
      challengeRunning: false,
      awaitingEliminationChoice: false,
      awaitingRejoinChoice: false,
      viewerVoting: !!state.athlonViewerVoting,
      awaitingViewerVoting: false,
      viewerVotingCandidates: null,
      viewerVotes: {},
      viewerVoteEntries: []
    };
  }

  function getViewerVotingCandidateCount(activeCount) {
    return Math.max(1, Math.floor(activeCount / 2));
  }

  function getActiveContestants() {
    return state.athlon.contestants.filter((c) => c.active);
  }

  function appendAthlonLog(text, className) {
    state.athlon.log.push({ text, className: className || "" });
  }

  function renderAthlonSetup() {
    const count = state.balls.length;
    const challenges = getAthlonChallengeCount(count);
    const rejoins = getRejoinCount(count);
    const allOut = state.athlonAllOutCombat;
    const viewerVoting = state.athlonViewerVoting;

    if (ui.athlonScreenTitle) {
      ui.athlonScreenTitle.textContent = viewerVoting
        ? "Algicosathlon Viewer Voting"
        : "Algicosathlon";
    }

    ui.athlonMeta.textContent =
      count >= MIN_BALLS_ATHLON
        ? allOut
          ? `Fight All · ${count} balls from ${state.partidas.length} games · ${rejoins} rejoin${rejoins === 1 ? "" : "s"} · ${challenges} challenges`
          : viewerVoting
            ? `Viewer Voting · ${count} balls · ${rejoins} rejoin${rejoins === 1 ? "" : "s"} · ${challenges} challenges`
          : `${count} balls · ${rejoins} rejoin${rejoins === 1 ? "" : "s"} · ${challenges} challenges`
        : `You need ${MIN_BALLS_ATHLON} balls (you have ${count})`;

    ui.athlonEmoji.textContent = allOut ? "⚔️" : viewerVoting ? "📺" : "🏅";
    ui.athlonChallengeName.textContent = allOut
      ? "Fight All"
      : viewerVoting
        ? "Viewer Voting"
        : "Ready to compete";
    ui.athlonChallengeDesc.textContent =
      count >= MIN_BALLS_ATHLON
        ? allOut
          ? `All balls from every game compete together. ${challenges} challenge${challenges === 1 ? "" : "s"}, ${rejoins} rejoin${rejoins === 1 ? "" : "s"}.`
          : viewerVoting
            ? `After each challenge, the bottom half face viewer voting — except the final 3, where last place is eliminated automatically.`
          : `${count} balls = ${challenges} challenge${challenges === 1 ? "" : "s"} and ${rejoins} rejoin${rejoins === 1 ? "" : "s"}. Last place is eliminated each round. (1 rejoin every ${REJOIN_EVERY_BALLS} balls; each rejoin adds +1 challenge)`
        : `Create at least ${MIN_BALLS_ATHLON - count} more ball${MIN_BALLS_ATHLON - count === 1 ? "" : "s"}.`;

    ui.athlonStats.innerHTML = "";
    ui.athlonLog.innerHTML = "";
    if (ui.athlonRoster) {
      ui.athlonRoster.innerHTML = "";
    }
    showChallengeArena(false);
    showAthlonScoreboard(false);
    hideElimPicker();
    hideRejoinPicker();
    hideViewerVotingPicker();
    ui.athlonRejoinsInfo.textContent = `Rejoins: ${rejoins} (1 every ${REJOIN_EVERY_BALLS} balls · +1 challenge when used)`;

    ui.btnStartAthlon.hidden = count < MIN_BALLS_ATHLON;
    ui.btnStartAthlon.disabled = count < MIN_BALLS_ATHLON;
    ui.btnStartAthlon.textContent = allOut
      ? "Start Fight All"
      : viewerVoting
        ? "Start Viewer Voting"
        : "Start Algicosathlon";
    ui.btnNextChallenge.hidden = true;
    ui.btnRestartAthlon.hidden = true;
    if (ui.btnRestartFromScoreboard) {
      ui.btnRestartFromScoreboard.hidden = true;
    }
    if (ui.btnUseRejoin) {
      ui.btnUseRejoin.hidden = true;
    }
  }

  function renderAthlonStats() {
    const ath = state.athlon;
    if (!ath) {
      return;
    }
    const active = getActiveContestants().length;
    const rejoinsLeft = ath.rejoinsTotal - ath.rejoinsUsed;
    const bonusChallenges = ath.challenges.length - ath.baseChallengeCount;

    ui.athlonStats.innerHTML = [
      `<span class="athlon-stat">Challenge <strong>${Math.min(ath.challengeIndex + 1, ath.challenges.length)}</strong> / ${ath.challenges.length}</span>`,
      `<span class="athlon-stat">Active: <strong>${active}</strong></span>`,
      `<span class="athlon-stat">Eliminated: <strong>${ath.eliminated.length}</strong></span>`,
      `<span class="athlon-stat">Rejoins left: <strong>${rejoinsLeft}</strong></span>`,
      bonusChallenges > 0
        ? `<span class="athlon-stat">Extra challenges: <strong>+${bonusChallenges}</strong></span>`
        : ""
    ].join("");

    ui.athlonRejoinsInfo.textContent = `Rejoins: ${rejoinsLeft} / ${ath.rejoinsTotal} · Challenges: ${ath.challenges.length} (${ath.baseChallengeCount} base${bonusChallenges > 0 ? ` + ${bonusChallenges} from rejoins` : ""})`;
    updateUseRejoinButton();
  }

  function renderAthlonLog() {
    ui.athlonLog.innerHTML = "";
    const entries = state.athlon.log.slice(-40);
    entries.forEach(({ text, className }) => {
      const p = document.createElement("p");
      p.className = `athlon-log-entry ${className}`.trim();
      p.textContent = text;
      ui.athlonLog.appendChild(p);
    });
    ui.athlonLog.scrollTop = ui.athlonLog.scrollHeight;
  }

  function renderAthlonRoster() {
    const roster = ui.athlonRoster;
    const ath = state.athlon;
    if (!roster || !ath) {
      return;
    }
    roster.innerHTML = "";

    ath.contestants.forEach((contestant) => {
      const card = document.createElement("div");
      card.className = "roster-ball";
      if (!contestant.active) {
        card.classList.add("eliminated");
      }
      if (contestant.id === ath.winnerId) {
        card.classList.add("winner");
      }

      const ballWrap = document.createElement("div");
      ballWrap.className = "roster-ball-visual";
      const mini = buildBallNode(contestant, true);
      mini.wrap.style.setProperty("--ball-size", "52px");
      ballWrap.appendChild(mini.wrap);

      const name = document.createElement("span");
      name.className = "roster-name";
      if (contestant.active) {
        name.textContent = contestant.name;
        name.title = contestant.name;
      } else {
        name.textContent = "ELIMINATED";
        name.title = `${contestant.name} — eliminated`;
      }

      card.appendChild(ballWrap);
      card.appendChild(name);
      roster.appendChild(card);
    });
  }

  function renderAthlonLeaderboard() {
    showAthlonScoreboard(true);
    renderAthlonRoster();
    updateUseRejoinButton();
  }

  function getTiedForLastResults(results) {
    if (!results.length) {
      return [];
    }
    const worst = results[results.length - 1];
    return results.filter(
      (entry) => entry.rankScore === worst.rankScore && entry.tieBreak === worst.tieBreak
    );
  }

  function pickLastPlaceResult(results) {
    const tiedForLast = getTiedForLastResults(results);
    if (!tiedForLast.length) {
      return null;
    }
    return [...tiedForLast].sort(
      (a, b) =>
        a.tieBreak - b.tieBreak ||
        b.contestant.name.localeCompare(a.contestant.name, "en")
    )[0];
  }

  function resolveEliminationDecision(challenge, pumpEscapeCount, results) {
    const last = pickLastPlaceResult(results);
    return {
      mode: "auto",
      contestant: last?.contestant ?? null,
      reason: "last place"
    };
  }

  function afterEliminationResolved() {
    hideElimPicker();
    hideRejoinPicker();
    hideViewerVotingPicker();
    showNextChallengeButton();
    updateUseRejoinButton();
  }

  function hideElimPicker() {
    if (ui.elimPicker) {
      ui.elimPicker.hidden = true;
    }
    if (ui.elimList) {
      ui.elimList.innerHTML = "";
    }
    if (state.athlon) {
      state.athlon.eliminationCandidates = null;
    }
  }

  function renderElimPicker() {
    const ath = state.athlon;
    if (!ath || !ui.elimPicker || !ui.elimList) {
      return;
    }

    ui.elimList.innerHTML = "";
    const pool = ath.eliminationCandidates?.length
      ? [...ath.eliminationCandidates]
      : [...getActiveContestants()];

    pool.sort(
      (a, b) =>
        (b.lastRank ?? 999) - (a.lastRank ?? 999) ||
        a.name.localeCompare(b.name, "en")
    );

    pool.forEach((contestant) => {
      const li = document.createElement("li");
      li.className = "elim-option";

      const mini = buildBallNode(contestant, true);
      mini.wrap.style.setProperty("--ball-size", "36px");

      const info = document.createElement("div");
      info.className = "elim-option-info";
      const name = document.createElement("span");
      name.className = "elim-option-name";
      name.textContent = contestant.name;
      info.appendChild(name);

      const pick = document.createElement("button");
      pick.type = "button";
      pick.className = "btn danger elim-pick-btn";
      pick.textContent = "Eliminate";
      pick.addEventListener("click", () => confirmElimination(contestant.id));

      li.appendChild(mini.wrap);
      li.appendChild(info);
      li.appendChild(pick);
      ui.elimList.appendChild(li);
    });

    ui.elimPicker.hidden = false;
  }

  function confirmElimination(contestantId) {
    const ath = state.athlon;
    if (!ath || !ath.awaitingEliminationChoice) {
      return;
    }

    const contestant = getActiveContestants().find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }

    contestant.active = false;
    ath.eliminated.push(contestant);
    ath.awaitingEliminationChoice = false;
    ath.eliminationCandidates = null;

    appendAthlonLog(`✕ Eliminated ${contestant.name} (chosen by player)`, "elim");

    hideElimPicker();
    renderAthlonStats();
    renderAthlonLog();
    renderAthlonLeaderboard();

    afterEliminationResolved();
  }

  function offerEliminationChoice(candidates, reason) {
    const ath = state.athlon;
    ath.awaitingEliminationChoice = true;
    ath.eliminationCandidates = candidates;
    if (reason === "pump-timeout") {
      appendAthlonLog(
        "☝ Pump Survival: nobody escaped in time. Player chooses who is eliminated.",
        "elim"
      );
    } else {
      appendAthlonLog("☝ Tie for last place. Player chooses who is eliminated.", "elim");
    }
    renderElimPicker();
    ui.btnNextChallenge.hidden = true;
    hideRejoinPicker();
    if (ui.btnUseRejoin) {
      ui.btnUseRejoin.hidden = true;
    }
  }

  function hideViewerVotingPicker() {
    if (ui.viewerVotePicker) {
      ui.viewerVotePicker.hidden = true;
    }
    if (ui.viewerVoteOptions) {
      ui.viewerVoteOptions.innerHTML = "";
    }
    if (ui.viewerVoteLogList) {
      ui.viewerVoteLogList.innerHTML = "";
    }
    if (ui.viewerVoteTally) {
      ui.viewerVoteTally.textContent = "";
    }
    if (ui.inputViewerName) {
      ui.inputViewerName.value = "";
    }
    if (state.athlon) {
      state.athlon.viewerVotingCandidates = null;
      state.athlon.viewerVotes = {};
      state.athlon.viewerVoteEntries = [];
    }
  }

  function renderViewerVotingTally() {
    const ath = state.athlon;
    if (!ui.viewerVoteTally || !ath?.viewerVotingCandidates?.length) {
      return;
    }

    const lines = ath.viewerVotingCandidates.map((contestant) => {
      const votes = ath.viewerVotes[contestant.id] || 0;
      return `${contestant.name}: ${votes} vote${votes === 1 ? "" : "s"}`;
    });
    ui.viewerVoteTally.textContent = lines.join(" · ");
  }

  function renderViewerVoteLogList() {
    const ath = state.athlon;
    if (!ui.viewerVoteLogList || !ath) {
      return;
    }

    ui.viewerVoteLogList.innerHTML = "";
    (ath.viewerVoteEntries || []).forEach(({ voterName, contestantName }) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="voter-name">${escapeHtml(voterName)}</span> voted <span class="voted-name">${escapeHtml(contestantName)}</span>`;
      ui.viewerVoteLogList.appendChild(li);
    });
  }

  function renderViewerVotingPicker() {
    const ath = state.athlon;
    if (!ath || !ui.viewerVotePicker || !ui.viewerVoteOptions) {
      return;
    }

    ui.viewerVoteOptions.innerHTML = "";
    const pool = [...(ath.viewerVotingCandidates || [])].sort(
      (a, b) => (b.lastRank ?? 0) - (a.lastRank ?? 0) || a.name.localeCompare(b.name, "en")
    );

    pool.forEach((contestant) => {
      const li = document.createElement("li");
      li.className = "viewer-vote-option";

      const mini = buildBallNode(contestant, true);
      mini.wrap.style.setProperty("--ball-size", "36px");

      const info = document.createElement("div");
      info.className = "viewer-vote-option-info";
      const name = document.createElement("span");
      name.className = "viewer-vote-option-name";
      name.textContent = contestant.name;
      info.appendChild(name);

      const pick = document.createElement("button");
      pick.type = "button";
      pick.className = "btn accent viewer-vote-btn";
      pick.textContent = "Vote";
      pick.addEventListener("click", () => castViewerVote(contestant.id));

      li.appendChild(mini.wrap);
      li.appendChild(info);
      li.appendChild(pick);
      ui.viewerVoteOptions.appendChild(li);
    });

    renderViewerVotingTally();
    renderViewerVoteLogList();
    ui.viewerVotePicker.hidden = false;
  }

  function castViewerVote(contestantId) {
    const ath = state.athlon;
    if (!ath || !ath.awaitingViewerVoting) {
      return;
    }

    const voterName = ui.inputViewerName?.value.trim();
    if (!voterName) {
      alert(GameI18n.t("alertViewerName"));
      ui.inputViewerName?.focus();
      return;
    }

    const contestant = (ath.viewerVotingCandidates || []).find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }

    ath.viewerVotes[contestantId] = (ath.viewerVotes[contestantId] || 0) + 1;
    if (!ath.viewerVoteEntries) {
      ath.viewerVoteEntries = [];
    }
    ath.viewerVoteEntries.push({
      voterName,
      contestantId,
      contestantName: contestant.name
    });

    appendAthlonLog(`${voterName} voted ${contestant.name}`, "vote");
    if (ui.inputViewerName) {
      ui.inputViewerName.value = "";
      ui.inputViewerName.focus();
    }

    renderViewerVotingPicker();
    renderAthlonLog();
  }

  function finishViewerVoting() {
    const ath = state.athlon;
    if (!ath || !ath.awaitingViewerVoting) {
      return;
    }

    const entries = ath.viewerVoteEntries || [];
    if (!entries.length) {
      alert(GameI18n.t("alertViewerVote"));
      return;
    }

    const candidates = ath.viewerVotingCandidates || [];
    let bestVotes = -1;
    let finalists = [];

    candidates.forEach((contestant) => {
      const votes = ath.viewerVotes[contestant.id] || 0;
      if (votes > bestVotes) {
        bestVotes = votes;
        finalists = [contestant];
      } else if (votes === bestVotes) {
        finalists.push(contestant);
      }
    });

    const eliminated =
      finalists.length === 1
        ? finalists[0]
        : [...finalists].sort(
            (a, b) => (b.lastRank ?? 0) - (a.lastRank ?? 0) || a.name.localeCompare(b.name, "en")
          )[0];

    eliminated.active = false;
    ath.eliminated.push(eliminated);
    ath.awaitingViewerVoting = false;
    ath.viewerVotingCandidates = null;
    ath.viewerVotes = {};
    ath.viewerVoteEntries = [];

    appendAthlonLog(
      `✕ Eliminated ${eliminated.name} (${bestVotes} viewer vote${bestVotes === 1 ? "" : "s"})`,
      "elim"
    );

    hideViewerVotingPicker();
    renderAthlonStats();
    renderAthlonLog();
    renderAthlonLeaderboard();
    afterEliminationResolved();
  }

  function offerViewerVoting(candidates) {
    const ath = state.athlon;
    ath.awaitingViewerVoting = true;
    ath.viewerVotingCandidates = candidates;
    ath.viewerVotes = {};
    ath.viewerVoteEntries = [];

    const count = candidates.length;
    appendAthlonLog(
      `📺 Viewer voting: bottom ${count} ball${count === 1 ? "" : "s"} at risk.`,
      "highlight"
    );

    hideElimPicker();
    hideRejoinPicker();
    renderViewerVotingPicker();
    showAthlonScoreboard(true);
    ui.btnNextChallenge.hidden = true;
    if (ui.btnUseRejoin) {
      ui.btnUseRejoin.hidden = true;
    }
  }

  function hideRejoinPicker() {
    if (ui.rejoinPicker) {
      ui.rejoinPicker.hidden = true;
    }
    if (ui.rejoinList) {
      ui.rejoinList.innerHTML = "";
    }
  }

  function renderRejoinPicker() {
    const ath = state.athlon;
    if (!ath || !ui.rejoinPicker || !ui.rejoinList) {
      return;
    }

    ui.rejoinList.innerHTML = "";
    const sorted = [...ath.eliminated].sort((a, b) =>
      a.name.localeCompare(b.name, "en")
    );

    sorted.forEach((contestant) => {
      const li = document.createElement("li");
      li.className = "rejoin-option";

      const mini = buildBallNode(contestant, true);
      mini.wrap.style.setProperty("--ball-size", "36px");

      const info = document.createElement("div");
      info.className = "rejoin-option-info";
      const name = document.createElement("span");
      name.className = "rejoin-option-name";
      name.textContent = contestant.name;
      info.appendChild(name);

      const pick = document.createElement("button");
      pick.type = "button";
      pick.className = "btn accent rejoin-pick-btn";
      pick.textContent = "Choose";
      pick.addEventListener("click", () => confirmRejoin(contestant.id));

      li.appendChild(mini.wrap);
      li.appendChild(info);
      li.appendChild(pick);
      ui.rejoinList.appendChild(li);
    });

    ui.rejoinPicker.hidden = false;
  }

  function confirmRejoin(contestantId) {
    const ath = state.athlon;
    if (!ath || !ath.awaitingRejoinChoice) {
      return;
    }

    const index = ath.eliminated.findIndex((c) => c.id === contestantId);
    if (index === -1) {
      return;
    }

    const candidate = ath.eliminated.splice(index, 1)[0];
    candidate.active = true;
    ath.rejoinsUsed += 1;
    ath.awaitingRejoinChoice = false;
    appendExtraChallenge(ath);

    appendAthlonLog(
      `↩ Rejoin: ${candidate.name} returns (+1 challenge → ${ath.challenges.length} total · ${ath.rejoinsTotal - ath.rejoinsUsed} rejoins left)`,
      "rejoin"
    );

    hideRejoinPicker();
    renderAthlonStats();
    renderAthlonLog();
    renderAthlonLeaderboard();
    showNextChallengeButton();
    updateUseRejoinButton();
  }

  function cancelRejoinPicker() {
    const ath = state.athlon;
    if (!ath || !ath.awaitingRejoinChoice) {
      return;
    }

    ath.awaitingRejoinChoice = false;
    hideRejoinPicker();
    showNextChallengeButton();
    updateUseRejoinButton();
  }

  function openRejoinPicker() {
    const ath = state.athlon;
    if (!canUseRejoin()) {
      return;
    }

    ath.awaitingRejoinChoice = true;
    renderRejoinPicker();
    ui.btnNextChallenge.hidden = true;
    if (ui.btnUseRejoin) {
      ui.btnUseRejoin.hidden = true;
    }
  }

  function showNextChallengeButton() {
    const ath = state.athlon;
    if (!ath || ath.awaitingEliminationChoice || ath.awaitingRejoinChoice || ath.awaitingViewerVoting) {
      if (ui.btnNextChallenge) {
        ui.btnNextChallenge.hidden = true;
      }
      return;
    }
    ui.btnNextChallenge.hidden = false;
    ui.btnNextChallenge.textContent =
      ath.challengeIndex >= ath.challenges.length - 1 ? "View final result" : "Next challenge";
    updateUseRejoinButton();
  }

  function applyChallengeResults(runtimeBalls) {
    const ath = state.athlon;
    const active = getActiveContestants();
    const challenge = ath.challenges[ath.challengeIndex];
    const pumpEscapeCount = ath.visual?.map?.escapeOrder?.length ?? 0;
    const ballById = new Map(runtimeBalls.map((b) => [b.id, b]));

    const ranked = active
      .map((contestant) => {
        const ball = ballById.get(contestant.id);
        return {
          contestant,
          rankScore: ball?.rankScore ?? ball?.roundScore ?? 0,
          tieBreak: ball?.tieBreak ?? ball?.lane ?? 0
        };
      })
      .sort(
        (a, b) =>
          b.rankScore - a.rankScore ||
          b.tieBreak - a.tieBreak ||
          a.contestant.name.localeCompare(b.contestant.name, "en")
      );

    const results = ranked.map(({ contestant, rankScore, tieBreak }, index) => {
      const rank = index + 1;
      contestant.lastRank = rank;
      return { contestant, rank, rankScore, tieBreak };
    });

    appendAthlonLog("  Challenge standings:", "muted");

    results.forEach((entry) => {
      appendAthlonLog(`  ${entry.contestant.name}`);
    });

  // One extra challenge per extra ball: eliminate 1 each round until 1 winner remains.
    if (active.length > 1) {
      const useViewerVoting = ath.viewerVoting && active.length >= VIEWER_VOTING_MIN_ACTIVE;
      if (useViewerVoting) {
        const riskCount = getViewerVotingCandidateCount(active.length);
        const candidates = results.slice(-riskCount).map((entry) => entry.contestant);
        offerViewerVoting(candidates);
      } else {
        const decision = resolveEliminationDecision(challenge, pumpEscapeCount, results);
        if (decision.contestant) {
          decision.contestant.active = false;
          ath.eliminated.push(decision.contestant);
          appendAthlonLog(`✕ Eliminated ${decision.contestant.name}`, "elim");
          afterEliminationResolved();
        }
      }
    } else {
      hideElimPicker();
      hideRejoinPicker();
      showNextChallengeButton();
      updateUseRejoinButton();
    }

    ath.challengeRunning = false;
    renderAthlonStats();
    renderAthlonLog();
    renderAthlonLeaderboard();

    if (ui.btnRestartFromScoreboard) {
      ui.btnRestartFromScoreboard.hidden = true;
    }
  }

  function runCurrentChallenge() {
    const ath = state.athlon;
    if (ath.challengeRunning) {
      return;
    }

    const challenge = ath.challenges[ath.challengeIndex];
    const active = getActiveContestants();

    ui.athlonEmoji.textContent = challenge.emoji;
    ui.athlonChallengeName.textContent = `${challenge.name} (${ath.challengeIndex + 1}/${ath.challenges.length})`;
    ui.athlonChallengeDesc.textContent = challenge.desc;

    appendAthlonLog(`— ${challenge.emoji} ${challenge.name}: ${active.length} balls competing —`, "highlight");

    ath.challengeRunning = true;
    ui.btnNextChallenge.hidden = true;
    if (ui.btnUseRejoin) {
      ui.btnUseRejoin.hidden = true;
    }
    hideElimPicker();
    hideRejoinPicker();
    hideViewerVotingPicker();
    ath.awaitingEliminationChoice = false;
    ath.awaitingRejoinChoice = false;
    ath.awaitingViewerVoting = false;
    showAthlonScoreboard(false);

    startVisualChallenge(challenge, active, (runtimeBalls) => {
      applyChallengeResults(runtimeBalls);
    });
  }

  function finishAthlon() {
    const ath = state.athlon;
    stopVisualChallenge();
    showChallengeArena(false);
    ath.finished = true;
    ath.awaitingRejoinChoice = false;
    ath.awaitingEliminationChoice = false;
    ath.awaitingViewerVoting = false;
    hideElimPicker();
    hideRejoinPicker();
    hideViewerVotingPicker();

    const remaining = getActiveContestants();
    let winner;
    if (remaining.length === 1) {
      winner = remaining[0];
    } else if (remaining.length > 1) {
      winner = [...remaining].sort(
        (a, b) =>
          (a.lastRank ?? 999) - (b.lastRank ?? 999) ||
          a.name.localeCompare(b.name, "en")
      )[0];
    } else {
      winner = ath.contestants[0];
    }
    ath.winnerId = winner.id;

    appendAthlonLog(`🏆 ${winner.name} wins the Algicosathlon!`, "highlight");
    addBallWin(winner.id);

    ui.athlonEmoji.textContent = "🏆";
    ui.athlonChallengeName.textContent = "Champion!";
    ui.athlonChallengeDesc.textContent = `${winner.name} is the champion.`;

    renderAthlonStats();
    renderAthlonLog();
    renderAthlonLeaderboard();

    ui.btnNextChallenge.hidden = true;
    ui.btnRestartAthlon.hidden = false;
    ui.btnStartAthlon.hidden = true;
    if (ui.btnRestartFromScoreboard) {
      ui.btnRestartFromScoreboard.hidden = false;
    }
  }

  function restartAlgicosathlon() {
    stopVisualChallenge();
    const allOut = state.athlonAllOutCombat;
    state.athlon = null;
    showChallengeArena(false);
    showAthlonScoreboard(false);
    hideElimPicker();
    hideRejoinPicker();
    hideViewerVotingPicker();
    if (ui.btnRestartFromScoreboard) {
      ui.btnRestartFromScoreboard.hidden = true;
    }
    if (allOut) {
      state.balls = collectAllPartidaBalls();
    }
    renderAthlonSetup();
  }

  function startAlgicosathlon() {
    if (state.balls.length < MIN_BALLS_ATHLON) {
      alert(GameI18n.t("alertMinBalls", { n: MIN_BALLS_ATHLON }));
      return;
    }

    initAthlonState();
    const ath = state.athlon;

    appendAthlonLog(
      ath.allOutCombat
        ? `Fight All started with ${ath.ballCount} balls from ${state.partidas.length} games.`
        : ath.viewerVoting
          ? `Viewer Voting started with ${ath.ballCount} balls.`
        : `Algicosathlon started with ${ath.ballCount} balls.`,
      "highlight"
    );
    appendAthlonLog(
      `${ath.baseChallengeCount} base challenges and ${ath.rejoinsTotal} rejoin${ath.rejoinsTotal === 1 ? "" : "s"} (1 every ${REJOIN_EVERY_BALLS} balls).`,
      "muted"
    );
    appendAthlonLog("Each rejoin brings a ball back and adds +1 challenge to the total.", "muted");
    if (ath.viewerVoting) {
      appendAthlonLog(
        "After each challenge, the bottom half faces viewer voting. The final 3 skip voting — last place is eliminated automatically.",
        "muted"
      );
    } else {
      appendAthlonLog("Last place is eliminated after each challenge.", "muted");
    }

    ui.btnStartAthlon.hidden = true;
    ui.btnNextChallenge.hidden = true;
    ui.btnRestartAthlon.hidden = false;

    ui.athlonRejoinsInfo.textContent = `Rejoins: ${ath.rejoinsTotal} · Challenges: ${ath.challenges.length}`;
    renderAthlonStats();
    renderAthlonLog();
    showAthlonScoreboard(false);

    runCurrentChallenge();
  }

  function advanceAthlon() {
    const ath = state.athlon;
    if (!ath || ath.finished || ath.challengeRunning || ath.awaitingEliminationChoice || ath.awaitingRejoinChoice || ath.awaitingViewerVoting) {
      return;
    }

    if (ath.challengeIndex >= ath.challenges.length - 1) {
      finishAthlon();
      return;
    }

    ath.challengeIndex += 1;
    runCurrentChallenge();
  }

  function openAlgicosathlon() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGameShort"));
      showScreen("partidas");
      return;
    }
    if (state.balls.length < MIN_BALLS_ATHLON) {
      alert(GameI18n.t("alertMinBallsHave", { n: MIN_BALLS_ATHLON, have: state.balls.length }));
      return;
    }
    state.athlonAllOutCombat = false;
    state.athlonViewerVoting = false;
    state.athlonBallsBackup = null;
    showScreen("algicosathlon");
  }

  function openViewerVotingAlgicosathlon() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGameShort"));
      showScreen("partidas");
      return;
    }
    if (state.balls.length < MIN_BALLS_ATHLON) {
      alert(GameI18n.t("alertMinBallsViewer", { n: MIN_BALLS_ATHLON, have: state.balls.length }));
      return;
    }
    state.athlonAllOutCombat = false;
    state.athlonViewerVoting = true;
    state.athlonBallsBackup = null;
    showScreen("algicosathlon");
  }

  function openCombatirTodos() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGameShort"));
      showScreen("partidas");
      return;
    }
    if (state.partidas.length < 2) {
      alert(GameI18n.t("alertMin2Fight"));
      return;
    }

    syncBallsToCurrentPartida();
    save();

    const merged = collectAllPartidaBalls();
    if (merged.length < MIN_BALLS_ATHLON) {
      alert(GameI18n.t("alertMinBallsTotal", { n: MIN_BALLS_ATHLON, have: merged.length }));
      return;
    }

    state.athlonBallsBackup = {
      balls: state.balls,
      sessionId: state.activePartidaSessionId
    };
    state.balls = merged;
    state.activePartidaSessionId = null;
    state.athlonAllOutCombat = true;
    state.athlonViewerVoting = false;
    showScreen("algicosathlon");
  }

  function openWinStorage() {
    if (!getCurrentPartida()) {
      alert(GameI18n.t("alertOpenGameShort"));
      showScreen("partidas");
      return;
    }
    showScreen("winStorage");
  }

  function renderWinStorage() {
    if (!ui.winList) {
      return;
    }
    ui.winList.innerHTML = "";

    if (!state.balls.length) {
      ui.winEmpty.hidden = false;
      ui.winEmpty.textContent = GameI18n.t("noBallsInGame");
      return;
    }
    ui.winEmpty.hidden = true;

    const rows = state.balls
      .map((ball) => ({
        ball,
        wins: getBallWins(ball.id)
      }))
      .sort((a, b) => b.wins - a.wins || a.ball.name.localeCompare(b.ball.name, "en"));

    rows.forEach(({ ball, wins: count }) => {
      const li = document.createElement("li");
      li.className = "win-row";
      const mini = buildBallNode(ball, true);
      mini.wrap.style.setProperty("--ball-size", "40px");
      const name = document.createElement("span");
      name.textContent = ball.name;
      const badge = document.createElement("span");
      badge.className = "wins-badge";
      badge.textContent = GameI18n.t("winBadge", { n: count });
      li.appendChild(mini.wrap);
      li.appendChild(name);
      li.appendChild(badge);
      ui.winList.appendChild(li);
    });
  }

  function renderWorld() {
    const { scale } = getArenaLayout();
    const count = state.balls.length;

    ui.worldMeta.textContent = GameI18n.t("ballsMeta", { n: count });
    ui.worldHint.hidden = count > 0;
    ui.worldBalls.innerHTML = "";
    updateCombatirTodosButton();

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

  function onArenaPointerDown(event) {
    if (state.drag) {
      return;
    }
    const world = clientToWorld(event.clientX, event.clientY);
    const ball = hitTestBall(world.x, world.y);
    if (ball) {
      startDrag(event, ball.id);
    }
  }

  function onArenaPointerMove(event) {
    if (state.drag) {
      onDragMove(event);
      return;
    }
    const world = clientToWorld(event.clientX, event.clientY);
    const overBall = hitTestBall(world.x, world.y);
    ui.worldArena.style.cursor = overBall ? "grab" : "default";
  }

  function getBallById(id) {
    return state.balls.find((b) => b.id === id) || null;
  }

  function startDrag(event, ballId) {
    const ball = getBallById(ballId);
    if (!ball) {
      return;
    }

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
    if (node) {
      node.classList.add("is-dragging");
    }
    ui.worldArena.setPointerCapture(event.pointerId);
  }

  function onDragMove(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) {
      return;
    }

    const ball = getBallById(state.drag.ballId);
    if (!ball) {
      return;
    }

    const world = clientToWorld(event.clientX, event.clientY);
    ball.x = world.x - state.drag.offsetX;
    ball.y = world.y - state.drag.offsetY;
    resolveDragTouches(ball);
    pushDragSample(state.drag, ball.x, ball.y);
    updateBallNodePosition(ball);
  }

  function endDrag(event) {
    if (!state.drag) {
      return;
    }
    if (event && event.pointerId !== state.drag.pointerId) {
      return;
    }

    const ball = getBallById(state.drag.ballId);
    const node = ui.worldBalls.querySelector(`[data-id="${state.drag.ballId}"]`);

    if (ball) {
      const throwVel = velocityFromDragSamples(state.drag.samples);
      ball.vx = throwVel.vx;
      ball.vy = throwVel.vy;
      clampVelocity(ball);
      ball.dragging = false;
    }
    if (node) {
      node.classList.remove("is-dragging");
    }
    try {
      ui.worldArena.releasePointerCapture(state.drag.pointerId);
    } catch (_err) {
      /* ignore */
    }

    state.drag = null;
  }

  function stepWorld() {
    if (!state.balls.length) {
      return;
    }

    const hasActive = state.balls.some((b) => !b.dragging);
    if (!hasActive) {
      return;
    }

    state.balls.forEach((ball) => {
      if (ball.dragging) {
        return;
      }

      const gravity = getGravityStrength(ball.y);
      const damping = getDamping(ball.y);
      ball.vy += gravity;
      ball.vx *= damping;
      ball.vy *= damping;
      ball.x += ball.vx;
      ball.y += ball.vy;
      resolveWallCollision(ball);
    });

    resolveAllBallCollisions();

    state.balls.forEach((ball) => {
      if (!ball.dragging) {
        updateBallNodePosition(ball);
      }
    });
  }

  function tick() {
    stepWorld();
    state.frameId = requestAnimationFrame(tick);
  }

  function startWorldLoop() {
    if (state.running) {
      return;
    }
    state.running = true;
    state.frameId = requestAnimationFrame(tick);
  }

  function stopWorldLoop() {
    state.running = false;
    if (state.frameId) {
      cancelAnimationFrame(state.frameId);
      state.frameId = null;
    }
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
      if (!el) {
        return;
      }
      el.addEventListener("input", () => {
        if (el === ui.checkRainbow && ui.checkRainbow.checked) {
          ui.checkMonochrome.checked = false;
        }
        if (el === ui.checkMonochrome && ui.checkMonochrome.checked) {
          ui.checkRainbow.checked = false;
        }
        readDraft();
      });
    });
  }

  function startBackgroundMusic() {
    if (window.AlgicosathlonMusic) {
      window.AlgicosathlonMusic.start();
    }
  }

  function setupBackToAdminButton() {
    const btn = document.getElementById("btnBackToAdmin");
    if (!btn) {
      return;
    }

    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    const fromAdmin = /\/Juegos\//i.test(path);

    if (fromAdmin) {
      btn.hidden = false;
    }
  }

  function bindEvents() {
    setupBackToAdminButton();

    document.getElementById("btnGoPartidas").addEventListener("click", () => {
      startBackgroundMusic();
      if (state.currentPartidaId && getCurrentPartida()) {
        if (!state.activePartidaSessionId) {
          loadBallsFromPartida();
        }
        const partida = getCurrentPartida();
        ui.worldTitle.textContent = partida.name;
        showScreen("world");
        return;
      }
      renderPartidaList();
      showScreen("partidas");
    });
    document.getElementById("btnBackTitle").addEventListener("click", () => showScreen("title"));

    if (ui.btnGuardar) {
      ui.btnGuardar.addEventListener("click", openGuardar);
    }
    document.getElementById("btnBackFromGuardar")?.addEventListener("click", () => showScreen("make"));
    ui.btnPickFolder?.addEventListener("click", pickSaveFolder);
    ui.btnSaveToFolder?.addEventListener("click", savePelotitasToFolder);
    ui.btnLoadFromFolder?.addEventListener("click", loadPelotitasFromFolder);
    ui.btnDownloadBalls?.addEventListener("click", downloadPelotitasFile);
    ui.btnUploadBalls?.addEventListener("click", () => ui.inputUploadBalls?.click());
    ui.inputUploadBalls?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      uploadPelotitasFile(file);
      event.target.value = "";
    });

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

    document.getElementById("btnAlgicosathlon").addEventListener("click", openAlgicosathlon);
    document.getElementById("btnViewerVoting")?.addEventListener("click", openViewerVotingAlgicosathlon);
    if (ui.btnCombatirTodos) {
      ui.btnCombatirTodos.addEventListener("click", openCombatirTodos);
    }
    document.getElementById("btnWinStorage").addEventListener("click", openWinStorage);
    document.getElementById("btnBackFromAthlon").addEventListener("click", () => {
      stopVisualChallenge();
      state.athlon = null;
      state.athlonViewerVoting = false;
      restoreAfterAllOutCombat();
      showScreen("world");
    });
    document.getElementById("btnBackFromWins").addEventListener("click", () => showScreen("world"));
    ui.btnStartAthlon.addEventListener("click", startAlgicosathlon);
    ui.btnNextChallenge.addEventListener("click", advanceAthlon);
    if (ui.btnSkipRejoin) {
      ui.btnSkipRejoin.addEventListener("click", cancelRejoinPicker);
    }
    if (ui.btnUseRejoin) {
      ui.btnUseRejoin.addEventListener("click", openRejoinPicker);
    }
    if (ui.btnFinishViewerVoting) {
      ui.btnFinishViewerVoting.addEventListener("click", finishViewerVoting);
    }
    ui.btnRestartAthlon.addEventListener("click", restartAlgicosathlon);
    if (ui.btnRestartFromScoreboard) {
      ui.btnRestartFromScoreboard.addEventListener("click", restartAlgicosathlon);
    }
    document.getElementById("btnCreateBall").addEventListener("click", openMake);
    document.getElementById("btnBackWorld").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnCancelMake").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnSaveBall").addEventListener("click", saveBall);

    ui.worldArena.addEventListener("pointerdown", onArenaPointerDown);
    ui.worldArena.addEventListener("pointermove", onArenaPointerMove);
    ui.worldArena.addEventListener("pointerup", endDrag);
    ui.worldArena.addEventListener("pointercancel", endDrag);

    window.addEventListener("resize", () => {
      if (ui.screenWorld.classList.contains("active")) {
        renderWorld();
      }
    });

    bindMakeInputs();

    window.addEventListener("beforeunload", () => {
      save();
    });
  }

  async function boot() {
    try {
      load();
      bindEvents();
    } catch (err) {
      console.error("Error starting game:", err);
    }

    showScreen("title");
    GameI18n.onChange(refreshAlgicosathlonI18n);
    document.body.addEventListener("click", startBackgroundMusic, { once: true });
    document.body.addEventListener("keydown", startBackgroundMusic, { once: true });

    try {
      await initFileSaveFolder();
    } catch (_err) {
      await clearStoredDirectoryHandle();
    }
  }

  boot().catch((err) => {
    console.error("Critical startup error:", err);
    try {
      showScreen("title");
    } catch (_e) {
      /* pantalla de título aunque falle el resto */
    }
  });
})();
