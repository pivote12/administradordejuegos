(function () {
  "use strict";

  const STORAGE_KEY = "universe-maker-saves-v1";
  const STORAGE_BAK = "universe-maker-saves-v1-bak";
  const FACES_KEY = "marble-escape-saves-v2";
  const FACES_BAK = "marble-escape-saves-v2-bak";

  const YEAR_SCALES = {
    ns: 1e6,
    ms: 1,
    s: 1 / 1000,
    min: 1 / 60000,
    hour: 1 / 3600000,
    day: 1 / 86400000,
    month: 1 / (30 * 86400000),
    year: 1 / (365.25 * 86400000),
    decade: 1 / (10 * 365.25 * 86400000)
  };

  const M = {
    GROW_START: 10e6,
    GROW_STEP: 100e3,
    BLACK: 50e6,
    FIRST_STAR: 100e6,
    STAR_EVERY: 2e6,
    SUN: 2e9,
    FIRST_PLANET: 5e9,
    MORE_PLANETS: 7e9
  };

  const canvas = document.getElementById("cosmos");
  const ctx = canvas.getContext("2d");

  let saves = [];
  let activeId = null;
  let createPackId = "";
  let selectedMarbleId = null;
  let drag = null;
  let pan = null;
  let cam = { x: 0, y: 0 };
  let teleportCooldown = 0;
  let paused = false;
  let lastTick = 0;
  let raf = 0;
  let pendingPlanetGoal = 0;
  let planetPromptOpen = false;
  let faceImages = {};

  function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function packs() {
    return window.SharedPacks ? SharedPacks.load() : [];
  }

  function loadFaces() {
    try {
      const raw = localStorage.getItem(FACES_KEY) || localStorage.getItem(FACES_BAK);
      const data = raw ? JSON.parse(raw) : null;
      return Array.isArray(data && data.faces) ? data.faces : [];
    } catch (_err) {
      return [];
    }
  }

  function faceThumb(face) {
    if (!face) return "";
    if (Array.isArray(face.frames) && face.frames[0]) return face.frames[0];
    return "";
  }

  function readSaves() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_BAK);
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeUniverse).filter(Boolean) : [];
    } catch (_err) {
      return [];
    }
  }

  function writeSaves(list) {
    const json = JSON.stringify(list);
    try {
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_BAK, json);
    } catch (_err) {
      try { localStorage.setItem(STORAGE_KEY, json); } catch (_err2) { /* sin espacio */ }
    }
    saves = list;
  }

  function normalizeMarble(m) {
    if (!m || !m.name) return null;
    return {
      id: m.id || makeId("m"),
      name: String(m.name).slice(0, 40),
      color: m.color || "#55d6ff",
      faceId: m.faceId || "",
      family: String(m.family || "").slice(0, 40),
      parentIds: Array.isArray(m.parentIds) ? m.parentIds.slice(0, 2) : [],
      angle: Number.isFinite(Number(m.angle)) ? Number(m.angle) : Math.random() * Math.PI * 2,
      radius: Number.isFinite(Number(m.radius)) ? clamp(Number(m.radius), 0.05, 0.92) : 0.15 + Math.random() * 0.35,
      talk: String(m.talk || "").slice(0, 80),
      talkUntil: Number(m.talkUntil) || 0,
      onPlanetId: m.onPlanetId || ""
    };
  }

  function normalizePlanet(p) {
    if (!p || !p.name) return null;
    return {
      id: p.id || makeId("planet"),
      name: String(p.name).slice(0, 40),
      size: clamp(Math.round(Number(p.size) || 40), 1, 100),
      water: clamp(Math.round(Number(p.water) || 0), 0, 100),
      hasLife: !!p.hasLife,
      orbit: p.orbit === "hot" || p.orbit === "cold" || p.orbit === "habitable" ? p.orbit : (p.hasLife ? "habitable" : "cold"),
      angle: Number.isFinite(Number(p.angle)) ? Number(p.angle) : Math.random() * Math.PI * 2
    };
  }

  function normalizeUniverse(u) {
    if (!u || !u.name) return null;
    return {
      id: u.id || makeId("uni"),
      name: String(u.name).slice(0, 40),
      packId: u.packId || "",
      packName: u.packName || "",
      createdAt: Number(u.createdAt) || Date.now(),
      updatedAt: Number(u.updatedAt) || Date.now(),
      yearScale: YEAR_SCALES[u.yearScale] ? u.yearScale : "s",
      years: Math.max(0, Number(u.years) || 0),
      circleBase: Number(u.circleBase) || 90,
      growthSteps: Math.max(0, Math.round(Number(u.growthSteps) || 0)),
      stars: Math.max(0, Math.round(Number(u.stars) || 0)),
      hasSun: !!u.hasSun,
      blackBall: !!u.blackBall,
      marbles: Array.isArray(u.marbles) ? u.marbles.map(normalizeMarble).filter(Boolean) : [],
      planets: Array.isArray(u.planets) ? u.planets.map(normalizePlanet).filter(Boolean) : [],
      firstPlanetDone: !!u.firstPlanetDone,
      morePlanetsDone: !!u.morePlanetsDone,
      targetPlanetCount: clamp(Math.round(Number(u.targetPlanetCount) || 0), 0, 10),
      flags: {
        grew: !!(u.flags && u.flags.grew),
        black: !!(u.flags && u.flags.black),
        firstStar: !!(u.flags && u.flags.firstStar),
        sun: !!(u.flags && u.flags.sun),
        firstPlanet: !!(u.flags && u.flags.firstPlanet),
        morePlanets: !!(u.flags && u.flags.morePlanets)
      }
    };
  }

  function getUniverse() {
    return saves.find((item) => item.id === activeId) || null;
  }

  function persist() {
    const uni = getUniverse();
    if (!uni) return;
    uni.updatedAt = Date.now();
    writeSaves(saves.map((item) => (item.id === uni.id ? uni : item)));
  }

  function formatYears(y) {
    if (y >= 1e9) return (y / 1e9).toFixed(y >= 10e9 ? 1 : 2) + "B";
    if (y >= 1e6) return (y / 1e6).toFixed(y >= 100e6 ? 0 : 1) + "M";
    if (y >= 1e3) return (y / 1e3).toFixed(y >= 100e3 ? 0 : 1) + "K";
    return Math.floor(y).toString();
  }

  function circleRadius(uni) {
    return uni.circleBase + uni.growthSteps * 4;
  }

  function renderSaves() {
    saves = readSaves();
    const list = document.getElementById("saveList");
    const empty = document.getElementById("emptySaves");
    list.innerHTML = "";
    empty.hidden = saves.length > 0;
    saves
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
      .forEach((uni) => {
        const row = document.createElement("div");
        row.className = "save-row";
        row.innerHTML = "<div><strong></strong><span></span></div><div class=\"save-actions\"></div>";
        row.querySelector("strong").textContent = uni.name;
        row.querySelector("span").textContent =
          (uni.packName || "Pack") + " · año " + formatYears(uni.years) + " · " + uni.marbles.length + " pelotitas";
        const open = document.createElement("button");
        open.type = "button";
        open.className = "btn secondary";
        open.textContent = "Abrir";
        open.addEventListener("click", () => openUniverse(uni.id));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn danger";
        remove.textContent = "Borrar";
        remove.addEventListener("click", () => {
          if (!window.confirm("¿Borrar el universo \"" + uni.name + "\"?")) return;
          writeSaves(saves.filter((item) => item.id !== uni.id));
          if (activeId === uni.id) stopLoop();
          renderSaves();
        });
        row.querySelector(".save-actions").append(open, remove);
        list.appendChild(row);
      });
  }

  function openCreate() {
    createPackId = "";
    document.getElementById("universeName").value = "";
    document.getElementById("createStatus").textContent = "";
    const list = document.getElementById("packPickList");
    list.innerHTML = "";
    const found = packs();
    if (!found.length) {
      list.textContent = "No hay packs. Creá uno en Packs.";
    } else {
      found.forEach((pack) => {
        const count = Array.isArray(pack.marbles) ? pack.marbles.length : 0;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pack-row";
        btn.innerHTML = "<div><strong></strong><span></span></div>";
        btn.querySelector("strong").textContent = pack.name || "Pack";
        btn.querySelector("span").textContent = count + " pelotita" + (count === 1 ? "" : "s");
        btn.addEventListener("click", () => {
          createPackId = pack.id;
          list.querySelectorAll(".pack-row").forEach((el) => el.classList.remove("on"));
          btn.classList.add("on");
        });
        list.appendChild(btn);
      });
    }
    show("screenCreate");
  }

  function startUniverse() {
    const status = document.getElementById("createStatus");
    const name = document.getElementById("universeName").value.trim();
    if (!name) {
      status.textContent = "Poné un nombre.";
      status.className = "status bad";
      return;
    }
    const pack = packs().find((item) => item.id === createPackId);
    if (!pack) {
      status.textContent = "Elegí un pack.";
      status.className = "status bad";
      return;
    }
    const marbles = (pack.marbles || []).map((m, i) => normalizeMarble({
      id: makeId("m"),
      name: m.name,
      color: m.color,
      angle: (i / Math.max(1, pack.marbles.length)) * Math.PI * 2,
      radius: 0.2 + (i % 5) * 0.08
    })).filter(Boolean);
    if (!marbles.length) {
      status.textContent = "Ese pack no tiene pelotitas.";
      status.className = "status bad";
      return;
    }
    const uni = normalizeUniverse({
      id: makeId("uni"),
      name: name,
      packId: pack.id,
      packName: pack.name || "Pack",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      yearScale: "s",
      years: 1,
      marbles: marbles,
      planets: [],
      targetPlanetCount: 0
    });
    saves = readSaves();
    saves.push(uni);
    writeSaves(saves);
    openUniverse(uni.id);
  }

  function openUniverse(id) {
    activeId = id;
    selectedMarbleId = null;
    paused = false;
    planetPromptOpen = false;
    pendingPlanetGoal = 0;
    const uni = getUniverse();
    if (!uni) {
      renderSaves();
      show("screenSaves");
      return;
    }
    document.getElementById("playTitle").textContent = uni.name;
    document.getElementById("btnPause").textContent = "Pausar";
    document.getElementById("playStatus").textContent = "";
    cam.x = 0;
    cam.y = 0;
    teleportCooldown = 0;
    if (uni.marbles.length) {
      const first = marbleWorldPos(uni, uni.marbles[0]);
      cam.x = first.x;
      cam.y = first.y;
    }
    updateAgeLabel();
    updateTools();
    show("screenPlay");
    draw();
    startLoop();
  }

  function updateAgeLabel() {
    const uni = getUniverse();
    if (!uni) return;
    document.getElementById("playAge").textContent =
      "Año " + formatYears(uni.years) + " · escala: " + scaleLabel(uni.yearScale);
  }

  function scaleLabel(key) {
    return ({
      ns: "1 nanosegundo",
      ms: "1 milisegundo",
      s: "1 segundo",
      min: "1 minuto",
      hour: "1 hora",
      day: "1 día",
      month: "1 mes",
      year: "1 año",
      decade: "1 década"
    })[key] || key;
  }

  function updateTools() {
    const on = !!selectedMarbleId;
    document.getElementById("btnFace").disabled = !on;
    document.getElementById("btnTalk").disabled = !on;
  }

  function setStatus(text, ok) {
    const el = document.getElementById("playStatus");
    el.textContent = text || "";
    el.className = "status play-status" + (ok === true ? " ok" : ok === false ? " bad" : "");
  }

  function applyMilestones(uni, before) {
    if (uni.years >= M.GROW_START) {
      const steps = Math.floor((uni.years - M.GROW_START) / M.GROW_STEP) + 1;
      if (steps > uni.growthSteps) {
        uni.growthSteps = steps;
        if (!uni.flags.grew) {
          uni.flags.grew = true;
          setStatus("El círculo empieza a crecer cada 100K años.", true);
        }
      }
    }

    if (uni.years >= M.BLACK && !uni.blackBall) {
      uni.blackBall = true;
      uni.flags.black = true;
      setStatus("A 50M años, la pelota se vuelve negra.", true);
    }

    if (uni.years >= M.FIRST_STAR) {
      const stars = 1 + Math.floor((uni.years - M.FIRST_STAR) / M.STAR_EVERY) * 3;
      if (stars > uni.stars) {
        uni.stars = stars;
        if (!uni.flags.firstStar) {
          uni.flags.firstStar = true;
          setStatus("¡La primera estrella se prende!", true);
        }
      }
    }

    if (uni.years >= M.SUN && !uni.hasSun) {
      uni.hasSun = true;
      uni.flags.sun = true;
      setStatus("A 2B años nace el Sol.", true);
    }

    if (uni.years >= M.FIRST_PLANET && !uni.firstPlanetDone && !planetPromptOpen) {
      uni.flags.firstPlanet = true;
      pendingPlanetGoal = 1;
      openPlanetModal(true);
    }

    if (uni.years >= M.MORE_PLANETS && uni.firstPlanetDone && !uni.morePlanetsDone && !planetPromptOpen) {
      uni.flags.morePlanets = true;
      if (!uni.targetPlanetCount) {
        uni.targetPlanetCount = 6 + Math.floor(Math.random() * 5);
      }
      if (uni.planets.length < uni.targetPlanetCount) {
        pendingPlanetGoal = uni.targetPlanetCount;
        openPlanetModal(false);
      } else {
        uni.morePlanetsDone = true;
      }
    }

    if (before < M.GROW_START && uni.years >= M.GROW_START) setStatus("10M años: el universo crece.", true);
  }

  function openPlanetModal(isFirst) {
    planetPromptOpen = true;
    paused = true;
    document.getElementById("btnPause").textContent = "Reanudar";
    document.getElementById("planetModalTitle").textContent = isFirst ? "Primer planeta (5B)" : "Nuevo planeta";
    document.getElementById("planetName").value = "";
    document.getElementById("planetSize").value = "40";
    document.getElementById("planetWater").value = "70";
    document.getElementById("planetStatus").textContent = "";
    const uni = getUniverse();
    const lifeSelect = document.getElementById("planetLife");
    const hasLifeAlready = uni && uni.planets.some((p) => p.hasLife);
    lifeSelect.value = hasLifeAlready ? "no" : "yes";
    lifeSelect.disabled = !!hasLifeAlready;
    syncPlanetOrbitField();
    document.getElementById("modalPlanet").hidden = false;
  }

  function syncPlanetOrbitField() {
    const life = document.getElementById("planetLife").value === "yes";
    document.getElementById("planetOrbitField").hidden = life;
  }

  function savePlanet() {
    const uni = getUniverse();
    if (!uni) return;
    const status = document.getElementById("planetStatus");
    const name = document.getElementById("planetName").value.trim();
    const size = Number(document.getElementById("planetSize").value);
    const water = Number(document.getElementById("planetWater").value);
    const wantsLife = document.getElementById("planetLife").value === "yes";
    const orbitRaw = document.getElementById("planetOrbit").value;

    if (!name) {
      status.textContent = "Poné un nombre.";
      status.className = "status bad";
      return;
    }
    if (wantsLife && uni.planets.some((p) => p.hasLife)) {
      status.textContent = "Ya hay un planeta con vida. No se puede de nuevo.";
      status.className = "status bad";
      return;
    }

    const planet = normalizePlanet({
      id: makeId("planet"),
      name: name,
      size: size,
      water: water,
      hasLife: wantsLife,
      orbit: wantsLife ? "habitable" : orbitRaw,
      angle: Math.random() * Math.PI * 2
    });
    uni.planets.push(planet);

    if (wantsLife) {
      uni.marbles.forEach((m) => {
        m.onPlanetId = planet.id;
        m.radius = 0.25 + Math.random() * 0.4;
        m.angle = Math.random() * Math.PI * 2;
      });
      setStatus("Las pelotitas se mudan a " + planet.name + " (zona habitable).", true);
    } else {
      setStatus(planet.name + " quedó " + (planet.orbit === "hot" ? "muy cerca" : "muy lejos") + " del sol. Sin vida.", true);
    }

    if (!uni.firstPlanetDone) uni.firstPlanetDone = true;
    if (uni.years >= M.MORE_PLANETS && uni.targetPlanetCount && uni.planets.length >= uni.targetPlanetCount) {
      uni.morePlanetsDone = true;
      pendingPlanetGoal = 0;
    }

    persist();
    document.getElementById("modalPlanet").hidden = true;
    planetPromptOpen = false;
    if (!uni.morePlanetsDone && uni.years >= M.MORE_PLANETS && uni.planets.length < uni.targetPlanetCount) {
      openPlanetModal(false);
    } else {
      paused = false;
      document.getElementById("btnPause").textContent = "Pausar";
    }
    draw();
  }

  function worldToScreen(wx, wy) {
    return {
      x: wx - cam.x + canvas.width / 2,
      y: wy - cam.y + canvas.height / 2
    };
  }

  function screenToWorld(sx, sy) {
    return {
      x: sx + cam.x - canvas.width / 2,
      y: sy + cam.y - canvas.height / 2
    };
  }

  function marbleWorldPos(uni, marble) {
    const R = circleRadius(uni);
    if (marble.onPlanetId) {
      const planet = uni.planets.find((p) => p.id === marble.onPlanetId);
      if (planet) {
        const orbit = planetOrbitRadius(uni, planet);
        const px = Math.cos(planet.angle) * orbit;
        const py = Math.sin(planet.angle) * orbit;
        const pr = 10 + planet.size * 0.22;
        return {
          x: px + Math.cos(marble.angle) * pr * marble.radius,
          y: py + Math.sin(marble.angle) * pr * marble.radius,
          r: 8
        };
      }
    }
    return {
      x: Math.cos(marble.angle) * R * marble.radius,
      y: Math.sin(marble.angle) * R * marble.radius,
      r: 11
    };
  }

  function marblePos(uni, marble) {
    const world = marbleWorldPos(uni, marble);
    const screen = worldToScreen(world.x, world.y);
    return { x: screen.x, y: screen.y, r: world.r };
  }

  function nearestMarbleToCam(uni) {
    let best = null;
    let bestDist = Infinity;
    uni.marbles.forEach((marble) => {
      const pos = marbleWorldPos(uni, marble);
      const dist = Math.hypot(pos.x - cam.x, pos.y - cam.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = marble;
      }
    });
    return { marble: best, dist: bestDist };
  }

  function teleportDistance(uni) {
    return Math.max(240, Math.min(380, circleRadius(uni) * 0.45));
  }

  function maybeTeleportToNearest(uni, force) {
    if (!uni || !uni.marbles.length) return false;
    if (!force && teleportCooldown > 0) return false;
    const near = nearestMarbleToCam(uni);
    if (!near.marble) return false;
    if (!force && near.dist <= teleportDistance(uni)) return false;
    const pos = marbleWorldPos(uni, near.marble);
    cam.x = pos.x;
    cam.y = pos.y;
    teleportCooldown = 900;
    setStatus("Te teletransportaste junto a " + near.marble.name + ".", true);
    return true;
  }

  function planetOrbitRadius(uni, planet) {
    const base = circleRadius(uni) + 40;
    if (planet.orbit === "hot") return base * 0.55;
    if (planet.orbit === "cold") return base * 1.35;
    return base * 0.95;
  }

  function ensureFaceImage(faceId) {
    if (!faceId || faceImages[faceId]) return faceImages[faceId] || null;
    const face = loadFaces().find((f) => f.id === faceId);
    const src = faceThumb(face);
    if (!src) return null;
    const img = new Image();
    img.src = src;
    faceImages[faceId] = img;
    return img;
  }

  function draw() {
    const uni = getUniverse();
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const space = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, w * 0.7);
    space.addColorStop(0, "#111827");
    space.addColorStop(1, "#020617");
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, w, h);

    if (!uni) return;
    const origin = worldToScreen(0, 0);

    if (uni.hasSun) {
      const glow = ctx.createRadialGradient(origin.x, origin.y, 8, origin.x, origin.y, 70);
      glow.addColorStop(0, "#fff7ae");
      glow.addColorStop(0.4, "#fbbf24");
      glow.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fde68a";
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    const R = circleRadius(uni);
    ctx.beginPath();
    ctx.fillStyle = uni.blackBall ? "#0a0a0a" : "#facc15";
    ctx.arc(origin.x, origin.y, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = uni.blackBall ? "rgba(250,204,21,0.35)" : "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Estrellas DENTRO del círculo amarillo (coordenadas del universo)
    const starCount = Math.min(uni.stars, 120);
    for (let i = 0; i < starCount; i += 1) {
      const seed = i * 9973 + 41;
      const angle = ((seed * 17) % 628319) / 100000;
      const t = ((seed * 53) % 10000) / 10000;
      const rr = Math.sqrt(t) * (R * 0.82);
      const screen = worldToScreen(Math.cos(angle) * rr, Math.sin(angle) * rr);
      const first = i === 0;
      const rad = first ? Math.max(3.2, R * 0.035) : Math.max(1.2, R * 0.012);
      ctx.fillStyle = first ? "#fffbeb" : uni.blackBall ? "rgba(255,255,255,0.9)" : "rgba(30,20,0,0.55)";
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, rad, 0, Math.PI * 2);
      ctx.fill();
      if (first) {
        ctx.strokeStyle = "rgba(251,191,36,0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, rad + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    uni.planets.forEach((planet) => {
      const orbit = planetOrbitRadius(uni, planet);
      ctx.strokeStyle = "rgba(165,180,252,0.25)";
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, orbit, 0, Math.PI * 2);
      ctx.stroke();
      const worldX = Math.cos(planet.angle) * orbit;
      const worldY = Math.sin(planet.angle) * orbit;
      const screen = worldToScreen(worldX, worldY);
      const pr = 10 + planet.size * 0.22;
      if (planet.hasLife) {
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.ellipse(screen.x - pr * 0.1, screen.y, pr * 0.55, pr * 0.35, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = planet.orbit === "hot" ? "#ea580c" : "#67e8f9";
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(planet.name, screen.x, screen.y + pr + 14);
    });

    uni.marbles.forEach((marble) => {
      const pos = marblePos(uni, marble);
      const selected = marble.id === selectedMarbleId;
      ctx.beginPath();
      ctx.fillStyle = marble.color;
      ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
      ctx.fill();
      if (selected) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      const img = ensureFaceImage(marble.faceId);
      if (img && img.complete && img.naturalWidth) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, pos.x - pos.r, pos.y - pos.r, pos.r * 2, pos.r * 2);
        ctx.restore();
      }
      if (marble.talk && marble.talkUntil > Date.now()) {
        const tw = Math.min(160, 24 + marble.talk.length * 6);
        const tx = pos.x;
        const ty = pos.y - pos.r - 28;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        roundRect(tx - tw / 2, ty - 16, tw, 28, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.font = "11px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(marble.talk, tx, ty + 2);
      }
      ctx.fillStyle = selected ? "#fde68a" : "#e2e8f0";
      ctx.font = "10px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(marble.name, pos.x, pos.y + pos.r + 12);
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function hitMarble(x, y) {
    const uni = getUniverse();
    if (!uni) return null;
    for (let i = uni.marbles.length - 1; i >= 0; i -= 1) {
      const m = uni.marbles[i];
      const p = marblePos(uni, m);
      if (Math.hypot(p.x - x, p.y - y) <= p.r + 4) return m;
    }
    return null;
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function startLoop() {
    stopLoop();
    lastTick = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const uni = getUniverse();
    if (!uni) return;
    const dt = Math.min(100, now - lastTick);
    lastTick = now;
    if (teleportCooldown > 0) teleportCooldown = Math.max(0, teleportCooldown - dt);
    if (!paused && !planetPromptOpen) {
      const rate = YEAR_SCALES[uni.yearScale] || YEAR_SCALES.s;
      const before = uni.years;
      let add = dt * rate;
      if (add > 5e8) add = 5e8;
      uni.years += add;
      applyMilestones(uni, before);
      if (Math.floor(before / 1000) !== Math.floor(uni.years / 1000)) persist();
      updateAgeLabel();
    }
    if (!drag && !pan) maybeTeleportToNearest(uni, false);
    uni.marbles.forEach((m) => {
      if (m.talk && m.talkUntil && m.talkUntil < Date.now()) m.talk = "";
    });
    draw();
  }

  function openConfig() {
    const uni = getUniverse();
    if (!uni) return;
    document.getElementById("yearScale").value = uni.yearScale;
    document.getElementById("modalConfig").hidden = false;
  }

  function openLife() {
    const uni = getUniverse();
    if (!uni) return;
    document.getElementById("lifeName").value = "";
    document.getElementById("lifeColor").value = "#55d6ff";
    document.getElementById("lifeFamily").value = "";
    document.getElementById("lifeStatus").textContent = "";
    const p1 = document.getElementById("lifeParent1");
    const p2 = document.getElementById("lifeParent2");
    [p1, p2].forEach((sel) => {
      sel.innerHTML = '<option value="">Ninguno</option>';
      uni.marbles.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        sel.appendChild(opt);
      });
    });
    document.getElementById("modalLife").hidden = false;
  }

  function createLife() {
    const uni = getUniverse();
    if (!uni) return;
    const status = document.getElementById("lifeStatus");
    const name = document.getElementById("lifeName").value.trim();
    const color = document.getElementById("lifeColor").value;
    const family = document.getElementById("lifeFamily").value.trim();
    const parent1 = document.getElementById("lifeParent1").value;
    const parent2 = document.getElementById("lifeParent2").value;
    if (!name) {
      status.textContent = "Poné un nombre.";
      status.className = "status bad";
      return;
    }
    if (parent1 && parent2 && parent1 === parent2) {
      status.textContent = "Los padres tienen que ser distintos.";
      status.className = "status bad";
      return;
    }
    const parents = [parent1, parent2].filter(Boolean);
    const lifePlanet = uni.planets.find((p) => p.hasLife);
    const child = normalizeMarble({
      id: makeId("m"),
      name: name,
      color: color,
      family: family,
      parentIds: parents,
      angle: Math.random() * Math.PI * 2,
      radius: 0.2 + Math.random() * 0.4,
      onPlanetId: lifePlanet ? lifePlanet.id : ""
    });
    uni.marbles.push(child);
    persist();
    status.textContent = child.name + " nació" + (family ? " en " + family : "") + ".";
    status.className = "status ok";
    setStatus(child.name + " se unió al universo.", true);
    draw();
  }

  function openFacePicker() {
    if (!selectedMarbleId) return;
    const faces = loadFaces();
    const list = document.getElementById("faceList");
    const empty = document.getElementById("faceEmpty");
    list.innerHTML = "";
    empty.hidden = faces.length > 0;
    const none = document.createElement("button");
    none.type = "button";
    none.className = "face-card";
    none.innerHTML = "<strong>Sin cara</strong>";
    none.addEventListener("click", () => applyFace(""));
    list.appendChild(none);
    faces.forEach((face) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "face-card";
      const src = faceThumb(face);
      btn.innerHTML = (src ? '<img alt="" />' : "") + "<strong></strong>";
      if (src) btn.querySelector("img").src = src;
      btn.querySelector("strong").textContent = face.name || "Cara";
      btn.addEventListener("click", () => applyFace(face.id));
      list.appendChild(btn);
    });
    document.getElementById("modalFace").hidden = false;
  }

  function applyFace(faceId) {
    const uni = getUniverse();
    const marble = uni && uni.marbles.find((m) => m.id === selectedMarbleId);
    if (!marble) return;
    marble.faceId = faceId || "";
    if (faceId) ensureFaceImage(faceId);
    persist();
    document.getElementById("modalFace").hidden = true;
    setStatus(marble.name + " cambió de cara.", true);
    draw();
  }

  function openTalk() {
    if (!selectedMarbleId) return;
    document.getElementById("talkText").value = "";
    document.getElementById("modalTalk").hidden = false;
  }

  function sendTalk() {
    const uni = getUniverse();
    const marble = uni && uni.marbles.find((m) => m.id === selectedMarbleId);
    if (!marble) return;
    const text = document.getElementById("talkText").value.trim();
    if (!text) return;
    marble.talk = text.slice(0, 80);
    marble.talkUntil = Date.now() + 5000;
    persist();
    document.getElementById("modalTalk").hidden = true;
    draw();
  }

  canvas.addEventListener("pointerdown", (event) => {
    const uni = getUniverse();
    if (!uni) return;
    const pt = canvasPoint(event);
    const hit = hitMarble(pt.x, pt.y);
    selectedMarbleId = hit ? hit.id : null;
    updateTools();
    canvas.setPointerCapture(event.pointerId);
    if (hit) {
      drag = { id: hit.id };
      pan = null;
    } else {
      drag = null;
      pan = { x: pt.x, y: pt.y, camX: cam.x, camY: cam.y };
    }
    draw();
  });

  canvas.addEventListener("pointermove", (event) => {
    const uni = getUniverse();
    if (!uni) return;
    const pt = canvasPoint(event);
    if (pan) {
      cam.x = pan.camX - (pt.x - pan.x);
      cam.y = pan.camY - (pt.y - pan.y);
      draw();
      return;
    }
    if (!drag) return;
    const marble = uni.marbles.find((m) => m.id === drag.id);
    if (!marble) return;
    const world = screenToWorld(pt.x, pt.y);
    if (marble.onPlanetId) {
      const planet = uni.planets.find((p) => p.id === marble.onPlanetId);
      if (!planet) return;
      const orbit = planetOrbitRadius(uni, planet);
      const px = Math.cos(planet.angle) * orbit;
      const py = Math.sin(planet.angle) * orbit;
      const pr = 10 + planet.size * 0.22;
      const dx = world.x - px;
      const dy = world.y - py;
      marble.angle = Math.atan2(dy, dx);
      marble.radius = clamp(Math.hypot(dx, dy) / Math.max(1, pr), 0.1, 0.9);
    } else {
      const R = circleRadius(uni);
      marble.angle = Math.atan2(world.y, world.x);
      marble.radius = clamp(Math.hypot(world.x, world.y) / Math.max(1, R), 0.08, 0.92);
    }
    draw();
  });

  canvas.addEventListener("pointerup", () => {
    const uni = getUniverse();
    if (drag) persist();
    if (pan && uni) maybeTeleportToNearest(uni, false);
    drag = null;
    pan = null;
  });

  document.getElementById("btnOpenSaves").addEventListener("click", () => {
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnNewUniverse").addEventListener("click", openCreate);
  document.getElementById("btnBackSaves").addEventListener("click", () => {
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnStartUniverse").addEventListener("click", startUniverse);
  document.getElementById("btnPlayBack").addEventListener("click", () => {
    stopLoop();
    persist();
    activeId = null;
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnPause").addEventListener("click", () => {
    if (planetPromptOpen) return;
    paused = !paused;
    document.getElementById("btnPause").textContent = paused ? "Reanudar" : "Pausar";
  });
  document.getElementById("btnConfig").addEventListener("click", openConfig);
  document.getElementById("btnSaveConfig").addEventListener("click", () => {
    const uni = getUniverse();
    if (!uni) return;
    uni.yearScale = document.getElementById("yearScale").value;
    persist();
    updateAgeLabel();
    document.getElementById("modalConfig").hidden = true;
    setStatus("Escala guardada: " + scaleLabel(uni.yearScale) + " = 1 año.", true);
  });
  document.getElementById("btnCloseConfig").addEventListener("click", () => {
    document.getElementById("modalConfig").hidden = true;
  });
  document.getElementById("btnLife").addEventListener("click", openLife);
  document.getElementById("btnCreateLife").addEventListener("click", createLife);
  document.getElementById("btnCloseLife").addEventListener("click", () => {
    document.getElementById("modalLife").hidden = true;
  });
  document.getElementById("btnFace").addEventListener("click", openFacePicker);
  document.getElementById("btnCloseFace").addEventListener("click", () => {
    document.getElementById("modalFace").hidden = true;
  });
  document.getElementById("btnTalk").addEventListener("click", openTalk);
  document.getElementById("btnSendTalk").addEventListener("click", sendTalk);
  document.getElementById("btnCloseTalk").addEventListener("click", () => {
    document.getElementById("modalTalk").hidden = true;
  });
  document.getElementById("planetLife").addEventListener("change", syncPlanetOrbitField);
  document.getElementById("btnSavePlanet").addEventListener("click", savePlanet);
  document.getElementById("btnClosePlanet").addEventListener("click", () => {
    document.getElementById("modalPlanet").hidden = true;
    planetPromptOpen = false;
    paused = false;
    document.getElementById("btnPause").textContent = "Pausar";
  });

  saves = readSaves();
})();
