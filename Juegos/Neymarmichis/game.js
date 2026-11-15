(function () {
  "use strict";

  const STORAGE_KEY = "neymarmichis-saves-v1";
  const STORAGE_BAK = "neymarmichis-saves-v1-bak";

  const PLAYER_STATS = {
    Neymar: { speed: 88, shoot: 86, pass: 90, dribble: 94, stamina: 82 },
    Messi: { speed: 86, shoot: 92, pass: 95, dribble: 96, stamina: 84 },
    Cristiano: { speed: 89, shoot: 94, pass: 82, dribble: 88, stamina: 90 },
    Mbappe: { speed: 97, shoot: 90, pass: 80, dribble: 91, stamina: 88 },
    Haaland: { speed: 90, shoot: 95, pass: 78, dribble: 82, stamina: 92 },
    Pedri: { speed: 82, shoot: 78, pass: 93, dribble: 89, stamina: 86 }
  };

  let saves = [];
  let activeId = null;
  let createCats = [];
  let selectedCatId = null;
  let match = null;
  let matchTimer = null;

  function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function readSaves() {
    try {
      const main = localStorage.getItem(STORAGE_KEY);
      const bak = localStorage.getItem(STORAGE_BAK);
      const parsed = JSON.parse(main || bak || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeSave).filter(Boolean) : [];
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

  function baseStats() {
    return { speed: 70, shoot: 70, pass: 70, dribble: 70, stamina: 70 };
  }

  function normalizeCat(cat) {
    if (!cat || !cat.name) return null;
    const template = cat.playerTemplate && PLAYER_STATS[cat.playerTemplate]
      ? PLAYER_STATS[cat.playerTemplate]
      : null;
    const stats = Object.assign(baseStats(), template || {}, cat.stats || {});
    Object.keys(stats).forEach((key) => {
      stats[key] = clamp(Math.round(Number(stats[key]) || 70), 1, 99);
    });
    const furColors = ["#f9a8d4", "#fdba74", "#fde68a", "#bbf7d0", "#a5b4fc", "#fecdd3", "#e7e5e4"];
    const color = cat.color || furColors[Math.abs(String(cat.name || "x").length + (cat.jerseyNumber || 0)) % furColors.length];
    return {
      id: cat.id || makeId("cat"),
      name: String(cat.name).slice(0, 24),
      breed: String(cat.breed || "Mestizo").slice(0, 32),
      color: color,
      jerseyName: String(cat.jerseyName || cat.name).slice(0, 16).toUpperCase(),
      jerseyNumber: clamp(Math.round(Number(cat.jerseyNumber) || 1), 1, 99),
      playerTemplate: template ? cat.playerTemplate : "",
      stats: stats,
      care: {
        affection: clamp(Math.round(Number(cat.care && cat.care.affection) || 50), 0, 100),
        hunger: clamp(Math.round(Number(cat.care && cat.care.hunger) || 50), 0, 100),
        thirst: clamp(Math.round(Number(cat.care && cat.care.thirst) || 50), 0, 100),
        fun: clamp(Math.round(Number(cat.care && cat.care.fun) || 50), 0, 100)
      },
      realism: clamp(Math.round(Number(cat.realism) || 20), 0, 100)
    };
  }

  function normalizeSave(save) {
    if (!save) return null;
    return {
      id: save.id || makeId("save"),
      name: String(save.name || "Partida").slice(0, 40),
      createdAt: Number(save.createdAt) || Date.now(),
      updatedAt: Number(save.updatedAt) || Date.now(),
      cats: Array.isArray(save.cats) ? save.cats.map(normalizeCat).filter(Boolean) : [],
      wins: Number(save.wins) || 0,
      losses: Number(save.losses) || 0
    };
  }

  function getSave() {
    return saves.find((save) => save.id === activeId) || null;
  }

  function persistActive() {
    const save = getSave();
    if (!save) return;
    save.updatedAt = Date.now();
    writeSaves(saves.map((item) => (item.id === save.id ? save : item)));
  }

  function jerseyTaken(cats, jerseyName, jerseyNumber, ignoreId) {
    const name = String(jerseyName || "").trim().toUpperCase();
    const num = Number(jerseyNumber);
    return cats.some((cat) => {
      if (ignoreId && cat.id === ignoreId) return false;
      return cat.jerseyName === name || cat.jerseyNumber === num;
    });
  }

  function careBoost(cat) {
    const c = cat.care;
    return (c.affection + c.hunger + c.thirst + c.fun) / 400;
  }

  function powerOf(cat) {
    const s = cat.stats;
    const raw = (s.speed + s.shoot + s.pass + s.dribble + s.stamina) / 5;
    return raw * (0.7 + careBoost(cat) * 0.45) * (0.85 + cat.realism / 400);
  }

  function teamPower(cats) {
    if (!cats.length) return 40;
    return cats.reduce((sum, cat) => sum + powerOf(cat), 0) / cats.length;
  }

  function barHtml(label, value) {
    return (
      '<div class="bar"><span>' + label + "</span><i><b style=\"width:" +
      value + '%\"></b></i><span>' + value + "</span></div>"
    );
  }

  function realismLabel(r) {
    if (r >= 85) return "súper realista";
    if (r >= 60) return "realista";
    if (r >= 35) return "casi real";
    return "cartoon";
  }

  function catCardHtml(cat) {
    return (
      '<div class="cat-card-top">' +
      '<span class="cat-avatar tier-' + realismLabel(cat.realism).replace(/\s+/g, "-") + '" style="--fur:' + escapeHtml(cat.color || "#f9a8d4") + '" aria-hidden="true"></span>' +
      "<div><strong>" + escapeHtml(cat.name) + "</strong>" +
      '<div class="meta">' + escapeHtml(cat.breed) + " · " +
      escapeHtml(cat.jerseyName) + " #" + cat.jerseyNumber +
      (cat.playerTemplate ? " · stats " + escapeHtml(cat.playerTemplate) : "") +
      "</div></div></div>" +
      '<div class="bars">' +
      barHtml("Realismo", cat.realism) +
      '<div class="meta realism-tag">' + realismLabel(cat.realism) + " (" + cat.realism + "%)</div>" +
      barHtml("Cariño", cat.care.affection) +
      barHtml("Comida", cat.care.hunger) +
      barHtml("Sed", cat.care.thirst) +
      barHtml("Juego", cat.care.fun) +
      "</div>"
    );
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
    }[ch]));
  }

  function renderSaves() {
    saves = readSaves();
    const list = document.getElementById("saveList");
    const empty = document.getElementById("emptySaves");
    list.innerHTML = "";
    empty.hidden = saves.length > 0;
    saves
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .forEach((save) => {
        const row = document.createElement("div");
        row.className = "save-row";
        row.innerHTML = "<div><strong></strong><span></span></div><div class=\"save-actions\"></div>";
        row.querySelector("strong").textContent = save.name;
        row.querySelector("span").textContent =
          save.cats.length + " gato" + (save.cats.length === 1 ? "" : "s") +
          " · " + save.wins + "G / " + save.losses + "P";
        const open = document.createElement("button");
        open.type = "button";
        open.className = "btn secondary";
        open.textContent = "Abrir";
        open.addEventListener("click", () => openHub(save.id));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn danger";
        remove.textContent = "Borrar";
        remove.addEventListener("click", () => {
          if (!window.confirm("¿Borrar la partida \"" + save.name + "\"?")) return;
          writeSaves(saves.filter((item) => item.id !== save.id));
          if (activeId === save.id) activeId = null;
          renderSaves();
        });
        row.querySelector(".save-actions").append(open, remove);
        list.appendChild(row);
      });
  }

  function renderCreateCats() {
    const list = document.getElementById("createCatList");
    list.innerHTML = "";
    createCats.forEach((cat, index) => {
      const card = document.createElement("div");
      card.className = "cat-card";
      card.innerHTML = catCardHtml(cat, false);
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn danger";
      del.textContent = "Quitar";
      del.addEventListener("click", () => {
        createCats.splice(index, 1);
        renderCreateCats();
      });
      card.appendChild(del);
      list.appendChild(card);
    });
  }

  function openCreate() {
    createCats = [];
    document.getElementById("saveName").value = "";
    document.getElementById("catName").value = "";
    document.getElementById("catBreed").value = "";
    document.getElementById("jerseyName").value = "";
    document.getElementById("jerseyNumber").value = "";
    document.getElementById("playerStats").value = "";
    document.getElementById("createStatus").textContent = "";
    document.getElementById("createStatus").className = "status";
    renderCreateCats();
    show("screenCreate");
  }

  function addCreateCat() {
    const status = document.getElementById("createStatus");
    const name = document.getElementById("catName").value.trim();
    const breed = document.getElementById("catBreed").value.trim() || "Mestizo";
    const jerseyName = document.getElementById("jerseyName").value.trim().toUpperCase();
    const jerseyNumber = Number(document.getElementById("jerseyNumber").value);
    const playerTemplate = document.getElementById("playerStats").value;

    if (!name) {
      status.textContent = "Poné el nombre del gato.";
      status.className = "status bad";
      return;
    }
    if (!jerseyName) {
      status.textContent = "Poné el nombre de la camiseta.";
      status.className = "status bad";
      return;
    }
    if (!Number.isFinite(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99) {
      status.textContent = "El número de camiseta debe ser entre 1 y 99.";
      status.className = "status bad";
      return;
    }
    if (jerseyTaken(createCats, jerseyName, jerseyNumber)) {
      status.textContent = "Ese nombre o número de camiseta ya está usado.";
      status.className = "status bad";
      return;
    }

    const cat = normalizeCat({
      id: makeId("cat"),
      name: name,
      breed: breed,
      jerseyName: jerseyName,
      jerseyNumber: jerseyNumber,
      playerTemplate: playerTemplate,
      stats: playerTemplate ? Object.assign({}, PLAYER_STATS[playerTemplate]) : baseStats(),
      care: { affection: 50, hunger: 50, thirst: 50, fun: 50 },
      realism: 20
    });
    createCats.push(cat);
    document.getElementById("catName").value = "";
    document.getElementById("jerseyName").value = "";
    document.getElementById("jerseyNumber").value = "";
    document.getElementById("playerStats").value = "";
    status.textContent = cat.name + " entró al plantel.";
    status.className = "status ok";
    renderCreateCats();
  }

  function startSave() {
    const status = document.getElementById("createStatus");
    const name = document.getElementById("saveName").value.trim();
    if (!name) {
      status.textContent = "Poné un nombre para la partida.";
      status.className = "status bad";
      return;
    }
    if (!createCats.length) {
      status.textContent = "Creá al menos un gato.";
      status.className = "status bad";
      return;
    }
    const save = normalizeSave({
      id: makeId("save"),
      name: name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cats: createCats,
      wins: 0,
      losses: 0
    });
    saves = readSaves();
    saves.push(save);
    writeSaves(saves);
    openHub(save.id);
  }

  function openHub(saveId) {
    stopMatch();
    activeId = saveId;
    selectedCatId = null;
    const save = getSave();
    if (!save) {
      renderSaves();
      show("screenSaves");
      return;
    }
    document.getElementById("hubTitle").textContent = save.name;
    document.getElementById("hubHint").textContent =
      save.cats.length + " gato" + (save.cats.length === 1 ? "" : "s") +
      " · " + save.wins + " ganados · " + save.losses + " perdidos";
    document.getElementById("careStatus").textContent = "";
    document.getElementById("hubStatus").textContent = "";
    renderHubCats();
    updateCareButtons();
    show("screenHub");
  }

  function renderHubCats() {
    const save = getSave();
    if (!save) return;
    const list = document.getElementById("hubCatList");
    list.innerHTML = "";
    save.cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-card" + (selectedCatId === cat.id ? " selected" : "");
      btn.innerHTML = catCardHtml(cat, selectedCatId === cat.id);
      btn.addEventListener("click", () => {
        selectedCatId = cat.id;
        document.getElementById("careStatus").textContent = "Elegiste a " + cat.name + ".";
        document.getElementById("careStatus").className = "status ok";
        renderHubCats();
        updateCareButtons();
      });
      list.appendChild(btn);
    });
  }

  function updateCareButtons() {
    document.querySelectorAll("[data-care]").forEach((btn) => {
      btn.disabled = !selectedCatId;
    });
  }

  function applyCare(kind) {
    const save = getSave();
    if (!save || !selectedCatId) return;
    const cat = save.cats.find((item) => item.id === selectedCatId);
    if (!cat) return;
    const messages = {
      pet: " recibió cariño.",
      feed: " comió rico.",
      drink: " tomó agua.",
      play: " jugó un rato."
    };
    if (kind === "pet") cat.care.affection = clamp(cat.care.affection + 18, 0, 100);
    if (kind === "feed") cat.care.hunger = clamp(cat.care.hunger + 22, 0, 100);
    if (kind === "drink") cat.care.thirst = clamp(cat.care.thirst + 22, 0, 100);
    if (kind === "play") cat.care.fun = clamp(cat.care.fun + 20, 0, 100);
    persistActive();
    document.getElementById("careStatus").textContent = cat.name + (messages[kind] || " está feliz.");
    document.getElementById("careStatus").className = "status ok";
    renderHubCats();
  }

  function makeAiCats(count) {
    const names = ["Botón", "Pixel", "Nube", "Rayo", "Sombra", "Mango", "Kiwi", "Turbo", "Chispa", "Luna", "Fuego", "Tigre"];
    const breeds = ["Mestizo", "Siames", "Persa", "Bengalí"];
    const list = [];
    const n = Math.max(1, Math.min(99, Math.round(Number(count) || 1)));
    for (let i = 0; i < n; i += 1) {
      const base = names[i % names.length];
      const jerseyNumber = ((i % 99) + 1);
      list.push(normalizeCat({
        id: makeId("ai"),
        name: base + " IA " + (i + 1),
        breed: breeds[i % breeds.length],
        jerseyName: ("IA" + (i + 1) + base).toUpperCase().slice(0, 16),
        jerseyNumber: jerseyNumber,
        stats: {
          speed: 68 + Math.floor(Math.random() * 18),
          shoot: 68 + Math.floor(Math.random() * 18),
          pass: 68 + Math.floor(Math.random() * 18),
          dribble: 68 + Math.floor(Math.random() * 18),
          stamina: 68 + Math.floor(Math.random() * 18)
        },
        care: { affection: 55, hunger: 55, thirst: 55, fun: 55 },
        realism: 25 + Math.floor(Math.random() * 20)
      }));
    }
    return list;
  }

  function stopMatch() {
    if (matchTimer) {
      clearInterval(matchTimer);
      matchTimer = null;
    }
    match = null;
  }

  function openMatch() {
    const save = getSave();
    if (!save) return;
    if (!save.cats.length) {
      document.getElementById("hubStatus").textContent = "Necesitás al menos un gato.";
      document.getElementById("hubStatus").className = "status bad";
      return;
    }
    stopMatch();
    const you = save.cats.slice();
    const ai = makeAiCats(Math.max(1, you.length));
    match = {
      you: you,
      ai: ai,
      scoreYou: 0,
      scoreAi: 0,
      minute: 0,
      ballX: 0.5,
      ballY: 0.5,
      possession: "you",
      finished: false,
      log: "Listos para el Fuchibol."
    };
    document.getElementById("matchScore").textContent = "0 — 0";
    document.getElementById("matchClock").textContent = "0'";
    document.getElementById("matchLog").textContent = match.log;
    document.getElementById("matchStatus").textContent = "";
    document.getElementById("btnKickOff").hidden = false;
    document.getElementById("btnKickOff").textContent = "Sacar";
    drawPitch();
    show("screenMatch");
  }

  function drawPitch() {
    const canvas = document.getElementById("pitch");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#166534";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = i % 2 ? "#15803d" : "#166534";
      ctx.fillRect((w / 8) * i, 0, w / 8, h);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.beginPath();
    ctx.moveTo(w / 2, 18);
    ctx.lineTo(w / 2, h - 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(18, h / 2 - 70, 70, 140);
    ctx.strokeRect(w - 88, h / 2 - 70, 70, 140);

    if (!match) return;

    function drawRealisticCat(cat, x, y, side, scale) {
      const r = clamp(cat.realism, 0, 100);
      const fur = cat.color || (side === "you" ? "#fda4af" : "#7dd3fc");
      const size = (14 + r / 12) * (scale || 1);

      // cuerpo
      ctx.beginPath();
      ctx.fillStyle = fur;
      if (r < 35) {
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.ellipse(x, y + 2, size * 0.95, size * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // orejas
      if (r >= 25) {
        ctx.fillStyle = fur;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.75, y - size * 0.2);
        ctx.lineTo(x - size * 0.35, y - size * 1.15);
        ctx.lineTo(x - size * 0.05, y - size * 0.35);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + size * 0.75, y - size * 0.2);
        ctx.lineTo(x + size * 0.35, y - size * 1.15);
        ctx.lineTo(x + size * 0.05, y - size * 0.35);
        ctx.fill();
        if (r >= 50) {
          ctx.fillStyle = "#fda4af";
          ctx.beginPath();
          ctx.moveTo(x - size * 0.58, y - size * 0.28);
          ctx.lineTo(x - size * 0.38, y - size * 0.88);
          ctx.lineTo(x - size * 0.2, y - size * 0.35);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x + size * 0.58, y - size * 0.28);
          ctx.lineTo(x + size * 0.38, y - size * 0.88);
          ctx.lineTo(x + size * 0.2, y - size * 0.35);
          ctx.fill();
        }
      }

      // ojos
      if (r >= 35) {
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(x - size * 0.28, y - size * 0.1, r >= 70 ? 2.4 : 2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.28, y - size * 0.1, r >= 70 ? 2.4 : 2, 0, Math.PI * 2);
        ctx.fill();
        if (r >= 70) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x - size * 0.22, y - size * 0.16, 0.9, 0, Math.PI * 2);
          ctx.arc(x + size * 0.34, y - size * 0.16, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // nariz / bigotes
      if (r >= 55) {
        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.18);
        ctx.lineTo(x - 2.5, y + size * 0.32);
        ctx.lineTo(x + 2.5, y + size * 0.32);
        ctx.fill();
      }
      if (r >= 70) {
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1;
        [-1, 1].forEach((sideW) => {
          ctx.beginPath();
          ctx.moveTo(x + sideW * 3, y + size * 0.28);
          ctx.lineTo(x + sideW * size * 0.95, y + size * 0.12);
          ctx.moveTo(x + sideW * 3, y + size * 0.34);
          ctx.lineTo(x + sideW * size * 0.95, y + size * 0.38);
          ctx.stroke();
        });
      }

      // camiseta / número más visibles con realismo
      ctx.fillStyle = r >= 60 ? "#111" : "rgba(17,17,17,0.85)";
      ctx.font = "bold " + (r >= 60 ? "12" : "11") + "px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(String(cat.jerseyNumber), x, y + size * (r >= 35 ? 0.85 : 0.35));

      if (r >= 85) {
        ctx.strokeStyle = "rgba(251,191,36,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawTeam(cats, side) {
      const cols = cats.length > 11 ? 2 : 1;
      const scale = cats.length > 14 ? 0.72 : cats.length > 8 ? 0.85 : 1;
      cats.forEach((cat, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const rows = Math.ceil(cats.length / cols);
        const baseX = side === "you" ? w * 0.18 : w * 0.72;
        const x = baseX + (side === "you" ? col * 36 : -col * 36);
        const y = 36 + ((row + 1) / (rows + 1)) * (h - 72);
        drawRealisticCat(cat, x, y, side, scale);
      });
    }

    drawTeam(match.you, "you");
    drawTeam(match.ai, "ai");

    const bx = 18 + match.ballX * (w - 36);
    const by = 18 + match.ballY * (h - 36);
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function updateMatchUi() {
    if (!match) return;
    document.getElementById("matchScore").textContent = match.scoreYou + " — " + match.scoreAi;
    document.getElementById("matchClock").textContent = match.minute + "'";
    document.getElementById("matchLog").textContent = match.log;
    drawPitch();
  }

  function bumpRealism(cats, amount) {
    cats.forEach((cat) => {
      const before = cat.realism;
      cat.realism = clamp(cat.realism + amount, 0, 100);
      const gained = cat.realism - before;
      Object.keys(cat.stats).forEach((key) => {
        cat.stats[key] = clamp(cat.stats[key] + Math.max(1, Math.floor(gained / 2)), 1, 99);
      });
    });
  }

  function teamRealismSummary(cats) {
    if (!cats.length) return "0%";
    const avg = Math.round(cats.reduce((sum, cat) => sum + cat.realism, 0) / cats.length);
    return avg + "% (" + realismLabel(avg) + ")";
  }

  function finishMatch() {
    const save = getSave();
    if (!save || !match || match.finished) return;
    match.finished = true;
    if (matchTimer) {
      clearInterval(matchTimer);
      matchTimer = null;
    }

    let msg;
    if (match.scoreYou > match.scoreAi) {
      save.wins += 1;
      bumpRealism(save.cats, 15);
      msg = "¡Ganaste! Tus gatos se pusieron más realistas → " + teamRealismSummary(save.cats);
      document.getElementById("matchStatus").className = "status ok";
    } else if (match.scoreYou < match.scoreAi) {
      save.losses += 1;
      bumpRealism(match.ai, 6);
      msg = "Perdiste. La IA se volvió un poco más realista.";
      document.getElementById("matchStatus").className = "status bad";
    } else {
      bumpRealism(save.cats, 6);
      bumpRealism(match.ai, 6);
      msg = "Empate. Tus gatos también ganaron realismo → " + teamRealismSummary(save.cats);
      document.getElementById("matchStatus").className = "status ok";
    }
    match.log = msg;
    document.getElementById("matchStatus").textContent = msg;
    document.getElementById("btnKickOff").hidden = false;
    document.getElementById("btnKickOff").textContent = "Revancha";
    persistActive();
    updateMatchUi();
  }

  function tickMatch() {
    if (!match || match.finished) return;
    match.minute += 1;

    const youP = teamPower(match.you);
    const aiP = teamPower(match.ai);
    const total = youP + aiP;
    const youChance = youP / total;

    if (Math.random() < 0.28) {
      const youAttack = Math.random() < youChance;
      match.possession = youAttack ? "you" : "ai";
      match.ballY = 0.25 + Math.random() * 0.5;
      match.ballX = youAttack ? 0.72 + Math.random() * 0.15 : 0.13 + Math.random() * 0.15;

      if (Math.random() < 0.45) {
        if (youAttack) {
          match.scoreYou += 1;
          const scorer = match.you[Math.floor(Math.random() * match.you.length)];
          match.log = "¡Gol de " + scorer.name + "!";
        } else {
          match.scoreAi += 1;
          const scorer = match.ai[Math.floor(Math.random() * match.ai.length)];
          match.log = "Gol de " + scorer.name + " (IA).";
        }
        match.ballX = 0.5;
        match.ballY = 0.5;
      } else {
        match.log = youAttack
          ? "Ataca " + match.you[0].name + "…"
          : "La IA empuja el ataque…";
      }
    } else {
      match.ballX = clamp(match.ballX + (Math.random() - 0.5) * 0.18, 0.08, 0.92);
      match.ballY = clamp(match.ballY + (Math.random() - 0.5) * 0.22, 0.12, 0.88);
    }

    updateMatchUi();
    if (match.minute >= 90) finishMatch();
  }

  function kickOff() {
    const save = getSave();
    if (!save) return;
    if (match && match.finished) {
      openMatch();
    }
    if (!match || match.finished) return;
    document.getElementById("btnKickOff").hidden = true;
    document.getElementById("matchStatus").textContent = "";
    match.log = "¡Arranca el Fuchibol!";
    updateMatchUi();
    if (matchTimer) clearInterval(matchTimer);
    matchTimer = setInterval(tickMatch, 420);
  }

  document.getElementById("btnOpenSaves").addEventListener("click", () => {
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnNewSave").addEventListener("click", openCreate);
  document.getElementById("btnBackSaves").addEventListener("click", () => {
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnAddCat").addEventListener("click", addCreateCat);
  document.getElementById("btnStartSave").addEventListener("click", startSave);
  document.getElementById("btnHubBack").addEventListener("click", () => {
    stopMatch();
    activeId = null;
    renderSaves();
    show("screenSaves");
  });
  document.querySelectorAll("[data-care]").forEach((btn) => {
    btn.addEventListener("click", () => applyCare(btn.getAttribute("data-care")));
  });
  document.getElementById("btnFootball").addEventListener("click", openMatch);
  document.getElementById("btnBackHubMatch").addEventListener("click", () => openHub(activeId));
  document.getElementById("btnKickOff").addEventListener("click", kickOff);

  saves = readSaves();
})();
