(function () {
  "use strict";

  const STORAGE_KEY = "bloc-de-notas-v1";

  GameI18n.init("bloc-de-notas");

  const ui = {
    screenTitle: document.getElementById("screenTitle"),
    screenNotes: document.getElementById("screenNotes"),
    notesArea: document.getElementById("notesArea"),
    savedHint: document.getElementById("savedHint"),
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) ui.notesArea.value = JSON.parse(raw).text || "";
    } catch {
      ui.notesArea.value = "";
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: ui.notesArea.value }));
    ui.savedHint.hidden = false;
    window.setTimeout(() => { ui.savedHint.hidden = true; }, 1500);
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
