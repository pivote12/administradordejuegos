(function () {
  "use strict";

  const KEY = "carrera-blitz-v1";
  const GROUND = 348;
  const THICK = 86;
  const RADIUS = 16;
  const GRAV = 2150;
  const ACCEL = 2500;
  const MAX = 470;
  const VIEW_W = 960;
  const VIEW_H = 480;

  const TRAILS = [
    { id: "classic", name: "Clásico", price: 0, color: "#7dd3fc" },
    { id: "humo", name: "Humo rojo", price: 45, color: "#fb7185" },
    { id: "chispas", name: "Chispas", price: 90, color: "#facc15" },
    { id: "arco", name: "Arcoíris", price: 150, color: "#c084fc" },
    { id: "oro", name: "Oro Blitz", price: 240, color: "#fde68a" }
  ];

  const canvas = document.getElementById("track");
  const ctx = canvas.getContext("2d");

  let profile = loadProfile();
  let mode = "solo";
  let picked = null;
  let raceKind = "solo";
  let level = null;
  let actors = [];
  let player = null;
  let particles = [];
  let playing = false;
  let phase = "idle";
  let raceStart = 0;
  let countdown = 0;
  let camX = 0;
  let frame = 0;
  let last = 0;
  let sparksUntil = 0;
  const held = { left: false, right: false, jump: false, fast: false };

  function loadProfile() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      const owned = Array.isArray(data.owned) ? data.owned : ["classic"];
      if (!owned.includes("classic")) owned.unshift("classic");
      return {
        coins: Math.max(0, Math.floor(Number(data.coins) || 0)),
        trail: owned.includes(data.trail) ? data.trail : "classic",
        owned,
        best: data.best && typeof data.best === "object" ? data.best : {},
        crew: data.crew && data.crew.name ? data.crew : null
      };
    } catch (_err) {
      return { coins: 0, trail: "classic", owned: ["classic"], best: {}, crew: null };
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
          id: String(marble.id || (pack.id + "-" + index)),
          name: String(marble.name),
          color: marble.color || "#55d6ff",
          packId: String(pack.id || pack.name || "pack"),
          packName: String(pack.name || "Pack")
        });
      });
    });
    return list;
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function formatTime(ms) {
    const safe = Math.max(0, Math.floor(ms));
    const min = Math.floor(safe / 60000);
    const sec = Math.floor((safe % 60000) / 1000);
    const milli = safe % 1000;
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(milli).padStart(3, "0");
  }

  function kmh(vx) {
    return Math.round(Math.abs(vx) * 0.55);
  }

  function trailOf(id) {
    return TRAILS.find((item) => item.id === id) || TRAILS[0];
  }

  function renderMenu() {
    const crew = profile.crew ? profile.crew.name + " · " + formatTime(profile.crew.ms) : "todavía no hay";
    document.getElementById("menuRecord").textContent = "Récord de la tripulación: " + crew + " · Monedas: " + profile.coins;
  }

  function renderPick() {
    const list = document.getElementById("marbleList");
    const marbles = allMarbles();
    list.innerHTML = "";
    document.getElementById("pickTitle").textContent = mode === "solo" ? "Speedrun: elegí tu pelotita" : "Carrera: elegí tu pelotita";
    document.getElementById("pickHint").textContent = marbles.length
      ? "Sale de los packs que ya tenés."
      : "No hay packs con pelotitas. Creálos en Packs y volvé.";
    marbles.forEach((marble) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "marble";
      const dot = document.createElement("i");
      dot.className = "dot";
      dot.style.background = marble.color;
      const text = document.createElement("div");
      const best = profile.best[marble.id];
      text.innerHTML = "<strong></strong><span class='hint'></span>";
      text.querySelector("strong").textContent = marble.name;
      text.querySelector("span").textContent = marble.packName + (best ? " · récord " + formatTime(best) : " · sin récord");
      button.append(dot, text);
      button.addEventListener("click", () => chooseMarble(marble));
      list.appendChild(button);
    });
  }

  function chooseMarble(marble) {
    picked = marble;
    if (mode === "solo") {
      startRace("solo", []);
      return;
    }
    const mates = allMarbles().filter((item) => item.packId === marble.packId && item.id !== marble.id);
    document.getElementById("rivalHint").textContent = mates.length
      ? "En el pack hay " + mates.length + " pelotitas más."
      : "Ese pack no tiene otras pelotitas. El 1 vs 1 usa una IA. Todos contra todos necesita compañeras.";
    show("screenRival");
  }

  function renderShop() {
    document.getElementById("shopCoins").textContent = "Monedas Blitz: " + profile.coins;
    const list = document.getElementById("shopList");
    list.innerHTML = "";
    TRAILS.forEach((trail) => {
      const owned = profile.owned.includes(trail.id);
      const equipped = profile.trail === trail.id;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "shop-item";
      const dot = document.createElement("i");
      dot.className = "dot";
      dot.style.background = trail.color;
      const text = document.createElement("div");
      text.innerHTML = "<strong></strong><span class='hint'></span>";
      text.querySelector("strong").textContent = trail.name;
      text.querySelector("span").textContent = equipped ? "Equipado" : owned ? "Tocar para equipar" : trail.price + " monedas";
      row.append(dot, text);
      row.disabled = !owned && profile.coins < trail.price;
      row.addEventListener("click", () => {
        if (!owned) {
          if (profile.coins < trail.price) return;
          profile.coins -= trail.price;
          profile.owned.push(trail.id);
        }
        profile.trail = trail.id;
        saveProfile();
        renderShop();
      });
      list.appendChild(row);
    });
  }

  function compileLevel() {
    const platforms = [];
    const ramps = [];
    const tunnels = [];
    const stops = [];
    const lasers = [];
    let x = 30;
    let y = GROUND;
    let finishX = 0;
    const plan = [
      ["ground", 760], ["red", 180], ["ground", 420],
      ["ramp", 240, 120], ["gap", 280], ["fall", 620],
      ["ice", 740], ["ground", 220], ["stop", 36], ["ground", 400],
      ["laser", 440], ["red", 170], ["tunnel", 520], ["ground", 340],
      ["ramp", 260, 140], ["upper", 880], ["fall", 680],
      ["ice", 560], ["stop", 36], ["laser", 400], ["red", 180],
      ["ramp", 220, 110], ["gap", 250], ["fall", 500],
      ["tunnel", 560], ["ground", 280], ["stop", 36], ["ice", 460],
      ["red", 200], ["ground", 860], ["finish", 1]
    ];
    plan.forEach((seg, index) => {
      const type = seg[0];
      const w = seg[1];
      const rise = seg[2] || 0;
      if (type === "ground" || type === "red" || type === "ice") {
        platforms.push({ x, y, w, h: THICK, kind: type });
        x += w;
      } else if (type === "gap") {
        x += w;
      } else if (type === "ramp") {
        ramps.push({ x, w, h: rise, base: y });
        y -= rise;
        x += w;
      } else if (type === "upper") {
        platforms.push({ x, y, w, h: 28, kind: "upper" });
        x += w;
      } else if (type === "fall") {
        y = GROUND;
        platforms.push({ x, y, w, h: THICK, kind: "ground" });
        x += w;
      } else if (type === "tunnel") {
        platforms.push({ x, y: GROUND, w, h: THICK, kind: "ground" });
        tunnels.push({ x: x + 10, y: GROUND - 78, w: w - 20, h: 78 });
        y = GROUND;
        x += w;
      } else if (type === "stop") {
        platforms.push({ x, y: GROUND, w: 140, h: THICK, kind: "ground" });
        stops.push({ x: x + 52, y: GROUND - 86, w: 34, h: 86 });
        y = GROUND;
        x += 140;
      } else if (type === "laser") {
        platforms.push({ x, y: GROUND, w, h: THICK, kind: "ground" });
        lasers.push({ x: x + 30, y: GROUND - 150, w: 16, h: 150, span: Math.max(80, w - 80), phase: index });
        y = GROUND;
        x += w;
      } else if (type === "finish") {
        y = GROUND;
        finishX = x + 70;
        platforms.push({ x, y, w: 640, h: THICK, kind: "ground" });
        x += 640;
      }
    });
    return { platforms, ramps, tunnels, stops, lasers, finishX, length: x + 200 };
  }

  function makeActor(marble, ai, offset) {
    return {
      id: marble.id,
      name: marble.name,
      color: marble.color || "#55d6ff",
      x: 90 - offset,
      y: GROUND - RADIUS,
      vx: 0,
      vy: 0,
      r: RADIUS,
      grounded: true,
      groundKind: "ground",
      landedAt: 0,
      boostUntil: 0,
      hyperUntil: 0,
      noBoostUntil: 0,
      keepSpeed: 0,
      nitro: 0,
      perfects: 0,
      top: 0,
      finished: 0,
      ai: !!ai,
      skill: ai ? 0.62 + Math.random() * 0.2 : 1,
      inTunnel: null,
      trail: []
    };
  }

  function startRace(kind, rivals) {
    raceKind = kind;
    level = compileLevel();
    player = makeActor(picked, false, 0);
    actors = [player];
    rivals.forEach((marble, index) => actors.push(makeActor(marble, true, 28 * (index + 1))));
    particles = [];
    camX = 0;
    phase = "countdown";
    countdown = 3;
    raceStart = 0;
    playing = true;
    last = performance.now();
    show("screenPlay");
    setStatus("La largada es en 3.");
    refreshHud(0);
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(loop);
  }

  function setStatus(text) {
    const status = document.getElementById("playStatus");
    if (status) status.textContent = text;
  }

  function refreshHud(elapsed) {
    document.getElementById("hudTime").textContent = formatTime(elapsed);
    document.getElementById("hudSpeed").textContent = kmh(player ? player.vx : 0) + " km/h";
    document.getElementById("nitroFill").style.width = (player ? player.nitro : 0) + "%";
  }

  function supportAt(x, y, radius) {
    let best = null;
    level.platforms.forEach((plat) => {
      if (x < plat.x || x > plat.x + plat.w) return;
      if (y + radius >= plat.y - 8 && y < plat.y + 40) {
        if (!best || plat.y < best.y) best = { y: plat.y, kind: plat.kind === "upper" ? "ground" : plat.kind };
      }
    });
    level.ramps.forEach((ramp) => {
      if (x < ramp.x || x > ramp.x + ramp.w) return;
      const surface = ramp.base - ((x - ramp.x) / ramp.w) * ramp.h;
      if (y + radius >= surface - 10 && y < surface + 40) {
        if (!best || surface < best.y) best = { y: surface, kind: "ramp", ramp };
      }
    });
    level.stops.forEach((wall) => {
      if (x < wall.x || x > wall.x + wall.w) return;
      if (y + radius >= wall.y - 8 && y < wall.y + 30) {
        if (!best || wall.y < best.y) best = { y: wall.y, kind: "ground" };
      }
    });
    return best;
  }

  function tryJump(actor) {
    if (!actor.grounded || actor.inTunnel) return;
    const now = performance.now();
    const perfect = now - actor.landedAt < 150;
    const onRed = actor.groundKind === "red";
    const locked = now < actor.noBoostUntil;
    if (onRed && !locked) {
      actor.boostUntil = now + 3000;
      actor.perfects += 1;
      actor.nitro = Math.min(100, actor.nitro + 36);
      burst(actor.x, actor.y, "#fb7185", 16);
      setStatus(actor.name + " pisó una zona roja. Super Boost x2.");
    } else if (perfect) {
      actor.keepSpeed = now + 450;
      actor.nitro = Math.min(100, actor.nitro + 18);
      if (actor === player) setStatus("Bunny Hop. La velocidad se mantiene.");
    }
    actor.vy = onRed || perfect ? -790 : -690;
    actor.grounded = false;
    actor.groundKind = "";
  }

  function tryHyper(actor) {
    const now = performance.now();
    if (actor.nitro < 100 || now < actor.noBoostUntil) return;
    actor.nitro = 0;
    actor.hyperUntil = now + 2500;
    actor.boostUntil = Math.max(actor.boostUntil, actor.hyperUntil);
    burst(actor.x, actor.y, "#facc15", 22);
    if (actor === player) setStatus("¡HYPER BOOST!");
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 280,
        vy: -Math.random() * 220,
        life: 30 + Math.random() * 20,
        color
      });
    }
  }

  function aiThink(actor) {
    actor.right = true;
    const look = actor.x + 86 + Math.max(0, actor.vx) * 0.12;
    const ahead = supportAt(look, actor.y, actor.r);
    const here = supportAt(actor.x, actor.y, actor.r);
    const wall = level.stops.some((stop) => look > stop.x - 24 && look < stop.x + stop.w + 10 && actor.y + actor.r > stop.y + 8);
    if (actor.grounded && ((!ahead && here) || wall || actor.groundKind === "red") && Math.random() < actor.skill) tryJump(actor);
    if (actor.nitro >= 100 && Math.random() < 0.03) tryHyper(actor);
  }

  function stepActor(actor, dt) {
    const now = performance.now();
    if (actor.finished) {
      actor.vx = 0;
      actor.vy = 0;
      return;
    }
    if (actor.ai) aiThink(actor);
    else {
      actor.left = held.left;
      actor.right = held.right;
    }
    const locked = now < actor.noBoostUntil;
    let cap = MAX;
    if (!locked && now < actor.boostUntil) cap = MAX * 2;
    if (!locked && now < actor.hyperUntil) cap = MAX * 2.7;
    const ice = actor.groundKind === "ice";
    const accel = ice ? ACCEL * 0.22 : ACCEL;

    const wasGrounded = actor.grounded;
    if (actor.inTunnel) {
      actor.vx = Math.max(actor.vx, cap * 1.35);
      actor.vy = 0;
      actor.y = actor.inTunnel.y + actor.inTunnel.h / 2;
      actor.x += actor.vx * dt;
      if (actor.x > actor.inTunnel.x + actor.inTunnel.w) actor.inTunnel = null;
    } else {
      if (actor.right && actor.vx < cap) actor.vx = Math.min(cap, actor.vx + accel * dt);
      else if (actor.left) actor.vx = Math.max(-MAX * 0.7, actor.vx - accel * dt);
      else if (actor.vx > cap) actor.vx = Math.max(cap, actor.vx - 980 * dt);
      if (actor.vx < -MAX * 0.7) actor.vx = -MAX * 0.7;
      if (!actor.left && !actor.right && actor.grounded && !ice && now > actor.keepSpeed) actor.vx *= Math.pow(0.45, dt);
      if (!actor.grounded && (actor.fast || held.fast) && actor === player) actor.vy += 1500 * dt;
      actor.vy += GRAV * dt;
      if (actor.vy > 1100) actor.vy = 1100;
      actor.x += actor.vx * dt;
      actor.y += actor.vy * dt;
      actor.grounded = false;
      actor.groundKind = "";
      const hit = supportAt(actor.x, actor.y, actor.r);
      if (hit && actor.vy >= 0) {
        if (!wasGrounded) actor.landedAt = now;
        actor.y = hit.y - actor.r;
        actor.vy = 0;
        actor.grounded = true;
        actor.groundKind = hit.kind;
        if (hit.kind === "ramp" && hit.ramp) {
          const t = (actor.x - hit.ramp.x) / hit.ramp.w;
          if (t > 0.96 && actor.vx > 180) {
            actor.grounded = false;
            actor.vy = -Math.min(860, 260 + actor.vx * 0.72);
          }
        }
      }
      level.stops.forEach((wall) => {
        const overlaps = actor.x + actor.r > wall.x && actor.x - actor.r < wall.x + wall.w && actor.y + actor.r > wall.y + 10 && actor.y < wall.y + wall.h;
        if (overlaps && actor.vx > 0 && actor.x < wall.x + wall.w / 2) {
          actor.x = wall.x - actor.r - 1;
          actor.vx = 0;
          if (actor === player) setStatus("Bloque de parada. Velocidad a 0.");
        }
      });
      if (!actor.inTunnel) {
        const tunnel = level.tunnels.find((item) => actor.x > item.x && actor.x < item.x + item.w && actor.y + actor.r > item.y && actor.y < item.y + item.h);
        if (tunnel) {
          actor.inTunnel = tunnel;
          actor.vy = 0;
          actor.y = tunnel.y + tunnel.h / 2;
          actor.vx = Math.max(actor.vx, cap * 1.45);
          if (actor === player) setStatus("Túnel turbo.");
        }
      }
      level.lasers.forEach((laser) => {
        const slide = laser.x + laser.span / 2 + Math.sin(now / 380 + laser.phase) * laser.span / 2;
        const hitLaser = actor.x + actor.r > slide && actor.x - actor.r < slide + laser.w && actor.y + actor.r > laser.y && actor.y < laser.y + laser.h;
        if (hitLaser && now > actor.noBoostUntil) {
          actor.noBoostUntil = now + 2000;
          actor.boostUntil = 0;
          actor.hyperUntil = 0;
          actor.vx *= 0.72;
          if (actor === player) setStatus("Láser. Sin boost por 2 segundos.");
        }
      });
    }
    if (actor.y > GROUND + 260) {
      actor.y = GROUND - 80;
      actor.x = Math.max(40, actor.x - 220);
      actor.vx = 0;
      actor.vy = 0;
      actor.inTunnel = null;
    }
    if (actor.x >= level.finishX) {
      actor.finished = raceStart ? now - raceStart : 0;
      actor.x = level.finishX;
      actor.vx = 0;
      if (actor === player) finishRace();
    }
    const speed = kmh(actor.vx);
    if (speed > actor.top) actor.top = speed;
    if (actor === player && (now < actor.boostUntil || now < actor.hyperUntil)) {
      actor.trail.push({ x: actor.x, y: actor.y });
      if (actor.trail.length > 18) actor.trail.shift();
      if (Math.random() < 0.7) burst(actor.x - 10, actor.y, now < actor.hyperUntil ? "#fde68a" : "#fb7185", 1);
    }
  }

  function finishRace() {
    if (phase === "done") return;
    phase = "done";
    playing = false;
    horn();
    sparksUntil = performance.now() + 1600;
    for (let i = 0; i < 70; i += 1) burst(player.x, player.y - 10, i % 2 ? "#fb7185" : "#facc15", 1);
    const ranks = actors.slice().sort((a, b) => {
      if (a.finished && b.finished) return a.finished - b.finished;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.x - a.x;
    });
    const place = ranks.findIndex((actor) => actor === player) + 1;
    const won = place === 1;
    const time = player.finished;
    let coins = 0;
    if (raceKind === "solo" || won) {
      coins = Math.max(12, Math.round(150 - time / 80));
      const previous = profile.best[player.id];
      if (!previous || time < previous) coins += 30;
      profile.coins += coins;
    }
    if (raceKind === "solo") {
      const previous = profile.best[player.id];
      if (!previous || time < previous) profile.best[player.id] = time;
      if (!profile.crew || time < profile.crew.ms) profile.crew = { name: player.name, ms: time };
    }
    saveProfile();
    window.setTimeout(() => showResult(place, won, coins, ranks), 700);
  }

  function showResult(place, won, coins, ranks) {
    if (frame) cancelAnimationFrame(frame);
    document.getElementById("resultTitle").textContent = won ? "¡Cruzaste primero!" : "Llegaste en el puesto " + place;
    document.getElementById("resultMedal").textContent = won ? "🥇 Medalla de oro" : "Seguí practicando el recorrido.";
    const lines = [
      "Tiempo final: " + formatTime(player.finished),
      "Top speed: " + player.top + " km/h",
      "Perfect boosts: " + player.perfects,
      "Monedas Blitz: +" + coins
    ];
    if (raceKind === "solo" && profile.best[player.id] === player.finished) lines.push("Nuevo récord personal.");
    if (raceKind !== "solo") lines.push("Orden: " + ranks.map((actor) => actor.name).join(" · "));
    const list = document.getElementById("resultStats");
    list.innerHTML = "";
    lines.forEach((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      list.appendChild(item);
    });
    show("screenResult");
  }

  function horn() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audio = new AudioCtx();
    [523, 659, 784, 1046].forEach((freq, index) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audio.destination);
      const start = audio.currentTime + index * 0.12;
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  function update(dt) {
    if (phase === "countdown") {
      countdown -= dt;
      setStatus(countdown > 0 ? "Largada en " + Math.ceil(countdown) : "¡Ya!");
      if (countdown <= 0) {
        phase = "run";
        raceStart = performance.now();
        actors.forEach((actor) => { actor.landedAt = raceStart; });
        setStatus("A y D mueven. W salta justo al tocar el suelo.");
      }
      return;
    }
    if (phase !== "run") return;
    actors.forEach((actor) => stepActor(actor, dt));
    particles.forEach((spark) => {
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.life -= 1;
    });
    particles = particles.filter((spark) => spark.life > 0);
    camX = Math.max(0, Math.min(level.length - VIEW_W, player.x - 240));
    refreshHud(player.finished || performance.now() - raceStart);
  }

  function draw() {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#2a0a45");
    sky.addColorStop(1, "#07010f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.save();
    ctx.translate(-camX, 0);
    ctx.strokeStyle = "rgba(244,114,182,0.18)";
    ctx.lineWidth = 2;
    for (let x = Math.floor(camX / 80) * 80; x < camX + VIEW_W; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIEW_H);
      ctx.stroke();
    }
    level.platforms.forEach((plat) => {
      if (plat.x + plat.w < camX || plat.x > camX + VIEW_W) return;
      ctx.fillStyle = plat.kind === "ice" ? "#67e8f9" : plat.kind === "red" ? "#e11d48" : "#312e81";
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(plat.x, plat.y, plat.w, 8);
    });
    level.ramps.forEach((ramp) => {
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.moveTo(ramp.x, ramp.base);
      ctx.lineTo(ramp.x + ramp.w, ramp.base - ramp.h);
      ctx.lineTo(ramp.x + ramp.w, ramp.base);
      ctx.closePath();
      ctx.fill();
    });
    level.tunnels.forEach((tunnel) => {
      ctx.fillStyle = "rgba(125, 211, 252, 0.28)";
      ctx.strokeStyle = "#67e8f9";
      ctx.lineWidth = 3;
      ctx.fillRect(tunnel.x, tunnel.y, tunnel.w, tunnel.h);
      ctx.strokeRect(tunnel.x, tunnel.y, tunnel.w, tunnel.h);
    });
    level.stops.forEach((wall) => {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    });
    const now = performance.now();
    level.lasers.forEach((laser) => {
      const slide = laser.x + laser.span / 2 + Math.sin(now / 380 + laser.phase) * laser.span / 2;
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(slide, laser.y, laser.w, laser.h);
    });
    ctx.fillStyle = "#fda4af";
    for (let i = 0; i < 8; i += 1) {
      ctx.fillRect(level.finishX + (i % 2) * 16, 120 + Math.floor(i / 2) * 28, 16, 28);
      ctx.fillStyle = i % 2 ? "#fda4af" : "#111827";
    }
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 4;
    ctx.strokeRect(level.finishX, 120, 32, 112);
    actors.forEach((actor) => drawActor(actor));
    particles.forEach((spark) => {
      ctx.globalAlpha = Math.max(0, spark.life / 40);
      ctx.fillStyle = spark.color;
      ctx.fillRect(spark.x, spark.y, 4, 4);
      ctx.globalAlpha = 1;
    });
    ctx.restore();
    if (phase === "countdown") {
      ctx.fillStyle = "#fff";
      ctx.font = "900 72px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(countdown > 0 ? String(Math.ceil(countdown)) : "YA", VIEW_W / 2, 150);
    }
  }

  function drawActor(actor) {
    const style = actor === player ? trailOf(profile.trail) : { color: actor.color };
    if (actor === player && actor.trail.length > 1) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      actor.trail.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = actor.color;
    ctx.beginPath();
    ctx.arc(actor.x, actor.y, actor.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "700 12px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(actor.name.slice(0, 10), actor.x, actor.y - actor.r - 8);
  }

  function loop(now) {
    if (!playing && phase !== "done") return;
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;
    if (playing) update(dt);
    else if (sparksUntil > now) {
      particles.forEach((spark) => {
        spark.y += spark.vy * dt;
        spark.life -= 1;
      });
    }
    draw();
    frame = requestAnimationFrame(loop);
  }

  function rivalsFor(kind) {
    const mates = allMarbles().filter((item) => item.packId === picked.packId && item.id !== picked.id);
    if (kind === "duel") {
      if (mates.length) return [mates[Math.floor(Math.random() * mates.length)]];
      return [{ id: "ia-blitz", name: "IA Blitz", color: "#e2e8f0", packId: picked.packId, packName: "IA" }];
    }
    return mates.slice(0, 7);
  }

  function hold(name, value) {
    held[name] = value;
  }

  document.getElementById("btnStart").addEventListener("click", () => {
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
    renderShop();
    show("screenShop");
  });
  document.getElementById("btnBackMenu").addEventListener("click", () => {
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnBackPick").addEventListener("click", () => show("screenPick"));
  document.getElementById("btnShopBack").addEventListener("click", () => {
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnDuel").addEventListener("click", () => startRace("duel", rivalsFor("duel")));
  document.getElementById("btnAll").addEventListener("click", () => {
    const rivals = rivalsFor("all");
    if (!rivals.length) {
      document.getElementById("rivalHint").textContent = "Ese pack no tiene otras pelotitas. Elegí 1 vs 1 o un pack con más pelotitas.";
      return;
    }
    startRace("all", rivals);
  });
  document.getElementById("btnAgain").addEventListener("click", () => {
    if (raceKind === "solo") startRace("solo", []);
    else startRace(raceKind, rivalsFor(raceKind === "all" ? "all" : "duel"));
  });
  document.getElementById("btnToShop").addEventListener("click", () => {
    renderShop();
    show("screenShop");
  });
  document.getElementById("btnToMenu").addEventListener("click", () => {
    playing = false;
    phase = "idle";
    renderMenu();
    show("screenMenu");
  });

  function bindHold(button, key) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      hold(key, true);
      if (key === "jump") tryJump(player);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => {
      button.addEventListener(type, () => hold(key, false));
    });
  }
  bindHold(document.getElementById("btnLeft"), "left");
  bindHold(document.getElementById("btnRight"), "right");
  bindHold(document.getElementById("btnJump"), "jump");
  document.getElementById("btnHyper").addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (player) tryHyper(player);
  });

  window.addEventListener("keydown", (event) => {
    if (!playing || !player) return;
    if (event.code === "KeyA" || event.code === "ArrowLeft") held.left = true;
    if (event.code === "KeyD" || event.code === "ArrowRight") held.right = true;
    if (event.code === "KeyS" || event.code === "ArrowDown") held.fast = true;
    if (event.code === "KeyW" || event.code === "ArrowUp") {
      tryJump(player);
      event.preventDefault();
    }
    if (event.code === "Space") {
      tryHyper(player);
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "KeyA" || event.code === "ArrowLeft") held.left = false;
    if (event.code === "KeyD" || event.code === "ArrowRight") held.right = false;
    if (event.code === "KeyS" || event.code === "ArrowDown") held.fast = false;
  });
})();
