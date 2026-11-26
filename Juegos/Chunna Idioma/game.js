(function () {
  "use strict";

  const LANGS = [
    { id: "es", name: "Español" },
    { id: "en", name: "Inglés" },
    { id: "fr", name: "Francés" },
    { id: "de", name: "Alemán" },
    { id: "pt", name: "Portugués" },
    { id: "it", name: "Italiano" },
    { id: "ru", name: "Ruso" },
    { id: "pl", name: "Polaco" },
    { id: "nl", name: "Neerlandés" },
    { id: "zh", name: "Chino" },
    { id: "ja", name: "Japonés" },
    { id: "ko", name: "Coreano" },
    { id: "ar", name: "Árabe" },
    { id: "hi", name: "Hindi" },
    { id: "tr", name: "Turco" },
    { id: "sv", name: "Sueco" },
    { id: "no", name: "Noruego" },
    { id: "da", name: "Danés" },
    { id: "fi", name: "Finés" },
    { id: "el", name: "Griego" },
    { id: "he", name: "Hebreo" },
    { id: "th", name: "Tailandés" },
    { id: "vi", name: "Vietnamita" },
    { id: "id", name: "Indonesio" },
    { id: "ms", name: "Malayo" },
    { id: "uk", name: "Ucraniano" },
    { id: "cs", name: "Checo" },
    { id: "ro", name: "Rumano" },
    { id: "hu", name: "Húngaro" },
    { id: "ca", name: "Catalán" },
    { id: "sw", name: "Suajili" },
    { id: "ga", name: "Irlandés" }
  ];

  const SKIP_PUNCT = /[¿?¡!,.;:]/;

  /** @type {{alphabet:string,letters:Array,entries:Array}|null} */
  let dict = null;
  let lock = false;
  let lastHits = [];

  const langSelect = document.getElementById("langSelect");
  const textSource = document.getElementById("textSource");
  const textChunna = document.getElementById("textChunna");
  const labelSource = document.getElementById("labelSource");
  const btnSpeak = document.getElementById("btnSpeak");
  const speakList = document.getElementById("speakList");
  const missingWords = document.getElementById("missingWords");
  const alphabetText = document.getElementById("alphabetText");
  const letterList = document.getElementById("letterList");

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function fold(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC");
  }

  function currentLang() {
    return langSelect.value || "es";
  }

  function buildMaps(lang) {
    const toChunna = new Map();
    const toSource = new Map();
    (dict.entries || []).forEach((entry) => {
      const local = entry.words && entry.words[lang];
      const spanish = entry.words && entry.words.es;
      if (local) {
        toChunna.set(fold(local), entry);
        toSource.set(entry.chunna, { word: local, entry: entry });
      }
      if (spanish) {
        toChunna.set(fold(spanish), entry);
      }
      if (!toSource.has(entry.chunna)) {
        toSource.set(entry.chunna, {
          word: local || spanish || entry.chunna,
          entry: entry
        });
      }
    });
    return { toChunna, toSource };
  }

  // Conserva espacios y signos ¿?¡!,.;: sin traducirlos.
  function splitKeeping(text) {
    return String(text || "").split(/(\s+|[¿?¡!,.;:]+)/);
  }

  function translateSourceToChunna(text, lang) {
    const { toChunna } = buildMaps(lang);
    const hits = [];
    const missing = [];
    const parts = splitKeeping(text);
    const out = parts.map((part) => {
      if (!part) return part;
      if (/^\s+$/.test(part) || SKIP_PUNCT.test(part[0])) return part;
      const entry = toChunna.get(fold(part));
      if (!entry) {
        missing.push(part);
        return part;
      }
      hits.push(entry);
      return entry.chunna;
    });
    return { text: out.join(""), hits: hits, missing: missing };
  }

  function translateChunnaToSource(text, lang) {
    const { toSource } = buildMaps(lang);
    const keys = Array.from(toSource.keys()).sort((a, b) => b.length - a.length);
    const hits = [];
    if (!keys.length) return { text: text, hits: hits };

    let i = 0;
    let result = "";
    const src = String(text || "");
    while (i < src.length) {
      const ch = src[i];
      if (/\s/.test(ch) || SKIP_PUNCT.test(ch)) {
        result += ch;
        i += 1;
        continue;
      }
      let matched = null;
      for (let k = 0; k < keys.length; k += 1) {
        const key = keys[k];
        if (src.slice(i, i + key.length) === key) {
          matched = key;
          break;
        }
      }
      if (matched) {
        const found = toSource.get(matched);
        hits.push(found.entry);
        result += found.word;
        i += matched.length;
      } else {
        result += ch;
        i += 1;
      }
    }
    return { text: result, hits: hits };
  }

  function renderMissing(missing) {
    if (!missingWords) return;
    const unique = [];
    const seen = new Set();
    (missing || []).forEach((word) => {
      const key = fold(word);
      if (!key || seen.has(key)) return;
      seen.add(key);
      unique.push(word);
    });
    if (!unique.length) {
      missingWords.hidden = true;
      missingWords.textContent = "";
      return;
    }
    missingWords.hidden = false;
    missingWords.textContent =
      "Todavía no hechas en Chunna: " +
      unique.join(", ") +
      ". Si una palabra sigue en español, es que no se hizo aún.";
  }

  function syncFromSource() {
    if (!dict || lock) return;
    lock = true;
    try {
      const result = translateSourceToChunna(textSource.value, currentLang());
      textChunna.value = result.text;
      lastHits = result.hits;
      btnSpeak.disabled = lastHits.length === 0;
      renderSpeakPreview();
      renderMissing(result.missing);
    } finally {
      lock = false;
    }
  }

  function syncFromChunna() {
    if (!dict || lock) return;
    lock = true;
    try {
      const result = translateChunnaToSource(textChunna.value, currentLang());
      textSource.value = result.text;
      lastHits = result.hits;
      btnSpeak.disabled = lastHits.length === 0;
      renderSpeakPreview();
      renderMissing([]);
    } finally {
      lock = false;
    }
  }

  function renderSpeakPreview() {
    if (!lastHits.length) {
      speakList.hidden = true;
      speakList.innerHTML = "";
      return;
    }
    speakList.hidden = false;
    speakList.innerHTML = "";
    lastHits.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "speak-item";
      row.id = "speak-item-" + index;
      row.innerHTML =
        "<strong class='mono'>" + entry.chunna + "</strong> " +
        "<span class='mono'>/" + entry.ipa + "/</span> " +
        "<span>(" + entry.help + ")</span>";
      speakList.appendChild(row);
    });
  }

  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.querySelectorAll(".speak-item.active").forEach((el) => el.classList.remove("active"));
  }

  function roboticVoice() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    return (
      voices.find((v) => /es(-|_)AR/i.test(v.lang)) ||
      voices.find((v) => /^es/i.test(v.lang)) ||
      voices.find((v) => /Spanish/i.test(v.name)) ||
      voices[0] ||
      null
    );
  }

  function speakHits() {
    if (!lastHits.length || !window.speechSynthesis) return;
    stopSpeak();
    let i = 0;

    function next() {
      if (i >= lastHits.length) return;
      const entry = lastHits[i];
      document.querySelectorAll(".speak-item.active").forEach((el) => el.classList.remove("active"));
      const row = document.getElementById("speak-item-" + i);
      if (row) row.classList.add("active");

      // Lee la /pronunciación/ usando la guía en ( ), que es la misma en español.
      const utter = new SpeechSynthesisUtterance(entry.help || entry.ipa);
      const voice = roboticVoice();
      if (voice) utter.voice = voice;
      utter.lang = (voice && voice.lang) || "es-ES";
      utter.rate = 0.72;
      utter.pitch = 0.5;
      utter.onend = () => {
        i += 1;
        window.setTimeout(next, 220);
      };
      window.speechSynthesis.speak(utter);
    }

    next();
  }

  function fillLangs() {
    langSelect.innerHTML = "";
    LANGS.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang.id;
      opt.textContent = lang.name;
      langSelect.appendChild(opt);
    });
    langSelect.value = "es";
    labelSource.textContent = "Español";
  }

  function renderFacts() {
    if (!dict) return;
    alphabetText.textContent = dict.alphabet;
    letterList.innerHTML = "";
    (dict.letters || []).forEach((letter) => {
      const row = document.createElement("div");
      row.className = "letter-row";
      row.innerHTML =
        "<span class='letter-glyph mono'>" + letter.g + "</span>" +
        "<span class='mono'>/" + letter.ipa + "/</span> " +
        "<span>(" + letter.help + ")</span>";
      letterList.appendChild(row);
    });
  }

  const LEARN_KEY = "chunna-idioma-learn-v1";
  /** @type {Record<string, number>} */
  let learnProgress = {};
  /** @type {{entry:object, level:number, kind:string}|null} */
  let currentLesson = null;

  const learnStats = document.getElementById("learnStats");
  const progressList = document.getElementById("progressList");
  const learnHint = document.getElementById("learnHint");
  const learnPrompt = document.getElementById("learnPrompt");
  const learnMain = document.getElementById("learnMain");
  const learnSub = document.getElementById("learnSub");
  const learnOptions = document.getElementById("learnOptions");
  const learnActions = document.getElementById("learnActions");
  const learnFeedback = document.getElementById("learnFeedback");

  function wordKey(entry) {
    return fold((entry.words && entry.words.es) || entry.chunna);
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LEARN_KEY) || "{}");
      learnProgress = parsed && typeof parsed === "object" ? parsed : {};
    } catch (_err) {
      learnProgress = {};
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(LEARN_KEY, JSON.stringify(learnProgress));
    } catch (_err) {
      /* ignore */
    }
  }

  function getLevel(entry) {
    const key = wordKey(entry);
    const n = Math.floor(Number(learnProgress[key]) || 0);
    return Math.max(0, Math.min(5, n));
  }

  function setLevel(entry, level) {
    learnProgress[wordKey(entry)] = Math.max(0, Math.min(5, level));
    saveProgress();
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function allEntries() {
    return (dict && dict.entries) || [];
  }

  function renderLearnHub() {
    const entries = allEntries();
    let mastered = 0;
    let learning = 0;
    let fresh = 0;
    progressList.innerHTML = "";
    entries
      .slice()
      .sort((a, b) => getLevel(b) - getLevel(a) || wordKey(a).localeCompare(wordKey(b)))
      .forEach((entry) => {
        const level = getLevel(entry);
        if (level >= 5) mastered += 1;
        else if (level > 0) learning += 1;
        else fresh += 1;
        const row = document.createElement("div");
        row.className = "progress-row";
        const pips = [1, 2, 3, 4, 5]
          .map((n) => "<span class='" + (level >= n ? "on" : "") + "'></span>")
          .join("");
        row.innerHTML =
          "<div><strong>" +
          (entry.words && entry.words.es ? entry.words.es : "?") +
          "</strong><span class='mono'>" +
          entry.chunna +
          "</span></div>" +
          "<div class='level-pips' title='Nivel " +
          level +
          "/5'>" +
          pips +
          "</div>";
        progressList.appendChild(row);
      });
    learnStats.textContent =
      "Dominadas: " +
      mastered +
      " · En progreso: " +
      learning +
      " · Nuevas: " +
      fresh +
      " · Total: " +
      entries.length;
  }

  function pickLessonEntry() {
    const entries = allEntries();
    if (!entries.length) return null;
    const review = entries.filter((e) => {
      const lv = getLevel(e);
      return lv >= 1 && lv < 5;
    });
    const fresh = entries.filter((e) => getLevel(e) === 0);
    const mastered = entries.filter((e) => getLevel(e) >= 5);

    // 60% practicar aprendidas, 30% nuevas, 10% repaso de dominadas
    const roll = Math.random();
    let pool = review;
    if (roll < 0.3 && fresh.length) pool = fresh;
    else if (roll > 0.9 && mastered.length) pool = mastered;
    else if (!pool.length && fresh.length) pool = fresh;
    else if (!pool.length) pool = entries;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function distractors(entry, field, count) {
    const others = shuffle(allEntries().filter((e) => wordKey(e) !== wordKey(entry)));
    const out = [];
    for (let i = 0; i < others.length && out.length < count; i += 1) {
      let value = "";
      if (field === "chunna") value = others[i].chunna;
      else if (field === "es") value = others[i].words && others[i].words.es;
      else if (field === "help") value = others[i].help;
      if (value) out.push(value);
    }
    return out;
  }

  function clearLessonUi() {
    learnOptions.innerHTML = "";
    learnActions.innerHTML = "";
    learnFeedback.hidden = true;
    learnFeedback.textContent = "";
    learnFeedback.className = "learn-feedback";
  }

  function showFeedback(ok, message) {
    learnFeedback.hidden = false;
    learnFeedback.className = "learn-feedback " + (ok ? "ok" : "bad");
    learnFeedback.textContent = message;
  }

  function addAction(label, primary, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn " + (primary ? "primary" : "ghost");
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    learnActions.appendChild(btn);
  }

  function finishRound(ok) {
    if (!currentLesson) return;
    const entry = currentLesson.entry;
    const level = getLevel(entry);
    if (ok) {
      if (level < 5) setLevel(entry, level + 1);
      showFeedback(true, "¡Bien! Nivel " + getLevel(entry) + "/5");
    } else {
      if (level > 1) setLevel(entry, level - 1);
      else if (level === 0) setLevel(entry, 1);
      showFeedback(false, "Casi. Quedó en nivel " + getLevel(entry) + "/5");
    }
    learnOptions.querySelectorAll("button").forEach((btn) => {
      btn.disabled = true;
    });
    learnActions.innerHTML = "";
    addAction("Siguiente", true, () => startLessonRound());
    addAction("Salir", false, () => {
      renderLearnHub();
      show("screenLearnHub");
    });
  }

  function askMultiple(prompt, main, sub, options, answer) {
    clearLessonUi();
    learnPrompt.textContent = prompt;
    learnMain.textContent = main;
    learnSub.textContent = sub || "";
    shuffle(options).forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        finishRound(opt === answer);
      });
      learnOptions.appendChild(btn);
    });
  }

  function startLessonRound() {
    if (!dict) return;
    const entry = pickLessonEntry();
    if (!entry) return;
    const level = getLevel(entry);
    // El ejercicio del próximo tramo: nivel 0 → intro (pasa a 1); 1-4 → práctica de ese nivel; 5 → repaso
    const stage = level >= 5 ? 5 : level + 1;
    currentLesson = { entry: entry, level: level, stage: stage };
    learnHint.textContent =
      (entry.words && entry.words.es ? entry.words.es : "?") +
      " · ahora nivel " +
      level +
      "/5 → objetivo " +
      Math.min(5, stage);

    const es = (entry.words && entry.words.es) || "?";
    if (stage === 1) {
      clearLessonUi();
      learnPrompt.textContent = "Nivel 1 · Memorizá esta palabra";
      learnMain.textContent = entry.chunna;
      learnSub.textContent = es + " · /" + entry.ipa + "/ (" + entry.help + ")";
      addAction("Ya la memorizé", true, () => finishRound(true));
      return;
    }
    if (stage === 2) {
      const opts = [entry.chunna].concat(distractors(entry, "chunna", 3));
      askMultiple(
        "Nivel 2 · ¿Cómo se escribe en Chunna?",
        es,
        "Elegí la forma correcta",
        opts,
        entry.chunna
      );
      return;
    }
    if (stage === 3) {
      const opts = [es].concat(distractors(entry, "es", 3));
      askMultiple(
        "Nivel 3 · ¿Qué significa esto?",
        entry.chunna,
        "/" + entry.ipa + "/",
        opts,
        es
      );
      return;
    }
    if (stage === 4) {
      const opts = [es].concat(distractors(entry, "es", 3));
      askMultiple(
        "Nivel 4 · Escuchá/leé la pronunciación",
        "/" + entry.ipa + "/",
        "(" + entry.help + ")",
        opts,
        es
      );
      return;
    }
    // Nivel 5 / repaso final
    const opts = [entry.chunna].concat(distractors(entry, "chunna", 3));
    askMultiple(
      level >= 5 ? "Repaso · palabra dominada" : "Nivel 5 · Dominio final",
      es + " → Chunna",
      "(" + entry.help + ")",
      opts,
      entry.chunna
    );
  }

  async function loadDict() {
    const res = await fetch("dictionary.json?v=ci9", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el diccionario Chunna");
    dict = await res.json();
  }

  document.getElementById("btnPlay").addEventListener("click", () => {
    fillLangs();
    textSource.value = "";
    textChunna.value = "";
    lastHits = [];
    btnSpeak.disabled = true;
    speakList.hidden = true;
    renderMissing([]);
    show("screenTranslate");
    textSource.focus();
  });
  function openLearnHub() {
    stopSpeak();
    loadProgress();
    renderLearnHub();
    show("screenLearnHub");
  }

  document.getElementById("btnLearn").addEventListener("click", openLearnHub);
  document.getElementById("btnLearnFromTranslate").addEventListener("click", openLearnHub);
  document.getElementById("btnStartLesson").addEventListener("click", () => {
    show("screenLearn");
    startLessonRound();
  });
  document.getElementById("btnResetProgress").addEventListener("click", () => {
    if (!window.confirm("¿Reiniciar todo el progreso de aprendizaje?")) return;
    learnProgress = {};
    saveProgress();
    renderLearnHub();
  });
  document.getElementById("btnBackLearnHub").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnBackLearn").addEventListener("click", () => {
    renderLearnHub();
    show("screenLearnHub");
  });
  document.getElementById("btnFacts").addEventListener("click", () => {
    renderFacts();
    show("screenFacts");
  });
  document.getElementById("btnFactsFromTranslate").addEventListener("click", () => {
    renderFacts();
    show("screenFacts");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => {
    stopSpeak();
    show("screenTitle");
  });
  document.getElementById("btnBackFacts").addEventListener("click", () => show("screenTitle"));

  langSelect.addEventListener("change", () => {
    const lang = LANGS.find((item) => item.id === currentLang());
    labelSource.textContent = lang ? lang.name : "Idioma";
    syncFromSource();
  });
  textSource.addEventListener("input", syncFromSource);
  textChunna.addEventListener("input", syncFromChunna);
  btnSpeak.addEventListener("click", speakHits);
  document.getElementById("btnStopSpeak").addEventListener("click", stopSpeak);
  document.getElementById("btnClear").addEventListener("click", () => {
    stopSpeak();
    textSource.value = "";
    textChunna.value = "";
    lastHits = [];
    btnSpeak.disabled = true;
    speakList.hidden = true;
    renderMissing([]);
  });

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () { /* cache voices */ };
  }

  loadProgress();
  loadDict()
    .then(() => {
      /* listo */
    })
    .catch((err) => {
      window.alert(err.message || "Error cargando Chunna");
    });
})();
