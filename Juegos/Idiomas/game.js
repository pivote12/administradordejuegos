(function () {
  "use strict";

  const STORAGE_KEY = "idiomas-publicados-v1";
  const SHARED_READ_URLS = [
    "/api/idiomas",
    "../../data/idiomas-publicados.json",
    "/data/idiomas-publicados.json",
    "https://raw.githubusercontent.com/pivote12/administradordejuegos/main/data/idiomas-publicados.json"
  ];

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

  let published = loadLocalPublished();
  /** @type {object | null} */
  let activeLang = null;
  let translateLock = false;
  let backFromTranslate = "screenPublicados";
  let syncing = false;

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

  function loadLocalPublished() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveLocalPublished() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(published));
    } catch (_err) {
      /* ignore */
    }
  }

  function mergePublishedLists() {
    const map = new Map();
    Array.from(arguments).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((item) => {
        if (!item || !item.id) return;
        const prev = map.get(item.id);
        if (!prev || Number(item.createdAt || 0) >= Number(prev.createdAt || 0)) {
          map.set(item.id, item);
        }
      });
    });
    return Array.from(map.values()).sort(
      (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)
    );
  }

  async function fetchPublishedList(url) {
    const sep = url.indexOf("?") >= 0 ? "&" : "?";
    const res = await fetch(url + sep + "t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  }

  async function refreshPublishedFromCloud() {
    if (syncing) return published;
    syncing = true;
    const lists = [published.slice()];
    for (let i = 0; i < SHARED_READ_URLS.length; i += 1) {
      try {
        const list = await fetchPublishedList(SHARED_READ_URLS[i]);
        lists.push(list);
      } catch (_err) {
        /* probar siguiente fuente */
      }
    }
    published = mergePublishedLists.apply(null, lists);
    saveLocalPublished();
    syncing = false;
    return published;
  }

  async function publishToCloud(lang) {
    const endpoints = ["/api/idiomas"];
    try {
      endpoints.unshift(new URL("/api/idiomas", window.location.origin).href);
    } catch (_err) {
      /* ignore */
    }
    let lastError = null;
    for (let i = 0; i < endpoints.length; i += 1) {
      try {
        const res = await fetch(endpoints[i], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: lang }),
          cache: "no-store"
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(data.error || "Ya existe un idioma con ese nombre");
        }
        if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
        if (Array.isArray(data.items)) {
          published = mergePublishedLists(data.items, [lang]);
        } else {
          published = mergePublishedLists(published, [lang]);
        }
        saveLocalPublished();
        return { ok: true, shared: true };
      } catch (err) {
        lastError = err;
      }
    }
    published = mergePublishedLists(published, [lang]);
    saveLocalPublished();
    return {
      ok: true,
      shared: false,
      error: lastError ? lastError.message : "Sin servidor compartido"
    };
  }

  async function deleteFromCloud(langId) {
    try {
      const res = await fetch("/api/idiomas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: langId }),
        cache: "no-store"
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.items)) {
        published = data.items;
        saveLocalPublished();
        return true;
      }
    } catch (_err) {
      /* fallback local */
    }
    published = published.filter((item) => item.id !== langId);
    saveLocalPublished();
    return false;
  }

  async function openPublicados() {
    publicadosEmpty.hidden = true;
    publicadosEmpty.textContent = "Cargando idiomas guardados…";
    show("screenPublicados");
    await refreshPublishedFromCloud();
    renderPublicados();
  }

  function parseLanguageText(raw) {
    const entries = [];
    const lines = String(raw || "").split(/\r?\n/);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Formato: Palabra: traduccion /pronunciacion/ (pronunciacion traducido al idioma principal)
      const sepMatch = trimmed.match(/^(.+?)\s*([:=])\s*(.+)$/);
      if (!sepMatch) {
        throw new Error("Renglón " + (index + 1) + ": falta : o =");
      }

      const original = sepMatch[1].trim();
      let rest = sepMatch[3].trim();
      if (!original) throw new Error("Renglón " + (index + 1) + ": falta la palabra original");
      if (!rest) throw new Error("Renglón " + (index + 1) + ": falta la traducción");

      let pronunciationMain = "";
      const mainPronMatch = rest.match(/\(([^)]*)\)\s*$/);
      if (mainPronMatch) {
        pronunciationMain = String(mainPronMatch[1] || "").trim();
        rest = rest.slice(0, mainPronMatch.index).replace(/\s+/g, " ").trim();
      }

      let pronunciation = "";
      const slashMatches = [];
      rest = rest.replace(/\/([^/]*)\//g, (_all, pron) => {
        const clean = String(pron || "").trim();
        if (clean) slashMatches.push(clean);
        return " ";
      });
      pronunciation = slashMatches.join(" · ");

      const translation = rest.replace(/\s+/g, " ").trim();
      if (!translation) {
        throw new Error(
          "Renglón " +
            (index + 1) +
            ": la traducción quedó vacía. Usá: Palabra: traduccion /pronunciacion/ (pronunciacion en el idioma principal)"
        );
      }

      entries.push({
        original,
        translation,
        pronunciation,
        pronunciationMain
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

    // ¡!¿?.,:; se saltan (valen como borde) salvo que estén en una palabra del usuario.
    // El punto va escapado: en una clase [.-:] se interpretaría como rango.
    const SKIP_CLASS = "[\\s¡¿!?\\.,:;]";
    const hasSkipPunct = /[¡¿!?\.,:;]/;
    const keysWithPunct = keys.filter((key) => hasSkipPunct.test(key));
    const keysPlain = keys.filter((key) => !hasSkipPunct.test(key));
    let result = text;

    // Palabras del usuario que ya traen esos signos: match exacto, no se saltan.
    if (keysWithPunct.length) {
      const pattern = new RegExp(
        "(^|" + SKIP_CLASS + ")(" +
          keysWithPunct.map((key) => escapeRegExp(key)).join("|") +
          ")(?=" + SKIP_CLASS + "|$)",
        "gi"
      );
      result = result.replace(pattern, (full, sep, match) => {
        const mapped = map.get(match.toLowerCase());
        if (mapped == null) return full;
        return sep + applyCase(match, mapped);
      });
    }

    // Resto: los signos quedan y no bloquean el match (también sin espacio: hola,mundo).
    if (keysPlain.length) {
      const pattern = new RegExp(
        "(^|" + SKIP_CLASS + ")(" +
          keysPlain.map((key) => escapeRegExp(key)).join("|") +
          ")(?=" + SKIP_CLASS + "|$)",
        "gi"
      );
      result = result.replace(pattern, (full, sep, match) => {
        const mapped = map.get(match.toLowerCase());
        if (mapped == null) return full;
        return sep + applyCase(match, mapped);
      });
    }

    return result;
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
    publicadosEmpty.textContent = "Todavía no hay idiomas guardados. Creá uno desde Idiomas → Crear.";

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
          "<span>Original: " + sourceName(lang.sourceLang) + " · " + lang.entries.length + " palabras · Guardado</span>";

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
        delBtn.addEventListener("click", async () => {
          const ok = window.confirm('¿Borrar el idioma guardado "' + lang.name + '"?');
          if (!ok) return;
          await deleteFromCloud(lang.id);
          renderPublicados();
        });

        actions.appendChild(useBtn);
        actions.appendChild(delBtn);
        row.appendChild(info);
        row.appendChild(actions);
        publicadosList.appendChild(row);
      });
  }

  async function openUsarPicker() {
    await refreshPublishedFromCloud();
    if (!published.length) {
      window.alert("Todavía no hay idiomas guardados. Creá uno primero.");
      show("screenIdiomasMenu");
      return;
    }
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
    openPublicados();
  });
  document.getElementById("btnBackHubFromIdiomas").addEventListener("click", () => show("screenHub"));
  document.getElementById("btnUsar").addEventListener("click", () => {
    openUsarPicker();
  });
  document.getElementById("btnCrear").addEventListener("click", () => {
    resetCreateForm();
    show("screenCreate");
  });
  document.getElementById("btnBackFromCreate").addEventListener("click", () => show("screenIdiomasMenu"));
  document.getElementById("btnBackFromPublicados").addEventListener("click", () => show("screenHub"));
  document.getElementById("btnBackFromTranslate").addEventListener("click", () => {
    activeLang = null;
    if (backFromTranslate === "screenPublicados") {
      openPublicados();
    } else {
      show(backFromTranslate);
    }
  });

  document.getElementById("btnHelp").addEventListener("click", () => {
    helpBox.hidden = !helpBox.hidden;
  });

  document.getElementById("btnPublish").addEventListener("click", async () => {
    createError.hidden = true;
    const name = document.getElementById("langName").value.trim();
    const body = document.getElementById("langBody").value;
    const sourceLang = sourceLangSelect.value;

    if (name.length < 2) {
      createError.hidden = false;
      createError.textContent = "Poné un nombre de idioma (mínimo 2 letras).";
      return;
    }

    await refreshPublishedFromCloud();
    if (published.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      createError.hidden = false;
      createError.textContent = "Ya hay un idioma guardado con ese nombre.";
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

    const btn = document.getElementById("btnPublish");
    btn.disabled = true;
    btn.textContent = "Guardando…";
    let result;
    try {
      result = await publishToCloud(lang);
    } catch (err) {
      createError.hidden = false;
      createError.textContent = err.message || "No se pudo guardar.";
      btn.disabled = false;
      btn.textContent = "Enviar y guardar";
      return;
    }
    btn.disabled = false;
    btn.textContent = "Enviar y guardar";

    await refreshPublishedFromCloud();
    renderPublicados();
    show("screenPublicados");
    if (result.shared) {
      window.alert(
        '"' + name + '" quedó guardado. Cualquiera puede traducir desde ' + sourceName(sourceLang) + "."
      );
    } else {
      window.alert('"' + name + '" quedó guardado en este dispositivo.');
    }
  });

  // Precarga la lista compartida al abrir el juego.
  refreshPublishedFromCloud();

  textOriginal.addEventListener("input", () => {
    if (!activeLang || translateLock) return;
    translateLock = true;
    try {
      const maps = buildMaps(activeLang.entries);
      textCreated.value = translateText(textOriginal.value, maps.toCreated);
    } catch (_err) {
      /* ignore */
    } finally {
      translateLock = false;
    }
  });

  textCreated.addEventListener("input", () => {
    if (!activeLang || translateLock) return;
    translateLock = true;
    try {
      const maps = buildMaps(activeLang.entries);
      textOriginal.value = translateText(textCreated.value, maps.toOriginal);
    } catch (_err) {
      /* ignore */
    } finally {
      translateLock = false;
    }
  });

  document.getElementById("btnClearTranslate").addEventListener("click", () => {
    textOriginal.value = "";
    textCreated.value = "";
  });
})();
