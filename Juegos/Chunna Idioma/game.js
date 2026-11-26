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
    const parts = splitKeeping(text);
    const out = parts.map((part) => {
      if (!part) return part;
      if (/^\s+$/.test(part) || SKIP_PUNCT.test(part[0])) return part;
      const entry = toChunna.get(fold(part));
      if (!entry) return part;
      hits.push(entry);
      return entry.chunna;
    });
    return { text: out.join(""), hits: hits };
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

  function syncFromSource() {
    if (!dict || lock) return;
    lock = true;
    try {
      const result = translateSourceToChunna(textSource.value, currentLang());
      textChunna.value = result.text;
      lastHits = result.hits;
      btnSpeak.disabled = lastHits.length === 0;
      renderSpeakPreview();
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

  async function loadDict() {
    const res = await fetch("dictionary.json?v=ci2", { cache: "no-store" });
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
    show("screenTranslate");
    textSource.focus();
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
  });

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () { /* cache voices */ };
  }

  loadDict()
    .then(() => {
      // listo para traducir de una
    })
    .catch((err) => {
      window.alert(err.message || "Error cargando Chunna");
    });
})();
