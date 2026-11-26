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
  const chunnaKeyboard = document.getElementById("chunnaKeyboard");
  const chunnaKbKeys = document.getElementById("chunnaKbKeys");
  const btnKbClose = document.getElementById("btnKbClose");
  const btnKbEnter = document.getElementById("btnKbEnter");
  /** @type {HTMLTextAreaElement|null} */
  let kbTarget = null;

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    if (id !== "screenTranslate" && id !== "screenTalk") hideChunnaKeyboard();
  }

  function chunnaGlyphs() {
    if (dict && Array.isArray(dict.letters) && dict.letters.length) {
      return dict.letters.map((letter) => letter.g).filter(Boolean);
    }
    if (dict && dict.alphabet) return Array.from(dict.alphabet);
    return Array.from("⩤⫲⫼⊟⊴⋈⊥⋑ϖ≬⊘肺结核⋒⨿⫬ϡϠ⌖⋓⋲⊩≡≘⪮⋹");
  }

  function buildChunnaKeyboard() {
    chunnaKbKeys.innerHTML = "";
    chunnaGlyphs().forEach((glyph) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kb-key";
      btn.textContent = glyph;
      btn.setAttribute("data-kb-char", glyph);
      btn.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        insertKbText(glyph);
      });
      chunnaKbKeys.appendChild(btn);
    });
  }

  function showChunnaKeyboard(target) {
    if (!target || target.disabled) return;
    kbTarget = target;
    chunnaKeyboard.hidden = false;
    document.body.classList.add("kb-open");
    btnKbEnter.textContent = target.id === "talkInput" ? "Enviar" : "↵";
  }

  function hideChunnaKeyboard() {
    chunnaKeyboard.hidden = true;
    document.body.classList.remove("kb-open");
    kbTarget = null;
  }

  function insertKbText(chunk) {
    const el = kbTarget;
    if (!el || el.disabled) return;
    const start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + chunk + after;
    const pos = start + chunk.length;
    try {
      el.setSelectionRange(pos, pos);
    } catch (_err) {
      /* ignore */
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus({ preventScroll: true });
  }

  function kbBackspace() {
    const el = kbTarget;
    if (!el || el.disabled) return;
    const start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : el.value.length;
    let nextValue = el.value;
    let nextPos = start;
    if (start !== end) {
      nextValue = el.value.slice(0, start) + el.value.slice(end);
      nextPos = start;
    } else if (start > 0) {
      const before = el.value.slice(0, start);
      const after = el.value.slice(start);
      const chars = Array.from(before);
      chars.pop();
      nextValue = chars.join("") + after;
      nextPos = chars.join("").length;
    } else {
      return;
    }
    el.value = nextValue;
    try {
      el.setSelectionRange(nextPos, nextPos);
    } catch (_err) {
      /* ignore */
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus({ preventScroll: true });
  }

  function kbEnter() {
    if (kbTarget && kbTarget.id === "talkInput") {
      if (typeof submitTalkReply === "function") submitTalkReply();
      return;
    }
    insertKbText("\n");
  }

  function bindChunnaField(el) {
    if (!el) return;
    el.setAttribute("inputmode", "none");
    el.setAttribute("autocomplete", "off");
    el.setAttribute("spellcheck", "false");
    el.addEventListener("focus", () => {
      // Evita el teclado del sistema en celulares.
      el.setAttribute("readonly", "readonly");
      showChunnaKeyboard(el);
      window.setTimeout(() => {
        el.removeAttribute("readonly");
        try {
          const pos = el.value.length;
          el.setSelectionRange(pos, pos);
        } catch (_err) {
          /* ignore */
        }
      }, 40);
    });
    el.addEventListener("click", () => showChunnaKeyboard(el));
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

  function speakEntryList(entries) {
    if (!entries.length || !window.speechSynthesis) return;
    stopSpeak();
    let i = 0;

    function next() {
      if (i >= entries.length) return;
      const entry = entries[i];
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

  function speakHits() {
    speakEntryList(lastHits);
  }

  function entriesFromEsPhrase(esText) {
    const out = [];
    String(esText || "")
      .split(/\s+|·/)
      .forEach((part) => {
        if (!part || !part.trim()) return;
        const entry = entryByEs(part);
        if (entry) out.push(entry);
      });
    return out;
  }

  function entriesFromAnyPhrase(text) {
    let out = entriesFromEsPhrase(text);
    if (out.length) return out;
    out = [];
    String(text || "")
      .split(/\s+|·/)
      .forEach((part) => {
        if (!part || !part.trim()) return;
        const hit = allEntries().find((e) => e.chunna === part);
        if (hit) out.push(hit);
      });
    return out;
  }

  function speakEsPhrase(esText) {
    speakEntryList(entriesFromAnyPhrase(esText));
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
  /** @type {{pairs:Array, matched:Set<string>, selectedEs:string|null, selectedCh:string|null, mistakes:number}|null} */
  let currentMatch = null;

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

  const TALK_PER_TYPE = 1000;

  const TALK_PHRASES = {
    greet: [
      "hola",
      "hola amigo",
      "hola amigos",
      "hola chunna",
      "amigo hola",
      "hola genial",
      "hola bueno",
      "hola libre",
      "hola nación",
      "hola país"
    ],
    ask: [
      "cómo estás",
      "quién sos",
      "quién está",
      "cómo estás amigo",
      "quién sos amigo",
      "el tiempo",
      "la idea",
      "quién está libre",
      "cómo estás mañana",
      "quién sos chunna"
    ],
    feel: [
      "genial",
      "bueno",
      "malo",
      "no malo",
      "nada",
      "libre",
      "no miedo",
      "nada malo",
      "amigo genial",
      "bueno amigo"
    ],
    who: [
      "amigo",
      "amigos",
      "chunna",
      "nación",
      "país",
      "amigo bueno",
      "amigo libre",
      "amigos genial",
      "chunna bueno",
      "nación libre"
    ],
    thing: [
      "el agua",
      "el dinero",
      "el mar",
      "el tiempo",
      "la idea",
      "la nación",
      "el país",
      "el postre",
      "la carpa",
      "la bandeja",
      "el zoologico",
      "matemáticas",
      "la linterna",
      "el grito",
      "el dado",
      "agua de mar"
    ],
    time: [
      "mañana",
      "mañana genial",
      "el tiempo",
      "mañana bueno",
      "mañana libre",
      "nada mañana",
      "tiempo genial",
      "mañana malo",
      "el tiempo libre",
      "mañana amigo"
    ],
    plan: [
      "mañana genial",
      "el mar",
      "la idea",
      "matemáticas",
      "el zoologico",
      "agua de mar",
      "el postre",
      "la carpa",
      "no miedo",
      "amigo libre"
    ],
    objectAsk: [
      "el agua",
      "quién está",
      "la linterna",
      "el dinero",
      "la bandeja",
      "el postre",
      "la idea",
      "el dado",
      "matemáticas",
      "el grito"
    ]
  };

  const TALK_TYPES = [
    {
      id: "saludo",
      title: "Saludo",
      slots: ["greet", "greet", "ask", "feel"]
    },
    {
      id: "preguntar",
      title: "Preguntar",
      slots: ["ask", "who", "ask", "feel"]
    },
    {
      id: "planes",
      title: "Planes",
      slots: ["greet", "greet", "time", "plan"]
    },
    {
      id: "amigos",
      title: "Amigos",
      slots: ["greet", "who", "ask", "feel"]
    },
    {
      id: "pais",
      title: "País",
      slots: ["greet", "who", "thing", "feel"]
    },
    {
      id: "cosas",
      title: "Cosas",
      slots: ["objectAsk", "thing", "ask", "feel"]
    },
    {
      id: "tiempo",
      title: "Tiempo",
      slots: ["greet", "time", "ask", "plan"]
    },
    {
      id: "ideas",
      title: "Ideas",
      slots: ["ask", "thing", "greet", "feel"]
    }
  ];

  let lastTalkKey = "";

  function talkSlotPhrase(slotName, index) {
    const bank = TALK_PHRASES[slotName] || TALK_PHRASES.greet;
    return bank[((index % bank.length) + bank.length) % bank.length];
  }

  function buildTalkVariant(type, index) {
    const i = ((index % TALK_PER_TYPE) + TALK_PER_TYPE) % TALK_PER_TYPE;
    const slots = type.slots;
    const sizes = slots.map((name) => (TALK_PHRASES[name] || TALK_PHRASES.greet).length);
    let rest = i;
    const picks = [];
    for (let s = 0; s < slots.length; s += 1) {
      const size = sizes[s];
      picks.push(talkSlotPhrase(slots[s], rest % size));
      rest = Math.floor(rest / size);
    }
    const turns = [];
    for (let t = 0; t < picks.length; t += 1) {
      turns.push({ role: t % 2 === 0 ? "npc" : "you", es: picks[t] });
    }
    if (turns[0].role !== "npc") {
      turns.unshift({ role: "npc", es: talkSlotPhrase("greet", i) });
    }
    if (turns[turns.length - 1].role !== "you") {
      turns.push({ role: "you", es: talkSlotPhrase("feel", i * 5) });
    }
    return {
      title: type.title + " · #" + (i + 1) + "/" + TALK_PER_TYPE,
      typeId: type.id,
      index: i,
      turns: turns
    };
  }

  function fillTalkTypes() {
    const prev = talkTypeSelect.value;
    talkTypeSelect.innerHTML = "";
    TALK_TYPES.forEach((type) => {
      const opt = document.createElement("option");
      opt.value = type.id;
      opt.textContent = type.title + " (1000)";
      talkTypeSelect.appendChild(opt);
    });
    if (prev && TALK_TYPES.some((t) => t.id === prev)) talkTypeSelect.value = prev;
  }

  function currentTalkType() {
    return TALK_TYPES.find((t) => t.id === talkTypeSelect.value) || TALK_TYPES[0];
  }

  function pickTalkScript() {
    const type = currentTalkType();
    let index = Math.floor(Math.random() * TALK_PER_TYPE);
    const key = type.id + ":" + index;
    if (key === lastTalkKey) index = (index + 1) % TALK_PER_TYPE;
    lastTalkKey = type.id + ":" + index;
    return buildTalkVariant(type, index);
  }

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
  const talkTitle = document.getElementById("talkTitle");
  const talkHint = document.getElementById("talkHint");
  const talkTypeWrap = document.getElementById("talkTypeWrap");
  const talkTypeSelect = document.getElementById("talkTypeSelect");
  const talkCountHint = document.getElementById("talkCountHint");
  const chatLog = document.getElementById("chatLog");
  const talkPrompt = document.getElementById("talkPrompt");
  const talkCompose = document.getElementById("talkCompose");
  const talkInput = document.getElementById("talkInput");
  const talkVoiceToggle = document.getElementById("talkVoiceToggle");
  const btnTalkSend = document.getElementById("btnTalkSend");
  const btnTalkHear = document.getElementById("btnTalkHear");
  const btnTalkRecord = document.getElementById("btnTalkRecord");
  const btnTalkUseRecord = document.getElementById("btnTalkUseRecord");
  const recordStatus = document.getElementById("recordStatus");
  const recordResult = document.getElementById("recordResult");
  const talkActions = document.getElementById("talkActions");
  const talkFeedback = document.getElementById("talkFeedback");
  const matchHint = document.getElementById("matchHint");
  const matchStats = document.getElementById("matchStats");
  const matchEsList = document.getElementById("matchEsList");
  const matchChList = document.getElementById("matchChList");
  const matchActions = document.getElementById("matchActions");
  const matchFeedback = document.getElementById("matchFeedback");
  const VOICE_PREF_KEY = "chunna-idioma-talk-voice-v1";
  let lastSpokenEs = "";
  let awaitingTalkReply = false;
  let talkMode = "guided";
  let recognition = null;
  let recording = false;
  let lastRecorded = { es: "", chunna: "" };

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

  function updateMatchStats() {
    if (!currentMatch) {
      matchStats.textContent = "—";
      return;
    }
    matchStats.textContent =
      "Emparejadas: " +
      currentMatch.matched.size +
      "/" +
      currentMatch.pairs.length +
      " · Errores: " +
      currentMatch.mistakes;
  }

  function finishMatchRound() {
    const streak = markPracticeDay();
    matchFeedback.hidden = false;
    matchFeedback.className = "learn-feedback ok";
    matchFeedback.textContent =
      "¡Todas emparejadas! Errores: " + currentMatch.mistakes + " · Racha " + streak;
    matchActions.innerHTML = "";
    addAction("Otra ronda", true, () => startMatchRound(), matchActions);
    addAction("Salir", false, () => {
      renderLearnHub();
      show("screenLearnHub");
    }, matchActions);
  }

  function renderMatchBoard() {
    if (!currentMatch) return;
    matchEsList.innerHTML = "";
    matchChList.innerHTML = "";
    const esOrder = shuffle(currentMatch.pairs.slice());
    const chOrder = shuffle(currentMatch.pairs.slice());

    esOrder.forEach((pair) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "match-card";
      btn.textContent = pair.es;
      btn.dataset.key = pair.key;
      if (currentMatch.matched.has(pair.key)) {
        btn.classList.add("matched");
        btn.disabled = true;
      } else if (currentMatch.selectedEs === pair.key) {
        btn.classList.add("selected");
      }
      btn.addEventListener("click", () => onMatchPick("es", pair.key, btn));
      matchEsList.appendChild(btn);
    });

    chOrder.forEach((pair) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "match-card mono";
      btn.textContent = pair.chunna;
      btn.dataset.key = pair.key;
      if (currentMatch.matched.has(pair.key)) {
        btn.classList.add("matched");
        btn.disabled = true;
      } else if (currentMatch.selectedCh === pair.key) {
        btn.classList.add("selected");
      }
      btn.addEventListener("click", () => onMatchPick("ch", pair.key, btn));
      matchChList.appendChild(btn);
    });
    updateMatchStats();
  }

  function onMatchPick(side, key, btn) {
    if (!currentMatch || currentMatch.matched.has(key)) return;
    if (side === "es") currentMatch.selectedEs = key;
    else currentMatch.selectedCh = key;

    matchEsList.querySelectorAll(".match-card").forEach((el) => {
      el.classList.toggle("selected", el.dataset.key === currentMatch.selectedEs && !el.classList.contains("matched"));
    });
    matchChList.querySelectorAll(".match-card").forEach((el) => {
      el.classList.toggle("selected", el.dataset.key === currentMatch.selectedCh && !el.classList.contains("matched"));
    });

    if (!currentMatch.selectedEs || !currentMatch.selectedCh) return;

    if (currentMatch.selectedEs === currentMatch.selectedCh) {
      currentMatch.matched.add(key);
      currentMatch.selectedEs = null;
      currentMatch.selectedCh = null;
      matchFeedback.hidden = false;
      matchFeedback.className = "learn-feedback ok";
      matchFeedback.textContent = "¡Bien!";
      renderMatchBoard();
      if (currentMatch.matched.size >= currentMatch.pairs.length) finishMatchRound();
      return;
    }

    currentMatch.mistakes += 1;
    matchFeedback.hidden = false;
    matchFeedback.className = "learn-feedback bad";
    matchFeedback.textContent = "No coinciden · probá otra vez";
    btn.classList.add("wrong");
    const esBtn = matchEsList.querySelector('.match-card.selected');
    const chBtn = matchChList.querySelector('.match-card.selected');
    if (esBtn) esBtn.classList.add("wrong");
    if (chBtn) chBtn.classList.add("wrong");
    const badEs = currentMatch.selectedEs;
    const badCh = currentMatch.selectedCh;
    currentMatch.selectedEs = null;
    currentMatch.selectedCh = null;
    updateMatchStats();
    window.setTimeout(() => {
      matchEsList.querySelectorAll(".match-card").forEach((el) => {
        el.classList.remove("wrong", "selected");
        if (el.dataset.key === badEs && !currentMatch.matched.has(el.dataset.key)) {
          /* cleared */
        }
      });
      matchChList.querySelectorAll(".match-card").forEach((el) => {
        el.classList.remove("wrong", "selected");
      });
    }, 320);
  }

  function startMatchRound() {
    if (!allMastered()) {
      window.alert("Primero dominá todas las palabras (nivel 5).");
      renderLearnHub();
      show("screenLearnHub");
      return;
    }
    const pool = shuffle(allEntries()).slice(0, Math.min(6, allEntries().length));
    if (pool.length < 2) {
      window.alert("Hacen falta más palabras en el diccionario.");
      return;
    }
    currentMatch = {
      pairs: pool.map((entry) => ({
        key: wordKey(entry),
        es: (entry.words && entry.words.es) || "?",
        chunna: entry.chunna
      })),
      matched: new Set(),
      selectedEs: null,
      selectedCh: null,
      mistakes: 0
    };
    matchActions.innerHTML = "";
    matchFeedback.hidden = true;
    matchHint.textContent = "Tocá una en español y su par en Chunna";
    renderMatchBoard();
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

  function voiceEnabled() {
    return Boolean(talkVoiceToggle && talkVoiceToggle.checked);
  }

  function loadVoicePref() {
    try {
      talkVoiceToggle.checked = localStorage.getItem(VOICE_PREF_KEY) === "1";
    } catch (_err) {
      talkVoiceToggle.checked = false;
    }
    btnTalkHear.hidden = !voiceEnabled();
  }

  function saveVoicePref() {
    try {
      localStorage.setItem(VOICE_PREF_KEY, voiceEnabled() ? "1" : "0");
    } catch (_err) {
      /* ignore */
    }
    btnTalkHear.hidden = !voiceEnabled();
  }

  function normalizePhrase(text) {
    return fold(String(text || ""))
      .replace(/[·]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function displayReply(typed) {
    const asChunna = translateEsPhrase(typed);
    if (asChunna.ok) return { es: typed, chunna: asChunna.chunna };
    return { es: typed, chunna: typed };
  }

  function replyMatches(typed, expectedEs) {
    const expected = translateEsPhrase(expectedEs);
    const nTyped = normalizePhrase(typed);
    if (!nTyped) return false;
    if (nTyped === normalizePhrase(expected.chunna)) return true;
    if (nTyped === normalizePhrase(expectedEs)) return true;
    const fromEs = translateEsPhrase(typed);
    if (fromEs.ok && normalizePhrase(fromEs.chunna) === normalizePhrase(expected.chunna)) return true;
    return false;
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
    if (role === "npc") {
      lastSpokenEs = esText;
      if (voiceEnabled()) speakEsPhrase(esText);
    } else if (voiceEnabled()) {
      speakEsPhrase(esText);
    }
  }

  function resetRecordUi() {
    stopRecording();
    lastRecorded = { es: "", chunna: "" };
    recordStatus.hidden = true;
    recordStatus.textContent = "";
    recordResult.hidden = true;
    recordResult.innerHTML = "";
    btnTalkUseRecord.hidden = true;
    btnTalkRecord.classList.remove("recording");
    btnTalkRecord.textContent = "Grabar";
  }

  function stopRecording() {
    recording = false;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch (_err) {
        /* ignore */
      }
      recognition = null;
    }
    btnTalkRecord.classList.remove("recording");
    btnTalkRecord.textContent = "Grabar";
  }

  function applyRecordedToChunna(spokenEs) {
    const result = translateSourceToChunna(spokenEs, "es");
    lastRecorded = { es: spokenEs, chunna: result.text };
    recordResult.hidden = false;
    recordResult.innerHTML =
      "<div>Texto: <strong>" +
      spokenEs +
      "</strong></div>" +
      "<div>Chunna: <span class='mono'>" +
      result.text +
      "</span></div>";
    btnTalkUseRecord.hidden = !normalizePhrase(result.text);
    if (result.missing && result.missing.length) {
      recordStatus.hidden = false;
      recordStatus.textContent =
        "Algunas palabras aún no están en Chunna: " + result.missing.join(", ");
    } else {
      recordStatus.hidden = false;
      recordStatus.textContent = "Listo: texto convertido a Chunna.";
    }
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      window.alert("Este navegador no permite grabar voz a texto. Probá Chrome en el celular.");
      return;
    }
    if (recording) {
      stopRecording();
      recordStatus.hidden = false;
      recordStatus.textContent = "Grabación detenida.";
      return;
    }
    hideChunnaKeyboard();
    recognition = new SR();
    recognition.lang = "es-AR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recording = true;
    btnTalkRecord.classList.add("recording");
    btnTalkRecord.textContent = "Detener";
    recordStatus.hidden = false;
    recordStatus.textContent = "Escuchando… hablá en español.";
    recordResult.hidden = true;
    btnTalkUseRecord.hidden = true;

    recognition.onresult = (ev) => {
      const said = ev.results && ev.results[0] && ev.results[0][0]
        ? ev.results[0][0].transcript
        : "";
      stopRecording();
      if (!normalizePhrase(said)) {
        recordStatus.hidden = false;
        recordStatus.textContent = "No se escuchó nada. Probá de nuevo.";
        return;
      }
      applyRecordedToChunna(said);
    };
    recognition.onerror = () => {
      stopRecording();
      recordStatus.hidden = false;
      recordStatus.textContent = "No se pudo grabar. Revisá el micrófono y el permiso.";
    };
    recognition.onend = () => {
      if (recording) stopRecording();
    };
    try {
      recognition.start();
    } catch (_err) {
      stopRecording();
      recordStatus.hidden = false;
      recordStatus.textContent = "No se pudo iniciar la grabación.";
    }
  }

  function useRecordedChunna() {
    if (!lastRecorded.chunna) return;
    talkInput.disabled = false;
    talkInput.value = lastRecorded.chunna;
    talkInput.dispatchEvent(new Event("input", { bubbles: true }));
    showChunnaKeyboard(talkInput);
    recordStatus.hidden = false;
    recordStatus.textContent = "Chunna cargado en el cuadro. Podés editarlo o enviar.";
  }

  function infiniteNpcReply(userEs) {
    const text = fold(userEs);
    const pools = TALK_PHRASES;
    if (/hola|amigo/.test(text)) return pools.greet[Math.floor(Math.random() * pools.greet.length)];
    if (/como|quien|estas|sos/.test(text)) return pools.ask[Math.floor(Math.random() * pools.ask.length)];
    if (/tiempo|manana|mañana/.test(text)) return pools.time[Math.floor(Math.random() * pools.time.length)];
    if (/agua|mar|dinero|idea|pais|nacion|postre|carpa/.test(text)) {
      return pools.thing[Math.floor(Math.random() * pools.thing.length)];
    }
    if (/genial|bueno|malo|miedo|nada|libre/.test(text)) {
      return pools.feel[Math.floor(Math.random() * pools.feel.length)];
    }
    const mix = pools.ask.concat(pools.feel, pools.plan, pools.greet);
    return mix[Math.floor(Math.random() * mix.length)];
  }

  function openTalkCompose(promptText) {
    talkPrompt.textContent = promptText;
    talkCompose.hidden = false;
    talkInput.disabled = false;
    btnTalkSend.disabled = false;
    talkInput.value = "";
    awaitingTalkReply = true;
    resetRecordUi();
  }

  function finishTalk(ok) {
    awaitingTalkReply = false;
    stopRecording();
    talkCompose.hidden = true;
    talkInput.value = "";
    talkInput.disabled = true;
    btnTalkSend.disabled = true;
    talkFeedback.hidden = false;
    talkFeedback.className = "learn-feedback " + (ok ? "ok" : "bad");
    if (ok) {
      const streak = markPracticeDay();
      talkFeedback.textContent = "¡Buena charla! Racha " + streak;
    } else {
      talkFeedback.textContent = "Casi. Revisá el texto y probá otra conversación.";
    }
    talkActions.innerHTML = "";
    addAction("Otra conversación", true, () => startTalk("guided"), talkActions);
    addAction("Salir", false, () => {
      stopSpeak();
      stopRecording();
      renderLearnHub();
      show("screenLearnHub");
    }, talkActions);
  }

  function playTalkTurn() {
    if (!currentTalk || currentTalk.mode !== "guided") return;
    talkActions.innerHTML = "";
    talkFeedback.hidden = true;
    talkCompose.hidden = true;
    awaitingTalkReply = false;
    while (currentTalk.turn < currentTalk.turns.length) {
      const step = currentTalk.turns[currentTalk.turn];
      const translated = translateEsPhrase(step.es);
      if (step.role === "npc") {
        appendChat("npc", step.es, translated.chunna);
        currentTalk.turn += 1;
        continue;
      }
      talkHint.textContent = currentTalk.title + " · tu turno (2 mensajes c/u)";
      currentTalk.expectedEs = step.es;
      openTalkCompose("Escribí tu respuesta en Chunna. Idea en español: “" + step.es + "”");
      talkInput.focus();
      return;
    }
    finishTalk(true);
  }

  function submitTalkReply() {
    if (!currentTalk || !awaitingTalkReply) return;
    const typed = talkInput.value;
    if (!normalizePhrase(typed)) return;
    const shown = displayReply(typed);

    if (currentTalk.mode === "infinite") {
      const contextEs =
        lastRecorded.chunna &&
        normalizePhrase(typed) === normalizePhrase(lastRecorded.chunna) &&
        lastRecorded.es
          ? lastRecorded.es
          : shown.es;
      appendChat("you", contextEs, shown.chunna);
      markPracticeDay();
      const replyEs = infiniteNpcReply(contextEs);
      const reply = translateEsPhrase(replyEs);
      window.setTimeout(() => {
        appendChat("npc", replyEs, reply.chunna);
        openTalkCompose("Charla infinita · seguí escribiendo en Chunna (o grabá para convertir).");
        talkHint.textContent = "Charla infinita · mensaje #" + (currentTalk.turn + 1);
        currentTalk.turn += 1;
        talkCountHint.textContent = "Mensajes tuyos: " + currentTalk.turn + " · sin límite";
        talkActions.innerHTML = "";
        addAction("Terminar charla", false, () => {
          const streak = markPracticeDay();
          talkFeedback.hidden = false;
          talkFeedback.className = "learn-feedback ok";
          talkFeedback.textContent = "Charla infinita guardada en la racha (" + streak + ").";
          awaitingTalkReply = false;
          talkCompose.hidden = true;
          talkActions.innerHTML = "";
          addAction("Seguir charlando", true, () => startTalk("infinite"), talkActions);
          addAction("Salir", false, () => {
            stopSpeak();
            stopRecording();
            renderLearnHub();
            show("screenLearnHub");
          }, talkActions);
        }, talkActions);
      }, 350);
      talkInput.value = "";
      resetRecordUi();
      return;
    }

    const expectedEs = currentTalk.expectedEs;
    appendChat("you", shown.es, shown.chunna);
    if (!replyMatches(typed, expectedEs)) {
      const right = translateEsPhrase(expectedEs);
      talkFeedback.hidden = false;
      talkFeedback.className = "learn-feedback bad";
      talkFeedback.textContent = "Casi. Podía ser: " + right.chunna + " (“" + expectedEs + "”)";
      finishTalk(false);
      return;
    }
    currentTalk.turn += 1;
    if (currentTalk.turn >= currentTalk.turns.length) {
      finishTalk(true);
      return;
    }
    playTalkTurn();
  }

  function startTalk(mode) {
    if (!allMastered()) {
      window.alert("Primero dominá todas las palabras (nivel 5).");
      renderLearnHub();
      show("screenLearnHub");
      return;
    }
    stopSpeak();
    stopRecording();
    loadVoicePref();
    talkMode = mode === "infinite" ? "infinite" : "guided";
    chatLog.innerHTML = "";
    talkFeedback.hidden = true;
    talkActions.innerHTML = "";
    talkInput.value = "";
    talkInput.disabled = false;
    btnTalkSend.disabled = false;
    resetRecordUi();

    if (talkMode === "infinite") {
      talkTypeWrap.hidden = true;
      talkTitle.textContent = "Charla infinita";
      currentTalk = {
        mode: "infinite",
        title: "Charla infinita",
        turns: [],
        turn: 0,
        expectedEs: ""
      };
      talkHint.textContent = "Sin fin · texto + grabar → Chunna";
      talkCountHint.textContent = "Mensajes tuyos: 0 · sin límite";
      const hello = translateEsPhrase("hola amigo");
      appendChat("npc", "hola amigo", hello.chunna);
      openTalkCompose("Respondé en Chunna. También podés grabar en español y convertirlo.");
      return;
    }

    talkTypeWrap.hidden = false;
    talkTitle.textContent = "Conversaciones";
    if (!talkTypeSelect.options.length) fillTalkTypes();
    const script = pickTalkScript();
    currentTalk = {
      mode: "guided",
      title: script.title,
      turns: script.turns,
      turn: 0,
      expectedEs: "",
      typeId: script.typeId,
      index: script.index
    };
    talkHint.textContent = script.title + " · 2 mensajes cada uno";
    talkCountHint.textContent =
      currentTalkType().title + ": opción " + (script.index + 1) + " de " + TALK_PER_TYPE;
    playTalkTurn();
  }

  async function loadDict() {
    const res = await fetch("dictionary.json?v=ci15", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el diccionario Chunna");
    dict = await res.json();
    buildChunnaKeyboard();
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
    fillTalkTypes();
    show("screenTalk");
    startTalk("guided");
  });
  document.getElementById("btnInfiniteTalk").addEventListener("click", () => {
    show("screenTalk");
    startTalk("infinite");
  });
  document.getElementById("btnMatch").addEventListener("click", () => {
    show("screenMatch");
    startMatchRound();
  });
  talkTypeSelect.addEventListener("change", () => {
    talkCountHint.textContent =
      currentTalkType().title + ": 1000 opciones distintas · tocá “Otra conversación”";
    startTalk("guided");
  });
  talkVoiceToggle.addEventListener("change", () => {
    saveVoicePref();
    if (!voiceEnabled()) stopSpeak();
  });
  btnTalkSend.addEventListener("click", submitTalkReply);
  talkInput.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      submitTalkReply();
    }
  });
  btnTalkHear.addEventListener("click", () => {
    if (lastSpokenEs) speakEsPhrase(lastSpokenEs);
  });
  btnTalkRecord.addEventListener("click", startRecording);
  btnTalkUseRecord.addEventListener("click", useRecordedChunna);
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
    stopSpeak();
    stopRecording();
    hideChunnaKeyboard();
    renderLearnHub();
    show("screenLearnHub");
  });
  document.getElementById("btnBackMatch").addEventListener("click", () => {
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
  textSource.addEventListener("focus", hideChunnaKeyboard);
  textChunna.addEventListener("input", syncFromChunna);
  bindChunnaField(textChunna);
  bindChunnaField(talkInput);
  btnKbClose.addEventListener("click", hideChunnaKeyboard);
  chunnaKeyboard.querySelectorAll("[data-kb]").forEach((btn) => {
    btn.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      const action = btn.getAttribute("data-kb");
      if (action === "space") insertKbText(" ");
      else if (action === "back") kbBackspace();
      else if (action === "enter") kbEnter();
    });
  });
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
