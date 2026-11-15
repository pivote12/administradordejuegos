const THREE = window.THREE;
if (!THREE) {
  const note = document.getElementById("bootError");
  if (note) {
    note.hidden = false;
    note.textContent = "No se pudo abrir la plataforma 3D. Recargá con Ctrl+F5.";
  }
  throw new Error("three");
}
window.PlatafAcidoReady = true;
const bootNote = document.getElementById("bootError");
if (bootNote) bootNote.hidden = true;

const SAVE_KEY = "marble-escape-saves-v2";
const BEDS_KEY = "platafacido-beds-v1";
const HALF = 100;
const RADIUS = 3.2;
const TOP = 1;
const MARKERS = [
  ["rojo", "Marcador rojo", "#ef4444"],
  ["naranja", "Marcador naranja", "#f97316"],
  ["amarillo", "Marcador amarillo", "#facc15"],
  ["verde", "Marcador verde", "#22c55e"],
  ["celeste", "Marcador celeste", "#38bdf8"],
  ["azul", "Marcador azul", "#2563eb"],
  ["violeta", "Marcador violeta", "#7c3aed"],
  ["magenta", "Marcador magenta", "#d946ef"],
  ["rosa", "Marcador rosa", "#f9a8d4"]
];

const view = document.getElementById("view");
const keys = { w: false, a: false, s: false, d: false };
let renderer;
let scene;
let camera;
let actors = [];
let controlled = null;
let foods = [];
let drinks = [];
let craft = Array(9).fill(null);
let craftPick = 0;
let bedPick = null;
let bedPickChosen = new Set();
let doubleBeds = {};
let selected = null;
let placing = null;
let pendingRoom = null;
let roomOwners = new Set();
let openChest = null;
let structures = [];
let paints = [];
let phase = "title";
let ended = false;
let last = 0;
const orbit = { yaw: 0, pitch: 0.588, distance: 50.5 };
const drag = { active: false, button: 0, x: 0, y: 0, moved: false };

function show(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });
}

function setStatus(text) {
  document.getElementById("playStatus").textContent = text;
}

function packs() {
  try {
    return window.SharedPacks ? SharedPacks.load() : [];
  } catch (_err) {
    return [];
  }
}

function escapeData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : { faces: [], foods: [] };
  } catch (_err) {
    return { faces: [], foods: [] };
  }
}

function readBeds() {
  try {
    const data = JSON.parse(localStorage.getItem(BEDS_KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch (_err) {
    return {};
  }
}

function writeBeds(data) {
  localStorage.setItem(BEDS_KEY, JSON.stringify(data));
}

function paintCanvas(fill) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 256, 160);
  return canvas.toDataURL("image/png");
}

function ensureBed(marble) {
  const beds = readBeds();
  if (!beds[marble.id]) {
    beds[marble.id] = {
      id: marble.id,
      name: marble.name,
      color: marble.color,
      packId: marble.packId,
      sheet: paintCanvas(marble.color || "#38bdf8"),
      pillow: paintCanvas("#f8fafc")
    };
    try {
      writeBeds(beds);
    } catch (_err) {
      /* si el navegador no puede guardar, la cama igual existe en la partida */
    }
  }
  return beds[marble.id];
}

function materialColor(value, fallback) {
  const color = new THREE.Color(fallback);
  try {
    if (value) color.set(value);
  } catch (_err) {
    color.set(fallback);
  }
  return color;
}

function addStack(list, item) {
  const found = list.find((stack) => stack.kind === item.kind && stack.id === item.id);
  if (found) found.count += item.count || 1;
  else list.push({ ...item, count: item.count || 1 });
}

function takeStack(list, kind, id) {
  const found = list.find((stack) => stack.kind === kind && stack.id === id && stack.count > 0);
  if (!found) return null;
  found.count -= 1;
  const copy = { ...found, count: 1 };
  if (found.count <= 0) list.splice(list.indexOf(found), 1);
  return copy;
}

function alive() {
  return actors.filter((actor) => actor.alive);
}

function resizeView() {
  if (!renderer || !camera) return;
  const width = view.clientWidth || window.innerWidth;
  const height = view.clientHeight || window.innerHeight;
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function bootWorld() {
  if (renderer) return;
  const width = window.innerWidth || 1280;
  const height = window.innerHeight || 720;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  view.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#14532d");
  scene.fog = new THREE.Fog("#14532d", 120, 520);
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 900);
  camera.position.set(0, 48, 78);
  camera.lookAt(0, 1, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xfff7d6, 1.1);
  sun.position.set(40, 80, 30);
  scene.add(sun);
  const acid = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 900),
    new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x3f6212, transparent: true, opacity: 0.82 })
  );
  acid.rotation.x = -Math.PI / 2;
  acid.position.y = -6;
  scene.add(acid);
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(200, 2, 200),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
  );
  platform.position.y = 0;
  platform.userData.platform = true;
  scene.add(platform);
  const rim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(200, 2, 200)),
    new THREE.LineBasicMaterial({ color: 0xbef264 })
  );
  rim.position.y = 0;
  scene.add(rim);
  renderer.render(scene, camera);
  window.addEventListener("resize", resizeView);
  renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function makeMarble(marble, index) {
  const bed = ensureBed(marble);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS, 24, 18),
    new THREE.MeshStandardMaterial({ color: materialColor(marble.color, "#86efac") })
  );
  const cols = 10;
  const x = ((index % cols) - (cols - 1) / 2) * 8;
  const z = (Math.floor(index / cols) - 4) * 8;
  mesh.position.set(x, TOP + RADIUS, z);
  scene.add(mesh);
  const inventory = [];
  addStack(inventory, { kind: "wood", id: "madera", name: "Madera", count: 30 });
  addStack(inventory, { kind: "stone", id: "piedra", name: "Piedra", count: 6 });
  MARKERS.forEach(([id, name, color]) => addStack(inventory, { kind: "marker", id, name, color, count: 2 }));
  addStack(inventory, { kind: "bed", id: bed.id, name: "Cama de " + marble.name, image: bed.sheet, pillow: bed.pillow, ownerId: marble.id, count: 1 });
  foods.forEach((food) => addStack(inventory, { kind: "food", id: food.id, name: food.name, count: 1 }));
  drinks.forEach((drink) => addStack(inventory, { kind: "drink", id: drink.id, name: drink.name, count: 1 }));
  return {
    id: marble.id,
    name: marble.name,
    color: marble.color || "#86efac",
    mesh,
    x, y: TOP + RADIUS, z,
    vx: 0, vy: 0, vz: 0,
    inventory,
    alive: true
  };
}

function startPack(pack) {
  const source = escapeData();
  const made = (Array.isArray(source.foods) ? source.foods : []).filter((food) => food && !food.ai);
  foods = made.filter((food) => food.kind !== "drink");
  drinks = made.filter((food) => food.kind === "drink");
  const sourceMarbles = Array.isArray(pack.marbles) ? pack.marbles : [];
  const marbles = sourceMarbles.filter((marble) => marble && marble.name).slice(0, 100).map((marble, index) => ({
    id: String(marble.id || pack.id + "-" + index),
    name: String(marble.name),
    color: marble.color || "#86efac",
    packId: String(pack.id || "")
  }));
  if (!marbles.length) {
    const note = document.getElementById("packList");
    note.insertAdjacentHTML("afterbegin", "<p>Ese pack no tiene pelotitas.</p>");
    return;
  }
  try {
    bootWorld();
  } catch (_err) {
    const note = document.getElementById("bootError");
    note.hidden = false;
    note.textContent = "No se pudo abrir la plataforma 3D en este navegador.";
    return;
  }
  show("screenPlay");
  resizeView();
  if (renderer && camera) {
    camera.position.set(0, 48, 78);
    camera.lookAt(0, 1, 0);
    renderer.render(scene, camera);
  }
  actors.forEach((actor) => scene.remove(actor.mesh));
  structures.forEach((item) => scene.remove(item.mesh));
  paints.forEach((item) => scene.remove(item));
  actors = [];
  structures = [];
  paints = [];
  closeRoomPick();
  Object.values(doubleBeds).forEach((record) => {
    if (record.mesh) scene.remove(record.mesh);
  });
  doubleBeds = {};
  craft = Array(9).fill(null);
  bedPick = null;
  ended = false;
  phase = "play";
  marbles.forEach((marble, index) => {
    try {
      actors.push(makeMarble(marble, index));
    } catch (_err) {
      /* esa pelotita queda afuera, la plataforma sigue */
    }
  });
  controlled = actors[0] || null;
  if (!controlled) {
    setStatus("La plataforma está lista, pero no se pudieron colocar las pelotitas.");
    return;
  }
  resizeView();
  if (controlled && camera) {
    orbit.yaw = 0;
    orbit.pitch = 0.588;
    orbit.distance = 50.5;
    placeCamera();
    renderer.render(scene, camera);
  }
  setStatus(marbles.length + " pelotitas sobre el ácido. Clic izquierdo y arrastrar gira la cámara. E duerme.");
  renderInventory();
  renderCraft();
}

function kill(actor) {
  if (!actor.alive || ended) return;
  actor.alive = false;
  actor.mesh.visible = false;
  if (controlled === actor) controlled = alive()[0] || null;
  renderInventory();
  const left = alive();
  if (left.length === 1) finish(left[0], false);
  else if (!left.length) finish(null, false);
  else setStatus("El ácido se llevó a " + actor.name + ". Quedan " + left.length + ".");
}

function finish(winner, early) {
  if (ended) return;
  ended = true;
  phase = "result";
  const left = alive();
  let chosen = winner;
  let text = "El ácido se llevó a todas.";
  if (!chosen && early && left.length > 1) {
    chosen = left[Math.floor(Math.random() * left.length)];
    text = "Empate entre las que quedaron. El ganador al azar es " + chosen.name + ".";
  } else if (chosen) {
    text = chosen.name + " es la última en la plataforma.";
  } else if (left.length === 1) {
    chosen = left[0];
    text = chosen.name + " es la última en la plataforma.";
  }
  document.getElementById("resultTitle").textContent = chosen ? "Ganó " + chosen.name : "PlatafAcido";
  document.getElementById("resultText").textContent = text;
  show("screenResult");
}

function support(actor) {
  return Math.abs(actor.x) <= HALF - RADIUS && Math.abs(actor.z) <= HALF - RADIUS;
}

function hitWall(actor) {
  structures.forEach((item) => {
    if (item.kind === "room" && item.blocks) {
      item.blocks.forEach((box) => blockActor(actor, box));
      return;
    }
    if (item.kind !== "chest") return;
    blockActor(actor, item);
  });
}

function blockActor(actor, box) {
  const hw = box.w / 2 + RADIUS;
  const hd = box.d / 2 + RADIUS;
  if (Math.abs(actor.x - box.x) < hw && Math.abs(actor.z - box.z) < hd && actor.y < box.h) {
    const px = hw - Math.abs(actor.x - box.x);
    const pz = hd - Math.abs(actor.z - box.z);
    if (px < pz) actor.x += actor.x < box.x ? -px : px;
    else actor.z += actor.z < box.z ? -pz : pz;
  }
}

function step(dt) {
  if (phase !== "play" || ended) return;
  actors.forEach((actor) => {
    if (!actor.alive) return;
    if (actor.asleep) {
      const record = doubleBeds[actor.bedId];
      if (record) {
        const side = (record.sleepers.indexOf(actor.id) - ((record.seats || 2) - 1) / 2) * 3.2;
        actor.x = record.x + side;
        actor.y = TOP + RADIUS + 0.45;
        actor.z = record.z + 0.3;
      }
      actor.vx = 0;
      actor.vy = 0;
      actor.vz = 0;
      actor.mesh.position.set(actor.x, actor.y, actor.z);
      return;
    }
    if (actor === controlled) {
      const speed = 36;
      if (keys.a) actor.vx -= speed * dt;
      if (keys.d) actor.vx += speed * dt;
      if (keys.w) actor.vz -= speed * dt;
      if (keys.s) actor.vz += speed * dt;
    }
    actor.vx *= Math.exp(-3 * dt);
    actor.vz *= Math.exp(-3 * dt);
    actor.x += actor.vx * dt;
    actor.z += actor.vz * dt;
    hitWall(actor);
    if (support(actor) && actor.y <= TOP + RADIUS + 0.2 && actor.vy <= 0) {
      actor.y = TOP + RADIUS;
      actor.vy = 0;
    } else {
      actor.vy -= 46 * dt;
      actor.y += actor.vy * dt;
    }
    if (actor.y < -1) kill(actor);
    actor.mesh.position.set(actor.x, actor.y, actor.z);
  });
  for (let i = 0; i < actors.length; i += 1) {
    for (let j = i + 1; j < actors.length; j += 1) {
      const a = actors[i];
      const b = actors[j];
      if (!a.alive || !b.alive || a.asleep || b.asleep) continue;
      let dx = b.x - a.x;
      let dz = b.z - a.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      if (dist < RADIUS * 2) {
        const push = (RADIUS * 2 - dist) / 2;
        dx /= dist;
        dz /= dist;
        a.x -= dx * push;
        a.z -= dz * push;
        b.x += dx * push;
        b.z += dz * push;
        b.vx += dx * 8;
        b.vz += dz * 8;
        a.vx -= dx * 8;
        a.vz -= dz * 8;
      }
    }
  }
  if (controlled && controlled.alive) placeCamera();
  renderer.render(scene, camera);
}

function loop(now) {
  const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
  last = now;
  if (renderer && phase === "play") {
    try {
      step(dt);
    } catch (_err) {
      setStatus("La plataforma tuvo un problema y se está reintentando.");
    }
  }
  requestAnimationFrame(loop);
}

function renderInventory() {
  const root = document.getElementById("inventory");
  root.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = controlled ? controlled.name : "Sin control";
  root.appendChild(title);
  if (!controlled) return;
  controlled.inventory.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "inv-item";
    if (selected === index) btn.classList.add("on");
    btn.textContent = item.name + " ×" + item.count;
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      selected = selected === index ? null : index;
      placing = null;
      renderInventory();
    });
    root.appendChild(btn);
  });
}

function countOf(list, kind, id) {
  const found = list.find((stack) => stack.kind === kind && stack.id === id);
  return found ? found.count : 0;
}

function spend(list, costs) {
  if (costs.some((cost) => countOf(list, cost.kind, cost.id) < cost.count)) return false;
  costs.forEach((cost) => {
    for (let n = 0; n < cost.count; n += 1) takeStack(list, cost.kind, cost.id);
  });
  return true;
}

function singleBeds(actor) {
  return actor ? actor.inventory.filter((stack) => stack.kind === "bed" && !stack.double && !stack.triple) : [];
}

function singleBedCopies(actor, limit) {
  const copies = [];
  singleBeds(actor).forEach((stack) => {
    for (let i = 0; i < stack.count && copies.length < limit; i += 1) copies.push({ ...stack, count: 1 });
  });
  return copies;
}

function craftRoom() {
  if (!spend(controlled.inventory, [{ kind: "wood", id: "madera", count: 9 }])) {
    setStatus("Hacen falta 9 maderas.");
    return;
  }
  addStack(controlled.inventory, { kind: "room", id: "habitacion-" + Date.now(), name: "Habitación" });
  setStatus("Creaste una habitación.");
}

function craftChest() {
  if (!spend(controlled.inventory, [
    { kind: "wood", id: "madera", count: 8 },
    { kind: "stone", id: "piedra", count: 1 }
  ])) {
    setStatus("Hacen falta 8 maderas y 1 piedra.");
    return;
  }
  addStack(controlled.inventory, { kind: "chest", id: "cofre-" + Date.now(), name: "Cofre" });
  setStatus("Creaste un cofre.");
}

function craftRainbow() {
  const costs = MARKERS.map(([id]) => ({ kind: "marker", id, count: 1 }));
  if (!spend(controlled.inventory, costs)) {
    setStatus("Hace falta un marcador de cada color.");
    return;
  }
  addStack(controlled.inventory, { kind: "marker", id: "arcoiris", name: "Marcador arcoíris", color: "rainbow" });
  setStatus("Creaste el marcador arcoíris.");
}

function craftDouble() {
  const mine = singleBeds(controlled);
  if (mine.length >= 2) {
    finishDouble(mine[0], mine[1]).catch(() => setStatus("No se pudo juntar la cama."));
    return;
  }
  if (!mine.length) {
    setStatus("Necesitás una cama para hacer la cama doble.");
    return;
  }
  const others = alive().filter((actor) => actor.id !== controlled.id && singleBeds(actor).length);
  if (!others.length) {
    setStatus("Hace falta la cama de otra pelotita.");
    return;
  }
  bedPick = "double";
}

function craftTriple() {
  const mine = singleBedCopies(controlled, 3);
  if (mine.length >= 3) {
    finishJoined(mine.slice(0, 3), "Cama triple", 3).catch(() => setStatus("No se pudo juntar la cama."));
    return;
  }
  const others = alive().filter((actor) => actor.id !== controlled.id && singleBeds(actor).length);
  if (mine.length + others.length < 3) {
    setStatus("Hacen falta 3 camas.");
    return;
  }
  bedPick = "triple";
  bedPickChosen = new Set();
}

function listNames(names) {
  if (names.length <= 1) return names[0] || "";
  if (names.length === 2) return names[0] + " y " + names[1];
  return names.slice(0, -1).join(", ") + " y " + names[names.length - 1];
}

function renderBedPick(root) {
  const triple = bedPick === "triple";
  const title = document.createElement("p");
  title.textContent = triple ? "Elegí las otras camas." : "Elegí la otra cama.";
  root.appendChild(title);
  alive().filter((actor) => actor.id !== controlled.id && singleBeds(actor).length).forEach((actor) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn" + (bedPickChosen.has(actor.id) ? " on" : "");
    btn.textContent = "Cama de " + actor.name;
    btn.style.color = actor.color;
    btn.addEventListener("click", () => {
      if (triple) {
        if (bedPickChosen.has(actor.id)) bedPickChosen.delete(actor.id);
        else bedPickChosen.add(actor.id);
        renderCraft();
        return;
      }
      const mine = singleBedCopies(controlled, 1)[0];
      const theirs = singleBedCopies(actor, 1)[0];
      if (!mine || !theirs) {
        bedPick = null;
        setStatus("Falta una de las camas.");
        renderCraft();
        return;
      }
      finishJoined([mine, theirs], "Cama doble", 2).catch(() => setStatus("No se pudo juntar la cama."));
    });
    root.appendChild(btn);
  });
  if (triple) {
    const done = document.createElement("button");
    done.type = "button";
    done.className = "btn primary";
    done.textContent = "Listo";
    done.addEventListener("click", () => {
      const parts = singleBedCopies(controlled, 3);
      alive().filter((actor) => bedPickChosen.has(actor.id)).forEach((actor) => {
        if (parts.length < 3) {
          const extra = singleBedCopies(actor, 1)[0];
          if (extra) parts.push(extra);
        }
      });
      if (parts.length < 3) {
        setStatus("Elegí las camas que faltan.");
        return;
      }
      finishJoined(parts.slice(0, 3), "Cama triple", 3).catch(() => setStatus("No se pudo juntar la cama."));
    });
    root.appendChild(done);
  }
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "btn ghost";
  cancel.textContent = "Cancelar";
  cancel.addEventListener("click", () => {
    bedPick = null;
    bedPickChosen = new Set();
    renderCraft();
  });
  root.appendChild(cancel);
}

function returnCraftItem(item) {
  const owner = actors.find((actor) => actor.alive && actor.id === item.ownerId);
  addStack((owner || controlled).inventory, item);
}

function recipeId(cell) {
  return cell ? cell.kind + ":" + cell.id : "";
}

function renderCraftGrid() {
  const grid = document.getElementById("craftGrid");
  if (!grid) return;
  grid.innerHTML = "";
  craft.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot" + (craftPick === index ? " on" : "");
    btn.textContent = item ? item.name : "·";
    btn.addEventListener("click", () => {
      if (item) {
        returnCraftItem(item);
        craft[index] = null;
      } else if (controlled && selected != null && controlled.inventory[selected] && !controlled.inventory[selected].double && !controlled.inventory[selected].triple) {
        const stack = controlled.inventory[selected];
        const taken = takeStack(controlled.inventory, stack.kind, stack.id);
        if (taken) {
          taken.ownerId = taken.ownerId || controlled.id;
          craft[index] = taken;
        }
        selected = null;
      }
      craftPick = index;
      renderCraft();
      renderInventory();
    });
    grid.appendChild(btn);
  });
}

function renderCraft() {
  renderCraftGrid();
  const root = document.getElementById("craftList");
  if (!root) return;
  root.innerHTML = "";
  if (!controlled) return;
  if (bedPick) {
    renderBedPick(root);
    return;
  }
  [
    ["Habitación", "9 maderas", craftRoom],
    ["Cofre", "8 maderas y 1 piedra", craftChest],
    ["Marcador arcoíris", "1 de cada color", craftRainbow],
    ["Cama doble", "tu cama y la de otra pelotita", craftDouble],
    ["Cama triple", "tres camas", craftTriple]
  ].forEach(([name, cost, run]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    btn.textContent = name + " · " + cost;
    btn.addEventListener("click", () => {
      run();
      renderInventory();
      renderCraft();
    });
    root.appendChild(btn);
  });
}

function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function paintHalf(ctx, image, x, fallback) {
  if (image) ctx.drawImage(image, x, 0, 256, 160);
  else {
    ctx.fillStyle = fallback;
    ctx.fillRect(x, 0, 256, 160);
  }
}

async function joinBeds(list) {
  const loaded = await Promise.all(list.map(async (bed) => ({
    sheet: await loadImage(bed.image),
    pillow: await loadImage(bed.pillow),
    color: bed.color
  })));
  const width = 256 * list.length;
  const sheet = document.createElement("canvas");
  sheet.width = width;
  sheet.height = 160;
  const sheetCtx = sheet.getContext("2d");
  const pillow = document.createElement("canvas");
  pillow.width = width;
  pillow.height = 160;
  const pillowCtx = pillow.getContext("2d");
  loaded.forEach((part, index) => {
    paintHalf(sheetCtx, part.sheet, index * 256, part.color || "#38bdf8");
    paintHalf(pillowCtx, part.pillow, index * 256, "#f8fafc");
  });
  return { sheet: sheet.toDataURL("image/png"), pillow: pillow.toDataURL("image/png") };
}

function giveJoinedBed(record) {
  record.owners.forEach((ownerId) => {
    const actor = actors.find((item) => item.alive && item.id === ownerId);
    if (!actor) return;
    actor.inventory = actor.inventory.filter((stack) => stack.kind !== "bed");
    actor.inventory.push({
      kind: "bed",
      id: record.id,
      name: record.name,
      image: record.sheet,
      pillow: record.pillow,
      double: record.seats === 2,
      triple: record.seats === 3,
      seats: record.seats,
      owners: record.owners,
      ownerId,
      count: 1
    });
  });
}

function imageTexture(url) {
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function spawnDoubleBed(record, actor) {
  const group = new THREE.Group();
  const seats = record.seats || 2;
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(seats === 3 ? 12 : 8, 0.45, 5),
    new THREE.MeshStandardMaterial({ map: imageTexture(record.sheet), color: 0xffffff })
  );
  mattress.position.y = 0.25;
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(seats === 3 ? 11 : 7.2, 0.35, 1.4),
    new THREE.MeshStandardMaterial({ map: imageTexture(record.pillow), color: 0xffffff })
  );
  pillow.position.set(0, 0.62, -1.6);
  group.add(mattress, pillow);
  record.x = Math.max(-HALF + 8, Math.min(HALF - 8, actor.x));
  record.z = Math.max(-HALF + 8, Math.min(HALF - 8, actor.z));
  group.position.set(record.x, TOP, record.z);
  scene.add(group);
  record.mesh = group;
}

function toggleSleep(item) {
  const record = doubleBeds[item.id];
  if (!record || !controlled) return;
  if (!record.owners.includes(controlled.id)) {
    const seats = record.seats || 2;
    setStatus(seats >= 3
      ? "En esta cama triple duermen las tres pelotitas de los diseños."
      : "En esta cama doble duermen las dos pelotitas de los diseños.");
    return;
  }
  const index = record.sleepers.indexOf(controlled.id);
  if (index >= 0) {
    record.sleepers.splice(index, 1);
    controlled.asleep = false;
    controlled.bedId = null;
    if (!record.sleepers.length && record.mesh) {
      scene.remove(record.mesh);
      record.mesh = null;
    }
    setStatus(controlled.name + " se despertó.");
    renderInventory();
    return;
  }
  if (record.sleepers.length >= (record.seats || 2)) {
    setStatus("Esa cama ya está llena.");
    return;
  }
  if (!record.mesh) spawnDoubleBed(record, controlled);
  record.sleepers.push(controlled.id);
  controlled.asleep = true;
  controlled.bedId = record.id;
  const names = record.sleepers.map((id) => {
    const actor = actors.find((itemActor) => itemActor.id === id);
    return actor ? actor.name : "";
  }).filter(Boolean);
  setStatus(names.length > 1 ? listNames(names) + " duermen en la misma cama." : names[0] + " se durmió. Entra otra pelotita.");
  renderInventory();
}

async function finishJoined(beds, name, seats) {
  const joined = await joinBeds(beds);
  const owners = beds.map((bed) => bed.ownerId).filter((id, index, list) => id && list.indexOf(id) === index);
  const record = {
    id: (seats === 3 ? "triple-" : "doble-") + Date.now(),
    name,
    owners,
    sheet: joined.sheet,
    pillow: joined.pillow,
    sleepers: [],
    seats,
    mesh: null,
    x: 0,
    z: 0
  };
  const saved = readBeds();
  saved[record.id] = {
    id: record.id,
    name,
    double: seats === 2,
    triple: seats === 3,
    owners,
    sheet: record.sheet,
    pillow: record.pillow
  };
  writeBeds(saved);
  doubleBeds[record.id] = record;
  bedPick = null;
  bedPickChosen = new Set();
  giveJoinedBed(record);
  renderCraft();
  renderInventory();
  const names = owners.map((id) => {
    const actor = actors.find((item) => item.id === id);
    return actor ? actor.name : "";
  }).filter(Boolean);
  setStatus(name + " de " + listNames(names) + ". " + (seats === 3 ? "Los tres diseños quedaron en uno." : "Los dos diseños quedaron en uno."));
}

function finishDouble(first, second) {
  return finishJoined([first, second], "Cama doble", 2);
}

async function tryCraft() {
  const beds = craft.filter((cell) => cell && cell.kind === "bed");
  const filled = craft.filter(Boolean);
  if (filled.length === 3 && beds.length === 3) {
    const chosen = beds.slice();
    craft = Array(9).fill(null);
    await finishJoined(chosen, "Cama triple", 3);
    return;
  }
  if (filled.length === 2 && beds.length === 2) {
    const first = beds[0];
    const second = beds[1];
    craft = Array(9).fill(null);
    await finishDouble(first, second);
    return;
  }
  if (beds.length === 1 && filled.length === 1) {
    setStatus("Poné otra cama en cualquier casilla. Cambiá de pelotita con Control.");
    return;
  }
  const pattern = craft.map(recipeId).join("|");
  const wood = "wood:madera";
  const stone = "stone:piedra";
  const chest = [wood, wood, wood, wood, stone, wood, wood, wood, wood].join("|");
  const room = Array(9).fill(wood).join("|");
  const rainbow = ["rojo", "naranja", "amarillo", "verde", "celeste", "azul", "violeta", "magenta", "rosa"].map((id) => "marker:" + id).join("|");
  let made = null;
  if (pattern === chest) made = { kind: "chest", id: "cofre-" + Date.now(), name: "Cofre" };
  else if (pattern === room) made = { kind: "room", id: "habitacion-" + Date.now(), name: "Habitación" };
  else if (pattern === rainbow) made = { kind: "marker", id: "arcoiris", name: "Marcador arcoíris", color: "rainbow" };
  if (!made || !controlled) {
    setStatus("Esa receta no arma nada.");
    return;
  }
  craft = Array(9).fill(null);
  addStack(controlled.inventory, made);
  renderCraft();
  renderInventory();
  setStatus("Creaste " + made.name + ".");
}

function raycast(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);
  return ray.intersectObjects(scene.children, false);
}

function placeAt(point, kind) {
  const x = Math.max(-HALF + 10, Math.min(HALF - 10, point.x));
  const z = Math.max(-HALF + 10, Math.min(HALF - 10, point.z));
  if (kind === "wall") addWall(x, z);
  else if (kind === "door") addDoor(x, z);
  else if (kind === "chest") addChest(x, z);
  const item = controlled.inventory[selected];
  if (item) takeStack(controlled.inventory, item.kind, item.id);
  placing = null;
  selected = null;
  renderInventory();
}

function addWall(x, z) {
  const mesh = new THREE.Mesh(
    wallGeometry([]),
    new THREE.MeshStandardMaterial({ color: 0xa16207 })
  );
  mesh.position.set(x, TOP, z);
  scene.add(mesh);
  structures.push({ kind: "wall", x, z, w: 20, d: 2, h: 20, mesh, holes: [] });
}

function wallGeometry(holes) {
  const shape = new THREE.Shape();
  shape.moveTo(-10, 0);
  shape.lineTo(10, 0);
  shape.lineTo(10, 20);
  shape.lineTo(-10, 20);
  shape.closePath();
  holes.forEach((hole) => {
    const path = new THREE.Path();
    path.moveTo(hole.x - 1.5, hole.y - 1.5);
    path.lineTo(hole.x + 1.5, hole.y - 1.5);
    path.lineTo(hole.x + 1.5, hole.y + 1.5);
    path.lineTo(hole.x - 1.5, hole.y + 1.5);
    path.closePath();
    shape.holes.push(path);
  });
  return new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
}

function addDoor(x, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x78350f })
  );
  mesh.position.set(x, TOP + 1.5, z);
  scene.add(mesh);
  structures.push({ kind: "door", x, z, w: 3, d: 3, h: 3, mesh });
  structures.forEach((wall) => {
    if (wall.kind !== "wall") return;
    if (Math.abs(x - wall.x) > 10 || Math.abs(z - wall.z) > 2) return;
    wall.holes.push({ x: x - wall.x, y: 1.5 });
    scene.remove(wall.mesh);
    wall.mesh.geometry.dispose();
    wall.mesh = new THREE.Mesh(wallGeometry(wall.holes), new THREE.MeshStandardMaterial({ color: 0xa16207 }));
    wall.mesh.position.set(wall.x, TOP, wall.z);
    scene.add(wall.mesh);
  });
}

function addChest(x, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 3),
    new THREE.MeshStandardMaterial({ color: 0xfacc15 })
  );
  mesh.position.set(x, TOP + 1.5, z);
  mesh.userData.chest = true;
  scene.add(mesh);
  structures.push({ kind: "chest", x, z, w: 4, d: 3, h: 3, mesh, items: [] });
}

function addRoom(x, z, owners) {
  const width = 64;
  const depth = 52;
  const thick = 1.6;
  const gap = 16;
  const height = 12;
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207 });
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width - thick * 2, 0.12, depth - thick * 2),
    new THREE.MeshStandardMaterial({ color: 0x166534 })
  );
  floor.position.y = 0.08;
  group.add(floor);
  function wall(w, d, px, pz) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), woodMat);
    mesh.position.set(px, height / 2, pz);
    group.add(mesh);
  }
  wall(width, thick, 0, -depth / 2);
  wall(thick, depth, -width / 2, 0);
  wall(thick, depth, width / 2, 0);
  const side = (width - gap) / 2;
  wall(side, thick, -(gap / 2 + side / 2), depth / 2);
  wall(side, thick, gap / 2 + side / 2, depth / 2);
  const names = owners.map((actor) => actor.name);
  const plate = document.createElement("canvas");
  plate.width = 640;
  plate.height = 160;
  const ctx = plate.getContext("2d");
  ctx.fillStyle = "#052e16";
  ctx.fillRect(0, 0, 640, 160);
  ctx.fillStyle = "#ecfccb";
  ctx.font = "700 42px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(names.join(", "), 320, 96);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(plate) }));
  sprite.position.y = height + 1.5;
  sprite.scale.set(28, 6, 1);
  group.add(sprite);
  group.position.set(x, TOP, z);
  scene.add(group);
  const blocks = [
    { x, z: z - depth / 2, w: width, d: thick, h: TOP + height },
    { x: x - width / 2, z, w: thick, d: depth, h: TOP + height },
    { x: x + width / 2, z, w: thick, d: depth, h: TOP + height },
    { x: x - (gap / 2 + side / 2), z: z + depth / 2, w: side, d: thick, h: TOP + height },
    { x: x + (gap / 2 + side / 2), z: z + depth / 2, w: side, d: thick, h: TOP + height }
  ];
  structures.push({
    kind: "room",
    x, z, w: width, d: depth, h: TOP + height,
    mesh: group,
    blocks,
    owners: owners.map((actor) => actor.id)
  });
}

function openRoomPick(x, z) {
  pendingRoom = { x, z };
  roomOwners = new Set();
  const list = document.getElementById("roomPickList");
  const living = alive();
  const cols = Math.max(1, Math.ceil(Math.sqrt(living.length)));
  const rows = Math.max(1, Math.ceil(living.length / cols));
  list.style.gridTemplateColumns = "repeat(" + cols + ", minmax(0, 1fr))";
  list.style.gridTemplateRows = "repeat(" + rows + ", minmax(0, 1fr))";
  list.innerHTML = "";
  living.forEach((actor) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack-btn";
    btn.textContent = actor.name;
    btn.style.color = actor.color;
    btn.addEventListener("click", () => {
      if (roomOwners.has(actor.id)) roomOwners.delete(actor.id);
      else roomOwners.add(actor.id);
      btn.classList.toggle("on", roomOwners.has(actor.id));
    });
    list.appendChild(btn);
  });
  document.getElementById("roomPick").hidden = false;
  setStatus("Elegí quién tiene la habitación. Podés marcar más de una.");
}

function closeRoomPick() {
  pendingRoom = null;
  roomOwners = new Set();
  const panel = document.getElementById("roomPick");
  if (panel) panel.hidden = true;
}

function confirmRoom() {
  if (!pendingRoom || !controlled || selected == null) {
    closeRoomPick();
    return;
  }
  const owners = alive().filter((actor) => roomOwners.has(actor.id));
  if (!owners.length) {
    setStatus("Elegí al menos una pelotita.");
    return;
  }
  const stack = controlled.inventory[selected];
  if (!stack || stack.kind !== "room") {
    closeRoomPick();
    return;
  }
  addRoom(pendingRoom.x, pendingRoom.z, owners);
  const kind = stack.kind;
  const id = stack.id;
  takeStack(controlled.inventory, kind, id);
  if (!controlled.inventory.some((entry) => entry.kind === kind && entry.id === id)) selected = null;
  const names = owners.map((actor) => actor.name);
  closeRoomPick();
  renderInventory();
  setStatus("Habitación de " + names.join(", ") + ". Se entra por el hueco.");
}

function paintMark(point, item) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (item.id === "arcoiris") {
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    MARKERS.forEach((marker, index) => gradient.addColorStop(index / (MARKERS.length - 1), marker[2]));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#fff";
    ctx.font = "700 28px Segoe UI";
    ctx.fillText("arcoíris", 48, 42);
  } else {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(128, 32, 28, 0, Math.PI * 2);
    ctx.fill();
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(item.id === "arcoiris" ? 8 : 3, item.id === "arcoiris" ? 2 : 3),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(point.x, TOP + 0.05 + paints.length * 0.001, point.z);
  scene.add(mesh);
  paints.push(mesh);
}

function chestTotal(chest) {
  return chest.items.reduce((sum, item) => sum + item.count, 0);
}

function openChestPanel(chest) {
  openChest = chest;
  const panel = document.getElementById("chestPanel");
  panel.hidden = false;
  document.getElementById("chestCount").textContent = chestTotal(chest) + "/200";
  const root = document.getElementById("chestSlots");
  root.innerHTML = "";
  chest.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = item.name + " ×" + item.count;
    btn.addEventListener("click", () => {
      if (!controlled) return;
      const taken = takeStack(chest.items, item.kind, item.id);
      if (taken) addStack(controlled.inventory, taken);
      renderInventory();
      openChestPanel(chest);
    });
    root.appendChild(btn);
  });
  const empty = document.createElement("button");
  empty.type = "button";
  empty.className = "slot";
  empty.textContent = "Guardar";
  empty.addEventListener("click", () => {
    if (!controlled || selected == null) return;
    const item = controlled.inventory[selected];
    if (!item || item.kind === "bed") return;
    const room = 200 - chestTotal(chest);
    if (room <= 0) {
      setStatus("El cofre ya tiene 200 objetos.");
      return;
    }
    const moved = Math.min(item.count, room);
    const name = item.name;
    addStack(chest.items, { ...item, count: moved });
    item.count -= moved;
    if (item.count <= 0) {
      controlled.inventory.splice(controlled.inventory.indexOf(item), 1);
      selected = null;
    }
    setStatus("Guardaste " + name + " ×" + moved + (moved === room ? ". El cofre llegó a 200." : "."));
    renderInventory();
    openChestPanel(chest);
  });
  root.appendChild(empty);
}

function placeCamera() {
  if (!camera || !controlled) return;
  orbit.pitch = Math.max(0.12, Math.min(1.35, orbit.pitch));
  orbit.distance = Math.max(8, Math.min(160, orbit.distance));
  const horiz = Math.cos(orbit.pitch) * orbit.distance;
  camera.position.set(
    controlled.x + Math.sin(orbit.yaw) * horiz,
    controlled.y + Math.sin(orbit.pitch) * orbit.distance,
    controlled.z + Math.cos(orbit.yaw) * horiz
  );
  camera.lookAt(controlled.x, controlled.y + 1, controlled.z);
}

function onWheel(event) {
  if (phase !== "play") return;
  event.preventDefault();
  const factor = event.deltaY > 0 ? 1.1 : 0.9;
  orbit.distance *= factor;
  placeCamera();
}

function onPointerDown(event) {
  if (phase !== "play" || !renderer || event.button > 2) return;
  drag.active = true;
  drag.button = event.button;
  drag.x = event.clientX;
  drag.y = event.clientY;
  drag.moved = false;
  drag.ctrl = event.ctrlKey;
}

function onPointerMove(event) {
  if (!drag.active || phase !== "play") return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  drag.x = event.clientX;
  drag.y = event.clientY;
  if (Math.hypot(dx, dy) > 3) drag.moved = true;
  if (!drag.moved || drag.button !== 0) return;
  orbit.yaw -= dx * 0.008;
  orbit.pitch -= dy * 0.005;
  placeCamera();
}

function onPointerUp(event) {
  if (!drag.active || event.button !== drag.button) return;
  const click = !drag.moved;
  const ctrl = drag.ctrl || event.ctrlKey;
  drag.active = false;
  if (click) onPointer(event, ctrl);
}

function looseColor(item) {
  if (item.kind === "wood") return "#a16207";
  if (item.kind === "stone") return "#94a3b8";
  if (item.kind === "food") return "#f97316";
  if (item.kind === "drink") return "#38bdf8";
  if (item.kind === "bed") return "#f8fafc";
  if (item.kind === "marker" && item.color && item.color !== "rainbow") return item.color;
  return "#eab308";
}

function addLoose(x, z, item) {
  const wide = item.kind === "bed";
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(wide ? 4 : 1.6, wide ? 0.55 : 1.6, wide ? 2.4 : 1.6),
    new THREE.MeshStandardMaterial({ color: materialColor(looseColor(item), "#eab308") })
  );
  mesh.position.set(x, TOP + (wide ? 0.4 : 0.8), z);
  mesh.userData.pickup = { ...item, count: 1 };
  scene.add(mesh);
  structures.push({ kind: "drop", x, z, w: wide ? 4 : 2, d: wide ? 2.4 : 2, h: 2, mesh });
}

function dropOnFloor(point) {
  if (!controlled || selected == null) return;
  const stack = controlled.inventory[selected];
  if (!stack) return;
  const room = stack.kind === "room";
  const x = Math.max(-HALF + (room ? 36 : 6), Math.min(HALF - (room ? 36 : 6), point.x));
  const z = Math.max(-HALF + (room ? 30 : 6), Math.min(HALF - (room ? 30 : 6), point.z));
  if (stack.kind === "chest") addChest(x, z);
  else if (stack.kind === "room") {
    openRoomPick(x, z);
    return;
  } else addLoose(x, z, stack);
  const kind = stack.kind;
  const id = stack.id;
  const name = stack.name;
  takeStack(controlled.inventory, kind, id);
  if (!controlled.inventory.some((entry) => entry.kind === kind && entry.id === id)) selected = null;
  placing = null;
  renderInventory();
  setStatus("Dejaste " + name + " en el piso.");
}

function takeLoose(mesh) {
  const item = mesh.userData.pickup;
  if (!item || !controlled) return;
  addStack(controlled.inventory, item);
  scene.remove(mesh);
  const index = structures.findIndex((entry) => entry.mesh === mesh);
  if (index >= 0) structures.splice(index, 1);
  renderInventory();
  setStatus("Levantaste " + item.name + ".");
}

function useSelected(floor) {
  const item = controlled && selected != null ? controlled.inventory[selected] : null;
  if (!item) return;
  if (item.kind === "marker") {
    if (!floor) {
      setStatus("Clic en la plataforma para pintar.");
      return;
    }
    paintMark(floor.point, item);
    setStatus(item.id === "arcoiris" ? "Escribiste arcoíris." : "Pintaste con " + item.name + ".");
    return;
  }
  if (item.kind === "food" || item.kind === "drink") {
    const name = item.name;
    const kind = item.kind;
    const id = item.id;
    takeStack(controlled.inventory, kind, id);
    if (!controlled.inventory.some((entry) => entry.kind === kind && entry.id === id)) selected = null;
    renderInventory();
    setStatus(controlled.name + (kind === "food" ? " comió " : " tomó ") + name + ".");
    return;
  }
  if (item.kind === "bed") {
    setStatus("Apretá E para dormir.");
    return;
  }
  setStatus("Ctrl + clic izquierdo deja " + item.name + " en el piso.");
}

function onPointer(event, ctrl) {
  if (phase !== "play" || !renderer || event.button !== 0) return;
  const hits = raycast(event);
  const chestHit = hits.find((hit) => hit.object.userData.chest);
  const looseHit = hits.find((hit) => hit.object.userData.pickup);
  const floor = hits.find((hit) => hit.object.userData.platform);
  const item = controlled && selected != null ? controlled.inventory[selected] : null;
  if ((ctrl || event.ctrlKey) && item && floor) {
    dropOnFloor(floor.point);
    return;
  }
  if (item) {
    useSelected(floor);
    return;
  }
  if (looseHit) {
    takeLoose(looseHit.object);
    return;
  }
  if (chestHit) {
    const chest = structures.find((entry) => entry.mesh === chestHit.object);
    if (chest) openChestPanel(chest);
  }
}

function renderControl() {
  const root = document.getElementById("controlList");
  if (!root.hidden) {
    root.hidden = true;
    return;
  }
  const list = alive();
  root.innerHTML = "";
  const cols = Math.max(1, Math.ceil(Math.sqrt(list.length)));
  const rows = Math.max(1, Math.ceil(list.length / cols));
  root.style.gridTemplateColumns = "repeat(" + cols + ", minmax(0, 1fr))";
  root.style.gridTemplateRows = "repeat(" + rows + ", minmax(0, 1fr))";
  root.hidden = false;
  list.forEach((actor) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack-btn";
    btn.textContent = actor.name;
    btn.style.color = actor.color;
    btn.addEventListener("click", () => {
      controlled = actor;
      root.hidden = true;
      renderInventory();
      setStatus("Ahora controlás a " + actor.name + ".");
    });
    root.appendChild(btn);
  });
}

document.getElementById("btnStart").addEventListener("click", () => {
  const list = document.getElementById("packList");
  list.innerHTML = "";
  const found = packs();
  if (!found.length) {
    list.textContent = "No hay packs. Creá uno en Packs y volvé.";
  }
  found.forEach((pack) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack-btn";
    btn.textContent = (pack.name || "Pack") + " · " + ((pack.marbles && pack.marbles.length) || 0);
    btn.addEventListener("click", () => startPack(pack));
    list.appendChild(btn);
  });
  show("screenPacks");
});
document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
document.getElementById("btnAgain").addEventListener("click", () => document.getElementById("btnStart").click());
document.getElementById("btnControl").addEventListener("click", renderControl);
document.getElementById("btnCraft").addEventListener("click", () => {
  document.getElementById("craftPanel").hidden = !document.getElementById("craftPanel").hidden;
  bedPick = null;
  renderCraft();
});
document.getElementById("btnDoCraft").addEventListener("click", () => {
  tryCraft().catch(() => setStatus("No se pudo juntar la cama."));
});
document.getElementById("btnClearCraft").addEventListener("click", () => {
  craft.forEach((item) => item && returnCraftItem(item));
  craft = Array(9).fill(null);
  renderCraft();
  renderInventory();
});
document.getElementById("btnCloseChest").addEventListener("click", () => {
  document.getElementById("chestPanel").hidden = true;
  openChest = null;
});
document.getElementById("btnRoomDone").addEventListener("click", confirmRoom);
document.getElementById("btnRoomCancel").addEventListener("click", () => {
  closeRoomPick();
  setStatus("No se colocó la habitación.");
});
document.getElementById("btnLeave").addEventListener("click", () => finish(null, true));

function sleepKey() {
  if (phase !== "play" || !controlled || !controlled.alive) return;
  const picker = document.getElementById("roomPick");
  if (picker && !picker.hidden) return;
  if (controlled.asleep) {
    const current = controlled.inventory.find((item) => item.kind === "bed" && item.id === controlled.bedId) || { id: controlled.bedId };
    if (current.id && doubleBeds[current.id]) toggleSleep(current);
    else {
      controlled.asleep = false;
      controlled.bedId = null;
      setStatus(controlled.name + " se despertó.");
    }
    return;
  }
  const beds = controlled.inventory.filter((item) => item.kind === "bed");
  const hasRoom = (item) => {
    const record = doubleBeds[item.id];
    if (!record) return true;
    if ((item.double || item.triple) && record.owners && !record.owners.includes(controlled.id)) return false;
    return record.sleepers.length < (record.seats || item.seats || (item.triple ? 3 : item.double ? 2 : 1));
  };
  let bed = beds.find((item) => item.triple && hasRoom(item)) || beds.find((item) => item.double && hasRoom(item)) || beds.find((item) => !item.double && !item.triple && hasRoom(item)) || null;
  if (!bed) {
    const saved = ensureBed({ id: controlled.id, name: controlled.name, color: controlled.color, packId: controlled.packId });
    bed = {
      kind: "bed",
      id: saved.id,
      name: "Cama de " + controlled.name,
      image: saved.sheet,
      pillow: saved.pillow,
      ownerId: controlled.id,
      count: 1
    };
    addStack(controlled.inventory, bed);
    renderInventory();
  }
  if (!doubleBeds[bed.id]) {
    doubleBeds[bed.id] = {
      id: bed.id,
      owners: bed.owners || [bed.ownerId || controlled.id],
      seats: bed.seats || (bed.triple ? 3 : bed.double ? 2 : 1),
      sheet: bed.image,
      pillow: bed.pillow,
      sleepers: [],
      mesh: null,
      x: 0,
      z: 0
    };
  }
  toggleSleep(bed);
}

window.addEventListener("keydown", (event) => {
  if (phase !== "play") return;
  const map = { KeyW: "w", ArrowUp: "w", KeyA: "a", ArrowLeft: "a", KeyS: "s", ArrowDown: "s", KeyD: "d", ArrowRight: "d" };
  if (event.code === "KeyE") {
    event.preventDefault();
    sleepKey();
    return;
  }
  if (map[event.code]) {
    event.preventDefault();
    keys[map[event.code]] = true;
  }
});
window.addEventListener("keyup", (event) => {
  const map = { KeyW: "w", ArrowUp: "w", KeyA: "a", ArrowLeft: "a", KeyS: "s", ArrowDown: "s", KeyD: "d", ArrowRight: "d" };
  if (map[event.code]) keys[map[event.code]] = false;
});

requestAnimationFrame(loop);
