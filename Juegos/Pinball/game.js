(function () {
  "use strict";

  const SLOT_COUNT = 4;
  const KEY = "pinball-saves-v1";
  let WORLD_W = 520;
  let WORLD_H = 700;
  const RADIUS = 11;
  const POINT_PAY = 5;

  const canvas = document.getElementById("table");
  const ctx = canvas.getContext("2d");

  let slots = loadSlots();
  let slotIndex = -1;
  let selected = new Set();
  let playing = false;
  let queue = [];
  let live = [];
  let camY = 0;
  let frame = 0;
  let leftHeld = false;
  let rightHeld = false;
  let pops = [];
  let tunnel = { x: 200, y: 300, w: 84, h: 56 };
  let targets = [];
  let walls = [];
  let lastLayoutKey = "";
  let flippers = [
    { x: 150, y: 640, len: 96, angle: 0.5, rest: 0.5, up: -0.42, side: 1 },
    { x: 370, y: 640, len: 96, angle: Math.PI - 0.5, rest: Math.PI - 0.5, up: Math.PI + 0.42, side: -1 }
  ];

  function laneX() {
    return WORLD_W - 108;
  }

  function fitTable() {
    const wrap = document.querySelector(".table-wrap");
    const width = Math.max(320, Math.floor(wrap.clientWidth || 520));
    const height = Math.max(360, Math.floor(wrap.clientHeight || 700));
    canvas.width = width;
    canvas.height = height;
    WORLD_W = width;
    WORLD_H = height;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function circleHitsTunnel(x, y, pad) {
    return x + pad > tunnel.x - 6
      && x - pad < tunnel.x + tunnel.w + 6
      && y + pad > tunnel.y - 10
      && y - pad < tunnel.y + tunnel.h + 18;
  }

  function placeCircles(kind, count, radius) {
    let made = 0;
    let tries = 0;
    while (made < count && tries < 500) {
      tries += 1;
      const x = rand(64, Math.max(80, laneX() - 36));
      const y = rand(WORLD_H * 0.12, WORLD_H * 0.76);
      if (circleHitsTunnel(x, y, radius + 12)) continue;
      const crowded = targets.some((item) => Math.hypot(item.x - x, item.y - y) < item.r + radius + 20);
      if (crowded) continue;
      targets.push({ id: kind + "-" + made + "-" + Math.floor(rand(100, 9999)), kind, x, y, r: radius });
      made += 1;
    }
  }

  function layoutKey() {
    const circles = targets.map((item) => Math.round(item.x) + "," + Math.round(item.y) + item.kind[0]).join("|");
    const bumps = walls.slice(7).map((wall) => wall.map((n) => Math.round(n)).join(",")).join("/");
    return Math.round(tunnel.x) + ":" + Math.round(tunnel.y) + "#" + circles + "#" + bumps;
  }

  function buildLayout() {
    let guard = 0;
    let key = "";
    do {
      const lane = laneX();
      const tW = Math.round(Math.min(84, WORLD_W * 0.18));
      const tH = Math.round(Math.min(56, WORLD_H * 0.09));
      const tunnelMinX = 70;
      const tunnelMaxX = Math.max(tunnelMinX + 8, lane - tW - 20);
      tunnel = { x: rand(tunnelMinX, tunnelMaxX), y: rand(WORLD_H * 0.28, WORLD_H * 0.52), w: tW, h: tH };
      targets = [];
      placeCircles("point", 4 + Math.floor(rand(0, 3)), 18);
      placeCircles("money", 2 + Math.floor(rand(0, 2)), 20);
      const bumpers = [];
      const bumperCount = 3 + Math.floor(rand(0, 3));
      const top = Math.round(WORLD_H * 0.045);
      const playBottom = Math.round(WORLD_H * 0.86);
      const floor = Math.round(WORLD_H * 0.955);
      const rightBottom = Math.round(WORLD_H * 0.94);
      for (let i = 0; i < bumperCount; i += 1) {
        const x = rand(70, Math.max(90, lane - 50));
        const y = rand(WORLD_H * 0.16, WORLD_H * 0.72);
        const len = rand(36, Math.min(90, WORLD_H * 0.12));
        const angle = rand(-1.2, 1.2);
        const x2 = Math.max(52, Math.min(lane - 16, x + Math.cos(angle) * len));
        const y2 = Math.max(WORLD_H * 0.12, Math.min(WORLD_H * 0.8, y + Math.sin(angle) * len));
        if (circleHitsTunnel((x + x2) / 2, (y + y2) / 2, 20)) continue;
        bumpers.push([x, y, x2, y2]);
      }
      walls = [
        [22, top, WORLD_W - 22, top],
        [22, top, 22, playBottom],
        [WORLD_W - 22, top, WORLD_W - 22, rightBottom],
        [lane, Math.round(WORLD_H * 0.18), lane, rightBottom],
        [lane, Math.round(WORLD_H * 0.07), WORLD_W - 22, Math.round(WORLD_H * 0.16)],
        [22, playBottom, Math.round(WORLD_W * 0.28), floor],
        [lane - 28, floor, lane, playBottom],
        [tunnel.x, tunnel.y, tunnel.x, tunnel.y + Math.max(12, tunnel.h - 16)],
        [tunnel.x + tunnel.w, tunnel.y, tunnel.x + tunnel.w, tunnel.y + Math.max(12, tunnel.h - 16)]
      ].concat(bumpers);
      key = layoutKey();
      guard += 1;
    } while (key === lastLayoutKey && guard < 8);
    const lane = laneX();
    const flipY = Math.round(WORLD_H * 0.91);
    const flipLen = Math.min(96, Math.round((lane - 80) / 2));
    flippers[0].x = Math.round(WORLD_W * 0.27);
    flippers[0].y = flipY;
    flippers[0].len = flipLen;
    flippers[1].x = lane - 30;
    flippers[1].y = flipY;
    flippers[1].len = flipLen;
    lastLayoutKey = key;
  }

  function loadSlots() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
      const list = parsed && Array.isArray(parsed.slots) ? parsed.slots : [];
      const slots = [];
      for (let i = 0; i < SLOT_COUNT; i += 1) slots.push(normalizeSave(list[i]));
      return slots;
    } catch (_err) {
      return [null, null, null, null];
    }
  }

  function normalizeSave(save) {
    if (!save || typeof save.name !== "string" || !save.name.trim()) return null;
    const marbles = Array.isArray(save.marbles) ? save.marbles.filter((ball) => ball && ball.name).map((ball, index) => ({
      id: String(ball.id || ("pb-" + index)),
      name: String(ball.name).slice(0, 40),
      color: ball.color || "#55d6ff",
      duplicateChance: Math.max(0, Math.min(180, Math.floor(Number(ball.duplicateChance) || 0)))
    })) : [];
    if (!marbles.length) return null;
    const letter = /^[A-Z]$/.test(save.letter) ? save.letter : "A";
    return {
      name: save.name.trim().slice(0, 24),
      marbles,
      money: Math.max(0, Math.floor(Number(save.money) || 0)),
      letter,
      moneyLevel: Math.max(1, Math.floor(Number(save.moneyLevel) || 1)),
      dupGiftLeft: save.dupGiftLeft == null ? 2 : Math.max(0, Math.floor(Number(save.dupGiftLeft) || 0))
    };
  }

  function persist() {
    localStorage.setItem(KEY, JSON.stringify({ slots }));
  }

  function current() {
    return slotIndex >= 0 ? slots[slotIndex] : null;
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[char]));
  }

  function packs() {
    try {
      return window.SharedPacks ? SharedPacks.load() : [];
    } catch (_err) {
      return [];
    }
  }

  function moneyPayout(save) {
    return 10 * save.moneyLevel;
  }

  function upgradeCost(save) {
    return 40 * save.moneyLevel;
  }

  function renderSlots() {
    const list = document.getElementById("slotList");
    list.innerHTML = "";
    slots.forEach((save, index) => {
      const row = document.createElement("div");
      row.className = "slot";
      if (!save) {
        row.innerHTML = "<div><strong>Slot " + (index + 1) + "</strong><span class='hint'>Vacío</span></div>";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn primary";
        button.textContent = "Nueva partida";
        button.addEventListener("click", () => openCreate(index));
        row.appendChild(button);
      } else {
        row.innerHTML = "<div><strong></strong><span class='hint'></span></div>";
        row.querySelector("strong").textContent = save.name;
        row.querySelector("span").textContent = save.marbles.length + " pelotitas · $" + save.money + " · túnel " + save.letter;
        const actions = document.createElement("div");
        actions.className = "slot-actions";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn secondary";
        button.textContent = "Entrar";
        button.addEventListener("click", () => openLobby(index));
        const erase = document.createElement("button");
        erase.type = "button";
        erase.className = "btn ghost";
        erase.textContent = "Borrar";
        erase.addEventListener("click", () => deleteSlot(index));
        actions.append(button, erase);
        row.appendChild(actions);
      }
      list.appendChild(row);
    });
  }

  function deleteSlot(index) {
    const save = slots[index];
    if (!save) return;
    if (!confirm("¿Borrar la partida " + save.name + "?")) return;
    slots[index] = null;
    if (slotIndex === index) slotIndex = -1;
    persist();
    renderSlots();
    show("screenSlots");
  }

  function openCreate(index) {
    slotIndex = index;
    document.getElementById("saveName").value = "";
    document.getElementById("createError").hidden = true;
    const box = document.getElementById("packChoices");
    const empty = document.getElementById("packEmpty");
    box.innerHTML = "";
    const list = packs().filter((pack) => pack && Array.isArray(pack.marbles) && pack.marbles.length);
    empty.hidden = list.length > 0;
    list.forEach((pack) => {
      const label = document.createElement("label");
      label.className = "pack-choice";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = pack.id;
      const text = document.createElement("div");
      text.innerHTML = "<strong></strong><span class='hint'></span>";
      text.querySelector("strong").textContent = pack.name;
      text.querySelector("span").textContent = pack.marbles.length + " pelotitas";
      const dots = document.createElement("div");
      dots.className = "dots";
      pack.marbles.slice(0, 8).forEach((marble) => {
        const dot = document.createElement("i");
        dot.className = "dot";
        dot.style.background = marble.color || "#55d6ff";
        dots.appendChild(dot);
      });
      label.append(input, text, dots);
      box.appendChild(label);
    });
    show("screenCreate");
  }

  function createSave(event) {
    event.preventDefault();
    const error = document.getElementById("createError");
    const name = document.getElementById("saveName").value.trim();
    const chosen = [...document.querySelectorAll("#packChoices input:checked")].map((input) => input.value);
    const source = packs().filter((pack) => chosen.includes(pack.id));
    const marbles = [];
    source.forEach((pack) => {
      pack.marbles.forEach((marble) => {
        if (!marble || !marble.name) return;
        marbles.push({
          id: "pb-" + Date.now().toString(36) + "-" + marbles.length + "-" + Math.random().toString(36).slice(2, 6),
          name: String(marble.name).slice(0, 40),
          color: marble.color || "#55d6ff",
          duplicateChance: 0
        });
      });
    });
    if (!name) {
      error.hidden = false;
      error.textContent = "Poné un nombre.";
      return;
    }
    if (!marbles.length) {
      error.hidden = false;
      error.textContent = "Elegí al menos un pack con pelotitas.";
      return;
    }
    slots[slotIndex] = {
      name: name.slice(0, 24),
      marbles,
      money: 0,
      letter: "A",
      moneyLevel: 1,
      dupGiftLeft: 2
    };
    persist();
    openLobby(slotIndex);
  }

  function openLobby(index) {
    stopPlay();
    slotIndex = index;
    const save = current();
    if (!save) {
      renderSlots();
      show("screenSlots");
      return;
    }
    selected = new Set(save.marbles.map((ball) => ball.id));
    renderLobby();
    show("screenLobby");
  }

  function dupSummary(save) {
    const owned = save.marbles.filter((ball) => ball.duplicateChance > 0);
    if (!owned.length) return "Duplicar: solo quien cruza en Z";
    return "Duplicar: " + owned.map((ball) => ball.name + " " + ball.duplicateChance + "%").join(" · ");
  }

  function renderLobby() {
    const save = current();
    if (!save) return;
    document.getElementById("lobbyTitle").textContent = save.name;
    document.getElementById("lobbyMeta").textContent = save.marbles.length + " pelotitas de los packs. No se pueden crear más.";
    document.getElementById("statMoney").textContent = "Dinero: $" + save.money;
    document.getElementById("statLetter").textContent = "Túnel: " + save.letter;
    document.getElementById("statDup").textContent = dupSummary(save);
    document.getElementById("statLevel").textContent = "Círculos de dinero: nivel " + save.moneyLevel + " · dan $" + moneyPayout(save);
    const upgrade = document.getElementById("btnUpgrade");
    const cost = upgradeCost(save);
    upgrade.textContent = "Mejorar círculos de dinero ($" + cost + ")";
    upgrade.disabled = save.money < cost;
    const upgrade10 = document.getElementById("btnUpgrade10");
    const upgrade100 = document.getElementById("btnUpgrade100");
    upgrade10.textContent = "Mejorar ×10 ($" + (cost * 10) + ")";
    upgrade100.textContent = "Mejorar ×100 ($" + (cost * 100) + ")";
    upgrade10.disabled = save.money < cost * 10;
    upgrade100.disabled = save.money < cost * 100;
    const roster = document.getElementById("roster");
    roster.innerHTML = "";
    save.marbles.forEach((ball) => {
      const label = document.createElement("label");
      label.className = "marble-choice";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = selected.has(ball.id);
      input.addEventListener("change", () => {
        if (input.checked) selected.add(ball.id);
        else selected.delete(ball.id);
      });
      const dot = document.createElement("i");
      dot.className = "dot";
      dot.style.background = ball.color;
      const name = document.createElement("strong");
      name.textContent = ball.duplicateChance ? ball.name + " · " + ball.duplicateChance + "%" : ball.name;
      label.append(input, dot, name);
      roster.appendChild(label);
    });
    renderGift();
  }

  function giftCost(save) {
    return upgradeCost(save) * 2;
  }

  function refillCost(save) {
    return upgradeCost(save) * 10;
  }

  function renderGift() {
    const save = current();
    if (!save) return;
    const hint = document.getElementById("giftHint");
    const useRow = document.getElementById("giftUse");
    const refill = document.getElementById("btnGiftRefill");
    const select = document.getElementById("giftMarble");
    const button = document.getElementById("btnGift");
    if (save.dupGiftLeft > 0) {
      useRow.hidden = false;
      refill.hidden = true;
      const previous = select.value;
      select.innerHTML = "";
      save.marbles.forEach((ball) => {
        const option = document.createElement("option");
        option.value = ball.id;
        option.textContent = ball.duplicateChance ? ball.name + " · " + ball.duplicateChance + "%" : ball.name;
        select.appendChild(option);
      });
      if ([...select.options].some((option) => option.value === previous)) select.value = previous;
      const cost = giftCost(save);
      const marble = save.marbles.find((ball) => ball.id === select.value);
      button.textContent = "Sumar 10% ($" + cost + ")";
      button.disabled = save.money < cost || !marble || marble.duplicateChance >= 180;
      hint.textContent = "Cuesta el doble de la mejora. Solo esa pelotita suma 10% para duplicarse. Usos: " + save.dupGiftLeft + ".";
    } else {
      useRow.hidden = true;
      refill.hidden = false;
      const cost = refillCost(save);
      refill.textContent = "Comprar un uso más ($" + cost + ")";
      refill.disabled = save.money < cost;
      hint.textContent = "Ese botón se fue para siempre. Pagá 10 veces la mejora para tener un uso más.";
    }
  }

  function giveDupGift() {
    const save = current();
    if (!save || save.dupGiftLeft <= 0) return;
    const marble = save.marbles.find((ball) => ball.id === document.getElementById("giftMarble").value);
    const cost = giftCost(save);
    if (!marble || marble.duplicateChance >= 180 || save.money < cost) return;
    save.money -= cost;
    marble.duplicateChance = Math.min(180, marble.duplicateChance + 10);
    save.dupGiftLeft -= 1;
    persist();
    renderLobby();
    refreshPlayHud();
  }

  function refillDupGift() {
    const save = current();
    if (!save || save.dupGiftLeft > 0) return;
    const cost = refillCost(save);
    if (save.money < cost) return;
    save.money -= cost;
    save.dupGiftLeft = 1;
    persist();
    renderLobby();
    refreshPlayHud();
  }

  function upgradeMoney(steps) {
    const save = current();
    if (!save) return;
    const count = steps === 10 || steps === 100 ? steps : 1;
    const cost = upgradeCost(save) * count;
    if (save.money < cost) return;
    save.money -= cost;
    save.moneyLevel += count;
    persist();
    renderLobby();
    refreshPlayHud();
  }

  function makeBall(marble, clone) {
    return {
      id: clone ? ("clone-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 5)) : marble.id,
      name: marble.name,
      color: marble.color,
      clone: !!clone,
      duplicateChance: clone ? 0 : Math.max(0, Math.min(180, Math.floor(Number(marble.duplicateChance) || 0))),
      x: laneX() + 42,
      y: WORLD_H * 0.88,
      vx: 0,
      vy: 0,
      r: RADIUS,
      mode: "wait",
      cool: {}
    };
  }

  function startPlay() {
    const save = current();
    if (!save) return;
    const picked = save.marbles.filter((ball) => selected.has(ball.id));
    if (!picked.length) {
      document.getElementById("lobbyMeta").textContent = "Elegí al menos una pelotita, o tocá Elegir todas.";
      return;
    }
    show("screenPlay");
    fitTable();
    buildLayout();
    queue = picked.map((ball) => makeBall(ball, false));
    live = [];
    pops = [];
    camY = 0;
    playing = true;
    refreshPlayHud();
    setStatus("Mapa nuevo. Lanzá una pelotita por el carril de la derecha.");
    frame = requestAnimationFrame(loop);
  }

  function stopPlay() {
    playing = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    leftHeld = false;
    rightHeld = false;
  }

  function setStatus(text) {
    const status = document.getElementById("playStatus");
    if (status) status.textContent = text;
  }

  function refreshPlayHud() {
    const save = current();
    if (!save) return;
    document.getElementById("playMoney").textContent = "$" + save.money;
    document.getElementById("playLetter").textContent = "Túnel " + save.letter;
    document.getElementById("playDup").textContent = dupSummary(save);
    const cost = upgradeCost(save);
    const single = document.getElementById("btnUpgradePlay");
    const ten = document.getElementById("btnUpgradePlay10");
    const hundred = document.getElementById("btnUpgradePlay100");
    single.textContent = "Mejorar $" + cost;
    ten.textContent = "×10 $" + (cost * 10);
    hundred.textContent = "×100 $" + (cost * 100);
    single.disabled = save.money < cost;
    ten.disabled = save.money < cost * 10;
    hundred.disabled = save.money < cost * 100;
  }

  function sendOut(ball, x, y, vx, vy) {
    ball.mode = "free";
    ball.x = x;
    ball.y = y;
    ball.vx = vx;
    ball.vy = vy;
    ball.laneUntil = performance.now() + 900;
    live.push(ball);
  }

  function launch() {
    if (!playing || !queue.length) return;
    const ball = queue.shift();
    const lane = laneX();
    sendOut(ball, lane + 42, WORLD_H * 0.84, 0, -Math.max(13, Math.sqrt(WORLD_H * 0.36)));
    setStatus(ball.name + " salió. Quedan " + queue.length + ".");
  }

  function releaseAll() {
    if (!playing || !queue.length) return;
    const balls = queue.splice(0);
    const lane = laneX();
    const area = { x: 46, y: WORLD_H * 0.1, w: Math.max(120, lane - 80), h: WORLD_H * 0.34 };
    const cols = Math.max(1, Math.ceil(Math.sqrt(balls.length * (area.w / area.h))));
    const rows = Math.ceil(balls.length / cols);
    balls.forEach((ball, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      sendOut(
        ball,
        area.x + ((col + 0.5) / cols) * area.w,
        area.y + ((row + 0.5) / rows) * area.h,
        0,
        0.6
      );
    });
    setStatus("Salieron las " + balls.length + " pelotitas.");
  }

  function passTunnel(ball) {
    const save = current();
    if (!save || ball.tunnelCounted) return;
    ball.tunnelCounted = true;
    if (save.letter === "Z") {
      ball.duplicateChance = Math.min(180, (ball.duplicateChance || 0) + 5);
      if (!ball.clone) {
        const marble = save.marbles.find((item) => item.id === ball.id);
        if (marble) marble.duplicateChance = ball.duplicateChance;
      }
      save.letter = "A";
      setStatus(ball.name + " cruzó en Z. Solo " + ball.name + " suma 5% para duplicar.");
      popText(ball.x, ball.y, ball.name + " +5%");
    } else {
      save.letter = String.fromCharCode(save.letter.charCodeAt(0) + 1);
      popText(ball.x, ball.y, save.letter);
    }
    persist();
    refreshPlayHud();
  }

  function popText(x, y, text) {
    pops.push({ x, y, text, life: 50 });
  }

  function placeCopy(ball, x, y, vx, vy, quiet) {
    if (live.length >= 36) return false;
    const copy = makeBall(ball, true);
    copy.mode = "free";
    copy.x = x;
    copy.y = y;
    copy.vx = vx;
    copy.vy = vy;
    copy.laneUntil = performance.now() + 4000;
    live.push(copy);
    if (!quiet) {
      popText(x, y - 16, "¡Doble!");
      setStatus(ball.name + " se duplicó.");
    }
    return true;
  }

  function duplicateBall(ball, quiet) {
    const lane = laneX();
    const x = Math.max(ball.r + 8, Math.min(lane - 24, ball.x + (ball.x > lane ? -28 : 16)));
    return placeCopy(ball, x, ball.y, -ball.vx * 0.6 - 2, ball.vy * 0.6, quiet);
  }

  function spawnTableCopy(ball) {
    const lane = laneX();
    return placeCopy(
      ball,
      rand(56, Math.max(90, lane - 36)),
      rand(WORLD_H * 0.14, WORLD_H * 0.62),
      rand(-3, 3),
      rand(-1, 3),
      true
    );
  }

  function dupEveryMs(chance) {
    if (chance >= 180) return 0.005;
    if (chance < 105) return 0;
    const steps = Math.min(14, Math.floor((chance - 105) / 5));
    return (15 - steps) * 1000;
  }

  function dupOriginals() {
    const save = current();
    if (save) {
      const chances = new Map(save.marbles.map((marble) => [marble.id, marble.duplicateChance || 0]));
      live.concat(queue).forEach((ball) => {
        if (!ball.clone && chances.has(ball.id)) ball.duplicateChance = chances.get(ball.id);
      });
    }
    const seen = new Set();
    const list = [];
    live.concat(queue).forEach((ball) => {
      if (ball.clone || seen.has(ball.id)) return;
      if ((ball.duplicateChance || 0) < 105) return;
      seen.add(ball.id);
      list.push(ball);
    });
    return list;
  }

  function autoDuplicate() {
    const now = performance.now();
    dupOriginals().forEach((ball) => {
      if ((ball.duplicateChance || 0) >= 180) {
        let made = false;
        while (live.length < 36) {
          if (!spawnTableCopy(ball)) break;
          made = true;
        }
        if (made) setStatus(ball.name + " está en 180% y se duplica sin parar.");
        return;
      }
      const wait = dupEveryMs(ball.duplicateChance);
      if (ball.dupTimerChance !== ball.duplicateChance || !ball.nextDupAt) {
        ball.dupTimerChance = ball.duplicateChance;
        ball.nextDupAt = now + wait;
        return;
      }
      if (now >= ball.nextDupAt) {
        spawnTableCopy(ball);
        setStatus(ball.name + " se duplicó.");
        ball.nextDupAt = now + dupEveryMs(ball.duplicateChance);
      }
    });
  }

  function hitTarget(ball, target) {
    const now = performance.now();
    if (now - (ball.cool[target.id] || 0) < 450) return;
    ball.cool[target.id] = now;
    const save = current();
    if (!save) return;
    if (target.kind === "point") {
      save.money += POINT_PAY;
      popText(target.x, target.y, "+" + POINT_PAY);
    } else {
      const pay = moneyPayout(save);
      save.money += pay;
      popText(target.x, target.y, "+$" + pay);
      if ((ball.duplicateChance || 0) > 0 && Math.random() * 100 < ball.duplicateChance) duplicateBall(ball);
    }
    persist();
    refreshPlayHud();
  }

  function collideCircle(ball, target) {
    const dx = ball.x - target.x;
    const dy = ball.y - target.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const min = ball.r + target.r;
    if (dist >= min) return;
    hitTarget(ball, target);
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = target.x + nx * (min + 0.5);
    ball.y = target.y + ny * (min + 0.5);
    const speed = Math.max(6.2, Math.hypot(ball.vx, ball.vy));
    ball.vx = nx * speed;
    ball.vy = ny * speed;
  }

  function collideSegment(ball, wall, bounce) {
    const ax = wall[0];
    const ay = wall[1];
    const bx = wall[2];
    const by = wall[3];
    const abx = bx - ax;
    const aby = by - ay;
    const len2 = abx * abx + aby * aby || 1;
    let t = ((ball.x - ax) * abx + (ball.y - ay) * aby) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + abx * t;
    const cy = ay + aby * t;
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.hypot(dx, dy) || 0.001;
    const min = ball.r + 3;
    if (dist >= min) return false;
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x += nx * (min - dist);
    ball.y += ny * (min - dist);
    const vn = ball.vx * nx + ball.vy * ny;
    if (vn < 0) {
      ball.vx -= (1 + bounce) * vn * nx;
      ball.vy -= (1 + bounce) * vn * ny;
    }
    return true;
  }

  function flipperEnds(flipper) {
    return {
      x2: flipper.x + Math.cos(flipper.angle) * flipper.len,
      y2: flipper.y + Math.sin(flipper.angle) * flipper.len
    };
  }

  function updateFlippers() {
    flippers.forEach((flipper, index) => {
      const held = index === 0 ? leftHeld : rightHeld;
      const target = held ? flipper.up : flipper.rest;
      const before = flipper.angle;
      flipper.angle += (target - flipper.angle) * (held ? 0.55 : 0.28);
      flipper.rising = held && Math.abs(flipper.angle - before) > 0.01;
    });
  }

  function collideFlipper(ball, flipper) {
    const ends = flipperEnds(flipper);
    const hit = collideSegment(ball, [flipper.x, flipper.y, ends.x2, ends.y2], 0.35);
    if (hit && flipper.rising) {
      ball.vy -= 9.5;
      ball.vx += flipper.side * 4.2;
    }
  }

  function tryEnterTunnel(ball) {
    const mouthTop = tunnel.y + tunnel.h - 36;
    const mouthBottom = tunnel.y + tunnel.h + 18;
    const insideX = ball.x > tunnel.x + 10 && ball.x < tunnel.x + tunnel.w - 10;
    if (!insideX || ball.y < mouthTop || ball.y > mouthBottom) return;
    ball.mode = "tunnel";
    ball.tunnelCounted = false;
    ball.vx = 0;
  }

  function updateTunnel(ball) {
    const center = tunnel.x + tunnel.w / 2;
    ball.x += (center - ball.x) * 0.25;
    ball.vx = 0;
    ball.vy = -6.4;
    ball.y += ball.vy;
    if (ball.y < tunnel.y - ball.r) {
      ball.mode = "free";
      ball.vy = -8;
      ball.vx = ball.x < center ? -3.2 : 3.2;
      passTunnel(ball);
    }
  }

  function stepBall(ball) {
    if (ball.mode === "tunnel") {
      updateTunnel(ball);
      return;
    }
    ball.vy = Math.min(13, ball.vy + 0.2);
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.996;
    walls.forEach((wall) => collideSegment(ball, wall, 0.55));
    targets.forEach((target) => collideCircle(ball, target));
    flippers.forEach((flipper) => collideFlipper(ball, flipper));
    const lane = laneX();
    if (ball.x > lane + 8 && ball.y < WORLD_H * 0.2) {
      ball.vx = -9;
      ball.vy = -2;
    }
    if (ball.x > lane + 8 && ball.y > WORLD_H * 0.9 && performance.now() > (ball.laneUntil || 0)) {
      if (ball.clone) {
        ball.mode = "out";
        return;
      }
      ball.mode = "wait";
      ball.vx = 0;
      ball.vy = 0;
      queue.unshift(ball);
      return;
    }
    if (ball.y > WORLD_H * 0.97 && ball.x > WORLD_W * 0.26 && ball.x < lane - 16) {
      ball.mode = "out";
      return;
    }
    ball.x = Math.max(ball.r, Math.min(WORLD_W - ball.r, ball.x));
    tryEnterTunnel(ball);
  }

  function collideMarbles() {
    const balls = live.filter((ball) => ball.mode === "free");
    for (let pass = 0; pass < 2; pass += 1) {
      for (let i = 0; i < balls.length; i += 1) {
        for (let j = i + 1; j < balls.length; j += 1) {
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const min = a.r + b.r;
          if (dist >= min && dist > 0) continue;
          const nx = dist < 0.01 ? 1 : dx / dist;
          const ny = dist < 0.01 ? 0 : dy / dist;
          const overlap = min - dist + 0.2;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
          const push = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (push > 0) {
            a.vx -= push * nx;
            a.vy -= push * ny;
            b.vx += push * nx;
            b.vy += push * ny;
          }
        }
      }
    }
  }

  function updatePlay() {
    updateFlippers();
    live.forEach(stepBall);
    live = live.filter((ball) => ball.mode === "free" || ball.mode === "tunnel");
    collideMarbles();
    pops.forEach((pop) => {
      pop.y -= 0.6;
      pop.life -= 1;
    });
    pops = pops.filter((pop) => pop.life > 0);
    autoDuplicate();
    camY = 0;
    if (!live.length && !queue.length) {
      setStatus("Se fueron todas. El dinero y el túnel quedaron guardados.");
    }
  }

  function drawMarble(ball) {
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#04120e";
    ctx.font = "700 9px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(ball.name.slice(0, 8), ball.x, ball.y - ball.r - 4);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#06382c");
    sky.addColorStop(1, "#02140f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -camY);
    ctx.strokeStyle = "#d1fae5";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    walls.forEach((wall) => {
      ctx.beginPath();
      ctx.moveTo(wall[0], wall[1]);
      ctx.lineTo(wall[2], wall[3]);
      ctx.stroke();
    });

    ctx.fillStyle = "#082f49";
    ctx.fillRect(tunnel.x + 4, tunnel.y, tunnel.w - 8, tunnel.h - 20);
    ctx.fillStyle = "#e0f2fe";
    ctx.font = "900 22px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(current().letter, tunnel.x + tunnel.w / 2, tunnel.y + tunnel.h / 2 + 8);

    targets.forEach((target) => {
      ctx.beginPath();
      ctx.fillStyle = target.kind === "money" ? "#facc15" : "#38bdf8";
      ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#082f49";
      ctx.font = "800 14px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(target.kind === "money" ? "$" : "P", target.x, target.y + 5);
    });

    flippers.forEach((flipper) => {
      const ends = flipperEnds(flipper);
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(flipper.x, flipper.y);
      ctx.lineTo(ends.x2, ends.y2);
      ctx.stroke();
    });

    if (queue.length) {
      const next = queue[0];
      const lane = laneX();
      next.x = lane + 42;
      next.y = WORLD_H * 0.88;
      drawMarble(next);
      ctx.fillStyle = "#e0f2fe";
      ctx.font = "700 15px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(String(queue.length), lane + 42, WORLD_H * 0.8);
    }
    live.forEach(drawMarble);
    ctx.restore();

    pops.forEach((pop) => {
      ctx.globalAlpha = Math.max(0, pop.life / 50);
      ctx.fillStyle = "#fef9c3";
      ctx.font = "800 16px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(pop.text, pop.x, pop.y - camY);
      ctx.globalAlpha = 1;
    });
  }

  function loop() {
    if (!playing) return;
    updatePlay();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function holdFlipper(side, held) {
    if (side === "left") leftHeld = held;
    else rightHeld = held;
  }

  document.getElementById("btnStart").addEventListener("click", () => {
    renderSlots();
    show("screenSlots");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnCancelCreate").addEventListener("click", () => {
    renderSlots();
    show("screenSlots");
  });
  document.getElementById("createForm").addEventListener("submit", createSave);
  document.getElementById("btnBackSlots").addEventListener("click", () => {
    renderSlots();
    show("screenSlots");
  });
  document.getElementById("btnDelete").addEventListener("click", () => deleteSlot(slotIndex));
  document.getElementById("btnAll").addEventListener("click", () => {
    const save = current();
    if (!save) return;
    selected = new Set(save.marbles.map((ball) => ball.id));
    renderLobby();
  });
  document.getElementById("btnNone").addEventListener("click", () => {
    selected = new Set();
    renderLobby();
  });
  document.getElementById("btnUpgrade").addEventListener("click", () => upgradeMoney(1));
  document.getElementById("btnUpgrade10").addEventListener("click", () => upgradeMoney(10));
  document.getElementById("btnUpgrade100").addEventListener("click", () => upgradeMoney(100));
  document.getElementById("giftMarble").addEventListener("change", renderGift);
  document.getElementById("btnGift").addEventListener("click", giveDupGift);
  document.getElementById("btnGiftRefill").addEventListener("click", refillDupGift);
  document.getElementById("btnUpgradePlay").addEventListener("click", () => upgradeMoney(1));
  document.getElementById("btnUpgradePlay10").addEventListener("click", () => upgradeMoney(10));
  document.getElementById("btnUpgradePlay100").addEventListener("click", () => upgradeMoney(100));
  document.getElementById("btnPlay").addEventListener("click", startPlay);
  document.getElementById("btnLeavePlay").addEventListener("click", () => openLobby(slotIndex));
  document.getElementById("btnLaunch").addEventListener("click", launch);
  document.getElementById("btnRelease").addEventListener("click", releaseAll);

  function bindHold(button, side) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      holdFlipper(side, true);
    });
    button.addEventListener("pointerup", () => holdFlipper(side, false));
    button.addEventListener("pointerleave", () => holdFlipper(side, false));
    button.addEventListener("pointercancel", () => holdFlipper(side, false));
  }
  bindHold(document.getElementById("btnLeft"), "left");
  bindHold(document.getElementById("btnRight"), "right");

  window.addEventListener("keydown", (event) => {
    if (!playing) return;
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      leftHeld = true;
      event.preventDefault();
    } else if (event.code === "ArrowRight" || event.code === "KeyD") {
      rightHeld = true;
      event.preventDefault();
    } else if (event.code === "Space") {
      launch();
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") leftHeld = false;
    if (event.code === "ArrowRight" || event.code === "KeyD") rightHeld = false;
  });
})();
