(function () {
  "use strict";

  const KEY = "pinvilet-font-v1";
  const LEVELS = 30;
  const VIEW_W = 960;
  const VIEW_H = 540;
  const RADIUS = 14;
  const GRAV = 1700;
  const MAX = 320;
  const WORDS = ["PINVILET", "FUENTE", "CAOS", "LETRA", "VIOLETA", "GIGANTE", "ALFABETO", "NEON", "COMETA", "SALTO", "BRILLO", "TINTA", "POEMA", "JUEGO", "REINA", "MAGIA", "NUBE", "RAYO", "FIESTA", "CORONA"];
  const BASE_FONTS = ["fredoka", "comic", "impact", "retro", "serif"];

  const FONTS = [
    { id: "fredoka", name: "FredokaOne", price: 0, family: '"Fredoka One", "Comic Sans MS", cursive', color: "#f5d0fe" },
    { id: "comic", name: "Comic Sans", price: 0, family: '"Comic Sans MS", "Comic Sans", cursive', color: "#fde68a" },
    { id: "impact", name: "Impact", price: 0, family: 'Impact, "Arial Black", sans-serif', color: "#e9d5ff" },
    { id: "retro", name: "Neon Retro", price: 0, family: 'Impact, "Arial Black", sans-serif', color: "#f0abfc", glow: "#c026d3" },
    { id: "serif", name: "Serif Neón", price: 0, family: 'Georgia, "Times New Roman", serif', color: "#ddd6fe", glow: "#a78bfa" },
    { id: "neon", name: "Fuente de Neón", price: 24, family: '"Arial Black", Impact, sans-serif', color: "#67e8f9", glow: "#22d3ee" },
    { id: "cristal", name: "Fuente de Cristal", price: 48, family: '"Segoe UI", sans-serif', color: "#e0f2fe", glow: "#7dd3fc" },
    { id: "fuego", name: "Fuente de Fuego", price: 72, family: 'Impact, sans-serif', color: "#fb923c", glow: "#ef4444" },
    { id: "galaxia", name: "Fuente de Galaxia", price: 96, family: '"Trebuchet MS", sans-serif', color: "#c4b5fd", glow: "#818cf8" }
  ];

  const EFFECTS = [
    { id: "none", name: "Sin frase", price: 0, text: "" },
    { id: "ajs", name: "¡¡¡¡AJSJSJSJSJS!!!!", price: 15, text: "¡¡¡¡AJSJSJSJSJS!!!!" },
    { id: "salto", name: "¡¡¡¡SUPER SALTO!!!!", price: 40, text: "¡¡¡¡SUPER SALTO!!!!" }
  ];

  const canvas = document.getElementById("arena");
  const ctx = canvas.getContext("2d");

  let profile = loadProfile();
  let mode = "solo";
  let picked = null;
  let level = null;
  let actors = [];
  let player = null;
  let bangs = [];
  let scale = 1;
  let phase = "idle";
  let camY = 0;
  let hideUntil = 0;
  let rayUntil = 0;
  let phrase = "";
  let phraseUntil = 0;
  let bangTimer = 0;
  let won = false;
  let shopBack = "screenMenu";
  let audio = null;
  let last = 0;
  let jumpQueued = false;
  const held = { left: false, right: false };

  function loadProfile() {
    const blank = {
      points: 0,
      font: "fredoka",
      effect: "none",
      ownedFonts: BASE_FONTS.slice(),
      ownedEffects: ["none"],
      cleared: {}
    };
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      const ownedFonts = Array.isArray(data.ownedFonts) ? data.ownedFonts.slice() : BASE_FONTS.slice();
      const ownedEffects = Array.isArray(data.ownedEffects) ? data.ownedEffects.slice() : ["none"];
      BASE_FONTS.forEach((id) => {
        if (!ownedFonts.includes(id)) ownedFonts.push(id);
      });
      if (!ownedEffects.includes("none")) ownedEffects.unshift("none");
      return {
        points: Math.max(0, Math.floor(Number(data.points) || 0)),
        font: ownedFonts.includes(data.font) ? data.font : "fredoka",
        effect: ownedEffects.includes(data.effect) ? data.effect : "none",
        ownedFonts,
        ownedEffects,
        cleared: data.cleared && typeof data.cleared === "object" ? data.cleared : {}
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
          color: marble.color || "#e879f9",
          packId: String(pack.id || pack.name || "pack"),
          packName: String(pack.name || "Pack")
        });
      });
    });
    return list;
  }

  function clearedCount() {
    let count = 0;
    for (let n = 1; n <= LEVELS; n++) if (profile.cleared[String(n)]) count += 1;
    return count;
  }

  function unlocked(n) {
    return n <= 1 || !!profile.cleared[String(n - 1)];
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

  function setLog(text) {
    document.getElementById("playStatus").textContent = text;
  }

  function fontOf(id) {
    return FONTS.find((item) => item.id === id) || FONTS[0];
  }

  function effectOf(id) {
    return EFFECTS.find((item) => item.id === id) || EFFECTS[0];
  }

  function buildLevel(n) {
    const word = WORDS[(n - 1) % WORDS.length];
    const count = Math.min(14, 6 + Math.floor(n / 4));
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const text = (word + alphabet).slice(0, count);
    const platforms = [];
    let y = 500;
    const gap = n === 1 ? 82 : 88;
    text.split("").forEach((char, index) => {
      const zig = n > 1 ? (index % 2) * (64 + Math.min(36, n)) : 0;
      const x = 390 + zig;
      platforms.push({
        x,
        y,
        w: n === 1 ? 150 : 86,
        h: 48,
        char,
        vowel: "AEIOU".includes(char),
        wall: false,
        purple: n > 3 && index % 5 === 3 && !"AEIOU".includes(char),
        goal: false,
        taken: false
      });
      if (n > 8 && index % 6 === 4) {
        platforms.push({
          x: x + 120,
          y: y - 20,
          w: 46,
          h: 92,
          char: "M",
          vowel: false,
          wall: true,
          purple: false,
          goal: false,
          taken: false
        });
      }
      if (n > 5 && index === 2) {
        platforms[platforms.length - 1].ray = true;
      }
      y -= gap;
    });
    platforms.push({
      x: 400,
      y: y,
      w: 130,
      h: 52,
      char: "★",
      vowel: false,
      wall: false,
      purple: false,
      goal: true,
      taken: false
    });
    return { n, platforms, floor: 620, top: y - 80 };
  }

  function renderMenu() {
    const font = fontOf(profile.font);
    document.getElementById("menuInfo").textContent =
      "Puntos de letra: " + profile.points + " · Mapas " + clearedCount() + "/" + LEVELS + " · Fuente: " + font.name;
  }

  function renderPick() {
    const list = document.getElementById("marbleList");
    list.innerHTML = "";
    const marbles = allMarbles();
    if (!marbles.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No hay pelotitas en tus packs. Creá alguna en Packs y volvé a las letras.";
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
        renderFonts();
        show("screenFonts");
      });
      list.appendChild(btn);
    });
  }

  function renderFonts() {
    document.getElementById("fontHint").textContent = picked
      ? picked.name + " va a rebotar con la fuente que elijas."
      : "";
    const list = document.getElementById("fontList");
    list.innerHTML = "";
    FONTS.forEach((font) => {
      const owned = profile.ownedFonts.includes(font.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mode";
      const sample = document.createElement("span");
      sample.className = "font-sample";
      sample.style.fontFamily = font.family;
      sample.style.color = font.color;
      sample.textContent = "Ag";
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = font.name + (profile.font === font.id ? " · puesta" : "");
      const detail = document.createElement("span");
      detail.textContent = owned ? "Tocar para usar esta fuente" : "Se desbloquea en la tienda";
      label.append(name, detail);
      btn.append(sample, label);
      btn.disabled = !owned;
      if (owned) {
        btn.addEventListener("click", () => {
          profile.font = font.id;
          saveProfile();
          renderLevels();
          show("screenLevels");
        });
      }
      list.appendChild(btn);
    });
  }

  function renderLevels() {
    document.getElementById("levelTitle").textContent = mode === "race" ? "Sopa de letras royale" : "Alfabeto extremo";
    const font = fontOf(profile.font);
    document.getElementById("levelHint").textContent = picked
      ? picked.name + " escribe con " + font.name + ". Cada mapa se abre al ganar el anterior."
      : "";
    const grid = document.getElementById("levelGrid");
    grid.innerHTML = "";
    for (let n = 1; n <= LEVELS; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-btn";
      const open = unlocked(n);
      if (profile.cleared[String(n)]) btn.classList.add("done");
      btn.disabled = !open;
      const strong = document.createElement("strong");
      strong.textContent = open ? String(n) : "🔒";
      const small = document.createElement("small");
      small.textContent = profile.cleared[String(n)] ? "✓" : "";
      btn.append(strong, small);
      if (open) btn.addEventListener("click", () => startLevel(n));
      grid.appendChild(btn);
    }
  }

  function renderShop() {
    document.getElementById("shopPoints").textContent = "Inventario: " + profile.points + " puntos de letra";
    const root = document.getElementById("shopList");
    root.innerHTML = "";
    addShopGroup(root, "Fuentes exclusivas", FONTS.filter((font) => !BASE_FONTS.includes(font.id)), "font");
    addShopGroup(root, "Efectos de texto", EFFECTS, "effect");
  }

  function addShopGroup(root, title, items, kind) {
    const heading = document.createElement("h3");
    heading.className = "shop-title";
    heading.textContent = title;
    root.appendChild(heading);
    const list = document.createElement("div");
    list.className = "shop-list";
    items.forEach((item) => {
      const owned = kind === "font" ? profile.ownedFonts.includes(item.id) : profile.ownedEffects.includes(item.id);
      const equipped = kind === "font" ? profile.font === item.id : profile.effect === item.id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-item";
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = item.name + (equipped ? " · puesto" : "");
      const detail = document.createElement("span");
      detail.textContent = owned ? "Tocar para equipar" : item.price + " puntos";
      label.append(name, detail);
      btn.appendChild(label);
      btn.disabled = !owned && profile.points < item.price;
      btn.addEventListener("click", () => buy(kind, item.id));
      list.appendChild(btn);
    });
    root.appendChild(list);
  }

  function buy(kind, id) {
    const items = kind === "font" ? FONTS : EFFECTS;
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const owned = kind === "font" ? profile.ownedFonts : profile.ownedEffects;
    if (!owned.includes(id)) {
      if (profile.points < item.price) return;
      profile.points -= item.price;
      owned.push(id);
    }
    if (kind === "font") profile.font = id;
    else profile.effect = id;
    saveProfile();
    renderShop();
    renderMenu();
  }

  function rivalsFor(marble) {
    const rest = allMarbles().filter((item) => item.id !== marble.id);
    const same = rest.filter((item) => item.packId === marble.packId);
    const pool = same.length ? same : rest;
    const chosen = [];
    pool.forEach((item) => {
      if (chosen.length < 3 && !chosen.some((rival) => rival.id === item.id)) chosen.push(item);
    });
    const colors = ["#f0abfc", "#c4b5fd", "#fde68a"];
    while (chosen.length < 3) {
      const index = chosen.length;
      chosen.push({ id: "ia-font-" + index, name: "IA Letra " + (index + 1), color: colors[index], packId: "ia", packName: "IA" });
    }
    return chosen;
  }

  function makeActor(marble, isPlayer, index) {
    const base = level.platforms.find((item) => !item.wall && !item.goal);
    return {
      id: marble.id,
      name: marble.name,
      color: marble.color || "#e879f9",
      player: isPlayer,
      ai: !isPlayer,
      x: base.x + base.w / 2 + index * 18,
      y: base.y - RADIUS,
      vx: 0,
      vy: 0,
      prevY: base.y - RADIUS,
      grounded: false,
      word: "",
      reached: false,
      out: false,
      combo: 0,
      lastLand: 0
    };
  }

  function startLevel(n) {
    ensureAudio();
    level = buildLevel(n);
    scale = 1;
    bangs = [];
    bangTimer = 0;
    hideUntil = 0;
    rayUntil = 0;
    phrase = "";
    won = false;
    actors = [makeActor(picked, true, 0)];
    if (mode === "race") rivalsFor(picked).forEach((marble, index) => actors.push(makeActor(marble, false, index + 1)));
    player = actors[0];
    phase = "play";
    jumpQueued = false;
    show("screenPlay");
    setLog("Saltá de letra en letra hasta la estrella.");
    refreshHud();
  }

  function boxOf(platform) {
    const w = platform.w * scale;
    const h = platform.h * scale;
    const bottom = platform.y + platform.h;
    return {
      x: platform.x + platform.w / 2 - w / 2,
      y: bottom - h,
      w,
      h,
      top: bottom - h
    };
  }

  function hiddenVowel(platform, now) {
    return platform.vowel && now < hideUntil;
  }

  function solidPlatforms(now) {
    return level.platforms.filter((platform) => {
      if (hiddenVowel(platform, now)) return false;
      if (platform.wall && now < rayUntil) return false;
      return true;
    });
  }

  function findSupport(actor, now) {
    let best = null;
    const feet = actor.y + RADIUS;
    const prev = actor.prevY + RADIUS;
    solidPlatforms(now).forEach((platform) => {
      const box = boxOf(platform);
      if (actor.x < box.x + 4 || actor.x > box.x + box.w - 4) return;
      if (actor.vy < 0) return;
      const crossed = prev <= box.top + 16 && feet >= box.top - 8;
      const near = feet >= box.top - 12 && feet <= box.top + 26;
      if (!crossed && !near) return;
      if (!best || box.top < best.top) best = { top: box.top, platform, box };
    });
    bangs.forEach((bang) => {
      if (!bang.landed) return;
      const top = bang.y - 26;
      if (actor.x < bang.x - 14 || actor.x > bang.x + 14) return;
      if (actor.vy < 0) return;
      if (feet >= top - 10 && feet <= top + 24 && (!best || top < best.top)) {
        best = { top, platform: null, box: { top } };
      }
    });
    return best;
  }

  function toggleSize() {
    if (phase !== "play") return;
    const growing = scale === 1;
    scale = growing ? 1.8 : 1;
    if (growing) {
      actors.forEach((actor) => {
        if (actor.grounded && !actor.out) {
          actor.vy = -860;
          actor.grounded = false;
          actor.y -= 28;
        }
      });
      showPhrase(effectOf(profile.effect).text || "¡¡¡¡ULTRA MEGA GIGANTE!!!!");
      setLog("¡¡¡¡TAMAÑO ULTRA MEGA GIGANTE!!!! Las letras empujan a todas.");
      blip(520, 0.08, "square");
    } else {
      setLog("La fuente volvió al tamaño normal.");
    }
    refreshHud();
  }

  function showPhrase(text) {
    if (!text) return;
    phrase = text;
    phraseUntil = performance.now() + 1400;
  }

  function collect(actor, platform, now) {
    if (!platform || platform.wall) return;
    if (!platform.goal && actor.word.length < 18 && !actor.word.endsWith(platform.char)) actor.word += platform.char;
    if (platform.purple) {
      hideUntil = now + 3000;
      setLog("🟣 Vocales ocultas por 3 segundos. Saltá entre consonantes.");
    }
    if (platform.ray && actor.player) {
      rayUntil = now + 2500;
      setLog("⚡️ Rayo FredokaOne. Atravesás las paredes de texto.");
      blip(880, 0.08, "square");
    }
    if (platform.goal && !actor.reached) {
      actor.reached = true;
      if (mode === "solo" && actor.player) finish(true);
      else if (mode === "race") finishRace();
    }
  }

  function finish(success) {
    if (won || phase === "result") return;
    won = true;
    phase = "resultWait";
    level.success = success;
    level.reward = 0;
    if (success) {
      level.reward = 10 + level.n + player.word.length;
      profile.points += level.reward;
      profile.cleared[String(level.n)] = 1;
      saveProfile();
      showPhrase(effectOf(profile.effect).text || "¡¡¡¡PALABRA!!!!");
      blip(740, 0.1, "square");
    }
    window.setTimeout(() => showResult(), 700);
  }

  function finishRace() {
    if (won) return;
    won = true;
    phase = "resultWait";
    const ranked = actors.map((actor) => ({
      actor,
      score: actor.word.length + (actor.reached ? 4 : 0)
    })).sort((a, b) => b.score - a.score || (a.actor.reached === b.actor.reached ? 0 : a.actor.reached ? -1 : 1));
    level.winner = ranked[0].actor;
    level.success = level.winner.player;
    level.reward = level.success ? 12 + level.n + level.winner.word.length : 0;
    if (level.success) {
      profile.points += level.reward;
      profile.cleared[String(level.n)] = 1;
      saveProfile();
    }
    showPhrase(level.success ? (effectOf(profile.effect).text || "¡¡¡¡GANASTE!!!!") : "");
    window.setTimeout(() => showResult(), 700);
  }

  function showResult() {
    phase = "result";
    const title = document.getElementById("resultTitle");
    const medal = document.getElementById("resultMedal");
    if (mode === "race") {
      title.textContent = level.success ? "Palabra ganadora" : "Sopa de letras";
      medal.textContent = level.success
        ? "🔤👑 Tu palabra fue la más larga."
        : "🔤 La palabra más larga es de " + level.winner.name + ".";
    } else if (level.success) {
      title.textContent = "Cima de letras";
      medal.textContent = "Llegaste a la estrella del mapa " + level.n + ".";
    } else {
      title.textContent = "Te caíste";
      medal.textContent = "Las letras se quedaron arriba. Probá de nuevo.";
    }
    const stats = document.getElementById("resultStats");
    stats.innerHTML = "";
    addStat(stats, "Palabra: " + (player.word || "—"));
    addStat(stats, "Puntos de letra ganados: " + (level.reward || 0));
    addStat(stats, "Inventario: " + profile.points);
    if (mode === "race") {
      actors.forEach((actor) => addStat(stats, actor.name + ": " + (actor.word || "—") + (actor.reached ? " · cima" : "")));
    }
    document.getElementById("btnNext").hidden = !(level.success && level.n < LEVELS);
    show("screenResult");
  }

  function addStat(list, text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  }

  function refreshHud() {
    if (!player || !level) return;
    document.getElementById("hudLevel").textContent = String(level.n);
    document.getElementById("hudWord").textContent = player.word || "—";
    document.getElementById("hudSize").textContent = scale > 1 ? "MEGA" : "Normal";
    document.getElementById("hudName").textContent = player.name;
  }

  function tryJump(actor, now) {
    if (!actor.grounded || actor.out) return;
    actor.vy = now < rayUntil && actor.player ? -760 : -640;
    actor.grounded = false;
    if (actor.player && profile.effect !== "none" && actor.combo >= 2) showPhrase(effectOf(profile.effect).text);
  }

  function think(actor, now) {
    const above = level.platforms
      .filter((platform) => !platform.wall && boxOf(platform).top < actor.y - 20)
      .sort((a, b) => boxOf(b).top - boxOf(a).top)[0];
    actor.left = false;
    actor.right = false;
    if (!above) return;
    const box = boxOf(above);
    const center = box.x + box.w / 2;
    if (center > actor.x + 10) actor.right = true;
    else if (center < actor.x - 10) actor.left = true;
    if (actor.grounded && actor.y > box.top + 24) tryJump(actor, now);
  }

  function stepActor(actor, dt, now) {
    if (actor.out) return;
    if (actor.player) {
      actor.left = held.left;
      actor.right = held.right;
      if (jumpQueued && actor.grounded && !actor.out) {
        tryJump(actor, now);
        jumpQueued = false;
      }
    } else think(actor, now);

    const ray = actor.player && now < rayUntil;
    const cap = ray ? 520 : MAX;
    const accel = ray ? 2400 : 1700;
    if (actor.right) actor.vx = Math.min(cap, actor.vx + accel * dt);
    else if (actor.left) actor.vx = Math.max(-cap, actor.vx - accel * dt);
    else if (actor.grounded) actor.vx *= Math.exp(-8 * dt);
    if (actor.vx > cap) actor.vx = Math.max(cap, actor.vx - 700 * dt);
    if (actor.vx < -cap) actor.vx = Math.min(-cap, actor.vx + 700 * dt);

    actor.prevY = actor.y;
    actor.vy += GRAV * dt;
    if (actor.vy > 1200) actor.vy = 1200;
    actor.x += actor.vx * dt;
    actor.y += actor.vy * dt;
    actor.x = Math.max(40, Math.min(920, actor.x));

    const support = findSupport(actor, now);
    if (support) {
      actor.y = support.top - RADIUS;
      actor.vy = 0;
      const landed = !actor.grounded;
      actor.grounded = true;
      if (landed) {
        actor.combo = now - actor.lastLand < 1200 ? actor.combo + 1 : 1;
        actor.lastLand = now;
        collect(actor, support.platform, now);
        if (actor.player && actor.combo >= 3) showPhrase(effectOf(profile.effect).text);
      }
    } else actor.grounded = false;

    if (actor.y > level.floor) {
      if (mode === "solo" && actor.player) finish(false);
      else {
        const base = level.platforms.find((item) => !item.wall && !item.goal);
        actor.x = base.x + base.w / 2;
        actor.y = base.y - RADIUS;
        actor.vx = 0;
        actor.vy = 0;
        actor.word = actor.word.slice(0, Math.max(0, actor.word.length - 2));
        if (actor.player) setLog("Te caíste y perdiste letras. Seguí armando la palabra.");
      }
    }
  }

  function updateBangs(dt, now) {
    if (level.n < 2) return;
    bangTimer += dt;
    if (bangTimer > (level.n > 6 ? 2.2 : 3.4)) {
      bangTimer = 0;
      bangs.push({
        x: 220 + Math.random() * 520,
        y: player.y - 280,
        vy: 210,
        landed: false,
        life: 4,
        hurt: false
      });
    }
    bangs.forEach((bang) => {
      if (!bang.landed) {
        bang.y += bang.vy * dt;
        const pad = level.platforms.find((platform) => {
          const box = boxOf(platform);
          return bang.x > box.x && bang.x < box.x + box.w && bang.y >= box.top && bang.y <= box.top + 30;
        });
        if (pad) {
          bang.y = boxOf(pad).top;
          bang.landed = true;
          bang.life = 3.2;
        }
      } else bang.life -= dt;
      actors.forEach((actor) => {
        if (actor.out) return;
        const dx = actor.x - bang.x;
        const dy = actor.y - (bang.y - 20);
        if (dx * dx + dy * dy > 28 * 28) return;
        if (!bang.landed && !bang.hurt && actor.y > bang.y - 36) {
          bang.hurt = true;
          actor.vx += dx < 0 ? -180 : 180;
          if (actor.player) setLog("¡¡¡¡!!!! Un signo te empuja. También puede ser una rampa.");
        }
      });
    });
    bangs = bangs.filter((bang) => bang.life > 0 && bang.y < level.floor + 40);
  }

  function update(dt, now) {
    if (phase !== "play") return;
    actors.forEach((actor) => stepActor(actor, dt, now));
    updateBangs(dt, now);
    camY = Math.max(level.top, Math.min(player.y - 230, level.floor - VIEW_H + 80));
    refreshHud();
  }

  function draw(now) {
    if (!level) return;
    const font = fontOf(profile.font);
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#2e1064");
    sky.addColorStop(1, "#12041c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.save();
    ctx.translate(0, -camY);
    level.platforms.forEach((platform) => drawLetter(platform, font, now));
    bangs.forEach((bang) => {
      ctx.fillStyle = "#fef08a";
      ctx.font = "700 42px Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", bang.x, bang.y);
      ctx.textAlign = "left";
    });
    actors.forEach((actor) => {
      if (actor.out) return;
      const glow = actor.player && now < rayUntil;
      if (glow) {
        ctx.fillStyle = "rgba(216, 180, 254, 0.45)";
        ctx.beginPath();
        ctx.arc(actor.x, actor.y, RADIUS + 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = glow ? "#e9d5ff" : actor.color;
      ctx.beginPath();
      ctx.arc(actor.x, actor.y, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!actor.player) {
        ctx.fillStyle = "#fae8ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(actor.name, actor.x, actor.y - 20);
        ctx.textAlign = "left";
      }
    });
    if (phrase && now < phraseUntil) {
      ctx.fillStyle = "#f0abfc";
      ctx.font = "800 28px Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(phrase, player.x, player.y - 46);
      ctx.textAlign = "left";
    }
    ctx.restore();
  }

  function drawLetter(platform, font, now) {
    const box = boxOf(platform);
    const faded = hiddenVowel(platform, now);
    ctx.globalAlpha = faded ? 0.18 : 1;
    if (platform.purple) {
      ctx.fillStyle = "rgba(168, 85, 247, 0.45)";
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }
    if (platform.wall) {
      ctx.fillStyle = "rgba(88, 28, 135, 0.55)";
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }
    ctx.fillStyle = platform.goal ? "#facc15" : font.color;
    ctx.strokeStyle = font.glow || "#4c1d95";
    ctx.lineWidth = 4;
    ctx.font = "800 " + Math.floor(box.h * 1.15) + "px " + font.family;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (font.glow) {
      ctx.shadowColor = font.glow;
      ctx.shadowBlur = 16;
    }
    ctx.strokeText(platform.char, box.x + box.w / 2, box.y + box.h / 2);
    ctx.fillText(platform.char, box.x + box.w / 2, box.y + box.h / 2);
    ctx.shadowBlur = 0;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }

  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audio) audio = new AudioCtx();
    if (audio.state === "suspended") audio.resume();
  }

  function blip(freq, dur, type) {
    if (!audio) return;
    const time = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function loop(now) {
    const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    if (phase === "play") {
      update(dt, now);
      draw(now);
    } else if (phase === "resultWait") draw(now);
    requestAnimationFrame(loop);
  }

  function hold(button, key) {
    const down = (event) => {
      event.preventDefault();
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
  document.getElementById("btnBackFonts").addEventListener("click", () => show("screenFonts"));
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
    phase = "idle";
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnSize").addEventListener("click", toggleSize);
  hold(document.getElementById("btnLeft"), "left");
  hold(document.getElementById("btnRight"), "right");
  hold(document.getElementById("btnJump"), "jump");
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    jumpQueued = true;
  });

  window.addEventListener("keydown", (event) => {
    if (phase !== "play") return;
    if (event.code === "KeyA" || event.code === "ArrowLeft") {
      event.preventDefault();
      held.left = true;
    } else if (event.code === "KeyD" || event.code === "ArrowRight") {
      event.preventDefault();
      held.right = true;
    } else if ((event.code === "KeyW" || event.code === "ArrowUp" || event.code === "Space") && !event.repeat) {
      event.preventDefault();
      jumpQueued = true;
    } else if (event.code === "KeyF") {
      event.preventDefault();
      toggleSize();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "KeyA" || event.code === "ArrowLeft") held.left = false;
    if (event.code === "KeyD" || event.code === "ArrowRight") held.right = false;
  });

  requestAnimationFrame(loop);
})();
