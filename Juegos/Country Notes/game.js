(function () {
  "use strict";

  const STORAGE_KEY = "country-notes-v3";
  const MAP_SIZE = 8192;
  const TILE_SIZE = 128;
  const GREEN = "#228b22";

  const LANGUAGES = [
    "Español", "Inglés", "Francés", "Portugués", "Alemán", "Ruso",
    "Japonés", "Coreano", "Hindi", "Chino", "Polaco", "Árabe",
    "Vietnamita", "Nepali", "Malayo", "Rumano",
  ];

  const CONTINENTS = [
    "África",
    "América del Norte",
    "América del Sur",
    "Antártida",
    "Asia",
    "Europa",
    "Oceanía",
  ];

  GameI18n.init("country-notes");

  const state = {
    countries: [],
    pendingFlag: null,
    world: {
      panX: 40,
      panY: 40,
      zoom: 0.6,
      dragging: false,
      lastPanX: 0,
      lastPanY: 0,
      dragMoved: false,
      lastClickTime: 0,
      lastClickX: 0,
      lastClickY: 0,
    },
  };

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenForm: document.getElementById("screenForm"),
    screenWorld: document.getElementById("screenWorld"),
    screenView: document.getElementById("screenView"),
    cityNamesBlock: document.getElementById("cityNamesBlock"),
    milNamesBlock: document.getElementById("milNamesBlock"),
    flagHint: document.getElementById("flagHint"),
    flagPreview: document.getElementById("flagPreview"),
    mapViewport: document.getElementById("mapViewport"),
    worldCanvas: document.getElementById("worldCanvas"),
    worldTitle: document.getElementById("worldTitle"),
    mapHint: document.getElementById("mapHint"),
    viewBody: document.getElementById("viewBody"),
    viewTitle: document.getElementById("viewTitle"),
  };

  function isPngFile(file) {
    if (!file) return false;
    const name = file.name.toLowerCase();
    return file.type === "image/png" || name.endsWith(".png");
  }

  function updateFlagPreview(dataUrl) {
    if (dataUrl) {
      ui.flagPreview.src = dataUrl;
      ui.flagPreview.hidden = false;
      ui.flagHint.hidden = false;
    } else {
      ui.flagPreview.removeAttribute("src");
      ui.flagPreview.hidden = true;
      ui.flagHint.hidden = true;
    }
  }

  function readFlagFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 512;
          let w = img.width;
          let h = img.height;
          if (w > max || h > max) {
            if (w >= h) {
              h = Math.round((h * max) / w);
              w = max;
            } else {
              w = Math.round((w * max) / h);
              h = max;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("No se pudo leer la imagen PNG."));
        img.src = reader.result;
      };
      reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });
  }

  function escapeHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function normalizeCountry(data) {
    return {
      id: data.id || `cn-${Date.now()}`,
      nombre: String(data.nombre || "").slice(0, 64),
      idiomaPrincipal: data.idiomaPrincipal || LANGUAGES[0],
      idiomaSecundario: data.idiomaSecundario || LANGUAGES[1],
      capital: String(data.capital || "").slice(0, 48),
      ciudades: Array.isArray(data.ciudades) ? data.ciudades.map(String) : [],
      gobierno: {
        nombre: String(data.gobierno?.nombre || "").slice(0, 32),
        apellido: String(data.gobierno?.apellido || "").slice(0, 32),
      },
      militares: Array.isArray(data.militares) ? data.militares.map(String) : [],
      flagDataUrl: data.flagDataUrl || null,
      continente: CONTINENTS.includes(data.continente) ? data.continente : "",
      mapX: Number.isFinite(data.mapX) ? data.mapX : null,
      mapY: Number.isFinite(data.mapY) ? data.mapY : null,
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ countries: state.countries }));
      return true;
    } catch {
      alert(GameI18n.t("alertSaveError"));
      return false;
    }
  }

  function migrateOldTerritories(data) {
    const territories = data.territories || {};
    state.countries.forEach((country) => {
      if (country.mapX != null) return;
      const pixels = territories[country.id];
      if (!pixels?.length) return;
      let minX = MAP_SIZE;
      let minY = MAP_SIZE;
      pixels.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
      });
      country.mapX = Math.floor(minX / TILE_SIZE) * TILE_SIZE;
      country.mapY = Math.floor(minY / TILE_SIZE) * TILE_SIZE;
    });
  }

  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) raw = localStorage.getItem("country-notes-v2") || localStorage.getItem("country-notes-v1");
      if (!raw) return;
      const data = JSON.parse(raw);
      state.countries = (data.countries || []).map(normalizeCountry);
      migrateOldTerritories(data);
    } catch {
      state.countries = [];
    }
  }

  function occupiedTiles() {
    const set = new Set();
    state.countries.forEach((country) => {
      if (country.mapX == null || country.mapY == null) return;
      set.add(`${country.mapX},${country.mapY}`);
    });
    return set;
  }

  function findFreeTile() {
    const used = occupiedTiles();
    for (let y = 0; y <= MAP_SIZE - TILE_SIZE; y += TILE_SIZE) {
      for (let x = 0; x <= MAP_SIZE - TILE_SIZE; x += TILE_SIZE) {
        if (!used.has(`${x},${y}`)) return { x, y };
      }
    }
    return null;
  }

  function loadFlagCanvas(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error("bandera"));
      img.src = dataUrl;
    });
  }

  function assignMissingTiles() {
    let changed = false;
    state.countries.forEach((country) => {
      if (country.mapX != null && country.mapY != null) return;
      const slot = findFreeTile();
      if (!slot) return;
      country.mapX = slot.x;
      country.mapY = slot.y;
      changed = true;
    });
    if (changed) save();
  }

  function countryColor(country) {
    let hash = 0;
    const key = country.id || country.nombre || "x";
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    const hue = hash % 360;
    return `hsl(${hue} 70% 45%)`;
  }

  async function preloadFlags() {
    await Promise.all(state.countries.map(async (country) => {
      if (!country.flagDataUrl || country.mapX == null) return;
      try {
        country._flagCanvas = await loadFlagCanvas(country.flagDataUrl);
      } catch {
        country._flagCanvas = null;
      }
    }));
    if (ui.screenWorld.classList.contains("active")) renderWorld();
  }

  function fitWorldToCountries() {
    const placed = state.countries.filter((c) => c.mapX != null && c.mapY != null);
    if (!placed.length) {
      state.world.zoom = 0.6;
      state.world.panX = 40;
      state.world.panY = 40;
      return;
    }

    let minX = MAP_SIZE;
    let minY = MAP_SIZE;
    let maxX = 0;
    let maxY = 0;
    placed.forEach((country) => {
      minX = Math.min(minX, country.mapX);
      minY = Math.min(minY, country.mapY);
      maxX = Math.max(maxX, country.mapX + TILE_SIZE);
      maxY = Math.max(maxY, country.mapY + TILE_SIZE);
    });

    const pad = TILE_SIZE * 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(MAP_SIZE, maxX + pad);
    maxY = Math.min(MAP_SIZE, maxY + pad);

    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const canvas = ui.worldCanvas;
    const zoomX = canvas.width / worldW;
    const zoomY = canvas.height / worldH;
    const zoom = Math.min(4, Math.max(0.15, Math.min(zoomX, zoomY) * 0.9));

    state.world.zoom = zoom;
    state.world.panX = (canvas.width - worldW * zoom) / 2 - minX * zoom;
    state.world.panY = (canvas.height - worldH * zoom) / 2 - minY * zoom;
  }

  function drawCountries(ctx) {
    const { zoom } = state.world;
    state.countries.forEach((country) => {
      if (country.mapX == null || country.mapY == null) return;

      if (country._flagCanvas) {
        ctx.drawImage(country._flagCanvas, country.mapX, country.mapY, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = countryColor(country);
        ctx.fillRect(country.mapX, country.mapY, TILE_SIZE, TILE_SIZE);
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = Math.max(1, 2 / zoom);
      ctx.strokeRect(country.mapX + 0.5, country.mapY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    });
  }

  function showScreen(name) {
    const map = {
      title: ui.screenTitle,
      form: ui.screenForm,
      world: ui.screenWorld,
      view: ui.screenView,
    };
    Object.entries(map).forEach(([k, el]) => el?.classList.toggle("active", k === name));
    if (name === "world") {
      resizeWorldCanvas();
      fitWorldToCountries();
      renderWorld();
    }
  }

  function fillLangSelects() {
    ["selectLang1", "selectLang2"].forEach((id) => {
      const sel = document.getElementById(id);
      sel.innerHTML = "";
      LANGUAGES.forEach((lang) => {
        const opt = document.createElement("option");
        opt.value = lang;
        opt.textContent = lang;
        sel.appendChild(opt);
      });
    });
  }

  function fillContinentSelect() {
    const sel = document.getElementById("selectContinente");
    sel.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = GameI18n.t("pickContinent");
    sel.appendChild(placeholder);
    CONTINENTS.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  }

  function buildDynamicNames(block, count, prefixKey, values) {
    const prefix = GameI18n.t(prefixKey);
    block.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const label = document.createElement("label");
      label.className = "field";
      label.innerHTML = `<span>${prefix} ${i + 1}</span><input type="text" data-idx="${i}" maxlength="48" value="${escapeHtml(values[i] || "")}" />`;
      block.appendChild(label);
    }
  }

  function readDynamicNames(block) {
    return [...block.querySelectorAll("input")].map((inp) => inp.value.trim());
  }

  function resizeWorldCanvas() {
    const rect = ui.mapViewport.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    ui.worldCanvas.width = w;
    ui.worldCanvas.height = h;
    ui.worldCanvas.style.width = `${w}px`;
    ui.worldCanvas.style.height = `${h}px`;
  }

  function renderWorld() {
    const canvas = ui.worldCanvas;
    const ctx = canvas.getContext("2d");
    const { panX, panY, zoom } = state.world;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#061018";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(zoom, 0, 0, zoom, panX, panY);
    ctx.fillStyle = GREEN;
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
    drawCountries(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function screenToWorld(clientX, clientY) {
    const rect = ui.worldCanvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const { panX, panY, zoom } = state.world;
    return { x: (sx - panX) / zoom, y: (sy - panY) / zoom };
  }

  function countryAt(worldX, worldY) {
    const x = Math.floor(worldX);
    const y = Math.floor(worldY);
    return state.countries.find((country) => {
      if (country.mapX == null || country.mapY == null) return false;
      return x >= country.mapX
        && x < country.mapX + TILE_SIZE
        && y >= country.mapY
        && y < country.mapY + TILE_SIZE;
    }) || null;
  }

  function showCountryView(country) {
    const cities = country.ciudades.length
      ? `<ul>${country.ciudades.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`
      : "<p class=\"muted\">—</p>";
    const mil = country.militares.length
      ? `<ul>${country.militares.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`
      : "<p class=\"muted\">—</p>";
    const continenteLabel = country.continente
      ? escapeHtml(country.continente)
      : "<span class=\"muted\">—</span>";

    ui.viewTitle.textContent = country.nombre;
    ui.viewBody.innerHTML = `
      <p><strong>${GameI18n.t("viewContinent")}:</strong> ${continenteLabel}</p>
      <p><strong>${GameI18n.t("mainLang")}:</strong> ${escapeHtml(country.idiomaPrincipal)}</p>
      <p><strong>${GameI18n.t("secLang")}:</strong> ${escapeHtml(country.idiomaSecundario)}</p>
      <p><strong>${GameI18n.t("viewCapital")}:</strong> ${escapeHtml(country.capital)}</p>
      <p><strong>${GameI18n.t("viewCities")} (${country.ciudades.length}):</strong></p>${cities}
      <p><strong>${GameI18n.t("government")}:</strong> ${escapeHtml(country.gobierno.nombre)} ${escapeHtml(country.gobierno.apellido)}</p>
      <p><strong>${GameI18n.t("viewMilitary")} (${country.militares.length}):</strong></p>${mil}
      <p><strong>${GameI18n.t("viewTerritory")}:</strong> ${TILE_SIZE}×${TILE_SIZE} (${country.mapX}, ${country.mapY})</p>
      ${country.flagDataUrl ? `<p><strong>${GameI18n.t("viewFlag")}:</strong></p><img src="${country.flagDataUrl}" alt="${GameI18n.t("viewFlag")}" class="flag-preview" />` : ""}
    `;
    showScreen("view");
  }

  function openCreateForm() {
    state.pendingFlag = null;
    document.getElementById("inputNombre").value = "";
    document.getElementById("selectContinente").value = "";
    document.getElementById("selectLang1").value = LANGUAGES[0];
    document.getElementById("selectLang2").value = LANGUAGES[1];
    document.getElementById("inputCapital").value = "";
    document.getElementById("inputCityCount").value = "0";
    document.getElementById("inputGovNombre").value = "";
    document.getElementById("inputGovApellido").value = "";
    document.getElementById("inputMilCount").value = "0";
    document.getElementById("inputFlag").value = "";
    updateFlagPreview(null);
    buildDynamicNames(ui.cityNamesBlock, 0, "city", []);
    buildDynamicNames(ui.milNamesBlock, 0, "military", []);
    showScreen("form");
  }

  async function saveCountry() {
    const nombre = document.getElementById("inputNombre").value.trim();
    if (!nombre) {
      alert(GameI18n.t("alertName"));
      return;
    }
    const cityCount = Math.max(0, Math.min(50, Number(document.getElementById("inputCityCount").value) || 0));
    const milCount = Math.max(0, Math.min(50, Number(document.getElementById("inputMilCount").value) || 0));
    const ciudades = readDynamicNames(ui.cityNamesBlock).slice(0, cityCount);
    const militares = readDynamicNames(ui.milNamesBlock).slice(0, milCount);

    if (ciudades.length < cityCount || ciudades.some((n) => !n)) {
      alert(GameI18n.t("alertCity"));
      return;
    }
    if (militares.length < milCount || militares.some((n) => !n)) {
      alert(GameI18n.t("alertMil"));
      return;
    }
    if (!state.pendingFlag) {
      alert(GameI18n.t("alertFlag"));
      return;
    }

    const continente = document.getElementById("selectContinente").value;
    if (!continente) {
      alert(GameI18n.t("alertContinent"));
      return;
    }

    const slot = findFreeTile();
    if (!slot) {
      alert(GameI18n.t("alertNoSpace"));
      return;
    }

    const payload = normalizeCountry({
      nombre,
      idiomaPrincipal: document.getElementById("selectLang1").value,
      idiomaSecundario: document.getElementById("selectLang2").value,
      capital: document.getElementById("inputCapital").value.trim(),
      ciudades,
      gobierno: {
        nombre: document.getElementById("inputGovNombre").value.trim(),
        apellido: document.getElementById("inputGovApellido").value.trim(),
      },
      militares,
      continente,
      flagDataUrl: state.pendingFlag,
      mapX: slot.x,
      mapY: slot.y,
    });

    state.countries.push(payload);
    if (!save()) {
      state.countries.pop();
      return;
    }

    try {
      payload._flagCanvas = await loadFlagCanvas(payload.flagDataUrl);
      showScreen("world");
    } catch {
      alert("El país se guardó, pero no se pudo cargar la bandera en el mapa.");
      showScreen("title");
    }
  }

  function openWorld() {
    ui.worldTitle.textContent = GameI18n.t("world");
    ui.mapHint.textContent = GameI18n.t("worldHint");
    showScreen("world");
  }

  function handleMapClick(clientX, clientY) {
    const now = Date.now();
    const { x, y } = screenToWorld(clientX, clientY);
    const isDouble = now - state.world.lastClickTime < 350
      && Math.abs(x - state.world.lastClickX) < 8 / state.world.zoom
      && Math.abs(y - state.world.lastClickY) < 8 / state.world.zoom;

    state.world.lastClickTime = now;
    state.world.lastClickX = x;
    state.world.lastClickY = y;

    if (!isDouble) return;
    const country = countryAt(x, y);
    if (country) showCountryView(country);
  }

  function bindWorldEvents() {
    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      state.world.dragging = true;
      state.world.dragMoved = false;
      state.world.lastPanX = e.clientX;
      state.world.lastPanY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!state.world.dragging) return;
      const dx = e.clientX - state.world.lastPanX;
      const dy = e.clientY - state.world.lastPanY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) state.world.dragMoved = true;
      state.world.lastPanX = e.clientX;
      state.world.lastPanY = e.clientY;
      state.world.panX += dx;
      state.world.panY += dy;
      renderWorld();
    };

    const onPointerUp = (e) => {
      if (state.world.dragging && !state.world.dragMoved) {
        handleMapClick(e.clientX, e.clientY);
      }
      state.world.dragging = false;
    };

    ui.mapViewport.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    ui.mapViewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = ui.worldCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.min(4, Math.max(0.02, state.world.zoom * factor));
      state.world.panX = mx - ((mx - state.world.panX) * newZoom) / state.world.zoom;
      state.world.panY = my - ((my - state.world.panY) * newZoom) / state.world.zoom;
      state.world.zoom = newZoom;
      renderWorld();
    }, { passive: false });

    window.addEventListener("resize", () => {
      if (ui.screenWorld.classList.contains("active")) {
        resizeWorldCanvas();
        renderWorld();
      }
    });
  }

  function bindEvents() {
    document.getElementById("btnCrear").addEventListener("click", openCreateForm);
    document.getElementById("btnMundo").addEventListener("click", openWorld);
    document.getElementById("btnBackFromWorld").addEventListener("click", () => showScreen("title"));
    document.getElementById("btnBackFromView").addEventListener("click", () => showScreen("world"));
    document.getElementById("btnCancelForm").addEventListener("click", () => showScreen("title"));
    document.getElementById("btnSaveCountry").addEventListener("click", saveCountry);

    document.getElementById("inputCityCount").addEventListener("input", (e) => {
      const n = Math.max(0, Math.min(50, Number(e.target.value) || 0));
      buildDynamicNames(ui.cityNamesBlock, n, "city", readDynamicNames(ui.cityNamesBlock));
    });
    document.getElementById("inputMilCount").addEventListener("input", (e) => {
      const n = Math.max(0, Math.min(50, Number(e.target.value) || 0));
      buildDynamicNames(ui.milNamesBlock, n, "military", readDynamicNames(ui.milNamesBlock));
    });

    document.getElementById("inputFlag").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!isPngFile(file)) {
        alert(GameI18n.t("alertFlagPng"));
        e.target.value = "";
        return;
      }
      try {
        state.pendingFlag = await readFlagFile(file);
        updateFlagPreview(state.pendingFlag);
      } catch {
        alert(GameI18n.t("alertFlagLoad"));
        e.target.value = "";
        state.pendingFlag = null;
        updateFlagPreview(null);
      }
    });

    if (/\/Juegos\//i.test(decodeURIComponent(location.pathname))) {
      document.getElementById("btnBackAdmin").hidden = false;
    }

    bindWorldEvents();
  }

  function boot() {
    load();
    assignMissingTiles();
    fillLangSelects();
    fillContinentSelect();
    bindEvents();
    preloadFlags();
    GameI18n.onChange(() => {
      GameI18n.applyDom();
      fillContinentSelect();
      ui.worldTitle.textContent = GameI18n.t("world");
      if (ui.screenWorld.classList.contains("active")) {
        ui.mapHint.textContent = GameI18n.t("worldHint");
      }
    });
  }

  boot();
})();
