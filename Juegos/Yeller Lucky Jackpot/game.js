(function () {
  "use strict";

  const KEY = "yeller-jackpot-v1";
  const LEVELS = 20;
  const GOAL = 1000;
  const VIEW_W = 960;
  const VIEW_H = 540;
  const CX = 480;
  const CY = 278;
  const SYMBOLS = ["🪙", "⭐", "🍀", "7️⃣"];

  const COINS = [
    { id: "oro", name: "Moneda de oro", price: 0, color: "#facc15" },
    { id: "diamante", name: "Moneda de diamante", price: 40, color: "#e0f2fe" },
    { id: "fuego", name: "Moneda de fuego", price: 70, color: "#fb923c" },
    { id: "plasma", name: "Moneda de plasma", price: 90, color: "#e879f9" },
    { id: "chocolate", name: "Moneda de chocolate", price: 50, color: "#d2996a" }
  ];

  const AMULETS = [
    { id: "none", name: "Sin amuleto", price: 0 },
    { id: "trebol", name: "Amuleto trébol", price: 60 },
    { id: "herradura", name: "Amuleto herradura", price: 85 },
    { id: "estrella", name: "Amuleto estrella", price: 120 }
  ];

  const TRAILS = [
    { id: "classic", name: "Brillo clásico", price: 0 },
    { id: "monedas", name: "Estela de monedas de oro", price: 35 },
    { id: "treboles", name: "Tréboles de 4 hojas", price: 75 },
    { id: "destellos", name: "Destellos amarillos", price: 110 }
  ];

  const LABELS = {
    start: "SALIDA",
    coins: "+",
    green: "SUERTE",
    red: "RIESGO",
    slot: "SLOT",
    flip: "50/50",
    gold: "+10%",
    jackpot: "JACKPOT",
    goal: "META"
  };

  const canvas = document.getElementById("table");
  const ctx = canvas.getContext("2d");
  const rollButton = document.getElementById("btnRoll");

  let profile = loadProfile();
  let mode = "solo";
  let picked = null;
  let board = null;
  let actors = [];
  let pot = 0;
  let turn = 0;
  let current = null;
  let phase = "idle";
  let dieFace = 1;
  let finalRoll = 1;
  let dieUntil = 0;
  let dieTick = 0;
  let stepsLeft = 0;
  let stepAt = 0;
  let backLeft = 0;
  let pauseUntil = 0;
  let pauseAction = "";
  let slotReels = ["🪙", "⭐", "🍀"];
  let slotFinal = ["🪙", "🪙", "🪙"];
  let slotUntil = 0;
  let slotTick = 0;
  let slotDone = false;
  let rainUntil = 0;
  let particles = [];
  let winner = null;
  let winReason = "";
  let shopBack = "screenMenu";
  let audio = null;
  let last = 0;
  let coinSpin = 0;
  let revealedFace = "";

  function loadProfile() {
    const blank = {
      coins: 0,
      coin: "oro",
      amulet: "none",
      trail: "classic",
      ownedCoins: ["oro"],
      ownedAmulets: ["none"],
      ownedTrails: ["classic"],
      cleared: {}
    };
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      const ownedCoins = Array.isArray(data.ownedCoins) ? data.ownedCoins.slice() : ["oro"];
      const ownedAmulets = Array.isArray(data.ownedAmulets) ? data.ownedAmulets.slice() : ["none"];
      const ownedTrails = Array.isArray(data.ownedTrails) ? data.ownedTrails.slice() : ["classic"];
      if (!ownedCoins.includes("oro")) ownedCoins.unshift("oro");
      if (!ownedAmulets.includes("none")) ownedAmulets.unshift("none");
      if (!ownedTrails.includes("classic")) ownedTrails.unshift("classic");
      return {
        coins: Math.max(0, Math.floor(Number(data.coins) || 0)),
        coin: ownedCoins.includes(data.coin) ? data.coin : "oro",
        amulet: ownedAmulets.includes(data.amulet) ? data.amulet : "none",
        trail: ownedTrails.includes(data.trail) ? data.trail : "classic",
        ownedCoins,
        ownedAmulets,
        ownedTrails,
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
          color: marble.color || "#facc15",
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
    if (n <= 1) return true;
    return !!profile.cleared[String(n - 1)];
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    if (id !== "screenPlay") showChoice(false);
  }

  function showChoice(on) {
    document.getElementById("choiceBox").classList.toggle("hidden", !on);
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

  function buildBoard(n) {
    const rand = mulberry((n * 1103515245 + 12345) >>> 0);
    const count = Math.min(26, 14 + Math.floor(n * 0.6));
    const bag = ["green", "red", "slot", "flip", "gold", "coins", "coins", "green", "red", "coins"];
    const squares = [{ type: "start" }];
    for (let i = 1; i < count - 1; i++) squares.push({ type: bag[Math.floor(rand() * bag.length)] });
    squares.push({ type: "goal" });
    squares[Math.floor(count / 2)] = { type: "jackpot" };
    ["green", "red", "slot", "flip", "gold"].forEach((type, index) => {
      if (squares.some((square) => square.type === type)) return;
      const at = 1 + index;
      if (squares[at] && squares[at].type !== "jackpot" && squares[at].type !== "goal") squares[at] = { type };
    });
    return { n, squares };
  }

  function renderMenu() {
    const amulet = AMULETS.find((item) => item.id === profile.amulet);
    const bonus = profile.amulet === "none" ? "" : " · " + amulet.name + " +15%";
    document.getElementById("menuInfo").textContent =
      "Monedas de oro: " + profile.coins + " · Tableros " + clearedCount() + "/" + LEVELS + bonus;
  }

  function renderPick() {
    const list = document.getElementById("marbleList");
    list.innerHTML = "";
    const marbles = allMarbles();
    if (!marbles.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No hay pelotitas en tus packs. Creá alguna en Packs y volvé a la mesa.";
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
    document.getElementById("levelTitle").textContent = mode === "race" ? "Royale Jackpot" : "Aventura de la Suerte";
    document.getElementById("levelHint").textContent = picked
      ? picked.name + " se sienta a la mesa. Cada tablero se abre al ganar el anterior."
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
      if (open) btn.addEventListener("click", () => startMatch(n));
      grid.appendChild(btn);
    }
  }

  function renderShop() {
    document.getElementById("shopCoins").textContent = "Inventario: " + profile.coins + " monedas de oro";
    const root = document.getElementById("shopList");
    root.innerHTML = "";
    addShopGroup(root, "Monedas personalizadas", COINS, "coin");
    addShopGroup(root, "Amuletos de suerte", AMULETS, "amulet");
    addShopGroup(root, "Rastros dorados", TRAILS, "trail");
  }

  function addShopGroup(root, title, items, kind) {
    const heading = document.createElement("h3");
    heading.className = "shop-title";
    heading.textContent = title;
    root.appendChild(heading);
    const list = document.createElement("div");
    list.className = "shop-list";
    const owned = kind === "coin" ? profile.ownedCoins : kind === "amulet" ? profile.ownedAmulets : profile.ownedTrails;
    const equipped = kind === "coin" ? profile.coin : kind === "amulet" ? profile.amulet : profile.trail;
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-item";
      const has = owned.includes(item.id);
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = item.name + (equipped === item.id ? " · puesto" : "");
      const detail = document.createElement("span");
      detail.textContent = has ? "Tocar para equipar" : item.price + " monedas";
      label.append(name, detail);
      btn.appendChild(label);
      btn.disabled = !has && profile.coins < item.price;
      btn.addEventListener("click", () => buy(kind, item.id));
      list.appendChild(btn);
    });
    root.appendChild(list);
  }

  function buy(kind, id) {
    const items = kind === "coin" ? COINS : kind === "amulet" ? AMULETS : TRAILS;
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const owned = kind === "coin" ? profile.ownedCoins : kind === "amulet" ? profile.ownedAmulets : profile.ownedTrails;
    if (!owned.includes(id)) {
      if (profile.coins < item.price) return;
      profile.coins -= item.price;
      owned.push(id);
    }
    if (kind === "coin") profile.coin = id;
    else if (kind === "amulet") profile.amulet = id;
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
    const colors = ["#fde68a", "#fdba74", "#f9a8d4"];
    while (chosen.length < 3) {
      const index = chosen.length;
      chosen.push({
        id: "ia-yeller-" + index,
        name: "IA Fortuna " + (index + 1),
        color: colors[index],
        packId: "ia",
        packName: "IA"
      });
    }
    return chosen;
  }

  function makeActor(marble, isPlayer) {
    return {
      id: marble.id,
      name: marble.name,
      color: marble.color || "#facc15",
      player: isPlayer,
      pos: 0,
      coins: 0,
      hop: 0
    };
  }

  function startMatch(n) {
    ensureAudio();
    board = buildBoard(n);
    pot = 80 + n * 20;
    actors = [makeActor(picked, true)];
    if (mode === "race") rivalsFor(picked).forEach((marble) => actors.push(makeActor(marble, false)));
    turn = 0;
    winner = null;
    winReason = "";
    particles = [];
    revealedFace = "";
    showChoice(false);
    show("screenPlay");
    beginTurn(false);
    refreshHud();
  }

  function rollDie(actor) {
    const high = actor.player && profile.amulet !== "none";
    if (high && Math.random() < 0.65) return 7 + Math.floor(Math.random() * 6);
    if (high) return 1 + Math.floor(Math.random() * 6);
    return 1 + Math.floor(Math.random() * 12);
  }

  function beginTurn(isReroll) {
    current = actors[turn];
    revealedFace = "";
    if (!isReroll) pot += 8 + board.n;
    showChoice(false);
    refreshHud();
    if (current.player) {
      phase = "turn";
      rollButton.disabled = false;
      setLog((isReroll ? "🍀 Re-tiro gratis. " : "") + "Turno de " + current.name + ". Lanzá el dado.");
    } else {
      phase = "pause";
      pauseAction = "roll";
      pauseUntil = performance.now() + 420;
      rollButton.disabled = true;
      setLog("Turno de " + current.name + ".");
    }
  }

  function startRoll(force) {
    if (!current) return;
    if (!force && phase !== "turn") return;
    ensureAudio();
    finalRoll = rollDie(current);
    dieFace = 1 + Math.floor(Math.random() * 12);
    dieUntil = performance.now() + 680;
    dieTick = 0;
    phase = "rolling";
    pauseAction = "";
    rollButton.disabled = true;
    showChoice(false);
    blip(420, 0.05, "square");
  }

  function squareAt(index) {
    return board.squares[index];
  }

  function moveForward() {
    const last = board.squares.length - 1;
    if (mode === "solo" && current.pos >= last) {
      stepsLeft = 0;
      return;
    }
    if (mode === "solo") current.pos += 1;
    else current.pos = (current.pos + 1) % board.squares.length;
    stepsLeft -= 1;
    if (mode === "solo" && current.pos >= last) stepsLeft = 0;
    current.hop = 1;
    spawnTrail(current);
  }

  function moveBack() {
    if (mode === "solo") current.pos = Math.max(0, current.pos - 1);
    else current.pos = (current.pos - 1 + board.squares.length) % board.squares.length;
    backLeft -= 1;
    current.hop = 1;
  }

  function grant(amount) {
    current.coins += amount;
    refreshHud();
  }

  function resolveSquare() {
    const square = squareAt(current.pos);
    if (square.type === "green") {
      if (Math.random() < 0.28) {
        setLog("🍀 Casilla verde: re-tiro gratis.");
        beginTurn(true);
        return;
      }
      const mult = [2, 5, 10][Math.floor(Math.random() * 3)];
      const gain = (12 + board.n * 2) * mult;
      grant(gain);
      setLog("🍀 Suerte x" + mult + ". +" + gain + " monedas.");
      queue("after", 650);
      return;
    }
    if (square.type === "red") {
      if (Math.random() < 0.5) {
        const loss = Math.min(current.coins, 18 + board.n * 4);
        current.coins -= loss;
        setLog("💣 Casilla roja: perdés " + loss + " monedas.");
        refreshHud();
        queue("after", 650);
      } else {
        backLeft = 3;
        phase = "backing";
        stepAt = performance.now() + 160;
        setLog("💣 Casilla roja: 3 casillas para atrás.");
      }
      return;
    }
    if (square.type === "slot") {
      phase = "slot";
      slotDone = false;
      slotUntil = performance.now() + 1100;
      slotTick = 0;
      slotFinal = [symbol(), symbol(), symbol()];
      slotReels = slotFinal.slice();
      setLog("🎰 Giran los rodillos…");
      return;
    }
    if (square.type === "flip") {
      revealedFace = "";
      if (current.player) {
        phase = "choice";
        showChoice(true);
        setLog("⚖️ Yeller lanza su moneda. Elegí cara o cruz.");
      } else {
        resolveFlip(Math.random() < 0.5 ? "cara" : "cruz");
      }
      return;
    }
    if (square.type === "gold") {
      pot = Math.floor(pot * 1.1);
      grant(18 + board.n);
      setLog("🪙 Casilla dorada especial. El pozo sube 10%.");
      queue("after", 650);
      return;
    }
    if (square.type === "jackpot") {
      current.coins += pot;
      winReason = "jackpot";
      winner = current;
      setLog("🏆 ¡Jackpot de Yeller! La bolsa explota.");
      startRain();
      return;
    }
    if (square.type === "goal") {
      if (mode === "solo") {
        winReason = "goal";
        winner = current;
        setLog("Llegaste a la meta del tablero.");
        startRain();
      } else {
        grant(50 + board.n * 4);
        setLog("Meta. La vuelta sigue hasta las 1.000 o el Jackpot.");
        queue("after", 600);
      }
      return;
    }
    const gain = square.type === "start" ? 6 + board.n : 10 + board.n * 2;
    grant(gain);
    setLog("+" + gain + " monedas de oro.");
    queue("after", 500);
  }

  function resolveFlip(choice) {
    showChoice(false);
    const face = Math.random() < 0.5 ? "cara" : "cruz";
    revealedFace = face;
    coinSpin = 0;
    if (choice === face) {
      current.coins *= 2;
      refreshHud();
      setLog("⚖️ Salió " + face.toUpperCase() + ". ¡Acertaste! Se duplican tus monedas.");
      blip(660, 0.08, "square");
      queue("after", 800);
      return;
    }
    current.coins = Math.floor(current.coins * 0.85);
    current.hop = 1.4;
    refreshHud();
    setLog("⚖️ Salió " + face.toUpperCase() + ". ¡Resorte! Salís volando.");
    backLeft = 2;
    phase = "backing";
    stepAt = performance.now() + 280;
  }

  function applySlot() {
    const a = slotFinal[0];
    const b = slotFinal[1];
    const c = slotFinal[2];
    slotReels = slotFinal.slice();
    if (a === b && b === c && a === "🪙") {
      const prize = pot;
      current.coins += prize;
      pot = Math.max(40, Math.floor(pot * 0.3));
      setLog("🎰 ¡Tres monedas iguales! Premio gordo: +" + prize + ".");
      blip(880, 0.12, "square");
    } else if (a === b && b === c) {
      const prize = 36 + board.n * 8;
      current.coins += prize;
      setLog("🎰 Tres iguales. +" + prize + " monedas.");
    } else {
      setLog("🎰 Los rodillos no coincidieron.");
    }
    refreshHud();
  }

  function afterResolve() {
    if (phase === "rain" || phase === "result") return;
    if (mode === "race" && current.coins >= GOAL) {
      current.coins += pot;
      winReason = "coins";
      winner = current;
      setLog("💰 " + current.name + " junta 1.000 monedas y se lleva el pozo.");
      startRain();
      return;
    }
    nextTurn();
  }

  function nextTurn() {
    if (mode === "race") turn = (turn + 1) % actors.length;
    beginTurn(false);
  }

  function queue(action, delay) {
    phase = "pause";
    pauseAction = action;
    pauseUntil = performance.now() + delay;
  }

  function startRain() {
    phase = "rain";
    rainUntil = performance.now() + 1300;
    rollButton.disabled = true;
    showChoice(false);
    for (let i = 0; i < 48; i++) {
      particles.push({
        x: 180 + Math.random() * 600,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 40,
        vy: 80 + Math.random() * 180,
        life: 1.6,
        max: 1.6,
        color: "#facc15",
        shape: "monedas"
      });
    }
    blip(523, 0.1, "square");
    blip(659, 0.12, "square");
    refreshHud();
  }

  function showResult() {
    if (phase === "result") return;
    phase = "result";
    const playerWon = winner && winner.player;
    if (playerWon) {
      profile.coins += winner.coins;
      profile.cleared[String(board.n)] = 1;
      saveProfile();
    }
    const title = document.getElementById("resultTitle");
    const medal = document.getElementById("resultMedal");
    if (winReason === "jackpot") {
      title.textContent = "Jackpot de Yeller";
      medal.textContent = playerWon
        ? "🏆 Sos el Campeón Dorado. La bolsa explotó para vos."
        : "🏆 El Campeón Dorado es " + winner.name + ".";
    } else if (winReason === "coins") {
      title.textContent = "Royale Jackpot";
      medal.textContent = playerWon
        ? "💰 Llegaste a 1.000 y te llevás toda la riqueza."
        : "💰 La riqueza es de " + winner.name + ".";
    } else {
      title.textContent = "Tablero superado";
      medal.textContent = "Cruzaste la meta del tablero " + board.n + ".";
    }
    const stats = document.getElementById("resultStats");
    stats.innerHTML = "";
    addStat(stats, "Monedas de la partida: " + (winner ? winner.coins : 0));
    addStat(stats, "Pozo al cierre: " + pot);
    if (mode === "race") {
      actors.forEach((actor) => addStat(stats, actor.name + ": " + actor.coins + " monedas"));
    }
    addStat(stats, "Inventario: " + profile.coins + " monedas de oro");
    document.getElementById("btnNext").hidden = !(playerWon && board.n < LEVELS);
    show("screenResult");
  }

  function addStat(list, text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  }

  function refreshHud() {
    if (!board || !actors.length) return;
    const mine = actors.find((actor) => actor.player) || actors[0];
    document.getElementById("hudLevel").textContent = String(board.n);
    document.getElementById("hudCoins").textContent = String(mine.coins);
    document.getElementById("hudPot").textContent = String(pot);
    document.getElementById("hudTurn").textContent = current ? current.name : "—";
    rollButton.disabled = phase !== "turn";
  }

  function symbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  function pointOf(index) {
    const count = board.squares.length;
    if (board.squares[index].type === "jackpot") return { x: CX, y: CY };
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
    return {
      x: CX + Math.cos(angle) * 400,
      y: CY + Math.sin(angle) * 198
    };
  }

  function update(now, dt) {
    actors.forEach((actor) => {
      if (actor.hop > 0) actor.hop = Math.max(0, actor.hop - dt * 2.4);
    });
    particles.forEach((spark) => {
      spark.life -= dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
    });
    particles = particles.filter((spark) => spark.life > 0);

    if (phase === "rolling") {
      if (now - dieTick > 70) {
        dieTick = now;
        dieFace = 1 + Math.floor(Math.random() * 12);
        blip(300 + dieFace * 20, 0.03, "square");
      }
      if (now >= dieUntil) {
        dieFace = finalRoll;
        stepsLeft = finalRoll;
        phase = "moving";
        stepAt = now + 120;
        setLog(current.name + " sacó " + finalRoll + ".");
      }
      return;
    }

    if (phase === "moving" && now >= stepAt) {
      const last = board.squares.length - 1;
      if (stepsLeft <= 0 || (mode === "solo" && current.pos >= last)) {
        resolveSquare();
        return;
      }
      stepAt = now + 150;
      moveForward();
      if (stepsLeft <= 0 || (mode === "solo" && current.pos >= last)) {
        queue("resolve", 180);
      }
      return;
    }

    if (phase === "backing" && now >= stepAt) {
      if (backLeft <= 0) {
        queue("after", 280);
        return;
      }
      stepAt = now + 150;
      moveBack();
      if (backLeft <= 0) queue("after", 280);
      return;
    }

    if (phase === "pause" && now >= pauseUntil) {
      const action = pauseAction;
      pauseAction = "";
      if (action === "roll") startRoll(true);
      else if (action === "resolve") resolveSquare();
      else if (action === "after") afterResolve();
      return;
    }

    if (phase === "slot") {
      if (now < slotUntil) {
        if (now - slotTick > 80) {
          slotTick = now;
          slotReels = [symbol(), symbol(), symbol()];
        }
        return;
      }
      if (!slotDone) {
        slotDone = true;
        applySlot();
        queue("after", 750);
      }
    }

    if (phase === "rain" && now >= rainUntil) showResult();
  }

  function draw(now) {
    if (!board) return;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#3b2608");
    sky.addColorStop(1, "#120c04");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawRoulette(now);
    drawLinks();
    board.squares.forEach((square, index) => {
      if (square.type !== "jackpot") drawSquare(square, index);
    });
    drawBag();
    particles.forEach(drawSpark);
    actors.forEach((actor, index) => drawActor(actor, index));
    drawDie();
    if (phase === "slot") drawSlot();
    if (phase === "choice" || revealedFace) drawCoin(now);
  }

  function drawRoulette(now) {
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(now / 1800);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = i % 2 ? "#7f1d1d" : "#111827";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 78, -0.02, Math.PI / 6);
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(CX, CY, 84, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawLinks() {
    ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    board.squares.forEach((_square, index) => {
      const next = pointOf((index + 1) % board.squares.length);
      const here = pointOf(index);
      if (index === 0) ctx.moveTo(here.x, here.y);
      ctx.lineTo(next.x, next.y);
    });
    ctx.stroke();
  }

  function squareColor(type) {
    if (type === "green") return "#16a34a";
    if (type === "red") return "#dc2626";
    if (type === "slot") return "#7c3aed";
    if (type === "flip") return "#f59e0b";
    if (type === "gold") return "#fbbf24";
    if (type === "goal") return "#fff7ed";
    if (type === "start") return "#e7e5e4";
    return "#ca8a04";
  }

  function drawSquare(square, index) {
    const point = pointOf(index);
    ctx.fillStyle = squareColor(square.type);
    roundRect(point.x - 28, point.y - 18, 56, 36, 8);
    ctx.fill();
    ctx.fillStyle = square.type === "goal" || square.type === "start" ? "#1c1917" : "#fff7ed";
    ctx.font = "700 10px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(LABELS[square.type], point.x, point.y + 3);
    ctx.textAlign = "left";
  }

  function drawBag() {
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.ellipse(CX, CY + 8, 54, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fde68a";
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("JACKPOT", CX, CY - 2);
    ctx.fillText(String(pot), CX, CY + 16);
    ctx.textAlign = "left";
    const jackpot = board.squares.findIndex((square) => square.type === "jackpot");
    if (jackpot >= 0) {
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CX, CY, 62, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawActor(actor, index) {
    const point = pointOf(actor.pos);
    const lift = Math.sin(Math.min(1, actor.hop) * Math.PI) * (actor.hop > 1 ? 46 : 26);
    const x = point.x + (index - (actors.length - 1) / 2) * 16;
    const y = point.y - 24 - lift;
    ctx.fillStyle = actor.color;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (actor.player) {
      ctx.fillStyle = "#fff7ed";
      ctx.font = "11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(actor.name, x, y - 16);
      ctx.textAlign = "left";
    }
  }

  function drawDie() {
    ctx.fillStyle = "#fde68a";
    roundRect(VIEW_W - 92, 18, 70, 70, 12);
    ctx.fill();
    ctx.fillStyle = "#1c1917";
    ctx.font = "800 32px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(dieFace), VIEW_W - 57, 58);
    ctx.font = "700 12px Segoe UI, sans-serif";
    ctx.fillText("D12", VIEW_W - 57, 78);
    ctx.textAlign = "left";
  }

  function drawSlot() {
    ctx.fillStyle = "rgba(20, 10, 2, 0.82)";
    roundRect(330, 200, 300, 90, 14);
    ctx.fill();
    ctx.font = "40px Segoe UI Emoji, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    slotReels.forEach((reel, index) => {
      ctx.fillText(reel, 390 + index * 90, 258);
    });
    ctx.textAlign = "left";
  }

  function drawCoin(now) {
    const skin = COINS.find((item) => item.id === profile.coin) || COINS[0];
    const spinning = phase === "choice";
    const scale = spinning ? Math.abs(Math.sin(now / 120)) : 1;
    ctx.save();
    ctx.translate(120, 86);
    ctx.scale(Math.max(0.12, scale), 1);
    ctx.fillStyle = skin.color;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#fff7ed";
    ctx.font = "700 14px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(revealedFace ? revealedFace.toUpperCase() : "¿?", 120, 92);
    ctx.textAlign = "left";
  }

  function drawSpark(spark) {
    ctx.globalAlpha = Math.max(0, spark.life / spark.max);
    ctx.fillStyle = spark.color;
    if (spark.shape === "treboles") {
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (spark.shape === "destellos") {
      ctx.fillRect(spark.x - 1, spark.y - 6, 2, 12);
      ctx.fillRect(spark.x - 6, spark.y - 1, 12, 2);
    } else {
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function spawnTrail(actor) {
    if (!actor.player) return;
    const point = pointOf(actor.pos);
    const shape = profile.trail;
    const color = shape === "destellos" ? "#fef08a" : shape === "treboles" ? "#86efac" : "#facc15";
    particles.push({
      x: point.x,
      y: point.y - 20,
      vx: (Math.random() - 0.5) * 20,
      vy: -30,
      life: 0.45,
      max: 0.45,
      color,
      shape
    });
  }

  function roundRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
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
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.035, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function loop(now) {
    const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    if (phase !== "idle" && phase !== "result") {
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
  document.getElementById("btnAgain").addEventListener("click", () => startMatch(board.n));
  document.getElementById("btnNext").addEventListener("click", () => startMatch(board.n + 1));
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
    showChoice(false);
    renderMenu();
    show("screenMenu");
  });
  rollButton.addEventListener("click", () => {
    if (phase === "turn") startRoll();
  });
  document.getElementById("btnCara").addEventListener("click", () => {
    if (phase === "choice") resolveFlip("cara");
  });
  document.getElementById("btnCruz").addEventListener("click", () => {
    if (phase === "choice") resolveFlip("cruz");
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    if (phase === "turn") {
      event.preventDefault();
      startRoll();
    }
  });

  requestAnimationFrame(loop);
})();
