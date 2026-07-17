(function () {
  "use strict";

  GameI18n.init("ruleta-especial");

  const STORAGE_KEY = "ruleta-especial-v1";
  const COLORS = [
    "#ff6b8a", "#ffb347", "#4cc9f0", "#80ed99", "#c77dff",
    "#f72585", "#ffd166", "#48cae4", "#adb5bd", "#ff8fab"
  ];

  const state = {
    options: [],
    history: [],
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
    winnerLine: document.getElementById("winnerLine"),
    optionCount: document.getElementById("optionCount"),
    btnSpin: document.getElementById("btnSpin")
  };

  const ctx = ui.canvas.getContext("2d");

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.options = Array.isArray(data.options)
        ? data.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 40)
        : [];
      state.history = Array.isArray(data.history) ? data.history.slice(0, 50) : [];
    } catch (_err) {
      state.options = [];
      state.history = [];
    }
  }

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ options: state.options, history: state.history })
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

  function renderOptions() {
    ui.optionList.innerHTML = "";
    ui.optionEmpty.hidden = state.options.length > 0;
    ui.optionCount.textContent = GameI18n.t("optionCount", { n: state.options.length });

    state.options.forEach((text, index) => {
      const li = document.createElement("li");
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = COLORS[index % COLORS.length];
      const label = document.createElement("span");
      label.textContent = text;
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn-del";
      del.textContent = "×";
      del.title = GameI18n.t("remove");
      del.disabled = state.spinning;
      del.addEventListener("click", () => {
        if (state.spinning) return;
        state.options.splice(index, 1);
        save();
        renderAll();
        drawWheel();
      });
      li.append(swatch, label, del);
      ui.optionList.appendChild(li);
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
    state.options.push(text.slice(0, 48));
    ui.optionInput.value = "";
    save();
    renderAll();
    drawWheel();
  }

  function normalizeAngle(angle) {
    let a = angle % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
  }

  /**
   * El puntero está arriba (ángulo mundo -PI/2).
   * Los sectores se dibujan desde arriba, en sentido horario.
   */
  function winnerIndexFromRotation(rotation, count) {
    if (count <= 0) return 0;
    const slice = (Math.PI * 2) / count;
    // Ángulo local bajo el puntero: qué parte de la ruleta queda arriba.
    const underPointer = normalizeAngle(-rotation);
    return Math.min(count - 1, Math.floor(underPointer / slice));
  }

  function rotationForIndex(index, count, offsetInsideSlice) {
    const slice = (Math.PI * 2) / count;
    // underPointer = -rotation (mod 2PI) = index*slice + offset
    // rotation = -(index*slice + offset)
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
      state.options.forEach((text, i) => {
        const start = -Math.PI / 2 + i * slice;
        const end = start + slice;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
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
    state.history.unshift({ text: winner, at: Date.now() });
    state.history = state.history.slice(0, 50);
    save();
    ui.winnerLine.textContent = GameI18n.t("winner", { name: winner });
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
    ui.winnerLine.textContent = GameI18n.t("spinning");

    const count = state.options.length;
    const slice = (Math.PI * 2) / count;
    const winnerIndex = Math.floor(Math.random() * count);
    const offsetInside = slice * (0.2 + Math.random() * 0.6);
    const baseTarget = rotationForIndex(winnerIndex, count, offsetInside);

    // Girar varias vueltas hacia adelante hasta el ángulo objetivo.
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

      // Ajuste final exacto y ganador correcto según el triángulo.
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
    document.getElementById("btnPlay").addEventListener("click", () => showScreen("Game"));
    document.getElementById("btnBackTitle").addEventListener("click", () => {
      if (state.spinning) return;
      showScreen("Title");
    });
    document.getElementById("btnSpin").addEventListener("click", spin);
    document.getElementById("btnClearHistory").addEventListener("click", () => {
      state.history = [];
      save();
      renderHistory();
    });
    ui.optionInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (!state.spinning) addOption(ui.optionInput.value);
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
