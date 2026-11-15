(function () {
  "use strict";

  const STORAGE_KEY = "colegio-creado-saves-v1";
  const STORAGE_BAK = "colegio-creado-saves-v1-bak";

  const SUBJECTS = [
    { id: "mate", name: "Matemáticas", teacher: "Prof. Núñez", work: "Resolví estos ejercicios de fracciones y dejé el procedimiento." },
    { id: "lengua", name: "Lengua", teacher: "Prof. Palabra", work: "Escribí un cuento corto sobre una pelotita en el recreo." },
    { id: "historia", name: "Historia", teacher: "Prof. Siglos", work: "Resumí la clase de hoy en cinco oraciones." },
    { id: "ciencias", name: "Ciencias", teacher: "Prof. Átomo", work: "Marqué las partes de la célula y expliqué para qué sirven." },
    { id: "arte", name: "Arte", teacher: "Prof. Colorín", work: "Dibujé el patio del colegio con tres colores." },
    { id: "edfis", name: "Educación Física", teacher: "Prof. Salto", work: "Anoté cuántas vueltas corrí y cómo me sentí." },
    { id: "ingles", name: "Inglés", teacher: "Prof. Hello", work: "Completé el diálogo en inglés sobre mi día en la escuela." },
    { id: "musica", name: "Música", teacher: "Prof. Ritmo", work: "Inventé una canción corta con el ritmo que practicamos." }
  ];

  let saves = [];
  let activeId = null;
  let createPackIds = {};
  let createMarbles = [];

  function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  }

  function packs() {
    return window.SharedPacks ? SharedPacks.load() : [];
  }

  function readSaves() {
    try {
      const main = localStorage.getItem(STORAGE_KEY);
      const bak = localStorage.getItem(STORAGE_BAK);
      const parsed = JSON.parse(main || bak || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeSave).filter(Boolean) : [];
    } catch (_err) {
      return [];
    }
  }

  function writeSaves(list) {
    const json = JSON.stringify(list);
    try {
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_BAK, json);
    } catch (_err) {
      try {
        localStorage.setItem(STORAGE_KEY, json);
      } catch (_err2) {
        /* sin espacio */
      }
    }
    saves = list;
  }

  function emptyRooms() {
    const rooms = {};
    SUBJECTS.forEach((subject) => {
      rooms[subject.id] = {
        id: subject.id,
        name: subject.name,
        teacherName: subject.teacher,
        teacherPresent: true,
        teaching: false,
        works: []
      };
    });
    return rooms;
  }

  function normalizeMarble(marble) {
    if (!marble || !marble.name) return null;
    return {
      id: marble.id || makeId("m"),
      name: String(marble.name).slice(0, 100),
      color: marble.color || "#55d6ff",
      gender: marble.gender === "male" || marble.gender === "female" ? marble.gender : "",
      intelligence: Number.isFinite(Number(marble.intelligence))
        ? Math.max(0, Math.min(100, Math.round(Number(marble.intelligence))))
        : 50,
      roomId: typeof marble.roomId === "string" ? marble.roomId : ""
    };
  }

  function normalizeWork(work) {
    if (!work || !work.marbleId) return null;
    const grade = work.grade === "A" || work.grade === "F" ? work.grade : "";
    return {
      id: work.id || makeId("work"),
      marbleId: String(work.marbleId),
      text: String(work.text || "").slice(0, 240),
      grade: grade
    };
  }

  function normalizeRoom(room, subject) {
    const base = subject || SUBJECTS.find((item) => item.id === (room && room.id)) || SUBJECTS[0];
    return {
      id: base.id,
      name: base.name,
      teacherName: (room && room.teacherName) || base.teacher,
      teacherPresent: !room || room.teacherPresent !== false,
      teaching: !!(room && room.teaching),
      works: Array.isArray(room && room.works) ? room.works.map(normalizeWork).filter(Boolean) : []
    };
  }

  function normalizeSave(save) {
    if (!save) return null;
    const rooms = emptyRooms();
    SUBJECTS.forEach((subject) => {
      rooms[subject.id] = normalizeRoom(save.rooms && save.rooms[subject.id], subject);
    });
    return {
      id: save.id || makeId("save"),
      name: String(save.name || "Partida").slice(0, 40),
      createdAt: Number(save.createdAt) || Date.now(),
      updatedAt: Number(save.updatedAt) || Date.now(),
      marbles: Array.isArray(save.marbles) ? save.marbles.map(normalizeMarble).filter(Boolean) : [],
      rooms: rooms
    };
  }

  function getSave() {
    return saves.find((save) => save.id === activeId) || null;
  }

  function persistActive() {
    const save = getSave();
    if (!save) return;
    save.updatedAt = Date.now();
    writeSaves(saves.map((item) => (item.id === save.id ? save : item)));
  }

  function subjectOf(roomId) {
    return SUBJECTS.find((item) => item.id === roomId) || null;
  }

  function marbleById(save, id) {
    return save.marbles.find((marble) => marble.id === id) || null;
  }

  function studentsInRoom(save, roomId) {
    return save.marbles.filter((marble) => marble.roomId === roomId);
  }

  function randomRoomId() {
    return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)].id;
  }

  function workTextFor(marble, subject) {
    const base = subject.work;
    const iq = marble.intelligence;
    if (iq <= 25) return base + " (hay varios errores y partes incompletas.)";
    if (iq <= 50) return base + " (está aceptable, con algunos detalles flojos.)";
    if (iq <= 75) return base + " (se entiende bien y está bastante completo.)";
    if (iq < 100) return base + " (casi perfecto, con muy pocos detalles a mejorar.)";
    return base + " (obra maestra. SUPER GENIO.)";
  }

  function ensureWorks(save, roomId) {
    const room = save.rooms[roomId];
    const subject = subjectOf(roomId);
    if (!room || !subject) return;
    studentsInRoom(save, roomId).forEach((marble) => {
      const hasPending = room.works.some((work) => work.marbleId === marble.id && !work.grade);
      if (hasPending) return;
      room.works.push({
        id: makeId("work"),
        marbleId: marble.id,
        text: workTextFor(marble, subject),
        grade: ""
      });
    });
  }

  function renderSaves() {
    saves = readSaves();
    const list = document.getElementById("saveList");
    const empty = document.getElementById("emptySaves");
    list.innerHTML = "";
    empty.hidden = saves.length > 0;
    saves
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .forEach((save) => {
        const row = document.createElement("div");
        row.className = "save-row";
        row.innerHTML =
          "<div><strong></strong><span></span></div><div class=\"save-actions\"></div>";
        row.querySelector("strong").textContent = save.name;
        row.querySelector("span").textContent =
          save.marbles.length + " pelotita" + (save.marbles.length === 1 ? "" : "s");
        const open = document.createElement("button");
        open.type = "button";
        open.className = "btn secondary";
        open.textContent = "Abrir";
        open.addEventListener("click", () => openHub(save.id));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn danger";
        remove.textContent = "Borrar";
        remove.addEventListener("click", () => {
          if (!window.confirm("¿Borrar la partida \"" + save.name + "\"?")) return;
          writeSaves(saves.filter((item) => item.id !== save.id));
          if (activeId === save.id) activeId = null;
          renderSaves();
        });
        row.querySelector(".save-actions").append(open, remove);
        list.appendChild(row);
      });
  }

  function renderPackPicks() {
    const list = document.getElementById("packPickList");
    list.innerHTML = "";
    const found = packs();
    if (!found.length) {
      list.textContent = "No hay packs. Podés crear pelotitas abajo o armar packs en Packs.";
      return;
    }
    found.forEach((pack) => {
      const count = Array.isArray(pack.marbles) ? pack.marbles.length : 0;
      const row = document.createElement("label");
      row.className = "pack-pick" + (createPackIds[pack.id] ? " on" : "");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!createPackIds[pack.id];
      box.addEventListener("change", () => {
        if (box.checked) createPackIds[pack.id] = true;
        else delete createPackIds[pack.id];
        row.classList.toggle("on", box.checked);
      });
      const text = document.createElement("span");
      text.innerHTML = "<strong></strong> · " + count + " pelotita" + (count === 1 ? "" : "s");
      text.querySelector("strong").textContent = pack.name || "Pack";
      row.append(box, text);
      list.appendChild(row);
    });
  }

  function renderCreateMarbles() {
    const list = document.getElementById("createMarbleList");
    list.innerHTML = "";
    createMarbles.forEach((marble, index) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.title = "Quitar";
      chip.innerHTML = '<i class="mini"></i><span></span>';
      chip.querySelector(".mini").style.background = marble.color;
      chip.querySelector("span").textContent = marble.name;
      chip.addEventListener("click", () => {
        createMarbles.splice(index, 1);
        renderCreateMarbles();
      });
      list.appendChild(chip);
    });
  }

  function openCreate() {
    createPackIds = {};
    createMarbles = [];
    document.getElementById("saveName").value = "";
    document.getElementById("createStatus").textContent = "";
    renderPackPicks();
    renderCreateMarbles();
    show("screenCreate");
  }

  function collectCreateMarbles() {
    const list = [];
    const seen = {};
    packs().forEach((pack) => {
      if (!createPackIds[pack.id] || !Array.isArray(pack.marbles)) return;
      pack.marbles.forEach((marble) => {
        if (!marble || !marble.name) return;
        const copy = normalizeMarble({
          id: makeId("m"),
          name: marble.name,
          color: marble.color,
          gender: marble.gender,
          intelligence: marble.intelligence,
          roomId: ""
        });
        if (!copy || seen[copy.name + "|" + copy.color]) return;
        seen[copy.name + "|" + copy.color] = true;
        list.push(copy);
      });
    });
    createMarbles.forEach((marble) => {
      const copy = normalizeMarble(marble);
      if (!copy) return;
      list.push(copy);
    });
    return list;
  }

  function startSave() {
    const name = document.getElementById("saveName").value.trim();
    const status = document.getElementById("createStatus");
    if (!name) {
      status.textContent = "Poné un nombre para la partida.";
      document.getElementById("saveName").focus();
      return;
    }
    const marbles = collectCreateMarbles();
    if (!marbles.length) {
      status.textContent = "Elegí al menos un pack o creá una pelotita.";
      return;
    }
    const save = normalizeSave({
      id: makeId("save"),
      name: name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      marbles: marbles,
      rooms: emptyRooms()
    });
    saves = readSaves();
    saves.push(save);
    writeSaves(saves);
    openHub(save.id);
  }

  function openHub(saveId) {
    activeId = saveId;
    const save = getSave();
    if (!save) {
      renderSaves();
      show("screenSaves");
      return;
    }
    document.getElementById("hubTitle").textContent = save.name;
    document.getElementById("hubHint").textContent =
      save.marbles.length + " pelotita" + (save.marbles.length === 1 ? "" : "s") +
      " · " + studentsInSchool(save) + " en el colegio";
    document.getElementById("hubStatus").textContent = "";
    show("screenHub");
  }

  function studentsInSchool(save) {
    return save.marbles.filter((marble) => marble.roomId).length;
  }

  function renderMarbles() {
    const save = getSave();
    if (!save) return openHub(null);
    const list = document.getElementById("marbleList");
    const status = document.getElementById("marbleStatus");
    status.textContent = "";
    list.innerHTML = "";
    save.marbles.forEach((marble) => {
      const room = marble.roomId ? subjectOf(marble.roomId) : null;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "marble-btn";
      btn.innerHTML = '<i class="mini"></i><span><strong></strong><div class="meta"></div></span>';
      btn.querySelector(".mini").style.background = marble.color;
      btn.querySelector("strong").textContent = marble.name;
      btn.querySelector(".meta").textContent = room
        ? "En " + room.name
        : "Todavía no está en el colegio";
      btn.addEventListener("click", () => placeMarbleRandom(marble.id));
      list.appendChild(btn);
    });
    show("screenMarbles");
  }

  function placeMarbleRandom(marbleId) {
    const save = getSave();
    if (!save) return;
    const marble = marbleById(save, marbleId);
    if (!marble) return;
    const roomId = randomRoomId();
    marble.roomId = roomId;
    const room = save.rooms[roomId];
    if (room && room.teaching) ensureWorks(save, roomId);
    persistActive();
    const subject = subjectOf(roomId);
    document.getElementById("marbleStatus").textContent =
      marble.name + " apareció en " + (subject ? subject.name : "un aula") + ".";
    document.getElementById("marbleStatus").className = "status ok";
    renderMarbles();
  }

  function renderSchool() {
    const save = getSave();
    if (!save) return openHub(null);
    const list = document.getElementById("roomList");
    list.innerHTML = "";
    SUBJECTS.forEach((subject) => {
      const room = save.rooms[subject.id];
      const count = studentsInRoom(save, subject.id).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "room-btn";
      btn.innerHTML = "<strong></strong><span></span>";
      btn.querySelector("strong").textContent = subject.name;
      btn.querySelector("span").textContent =
        (room.teacherPresent ? room.teacherName + " está en el aula" : "Estás dando clase") +
        " · " + count + " pelotita" + (count === 1 ? "" : "s");
      btn.addEventListener("click", () => openRoom(subject.id));
      list.appendChild(btn);
    });
    show("screenSchool");
  }

  function openRoom(roomId) {
    const save = getSave();
    if (!save || !save.rooms[roomId]) return renderSchool();
    renderRoom(roomId);
  }

  function renderRoom(roomId) {
    const save = getSave();
    if (!save) return;
    const room = save.rooms[roomId];
    const subject = subjectOf(roomId);
    const students = studentsInRoom(save, roomId);
    document.getElementById("roomTitle").textContent = subject.name;
    const teacherLine = document.getElementById("roomTeacher");
    if (room.teaching) {
      teacherLine.textContent = "Estás dando la clase. " + room.teacherName + " salió del aula.";
    } else if (room.teacherPresent) {
      teacherLine.textContent = room.teacherName + " está al frente del aula.";
    } else {
      teacherLine.textContent = room.teacherName + " no está. Podés dar la clase vos.";
    }

    const studentBox = document.getElementById("roomStudents");
    studentBox.innerHTML = "";
    if (!students.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No hay pelotitas en este salón. Mandá alguna desde Pelotitas.";
      studentBox.appendChild(empty);
    } else {
      students.forEach((marble) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.innerHTML = '<i class="mini"></i><span></span>';
        chip.querySelector(".mini").style.background = marble.color;
        chip.querySelector("span").textContent = marble.name;
        studentBox.appendChild(chip);
      });
    }

    const actions = document.getElementById("roomActions");
    actions.innerHTML = "";
    if (!room.teaching) {
      const teach = document.createElement("button");
      teach.type = "button";
      teach.className = "btn primary";
      teach.textContent = "Dar clase";
      teach.disabled = !students.length;
      teach.title = students.length ? "" : "Necesitás al menos una pelotita en el aula";
      teach.addEventListener("click", () => startTeaching(roomId));
      actions.appendChild(teach);
    } else {
      const stop = document.createElement("button");
      stop.type = "button";
      stop.className = "btn secondary";
      stop.textContent = "Terminar clase";
      stop.addEventListener("click", () => endTeaching(roomId));
      actions.appendChild(stop);
    }

    const workList = document.getElementById("workList");
    workList.innerHTML = "";
    document.getElementById("roomStatus").textContent = "";
    document.getElementById("roomStatus").className = "status";
    if (room.teaching) {
      const pending = room.works.filter((work) => !work.grade && students.some((marble) => marble.id === work.marbleId));
      const graded = room.works.filter((work) => work.grade && students.some((marble) => marble.id === work.marbleId));
      if (!pending.length && !graded.length) {
        const empty = document.createElement("p");
        empty.className = "hint";
        empty.textContent = "No hay trabajos para corregir todavía.";
        workList.appendChild(empty);
      }
      pending.concat(graded).forEach((work) => {
        const marble = marbleById(save, work.marbleId);
        if (!marble) return;
        const card = document.createElement("article");
        card.className = "work-card";
        const head = document.createElement("div");
        head.className = "work-head";
        head.innerHTML = '<span class="chip"><i class="mini"></i><span class="work-name"></span></span>';
        head.querySelector(".mini").style.background = marble.color;
        head.querySelector(".work-name").textContent = marble.name;
        if (work.grade) {
          const mark = document.createElement("span");
          mark.className = "grade " + work.grade.toLowerCase();
          mark.textContent = work.grade;
          head.appendChild(mark);
        } else {
          const buttons = document.createElement("div");
          buttons.className = "actions";
          const a = document.createElement("button");
          a.type = "button";
          a.className = "btn grade-a";
          a.textContent = "A";
          a.addEventListener("click", () => gradeWork(roomId, work.id, "A"));
          const f = document.createElement("button");
          f.type = "button";
          f.className = "btn grade-f";
          f.textContent = "F";
          f.addEventListener("click", () => gradeWork(roomId, work.id, "F"));
          buttons.append(a, f);
          head.appendChild(buttons);
        }
        const text = document.createElement("p");
        text.className = "work-text";
        text.textContent = work.text;
        card.append(head, text);
        workList.appendChild(card);
      });
    }

    show("screenRoom");
  }

  function startTeaching(roomId) {
    const save = getSave();
    if (!save) return;
    const room = save.rooms[roomId];
    if (!room || !studentsInRoom(save, roomId).length) return;
    room.teacherPresent = false;
    room.teaching = true;
    room.works = [];
    ensureWorks(save, roomId);
    persistActive();
    document.getElementById("roomStatus").textContent =
      room.teacherName + " se fue. Ahora corregí los trabajos con A o F.";
    document.getElementById("roomStatus").className = "status ok";
    renderRoom(roomId);
  }

  function endTeaching(roomId) {
    const save = getSave();
    if (!save) return;
    const room = save.rooms[roomId];
    if (!room) return;
    room.teaching = false;
    room.teacherPresent = true;
    persistActive();
    renderRoom(roomId);
  }

  function gradeWork(roomId, workId, grade) {
    const save = getSave();
    if (!save) return;
    const room = save.rooms[roomId];
    const work = room && room.works.find((item) => item.id === workId);
    if (!work) return;
    work.grade = grade;
    persistActive();
    const marble = marbleById(save, work.marbleId);
    document.getElementById("roomStatus").textContent =
      (marble ? marble.name : "Trabajo") + " recibió " + grade + ".";
    document.getElementById("roomStatus").className = "status ok";
    renderRoom(roomId);
  }

  document.getElementById("btnOpenSaves").addEventListener("click", () => {
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnNewSave").addEventListener("click", openCreate);
  document.getElementById("btnBackSaves").addEventListener("click", () => {
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnPickAllPacks").addEventListener("click", () => {
    packs().forEach((pack) => { createPackIds[pack.id] = true; });
    renderPackPicks();
  });
  document.getElementById("btnPickNoPacks").addEventListener("click", () => {
    createPackIds = {};
    renderPackPicks();
  });
  document.getElementById("marbleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("marbleName").value.trim();
    if (!name) return;
    createMarbles.push({
      id: makeId("m"),
      name: name.slice(0, 100),
      color: document.getElementById("marbleColor").value,
      roomId: ""
    });
    document.getElementById("marbleName").value = "";
    renderCreateMarbles();
  });
  document.getElementById("btnStartSave").addEventListener("click", startSave);
  document.getElementById("btnHubBack").addEventListener("click", () => {
    activeId = null;
    renderSaves();
    show("screenSaves");
  });
  document.getElementById("btnPelotitas").addEventListener("click", renderMarbles);
  document.getElementById("btnColegio").addEventListener("click", renderSchool);
  document.getElementById("btnBackHubFromMarbles").addEventListener("click", () => openHub(activeId));
  document.getElementById("btnBackHubFromSchool").addEventListener("click", () => openHub(activeId));
  document.getElementById("btnBackSchool").addEventListener("click", renderSchool);

  saves = readSaves();
})();
