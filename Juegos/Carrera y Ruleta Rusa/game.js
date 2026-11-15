(function () {
  "use strict";

  const STORAGE_KEY = "carrera-ruleta-rusa-v1";
  const STORAGE_BAK = "carrera-ruleta-rusa-v1-bak";
  const RADIUS = 12;
  const GRAVITY = 0.28;
  const BOUNCE = 0.72;

  const canvas = document.getElementById("table");
  const ctx = canvas.getContext("2d");

  let state = loadState();
  let match = null;
  let ball = null;
  let pegs = [];
  let walls = [];
  let zones = { safe: "left", elim: "right" };
  let anim = 0;
  let landing = false;
  let selectedId = null;

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function packs() {
    return window.SharedPacks ? SharedPacks.load() : [];
  }

  function defaultState() {
    return {
      medals: 0,
      progress: {},
      cycle: 1
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_BAK);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return defaultState();
      return {
        medals: Math.max(0, Math.round(Number(parsed.medals) || 0)),
        progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
        cycle: Math.max(1, Math.round(Number(parsed.cycle) || 1))
      };
    } catch (_err) {
      return defaultState();
    }
  }

  function saveState() {
    const json = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_BAK, json);
    } catch (_err) {
      try { localStorage.setItem(STORAGE_KEY, json); } catch (_err2) { /* sin espacio */ }
    }
  }

  function packProgress(packId) {
    return state.progress[packId] || null;
  }

  function allPacksCleared() {
    const list = packs();
    if (!list.length) return false;
    return list.every((pack) => {
      const prog = packProgress(pack.id);
      return prog && prog.cleared && prog.survivor;
    });
  }

  function updateMedalUi() {
    const text = "🏅 " + state.medals;
    document.getElementById("medalCount").textContent = text;
    document.getElementById("matchMedals").textContent = text;
  }

  function renderHub() {
    state = loadState();
    updateMedalUi();
    const list = document.getElementById("packList");
    const status = document.getElementById("hubStatus");
    const finalBtn = document.getElementById("btnFinal");
    list.innerHTML = "";
    const found = packs();
    if (!found.length) {
      status.textContent = "No hay packs. Creá uno en Packs.";
      status.className = "status bad";
      finalBtn.disabled = true;
      show("screenHub");
      return;
    }
    found.forEach((pack) => {
      const count = Array.isArray(pack.marbles) ? pack.marbles.length : 0;
      const prog = packProgress(pack.id);
      const row = document.createElement("div");
      row.className = "pack-row";
      const info = document.createElement("div");
      info.innerHTML = "<strong></strong><span></span>";
      info.querySelector("strong").textContent = pack.name || "Pack";
      info.querySelector("span").textContent = prog && prog.cleared
        ? "Completado · sobreviviente: " + (prog.survivor && prog.survivor.name ? prog.survivor.name : "?")
        : count + " pelotita" + (count === 1 ? "" : "s") + " · sin completar";
      const play = document.createElement("button");
      play.type = "button";
      play.className = "btn secondary";
      play.textContent = prog && prog.cleared ? "Repetir" : "Jugar";
      play.disabled = count < 2;
      play.title = count < 2 ? "Necesitás al menos 2 pelotitas" : "";
      play.addEventListener("click", () => startPackMatch(pack));
      row.append(info, play);
      list.appendChild(row);
    });
    const unlocked = allPacksCleared();
    finalBtn.disabled = !unlocked;
    status.textContent = unlocked
      ? "Final desbloqueado. Ciclo " + state.cycle + "."
      : "Completá todos los packs para desbloquear Final. Ciclo " + state.cycle + ".";
    status.className = unlocked ? "status ok" : "status";
    show("screenHub");
  }

  function normalizeMarble(marble, index) {
    if (!marble || !marble.name) return null;
    return {
      id: marble.id || ("m-" + index + "-" + String(marble.name)),
      name: String(marble.name).slice(0, 100),
      color: marble.color || "#55d6ff"
    };
  }

  function startPackMatch(pack) {
    const marbles = (pack.marbles || []).map(normalizeMarble).filter(Boolean);
    if (marbles.length < 2) return;
    match = {
      mode: "pack",
      packId: pack.id,
      packName: pack.name || "Pack",
      alive: marbles.slice(),
      pending: marbles.slice(),
      advanced: [],
      round: 1,
      secondLifeArmed: false,
      usedSecondLife: false,
      waitingPick: true,
      finished: false
    };
    selectedId = null;
    ball = null;
    landing = false;
    document.getElementById("matchTitle").textContent = pack.name || "Pack";
    document.getElementById("matchHint").textContent =
      "Elegí una pelotita. Un lado te salva y el otro te elimina.";
    document.getElementById("matchStatus").textContent = "";
    updateMedalUi();
    buildLevel(match.round);
    renderAlive();
    renderMatchActions();
    draw();
    show("screenMatch");
  }

  function startFinal() {
    if (!allPacksCleared()) return;
    const survivors = packs().map((pack) => {
      const prog = packProgress(pack.id);
      if (!prog || !prog.survivor) return null;
      return normalizeMarble(prog.survivor, pack.id);
    }).filter(Boolean);
    if (survivors.length < 2) {
      document.getElementById("hubStatus").textContent = "Hace falta al menos 2 sobrevivientes.";
      document.getElementById("hubStatus").className = "status bad";
      return;
    }
    match = {
      mode: "final",
      packId: "",
      packName: "Final",
      alive: survivors,
      pending: survivors.slice(),
      advanced: [],
      round: 1,
      secondLifeArmed: false,
      usedSecondLife: false,
      waitingPick: true,
      finished: false
    };
    selectedId = null;
    ball = null;
    landing = false;
    document.getElementById("matchTitle").textContent = "Final";
    document.getElementById("matchHint").textContent =
      "Los sobrevivientes de cada pack pelean por la medalla.";
    document.getElementById("matchStatus").textContent = "";
    updateMedalUi();
    buildLevel(match.round);
    renderAlive();
    renderMatchActions();
    draw();
    show("screenMatch");
  }

  function buildLevel(round) {
    const w = canvas.width;
    const h = canvas.height;
    pegs = [];
    walls = [
      { x1: 16, y1: 16, x2: 16, y2: h - 16 },
      { x1: w - 16, y1: 16, x2: w - 16, y2: h - 16 },
      { x1: 16, y1: 16, x2: w - 16, y2: 16 }
    ];
    const rows = 4 + Math.min(4, Math.floor(round / 2));
    const cols = 5;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const offset = r % 2 ? 28 : 0;
        pegs.push({
          x: 56 + c * ((w - 112) / (cols - 1)) + offset * 0.35,
          y: 70 + r * 58,
          r: 7
        });
      }
    }
    const midX = w / 2;
    const lineY = h - 78;
    walls.push({ x1: midX, y1: lineY - 10, x2: midX, y2: h - 18 });
    zones.safe = Math.random() < 0.5 ? "left" : "right";
    zones.elim = zones.safe === "left" ? "right" : "left";
  }

  function renderAlive() {
    const list = document.getElementById("aliveList");
    list.innerHTML = "";
    if (!match) return;
    const pendingIds = new Set((match.pending || []).map((item) => item.id));
    match.alive.forEach((marble) => {
      const canDrop = match.waitingPick && !ball && !match.finished && pendingIds.has(marble.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "marble-btn";
      btn.disabled = !canDrop;
      btn.innerHTML = '<i class="mini"></i><span><strong></strong><div class="meta"></div></span>';
      btn.querySelector(".mini").style.background = marble.color;
      btn.querySelector("strong").textContent = marble.name;
      let meta = "En juego";
      if (pendingIds.has(marble.id)) meta = canDrop ? "Tocá para tirar" : "Esperando…";
      else if ((match.advanced || []).some((item) => item.id === marble.id)) meta = "Ya pasó esta ronda";
      btn.querySelector(".meta").textContent = meta;
      btn.addEventListener("click", () => dropMarble(marble.id));
      list.appendChild(btn);
    });
  }

  function renderMatchActions() {
    const box = document.getElementById("matchActions");
    box.innerHTML = "";
    if (!match || match.finished) return;
    if (!match.secondLifeArmed && !match.usedSecondLife && state.medals >= 2) {
      const life = document.createElement("button");
      life.type = "button";
      life.className = "btn gold";
      life.textContent = "Segunda vida (2 🏅)";
      life.addEventListener("click", () => {
        if (state.medals < 2 || match.usedSecondLife || match.secondLifeArmed) return;
        state.medals -= 2;
        match.secondLifeArmed = true;
        saveState();
        updateMedalUi();
        document.getElementById("matchStatus").textContent =
          "Segunda vida lista: si caés en eliminación, volvés una vez.";
        document.getElementById("matchStatus").className = "status gold";
        renderMatchActions();
      });
      box.appendChild(life);
    } else if (match.secondLifeArmed) {
      const note = document.createElement("span");
      note.className = "hint";
      note.textContent = "Segunda vida armada.";
      box.appendChild(note);
    }
  }

  function dropMarble(id) {
    if (!match || !match.waitingPick || ball || match.finished) return;
    const marble = (match.pending || []).find((item) => item.id === id);
    if (!marble) return;
    selectedId = id;
    match.waitingPick = false;
    landing = false;
    match.pending = match.pending.filter((item) => item.id !== id);
    ball = {
      id: marble.id,
      name: marble.name,
      color: marble.color,
      x: canvas.width / 2 + (Math.random() * 40 - 20),
      y: 36,
      vx: Math.random() * 2.4 - 1.2,
      vy: 0.6
    };
    document.getElementById("matchStatus").textContent =
      marble.name + " cae… (lado seguro: " + (zones.safe === "left" ? "izquierda" : "derecha") + ")";
    document.getElementById("matchStatus").className = "status";
    renderAlive();
    if (!anim) anim = requestAnimationFrame(tick);
  }

  function resolveHitCircle(bx, by, br, cx, cy, cr) {
    const dx = bx - cx;
    const dy = by - cy;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const min = br + cr;
    if (dist >= min) return null;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = min - dist;
    return { nx: nx, ny: ny, overlap: overlap };
  }

  function bounceOffWall(x1, y1, x2, y2) {
    if (!ball) return;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const px = ball.x - x1;
    const py = ball.y - y1;
    const proj = (px * dx + py * dy) / (len * len);
    if (proj < 0 || proj > 1) return;
    const closestX = x1 + proj * dx;
    const closestY = y1 + proj * dy;
    const hit = resolveHitCircle(ball.x, ball.y, RADIUS, closestX, closestY, 2);
    if (!hit) return;
    ball.x += hit.nx * hit.overlap;
    ball.y += hit.ny * hit.overlap;
    const dot = ball.vx * hit.nx + ball.vy * hit.ny;
    if (dot < 0) {
      ball.vx = (ball.vx - 2 * dot * hit.nx) * BOUNCE;
      ball.vy = (ball.vy - 2 * dot * hit.ny) * BOUNCE;
    }
  }

  function physicsStep() {
    if (!ball || landing) return;
    ball.vy += GRAVITY;
    ball.vx *= 0.999;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x < 16 + RADIUS) {
      ball.x = 16 + RADIUS;
      ball.vx = Math.abs(ball.vx) * BOUNCE;
    }
    if (ball.x > canvas.width - 16 - RADIUS) {
      ball.x = canvas.width - 16 - RADIUS;
      ball.vx = -Math.abs(ball.vx) * BOUNCE;
    }
    if (ball.y < 16 + RADIUS) {
      ball.y = 16 + RADIUS;
      ball.vy = Math.abs(ball.vy) * BOUNCE;
    }

    pegs.forEach((peg) => {
      const hit = resolveHitCircle(ball.x, ball.y, RADIUS, peg.x, peg.y, peg.r);
      if (!hit) return;
      ball.x += hit.nx * hit.overlap;
      ball.y += hit.ny * hit.overlap;
      const dot = ball.vx * hit.nx + ball.vy * hit.ny;
      if (dot < 0) {
        ball.vx = (ball.vx - 2 * dot * hit.nx) * BOUNCE + (Math.random() - 0.5) * 0.4;
        ball.vy = (ball.vy - 2 * dot * hit.ny) * BOUNCE;
      }
    });

    walls.forEach((wall) => bounceOffWall(wall.x1, wall.y1, wall.x2, wall.y2));

    const lineY = canvas.height - 78;
    if (ball.y + RADIUS >= lineY + 8) {
      finishDrop();
    }
  }

  function finishDrop() {
    if (!ball || !match || landing) return;
    landing = true;
    const side = ball.x < canvas.width / 2 ? "left" : "right";
    const survived = side === zones.safe;
    const marble = match.alive.find((item) => item.id === ball.id);

    if (survived || (match.secondLifeArmed && !match.usedSecondLife)) {
      if (!survived) {
        match.usedSecondLife = true;
        match.secondLifeArmed = false;
        document.getElementById("matchStatus").textContent =
          (marble ? marble.name : "Pelotita") + " usó la segunda vida y sigue.";
        document.getElementById("matchStatus").className = "status gold";
        renderMatchActions();
      } else {
        document.getElementById("matchStatus").textContent =
          (marble ? marble.name : "Pelotita") + " aterrizó en el lado seguro.";
        document.getElementById("matchStatus").className = "status ok";
      }
      if (marble) match.advanced.push(marble);
      setTimeout(continueRound, 700);
      return;
    }

    document.getElementById("matchStatus").textContent =
      (marble ? marble.name : "Pelotita") + " quedó eliminada.";
    document.getElementById("matchStatus").className = "status bad";
    match.alive = match.alive.filter((item) => item.id !== ball.id);
    setTimeout(continueRound, 700);
  }

  function clearBall() {
    ball = null;
    landing = false;
    selectedId = null;
  }

  function continueRound() {
    clearBall();
    if (!match) return;

    if (match.alive.length <= 1) {
      endMatch(match.alive[0] || null);
      return;
    }

    if ((match.pending || []).length > 0) {
      match.waitingPick = true;
      document.getElementById("matchHint").textContent =
        "Ronda " + match.round + " · faltan " + match.pending.length + " por tirar · viven " + match.alive.length;
      renderAlive();
      draw();
      return;
    }

    match.alive = (match.advanced || []).filter((marble) =>
      match.alive.some((alive) => alive.id === marble.id)
    );
    if (match.alive.length <= 1) {
      endMatch(match.alive[0] || null);
      return;
    }

    match.round += 1;
    match.pending = match.alive.slice();
    match.advanced = [];
    match.waitingPick = true;
    buildLevel(match.round);
    document.getElementById("matchHint").textContent =
      "Ronda " + match.round + " · quedan " + match.alive.length + ". Elegí quién tira.";
    renderAlive();
    draw();
  }

  function endMatch(winner) {
    if (!match) return;
    match.finished = true;
    match.waitingPick = false;
    clearBall();
    if (!winner) {
      document.getElementById("matchStatus").textContent = "No quedó nadie.";
      document.getElementById("matchStatus").className = "status bad";
      renderAlive();
      renderMatchActions();
      draw();
      return;
    }

    if (match.mode === "pack") {
      state.progress[match.packId] = {
        cleared: true,
        survivor: { id: winner.id, name: winner.name, color: winner.color }
      };
      saveState();
      document.getElementById("matchStatus").textContent =
        winner.name + " ganó la partida del pack. Sobreviviente guardado.";
      document.getElementById("matchStatus").className = "status ok";
    } else {
      state.medals += 1;
      state.progress = {};
      state.cycle += 1;
      saveState();
      updateMedalUi();
      document.getElementById("matchStatus").textContent =
        winner.name + " ganó TODO y consiguió una medalla. ¡Ciclo reiniciado!";
      document.getElementById("matchStatus").className = "status gold";
    }
    renderAlive();
    renderMatchActions();
    draw();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(248,250,252,0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    pegs.forEach((peg) => {
      ctx.beginPath();
      ctx.fillStyle = "#94a3b8";
      ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const lineY = h - 78;
    const mid = w / 2;
    ctx.fillStyle = zones.safe === "left" ? "rgba(74,222,128,0.28)" : "rgba(244,63,94,0.28)";
    ctx.fillRect(18, lineY, mid - 18, h - lineY - 18);
    ctx.fillStyle = zones.safe === "right" ? "rgba(74,222,128,0.28)" : "rgba(244,63,94,0.28)";
    ctx.fillRect(mid, lineY, mid - 18, h - lineY - 18);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 14px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(zones.safe === "left" ? "SIGUE" : "ELIMINADO", mid / 2 + 8, lineY + 28);
    ctx.fillText(zones.safe === "right" ? "SIGUE" : "ELIMINADO", mid + mid / 2 - 8, lineY + 28);

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mid, lineY - 10);
    ctx.lineTo(mid, h - 18);
    ctx.stroke();

    if (ball) {
      ctx.beginPath();
      ctx.fillStyle = ball.color;
      ctx.arc(ball.x, ball.y, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function tick() {
    physicsStep();
    draw();
    if (ball && !landing) {
      anim = requestAnimationFrame(tick);
    } else {
      anim = 0;
    }
  }

  document.getElementById("btnPlay").addEventListener("click", renderHub);
  document.getElementById("btnHubTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnFinal").addEventListener("click", startFinal);
  document.getElementById("btnMatchBack").addEventListener("click", () => {
    if (anim) cancelAnimationFrame(anim);
    anim = 0;
    ball = null;
    match = null;
    renderHub();
  });

  draw();
})();
