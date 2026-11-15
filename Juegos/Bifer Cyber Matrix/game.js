(function () {
  "use strict";

  const KEY = "bifer-cyber-v1";
  const LEVELS = 40;
  const VIEW_W = 960;
  const VIEW_H = 540;
  const DX = { e: 1, w: -1, n: 0, s: 0 };
  const DY = { e: 0, w: 0, n: -1, s: 1 };
  const LEFT = { e: "n", n: "w", w: "s", s: "e" };
  const RIGHT = { e: "s", s: "w", w: "n", n: "e" };

  const SKINS = [
    { id: "classic", name: "Núcleo clásico", price: 0 },
    { id: "cyborg", name: "Cyborg", price: 30 },
    { id: "mecha", name: "Meca-Dorada", price: 70 },
    { id: "matrix", name: "Matrix-Verde", price: 55 },
    { id: "holo", name: "Holográfica", price: 100 }
  ];

  const LASERS = [
    { id: "cian", name: "Láser cian", price: 0, color: "#22d3ee" },
    { id: "fucsia", name: "Láser rosa fucsia", price: 15, color: "#f472b6" },
    { id: "verde", name: "Láser verde hacker", price: 40, color: "#4ade80" },
    { id: "uv", name: "Fuego ultravioleta", price: 80, color: "#e879f9" }
  ];

  const EFFECTS = [
    { id: "none", name: "Sin efecto", price: 0 },
    { id: "retro", name: "Sonido retro de los 80", price: 25 },
    { id: "matrix", name: "Código cayendo", price: 45 }
  ];

  const canvas = document.getElementById("grid");
  const ctx = canvas.getContext("2d");

  let profile = loadProfile();
  let mode = "solo";
  let picked = null;
  let level = null;
  let rivals = [];
  let phase = "idle";
  let selected = 0;
  let heat = 0;
  let spiderTimer = 0;
  let aiTimer = 0;
  let overUntil = 0;
  let overCd = 0;
  let fireUntil = 0;
  let fireCd = 0;
  let puzzle = null;
  let puzzleLeft = 0;
  let puzzleCd = 0;
  let beam = [];
  let lit = 0;
  let serverOn = false;
  let particles = [];
  let rain = [];
  let rainUntil = 0;
  let winnerName = "";
  let lastHacker = "";
  let won = false;
  let shopBack = "screenMenu";
  let audio = null;
  let last = 0;
  let shake = 0;

  function loadProfile() {
    const blank = {
      bits: 0,
      skin: "classic",
      laser: "cian",
      effect: "none",
      ownedSkins: ["classic"],
      ownedLasers: ["cian"],
      ownedEffects: ["none"],
      cleared: {}
    };
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      const ownedSkins = Array.isArray(data.ownedSkins) ? data.ownedSkins.slice() : ["classic"];
      const ownedLasers = Array.isArray(data.ownedLasers) ? data.ownedLasers.slice() : ["cian"];
      const ownedEffects = Array.isArray(data.ownedEffects) ? data.ownedEffects.slice() : ["none"];
      if (!ownedSkins.includes("classic")) ownedSkins.unshift("classic");
      if (!ownedLasers.includes("cian")) ownedLasers.unshift("cian");
      if (!ownedEffects.includes("none")) ownedEffects.unshift("none");
      return {
        bits: Math.max(0, Math.floor(Number(data.bits) || 0)),
        skin: ownedSkins.includes(data.skin) ? data.skin : "classic",
        laser: ownedLasers.includes(data.laser) ? data.laser : "cian",
        effect: ownedEffects.includes(data.effect) ? data.effect : "none",
        ownedSkins,
        ownedLasers,
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
          color: marble.color || "#22d3ee",
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
  }

  function setLog(text) {
    document.getElementById("playStatus").textContent = text;
  }

  function mulberry(seed) {
    let state = seed >>> 0;
    return function rand() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function reflect(type, dir) {
    if (type === 0) return { e: "s", s: "e", w: "n", n: "w" }[dir];
    return { e: "n", n: "e", w: "s", s: "w" }[dir];
  }

  function mirrorFor(incoming, outgoing) {
    return reflect(0, incoming) === outgoing ? 0 : 1;
  }

  function inside(cols, rows, x, y) {
    return x >= 0 && y >= 0 && x < cols && y < rows;
  }

  function trace(source, useSolution) {
    let x = source.emitter.x;
    let y = source.emitter.y;
    let dir = source.emitter.dir;
    const points = [{ x, y }];
    const hit = new Set();
    let server = false;
    let doorHit = null;
    const seen = new Set();
    const firewall = performance.now() < fireUntil;
    for (let step = 0; step < 56; step++) {
      const mark = x + "," + y + dir;
      if (seen.has(mark)) break;
      seen.add(mark);
      x += DX[dir];
      y += DY[dir];
      if (!inside(source.cols, source.rows, x, y)) break;
      points.push({ x, y });
      if (source.door && !source.door.open && source.door.x === x && source.door.y === y) {
        doorHit = source.door;
        break;
      }
      if (source.jams.some((jam) => jam.x === x && jam.y === y) && !firewall) break;
      const mirror = source.mirrors.find((item) => item.x === x && item.y === y);
      if (mirror) {
        dir = reflect(useSolution ? mirror.solution : mirror.rot, dir);
        continue;
      }
      if (source.server.x === x && source.server.y === y) {
        server = true;
        break;
      }
      if (source.nodes.some((node) => node.x === x && node.y === y)) {
        const blocked = source.spiders.some((spider) => spider.x === x && spider.y === y) && !firewall;
        if (!blocked) hit.add(x + "," + y);
      }
    }
    return { points, server, hit, doorHit };
  }

  function buildLevel(n) {
    const rand = mulberry((n * 1103515245 + 4242) >>> 0);
    for (let attempt = 0; attempt < 24; attempt++) {
      const made = attemptLevel(n, rand);
      if (made && canSolve(made)) {
        made.mirrors.forEach((mirror) => {
          mirror.rot = 1 - mirror.solution;
        });
        return made;
      }
    }
    return fallbackLevel(n);
  }

  function attemptLevel(n, rand) {
    const cols = Math.min(8, 5 + Math.floor((n - 1) / 10));
    const rows = Math.min(8, 5 + Math.floor((n - 1) / 14));
    const emitter = { x: 0, y: Math.floor(rows / 2), dir: "e" };
    let x = 1;
    let y = emitter.y;
    let dir = "e";
    const seen = new Set(["0," + y, x + "," + y]);
    const mirrors = [];
    const nodes = [];
    const wantMirrors = Math.min(6, 1 + Math.floor(n / 6));
    const wantNodes = Math.min(4, 1 + Math.floor(n / 10));
    let guard = 0;
    while (guard++ < 80 && (mirrors.length < wantMirrors || nodes.length < wantNodes || x < cols - 2)) {
      const aheadX = x + DX[dir];
      const aheadY = y + DY[dir];
      const canStraight = inside(cols, rows, aheadX, aheadY) && !seen.has(aheadX + "," + aheadY);
      const turns = [];
      if (mirrors.length < wantMirrors && !mirrors.some((mirror) => mirror.x === x && mirror.y === y) && !(x === emitter.x && y === emitter.y)) {
        [LEFT[dir], RIGHT[dir]].forEach((turn) => {
          const nx = x + DX[turn];
          const ny = y + DY[turn];
          if (inside(cols, rows, nx, ny) && !seen.has(nx + "," + ny)) turns.push(turn);
        });
      }
      const turn = turns.length && (rand() < 0.42 || !canStraight);
      if (turn) {
        const next = turns[Math.floor(rand() * turns.length)];
        mirrors.push({ x, y, solution: mirrorFor(dir, next), rot: mirrorFor(dir, next) });
        seen.add(x + "," + y);
        dir = next;
        x += DX[dir];
        y += DY[dir];
        seen.add(x + "," + y);
      } else if (canStraight) {
        x = aheadX;
        y = aheadY;
        seen.add(x + "," + y);
        if (nodes.length < wantNodes && mirrors.length && rand() < 0.6) nodes.push({ x, y });
      } else break;
    }
    if (!mirrors.length || mirrors.some((mirror) => mirror.x === x && mirror.y === y)) return null;
    const server = { x, y };
    const cleanNodes = nodes.filter((node) => node.x !== server.x || node.y !== server.y);
    if (!cleanNodes.length) cleanNodes.push({ x: Math.max(1, server.x - 1), y: server.y });
    const draft = {
      n,
      cols,
      rows,
      emitter,
      server,
      mirrors,
      nodes: cleanNodes.filter((node, index, list) => list.findIndex((item) => item.x === node.x && item.y === node.y) === index),
      jams: [],
      door: null,
      spiders: []
    };
    const solved = trace(draft, true);
    if (!solved.server || solved.hit.size < draft.nodes.length) return null;
    if (n >= 8 && n % 7 === 0) {
      const spot = solved.points.find((point, index) => index > 1 && !(point.x === server.x && point.y === server.y) && !draft.mirrors.some((mirror) => mirror.x === point.x && mirror.y === point.y) && !draft.nodes.some((node) => node.x === point.x && node.y === point.y));
      if (spot) draft.door = { x: spot.x, y: spot.y, open: false };
    }
    if (n >= 12 && n % 4 === 0) {
      const spot = solved.points.find((point) => !(point.x === server.x && point.y === server.y) && !draft.mirrors.some((mirror) => mirror.x === point.x && mirror.y === point.y) && !(draft.door && draft.door.x === point.x && draft.door.y === point.y));
      if (spot) draft.jams.push({ x: spot.x, y: spot.y });
    }
    const bugs = n < 4 ? 0 : Math.min(3, 1 + Math.floor((n - 4) / 10));
    for (let i = 0; i < bugs; i++) {
      draft.spiders.push({ x: cols - 1, y: (i * 2) % rows });
    }
    return draft;
  }

  function canSolve(source) {
    const clean = {
      cols: source.cols,
      rows: source.rows,
      emitter: source.emitter,
      server: source.server,
      mirrors: source.mirrors,
      nodes: source.nodes,
      jams: [],
      door: null,
      spiders: []
    };
    const result = trace(clean, true);
    return result.server && result.hit.size === source.nodes.length;
  }

  function fallbackLevel(n) {
    return {
      n,
      cols: 5,
      rows: 5,
      emitter: { x: 0, y: 1, dir: "e" },
      server: { x: 2, y: 4 },
      mirrors: [{ x: 2, y: 1, solution: 0, rot: 1 }],
      nodes: [{ x: 1, y: 1 }, { x: 2, y: 3 }],
      jams: [],
      door: null,
      spiders: []
    };
  }

  function renderMenu() {
    document.getElementById("menuInfo").textContent = "Bits de neón: " + profile.bits + " · Nodos " + clearedCount() + "/" + LEVELS;
  }

  function renderPick() {
    const list = document.getElementById("marbleList");
    list.innerHTML = "";
    const marbles = allMarbles();
    if (!marbles.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No hay pelotitas en tus packs. Creá alguna en Packs y volvé a la terminal.";
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

  function renderLevels() {
    document.getElementById("levelTitle").textContent = mode === "race" ? "Matriz cibernética" : "Hackeo de nodos";
    document.getElementById("levelHint").textContent = picked
      ? picked.name + " es el Data-Core. Cada nodo se abre al desencriptar el anterior."
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
    document.getElementById("shopBits").textContent = "Inventario: " + profile.bits + " bits de neón";
    const root = document.getElementById("shopList");
    root.innerHTML = "";
    addShopGroup(root, "Skins robóticas", SKINS, "skin");
    addShopGroup(root, "Láseres personalizados", LASERS, "laser");
    addShopGroup(root, "Efectos de hackeo", EFFECTS, "effect");
  }

  function addShopGroup(root, title, items, kind) {
    const heading = document.createElement("h3");
    heading.className = "shop-title";
    heading.textContent = title;
    root.appendChild(heading);
    const list = document.createElement("div");
    list.className = "shop-list";
    const owned = kind === "skin" ? profile.ownedSkins : kind === "laser" ? profile.ownedLasers : profile.ownedEffects;
    const equipped = kind === "skin" ? profile.skin : kind === "laser" ? profile.laser : profile.effect;
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-item";
      const has = owned.includes(item.id);
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = item.name + (equipped === item.id ? " · puesto" : "");
      const detail = document.createElement("span");
      detail.textContent = has ? "Tocar para equipar" : item.price + " bits";
      label.append(name, detail);
      btn.appendChild(label);
      btn.disabled = !has && profile.bits < item.price;
      btn.addEventListener("click", () => buy(kind, item.id));
      list.appendChild(btn);
    });
    root.appendChild(list);
  }

  function buy(kind, id) {
    const items = kind === "skin" ? SKINS : kind === "laser" ? LASERS : EFFECTS;
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const owned = kind === "skin" ? profile.ownedSkins : kind === "laser" ? profile.ownedLasers : profile.ownedEffects;
    if (!owned.includes(id)) {
      if (profile.bits < item.price) return;
      profile.bits -= item.price;
      owned.push(id);
    }
    if (kind === "skin") profile.skin = id;
    else if (kind === "laser") profile.laser = id;
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
    const colors = ["#67e8f9", "#f9a8d4", "#86efac"];
    while (chosen.length < 3) {
      const index = chosen.length;
      chosen.push({ id: "ia-bifer-" + index, name: "IA Matrix " + (index + 1), color: colors[index], packId: "ia", packName: "IA" });
    }
    return chosen;
  }

  function startLevel(n) {
    ensureAudio();
    level = buildLevel(n);
    rivals = mode === "race" ? rivalsFor(picked) : [];
    selected = 0;
    heat = 0;
    spiderTimer = 0;
    aiTimer = 0;
    overUntil = 0;
    overCd = 0;
    fireUntil = 0;
    fireCd = 0;
    puzzle = null;
    puzzleCd = 0;
    particles = [];
    rain = [];
    won = false;
    winnerName = "";
    phase = "play";
    hidePuzzle();
    show("screenPlay");
    refreshTrace();
    setLog("Espejos desalineados: " + level.mirrors.length + ". Giralos para llevar el láser al servidor.");
    refreshHud();
  }

  function refreshTrace() {
    const result = trace(level, false);
    beam = result.points;
    lit = result.hit.size;
    serverOn = result.server && result.hit.size === level.nodes.length;
    if (phase === "play" && puzzleCd <= 0 && result.doorHit) openPuzzle();
    return result;
  }

  function selectedMirror() {
    return level.mirrors[selected] || level.mirrors[0];
  }

  function rotateMirror(step) {
    if (phase !== "play" || !level) return;
    const mirror = selectedMirror();
    mirror.rot = step < 0 ? (mirror.rot === 0 ? 1 : 0) : (mirror.rot === 0 ? 1 : 0);
    blip(520, 0.04, "square");
    checkLive("player");
  }

  function moveMirror(dx, dy) {
    if (phase !== "play" || !level) return;
    const mirror = selectedMirror();
    const nx = mirror.x + dx;
    const ny = mirror.y + dy;
    if (!inside(level.cols, level.rows, nx, ny)) return;
    const blocked = (level.emitter.x === nx && level.emitter.y === ny)
      || (level.server.x === nx && level.server.y === ny)
      || level.mirrors.some((item) => item !== mirror && item.x === nx && item.y === ny)
      || level.nodes.some((node) => node.x === nx && node.y === ny)
      || level.jams.some((jam) => jam.x === nx && jam.y === ny)
      || (level.door && level.door.x === nx && level.door.y === ny);
    if (blocked) return;
    mirror.x = nx;
    mirror.y = ny;
    checkLive("player");
  }

  function cycleMirror() {
    if (!level || !level.mirrors.length) return;
    selected = (selected + 1) % level.mirrors.length;
    setLog("Espejo " + (selected + 1) + " de " + level.mirrors.length + ".");
  }

  function overclock() {
    const now = performance.now();
    if (phase !== "play" || now < overCd) return;
    overUntil = now + 3000;
    overCd = now + 8000;
    setLog("⚡️ Overclock de Bifer3000. Los virus se congelan 3 segundos.");
    blip(880, 0.08, "square");
  }

  function firewall() {
    const now = performance.now();
    if (phase !== "play" || now < fireCd) return;
    fireUntil = now + 3000;
    fireCd = now + 8000;
    level.spiders.forEach((spider) => {
      if (level.nodes.some((node) => node.x === spider.x && node.y === spider.y)) spider.x = Math.max(0, spider.x - 1);
    });
    setLog("🛡️ Cortafuegos de Bifer. Los bloqueos de señal ceden 3 segundos.");
    blip(240, 0.09, "sawtooth");
    checkLive("player");
  }

  function checkLive(who) {
    refreshTrace();
    refreshHud();
    if (serverOn && phase === "play") finish(who === "player");
  }

  function openPuzzle() {
    const a = 2 + Math.floor(Math.random() * 8);
    const b = 2 + Math.floor(Math.random() * 7);
    const multiply = Math.random() < 0.5;
    const answer = multiply ? a * b : a + b;
    const options = new Set([answer]);
    while (options.size < 4) options.add(answer + (Math.floor(Math.random() * 9) - 4) || answer + 3);
    puzzle = { ask: "¿Cuánto es " + a + (multiply ? " × " : " + ") + b + "?", answer, options: shuffle([...options]) };
    puzzleLeft = 5;
    phase = "puzzle";
    const box = document.getElementById("puzzle");
    box.classList.remove("hidden");
    document.getElementById("puzzleAsk").textContent = puzzle.ask;
    const holder = document.getElementById("puzzleOptions");
    holder.innerHTML = "";
    puzzle.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = String(option);
      btn.addEventListener("click", () => answerPuzzle(option));
      holder.appendChild(btn);
    });
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function answerPuzzle(option) {
    if (phase !== "puzzle" || !puzzle) return;
    const ok = option === puzzle.answer;
    hidePuzzle();
    phase = "play";
    if (ok && level.door) {
      level.door.open = true;
      setLog("🔓 Candado abierto. La puerta encriptada cedió.");
      blip(660, 0.08, "square");
      checkLive("player");
    } else {
      heat = Math.min(100, heat + 18);
      puzzleCd = 1.6;
      setLog("El candado sigue cerrado. La RAM se calentó.");
      refreshHud();
    }
  }

  function hidePuzzle() {
    puzzle = null;
    document.getElementById("puzzle").classList.add("hidden");
  }

  function finish(playerWon) {
    if (won || phase === "rain" || phase === "result") return;
    won = true;
    phase = "rain";
    rainUntil = performance.now() + (profile.effect === "matrix" ? 1400 : 700);
    winnerName = playerWon ? picked.name : (lastHacker || "IA Matrix");
    if (playerWon) {
      const gain = 16 + level.n * 2;
      profile.bits += gain;
      profile.cleared[String(level.n)] = 1;
      saveProfile();
      level.reward = gain;
    } else level.reward = 0;
    if (playerWon && profile.effect === "retro") retroFanfare();
    else blip(playerWon ? 740 : 180, 0.12, "square");
    if (profile.effect === "matrix") {
      for (let i = 0; i < 50; i++) rain.push({ x: Math.random() * VIEW_W, y: Math.random() * VIEW_H, speed: 80 + Math.random() * 160, char: String.fromCharCode(48 + Math.floor(Math.random() * 42)) });
    }
    setLog(playerWon ? "Servidor desencriptado." : winnerName + " desencriptó el servidor.");
  }

  function failHeat() {
    if (phase === "rain" || phase === "result" || phase === "fail") return;
    phase = "fail";
    won = false;
    winnerName = "";
    showResult(false);
  }

  function showResult(success) {
    phase = "result";
    hidePuzzle();
    const title = document.getElementById("resultTitle");
    const medal = document.getElementById("resultMedal");
    if (!success) {
      title.textContent = "Sobrecarga de RAM";
      medal.textContent = "El circuito tembló hasta cortarse. Probá de nuevo más rápido.";
    } else if (mode === "race") {
      title.textContent = winnerName === picked.name ? "Hacker Supremo" : "Red tomada";
      medal.textContent = winnerName === picked.name
        ? "🌐⚡️ Conectaste los nodos y desencriptaste el servidor."
        : "🌐 El Hacker Supremo es " + winnerName + ".";
    } else {
      title.textContent = "Nodo desencriptado";
      medal.textContent = "El láser llegó al servidor del nodo " + level.n + ".";
    }
    const stats = document.getElementById("resultStats");
    stats.innerHTML = "";
    addStat(stats, "Nodos conectados: " + lit + "/" + level.nodes.length);
    addStat(stats, "Bits ganados: " + (level.reward || 0));
    addStat(stats, "Inventario: " + profile.bits + " bits de neón");
    document.getElementById("btnNext").hidden = !(success && winnerName === picked.name && level.n < LEVELS);
    show("screenResult");
  }

  function addStat(list, text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  }

  function refreshHud() {
    if (!level) return;
    document.getElementById("hudLevel").textContent = String(level.n);
    document.getElementById("hudNodes").textContent = lit + "/" + level.nodes.length;
    document.getElementById("hudHeat").textContent = Math.floor(heat) + "%";
    document.getElementById("hudCore").textContent = picked ? picked.name : "—";
    document.getElementById("heatFill").style.width = Math.min(100, heat) + "%";
    const now = performance.now();
    document.getElementById("btnOver").disabled = now < overCd;
    document.getElementById("btnFire").disabled = now < fireCd;
  }

  function update(now, dt) {
    if (phase === "puzzle") {
      puzzleLeft -= dt;
      document.getElementById("puzzleTime").textContent = Math.max(0, puzzleLeft).toFixed(1) + " s";
      if (puzzleLeft <= 0) answerPuzzle(null);
      return;
    }
    if (phase === "rain") {
      rain.forEach((drop) => {
        drop.y += drop.speed * dt;
        if (drop.y > VIEW_H) drop.y = 0;
      });
      if (now >= rainUntil) showResult(true);
      return;
    }
    if (phase !== "play" || !level) return;
    const frozen = now < overUntil;
    if (!frozen) heat += dt * (1.1 + level.n * 0.07);
    if (puzzleCd > 0) puzzleCd -= dt;
    if (!frozen) {
      spiderTimer += dt;
      if (spiderTimer > 0.9) {
        spiderTimer = 0;
        level.spiders.forEach((spider) => stepSpider(spider));
      }
    }
    if (mode === "race") {
      aiTimer += dt;
      const delay = Math.max(0.85, 2.1 - level.n * 0.03);
      if (aiTimer > delay) {
        aiTimer = 0;
        aiPulse();
      }
    }
    if (heat > 55 && Math.random() < 0.4) {
      particles.push({
        x: Math.random() * VIEW_W,
        y: Math.random() * VIEW_H,
        life: 0.35,
        max: 0.35,
        color: Math.random() < 0.5 ? "#22d3ee" : "#f472b6"
      });
    }
    particles.forEach((spark) => { spark.life -= dt; });
    particles = particles.filter((spark) => spark.life > 0);
    shake = heat > 65 ? (heat - 65) / 10 : 0;
    refreshTrace();
    refreshHud();
    if (heat >= 100) failHeat();
    else if (serverOn) finish(true);
  }

  function stepSpider(spider) {
    const target = level.nodes[0] || level.server;
    const sx = Math.sign(target.x - spider.x);
    const sy = Math.sign(target.y - spider.y);
    if (Math.random() < 0.5 && sx) spider.x += sx;
    else if (sy) spider.y += sy;
    spider.x = Math.max(0, Math.min(level.cols - 1, spider.x));
    spider.y = Math.max(0, Math.min(level.rows - 1, spider.y));
  }

  function aiPulse() {
    const rival = rivals[Math.floor(Math.random() * rivals.length)];
    const wrong = level.mirrors.filter((mirror) => mirror.rot !== mirror.solution);
    const skill = Math.min(0.8, 0.28 + level.n * 0.012);
    if (wrong.length && Math.random() < skill) {
      wrong[0].rot = wrong[0].solution;
      lastHacker = rival.name;
      setLog(rival.name + " reescribe un espejo.");
    } else if (level.mirrors.length && Math.random() < 0.35) {
      const mirror = level.mirrors[Math.floor(Math.random() * level.mirrors.length)];
      mirror.rot = 1 - mirror.rot;
    }
    checkLive("ai");
  }

  function cellRect() {
    const size = Math.min(72, Math.floor(Math.min(820 / level.cols, 430 / level.rows)));
    return {
      size,
      x: (VIEW_W - level.cols * size) / 2,
      y: (VIEW_H - level.rows * size) / 2
    };
  }

  function draw(now) {
    if (!level) return;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#02070c";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.save();
    if (shake) ctx.translate(Math.sin(now / 28) * shake, Math.cos(now / 22) * shake);
    const box = cellRect();
    drawBoard(box, now);
    ctx.restore();
    particles.forEach((spark) => {
      ctx.globalAlpha = Math.max(0, spark.life / spark.max);
      ctx.fillStyle = spark.color;
      ctx.fillRect(spark.x, spark.y, 3, 8);
      ctx.globalAlpha = 1;
    });
    if (phase === "rain" && profile.effect === "matrix") {
      ctx.fillStyle = "rgba(2, 8, 6, 0.45)";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = "#4ade80";
      ctx.font = "16px Consolas, monospace";
      rain.forEach((drop) => ctx.fillText(drop.char, drop.x, drop.y));
    }
    drawCore(now);
  }

  function drawBoard(box, now) {
    ctx.strokeStyle = "rgba(34, 211, 238, 0.18)";
    ctx.lineWidth = 1;
    for (let y = 0; y < level.rows; y++) {
      for (let x = 0; x < level.cols; x++) {
        ctx.strokeRect(box.x + x * box.size, box.y + y * box.size, box.size, box.size);
      }
    }
    const laser = LASERS.find((item) => item.id === profile.laser) || LASERS[0];
    ctx.strokeStyle = laser.color;
    ctx.lineWidth = 4;
    ctx.shadowColor = laser.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    beam.forEach((point, index) => {
      const px = box.x + point.x * box.size + box.size / 2;
      const py = box.y + point.y * box.size + box.size / 2;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    level.nodes.forEach((node) => {
      const on = beamHas(node) && !spiderAt(node);
      ctx.fillStyle = on ? "#4ade80" : "#155e75";
      ctx.beginPath();
      ctx.arc(box.x + node.x * box.size + box.size / 2, box.y + node.y * box.size + box.size / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    level.jams.forEach((jam) => {
      ctx.fillStyle = now < fireUntil ? "rgba(74, 222, 128, 0.35)" : "rgba(248, 113, 113, 0.45)";
      ctx.fillRect(box.x + jam.x * box.size + 8, box.y + jam.y * box.size + 8, box.size - 16, box.size - 16);
    });
    if (level.door && !level.door.open) {
      ctx.fillStyle = "#facc15";
      ctx.font = "22px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🔒", box.x + level.door.x * box.size + box.size / 2, box.y + level.door.y * box.size + box.size * 0.68);
      ctx.textAlign = "left";
    }
    level.mirrors.forEach((mirror, index) => drawMirror(box, mirror, index === selected));
    drawMarker(box, level.emitter.x, level.emitter.y, "#67e8f9", "IN");
    drawMarker(box, level.server.x, level.server.y, serverOn ? "#4ade80" : "#f472b6", "CPU");
    level.spiders.forEach((spider) => {
      ctx.font = "20px Segoe UI Emoji, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🕷️", box.x + spider.x * box.size + box.size / 2, box.y + spider.y * box.size + box.size * 0.7);
      ctx.textAlign = "left";
    });
  }

  function beamHas(cell) {
    return beam.some((point) => point.x === cell.x && point.y === cell.y);
  }

  function spiderAt(cell) {
    return performance.now() >= fireUntil && level.spiders.some((spider) => spider.x === cell.x && spider.y === cell.y);
  }

  function drawMirror(box, mirror, active) {
    const x = box.x + mirror.x * box.size;
    const y = box.y + mirror.y * box.size;
    if (active) {
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 4, y + 4, box.size - 8, box.size - 8);
    }
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (mirror.rot === 0) {
      ctx.moveTo(x + 10, y + 10);
      ctx.lineTo(x + box.size - 10, y + box.size - 10);
    } else {
      ctx.moveTo(x + 10, y + box.size - 10);
      ctx.lineTo(x + box.size - 10, y + 10);
    }
    ctx.stroke();
  }

  function drawMarker(box, x, y, color, text) {
    ctx.fillStyle = color;
    ctx.fillRect(box.x + x * box.size + 12, box.y + y * box.size + 12, box.size - 24, box.size - 24);
    ctx.fillStyle = "#041016";
    ctx.font = "700 12px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, box.x + x * box.size + box.size / 2, box.y + y * box.size + box.size * 0.58);
    ctx.textAlign = "left";
  }

  function drawCore(now) {
    if (!picked) return;
    const skin = profile.skin;
    ctx.beginPath();
    ctx.fillStyle = skin === "matrix" ? "#4ade80" : picked.color;
    ctx.arc(78, 64, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skin === "mecha" ? "#facc15" : "#e0f2fe";
    ctx.lineWidth = skin === "holo" ? 3 : 2;
    if (skin === "holo") ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (skin === "cyborg") {
      ctx.strokeStyle = "#22d3ee";
      ctx.beginPath();
      ctx.moveTo(66, 64);
      ctx.lineTo(90, 64);
      ctx.stroke();
    }
    ctx.fillStyle = "#cffafe";
    ctx.font = "12px Consolas, monospace";
    ctx.fillText(skin === "classic" ? "CORE" : skin.toUpperCase(), 104, 68);
    if (now < overUntil) ctx.fillText("OC", 104, 86);
  }

  function pointerCell(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const box = cellRect();
    return {
      x: Math.floor((x - box.x) / box.size),
      y: Math.floor((y - box.y) / box.size)
    };
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

  function retroFanfare() {
    [523, 659, 784, 1046].forEach((freq, index) => {
      window.setTimeout(() => blip(freq, 0.09, "square"), index * 90);
    });
  }

  function loop(now) {
    const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    if (phase === "play" || phase === "puzzle" || phase === "rain") {
      update(now, dt);
      draw(now);
    }
    requestAnimationFrame(loop);
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
    hidePuzzle();
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnAbort").addEventListener("click", () => {
    phase = "idle";
    hidePuzzle();
    renderMenu();
    show("screenMenu");
  });
  document.getElementById("btnCycle").addEventListener("click", cycleMirror);
  document.getElementById("btnRotateL").addEventListener("click", () => rotateMirror(-1));
  document.getElementById("btnRotateR").addEventListener("click", () => rotateMirror(1));
  document.getElementById("btnLeft").addEventListener("click", () => moveMirror(-1, 0));
  document.getElementById("btnRight").addEventListener("click", () => moveMirror(1, 0));
  document.getElementById("btnUp").addEventListener("click", () => moveMirror(0, -1));
  document.getElementById("btnDown").addEventListener("click", () => moveMirror(0, 1));
  document.getElementById("btnOver").addEventListener("click", overclock);
  document.getElementById("btnFire").addEventListener("click", firewall);
  canvas.addEventListener("pointerdown", (event) => {
    if (phase !== "play" || !level) return;
    const cell = pointerCell(event);
    const index = level.mirrors.findIndex((mirror) => mirror.x === cell.x && mirror.y === cell.y);
    if (index >= 0) {
      selected = index;
      setLog("Espejo " + (selected + 1) + " seleccionado.");
    }
  });

  window.addEventListener("keydown", (event) => {
    if (phase !== "play") return;
    if (event.code === "KeyA") {
      event.preventDefault();
      rotateMirror(-1);
    } else if (event.code === "KeyD") {
      event.preventDefault();
      rotateMirror(1);
    } else if (event.code === "ArrowLeft") {
      event.preventDefault();
      moveMirror(-1, 0);
    } else if (event.code === "ArrowRight") {
      event.preventDefault();
      moveMirror(1, 0);
    } else if (event.code === "ArrowUp" || event.code === "KeyW") {
      event.preventDefault();
      moveMirror(0, -1);
    } else if (event.code === "ArrowDown" || event.code === "KeyS") {
      event.preventDefault();
      moveMirror(0, 1);
    } else if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
      event.preventDefault();
      overclock();
    } else if (event.code === "Space") {
      event.preventDefault();
      firewall();
    }
  });

  requestAnimationFrame(loop);
})();
