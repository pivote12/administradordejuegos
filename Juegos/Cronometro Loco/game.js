(function () {
  "use strict";

  GameI18n.init("cronometro-loco");

  const STORAGE_KEY = "cronometro-loco-v1";
  const DEFAULT_WAIT_MS = 1000;
  const START_SECONDS = 10 * 60; // 10:00

  const EFFECT_DEFS = [
    { id: "plus1", labelKey: "fxPlus1", defaultChance: 10 },
    { id: "double", labelKey: "fxDouble", defaultChance: 5 },
    { id: "swap", labelKey: "fxSwap", defaultChance: 5 },
    { id: "minus10", labelKey: "fxMinus10", defaultChance: 5 },
    { id: "half", labelKey: "fxHalf", defaultChance: 5 },
    { id: "freeze3", labelKey: "fxFreeze", defaultChance: 5 },
    { id: "waitHalf", labelKey: "fxWaitHalf", defaultChance: 5 },
    { id: "waitDouble", labelKey: "fxWaitDouble", defaultChance: 5 },
    { id: "waitNormal", labelKey: "fxWaitNormal", defaultChance: 5 },
    { id: "plus60", labelKey: "fxPlus60", defaultChance: 5 }
  ];

  const state = {
    effects: EFFECT_DEFS.map((def) => ({
      id: def.id,
      labelKey: def.labelKey,
      enabled: false,
      chance: def.defaultChance
    })),
    seconds: START_SECONDS,
    running: false,
    waitMs: DEFAULT_WAIT_MS,
    freezeUntil: 0,
    timerId: null,
    lastEvent: ""
  };

  const ui = {
    effectsList: document.getElementById("effectsList"),
    defaultChanceText: document.getElementById("defaultChanceText"),
    chanceWarn: document.getElementById("chanceWarn"),
    timerDisplay: document.getElementById("timerDisplay"),
    tickPace: document.getElementById("tickPace"),
    eventLine: document.getElementById("eventLine"),
    btnToggle: document.getElementById("btnToggle"),
    chanceSummary: document.getElementById("chanceSummary")
  };

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function clampChance(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(99.9, Math.max(1, round1(n)));
  }

  function othersChance(exceptId) {
    return state.effects.reduce((sum, fx) => {
      if (!fx.enabled || fx.id === exceptId) return sum;
      return sum + clampChance(fx.chance);
    }, 0);
  }

  function usedChance() {
    return othersChance(null);
  }

  function residualChance() {
    return Math.max(0, round1(100 - usedChance()));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!Array.isArray(data.effects)) return;
      state.effects.forEach((fx) => {
        const saved = data.effects.find((e) => e.id === fx.id);
        if (!saved) return;
        fx.enabled = !!saved.enabled;
        fx.chance = clampChance(saved.chance ?? fx.chance);
      });
      enforceBudget();
    } catch (_err) {
      /* ignore */
    }
  }

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        effects: state.effects.map((fx) => ({
          id: fx.id,
          enabled: fx.enabled,
          chance: fx.chance
        }))
      })
    );
  }

  function enforceBudget() {
    let used = usedChance();
    if (used <= 100) {
      ui.chanceWarn.hidden = true;
      return true;
    }
    ui.chanceWarn.hidden = false;
    // Recorta desde el final hasta entrar en 100%.
    for (let i = state.effects.length - 1; i >= 0 && used > 100; i -= 1) {
      const fx = state.effects[i];
      if (!fx.enabled) continue;
      const overflow = used - 100;
      const next = round1(fx.chance - overflow);
      if (next < 1) {
        fx.enabled = false;
      } else {
        fx.chance = next;
      }
      used = usedChance();
    }
    return usedChance() <= 100;
  }

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((el) => {
      el.classList.toggle("active", el.id === `screen${name}`);
    });
    if (name === "Settings") renderSettings();
    if (name === "Play") {
      renderTimer();
      renderSummary();
      updateToggleLabel();
    }
  }

  function renderSettings() {
    const rem = residualChance();
    ui.defaultChanceText.textContent = GameI18n.t("defaultChance", { n: rem });
    ui.chanceWarn.hidden = usedChance() <= 100;
    ui.effectsList.innerHTML = "";

    state.effects.forEach((fx) => {
      const row = document.createElement("div");
      row.className = "effect-row";

      const checkLabel = document.createElement("label");
      checkLabel.className = "check";
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = fx.enabled;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = GameI18n.t(fx.labelKey);
      checkLabel.append(check, name);

      const chanceBox = document.createElement("div");
      chanceBox.className = "chance-box";
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.max = "99.9";
      input.step = "0.1";
      input.value = String(fx.chance);
      input.disabled = !fx.enabled;
      input.setAttribute("aria-label", "%");
      const pct = document.createElement("span");
      pct.textContent = "%";
      chanceBox.append(input, pct);

      check.addEventListener("change", () => {
        if (check.checked) {
          const room = round1(100 - othersChance(fx.id));
          if (room < 1) {
            check.checked = false;
            fx.enabled = false;
            alert(GameI18n.t("chanceOverflow"));
            return;
          }
          fx.enabled = true;
          fx.chance = Math.min(clampChance(fx.chance), room);
          input.value = String(fx.chance);
          input.disabled = false;
        } else {
          fx.enabled = false;
          input.disabled = true;
        }
        enforceBudget();
        save();
        renderSettings();
      });

      input.addEventListener("change", () => {
        if (!fx.enabled) return;
        const room = round1(100 - othersChance(fx.id));
        fx.chance = Math.min(clampChance(input.value), Math.max(1, room));
        enforceBudget();
        save();
        renderSettings();
      });

      row.append(checkLabel, chanceBox);
      ui.effectsList.appendChild(row);
    });
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function formatWaitSeconds(ms) {
    const sec = Math.max(0.05, ms / 1000);
    if (Number.isInteger(sec)) return String(sec);
    return String(round1(sec));
  }

  function renderTickPace() {
    if (!ui.tickPace) return;
    ui.tickPace.textContent = GameI18n.t("tickPace", { n: formatWaitSeconds(state.waitMs) });
  }

  function renderTimer() {
    ui.timerDisplay.textContent = formatTime(state.seconds);
    renderTickPace();
  }

  function setEvent(text) {
    state.lastEvent = text;
    ui.eventLine.textContent = text;
  }

  function renderSummary() {
    const rem = residualChance();
    const lines = [`${rem}% → ${GameI18n.t("fxMinus1")}`];
    state.effects.forEach((fx) => {
      if (fx.enabled) {
        lines.push(`${clampChance(fx.chance)}% → ${GameI18n.t(fx.labelKey)}`);
      }
    });
    ui.chanceSummary.innerHTML = `<strong>${GameI18n.t("activeChances")}</strong><ul>${lines
      .map((l) => `<li>${l}</li>`)
      .join("")}</ul>`;
  }

  function pickEffect() {
    const roll = Math.random() * 100;
    let cursor = 0;
    for (const fx of state.effects) {
      if (!fx.enabled) continue;
      cursor += clampChance(fx.chance);
      if (roll < cursor) return fx.id;
    }
    return "minus1";
  }

  function applyEffect(id) {
    switch (id) {
      case "plus1":
        state.seconds += 1;
        setEvent(GameI18n.t("evtPlus1"));
        break;
      case "double":
        state.seconds *= 2;
        setEvent(GameI18n.t("evtDouble"));
        break;
      case "swap": {
        const mm = Math.floor(state.seconds / 60);
        const ss = state.seconds % 60;
        state.seconds = ss * 60 + mm;
        setEvent(GameI18n.t("evtSwap"));
        break;
      }
      case "minus10":
        state.seconds = Math.max(0, state.seconds - 10);
        setEvent(GameI18n.t("evtMinus10"));
        break;
      case "half":
        state.seconds = Math.floor(state.seconds / 2);
        setEvent(GameI18n.t("evtHalf"));
        break;
      case "freeze3":
        state.freezeUntil = Date.now() + 3000;
        setEvent(GameI18n.t("evtFreeze"));
        break;
      case "waitHalf":
        state.waitMs = DEFAULT_WAIT_MS / 2;
        setEvent(GameI18n.t("evtWaitHalf"));
        break;
      case "waitDouble":
        state.waitMs = DEFAULT_WAIT_MS * 2;
        setEvent(GameI18n.t("evtWaitDouble"));
        break;
      case "waitNormal":
        state.waitMs = DEFAULT_WAIT_MS;
        setEvent(GameI18n.t("evtWaitNormal"));
        break;
      case "plus60":
        state.seconds += 60;
        setEvent(GameI18n.t("evtPlus60"));
        break;
      case "minus1":
      default:
        state.seconds = Math.max(0, state.seconds - 1);
        setEvent(GameI18n.t("evtMinus1"));
        break;
    }
    renderTimer();
  }

  function clearTick() {
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
  }

  function scheduleNext() {
    clearTick();
    if (!state.running) return;

    const now = Date.now();
    if (now < state.freezeUntil) {
      state.timerId = setTimeout(scheduleNext, Math.min(120, state.freezeUntil - now));
      return;
    }

    state.timerId = setTimeout(() => {
      if (!state.running) return;
      if (Date.now() < state.freezeUntil) {
        scheduleNext();
        return;
      }
      applyEffect(pickEffect());
      scheduleNext();
    }, Math.max(50, state.waitMs));
  }

  function startTimer() {
    if (state.running) return;
    state.running = true;
    updateToggleLabel();
    setEvent(GameI18n.t("running"));
    scheduleNext();
  }

  function stopTimer() {
    state.running = false;
    clearTick();
    updateToggleLabel();
    setEvent(GameI18n.t("paused"));
  }

  function resetTimer() {
    stopTimer();
    state.seconds = START_SECONDS;
    state.waitMs = DEFAULT_WAIT_MS;
    state.freezeUntil = 0;
    renderTimer();
    setEvent(GameI18n.t("waiting"));
  }

  function updateToggleLabel() {
    ui.btnToggle.textContent = state.running
      ? GameI18n.t("pauseTimer")
      : GameI18n.t("startTimer");
  }

  function openPlay(autoStart) {
    resetTimer();
    renderSummary();
    showScreen("Play");
    if (autoStart) startTimer();
  }

  function setupBackAdmin() {
    const btn = document.getElementById("btnBackAdmin");
    if (!btn) return;
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    btn.hidden = !/\/Juegos\//i.test(path);
  }

  function bind() {
    setupBackAdmin();
    document.getElementById("btnPlay").addEventListener("click", () => openPlay(true));
    document.getElementById("btnSettings").addEventListener("click", () => showScreen("Settings"));
    document.getElementById("btnBackFromSettings").addEventListener("click", () => showScreen("Title"));
    document.getElementById("btnBackFromPlay").addEventListener("click", () => {
      stopTimer();
      showScreen("Title");
    });
    document.getElementById("btnToggle").addEventListener("click", () => {
      if (state.running) stopTimer();
      else startTimer();
    });
    document.getElementById("btnReset").addEventListener("click", () => {
      resetTimer();
      renderSummary();
    });
    GameI18n.onChange(() => {
      GameI18n.applyDom();
      if (document.getElementById("screenSettings").classList.contains("active")) renderSettings();
      if (document.getElementById("screenPlay").classList.contains("active")) {
        renderSummary();
        renderTickPace();
        updateToggleLabel();
        if (state.lastEvent) ui.eventLine.textContent = state.lastEvent;
      }
    });
  }

  load();
  bind();
})();
