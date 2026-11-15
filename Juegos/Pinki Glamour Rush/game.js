(function () {
  "use strict";

  const KEY = "pinki-glamour-v1";
  const RADIUS = 15;
  const GRAV = 1800;
  const PLASMA_GRAV = 720;
  const MAX = 280;
  const PLASMA_MAX = 460;
  const VIEW_W = 960;
  const VIEW_H = 480;
  const LEVELS = 50;
  const POINTS = { gem: 10, bow: 50, crown: 200 };
  const BEAT_WINDOW = 0.11;

  const THEMES = [
    { name: "Rosa Neón", bg: "#2a0a22", glass: "#f9a8d4", glow: "#fb7185" },
    { name: "Cristal", bg: "#140820", glass: "#e9d5ff", glow: "#c084fc" },
    { name: "Fiesta", bg: "#2a1038", glass: "#fbcfe8", glow: "#f472b6" },
    { name: "Galaxia", bg: "#0d0620", glass: "#a5b4fc", glow: "#818cf8" },
    { name: "Fuego Dulce", bg: "#2a0c10", glass: "#fecdd3", glow: "#fb7185" },
    { name: "Nube Rosa", bg: "#241028", glass: "#f5d0fe", glow: "#e879f9" },
    { name: "Oro Glam", bg: "#241808", glass: "#fde68a", glow: "#fbbf24" },
    { name: "Espejos", bg: "#12121f", glass: "#e2e8f0", glow: "#f9a8d4" },
    { name: "Viento Pop", bg: "#042028", glass: "#a5f3fc", glow: "#22d3ee" },
    { name: "Medianoche", bg: "#120818", glass: "#ddd6fe", glow: "#a78bfa" }
  ];

  const ACCESSORIES = [
    { id: "none", name: "Sin accesorio", price: 0 },
    { id: "lentes", name: "Lentes de Sol Neón", price: 30 },
    { id: "corona", name: "Corona Dorada", price: 80 },
    { id: "sombrero", name: "Sombrero de Fiesta", price: 50 },
    { id: "mono", name: "Mini-Moño Rosa", price: 40 },
    { id: "casco", name: "Casco Brillante", price: 100 }
  ];

  const TRAILS = [
    { id: "classic", name: "Brillo clásico", price: 0 },
    { id: "estrellas", name: "Estrellas Rosas", price: 25 },
    { id: "corazones", name: "Corazones de Plasma", price: 60 },
    { id: "dorados", name: "Destellos Dorados", price: 90 },
    { id: "fuego", name: "Nubes de Fuego", price: 120 },
    { id: "galaxias", name: "Galaxias Espaciales", price: 160 }
  ];

  const canvas = document.getElementById("runway");
  const ctx = canvas.getContext("2d");

  let profile = loadProfile();
  let mode = "solo";
  let picked = null;
  let level = null;
  let actors = [];
  let player = null;
  let particles = [];
  let phase = "idle";
  let ended = false;
  let endReason = "";
  let countdownLeft = 0;
  let beatPerfAt = 0;
  let nextBeatTime = 0;
  let camX = 0;
  let last = 0;
  let runGems = 0;
  let flashStart = 0;
  let flashDone = 0;
  let earnedStars = 0;
  let statusText = "";
  let statusUntil = 0;
  let audio = null;
  let shopBack = "screenMenu";
  const held = { left: false, right: false };
  let jumpQueued = false;

  function loadProfile() {
    const blank = {
      gems: 0,
      accessory: "none",
      trail: "classic",
      ownedAcc: ["none"],
      ownedTrail: ["classic"],
      stars: {},
      best: {}
    };
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      const ownedAcc = Array.isArray(data.ownedAcc) ? data.ownedAcc.slice() : ["none"];
      const ownedTrail = Array.isArray(data.ownedTrail) ? data.ownedTrail.slice() : ["classic"];
      if (!ownedAcc.includes("none")) ownedAcc.unshift("none");
      if (!ownedTrail.includes("classic")) ownedTrail.unshift("classic");
      return {
        gems: Math.max(0, Math.floor(Number(data.gems) || 0)),
        accessory: ownedAcc.includes(data.accessory) ? data.accessory : "none",
        trail: ownedTrail.includes(data.trail) ? data.trail : "classic",
        ownedAcc,
        ownedTrail,
        stars: data.stars && typeof data.stars === "object" ? data.stars : {},
        best: data.best && typeof data.best === "object" ? data.best : {}
      };
    } catch (_err) {
      return blank;
    }
  }

  function saveProfile() {
    localStorage.setItem(KEY, JSON.stringify(profile));
  }

  function packs() {
    try {
      return window.SharedPacks ? SharedPacks.load() : [];
    } catch (_err) {
      return [];
    }
  }

  function allMarbles() {
    const list = [];
    packs().forEach((pack) => {
      if (!pack || !Array.isArray(pack.marbles)) return;
      pack.marbles.forEach((marble, index) => {
        if (!marble || !marble.name) return;
        list.push({
          id: String(marble.id || pack.id + "-" + index),
          name: String(marble.name),
          color: marble.color || "#ff7ab8",
          packId: String(pack.id || pack.name || "pack"),
          packName: String(pack.name || "Pack")
        });
      });
    });
    return list;
  }

  function totalStars() {
    let sum = 0;
    for (let i = 1; i <= LEVELS; i++) sum += Math.min(3, Number(profile.stars[String(i)]) || 0);
    return sum;
  }

  function unlocked(n) {
    if (n <= 1) return true;
    return (Number(profile.stars[String(n - 1)]) || 0) >= 1;
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    if (id !== "screenPlay") {
      held.left = false;
      held.right = false;
      jumpQueued = false;
    }
  }

  function setStatus(text, ms) {
    statusText = text;
    statusUntil = performance.now() + (ms || 1400);
  }

  function mulberry(seed) {
    let s = seed >>> 0;
    return function rand() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function buildLevel(n) {
    const rand = mulberry((n * 1103515245 + 12345) >>> 0);
    const theme = THEMES[(n - 1) % THEMES.length];
    const ground = 372;
    const platforms = [];
    const mirrors = [];
    const fans = [];
    const pickups = [];
    const segments = 7 + Math.floor(n / 3);
    let x = 30;

    function addGround(w, kind) {
      const plat = { x, y: ground, w, h: 24, kind };
      platforms.push(plat);
      x += w;
      return plat;
    }

    function sprinkle(plat) {
      if (plat.kind !== "glass") return;
      for (let gx = plat.x + 40; gx < plat.x + plat.w - 28; gx += 110) {
        if (rand() < 0.8) {
          const high = rand() < 0.4;
          pickups.push({
            x: gx,
            y: ground - (high ? 78 : 50),
            kind: "gem",
            taken: false
          });
        }
      }
    }

    sprinkle(addGround(680, "glass"));

    for (let i = 0; i < segments; i++) {
      const gap = Math.round(68 + rand() * Math.min(50, 16 + n * 0.7));
      if (i > 0 && rand() < 0.5) {
        fans.push({
          x: x + 6,
          y: ground - 86,
          w: Math.max(28, gap - 12),
          h: 96,
          dir: rand() < 0.62 ? -1 : 1,
          force: 120 + Math.min(180, n * 2)
        });
      }
      x += gap;
      const w = Math.round(230 + rand() * 190);
      const kind = n > 2 && rand() < Math.min(0.24, n / 160) ? "black" : "glass";
      const base = addGround(w, kind);
      sprinkle(base);

      if (rand() < Math.min(0.55, 0.2 + n * 0.008) && w > 250) {
        const step = { x: base.x + 18, y: ground - 78, w: 96, h: 16, kind: "glass" };
        const high = { x: base.x + 86, y: ground - 160, w: Math.max(90, w - 130), h: 16, kind: "glass" };
        platforms.push(step, high);
        mirrors.push({ x: base.x + w - 64, y: ground - 136, w: 16, h: 136 });
        if (rand() < 0.85) {
          pickups.push({ x: high.x + high.w * 0.55, y: high.y - 46, kind: "bow", taken: false });
        }
      }
    }

    const grounds = platforms.filter((plat) => plat.y === ground && plat.kind === "glass" && plat.w > 160);
    const crowns = n >= 25 ? 2 : 1;
    for (let c = 0; c < crowns; c++) {
      const host = grounds[Math.min(grounds.length - 1, 1 + c * 2)] || grounds[0];
      const cx = host.x + Math.min(host.w - 90, 80 + c * 30);
      platforms.push({ x: host.x + 24, y: ground - 78, w: 88, h: 16, kind: "glass" });
      platforms.push({ x: cx, y: ground - 300, w: 78, h: 14, kind: "glass" });
      pickups.push({ x: cx + 36, y: ground - 334, kind: "crown", taken: false });
    }

    if (!pickups.some((item) => item.kind === "bow")) {
      platforms.push({ x: 760, y: ground - 160, w: 120, h: 16, kind: "glass" });
      pickups.push({ x: 820, y: ground - 206, kind: "bow", taken: false });
    }

    x += 46;
    const carpet = { x, y: ground, w: 320, h: 24, kind: "carpet" };
    platforms.push(carpet);
    return {
      n,
      theme,
      ground,
      platforms,
      mirrors,
      fans,
      pickups,
      finishX: carpet.x + 86,
      worldW: carpet.x + carpet.w + 80,
      bpm: 112 + (n % 6) * 2
    };
  }

  function renderMenu() {
    document.getElementById("menuInfo").textContent =
      "Gemas de cristal: " + profile.gems + " · Estrellas " + totalStars() + "/" + LEVELS * 3;
  }

  function renderPick() {
    const list = document.getElementById("marbleList");
    list.innerHTML = "";
    const marbles = allMarbles();
    if (!marbles.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No hay pelotitas en tus packs. Creá alguna en Packs y volvé a la pasarela.";
      list.appendChild(empty);
      return;
    }
    marbles.forEach((marble) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "marble";
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = marble.color;
      const label = document.createElement("span");
      label.textContent = marble.name + " · " + marble.packName;
      btn.append(dot, label);
      btn.addEventListener("click", () => {
        picked = marble;
        renderLevels();
        show("screenLevels");
      });
      list.appendChild(btn);
    });
  }

  function starText(count) {
    const n = Math.max(0, Math.min(3, count || 0));
    return "★★★".slice(0, n) + "☆☆☆".slice(0, 3 - n);
  }

  function renderLevels() {
    document.getElementById("levelTitle").textContent = mode === "race" ? "Carrera de Glamour" : "Pasarela individual";
    document.getElementById("levelHint").textContent = picked
      ? picked.name + " sale a desfilar. Cada nivel se abre al terminar el anterior."
      : "";
    const grid = document.getElementById("levelGrid");
    grid.innerHTML = "";
    for (let n = 1; n <= LEVELS; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-btn";
      const open = unlocked(n);
      const stars = Number(profile.stars[String(n)]) || 0;
      if (stars > 0) btn.classList.add("done");
      btn.disabled = !open;
      const strong = document.createElement("strong");
      strong.textContent = open ? String(n) : "🔒";
      const small = document.createElement("small");
      small.textContent = open ? starText(stars) : "";
      btn.append(strong, small);
      if (open) btn.addEventListener("click", () => startLevel(n));
      grid.appendChild(btn);
    }
  }

  function renderShop() {
    document.getElementById("shopGems").textContent = "Inventario: " + profile.gems + " gemas de cristal rosa";
    const root = document.getElementById("shopList");
    root.innerHTML = "";
    addShopGroup(root, "Accesorios para pelotitas", ACCESSORIES, "acc");
    addShopGroup(root, "Rastros de velocidad", TRAILS, "trail");
  }

  function addShopGroup(root, title, items, kind) {
    const heading = document.createElement("h3");
    heading.className = "shop-title";
    heading.textContent = title;
    root.appendChild(heading);
    const list = document.createElement("div");
    list.className = "shop-list";
    const owned = kind === "acc" ? profile.ownedAcc : profile.ownedTrail;
    const equipped = kind === "acc" ? profile.accessory : profile.trail;
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-item";
      const has = owned.includes(item.id);
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = item.name + (equipped === item.id ? " · puesto" : "");
      const detail = document.createElement("span");
      detail.textContent = has ? "Tocar para equipar" : item.price + " gemas";
      label.append(name, detail);
      btn.appendChild(label);
      btn.disabled = !has && profile.gems < item.price;
      btn.addEventListener("click", () => buy(kind, item.id));
      list.appendChild(btn);
    });
    root.appendChild(list);
  }

  function buy(kind, id) {
    const items = kind === "acc" ? ACCESSORIES : TRAILS;
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const owned = kind === "acc" ? profile.ownedAcc : profile.ownedTrail;
    if (!owned.includes(id)) {
      if (profile.gems < item.price) return;
      profile.gems -= item.price;
      owned.push(id);
    }
    if (kind === "acc") profile.accessory = id;
    else profile.trail = id;
    saveProfile();
    renderShop();
    renderMenu();
  }

  function rivalsFor(marble) {
    const rest = allMarbles().filter((item) => item.id !== marble.id);
    const same = rest.filter((item) => item.packId === marble.packId);
    const pool = same.length ? same : rest;
    const chosen = [];
    const used = new Set();
    pool.forEach((item) => {
      if (chosen.length >= 3 || used.has(item.id)) return;
      used.add(item.id);
      chosen.push(item);
    });
    const colors = ["#f9a8d4", "#c4b5fd", "#67e8f9"];
    while (chosen.length < 3) {
      const index = chosen.length;
      chosen.push({
        id: "ia-glamour-" + index,
        name: "IA Glamour " + (index + 1),
        color: colors[index],
        packId: "ia",
        packName: "IA"
      });
    }
    return chosen;
  }

  function makeActor(marble, isPlayer, index) {
    return {
      id: marble.id,
      name: marble.name,
      color: marble.color || "#ff7ab8",
      player: isPlayer,
      ai: !isPlayer,
      skill: Math.min(0.82, 0.38 + (level.n * 0.006) + (index || 0) * 0.07),
      x: 120 - (index || 0) * 22,
      y: level.ground - RADIUS,
      vx: 0,
      vy: 0,
      grounded: true,
      leftGround: 0,
      jumps: 0,
      perfects: 0,
      style: 0,
      finished: false,
      out: false,
      finishAt: 0,
      plasmaUntil: 0,
      noPlasmaUntil: 0,
      onBlack: false,
      lastJump: 0,
      jumpQueued: false,
      stuckX: 120,
      stuckTime: 0,
      prevY: level.ground - RADIUS
    };
  }

  function startLevel(n) {
    ensureAudio();
    level = buildLevel(n);
    actors = [makeActor(picked, true, 0)];
    if (mode === "race") {
      rivalsFor(picked).forEach((marble, index) => actors.push(makeActor(marble, false, index + 1)));
    }
    player = actors[0];
    particles = [];
    camX = 0;
    runGems = 0;
    ended = false;
    endReason = "";
    phase = "countdown";
    countdownLeft = 3;
    beatPerfAt = 0;
    nextBeatTime = 0;
    jumpQueued = false;
    show("screenPlay");
    setStatus("Saltá cuando el piso brilla. El carril de arriba pasa los espejos.", 4200);
    refreshHud(performance.now());
  }

  function beatState(now) {
    const period = 60 / (level ? level.bpm : 116);
    if (!beatPerfAt || phase !== "play") return { period, into: period, open: false };
    const elapsed = Math.max(0, (now - beatPerfAt) / 1000);
    const into = elapsed % period;
    const delta = Math.min(into, period - into);
    return { period, into, open: delta <= BEAT_WINDOW };
  }

  function plasmaOn(actor, now) {
    return now < actor.plasmaUntil && now >= actor.noPlasmaUntil;
  }

  function findSupport(actor) {
    let best = null;
    const feet = actor.y + RADIUS;
    const prev = actor.prevY + RADIUS;
    level.platforms.forEach((plat) => {
      if (actor.x + RADIUS * 0.35 < plat.x || actor.x - RADIUS * 0.35 > plat.x + plat.w) return;
      if (actor.vy < 0) return;
      const crossed = prev <= plat.y + 12 && feet >= plat.y - 8;
      const near = feet >= plat.y - 12 && feet <= plat.y + 30;
      if (!crossed && !near) return;
      if (!best || plat.y < best.y) best = plat;
    });
    return best;
  }

  function supportUnder(x, feet) {
    return level.platforms.some((plat) => x >= plat.x && x <= plat.x + plat.w && feet >= plat.y - 8 && feet <= plat.y + 36);
  }

  function tryJump(actor, now) {
    const coyote = actor.grounded || (actor.leftGround && now - actor.leftGround < 110);
    if (!coyote || actor.out || actor.finished) return;
    const perfect = beatState(now).open;
    actor.vy = perfect ? -820 : -650;
    actor.grounded = false;
    actor.leftGround = now;
    actor.lastJump = now;
    if (actor.player) {
      actor.jumps += 1;
      if (perfect) actor.perfects += 1;
    }
    if (perfect && now >= actor.noPlasmaUntil) {
      actor.plasmaUntil = now + 2000;
      if (actor.player) {
        setStatus("✨ Salto Glamour. Plasma Resplandeciente.", 1200);
        burst(actor.x, actor.y, "#fff", profile.trail, 10);
      }
    }
  }

  function think(actor, dt, now) {
    if (!actor.ai || actor.out || actor.finished) return;
    actor.right = true;
    actor.left = false;
    const ahead = actor.x + 64 + Math.max(0, actor.vx) * 0.1;
    const feet = actor.y + RADIUS;
    const hole = !supportUnder(ahead, feet + 4) && supportUnder(actor.x, feet + 4);
    const mirror = level.mirrors.some((wall) => wall.x > actor.x - 8 && wall.x < actor.x + 78 && feet > wall.y && actor.y - RADIUS < wall.y + wall.h);
    const beat = beatState(now).open && Math.random() < actor.skill;
    if (actor.grounded && now - actor.lastJump > 360 && (hole || mirror || beat)) actor.jumpQueued = true;
    if (actor.x < actor.stuckX + 6) actor.stuckTime += dt;
    else {
      actor.stuckX = actor.x;
      actor.stuckTime = 0;
    }
    if (actor.stuckTime > 1.15) {
      actor.vy = -820;
      actor.vx = 240;
      actor.grounded = false;
      actor.stuckTime = 0;
      actor.plasmaUntil = now + 800;
    }
  }

  function collect(actor, now) {
    level.pickups.forEach((item) => {
      if (item.taken || actor.out || actor.finished) return;
      const dx = actor.x - item.x;
      const dy = actor.y - item.y;
      if (dx * dx + dy * dy > (RADIUS + 14) * (RADIUS + 14)) return;
      item.taken = true;
      actor.style += POINTS[item.kind];
      if (item.kind === "gem" && actor.player) runGems += 1;
      if (item.kind === "bow") {
        actor.vx = Math.max(actor.vx, 360);
        if (actor.player) setStatus("🎀 Moño brillante. Mini-boost.", 1000);
      }
      if (item.kind === "crown" && actor.player) setStatus("👑 Corona de diamante. +200 de estilo.", 1200);
      burst(item.x, item.y, item.kind === "crown" ? "#ffd56a" : "#ff8ac4", item.kind === "gem" ? "estrellas" : "corazones", 8);
    });
    void now;
  }

  function stepActor(actor, dt, now) {
    if (actor.out || actor.finished) return;
    if (actor.player) {
      actor.left = held.left;
      actor.right = held.right;
      if (jumpQueued) {
        tryJump(actor, now);
        jumpQueued = false;
      }
    } else {
      think(actor, dt, now);
      if (actor.jumpQueued) {
        tryJump(actor, now);
        actor.jumpQueued = false;
      }
    }

    const plasma = plasmaOn(actor, now);
    const cap = plasma ? PLASMA_MAX : MAX;
    const accel = plasma ? 2200 : 1500;
    if (actor.right && actor.vx < cap) actor.vx = Math.min(cap, actor.vx + accel * dt);
    else if (actor.left) actor.vx = Math.max(-MAX * 0.72, actor.vx - accel * dt);
    else if (actor.grounded) actor.vx *= Math.exp(-2.4 * dt);
    if (actor.vx > cap) actor.vx = Math.max(cap, actor.vx - 640 * dt);
    if (actor.vx < -MAX * 0.72) actor.vx = -MAX * 0.72;

    level.fans.forEach((fan) => {
      const inside = actor.x > fan.x && actor.x < fan.x + fan.w && actor.y > fan.y && actor.y < fan.y + fan.h;
      if (inside) actor.vx += fan.dir * fan.force * dt;
    });
    actor.vx = Math.max(-520, Math.min(560, actor.vx));

    actor.prevY = actor.y;
    actor.vy += (plasma ? PLASMA_GRAV : GRAV) * dt;
    if (actor.vy > 1300) actor.vy = 1300;
    actor.x += actor.vx * dt;
    actor.y += actor.vy * dt;

    level.mirrors.forEach((wall) => {
      const hit = actor.x + RADIUS > wall.x && actor.x - RADIUS < wall.x + wall.w && actor.y + RADIUS > wall.y && actor.y - RADIUS < wall.y + wall.h;
      if (!hit) return;
      if (actor.x < wall.x + wall.w * 0.5) {
        actor.x = wall.x - RADIUS - 1;
        actor.vx = -Math.abs(actor.vx) * 0.62;
      } else {
        actor.x = wall.x + wall.w + RADIUS + 1;
        actor.vx = Math.abs(actor.vx) * 0.35;
      }
      if (actor.player) setStatus("🪞 Espejo falso. Cambiá al carril de arriba.", 1200);
    });

    const support = findSupport(actor);
    if (support) {
      actor.y = support.y - RADIUS;
      actor.vy = 0;
      actor.grounded = true;
      actor.leftGround = 0;
      if (support.kind === "black") {
        if (!actor.onBlack) {
          actor.onBlack = true;
          actor.plasmaUntil = 0;
          actor.noPlasmaUntil = now + 3000;
          actor.vx *= 0.4;
          if (actor.player) setStatus("🖤 Bloque anti-brillo. Sin plasma por 3 segundos.", 1600);
        }
      } else actor.onBlack = false;
    } else {
      actor.grounded = false;
      actor.onBlack = false;
      if (!actor.leftGround) actor.leftGround = now;
    }

    collect(actor, now);

    if (!actor.finished && actor.x >= level.finishX && actor.y < level.ground + 36) {
      actor.finished = true;
      actor.finishAt = now;
      actor.vx = 0;
      if (actor.player) endRun("clear");
    }

    if (!actor.out && actor.y > level.ground + 190) {
      actor.out = true;
      actor.vx = 0;
      if (actor.player) endRun("fall");
    }

    if (actor.player && Math.abs(actor.vx) > 30 && Math.random() < (plasma ? 0.8 : 0.35)) {
      particles.push({
        x: actor.x,
        y: actor.y,
        vx: -actor.vx * 0.05,
        vy: (Math.random() - 0.5) * 40,
        life: 0.4,
        max: 0.4,
        color: trailColor(profile.trail),
        shape: profile.trail
      });
    }
  }

  function endRun(reason) {
    if (ended) return;
    ended = true;
    endReason = reason;
    earnedStars = reason === "clear" ? computeStars() : 0;
    phase = "flash";
    flashStart = performance.now();
    flashDone = flashStart + 1200;
    profile.gems += runGems;
    runGems = 0;
    if (reason === "clear") {
      const key = String(level.n);
      profile.stars[key] = Math.max(Number(profile.stars[key]) || 0, earnedStars);
      profile.best[key] = Math.max(Number(profile.best[key]) || 0, player.style);
    }
    saveProfile();
    burst(player.x, player.y - 10, "#fff", "estrellas", 18);
    shutter();
  }

  function computeStars() {
    const rhythm = player.jumps ? player.perfects / player.jumps : 0;
    const possible = level.pickups.reduce((sum, item) => sum + POINTS[item.kind], 0);
    const ratio = possible ? player.style / possible : 0;
    let stars = 1;
    if (rhythm >= 0.55 || ratio >= 0.4) stars = 2;
    if (rhythm >= 0.8 && ratio >= 0.55) stars = 3;
    return stars;
  }

  function rhythmPercent() {
    if (!player || !player.jumps) return 0;
    return Math.round((player.perfects / player.jumps) * 100);
  }

  function update(dt, now) {
    if (phase === "countdown") {
      countdownLeft -= dt;
      if (countdownLeft <= 0) {
        phase = "play";
        beatPerfAt = now;
        jumpQueued = false;
        if (audio) nextBeatTime = audio.currentTime;
      }
      return;
    }
    if (phase !== "play") return;
    scheduleBeat();
    actors.forEach((actor) => stepActor(actor, dt, now));
    updateParticles(dt);
    camX = Math.max(0, Math.min(player.x - 280, level.worldW - VIEW_W));
    refreshHud(now);
  }

  function updateParticles(dt) {
    particles.forEach((spark) => {
      spark.life -= dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vy += 40 * dt;
    });
    particles = particles.filter((spark) => spark.life > 0);
  }

  function refreshHud(now) {
    const beat = beatState(now);
    document.getElementById("hudLevel").textContent = level ? String(level.n) + " · " + level.theme.name : "1";
    document.getElementById("hudStyle").textContent = player ? String(player.style) : "0";
    document.getElementById("hudRhythm").textContent = rhythmPercent() + "%";
    document.getElementById("hudGems").textContent = String(runGems + (ended ? 0 : 0));
    const fill = document.getElementById("beatFill");
    const ratio = beat.period ? beat.into / beat.period : 0;
    fill.style.width = Math.round(ratio * 100) + "%";
    fill.style.background = beat.open ? "#fff6c8" : "linear-gradient(90deg, #ff4f9a, #fff6fb)";
    const status = document.getElementById("playStatus");
    if (now < statusUntil && statusText) status.textContent = statusText;
    else if (player && plasmaOn(player, now)) status.textContent = "✨ Plasma Resplandeciente";
    else status.textContent = "A y D mueven. Espacio salta al ritmo del brillo.";
    const gemsLabel = document.getElementById("hudGems");
    gemsLabel.textContent = String(runGems);
  }

  function draw(now) {
    if (!level) return;
    const beat = beatState(now);
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, level.theme.bg);
    sky.addColorStop(1, "#070208");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (beat.open && phase === "play") {
      ctx.fillStyle = "rgba(255, 214, 236, 0.16)";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    ctx.save();
    ctx.translate(-camX, 0);
    drawNeonGrid();
    level.fans.forEach(drawFan);
    level.platforms.forEach((plat) => drawPlatform(plat, beat.open));
    level.mirrors.forEach(drawMirror);
    level.pickups.forEach((item) => {
      if (!item.taken) drawPickup(item, now);
    });
    particles.forEach(drawParticle);
    actors.forEach((actor) => {
      if (!actor.out) drawActor(actor, now);
    });
    ctx.restore();
    if (phase === "countdown") {
      ctx.fillStyle = "#fff6fb";
      ctx.font = "800 92px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(countdownLeft))), VIEW_W / 2, 180);
      ctx.textAlign = "left";
    }
    if (phase === "flash") drawFlash(now);
  }

  function drawNeonGrid() {
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < level.worldW; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIEW_H);
      ctx.stroke();
    }
  }

  function drawPlatform(plat, glow) {
    if (plat.kind === "carpet") {
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h + 18);
      for (let i = 0; i < plat.w; i += 20) {
        ctx.fillStyle = i % 40 === 0 ? "#7f1d1d" : "#ef4444";
        ctx.fillRect(plat.x + i, plat.y, 20, plat.h);
      }
      ctx.fillStyle = "#ffd56a";
      ctx.font = "700 16px Segoe UI, sans-serif";
      ctx.fillText("ALFOMBRA ROJA", plat.x + 18, plat.y - 10);
      return;
    }
    if (plat.kind === "black") {
      ctx.fillStyle = "#120814";
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.strokeStyle = "#4a044e";
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      return;
    }
    ctx.fillStyle = level.theme.glass;
    ctx.globalAlpha = 0.88;
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(plat.x, plat.y, plat.w, 4);
    if (glow) {
      ctx.strokeStyle = level.theme.glow;
      ctx.lineWidth = 3;
      ctx.strokeRect(plat.x - 1, plat.y - 1, plat.w + 2, plat.h + 2);
    }
  }

  function drawMirror(wall) {
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    ctx.setLineDash([]);
  }

  function drawFan(fan) {
    ctx.fillStyle = "rgba(103, 232, 249, 0.13)";
    ctx.fillRect(fan.x, fan.y, fan.w, fan.h);
    ctx.fillStyle = "#67e8f9";
    ctx.font = "18px Segoe UI, sans-serif";
    const arrow = fan.dir < 0 ? "←" : "→";
    ctx.fillText(arrow + arrow, fan.x + 6, fan.y + 28);
  }

  function drawPickup(item, now) {
    const bob = Math.sin(now / 180 + item.x) * 4;
    const x = item.x;
    const y = item.y + bob;
    if (item.kind === "gem") {
      ctx.fillStyle = "#ff7ab8";
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x, y + 12);
      ctx.lineTo(x - 9, y);
      ctx.fill();
      return;
    }
    if (item.kind === "bow") {
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(x - 8, y, 7, 0, Math.PI * 2);
      ctx.arc(x + 8, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd56a";
      ctx.fillRect(x - 3, y - 3, 6, 6);
      return;
    }
    ctx.fillStyle = "#ffd56a";
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 6);
    ctx.lineTo(x - 8, y - 10);
    ctx.lineTo(x, y + 2);
    ctx.lineTo(x + 8, y - 10);
    ctx.lineTo(x + 12, y + 6);
    ctx.fill();
  }

  function drawActor(actor, now) {
    if (actor.player && plasmaOn(actor, now)) {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(actor.x, actor.y, RADIUS + 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = actor.color;
    ctx.beginPath();
    ctx.arc(actor.x, actor.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawAccessory(actor);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(actor.name, actor.x, actor.y - 24);
    ctx.textAlign = "left";
  }

  function drawAccessory(actor) {
    if (!actor.player || profile.accessory === "none") return;
    const x = actor.x;
    const y = actor.y;
    ctx.save();
    if (profile.accessory === "lentes") {
      ctx.fillStyle = "#081018";
      ctx.fillRect(x - 11, y - 3, 8, 5);
      ctx.fillRect(x + 3, y - 3, 8, 5);
      ctx.strokeStyle = "#22d3ee";
      ctx.strokeRect(x - 11, y - 3, 8, 5);
      ctx.strokeRect(x + 3, y - 3, 8, 5);
    } else if (profile.accessory === "corona") {
      ctx.fillStyle = "#ffd56a";
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 8);
      ctx.lineTo(x - 8, y - 20);
      ctx.lineTo(x, y - 10);
      ctx.lineTo(x + 8, y - 20);
      ctx.lineTo(x + 12, y - 8);
      ctx.fill();
    } else if (profile.accessory === "sombrero") {
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 8);
      ctx.lineTo(x, y - 24);
      ctx.lineTo(x + 8, y - 8);
      ctx.fill();
      ctx.fillRect(x - 12, y - 10, 24, 4);
    } else if (profile.accessory === "mono") {
      ctx.fillStyle = "#ff4f9a";
      ctx.beginPath();
      ctx.arc(x - 7, y - 16, 5, 0, Math.PI * 2);
      ctx.arc(x + 7, y - 16, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (profile.accessory === "casco") {
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, RADIUS + 2, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function trailColor(id) {
    if (id === "corazones") return "#fb7185";
    if (id === "dorados") return "#ffd56a";
    if (id === "fuego") return "#fb923c";
    if (id === "galaxias") return "#a78bfa";
    if (id === "estrellas") return "#ff8ac4";
    return "#fbcfe8";
  }

  function drawParticle(spark) {
    const alpha = Math.max(0, spark.life / spark.max);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spark.color;
    if (spark.shape === "corazones") {
      ctx.beginPath();
      ctx.arc(spark.x - 3, spark.y, 3, 0, Math.PI * 2);
      ctx.arc(spark.x + 3, spark.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (spark.shape === "estrellas" || spark.shape === "dorados") {
      ctx.fillRect(spark.x - 2, spark.y - 6, 4, 12);
      ctx.fillRect(spark.x - 6, spark.y - 2, 12, 4);
    } else {
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.shape === "fuego" ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function burst(x, y, color, shape, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 220,
        vy: -Math.random() * 180,
        life: 0.55,
        max: 0.55,
        color,
        shape: shape || "classic"
      });
    }
  }

  function drawFlash(now) {
    const age = now - flashStart;
    [0, 220, 480, 780].forEach((mark) => {
      const dist = Math.abs(age - mark);
      if (dist < 140) {
        ctx.fillStyle = "rgba(255,255,255," + ((1 - dist / 140) * 0.82) + ")";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }
    });
    ctx.font = "40px Segoe UI Emoji, Segoe UI, sans-serif";
    ctx.fillText("📸", 36, 64);
    ctx.fillText("📸", VIEW_W - 84, 78);
    ctx.fillText("📸", VIEW_W / 2 - 20, 54);
  }

  function showResult() {
    phase = "result";
    const cleared = endReason === "clear";
    const stars = cleared ? earnedStars : 0;
    document.getElementById("resultTitle").textContent = cleared ? "Alfombra roja" : "Te caíste de la pasarela";
    const medal = document.getElementById("resultMedal");
    if (mode === "race") {
      const finished = actors.filter((actor) => actor.finished).slice().sort((a, b) => {
        if (b.style !== a.style) return b.style - a.style;
        return a.finishAt - b.finishAt;
      });
      const winner = finished[0];
      medal.textContent = winner
        ? (winner.player ? "👑 ¡Te llevás la corona de la partida!" : "👑 La corona es de " + winner.name)
        : "Nadie llegó a la alfombra.";
    } else {
      medal.textContent = cleared ? starText(stars) + " de glamour" : "Sin estrellas en esta pasada.";
    }
    const stats = document.getElementById("resultStats");
    stats.innerHTML = "";
    addStat(stats, "Puntaje total de estilo: " + (player ? player.style : 0));
    addStat(stats, "Sincronización de ritmo: " + rhythmPercent() + "% de Ritmo Perfecto");
    addStat(stats, "Estrellas ganadas: " + (cleared ? starText(stars) : "—"));
    addStat(stats, "Gemas en el inventario: " + profile.gems);
    if (mode === "race") {
      actors.forEach((actor) => {
        const state = actor.finished ? "llegó" : actor.out ? "se cayó" : "en la pasarela";
        addStat(stats, actor.name + " · " + actor.style + " estilo · " + state);
      });
    }
    const next = document.getElementById("btnNext");
    next.hidden = !(cleared && level.n < LEVELS);
    show("screenResult");
  }

  function addStat(list, text) {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  }

  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audio) audio = new AudioCtx();
    if (audio.state === "suspended") audio.resume();
  }

  function scheduleBeat() {
    if (!audio || phase !== "play" || !level) return;
    const period = 60 / level.bpm;
    if (nextBeatTime < audio.currentTime - 0.05) nextBeatTime = audio.currentTime;
    let guard = 0;
    while (nextBeatTime < audio.currentTime + 0.22 && guard < 3) {
      playKick(nextBeatTime, period);
      nextBeatTime += period;
      guard += 1;
    }
  }

  function playKick(time, period) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.12);
    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + 0.15);
    const hatTime = time + period * 0.5;
    const hat = audio.createOscillator();
    const hatGain = audio.createGain();
    hat.type = "square";
    hat.frequency.setValueAtTime(740, hatTime);
    hatGain.gain.setValueAtTime(0.018, hatTime);
    hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.05);
    hat.connect(hatGain);
    hatGain.connect(audio.destination);
    hat.start(hatTime);
    hat.stop(hatTime + 0.06);
  }

  function shutter() {
    if (!audio) return;
    const time = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1600, time);
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  function loop(now) {
    const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    if (phase === "countdown" || phase === "play") update(dt, now);
    else if (phase === "flash") updateParticles(dt);
    if (phase === "countdown" || phase === "play" || phase === "flash") draw(now);
    if (phase === "flash" && now >= flashDone) showResult();
    requestAnimationFrame(loop);
  }

  function holdButton(button, key) {
    const down = (event) => {
      event.preventDefault();
      ensureAudio();
      if (key === "jump") jumpQueued = true;
      else held[key] = true;
    };
    const up = () => {
      if (key !== "jump") held[key] = false;
    };
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
  }

  document.getElementById("btnStart").addEventListener("click", () => {
    ensureAudio();
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnSolo").addEventListener("click", () => {
    mode = "solo";
    renderPick();
    show("screenPick");
  });
  document.getElementById("btnRace").addEventListener("click", () => {
    mode = "race";
    renderPick();
    show("screenPick");
  });
  document.getElementById("btnShop").addEventListener("click", () => {
    shopBack = "screenMenu";
    renderShop();
    show("screenShop");
  });
  document.getElementById("btnBackMenu").addEventListener("click", () => {
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnBackPick").addEventListener("click", () => show("screenPick"));
  document.getElementById("btnShopBack").addEventListener("click", () => {
    if (shopBack === "screenResult") show("screenResult");
    else {
      renderMenu();
      show("screenMenu");
    }
  });
  document.getElementById("btnAgain").addEventListener("click", () => startLevel(level.n));
  document.getElementById("btnNext").addEventListener("click", () => startLevel(level.n + 1));
  document.getElementById("btnToShop").addEventListener("click", () => {
    shopBack = "screenResult";
    renderShop();
    show("screenShop");
  });
  document.getElementById("btnToMenu").addEventListener("click", () => {
    phase = "idle";
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnAbort").addEventListener("click", () => {
    if (!ended && (phase === "play" || phase === "countdown")) {
      profile.gems += runGems;
      runGems = 0;
      saveProfile();
    }
    ended = true;
    phase = "idle";
    renderMenu();
    show("screenMenu");
  });

  holdButton(document.getElementById("btnLeft"), "left");
  holdButton(document.getElementById("btnRight"), "right");
  holdButton(document.getElementById("btnJump"), "jump");
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    ensureAudio();
    jumpQueued = true;
  });

  window.addEventListener("keydown", (event) => {
    if (phase !== "countdown" && phase !== "play") return;
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      event.preventDefault();
      held.left = true;
    } else if (event.code === "ArrowRight" || event.code === "KeyD") {
      event.preventDefault();
      held.right = true;
    } else if (event.code === "Space" && !event.repeat) {
      event.preventDefault();
      ensureAudio();
      jumpQueued = true;
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") held.left = false;
    if (event.code === "ArrowRight" || event.code === "KeyD") held.right = false;
  });

  requestAnimationFrame(loop);
})();
