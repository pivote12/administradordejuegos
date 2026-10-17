(function () {
  "use strict";

  function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeGender(value) {
    return value === "male" || value === "female" ? value : "";
  }

  function normalizePack(pack, index) {
    return {
      id: (pack && pack.id) || makeId("pack"),
      name: String((pack && pack.name) || ("Pack " + (index + 1))).slice(0, 24),
      updatedAt: Number(pack && pack.updatedAt) || 0,
      marbles: Array.isArray(pack && pack.marbles)
        ? pack.marbles.filter(function (marble) { return marble && marble.name; }).map(function (marble) {
          return {
            id: marble.id || makeId("pm"),
            name: String(marble.name).slice(0, 100),
            color: marble.color || "#55d6ff",
            gender: normalizeGender(marble.gender),
            partnerId: typeof marble.partnerId === "string" ? marble.partnerId : ""
          };
        })
        : []
    };
  }

  function loadAll() {
    return (window.SharedPacks ? SharedPacks.load() : []).map(normalizePack);
  }

  function saveAll(list) {
    if (!window.SharedPacks) return list;
    return SharedPacks.save(list.map(normalizePack)).map(normalizePack);
  }

  var packs = loadAll();
  var editingId = null;
  var draft = [];
  var genderOpen = false;

  var ui = {
    list: document.getElementById("packsScreen"),
    editor: document.getElementById("packEditorScreen"),
    packList: document.getElementById("packList"),
    empty: document.getElementById("emptyPacks"),
    title: document.getElementById("packEditorTitle"),
    name: document.getElementById("packName"),
    form: document.getElementById("packMarbleForm"),
    marbleName: document.getElementById("packMarbleName"),
    marbleColor: document.getElementById("packMarbleColor"),
    draftList: document.getElementById("packDraftList"),
    emptyDraft: document.getElementById("emptyPackDraft"),
    genderNeed: document.getElementById("packGenderNeed"),
    genderPanel: document.getElementById("packGenderPanel"),
    genderList: document.getElementById("packGenderList")
  };

  function show(which) {
    ui.list.classList.toggle("active", which === "list");
    ui.editor.classList.toggle("active", which === "editor");
  }

  function renderList() {
    packs = loadAll();
    ui.packList.innerHTML = "";
    ui.empty.hidden = packs.length > 0;
    packs.forEach(function (pack) {
      var row = document.createElement("div");
      row.className = "pack-row";
      row.innerHTML = "<div><strong></strong><span></span></div>";
      row.querySelector("strong").textContent = pack.name;
      row.querySelector("span").textContent = pack.marbles.length + " pelota(s)";
      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "button secondary compact";
      edit.textContent = "Editar";
      edit.addEventListener("click", function () { openEditor(pack.id); });
      row.appendChild(edit);
      ui.packList.appendChild(row);
    });
  }

  function missingGender() {
    return draft.filter(function (marble) { return !normalizeGender(marble.gender); });
  }

  function renderDraft() {
    ui.draftList.innerHTML = "";
    ui.emptyDraft.hidden = draft.length > 0;
    draft.forEach(function (marble) {
      var row = document.createElement("div");
      row.className = "pack-draft-row";
      var g = normalizeGender(marble.gender);
      row.innerHTML = '<i class="mini-marble" style="background:' + marble.color + '"></i><div class="pack-draft-meta"><strong></strong><span class="pack-draft-gender' + (g ? "" : " missing") + '"></span></div>';
      row.querySelector("strong").textContent = marble.name;
      row.querySelector("span").textContent = g === "male" ? "Masculino" : g === "female" ? "Femenino" : "Sin género";
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pack-remove-marble";
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        draft = draft.filter(function (item) { return item.id !== marble.id; });
        renderDraft();
        renderGender();
      });
      row.appendChild(remove);
      ui.draftList.appendChild(row);
    });
  }

  function renderGender() {
    ui.genderPanel.hidden = !genderOpen || !draft.length;
    ui.genderList.innerHTML = "";
    if (ui.genderPanel.hidden) return;
    draft.forEach(function (marble) {
      var row = document.createElement("div");
      row.className = "pack-gender-row";
      var chosen = normalizeGender(marble.gender);
      row.innerHTML = '<i class="mini-marble" style="background:' + marble.color + '"></i><strong></strong>';
      row.querySelector("strong").textContent = marble.name;
      ["male", "female"].forEach(function (value) {
        var pick = document.createElement("button");
        pick.type = "button";
        pick.className = "pack-gender-pick" + (chosen === value ? " on" : "");
        pick.textContent = value === "male" ? "♂ Masculino" : "♀ Femenino";
        pick.addEventListener("click", function () {
          marble.gender = value;
          if (ui.genderNeed) ui.genderNeed.hidden = true;
          renderDraft();
          renderGender();
        });
        row.appendChild(pick);
      });
      ui.genderList.appendChild(row);
    });
  }

  function openEditor(packId) {
    var pack = packs.find(function (item) { return item.id === packId; }) || null;
    editingId = pack ? pack.id : null;
    draft = pack ? pack.marbles.map(function (marble) { return Object.assign({}, marble); }) : [];
    ui.name.value = pack ? pack.name : "";
    ui.title.textContent = pack ? "Editar Pack" : "Crear Pack";
    genderOpen = draft.some(function (marble) { return !normalizeGender(marble.gender); });
    if (ui.genderNeed) ui.genderNeed.hidden = true;
    renderDraft();
    renderGender();
    show("editor");
  }

  function savePack() {
    var name = ui.name.value.trim();
    if (!name) {
      ui.name.focus();
      return;
    }
    var missing = missingGender();
    if (missing.length) {
      genderOpen = true;
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Asigná el género de las " + missing.length + " pelota(s) antes de guardar.";
      renderGender();
      return;
    }
    var next = loadAll();
    var payload = normalizePack({
      id: editingId || makeId("pack"),
      name: name,
      updatedAt: Date.now(),
      marbles: draft
    }, next.length);
    var existing = next.find(function (pack) { return pack.id === payload.id; });
    if (existing) {
      existing.name = payload.name;
      existing.marbles = payload.marbles;
    } else {
      next.push(payload);
    }
    packs = saveAll(next);
    renderList();
    show("list");
  }

  document.getElementById("newPackButton").addEventListener("click", function () { openEditor(null); });
  document.getElementById("cancelPackEditor").addEventListener("click", function () {
    if (missingGender().length && draft.length) {
      genderOpen = true;
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Asigná el género antes de salir, o borré las pelotas sin género.";
      renderGender();
      return;
    }
    show("list");
  });
  document.getElementById("packGenderButton").addEventListener("click", function () {
    if (!draft.length) {
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Primero agregá pelotas al pack.";
      return;
    }
    genderOpen = true;
    ui.genderNeed.hidden = true;
    renderGender();
  });
  document.getElementById("savePackButton").addEventListener("click", savePack);
  ui.form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = ui.marbleName.value.trim();
    if (!name) return;
    draft.push({
      id: makeId("pm"),
      name: name.slice(0, 100),
      color: ui.marbleColor.value,
      gender: "",
      partnerId: ""
    });
    ui.marbleName.value = "";
    renderDraft();
    renderGender();
    ui.marbleName.focus();
  });

  renderList();
})();
