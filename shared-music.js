(function () {
  "use strict";

  const STORAGE_KEY = "admin-music-enabled";
  const VOLUME = 0.45;

  function musicBase() {
    const path = decodeURIComponent(location.pathname).replace(/\\/g, "/");
    if (/\/Juegos\//i.test(path)) return "../../music/";
    return "music/";
  }

  const BASE = musicBase();

  const PLAYLIST = [
    { title: "GD Greña - La Revancha", file: "01-la-revancha.webm" },
    { title: "Distrion & Electro-Light - Drakkar", file: "02-drakkar.webm" },
    { title: "Different Heaven - Safe And Sound", file: "03-safe-and-sound.webm" },
    { title: "Elektronomia - Sky High", file: "04-sky-high.webm" },
    { title: "Robin Hustin - On Fire", file: "05-on-fire.webm" },
    { title: "Cartoon, Jéja - On & On", file: "06-on-and-on.webm" },
    { title: "Janji - Heroes Tonight", file: "07-heroes-tonight.webm" },
    { title: "Syn Cole - Feel Good", file: "08-feel-good.webm" },
    { title: "Robin Hustin x TobiMorrow - Light It Up", file: "09-light-it-up.webm" },
    { title: "DEAF KEV - Invincible", file: "10-invincible.webm" }
  ].map((t) => ({ title: t.title, file: BASE + t.file }));

  const music = {
    audio: new Audio(),
    index: 0,
    started: false,
    unavailable: false,
    errorSkipLock: false,
    triedTracks: new Set(),
    pausedByVisibility: false
  };

  music.audio.volume = VOLUME;
  music.audio.preload = "auto";

  function isEnabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (_err) {
      return false;
    }
  }

  function setEnabled(on) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch (_err) {
      /* ignore */
    }
  }

  function els() {
    return {
      root: document.getElementById("nowPlaying"),
      title: document.getElementById("nowPlayingTitle"),
      stop: document.getElementById("btnMusicStop"),
      prev: document.getElementById("btnMusicPrev"),
      next: document.getElementById("btnMusicNext"),
      toggle: document.getElementById("btnMusicToggle")
    };
  }

  function updateToggleButton() {
    const { toggle } = els();
    if (!toggle) return;
    const on = isEnabled() && music.started && !music.audio.paused;
    toggle.textContent = on ? "⏹ Música" : "🎵 Música";
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.title = on ? "Detener música en todos los juegos" : "Activar música en todos los juegos";
  }

  function updateStopButton() {
    const { stop } = els();
    if (!stop) return;
    const paused = !music.started || music.audio.paused;
    stop.textContent = paused ? "▶" : "⏸";
    stop.title = paused ? "Reproducir" : "Pausar";
  }

  function updateNowPlaying() {
    const { root, title } = els();
    if (root) root.hidden = false;
    if (title) {
      title.textContent = music.unavailable
        ? "Música no encontrada"
        : music.started
          ? (PLAYLIST[music.index]?.title || "—")
          : "—";
    }
    updateStopButton();
    updateToggleButton();
  }

  function pickStartIndex() {
    return Math.floor(Math.random() * PLAYLIST.length);
  }

  function setMusicUnavailable() {
    music.unavailable = true;
    music.audio.pause();
    music.audio.removeAttribute("src");
    music.audio.load();
    updateNowPlaying();
  }

  function loadTrack(index) {
    const track = PLAYLIST[index];
    if (!track || music.unavailable) return false;
    music.index = index;
    music.audio.src = track.file;
    updateNowPlaying();
    return true;
  }

  function playCurrent() {
    if (music.unavailable) return;
    if (document.hidden) return;
    music.audio.play().catch(() => {});
  }

  function playNext() {
    if (music.unavailable) return;
    if (!music.started) {
      startMusic(true);
      return;
    }
    loadTrack((music.index + 1) % PLAYLIST.length);
    playCurrent();
  }

  function playPrevious() {
    if (music.unavailable) return;
    if (!music.started) {
      startMusic(true);
      return;
    }
    loadTrack((music.index - 1 + PLAYLIST.length) % PLAYLIST.length);
    playCurrent();
  }

  function startMusic(fromUser) {
    if (music.unavailable) return;
    music.pausedByVisibility = false;
    if (fromUser) setEnabled(true);

    if (music.started) {
      if (music.audio.paused) playCurrent();
      updateNowPlaying();
      return;
    }

    music.started = true;
    music.triedTracks.clear();
    music.index = pickStartIndex();
    loadTrack(music.index);
    updateNowPlaying();
    playCurrent();
  }

  function stopMusic(fromUser) {
    music.pausedByVisibility = false;
    if (fromUser) setEnabled(false);
    music.audio.pause();
    try {
      music.audio.currentTime = 0;
    } catch (_err) {
      /* ignore */
    }
    updateNowPlaying();
  }

  function toggleMusic(event) {
    if (event) event.stopPropagation();
    if (music.unavailable) return;
    if (isEnabled() && music.started && !music.audio.paused) {
      stopMusic(true);
      return;
    }
    startMusic(true);
  }

  function togglePause(event) {
    if (event) event.stopPropagation();
    if (music.unavailable) return;
    music.pausedByVisibility = false;
    if (!music.started || !isEnabled()) {
      startMusic(true);
      return;
    }
    if (music.audio.paused) {
      setEnabled(true);
      playCurrent();
    } else {
      music.audio.pause();
    }
    updateNowPlaying();
  }

  function onTrackEnded() {
    if (music.unavailable || !isEnabled()) return;
    music.triedTracks.clear();
    playNext();
  }

  function onTrackError() {
    if (music.unavailable || music.errorSkipLock) return;
    music.errorSkipLock = true;
    music.triedTracks.add(music.index);
    if (music.triedTracks.size >= PLAYLIST.length) {
      setMusicUnavailable();
      music.errorSkipLock = false;
      return;
    }
    window.setTimeout(() => {
      music.errorSkipLock = false;
      if (music.unavailable || !isEnabled()) return;
      loadTrack((music.index + 1) % PLAYLIST.length);
      playCurrent();
    }, 120);
  }

  function pauseForBackground() {
    if (!music.started || music.unavailable) return;
    if (!music.audio.paused) {
      music.pausedByVisibility = true;
      music.audio.pause();
      updateStopButton();
      updateToggleButton();
    }
  }

  function resumeFromBackground() {
    if (!music.pausedByVisibility) return;
    music.pausedByVisibility = false;
    if (isEnabled() && music.started && !music.unavailable) playCurrent();
    updateNowPlaying();
  }

  function tryResumeFromFlag() {
    if (!isEnabled() || music.unavailable) {
      updateNowPlaying();
      return;
    }
    startMusic(false);
  }

  music.audio.addEventListener("ended", onTrackEnded);
  music.audio.addEventListener("error", onTrackError);
  music.audio.addEventListener("play", () => {
    updateStopButton();
    updateToggleButton();
  });
  music.audio.addEventListener("pause", () => {
    updateStopButton();
    updateToggleButton();
  });

  function bindUi() {
    const { stop, prev, next, toggle } = els();
    stop?.addEventListener("click", togglePause);
    prev?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!isEnabled()) setEnabled(true);
      playPrevious();
    });
    next?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!isEnabled()) setEnabled(true);
      playNext();
    });
    toggle?.addEventListener("click", toggleMusic);
  }

  bindUi();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseForBackground();
    else resumeFromBackground();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (isEnabled()) tryResumeFromFlag();
    else stopMusic(false);
  });

  // Si el menú dejó la música activada, intentar seguir en este juego.
  tryResumeFromFlag();

  // Si el navegador bloqueó autoplay, desbloquear con el primer toque (solo una vez).
  let gestureUsed = false;
  document.addEventListener(
    "pointerdown",
    () => {
      if (gestureUsed || !isEnabled()) return;
      gestureUsed = true;
      startMusic(false);
    },
    true
  );

  const api = {
    start: () => startMusic(true),
    stop: () => stopMusic(true),
    toggle: toggleMusic,
    isEnabled,
    resumeIfEnabled: tryResumeFromFlag,
    STORAGE_KEY
  };

  window.SharedMusic = api;
  window.GameMusic = api;
  window.AlgicosathlonMusic = api;
  window.Creator2DMusic = api;
})();
