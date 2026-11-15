(function () {
  "use strict";

  const STORAGE_KEY = "idiomas-publicados-v1";

  const SOURCE_LANGS = [
    { id: "es", name: "Español" },
    { id: "en", name: "English" },
    { id: "fr", name: "Français" },
    { id: "de", name: "Deutsch" },
    { id: "pt", name: "Português" },
    { id: "it", name: "Italiano" },
    { id: "ru", name: "Русский" },
    { id: "pl", name: "Polski" },
    { id: "nl", name: "Nederlands" },
    { id: "zh", name: "中文" },
    { id: "ja", name: "日本語" },
    { id: "ko", name: "한국어" },
    { id: "ar", name: "العربية" },
    { id: "tr", name: "Türkçe" },
    { id: "sv", name: "Svenska" },
    { id: "no", name: "Norsk" },
    { id: "da", name: "Dansk" },
    { id: "fi", name: "Suomi" },
    { id: "el", name: "Ελληνικά" },
    { id: "hi", name: "हिन्दी" }
  ];

  let published = loadPublished();
  /** @type {object | null} */
  let activeLang = null;
  let translateLock = false;
  let backFromTranslate = "screenPublicados";

  const sourceLangSelect = document.getElementById("sourceLang");
  const helpBox = document.getElementById("helpBox");
  const createError = document.getElementById("createError");
  const publicadosList = document.getElementById("publicadosList");
  const publicadosEmpty = document.getElementById("publicadosEmpty");
  const textOriginal = document.getElementById("textOriginal");
  const textCreated = document.getElementById("textCreated");

  SOURCE_LANGS.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang.id;
    opt.textContent = lang.name;
    sourceLangSelect.appendChild(opt);
  });
  sourceLangSelect.value = "es";

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function sourceName(id) {
    const found = SOURCE_LANGS.find((item) => item.id === id);
    return found ? found.name : id;
  }

  function loadPublished() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function savePublished() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(published));
    } catch (_err) {
      /* ignore */
    }
  }

  function parseLanguageText(raw) {
    const entries = [];
    const lines = String(raw || "").split(/\r?\n/);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const sepMatch = trimmed.match(/^(.+?)\s*([:=])\s*(.+)$/);
      if (!sepMatch) {
        throw new Error("Renglón " + (index + 1) + ": falta : o =");
      }

      const original = sepMatch[1].trim();
      let rest = sepMatch[3].trim();
      if (!original) throw new Error("Renglón " + (index + 1) + ": falta la palabra original");
      if (!rest) throw new Error("Renglón " + (index + 1) + ": falta la traducción");

      const pronunciations = [];
      rest = rest.replace(/\/([^/]*)\//g, (_all, pron) => {
        const clean = String(pron || "").trim();
        if (clean) pronunciations.push(clean);
        return " ";
      });

      const translation = rest.replace(/\s+/g, " ").trim();
      if (!translation) {
        throw new Error("Renglón " + (index + 1) + ": la traducción quedó vacía");
      }

      entries.push({
        original,
        translation,
        pronunciation: pronunciations.join(" · ")
      });
    });

    if (!entries.length) {
      throw new Error("Agregá al menos una palabra con : o =");
    }
    return entries;
  }

  function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function buildMaps(entries) {
    const toCreated = new Map();
    const toOriginal = new Map();
    entries.forEach((entry) => {
      toCreated.set(entry.original.toLowerCase(), entry.translation);
      toOriginal.set(entry.translation.toLowerCase(), entry.original);
    });
    return { toCreated, toOriginal };
  }

  function applyCase(sample, mapped) {
    if (sample === sample.toUpperCase()) return mapped.toUpperCase();
    if (sample[0] && sample[0] === sample[0].toUpperCase()) {
      return mapped.charAt(0).toUpperCase() + mapped.slice(1);
    }
    return mapped;
  }

  function translateText(text, map) {
    if (!text) return "";
    const keys = Array.from(map.keys()).sort((a, b) => b.length - a.length);
    if (!keys.length) return text;

    // Solo palabras/frases enteras entre espacios (o al borde del texto).
    const pattern = new RegExp(
      "(^|\\s)(" + keys.map((key) => escapeRegExp(key)).join("|") + ")(?=\\s|$)",
      "gi"
    );

    return text.replace(pattern, (full, space, match) => {
      const mapped = map.get(match.toLowerCase());
      if (mapped == null) return full;
      return space + applyCase(match, mapped);
    });
  }

  function openTranslate(lang, backScreen) {
    activeLang = lang;
    backFromTranslate = backScreen || "screenPublicados";
    document.getElementById("translateTitle").textContent = lang.name;
    document.getElementById("translateMeta").textContent =
      sourceName(lang.sourceLang) + " ↔ " + lang.name + " · " + lang.entries.length + " palabras";
    document.getElementById("labelOriginal").textContent = "Idioma original (" + sourceName(lang.sourceLang) + ")";
    document.getElementById("labelCreated").textContent = "Idioma creado (" + lang.name + ")";
    textOriginal.value = "";
    textCreated.value = "";
    show("screenTranslate");
  }

  function renderPublicados() {
    publicadosList.innerHTML = "";
    publicadosEmpty.hidden = published.length > 0;

    published
      .slice()
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      .forEach((lang) => {
        const row = document.createElement("article");
        row.className = "lang-item";

        const info = document.createElement("div");
        info.className = "lang-item-info";
        info.innerHTML =
          "<strong>" + lang.name + "</strong>" +
          "<span>Original: " + sourceName(lang.sourceLang) + " · " + lang.entries.length + " palabras · Publicado</span>";

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.flexWrap = "wrap";

        const useBtn = document.createElement("button");
        useBtn.type = "button";
        useBtn.className = "btn primary";
        useBtn.textContent = "Traducir";
        useBtn.addEventListener("click", () => openTranslate(lang, "screenPublicados"));

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn danger";
        delBtn.textContent = "Borrar";
        delBtn.addEventListener("click", () => {
          const ok = window.confirm('¿Borrar el idioma publicado "' + lang.name + '"?');
          if (!ok) return;
          published = published.filter((item) => item.id !== lang.id);
          savePublished();
          renderPublicados();
        });

        actions.appendChild(useBtn);
        actions.appendChild(delBtn);
        row.appendChild(info);
        row.appendChild(actions);
        publicadosList.appendChild(row);
      });
  }

  function openUsarPicker() {
    if (!published.length) {
      window.alert("Todavía no hay idiomas publicados. Creá uno primero.");
      show("screenIdiomasMenu");
      return;
    }

    // Reutiliza la lista de publicados como selector de uso.
    renderPublicados();
    show("screenPublicados");
  }

  function resetCreateForm() {
    document.getElementById("langName").value = "";
    document.getElementById("langBody").value = "";
    sourceLangSelect.value = "es";
    createError.hidden = true;
    helpBox.hidden = true;
  }

  document.getElementById("btnPlay").addEventListener("click", () => show("screenHub"));
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnIdiomas").addEventListener("click", () => show("screenIdiomasMenu"));
  document.getElementById("btnPublicados").addEventListener("click", () => {
    renderPublicados();
    show("screenPublicados");
  });
  document.getElementById("btnBackHubFromIdiomas").addEventListener("click", () => show("screenHub"));
  document.getElementById("btnUsar").addEventListener("click", openUsarPicker);
  document.getElementById("btnCrear").addEventListener("click", () => {
    resetCreateForm();
    show("screenCreate");
  });
  document.getElementById("btnBackFromCreate").addEventListener("click", () => show("screenIdiomasMenu"));
  document.getElementById("btnBackFromPublicados").addEventListener("click", () => show("screenHub"));
  document.getElementById("btnBackFromTranslate").addEventListener("click", () => {
    activeLang = null;
    if (backFromTranslate === "screenPublicados") {
      renderPublicados();
      show("screenPublicados");
    } else {
      show(backFromTranslate);
    }
  });

  document.getElementById("btnHelp").addEventListener("click", () => {
    helpBox.hidden = !helpBox.hidden;
  });

  document.getElementById("btnPublish").addEventListener("click", () => {
    createError.hidden = true;
    const name = document.getElementById("langName").value.trim();
    const body = document.getElementById("langBody").value;
    const sourceLang = sourceLangSelect.value;

    if (name.length < 2) {
      createError.hidden = false;
      createError.textContent = "Poné un nombre de idioma (mínimo 2 letras).";
      return;
    }

    if (published.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      createError.hidden = false;
      createError.textContent = "Ya hay un idioma publicado con ese nombre.";
      return;
    }

    let entries;
    try {
      entries = parseLanguageText(body);
    } catch (err) {
      createError.hidden = false;
      createError.textContent = err.message || "No se pudo leer el texto.";
      return;
    }

    const lang = {
      id: "lang-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name,
      sourceLang,
      raw: body,
      entries,
      createdAt: Date.now(),
      published: true
    };

    published.unshift(lang);
    savePublished();
    renderPublicados();
    show("screenPublicados");
    window.alert('"' + name + '" quedó publicado. Cualquiera puede traducir desde ' + sourceName(sourceLang) + ".");
  });

  textOriginal.addEventListener("input", () => {
    if (!activeLang || translateLock) return;
    translateLock = true;
    const maps = buildMaps(activeLang.entries);
    textCreated.value = translateText(textOriginal.value, maps.toCreated);
    translateLock = false;
  });

  textCreated.addEventListener("input", () => {
    if (!activeLang || translateLock) return;
    translateLock = true;
    const maps = buildMaps(activeLang.entries);
    textOriginal.value = translateText(textCreated.value, maps.toOriginal);
    translateLock = false;
  });

  document.getElementById("btnClearTranslate").addEventListener("click", () => {
    textOriginal.value = "";
    textCreated.value = "";
  });
})();
