(function () {
  "use strict";

  GameI18n.init("ruleta-especial");

  const STORAGE_KEY = "ruleta-especial-v2";
  const COLORS = [
    "#ff6b8a", "#ffb347", "#4cc9f0", "#80ed99", "#c77dff",
    "#f72585", "#ffd166", "#48cae4", "#adb5bd", "#ff8fab"
  ];

  const state = {
    options: [],
    history: [],
    saves: [],
    rotation: 0,
    spinning: false,
    animId: 0
  };

  const ui = {
    canvas: document.getElementById("wheelCanvas"),
    optionInput: document.getElementById("optionInput"),
    optionList: document.getElementById("optionList"),
    optionEmpty: document.getElementById("optionEmpty"),
    historyList: document.getElementById("historyList"),
    historyEmpty: document.getElementById("historyEmpty"),
    savesList: document.getElementById("savesList"),
    savesEmpty: document.getElementById("savesEmpty"),
    saveNameInput: document.getElementById("saveNameInput"),
    winnerLine: document.getElementById("winnerLine"),
    optionCount: document.getElementById("optionCount"),
    btnSpin: document.getElementById("btnSpin"),
    btnSaveWheel: document.getElementById("btnSaveWheel")
  };

  const ctx = ui.canvas.getContext("2d");

  function uid() {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function isHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || ""));
  }

  function defaultColor(index) {
    return COLORS[index % COLORS.length];
  }

  function normalizeOption(raw, index) {
    if (typeof raw === "string") {
      const text = raw.trim();
      if (!text) return null;
      return { text: text.slice(0, 48), color: defaultColor(index) };
    }
    if (!raw || typeof raw !== "object") return null;
    const text = String(raw.text || "").trim();
    if (!text) return null;
    return {
      text: text.slice(0, 48),
      color: isHexColor(raw.color) ? raw.color : defaultColor(index)
    };
  }

  function cloneOptions(list) {
    return (Array.isArray(list) ? list : [])
      .map((o, i) => normalizeOption(o, i))
      .filter(Boolean)
      .slice(0, 40);
  }

  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const legacy = localStorage.getItem("ruleta-especial-v1");
        if (legacy) raw = legacy;
      }
      if (!raw) return;
      const data = JSON.parse(raw);
      state.options = cloneOptions(data.options);
      state.history = Array.isArray(data.history) ? data.history.slice(0, 50) : [];
      state.saves = Array.isArray(data.saves)
        ? data.saves
            .map((s) => ({
              id: String(s.id || uid()),
              name: String(s.name || "").trim().slice(0, 32) || "Ruleta",
              options: cloneOptions(s.options),
              at: Number(s.at) || Date.now()
            }))
            .filter((s) => s.options.length > 0)
            .slice(0, 30)
        : [];
    } catch (_err) {
      state.options = [];
      state.history = [];
      state.saves = [];
    }
  }

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        options: state.options,
        history: state.history,
        saves: state.saves
      })
    );
  }

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((el) => {
      el.classList.toggle("active", el.id === `screen${name}`);
    });
    if (name === "Game") {
      renderAll();
      drawWheel();
    }
  }

  function optionLabel(opt) {
    return typeof opt === "string" ? opt : opt.text;
  }

  function optionColor(opt, index) {
    if (opt && isHexColor(opt.color)) return opt.color;
    return defaultColor(index);
  }

  function renderOptions() {
    ui.optionList.innerHTML = "";
    ui.optionEmpty.hidden = state.options.length > 0;
    ui.optionCount.textContent = GameI18n.t("optionCount", { n: state.options.length });

    state.options.forEach((opt, index) => {
      const li = document.createElement("li");

      const colorWrap = document.createElement("label");
      colorWrap.className = "color-wrap";
      colorWrap.title = GameI18n.t("changeColor");

      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = optionColor(opt, index);

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = optionColor(opt, index);
      colorInput.disabled = state.spinning;
      colorInput.setAttribute("aria-label", GameI18n.t("changeColor"));
      colorInput.addEventListener("input", () => {
        if (state.spinning) return;
        state.options[index].color = colorInput.value;
        swatch.style.background = colorInput.value;
        persist();
        drawWheel();
      });

      colorWrap.append(swatch, colorInput);

      const label = document.createElement("span");
      label.textContent = optionLabel(opt);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn-del";
      del.textContent = "×";
      del.title = GameI18n.t("remove");
      del.disabled = state.spinning;
      del.addEventListener("click", () => {
        if (state.spinning) return;
        state.options.splice(index, 1);
        persist();
        renderAll();
        drawWheel();
      });

      li.append(colorWrap, label, del);
      ui.optionList.appendChild(li);
    });
  }

  function renderSaves() {
    ui.savesList.innerHTML = "";
    ui.savesEmpty.hidden = state.saves.length > 0;
    ui.btnSaveWheel.disabled = state.spinning;
    ui.saveNameInput.disabled = state.spinning;

    state.saves.forEach((save) => {
      const li = document.createElement("li");
      const info = document.createElement("div");
      info.className = "save-info";
      const name = document.createElement("strong");
      name.textContent = save.name;
      const meta = document.createElement("small");
      meta.textContent = GameI18n.t("saveMeta", {
        n: save.options.length,
        when: new Date(save.at).toLocaleString()
      });
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "save-actions";

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "btn ghost small";
      loadBtn.textContent = GameI18n.t("loadSave");
      loadBtn.disabled = state.spinning;
      loadBtn.addEventListener("click", () => loadSave(save.id));

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-del";
      delBtn.textContent = "×";
      delBtn.title = GameI18n.t("deleteSave");
      delBtn.disabled = state.spinning;
      delBtn.addEventListener("click", () => deleteSave(save.id));

      actions.append(loadBtn, delBtn);
      li.append(info, actions);
      ui.savesList.appendChild(li);
    });
  }

  function renderHistory() {
    ui.historyList.innerHTML = "";
    ui.historyEmpty.hidden = state.history.length > 0;
    state.history.forEach((item) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = item.text;
      const when = document.createElement("small");
      when.style.color = "var(--muted)";
      when.textContent = new Date(item.at).toLocaleString();
      li.append(label, when);
      ui.historyList.appendChild(li);
    });
  }

  function renderAll() {
    renderOptions();
    renderSaves();
    renderHistory();
    ui.btnSpin.disabled = state.options.length < 1 || state.spinning;
    ui.optionInput.disabled = state.spinning;
  }

  function addOption(raw) {
    const text = String(raw || "").trim();
    if (!text) return;
    if (state.options.length >= 40) {
      alert(GameI18n.t("alertMaxOptions"));
      return;
    }
    state.options.push({
      text: text.slice(0, 48),
      color: defaultColor(state.options.length)
    });
    ui.optionInput.value = "";
    persist();
    renderAll();
    drawWheel();
  }

  function saveCurrentWheel() {
    if (state.spinning) return;
    if (!state.options.length) {
      alert(GameI18n.t("alertNeedOptions"));
      return;
    }
    const name = String(ui.saveNameInput.value || "").trim().slice(0, 32);
    if (!name) {
      alert(GameI18n.t("alertSaveName"));
      return;
    }
    const existing = state.saves.findIndex(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    const entry = {
      id: existing >= 0 ? state.saves[existing].id : uid(),
      name,
      options: cloneOptions(state.options),
      at: Date.now()
    };
    if (existing >= 0) state.saves[existing] = entry;
    else state.saves.unshift(entry);
    state.saves = state.saves.slice(0, 30);
    ui.saveNameInput.value = "";
    persist();
    renderSaves();
  }

  function loadSave(id) {
    if (state.spinning) return;
    const save = state.saves.find((s) => s.id === id);
    if (!save) return;
    state.options = cloneOptions(save.options);
    state.rotation = 0;
    ui.winnerLine.textContent = "";
    persist();
    renderAll();
    drawWheel();
  }

  function deleteSave(id) {
    if (state.spinning) return;
    const save = state.saves.find((s) => s.id === id);
    if (!save) return;
    if (!confirm(GameI18n.t("confirmDeleteSave", { name: save.name }))) return;
    state.saves = state.saves.filter((s) => s.id !== id);
    persist();
    renderSaves();
  }

  function normalizeAngle(angle) {
    let a = angle % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
  }

  function winnerIndexFromRotation(rotation, count) {
    if (count <= 0) return 0;
    const slice = (Math.PI * 2) / count;
    const underPointer = normalizeAngle(-rotation);
    return Math.min(count - 1, Math.floor(underPointer / slice));
  }

  function rotationForIndex(index, count, offsetInsideSlice) {
    const slice = (Math.PI * 2) / count;
    return -((index * slice) + offsetInsideSlice);
  }

  function drawWheel() {
    const size = ui.canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.46;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.rotation);

    const n = Math.max(state.options.length, 1);
    const slice = (Math.PI * 2) / n;

    if (!state.options.length) {
      ctx.fillStyle = "#2a1a3a";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b9a8cf";
      ctx.font = "bold 16px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(GameI18n.t("noOptions"), 0, 0);
    } else {
      state.options.forEach((opt, i) => {
        const start = -Math.PI / 2 + i * slice;
        const end = start + slice;
        const text = optionLabel(opt);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = optionColor(opt, i);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.28)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.rotate(start + slice / 2);
        ctx.fillStyle = "#1a1020";
        ctx.font = `bold ${Math.max(11, Math.min(16, 130 / n))}px Segoe UI, sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        const label = text.length > 14 ? `${text.slice(0, 13)}…` : text;
        ctx.fillText(label, radius - 16, 0);
        ctx.restore();
      });
    }

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#fff6e0";
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.6)";
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function finishSpin(winnerIndex) {
    state.spinning = false;
    const winner = state.options[winnerIndex];
    if (!winner) {
      renderAll();
      return;
    }
    const text = optionLabel(winner);
    state.history.unshift({ text, at: Date.now() });
    state.history = state.history.slice(0, 50);
    persist();
    ui.winnerLine.textContent = GameI18n.t("winner", { name: text });
    renderAll();
  }

  function spin() {
    if (state.spinning) return;
    if (state.options.length < 1) {
      alert(GameI18n.t("alertNeedOptions"));
      return;
    }

    state.spinning = true;
    ui.btnSpin.disabled = true;
    ui.optionInput.disabled = true;
    ui.btnSaveWheel.disabled = true;
    ui.saveNameInput.disabled = true;
    ui.winnerLine.textContent = GameI18n.t("spinning");
    renderOptions();
    renderSaves();

    const count = state.options.length;
    const slice = (Math.PI * 2) / count;
    const winnerIndex = Math.floor(Math.random() * count);
    const offsetInside = slice * (0.2 + Math.random() * 0.6);
    const baseTarget = rotationForIndex(winnerIndex, count, offsetInside);

    const current = normalizeAngle(state.rotation);
    const targetNorm = normalizeAngle(baseTarget);
    let forward = targetNorm - current;
    if (forward <= 0.01) forward += Math.PI * 2;
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const targetRotation = state.rotation + forward + extraTurns * Math.PI * 2;

    const start = state.rotation;
    const delta = targetRotation - start;
    const duration = 4200 + Math.random() * 1000;
    const t0 = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      state.rotation = start + delta * easeOut(t);
      drawWheel();
      if (t < 1) {
        state.animId = requestAnimationFrame(frame);
        return;
      }

      state.rotation = targetRotation;
      drawWheel();
      const idx = winnerIndexFromRotation(state.rotation, state.options.length);
      finishSpin(idx);
    }

    state.animId = requestAnimationFrame(frame);
  }

  function setupBackAdmin() {
    const btn = document.getElementById("btnBackAdmin");
    if (!btn) return;
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    btn.hidden = !/\/Juegos\//i.test(path);
  }

  function bind() {
    setupBackAdmin();
    document.getElementById("btnPlay").addEventListener("click", () => {
      if (window.GameMusic) window.GameMusic.start();
      showScreen("Game");
    });
    document.getElementById("btnBackTitle").addEventListener("click", () => {
      if (state.spinning) return;
      showScreen("Title");
    });
    document.getElementById("btnSpin").addEventListener("click", spin);
    document.getElementById("btnSaveWheel").addEventListener("click", saveCurrentWheel);
    document.getElementById("btnClearHistory").addEventListener("click", () => {
      state.history = [];
      persist();
      renderHistory();
    });
    ui.optionInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (!state.spinning) addOption(ui.optionInput.value);
      }
    });
    ui.saveNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveCurrentWheel();
      }
    });
    GameI18n.onChange(() => {
      GameI18n.applyDom();
      renderAll();
      drawWheel();
    });
  }

  load();
  bind();
  drawWheel();
})();
