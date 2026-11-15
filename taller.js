(function () {
  "use strict";

  const SAVE_KEY = "marble-escape-saves-v2";
  const SAVE_BAK = "marble-escape-saves-v2-bak";
  const BEDS_KEY = "platafacido-beds-v1";
  const tipo = new URLSearchParams(location.search).get("tipo") || "cara";
  const titles = {
    cara: ["Caras", "Las caras que ya dibujaste siguen guardadas."],
    comida: ["Comidas", "Solo se listan las comidas que creaste vos."],
    bebida: ["Bebidas", "Solo se listan las bebidas que creaste vos."],
    cama: ["Camas", "Elegí un pack, una pelotita, pintá la sábana y después la almohada."]
  };

  const title = document.getElementById("tallerTitle");
  const hint = document.getElementById("tallerHint");
  const listPanel = document.getElementById("listPanel");
  const bedPanel = document.getElementById("bedPanel");
  const itemList = document.getElementById("itemList");
  const emptyNote = document.getElementById("emptyNote");
  const btnCreate = document.getElementById("btnCreate");
  title.textContent = (titles[tipo] || titles.cara)[0];
  hint.textContent = (titles[tipo] || titles.cara)[1];

  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_BAK);
      return raw ? JSON.parse(raw) : { saves: [], faces: [], foods: [] };
    } catch (_err) {
      return { saves: [], faces: [], foods: [] };
    }
  }

  function writeSave(data) {
    const json = JSON.stringify(data);
    localStorage.setItem(SAVE_KEY, json);
    try { localStorage.setItem(SAVE_BAK, json); } catch (_err) { /* copia */ }
  }

  function readBeds() {
    try {
      const data = JSON.parse(localStorage.getItem(BEDS_KEY) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch (_err) {
      return {};
    }
  }

  function writeBeds(data) {
    localStorage.setItem(BEDS_KEY, JSON.stringify(data));
  }

  function card(image, name, detail, onRemove) {
    const wrap = document.createElement("article");
    wrap.className = "taller-card";
    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = name;
      wrap.appendChild(img);
    }
    const strong = document.createElement("strong");
    strong.textContent = name;
    const span = document.createElement("span");
    span.textContent = detail || "";
    wrap.append(strong, span);
    if (onRemove) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn ghost";
      remove.textContent = "Borrar";
      remove.addEventListener("click", onRemove);
      wrap.appendChild(remove);
    }
    return wrap;
  }

  function renderList() {
    const data = readSave();
    itemList.innerHTML = "";
    let items = [];
    if (tipo === "cara") {
      items = (data.faces || []).map((face) => ({
        image: face.frames && face.frames[0],
        name: face.name || "Cara",
        detail: ((face.frames && face.frames.length) || 0) + " frames",
        remove: () => {
          data.faces = (data.faces || []).filter((item) => item.id !== face.id);
          writeSave(data);
          renderList();
        }
      }));
      btnCreate.onclick = () => {
        location.href = "Juegos/Marble%20Escape/index.html?taller=cara";
      };
    } else if (tipo === "comida" || tipo === "bebida") {
      const kind = tipo === "bebida" ? "drink" : "food";
      items = (data.foods || []).filter((food) => (food.kind === "drink" ? "drink" : "food") === kind && !food.ai).map((food) => ({
        image: (food.frames && food.frames[0]) || food.drop,
        name: food.name || (kind === "drink" ? "Bebida" : "Comida"),
        detail: kind === "drink" ? "Bebida" : "Comida",
        remove: () => {
          data.foods = (data.foods || []).filter((item) => item.id !== food.id);
          writeSave(data);
          renderList();
        }
      }));
      btnCreate.onclick = () => {
        location.href = "Juegos/Marble%20Escape/index.html?taller=" + (kind === "drink" ? "bebida" : "comida");
      };
    }
    emptyNote.hidden = items.length > 0;
    items.forEach((item) => itemList.appendChild(card(item.image, item.name, item.detail, item.remove)));
  }

  if (tipo === "cama") {
    listPanel.hidden = true;
    bedPanel.hidden = false;
    setupBeds();
  } else {
    renderList();
  }

  function setupBeds() {
    const packsEl = document.getElementById("bedPacks");
    const marblesEl = document.getElementById("bedMarbles");
    const paint = document.getElementById("bedPaint");
    const canvas = document.getElementById("bedCanvas");
    const ctx = canvas.getContext("2d");
    const stepLabel = document.getElementById("paintStep");
    const next = document.getElementById("btnBedNext");
    const finish = document.getElementById("btnBedFinish");
    const color = document.getElementById("bedColor");
    let marble = null;
    let step = "sheet";
    let sheet = "";
    let drawing = false;

    function blank(fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function packs() {
      try {
        return window.SharedPacks ? SharedPacks.load() : [];
      } catch (_err) {
        return [];
      }
    }

    function showPacks() {
      packsEl.innerHTML = "";
      marblesEl.innerHTML = "";
      paint.hidden = true;
      const list = packs();
      if (!list.length) {
        packsEl.textContent = "No hay packs. Creá uno en Packs.";
        return;
      }
      list.forEach((pack) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "taller-card";
        btn.textContent = pack.name || "Pack";
        btn.addEventListener("click", () => showMarbles(pack));
        packsEl.appendChild(btn);
      });
    }

    function showMarbles(pack) {
      marblesEl.innerHTML = "";
      paint.hidden = true;
      (pack.marbles || []).forEach((item) => {
        if (!item || !item.name) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "taller-card";
        const dot = document.createElement("span");
        dot.textContent = "● " + item.name;
        dot.style.color = item.color || "#fff";
        btn.appendChild(dot);
        btn.addEventListener("click", () => beginPaint(pack, item));
        marblesEl.appendChild(btn);
      });
    }

    function beginPaint(pack, item) {
      marble = {
        id: String(item.id || pack.id + "-" + item.name),
        name: String(item.name),
        color: item.color || "#38bdf8",
        packId: String(pack.id || "")
      };
      step = "sheet";
      sheet = "";
      paint.hidden = false;
      stepLabel.textContent = "Sábana de " + marble.name;
      next.hidden = false;
      finish.hidden = true;
      blank(marble.color);
    }

    canvas.addEventListener("pointerdown", (event) => {
      drawing = true;
      paintAt(event);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (drawing) paintAt(event);
    });
    window.addEventListener("pointerup", () => {
      drawing = false;
    });

    function paintAt(event) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      ctx.fillStyle = color.value;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    next.addEventListener("click", () => {
      sheet = canvas.toDataURL("image/png");
      step = "pillow";
      stepLabel.textContent = "Almohada de " + (marble ? marble.name : "");
      next.hidden = true;
      finish.hidden = false;
      blank("#f8fafc");
    });

    finish.addEventListener("click", () => {
      if (!marble || !sheet) return;
      const beds = readBeds();
      beds[marble.id] = {
        id: marble.id,
        name: marble.name,
        color: marble.color,
        packId: marble.packId,
        sheet,
        pillow: canvas.toDataURL("image/png")
      };
      writeBeds(beds);
      stepLabel.textContent = "Listo. " + marble.name + " ya tiene cama.";
      finish.hidden = true;
    });

    showPacks();
  }
})();
