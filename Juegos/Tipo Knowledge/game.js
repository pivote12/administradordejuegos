(function () {
  "use strict";

  const STORAGE_KEY = "tipo-knowledge-v1";
  const OLD_STORAGE_KEY = "tipo-knowwledge-v1";
  const CANVAS_BG = "#0f1424";
  const FIRST = ["Lumi", "Nube", "Kira", "Soli", "Pera", "Tito", "Mora", "Dali", "Foco", "Gala", "Hilo", "Iris", "Jade", "Luz", "Mimi", "Nilo", "Ona", "Pipo", "Quina", "Roco", "Sami", "Tilo", "Uma", "Vito", "Wini", "Xena", "Yara", "Zeta", "Cora", "Dina"];

  GameI18n.init("tipo-knowledge");

  const ui = {
    places: document.getElementById("screenPlaces"),
    place: document.getElementById("screenPlace"),
    form: document.getElementById("placeForm"),
    placeName: document.getElementById("placeName"),
    placeList: document.getElementById("placeList"),
    noPlaces: document.getElementById("noPlaces"),
    back: document.getElementById("btnBackPlace"),
    placeTitle: document.getElementById("placeTitle"),
    tabs: document.getElementById("placeTabs"),
    body: document.getElementById("placeBody")
  };

  let state = loadState();
  if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(OLD_STORAGE_KEY)) persist();
  let currentId = "";
  let view = "places";
  let selectedPackId = "";
  let run = null;
  let lastResult = null;
  let showResetNote = false;

  function t(key, vars) {
    return GameI18n.t(key, vars);
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function blankQuestions() {
    const list = [];
    for (let i = 0; i < 15; i += 1) list.push({ text: "", options: ["", "", "", ""] });
    return list;
  }

  function normalizePlace(raw) {
    const questions = blankQuestions();
    const incoming = Array.isArray(raw.questions) ? raw.questions : [];
    for (let i = 0; i < 15; i += 1) {
      const question = incoming[i] || {};
      const options = Array.isArray(question.options) ? question.options : [];
      questions[i] = {
        text: String(question.text || "").slice(0, 180),
        options: [0, 1, 2, 3].map((index) => String(options[index] || "").slice(0, 80))
      };
    }
    const profiles = {};
    if (raw.profiles && typeof raw.profiles === "object") {
      Object.keys(raw.profiles).forEach((key) => {
        const value = raw.profiles[key];
        if (Array.isArray(value) && value.length === 15) profiles[key] = value.map((item) => Number(item) || 0);
      });
    }
    return {
      id: String(raw.id),
      name: String(raw.name || "Lugar").slice(0, 40),
      types: Array.isArray(raw.types) ? raw.types.filter((item) => item && item.id).map((item) => ({
        id: String(item.id),
        name: String(item.name || "").slice(0, 24),
        color: item.color || "#7c3aed",
        logo: typeof item.logo === "string" ? item.logo : ""
      })) : [],
      questions,
      profiles,
      assignments: raw.assignments && typeof raw.assignments === "object" ? raw.assignments : {},
      generated: Array.isArray(raw.generated) ? raw.generated.filter((item) => item && item.id).map((item) => ({
        id: String(item.id),
        name: String(item.name || "Pelotita").slice(0, 32),
        color: item.color || "#55d6ff",
        typeId: item.typeId || ""
      })) : []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : { places: [] };
      const places = Array.isArray(data.places) ? data.places.filter((item) => item && item.id).map(normalizePlace) : [];
      return { places };
    } catch (_err) {
      return { places: [] };
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_err) {
      /* quota */
    }
  }

  function currentPlace() {
    return state.places.find((item) => item.id === currentId) || null;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function questionReady(question) {
    return !!(question.text.trim() && question.options.every((option) => String(option).trim()));
  }

  function readyCount(place) {
    return place.questions.filter(questionReady).length;
  }

  function questionsReady(place) {
    return readyCount(place) === 15;
  }

  function profileOf(place, typeId) {
    const profile = place.profiles[typeId];
    return Array.isArray(profile) && profile.length === 15 ? profile : null;
  }

  function typeFinished(place, type) {
    return !!profileOf(place, type.id);
  }

  function pendingTypes(place) {
    return place.types.filter((type) => !typeFinished(place, type));
  }

  function setupReady(place) {
    return place.types.length > 0 && questionsReady(place) && pendingTypes(place).length === 0;
  }

  function loadPacks() {
    if (!window.SharedPacks) return [];
    return SharedPacks.load().filter((pack) => pack && pack.id).map((pack) => ({
      id: pack.id,
      name: pack.name || "Pack",
      marbles: (pack.marbles || []).filter((marble) => marble && marble.id && marble.name)
    }));
  }

  function marbleKey(packId, marbleId) {
    return packId + "::" + marbleId;
  }

  function typeById(place, id) {
    return place.types.find((type) => type.id === id) || null;
  }

  function marbleStats(place) {
    let total = 0;
    let done = 0;
    loadPacks().forEach((pack) => {
      pack.marbles.forEach((marble) => {
        total += 1;
        const typeId = place.assignments[marbleKey(pack.id, marble.id)];
        if (typeId && typeById(place, typeId)) done += 1;
      });
    });
    return { total, done, all: done === total };
  }

  function matchType(place, picks) {
    let best = null;
    let bestScore = -1;
    place.types.forEach((type) => {
      const profile = profileOf(place, type.id);
      if (!profile) return;
      let score = 0;
      for (let i = 0; i < 15; i += 1) {
        if (profile[i] === picks[i]) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = type;
      }
    });
    return best;
  }

  function clearProfiles(place) {
    const had = Object.keys(place.profiles).length || Object.keys(place.assignments).length || place.generated.length;
    if (!had) return false;
    place.profiles = {};
    place.assignments = {};
    place.generated = [];
    return true;
  }

  function showScreen(which) {
    ui.places.classList.toggle("active", which === "places");
    ui.place.classList.toggle("active", which === "place");
  }

  function renderPlaces() {
    ui.placeList.innerHTML = "";
    ui.noPlaces.hidden = state.places.length > 0;
    state.places.forEach((place) => {
      const row = el("li", "place-row card");
      const info = el("div", "place-info");
      info.appendChild(el("strong", "", place.name));
      info.appendChild(el("span", "", t("tabTypes") + ": " + place.types.length));
      const actions = el("div", "row-actions");
      const open = el("button", "btn primary", t("openPlace"));
      open.type = "button";
      open.addEventListener("click", () => openPlace(place.id));
      const remove = el("button", "btn ghost danger", t("deletePlace"));
      remove.type = "button";
      remove.addEventListener("click", () => deletePlace(place.id));
      actions.append(open, remove);
      row.append(info, actions);
      ui.placeList.appendChild(row);
    });
  }

  function deletePlace(id) {
    if (!confirm(t("confirmDeletePlace"))) return;
    state.places = state.places.filter((place) => place.id !== id);
    if (currentId === id) currentId = "";
    persist();
    renderPlaces();
  }

  function openPlace(id) {
    currentId = id;
    view = "types";
    run = null;
    showResetNote = false;
    showScreen("place");
    renderPlace();
  }

  function renderPlace() {
    const place = currentPlace();
    if (!place) {
      showScreen("places");
      renderPlaces();
      return;
    }
    ui.placeTitle.textContent = place.name;
    renderTabs(place);
    ui.body.innerHTML = "";
    if (view === "types") renderTypes(place);
    else if (view === "questions") renderQuestions(place);
    else if (view === "answers") renderAnswers(place);
    else if (view === "packs") renderPacks(place);
    else if (view === "packMarbles") renderPackMarbles(place);
    else if (view === "quiz") renderQuiz(place);
    else if (view === "result") renderResult(place);
  }

  function renderTabs() {
    const tabs = [
      ["types", "tabTypes"],
      ["questions", "tabQuestions"],
      ["answers", "tabAnswers"],
      ["packs", "tabMarbles"]
    ];
    ui.tabs.innerHTML = "";
    ui.tabs.hidden = view === "quiz" || view === "result";
    tabs.forEach((entry) => {
      const id = entry[0];
      const button = el("button", "tab" + (view === id || (id === "packs" && view === "packMarbles") ? " on" : ""), t(entry[1]));
      button.type = "button";
      button.addEventListener("click", () => {
        run = null;
        view = id;
        renderPlace();
      });
      ui.tabs.appendChild(button);
    });
  }

  function renderTypes(place) {
    ui.body.appendChild(el("p", "hint", t("typesHint")));
    const form = el("form", "card type-form");
    const name = document.createElement("input");
    name.id = "typeName";
    name.maxLength = 24;
    name.placeholder = t("typeNamePh");
    name.autocomplete = "off";
    const colorLabel = el("label", "color-field");
    colorLabel.appendChild(el("span", "", t("colorLabel")));
    const color = document.createElement("input");
    color.type = "color";
    color.value = "#7c3aed";
    colorLabel.appendChild(color);
    const logoLabel = el("p", "hint", t("logoLabel"));
    const canvas = document.createElement("canvas");
    canvas.className = "logo-canvas";
    canvas.width = 320;
    canvas.height = 180;
    canvas.setAttribute("aria-label", t("logoLabel"));
    const ctx = canvas.getContext("2d");
    const tools = el("div", "tool-row");
    const brush = el("button", "btn compact on", t("brush"));
    const eraser = el("button", "btn compact", t("eraser"));
    const clear = el("button", "btn ghost compact", t("clearLogo"));
    brush.type = "button";
    eraser.type = "button";
    clear.type = "button";
    tools.append(brush, eraser, clear);
    const error = el("p", "field-error", "");
    const add = el("button", "btn primary", t("addType"));
    add.type = "submit";
    form.append(name, colorLabel, logoLabel, canvas, tools, error, add);
    ui.body.appendChild(form);

    let mode = "draw";
    let drawing = false;
    let last = null;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 8;

    function paintBackground() {
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    paintBackground();

    function pointOf(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function strokeTo(point) {
      ctx.strokeStyle = mode === "erase" ? CANVAS_BG : color.value;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = mode === "erase" ? 18 : 8;
      if (!last) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      last = point;
    }

    canvas.addEventListener("pointerdown", (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      strokeTo(pointOf(event));
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      strokeTo(pointOf(event));
    });
    function stopDraw() {
      drawing = false;
      last = null;
    }
    canvas.addEventListener("pointerup", stopDraw);
    canvas.addEventListener("pointercancel", stopDraw);

    function setMode(next) {
      mode = next;
      brush.classList.toggle("on", next === "draw");
      eraser.classList.toggle("on", next === "erase");
    }
    brush.addEventListener("click", () => setMode("draw"));
    eraser.addEventListener("click", () => setMode("erase"));
    clear.addEventListener("click", paintBackground);
    color.addEventListener("input", () => setMode("draw"));

    const list = el("div", "type-list");
    list.id = "typeList";
    ui.body.appendChild(list);

    function renderTypeList() {
      list.innerHTML = "";
      if (!place.types.length) {
        list.appendChild(el("p", "empty", t("noTypes")));
        return;
      }
      place.types.forEach((type) => {
        const card = el("article", "card type-card");
        if (type.logo) {
          const image = el("img", "logo");
          image.src = type.logo;
          image.alt = "";
          card.appendChild(image);
        }
        const meta = el("div", "type-meta");
        const title = el("strong", "", type.name + " ");
        const swatch = el("i", "swatch");
        swatch.style.background = type.color;
        title.appendChild(swatch);
        meta.appendChild(title);
        const remove = el("button", "btn ghost danger compact", t("deleteType"));
        remove.type = "button";
        remove.addEventListener("click", () => deleteType(place, type.id));
        card.append(meta, remove);
        list.appendChild(card);
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const typeName = name.value.trim();
      if (!typeName) {
        error.textContent = t("needTypeName");
        name.focus();
        return;
      }
      error.textContent = "";
      place.types.push({
        id: makeId("tipo"),
        name: typeName.slice(0, 24),
        color: color.value,
        logo: canvas.toDataURL("image/jpeg", 0.72)
      });
      persist();
      name.value = "";
      paintBackground();
      renderTypeList();
    });
    renderTypeList();
  }

  function deleteType(place, id) {
    if (!confirm(t("confirmDeleteType"))) return;
    place.types = place.types.filter((type) => type.id !== id);
    delete place.profiles[id];
    Object.keys(place.assignments).forEach((key) => {
      if (place.assignments[key] === id) delete place.assignments[key];
    });
    place.generated = place.generated.filter((item) => item.typeId !== id);
    persist();
    renderPlace();
  }

  function renderQuestions(place) {
    ui.body.appendChild(el("p", "hint", t("questionsHint")));
    const note = el("p", "warn", t("resetBecauseQuestions"));
    note.id = "qNote";
    note.hidden = !showResetNote;
    const count = el("p", "count-line", t("questionsCount", { n: readyCount(place) }));
    count.id = "qCount";
    ui.body.append(note, count);
    place.questions.forEach((question, index) => {
      const card = el("article", "card q-card");
      card.appendChild(el("h3", "", t("questionN", { n: index + 1 })));
      const text = document.createElement("textarea");
      text.className = "q-text";
      text.rows = 2;
      text.maxLength = 180;
      text.value = question.text;
      card.appendChild(text);
      const options = question.options.map((option, optionIndex) => {
        const input = document.createElement("input");
        input.className = "q-opt";
        input.maxLength = 80;
        input.placeholder = t("optionN", { n: optionIndex + 1 });
        input.value = option;
        card.appendChild(input);
        return input;
      });
      function commit() {
        question.text = text.value.slice(0, 180);
        options.forEach((input, optionIndex) => {
          question.options[optionIndex] = input.value.slice(0, 80);
        });
        if (clearProfiles(place)) showResetNote = true;
        persist();
        count.textContent = t("questionsCount", { n: readyCount(place) });
        note.hidden = !showResetNote;
      }
      text.addEventListener("input", commit);
      options.forEach((input) => input.addEventListener("input", commit));
      ui.body.appendChild(card);
    });
  }

  function renderAnswers(place) {
    ui.body.appendChild(el("p", "hint", t("answersHint")));
    if (!place.types.length) ui.body.appendChild(el("p", "warn", t("lockedNeedTypes")));
    if (!questionsReady(place)) ui.body.appendChild(el("p", "warn", t("lockedNeedQuestions")));
    if (!place.types.length || !questionsReady(place)) return;
    const list = el("div", "answer-list");
    place.types.forEach((type) => {
      const card = el("article", "card answer-card");
      if (type.logo) {
        const image = el("img", "logo");
        image.src = type.logo;
        image.alt = "";
        card.appendChild(image);
      }
      const meta = el("div", "answer-meta");
      meta.appendChild(el("strong", "", type.name));
      const done = typeFinished(place, type);
      meta.appendChild(el("span", "", done ? t("roundDone") : t("roundPending")));
      const button = el("button", done ? "btn ghost compact" : "btn primary compact", done ? t("redoRounds") : t("startRound"));
      button.type = "button";
      button.addEventListener("click", () => {
        if (done && !confirm(t("confirmRedo"))) return;
        if (done) {
          delete place.profiles[type.id];
          persist();
        }
        startTypeQuiz(type);
      });
      card.append(meta, button);
      list.appendChild(card);
    });
    ui.body.appendChild(list);
  }

  function renderPacks(place) {
    ui.body.appendChild(el("h2", "", t("menuPacks")));
    ui.body.appendChild(el("p", "hint", t("packsHint")));
    const ready = setupReady(place);
    if (!ready) {
      const box = el("div", "card lock");
      if (!place.types.length) box.appendChild(el("p", "", t("lockedNeedTypes")));
      if (!questionsReady(place)) box.appendChild(el("p", "", t("lockedNeedQuestions")));
      const pending = pendingTypes(place);
      if (place.types.length && questionsReady(place) && pending.length) {
        box.appendChild(el("p", "", t("lockedNeedAnswers", { names: pending.map((type) => type.name).join(", ") })));
      }
      ui.body.appendChild(box);
    }
    const stats = ready ? marbleStats(place) : null;
    if (ready && stats.all) {
      const blue = el("button", "btn infinite", t("infiniteBtn"));
      blue.type = "button";
      blue.addEventListener("click", startGenerated);
      ui.body.appendChild(blue);
      ui.body.appendChild(el("p", "hint", t("infiniteHint")));
      ui.body.appendChild(el("p", "count-line", t("generatedCount", { n: place.generated.length })));
      if (place.generated.length) {
        const list = el("div", "gen-list");
        place.generated.slice().reverse().slice(0, 24).forEach((item) => {
          const row = el("div", "gen-row");
          const dot = el("i", "dot");
          dot.style.background = item.color;
          const type = typeById(place, item.typeId);
          row.append(dot, el("span", "", item.name + (type ? " · " + type.name : "")));
          list.appendChild(row);
        });
        ui.body.appendChild(list);
      }
    } else if (ready) {
      ui.body.appendChild(el("p", "warn", t("missingMarbles", { n: stats.total - stats.done })));
    }
    const packs = loadPacks();
    if (!packs.length) {
      ui.body.appendChild(el("p", "empty", t("noPacks")));
      return;
    }
    const grid = el("div", "pack-grid");
    packs.forEach((pack) => {
      const button = el("button", "pack-btn");
      button.type = "button";
      button.disabled = !ready;
      button.append(el("strong", "", pack.name), el("small", "", t("packCount", { n: pack.marbles.length })));
      if (ready) {
        button.addEventListener("click", () => {
          selectedPackId = pack.id;
          view = "packMarbles";
          renderPlace();
        });
      }
      grid.appendChild(button);
    });
    ui.body.appendChild(grid);
  }

  function renderPackMarbles(place) {
    const pack = loadPacks().find((item) => item.id === selectedPackId);
    if (!pack) {
      view = "packs";
      renderPlace();
      return;
    }
    ui.body.appendChild(el("h2", "section-title", pack.name));
    if (marbleStats(place).all) {
      const blue = el("button", "btn infinite", t("infiniteBtn"));
      blue.type = "button";
      blue.addEventListener("click", startGenerated);
      ui.body.appendChild(blue);
    }
    if (!pack.marbles.length) {
      ui.body.appendChild(el("p", "empty", t("emptyPack")));
      return;
    }
    const grid = el("div", "marble-grid");
    pack.marbles.forEach((marble) => {
      const assigned = typeById(place, place.assignments[marbleKey(pack.id, marble.id)]);
      const button = el("button", "marble-btn " + (assigned ? "done" : "open"));
      button.type = "button";
      const dot = el("i", "dot");
      dot.style.background = marble.color || "#ffffff";
      button.append(dot, el("strong", "", marble.name));
      if (assigned) {
        button.disabled = true;
        button.appendChild(el("small", "", t("marbleTyped", { name: assigned.name })));
        if (assigned.logo) {
          const image = el("img", "mini-logo");
          image.src = assigned.logo;
          image.alt = "";
          button.appendChild(image);
        }
      } else {
        button.addEventListener("click", () => startMarble(pack, marble));
      }
      grid.appendChild(button);
    });
    ui.body.appendChild(grid);
  }

  function startTypeQuiz(type) {
    run = { kind: "type", typeId: type.id, from: "answers", q: 0, picks: [], name: type.name, color: type.color, logo: type.logo };
    view = "quiz";
    renderPlace();
  }

  function startMarble(pack, marble) {
    run = {
      kind: "marble",
      packId: pack.id,
      marbleId: marble.id,
      from: "packMarbles",
      q: 0,
      picks: [],
      name: marble.name,
      color: marble.color || "#55d6ff"
    };
    view = "quiz";
    renderPlace();
  }

  function makeGenerated(place) {
    const index = place.generated.length;
    const base = FIRST[index % FIRST.length];
    const wave = Math.floor(index / FIRST.length);
    const hue = Math.round((index * 137.508) % 360);
    return {
      id: makeId("gen"),
      name: wave === 0 ? base : base + " " + (wave + 1),
      color: "hsl(" + hue + " 72% 58%)",
      typeId: ""
    };
  }

  function startGenerated() {
    const place = currentPlace();
    if (!place) return;
    const marble = makeGenerated(place);
    run = { kind: "generated", marble, from: "packs", q: 0, picks: [], name: marble.name, color: marble.color };
    view = "quiz";
    renderPlace();
  }

  function renderQuiz(place) {
    if (!run || !questionsReady(place)) {
      view = "answers";
      renderPlace();
      return;
    }
    const question = place.questions[run.q];
    const card = el("article", "card quiz-card");
    const dot = el("i", "dot");
    dot.style.background = run.color || "#c4b5fd";
    const who = el("p", "hint");
    who.append(dot, document.createTextNode(" " + (run.kind === "type"
      ? t("quizAsType", { name: run.name })
      : run.kind === "generated"
        ? t("quizAsGenerated", { name: run.name })
        : t("quizAsMarble", { n: run.q + 1, name: run.name }))));
    card.append(el("h2", "", t("quizProgress", { n: run.q + 1 })), who, el("p", "", question.text));
    const options = el("div", "option-list");
    question.options.forEach((option, index) => {
      const button = el("button", "option-btn" + (run.picks[run.q] === index ? " on" : ""), option);
      button.type = "button";
      button.addEventListener("click", () => chooseOption(index));
      options.appendChild(button);
    });
    const actions = el("div", "quiz-actions");
    if (run.q > 0) {
      const prev = el("button", "btn ghost", t("prevQuestion"));
      prev.type = "button";
      prev.addEventListener("click", () => {
        run.q -= 1;
        renderPlace();
      });
      actions.appendChild(prev);
    }
    const cancel = el("button", "btn ghost", t("cancelQuiz"));
    cancel.type = "button";
    cancel.addEventListener("click", leaveQuiz);
    actions.appendChild(cancel);
    card.append(options, actions);
    ui.body.appendChild(card);
  }

  function chooseOption(index) {
    if (!run) return;
    run.picks[run.q] = index;
    run.q += 1;
    if (run.q >= 15) finishRun();
    else renderPlace();
  }

  function finishRun() {
    const place = currentPlace();
    if (!place || !run) return;
    const picks = [];
    for (let i = 0; i < 15; i += 1) picks.push(Number(run.picks[i]) || 0);
    if (run.kind === "type") {
      place.profiles[run.typeId] = picks;
      run = null;
      persist();
      view = "answers";
      renderPlace();
      return;
    }
    const type = matchType(place, picks);
    if (!type) {
      run = null;
      view = "packs";
      renderPlace();
      return;
    }
    if (run.kind === "marble") {
      place.assignments[marbleKey(run.packId, run.marbleId)] = type.id;
      lastResult = { name: run.name, color: run.color, type, from: "packMarbles", generated: false };
    } else {
      run.marble.typeId = type.id;
      place.generated.push(run.marble);
      lastResult = { name: run.marble.name, color: run.marble.color, type, from: "packs", generated: true };
    }
    run = null;
    persist();
    view = "result";
    renderPlace();
  }

  function leaveQuiz() {
    const back = run ? run.from : "answers";
    run = null;
    view = back;
    renderPlace();
  }

  function renderResult() {
    if (!lastResult) {
      view = "packs";
      renderPlace();
      return;
    }
    const card = el("article", "card result-card");
    card.appendChild(el("h2", "", t("resultTitle")));
    if (lastResult.type.logo) {
      const image = el("img", "result-logo");
      image.src = lastResult.type.logo;
      image.alt = "";
      card.appendChild(image);
    }
    const swatch = el("i", "swatch");
    swatch.style.background = lastResult.type.color;
    const line = el("p", "");
    line.append(document.createTextNode(t("resultLine", { name: lastResult.name, type: lastResult.type.name }) + " "), swatch);
    card.appendChild(line);
    const actions = el("div", "result-actions");
    if (lastResult.generated) {
      const another = el("button", "btn infinite", t("anotherMarble"));
      another.type = "button";
      another.addEventListener("click", startGenerated);
      actions.appendChild(another);
    }
    const back = el("button", "btn ghost", lastResult.generated ? t("backMarbles") : t("backPack"));
    back.type = "button";
    back.addEventListener("click", () => {
      view = lastResult.from || "packs";
      renderPlace();
    });
    actions.appendChild(back);
    card.appendChild(actions);
    ui.body.appendChild(card);
  }

  ui.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = ui.placeName.value.trim();
    if (!name) {
      ui.placeName.focus();
      return;
    }
    const created = normalizePlace({ id: makeId("lugar"), name, types: [], questions: blankQuestions() });
    state.places.push(created);
    ui.placeName.value = "";
    persist();
    openPlace(created.id);
  });

  ui.back.addEventListener("click", () => {
    if (view === "quiz") {
      leaveQuiz();
      return;
    }
    if (view === "result") {
      view = lastResult && lastResult.from ? lastResult.from : "packs";
      renderPlace();
      return;
    }
    if (view === "packMarbles") {
      view = "packs";
      renderPlace();
      return;
    }
    currentId = "";
    showScreen("places");
    renderPlaces();
  });

  GameI18n.onChange(() => {
    GameI18n.applyDom();
    if (ui.place.classList.contains("active")) renderPlace();
    else renderPlaces();
  });

  renderPlaces();
})();
