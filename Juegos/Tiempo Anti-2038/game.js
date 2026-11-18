(function () {
  "use strict";

  const BIT_COUNT = 210;
  const Y2038_UNIX = 2147483647n;
  const RESET_UNIX = 2n ** BigInt(BIT_COUNT);
  const EPOCH_START_MS = Date.UTC(1210, 2, 14, 7, 30, 0);
  const SYNC_KEY = "tiempo-anti-2038-sync-v1";

  const lightsEl = document.getElementById("lights");
  const realDateEl = document.getElementById("realDate");
  const unixNumberEl = document.getElementById("unixNumber");
  const sinceStartEl = document.getElementById("sinceStart");
  const y2038StatusEl = document.getElementById("y2038Status");
  const bitsReadoutEl = document.getElementById("bitsReadout");
  const milestoneEl = document.getElementById("milestone");
  const phoneTimeEl = document.getElementById("phoneTime");
  const phoneDateEl = document.getElementById("phoneDate");
  const phoneUnixEl = document.getElementById("phoneUnix");
  const phoneSystemEl = document.getElementById("phoneSystem");
  const phoneSyncEl = document.getElementById("phoneSync");
  const btnControlTime = document.getElementById("btnControlTime");
  const lightsWrap = document.getElementById("lightsWrap");
  const lightsHint = document.getElementById("lightsHint");
  const controlHint = document.getElementById("controlHint");

  let timerId = 0;
  let lightNodes = [];
  let wakeLock = null;
  let phoneMode = false;
  let controlMode = false;
  /** @type {boolean[]} */
  let manualBits = [];
  /** @type {{ atMs: number, speech: string, fired: boolean } | null} */
  let alarm = null;
  let alarmAudioCtx = null;

  /** @type {{ unixMs: number, perf: number, source: string } | null} */
  let syncAnchor = null;

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    document.body.classList.toggle("phone-mode", id === "screenPhone");
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatDateParts(date) {
    return (
      pad(date.getDate()) + "/" +
      pad(date.getMonth() + 1) + "/" +
      date.getFullYear() + " " +
      pad(date.getHours()) + ":" +
      pad(date.getMinutes()) + ":" +
      pad(date.getSeconds())
    );
  }

  function formatClockTime(date) {
    return pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
  }

  function formatClockDate(date) {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return days[date.getDay()] + " " + date.getDate() + " de " + months[date.getMonth()] + " de " + date.getFullYear();
  }

  function formatBigIntGrouped(value) {
    const neg = value < 0n;
    let digits = (neg ? -value : value).toString();
    const parts = [];
    while (digits.length > 3) {
      parts.unshift(digits.slice(-3));
      digits = digits.slice(0, -3);
    }
    if (digits) parts.unshift(digits);
    return (neg ? "-" : "") + parts.join(".");
  }

  function systemLooksBroken(date) {
    const year = date.getFullYear();
    // Overflow 32-bit típico: ~13/12/1901. También años absurdamente viejos.
    return year < 1971 || year === 1901 || year === 1902;
  }

  function saveSync(unixMs, source) {
    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify({
        unixMs,
        savedAtPerf: performance.now(),
        savedAtWall: Date.now(),
        source
      }));
    } catch (_err) {
      /* ignore */
    }
  }

  function loadSyncFallback() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SYNC_KEY) || "null");
      if (!parsed || typeof parsed.unixMs !== "number") return null;
      // Si el sistema no está roto, preferimos re-sincronizar con Date.
      if (!systemLooksBroken(new Date())) return null;
      const elapsed = performance.now() - Number(parsed.savedAtPerf || 0);
      if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 1000 * 60 * 60 * 12) return null;
      return {
        unixMs: parsed.unixMs + elapsed,
        perf: performance.now(),
        source: "memoria local (" + (parsed.source || "previo") + ")"
      };
    } catch (_err) {
      return null;
    }
  }

  async function fetchJsonUnixMs(url) {
    const t0 = performance.now();
    const res = await fetch(url, { cache: "no-store" });
    const t1 = performance.now();
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const rtt = Math.max(0, t1 - t0);
    let unixMs = null;
    let source = url;
    if (typeof data.unixMs === "number") {
      unixMs = data.unixMs;
      source = data.source || url;
    } else if (typeof data.unixtime === "number") {
      unixMs = data.unixtime * 1000;
      source = "worldtimeapi";
    } else if (typeof data.datetime === "string") {
      unixMs = Date.parse(data.datetime);
      source = "worldtimeapi";
    } else if (typeof data.dateTime === "string") {
      unixMs = Date.parse(data.dateTime);
      source = "timeapi.io";
    }
    if (!Number.isFinite(unixMs)) throw new Error("Sin marca de tiempo");
    // Compensa la mitad del viaje de red para no atrasar los segundos.
    return { unixMs: unixMs + rtt / 2, source: source, rtt: rtt };
  }

  async function syncTrustedTime() {
    // Si el reloj del sistema está bien, usarlo: evita desfases de red.
    if (!systemLooksBroken(new Date())) {
      syncAnchor = {
        unixMs: Date.now(),
        perf: performance.now(),
        source: "reloj del sistema"
      };
      saveSync(syncAnchor.unixMs, syncAnchor.source);
      return syncAnchor;
    }

    const candidates = [
      { type: "json", url: "/time" },
      { type: "json", url: "https://worldtimeapi.org/api/timezone/Etc/UTC" },
      { type: "json", url: "https://timeapi.io/api/Time/current/zone?timeZone=UTC" }
    ];

    try {
      candidates.unshift({ type: "json", url: new URL("../../time", window.location.href).href });
      candidates.unshift({ type: "json", url: new URL("/time", window.location.origin).href });
    } catch (_err) {
      /* ignore */
    }

    let lastError = null;
    for (let i = 0; i < candidates.length; i += 1) {
      try {
        const got = await fetchJsonUnixMs(candidates[i].url);
        syncAnchor = {
          unixMs: got.unixMs,
          perf: performance.now(),
          source: got.source
        };
        saveSync(got.unixMs, got.source);
        return syncAnchor;
      } catch (err) {
        lastError = err;
      }
    }

    const mem = loadSyncFallback();
    if (mem) {
      syncAnchor = mem;
      return syncAnchor;
    }

    syncAnchor = {
      unixMs: Date.now(),
      perf: performance.now(),
      source: "reloj del sistema" + (lastError ? " (sin red)" : "")
    };
    return syncAnchor;
  }

  function trustedNowMs() {
    // Con reloj sano, Date.now() es la fuente más fiel segundo a segundo.
    if (!systemLooksBroken(new Date())) return Date.now();
    if (!syncAnchor) return Date.now();
    return syncAnchor.unixMs + (performance.now() - syncAnchor.perf);
  }

  function trustedDate() {
    return new Date(trustedNowMs());
  }

  function currentUnixSeconds() {
    return BigInt(Math.floor(trustedNowMs() / 1000));
  }

  function wrappedUnix(unix) {
    if (unix < 0n) {
      return ((unix % RESET_UNIX) + RESET_UNIX) % RESET_UNIX;
    }
    return unix % RESET_UNIX;
  }

  function buildLights() {
    lightsEl.innerHTML = "";
    lightNodes = [];
    for (let i = 0; i < BIT_COUNT; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "light";
      dot.title = "Bit " + (BIT_COUNT - 1 - i) + " (2^" + (BIT_COUNT - 1 - i) + ")";
      dot.setAttribute("aria-label", "Bit " + (BIT_COUNT - 1 - i));
      dot.disabled = true;
      dot.addEventListener("click", () => {
        if (!controlMode) return;
        manualBits[i] = !manualBits[i];
        applyManualLights();
      });
      lightsEl.appendChild(dot);
      lightNodes.push(dot);
    }
  }

  function bitsFromUnix(shown) {
    const bits = [];
    for (let i = 0; i < BIT_COUNT; i += 1) {
      const bitIndex = BIT_COUNT - 1 - i;
      bits.push(((shown >> BigInt(bitIndex)) & 1n) === 1n);
    }
    return bits;
  }

  function unixFromManualBits() {
    let value = 0n;
    for (let i = 0; i < BIT_COUNT; i += 1) {
      if (manualBits[i]) {
        value |= 1n << BigInt(BIT_COUNT - 1 - i);
      }
    }
    return value;
  }

  function formatBitsArray(bits) {
    let text = "";
    for (let i = 0; i < bits.length; i += 1) {
      text += bits[i] ? "1" : "0";
      if ((i + 1) % 10 === 0 && i + 1 < bits.length) text += " ";
    }
    return text;
  }

  function applyManualLights() {
    for (let i = 0; i < BIT_COUNT; i += 1) {
      lightNodes[i].classList.toggle("on", !!manualBits[i]);
    }
    bitsReadoutEl.textContent = formatBitsArray(manualBits);
    unixNumberEl.textContent = formatBigIntGrouped(unixFromManualBits()) + " (editado)";
  }

  function setControlMode(on) {
    controlMode = on;
    lightsWrap.classList.toggle("editable", on);
    lightsHint.hidden = on;
    controlHint.hidden = !on;
    btnControlTime.textContent = on ? "TiempoReal" : "ControlarTimepo";
    btnControlTime.classList.toggle("active-control", on);
    lightNodes.forEach((dot) => {
      dot.disabled = !on;
    });

    if (on) {
      const shown = wrappedUnix(currentUnixSeconds());
      manualBits = bitsFromUnix(shown);
      // Congela la vista actual; el tiempo real sigue por detrás.
      realDateEl.textContent = formatDateParts(trustedDate()) + " (pausado)";
      sinceStartEl.textContent = formatBigIntGrouped(
        BigInt(Math.floor((trustedNowMs() - EPOCH_START_MS) / 1000))
      ) + " (pausado)";
      y2038StatusEl.textContent = "ControlarTimepo · tiempo real oculto";
      y2038StatusEl.className = "before";
      applyManualLights();
    } else {
      manualBits = [];
      renderPlay();
    }
  }

  function renderPlay() {
    if (controlMode) return;

    const now = trustedDate();
    const unix = currentUnixSeconds();
    const shown = wrappedUnix(unix);
    const sinceStart = BigInt(Math.floor((trustedNowMs() - EPOCH_START_MS) / 1000));

    realDateEl.textContent = formatDateParts(now) + " (local)";
    unixNumberEl.textContent = formatBigIntGrouped(shown);
    sinceStartEl.textContent = formatBigIntGrouped(sinceStart);

    if (unix < Y2038_UNIX) {
      y2038StatusEl.textContent = "Antes del límite · faltan " + formatBigIntGrouped(Y2038_UNIX - unix) + " s";
      y2038StatusEl.className = "before";
      milestoneEl.classList.remove("past");
    } else if (unix === Y2038_UNIX) {
      y2038StatusEl.textContent = "¡Ahora mismo es 19/1/2038 03:14:07 UTC!";
      y2038StatusEl.className = "after";
      milestoneEl.classList.add("past");
    } else {
      y2038StatusEl.textContent = "Después del límite · sigue · +" + formatBigIntGrouped(unix - Y2038_UNIX) + " s";
      y2038StatusEl.className = "after";
      milestoneEl.classList.add("past");
    }

    const bits = bitsFromUnix(shown);
    for (let i = 0; i < BIT_COUNT; i += 1) {
      lightNodes[i].classList.toggle("on", bits[i]);
    }
    bitsReadoutEl.textContent = formatBitsArray(bits);
  }

  function renderPhone() {
    const anti = trustedDate();
    const system = new Date();
    const unix = wrappedUnix(currentUnixSeconds());

    phoneTimeEl.textContent = formatClockTime(anti);
    phoneDateEl.textContent = formatClockDate(anti);
    phoneUnixEl.textContent = "Unix " + formatBigIntGrouped(unix);

    if (systemLooksBroken(system)) {
      phoneSystemEl.textContent = "Sistema del móvil: " + formatDateParts(system) + " ⚠ posible overflow (1901)";
      phoneSystemEl.classList.add("broken");
    } else {
      phoneSystemEl.textContent = "Sistema del móvil: " + formatDateParts(system);
      phoneSystemEl.classList.remove("broken");
    }

    if (syncAnchor) {
      phoneSyncEl.textContent = "Fuente Anti-2038: " + syncAnchor.source;
      phoneSyncEl.classList.toggle("warn", syncAnchor.source.indexOf("sistema") !== -1);
    }
  }

  function ensureAudio() {
    if (!alarmAudioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      alarmAudioCtx = new Ctx();
    }
    if (alarmAudioCtx.state === "suspended") alarmAudioCtx.resume();
    return alarmAudioCtx;
  }

  function playDoBeep(ctx, startAt, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // DO4 ≈ 261.63 Hz. Ganancia alta ≈ ~70 dB percibidos en auriculares/parlantes.
    osc.type = "sine";
    osc.frequency.value = 261.63;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.72, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  function speakTwice(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    [0, 1].forEach((i) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-ES";
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      if (i === 1) utter.volume = 1;
      window.setTimeout(() => window.speechSynthesis.speak(utter), i * 1800);
    });
  }

  function triggerAlarm() {
    const ctx = ensureAudio();
    const speech = alarm && alarm.speech ? alarm.speech : "";
    if (ctx) {
      const t0 = ctx.currentTime + 0.05;
      // Beeps, oración en el medio, más beeps.
      playDoBeep(ctx, t0, 0.55);
      playDoBeep(ctx, t0 + 0.7, 0.55);
      playDoBeep(ctx, t0 + 1.4, 0.55);
      window.setTimeout(() => {
        if (speech) speakTwice(speech);
      }, 2100);
      window.setTimeout(() => {
        const t1 = ctx.currentTime + 0.05;
        playDoBeep(ctx, t1, 0.55);
        playDoBeep(ctx, t1 + 0.7, 0.55);
        playDoBeep(ctx, t1 + 1.4, 0.7);
      }, speech ? 6200 : 2200);
    } else if (speech) {
      speakTwice(speech);
    }

    const status = document.getElementById("alarmStatus");
    if (status) {
      status.textContent = "¡Alarma! DO ~70 dB" + (speech ? ' · "' + speech + '"' : "");
      status.classList.add("active-alarm");
    }
  }

  function checkAlarm() {
    if (!alarm || alarm.fired) return;
    if (trustedNowMs() >= alarm.atMs) {
      alarm.fired = true;
      triggerAlarm();
    }
  }

  function renderAlarmStatus() {
    const status = document.getElementById("alarmStatus");
    if (!status) return;
    if (!alarm) {
      status.textContent = "Sin alarma";
      status.classList.remove("active-alarm");
      return;
    }
    if (alarm.fired) return;
    const when = new Date(alarm.atMs);
    status.textContent =
      "Alarma activa: " + formatDateParts(when) +
      (alarm.speech ? ' · dirá: "' + alarm.speech + '" ×2' : "");
    status.classList.add("active-alarm");
  }

  function render() {
    checkAlarm();
    if (phoneMode) renderPhone();
    else renderPlay();
  }

  function startClock() {
    stopClock();
    render();
    // Alinea el tick al inicio de cada segundo real para no “saltarse” segundos.
    const delay = 1000 - (trustedNowMs() % 1000);
    timerId = window.setTimeout(function tick() {
      render();
      timerId = window.setTimeout(tick, 1000 - (trustedNowMs() % 1000));
    }, delay);
  }

  function stopClock() {
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = 0;
    }
  }

  async function requestWakeLock() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          wakeLock = null;
        });
      }
    } catch (_err) {
      wakeLock = null;
    }
  }

  async function releaseWakeLock() {
    try {
      if (wakeLock) await wakeLock.release();
    } catch (_err) {
      /* ignore */
    }
    wakeLock = null;
  }

  async function enterPhoneClock() {
    if (controlMode) setControlMode(false);
    phoneMode = true;
    phoneSyncEl.textContent = "Sincronizando hora confiable…";
    phoneSyncEl.classList.remove("warn");
    show("screenPhone");
    startClock();
    await requestWakeLock();
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (_err) {
      /* el usuario puede negar fullscreen */
    }
    await syncTrustedTime();
    renderPhone();
  }

  async function exitPhoneClock() {
    phoneMode = false;
    await releaseWakeLock();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch (_err) {
      /* ignore */
    }
    show("screenPlay");
    startClock();
  }

  buildLights();

  document.getElementById("btnPlay").addEventListener("click", async () => {
    phoneMode = false;
    if (controlMode) setControlMode(false);
    show("screenPlay");
    startClock();
    syncTrustedTime().then(() => render());
  });

  document.getElementById("btnBack").addEventListener("click", async () => {
    stopClock();
    await releaseWakeLock();
    phoneMode = false;
    if (controlMode) setControlMode(false);
    show("screenTitle");
  });

  btnControlTime.addEventListener("click", () => {
    if (phoneMode) return;
    setControlMode(!controlMode);
  });

  document.getElementById("btnPhoneClock").addEventListener("click", () => {
    enterPhoneClock();
  });
  document.getElementById("btnPhoneClockTitle").addEventListener("click", () => {
    enterPhoneClock();
  });
  document.getElementById("btnExitPhone").addEventListener("click", () => {
    exitPhoneClock();
  });
  document.getElementById("btnResync").addEventListener("click", async () => {
    phoneSyncEl.textContent = "Sincronizando…";
    await syncTrustedTime();
    renderPhone();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && phoneMode) {
      requestWakeLock();
      syncTrustedTime().then(() => renderPhone());
    }
  });

  (function initAlarmDefaults() {
    const now = new Date();
    const dateInput = document.getElementById("alarmDate");
    if (dateInput) {
      dateInput.value =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");
    }
  })();

  document.getElementById("btnSetAlarm").addEventListener("click", () => {
    ensureAudio();
    const dateVal = document.getElementById("alarmDate").value;
    const hour = Number(document.getElementById("alarmHour").value);
    const minute = Number(document.getElementById("alarmMinute").value);
    const second = Number(document.getElementById("alarmSecond").value);
    const speech = document.getElementById("alarmSpeech").value.trim();
    if (!dateVal) {
      window.alert("Elegí una fecha.");
      return;
    }
    const parts = dateVal.split("-").map(Number);
    const at = new Date(parts[0], parts[1] - 1, parts[2], hour, minute, second, 0);
    if (Number.isNaN(at.getTime())) {
      window.alert("Fecha/hora inválida.");
      return;
    }
    if (at.getTime() <= trustedNowMs()) {
      window.alert("La alarma tiene que ser en el futuro.");
      return;
    }
    alarm = { atMs: at.getTime(), speech: speech, fired: false };
    renderAlarmStatus();
  });

  document.getElementById("btnClearAlarm").addEventListener("click", () => {
    alarm = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    renderAlarmStatus();
  });
})();
