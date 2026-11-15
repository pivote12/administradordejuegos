(function () {
  "use strict";

  const STORAGE_KEY = "bloc-de-notas-v1";
  const SL = window.SymbolLetters;

  GameI18n.init("bloc-de-notas");

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenNotes: document.getElementById("screenNotes"),
    notesArea: document.getElementById("notesArea"),
    savedHint: document.getElementById("savedHint"),
    symbolBar: document.getElementById("symbolBar"),
    symbolInsertList: document.getElementById("symbolInsertList")
  };

  function insertLetter(sym) {
    if (!sym || !sym.char) return;
    const area = ui.notesArea;
    area.focus();
    const start = area.selectionStart || 0;
    const end = area.selectionEnd || 0;
    const value = area.value || "";
    area.value = value.slice(0, start) + sym.char + value.slice(end);
    const next = start + sym.char.length;
    area.setSelectionRange(next, next);
  }

  function renderSymbolBar() {
    const symbols = SL.loadSymbols();
    ui.symbolInsertList.innerHTML = "";
    ui.symbolBar.hidden = symbols.length === 0;
    symbols.forEach((sym) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "letter-chip";
      btn.title = "Escribir esta letra";
      btn.textContent = sym.char;
      SL.applyFontStyle(btn);
      btn.addEventListener("click", () => insertLetter(sym));
      ui.symbolInsertList.appendChild(btn);
    });
  }

  function load() {
    let text = "";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) text = JSON.parse(raw).text || "";
    } catch (_err) {
      text = "";
    }
    ui.notesArea.value = SL.migrateTextToLetters(text);
    SL.applyFontStyle(ui.notesArea);
    renderSymbolBar();
    SL.ensureFont(true)
      .then(() => {
        SL.applyFontStyle(ui.notesArea);
        ui.symbolInsertList.querySelectorAll(".letter-chip").forEach((el) => SL.applyFontStyle(el));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ text: SL.migrateTextToLetters(ui.notesArea.value || "") })
    );
    ui.savedHint.hidden = false;
    window.setTimeout(() => {
      ui.savedHint.hidden = true;
    }, 1500);
  }

  function showScreen(name) {
    ui.screenTitle.classList.toggle("active", name === "title");
    ui.screenNotes.classList.toggle("active", name === "notes");
  }

  document.getElementById("btnPlay").addEventListener("click", () => {
    load();
    showScreen("notes");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => showScreen("title"));
  document.getElementById("btnSave").addEventListener("click", save);

  GameI18n.onChange(() => GameI18n.applyDom());

  if (/\/Juegos\//i.test(decodeURIComponent(location.pathname))) {
    document.getElementById("btnBackAdmin").hidden = false;
  }
})();
