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
  const STREAK_KEY = "chunna-idioma-streak-v1";
  /** @type {Record<string, number>} */
  let learnProgress = {};
  /** @type {{count:number,lastDate:string}} */
  let streakData = { count: 0, lastDate: "" };
  /** @type {{entry:object, level:number, stage:number}|null} */
  let currentLesson = null;
  /** @type {{es:string, chunna:string}|null} */
  let currentSentence = null;
  /** @type {{title:string, turns:Array, turn:number}|null} */
  let currentTalk = null;

  const SENTENCE_ES = [
    "hola amigo",
    "cómo estás",
    "quién sos",
    "hola · cómo estás",
    "el agua",
    "amigo genial",
    "no malo",
    "la idea",
    "el tiempo",
    "mañana genial",
    "hola amigos",
    "no miedo",
    "el país",
    "la nación",
    "agua de mar",
    "nada malo",
    "bueno amigo",
    "cómo estás amigo",
    "quién está",
    "el dinero"
  ];

  const TALKS = [
    {
      title: "Saludo",
      turns: [
        { role: "npc", es: "hola" },
        { role: "you", es: "hola amigo", options: ["hola amigo", "no malo", "quién sos"] },
        { role: "npc", es: "cómo estás" },
        { role: "you", es: "genial", options: ["genial", "malo", "nada"] }
      ]
    },
    {
      title: "Preguntar",
      turns: [
        { role: "npc", es: "quién sos" },
        { role: "you", es: "amigo", options: ["amigo", "agua", "miedo"] },
        { role: "npc", es: "cómo estás" },
        { role: "you", es: "bueno", options: ["bueno", "malo", "no"] }
      ]
    },
    {
      title: "Planes",
      turns: [
        { role: "npc", es: "hola" },
        { role: "you", es: "hola", options: ["hola", "matar", "fregar"] },
        { role: "npc", es: "el tiempo" },
        { role: "you", es: "mañana genial", options: ["mañana genial", "malo miedo", "nada agua"] }
      ]
    },
    {
      title: "Amigos",
      turns: [
        { role: "npc", es: "hola amigos" },
        { role: "you", es: "hola", options: ["hola", "no", "dado"] },
        { role: "npc", es: "cómo estás" },
        { role: "you", es: "no malo", options: ["no malo", "el mar", "la bandeja"] }
      ]
    }
  ];

  const learnStats = document.getElementById("learnStats");
  const progressList = document.getElementById("progressList");
  const streakBanner = document.getElementById("streakBanner");
  const advancedBox = document.getElementById("advancedBox");
  const advancedLockHint = document.getElementById("advancedLockHint");
  const advancedActions = document.getElementById("advancedActions");
  const learnHint = document.getElementById("learnHint");
  const learnPrompt = document.getElementById("learnPrompt");
  const learnMain = document.getElementById("learnMain");
  const learnSub = document.getElementById("learnSub");
  const learnOptions = document.getElementById("learnOptions");
  const learnActions = document.getElementById("learnActions");
  const learnFeedback = document.getElementById("learnFeedback");
  const sentenceHint = document.getElementById("sentenceHint");
  const sentencePrompt = document.getElementById("sentencePrompt");
  const sentenceMain = document.getElementById("sentenceMain");
  const sentenceSub = document.getElementById("sentenceSub");
  const sentenceOptions = document.getElementById("sentenceOptions");
  const sentenceActions = document.getElementById("sentenceActions");
  const sentenceFeedback = document.getElementById("sentenceFeedback");
  const talkHint = document.getElementById("talkHint");
  const chatLog = document.getElementById("chatLog");
  const talkPrompt = document.getElementById("talkPrompt");
  const talkOptions = document.getElementById("talkOptions");
  const talkActions = document.getElementById("talkActions");
  const talkFeedback = document.getElementById("talkFeedback");

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

  function loadStreak() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
      streakData = {
        count: Math.max(0, Math.floor(Number(parsed.count) || 0)),
        lastDate: typeof parsed.lastDate === "string" ? parsed.lastDate : ""
      };
    } catch (_err) {
      streakData = { count: 0, lastDate: "" };
    }
  }

  function saveStreak() {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    } catch (_err) {
      /* ignore */
    }
  }

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function shiftDay(iso, delta) {
    const parts = String(iso || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => !n)) return "";
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() + delta);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function liveStreakCount() {
    const today = todayKey();
    if (!streakData.lastDate) return 0;
    if (streakData.lastDate === today || streakData.lastDate === shiftDay(today, -1)) {
      return streakData.count;
    }
    return 0;
  }

  function markPracticeDay() {
    const today = todayKey();
    if (streakData.lastDate === today) return liveStreakCount();
    if (streakData.lastDate === shiftDay(today, -1)) {
      streakData.count = Math.max(1, streakData.count + 1);
    } else {
      streakData.count = 1;
    }
    streakData.lastDate = today;
    saveStreak();
    return streakData.count;
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

  function masteryStats() {
    const entries = allEntries();
    let mastered = 0;
    let learning = 0;
    let fresh = 0;
    entries.forEach((entry) => {
      const level = getLevel(entry);
      if (level >= 5) mastered += 1;
      else if (level > 0) learning += 1;
      else fresh += 1;
    });
    return { entries: entries, mastered: mastered, learning: learning, fresh: fresh, total: entries.length };
  }

  function allMastered() {
    const stats = masteryStats();
    return stats.total > 0 && stats.mastered === stats.total;
  }

  function entryByEs(word) {
    const key = fold(word);
    return allEntries().find((e) => fold((e.words && e.words.es) || "") === key) || null;
  }

  function translateEsPhrase(esText) {
    const parts = String(esText || "").split(/(\s+|·)/);
    const out = [];
    const helps = [];
    let ok = true;
    parts.forEach((part) => {
      if (!part || /^\s+$/.test(part) || part === "·") {
        out.push(part === "·" ? "·" : part);
        return;
      }
      const entry = entryByEs(part);
      if (!entry) {
        ok = false;
        out.push(part);
        return;
      }
      out.push(entry.chunna);
      helps.push(entry.help);
    });
    return {
      ok: ok,
      es: esText,
      chunna: out.join("").replace(/\s+/g, " ").trim(),
      help: helps.join(" · ")
    };
  }

  function renderStreakBanner() {
    const count = liveStreakCount();
    const today = todayKey();
    const doneToday = streakData.lastDate === today;
    streakBanner.textContent =
      "Racha: " +
      count +
      (count === 1 ? " día" : " días") +
      (doneToday ? " · ¡Practicaste hoy!" : " · Practicá hoy para sumar");
  }

  function renderLearnHub() {
    const stats = masteryStats();
    progressList.innerHTML = "";
    stats.entries
      .slice()
      .sort((a, b) => getLevel(b) - getLevel(a) || wordKey(a).localeCompare(wordKey(b)))
      .forEach((entry) => {
        const level = getLevel(entry);
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
      stats.mastered +
      " · En progreso: " +
      stats.learning +
      " · Nuevas: " +
      stats.fresh +
      " · Total: " +
      stats.total;
    renderStreakBanner();
    const unlocked = allMastered();
    advancedBox.classList.toggle("unlocked", unlocked);
    advancedActions.hidden = !unlocked;
    advancedLockHint.hidden = unlocked;
    if (!unlocked) {
      advancedLockHint.textContent =
        "Dominá las 5 cosas de todas las palabras para desbloquear oraciones y conversaciones (" +
        stats.mastered +
        "/" +
        stats.total +
        ").";
    } else {
      advancedLockHint.hidden = true;
    }
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

  function addAction(label, primary, onClick, target) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn " + (primary ? "primary" : "ghost");
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    (target || learnActions).appendChild(btn);
  }

  function finishRound(ok) {
    if (!currentLesson) return;
    const entry = currentLesson.entry;
    const level = getLevel(entry);
    if (ok) {
      if (level < 5) setLevel(entry, level + 1);
      const streak = markPracticeDay();
      showFeedback(true, "¡Bien! Nivel " + getLevel(entry) + "/5 · Racha " + streak);
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
      askMultiple("Nivel 2 · ¿Cómo se escribe en Chunna?", es, "Elegí la forma correcta", opts, entry.chunna);
      return;
    }
    if (stage === 3) {
      const opts = [es].concat(distractors(entry, "es", 3));
      askMultiple("Nivel 3 · ¿Qué significa esto?", entry.chunna, "/" + entry.ipa + "/", opts, es);
      return;
    }
    if (stage === 4) {
      const opts = [es].concat(distractors(entry, "es", 3));
      askMultiple("Nivel 4 · Escuchá/leé la pronunciación", "/" + entry.ipa + "/", "(" + entry.help + ")", opts, es);
      return;
    }
    const opts = [entry.chunna].concat(distractors(entry, "chunna", 3));
    askMultiple(
      level >= 5 ? "Repaso · palabra dominada" : "Nivel 5 · Dominio final",
      es + " → Chunna",
      "(" + entry.help + ")",
      opts,
      entry.chunna
    );
  }

  function sentenceDistractors(correct, count) {
    const pool = shuffle(
      SENTENCE_ES.map(translateEsPhrase).filter((item) => item.ok && item.chunna !== correct.chunna)
    );
    const out = [];
    for (let i = 0; i < pool.length && out.length < count; i += 1) out.push(pool[i].chunna);
    while (out.length < count) {
      const fake = shuffle(allEntries()).slice(0, 2).map((e) => e.chunna).join(" ");
      if (fake && fake !== correct.chunna && out.indexOf(fake) < 0) out.push(fake);
      else break;
    }
    return out;
  }

  function startSentenceRound() {
    if (!allMastered()) {
      window.alert("Primero dominá todas las palabras (nivel 5).");
      renderLearnHub();
      show("screenLearnHub");
      return;
    }
    const candidates = shuffle(SENTENCE_ES.map(translateEsPhrase).filter((item) => item.ok));
    const item = candidates[0];
    if (!item) return;
    currentSentence = item;
    sentenceFeedback.hidden = true;
    sentenceActions.innerHTML = "";
    sentenceOptions.innerHTML = "";
    sentenceHint.textContent = "Elegí la oración correcta en Chunna";
    sentencePrompt.textContent = "¿Cómo se dice esta oración?";
    sentenceMain.textContent = item.es;
    sentenceSub.textContent = item.help ? "(" + item.help + ")" : "";
    const opts = shuffle([item.chunna].concat(sentenceDistractors(item, 3)));
    opts.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        const ok = opt === item.chunna;
        sentenceOptions.querySelectorAll("button").forEach((b) => {
          b.disabled = true;
        });
        sentenceFeedback.hidden = false;
        sentenceFeedback.className = "learn-feedback " + (ok ? "ok" : "bad");
        if (ok) {
          const streak = markPracticeDay();
          sentenceFeedback.textContent = "¡Oración correcta! Racha " + streak;
        } else {
          sentenceFeedback.textContent = "Casi. Era: " + item.chunna;
        }
        sentenceActions.innerHTML = "";
        addAction("Siguiente oración", true, () => startSentenceRound(), sentenceActions);
        addAction("Salir", false, () => {
          renderLearnHub();
          show("screenLearnHub");
        }, sentenceActions);
      });
      sentenceOptions.appendChild(btn);
    });
  }

  function appendChat(role, esText, chunnaText) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + (role === "you" ? "you" : "npc");
    bubble.innerHTML =
      "<span class='who'>" +
      (role === "you" ? "Vos" : "Amigo Chunna") +
      "</span>" +
      "<span class='mono'>" +
      chunnaText +
      "</span>" +
      "<div class='hint'>" +
      esText +
      "</div>";
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function finishTalk(ok) {
    talkOptions.querySelectorAll("button").forEach((btn) => {
      btn.disabled = true;
    });
    talkFeedback.hidden = false;
    talkFeedback.className = "learn-feedback " + (ok ? "ok" : "bad");
    if (ok) {
      const streak = markPracticeDay();
      talkFeedback.textContent = "¡Buena charla! Racha " + streak;
    } else {
      talkFeedback.textContent = "Casi. Probá otra conversación.";
    }
    talkActions.innerHTML = "";
    addAction("Otra conversación", true, () => startTalk(), talkActions);
    addAction("Salir", false, () => {
      renderLearnHub();
      show("screenLearnHub");
    }, talkActions);
  }

  function playTalkTurn() {
    if (!currentTalk) return;
    talkOptions.innerHTML = "";
    talkActions.innerHTML = "";
    talkFeedback.hidden = true;
    while (currentTalk.turn < currentTalk.turns.length) {
      const step = currentTalk.turns[currentTalk.turn];
      const translated = translateEsPhrase(step.es);
      if (step.role === "npc") {
        appendChat("npc", step.es, translated.chunna);
        currentTalk.turn += 1;
        continue;
      }
      talkHint.textContent = currentTalk.title + " · tu turno";
      talkPrompt.textContent = "Respondé en Chunna (idea: “" + step.es + "”)";
      const answer = translateEsPhrase(step.es).chunna;
      const optionLabels = (step.options || [step.es]).map((esOpt) => {
        const t = translateEsPhrase(esOpt);
        return { es: esOpt, chunna: t.chunna };
      });
      shuffle(optionLabels).forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn ghost";
        btn.textContent = opt.chunna;
        btn.addEventListener("click", () => {
          appendChat("you", opt.es, opt.chunna);
          if (opt.chunna !== answer) {
            finishTalk(false);
            return;
          }
          currentTalk.turn += 1;
          if (currentTalk.turn >= currentTalk.turns.length) {
            finishTalk(true);
            return;
          }
          playTalkTurn();
        });
        talkOptions.appendChild(btn);
      });
      return;
    }
    finishTalk(true);
  }

  function startTalk() {
    if (!allMastered()) {
      window.alert("Primero dominá todas las palabras (nivel 5).");
      renderLearnHub();
      show("screenLearnHub");
      return;
    }
    const script = shuffle(TALKS)[0];
    currentTalk = { title: script.title, turns: script.turns, turn: 0 };
    chatLog.innerHTML = "";
    talkFeedback.hidden = true;
    talkActions.innerHTML = "";
    talkOptions.innerHTML = "";
    talkHint.textContent = script.title;
    talkPrompt.textContent = "Leé el chat y respondé";
    playTalkTurn();
  }

  async function loadDict() {
    const res = await fetch("dictionary.json?v=ci10", { cache: "no-store" });
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
    loadStreak();
    renderLearnHub();
    show("screenLearnHub");
  }

  document.getElementById("btnLearn").addEventListener("click", openLearnHub);
  document.getElementById("btnLearnFromTranslate").addEventListener("click", openLearnHub);
  document.getElementById("btnStartLesson").addEventListener("click", () => {
    show("screenLearn");
    startLessonRound();
  });
  document.getElementById("btnSentences").addEventListener("click", () => {
    show("screenSentence");
    startSentenceRound();
  });
  document.getElementById("btnTalk").addEventListener("click", () => {
    show("screenTalk");
    startTalk();
  });
  document.getElementById("btnResetProgress").addEventListener("click", () => {
    if (!window.confirm("¿Reiniciar progreso y racha?")) return;
    learnProgress = {};
    streakData = { count: 0, lastDate: "" };
    saveProgress();
    saveStreak();
    renderLearnHub();
  });
  document.getElementById("btnBackLearnHub").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnBackLearn").addEventListener("click", () => {
    renderLearnHub();
    show("screenLearnHub");
  });
  document.getElementById("btnBackSentence").addEventListener("click", () => {
    renderLearnHub();
    show("screenLearnHub");
  });
  document.getElementById("btnBackTalk").addEventListener("click", () => {
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
  loadStreak();
  loadDict()
    .then(() => {
      /* listo */
    })
    .catch((err) => {
      window.alert(err.message || "Error cargando Chunna");
    });
})();
