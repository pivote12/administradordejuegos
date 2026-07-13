(function () {
  "use strict";

  const PLAYLIST = [
    { title: "GD Greña - La Revancha", file: "music/01-la-revancha.webm" },
    { title: "Distrion & Electro-Light - Drakkar", file: "music/02-drakkar.webm" },
    { title: "Different Heaven - Safe And Sound", file: "music/03-safe-and-sound.webm" },
    { title: "Elektronomia - Sky High", file: "music/04-sky-high.webm" },
    { title: "Robin Hustin - On Fire", file: "music/05-on-fire.webm" },
    { title: "Cartoon, Jéja - On & On", file: "music/06-on-and-on.webm" },
    { title: "Janji - Heroes Tonight", file: "music/07-heroes-tonight.webm" },
    { title: "Syn Cole - Feel Good", file: "music/08-feel-good.webm" },
    { title: "Robin Hustin x TobiMorrow - Light It Up", file: "music/09-light-it-up.webm" },
    { title: "DEAF KEV - Invincible", file: "music/10-invincible.webm" }
  ];

  const music = {
    audio: new Audio(),
    index: 0,
    started: false,
    unavailable: false,
    errorSkipLock: false,
    triedTracks: new Set(),
    volume: 0.45
  };

  music.audio.volume = music.volume;
  music.audio.preload = "auto";

  const nowPlayingEl = document.getElementById("nowPlaying");
  const nowPlayingTitleEl = document.getElementById("nowPlayingTitle");
  const btnMusicStop = document.getElementById("btnMusicStop");
  const btnMusicPrev = document.getElementById("btnMusicPrev");
  const btnMusicNext = document.getElementById("btnMusicNext");

  function pickStartIndex() {
    return Math.floor(Math.random() * PLAYLIST.length);
  }

  function updateStopButton() {
    if (!btnMusicStop) {
      return;
    }
    const paused = music.audio.paused;
    btnMusicStop.textContent = paused ? "▶" : "⏸";
    btnMusicStop.title = paused ? "Play song" : "Pause song";
  }

  function setMusicUnavailable() {
    music.unavailable = true;
    music.audio.pause();
    music.audio.removeAttribute("src");
    music.audio.load();
    if (nowPlayingTitleEl) {
      nowPlayingTitleEl.textContent = "Music files not found";
    }
    if (nowPlayingEl) {
      nowPlayingEl.hidden = false;
    }
    updateStopButton();
  }

  function updateNowPlaying() {
    if (music.unavailable) {
      return;
    }
    const title = PLAYLIST[music.index]?.title || "—";
    if (nowPlayingTitleEl) {
      nowPlayingTitleEl.textContent = title;
    }
    if (nowPlayingEl) {
      nowPlayingEl.hidden = !music.started;
    }
    updateStopButton();
  }

  function loadTrack(index) {
    const track = PLAYLIST[index];
    if (!track || music.unavailable) {
      return false;
    }
    music.index = index;
    music.audio.src = track.file;
    updateNowPlaying();
    return true;
  }

  function playCurrent() {
    if (music.unavailable) {
      return;
    }
    music.audio.play().catch(() => {
      /* autoplay blocked until user interaction */
    });
  }

  function playNext() {
    if (music.unavailable) {
      return;
    }
    if (!music.started) {
      startMusic();
      return;
    }
    const next = (music.index + 1) % PLAYLIST.length;
    loadTrack(next);
    playCurrent();
  }

  function playPrevious() {
    if (music.unavailable) {
      return;
    }
    if (!music.started) {
      startMusic();
      return;
    }
    const prev = (music.index - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadTrack(prev);
    playCurrent();
  }

  function togglePause(event) {
    if (event) {
      event.stopPropagation();
    }
    if (music.unavailable) {
      return;
    }
    if (!music.started) {
      startMusic();
      return;
    }
    if (music.audio.paused) {
      playCurrent();
    } else {
      music.audio.pause();
    }
    updateStopButton();
  }

  function onTrackEnded() {
    if (music.unavailable) {
      return;
    }
    music.triedTracks.clear();
    playNext();
  }

  function onTrackError() {
    if (music.unavailable || music.errorSkipLock) {
      return;
    }

    music.errorSkipLock = true;
    music.triedTracks.add(music.index);

    if (music.triedTracks.size >= PLAYLIST.length) {
      setMusicUnavailable();
      music.errorSkipLock = false;
      return;
    }

    window.setTimeout(() => {
      music.errorSkipLock = false;
      if (music.unavailable) {
        return;
      }
      const next = (music.index + 1) % PLAYLIST.length;
      loadTrack(next);
      playCurrent();
    }, 120);
  }

  function startMusic() {
    if (music.unavailable) {
      return;
    }
    if (music.started) {
      if (music.audio.paused) {
        playCurrent();
      }
      return;
    }
    music.started = true;
    music.triedTracks.clear();
    music.index = pickStartIndex();
    loadTrack(music.index);
    updateNowPlaying();
    playCurrent();
  }

  music.audio.addEventListener("ended", onTrackEnded);
  music.audio.addEventListener("error", onTrackError);
  music.audio.addEventListener("play", updateStopButton);
  music.audio.addEventListener("pause", updateStopButton);

  if (btnMusicStop) {
    btnMusicStop.addEventListener("click", togglePause);
  }
  if (btnMusicPrev) {
    btnMusicPrev.addEventListener("click", (event) => {
      event.stopPropagation();
      playPrevious();
    });
  }
  if (btnMusicNext) {
    btnMusicNext.addEventListener("click", (event) => {
      event.stopPropagation();
      playNext();
    });
  }

  window.AlgicosathlonMusic = {
    start: startMusic,
    getCurrentTitle() {
      if (music.unavailable) {
        return "";
      }
      return PLAYLIST[music.index]?.title || "";
    }
  };
})();
