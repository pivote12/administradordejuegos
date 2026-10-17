(function () {
  "use strict";

  GameI18n.init("marble-escape");

  function t(key, vars) {
    return GameI18n.t(key, vars);
  }

  const STORAGE_KEY = "marble-escape-saves-v2";
  const BACKUP_KEY = "marble-escape-saves-v2-bak";
  const LEGACY_KEY = "marble-escape-inventory";
  const MIN_MARBLES = 3;
  const SKIP_ROUND = 1234567890;
  const BASE_SLOTS = 5;
  const EXTRA_SLOTS = 5;
  const MAX_TOP_TIE = 5;
  const ITEM_NAME_MAX = 100;
  const WIDTH = 1000;
  const HEIGHT = 600;
  const RADIUS = 14;
  const GRAVITY = 0.3;
  const MAX_SPEED = 9;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const screens = {
    slots: document.getElementById("slotScreen"),
    menu: document.getElementById("menuScreen"),
    create: document.getElementById("createScreen"),
    packs: document.getElementById("packsScreen"),
    packEditor: document.getElementById("packEditorScreen"),
    faceEditor: document.getElementById("faceEditorScreen"),
    foodLikes: document.getElementById("foodLikesScreen"),
    game: document.getElementById("gameScreen"),
    textAnim: document.getElementById("textAnimScreen"),
    levelEditor: document.getElementById("levelEditorScreen")
  };

  const ui = {
    slotList: document.getElementById("slotList"),
    slotCounter: document.getElementById("slotCounter"),
    saveName: document.getElementById("saveName"),
    renameSave: document.getElementById("renameSaveButton"),
    roundBadge: document.getElementById("roundBadge"),
    count: document.getElementById("marbleCount"),
    list: document.getElementById("marbleList"),
    empty: document.getElementById("emptyInventory"),
    leaderboard: document.getElementById("leaderboard"),
    play: document.getElementById("playButton"),
    minigames: document.getElementById("minigamesButton"),
    minigamesNeed: document.getElementById("minigamesNeed"),
    roleplay: document.getElementById("roleplayButton"),
    roleplayLegend: document.getElementById("roleplayLegend"),
    roleplayFaces: document.getElementById("roleplayFaces"),
    roleplayFaceList: document.getElementById("roleplayFaceList"),
    roleplayFoodList: document.getElementById("roleplayFoodList"),
    roleplayDrinkList: document.getElementById("roleplayDrinkList"),
    roleplaySave: document.getElementById("roleplaySaveButton"),
    marbleChat: document.getElementById("marbleChatButton"),
    marbleChatPanel: document.getElementById("marbleChatPanel"),
    marbleChatGroupList: document.getElementById("marbleChatGroupList"),
    marbleChatAddGroup: document.getElementById("marbleChatAddGroup"),
    marbleChatBack: document.getElementById("marbleChatBack"),
    marbleChatTitle: document.getElementById("marbleChatTitle"),
    marbleChatMessages: document.getElementById("marbleChatMessages"),
    marbleChatForm: document.getElementById("marbleChatForm"),
    marbleChatSender: document.getElementById("marbleChatSender"),
    marbleChatInput: document.getElementById("marbleChatInput"),
    canvasWrap: document.querySelector(".canvas-wrap"),
    createFace: document.getElementById("createFaceButton"),
    createFaceMenu: document.getElementById("createFaceButtonMenu"),
    createFood: document.getElementById("createFoodButton"),
    createFoodMenu: document.getElementById("createFoodButtonMenu"),
    createFoodSlots: document.getElementById("createFoodButtonSlots"),
    createFoodLikes: document.getElementById("createFoodButtonLikes"),
    createDrink: document.getElementById("createDrinkButton"),
    createDrinkMenu: document.getElementById("createDrinkButtonMenu"),
    createDrinkSlots: document.getElementById("createDrinkButtonSlots"),
    createDrinkLikes: document.getElementById("createDrinkButtonLikes"),
    foodLikes: document.getElementById("foodLikesButton"),
    foodHates: document.getElementById("foodHatesButton"),
    foodLikesTitle: document.getElementById("foodLikesTitle"),
    foodLikesHintText: document.getElementById("foodLikesHintText"),
    foodLikesList: document.getElementById("foodLikesList"),
    emptyFoods: document.getElementById("emptyFoods"),
    menuFoodList: document.getElementById("menuFoodList"),
    menuDrinkList: document.getElementById("menuDrinkList"),
    foodNameLabel: document.getElementById("foodNameLabel"),
    faceEditorTitle: document.getElementById("faceEditorTitle"),
    faceEditorHint: document.getElementById("faceEditorHint"),
    faceColorWrap: document.getElementById("faceColorWrap"),
    faceColor: document.getElementById("faceColor"),
    foodMetaWrap: document.getElementById("foodMetaWrap"),
    foodName: document.getElementById("foodName"),
    foodVariantWrap: document.getElementById("foodVariantWrap"),
    foodVariantName: document.getElementById("foodVariantName"),
    foodAddVariant: document.getElementById("foodAddVariant"),
    foodDelVariant: document.getElementById("foodDelVariant"),
    addHouse: document.getElementById("addHouseButton"),
    houseNav: document.getElementById("houseNav"),
    leaveHouse: document.getElementById("leaveHouseButton"),
    houseMarbleList: document.getElementById("houseMarbleList"),
    menuFaceList: document.getElementById("menuFaceList"),
    faceCanvas: document.getElementById("faceCanvas"),
    faceFrameLabel: document.getElementById("faceFrameLabel"),
    faceFrameShortcuts: document.getElementById("faceFrameShortcuts"),
    saveFace: document.getElementById("saveFaceButton"),
    cancelFaceEditor: document.getElementById("cancelFaceEditor"),
    copyFaceFrame: document.getElementById("copyFaceFrame"),
    pasteFaceFrame: document.getElementById("pasteFaceFrame"),
    faceUndo: document.getElementById("faceUndo"),
    faceRedo: document.getElementById("faceRedo"),
    faceGrow: document.getElementById("faceGrow"),
    faceShrink: document.getElementById("faceShrink"),
    faceRotate: document.getElementById("faceRotate"),
    minigameModal: document.getElementById("minigameModal"),
    minigameBrowse: document.getElementById("minigameBrowse"),
    minigameCloseRow: document.getElementById("minigameCloseRow"),
    foodFeastMode: document.getElementById("foodFeastMode"),
    foodFeastLimited: document.getElementById("foodFeastLimited"),
    foodFeastUnlimited: document.getElementById("foodFeastUnlimited"),
    foodFeastModeBack: document.getElementById("foodFeastModeBack"),
    minigameList: document.getElementById("minigameList"),
    campaignLegend: document.getElementById("campaignLegend"),
    minigameLegend: document.getElementById("minigameLegend"),
    minigameHint: document.getElementById("minigameHint"),
    splitPairNav: document.getElementById("splitPairNav"),
    splitPairBack: document.getElementById("splitPairBack"),
    splitPairRooms: document.getElementById("splitPairRooms"),
    teamSpikeNav: document.getElementById("teamSpikeNav"),
    teamSpikePrev: document.getElementById("teamSpikePrev"),
    teamSpikeNext: document.getElementById("teamSpikeNext"),
    teamSpikeLabel: document.getElementById("teamSpikeLabel"),
    modeBadge: document.getElementById("modeBadge"),
    createMap: document.getElementById("createMapButton"),
    createMinigame: document.getElementById("createMinigameButton"),
    customMapList: document.getElementById("customMapList"),
    customMiniList: document.getElementById("customMiniList"),
    levelEditorTitle: document.getElementById("levelEditorTitle"),
    levelEditorHint: document.getElementById("levelEditorHint"),
    levelEditorNext: document.getElementById("levelEditorNext"),
    levelEditorPlace: document.getElementById("levelEditorPlace"),
    levelEditorName: document.getElementById("levelEditorName"),
    levelEditorDiff: document.getElementById("levelEditorDiff"),
    levelPartList: document.getElementById("levelPartList"),
    levelInvisibleWrap: document.getElementById("levelInvisibleWrap"),
    levelInvisibleList: document.getElementById("levelInvisibleList"),
    levelEditorCanvas: document.getElementById("levelEditorCanvas"),
    levelDeletePart: document.getElementById("levelDeletePart"),
    levelGrowX: document.getElementById("levelGrowX"),
    levelShrinkX: document.getElementById("levelShrinkX"),
    levelGrowY: document.getElementById("levelGrowY"),
    levelShrinkY: document.getElementById("levelShrinkY"),
    levelRotate: document.getElementById("levelRotate"),
    levelEraser: document.getElementById("levelEraser"),
    levelEditScript: document.getElementById("levelEditScript"),
    scriptEditPanel: document.getElementById("scriptEditPanel"),
    scriptEditTitle: document.getElementById("scriptEditTitle"),
    scriptEditFields: document.getElementById("scriptEditFields"),
    scriptEditDone: document.getElementById("scriptEditDone"),
    levelNameInput: document.getElementById("levelNameInput"),
    levelDiffInput: document.getElementById("levelDiffInput"),
    levelDiffLabel: document.getElementById("levelDiffLabel"),
    levelFinishButton: document.getElementById("levelFinishButton"),
    create: document.getElementById("createButton"),
    rejoin: document.getElementById("rejoinButton"),
    eliminatedPanel: document.getElementById("eliminatedPanel"),
    eliminatedList: document.getElementById("eliminatedList"),
    modalRejoin: document.getElementById("modalRejoin"),
    modalRejoinButton: document.getElementById("modalRejoinButton"),
    modalRejoinPicker: document.getElementById("modalRejoinPicker"),
    modalRejoinList: document.getElementById("modalRejoinList"),
    requirement: document.getElementById("playRequirement"),
    creationLocked: document.getElementById("creationLocked"),
    packPlacementPanel: document.getElementById("packPlacementPanel"),
    packPlacementList: document.getElementById("packPlacementList"),
    noPacksForSave: document.getElementById("noPacksForSave"),
    packList: document.getElementById("packList"),
    emptyPacks: document.getElementById("emptyPacks"),
    packEditorTitle: document.getElementById("packEditorTitle"),
    packName: document.getElementById("packName"),
    packMarbleForm: document.getElementById("packMarbleForm"),
    packMarbleName: document.getElementById("packMarbleName"),
    packMarbleColor: document.getElementById("packMarbleColor"),
    packDraftList: document.getElementById("packDraftList"),
    emptyPackDraft: document.getElementById("emptyPackDraft"),
    packGenderButton: document.getElementById("packGenderButton"),
    packGenderNeed: document.getElementById("packGenderNeed"),
    packGenderPanel: document.getElementById("packGenderPanel"),
    packGenderList: document.getElementById("packGenderList"),
    packPairPanel: document.getElementById("packPairPanel"),
    packPairList: document.getElementById("packPairList"),
    packPairForm: document.getElementById("packPairForm"),
    savePairPanel: document.getElementById("savePairPanel"),
    saveGenderList: document.getElementById("saveGenderList"),
    savePairList: document.getElementById("savePairList"),
    savePairForm: document.getElementById("savePairForm"),
    createPairBox: document.getElementById("createPairBox"),
    createPairSelect: document.getElementById("createPairSelect"),
    form: document.getElementById("createForm"),
    name: document.getElementById("marbleName"),
    color: document.getElementById("marbleColor"),
    preview: document.getElementById("marblePreview"),
    createGenderNeed: document.getElementById("createGenderNeed"),
    createGenderMale: document.getElementById("createGenderMale"),
    createGenderFemale: document.getElementById("createGenderFemale"),
    levelTitle: document.getElementById("levelTitle"),
    status: document.getElementById("gameStatus"),
    modal: document.getElementById("messageModal"),
    modalIcon: document.getElementById("messageIcon"),
    modalTitle: document.getElementById("messageTitle"),
    modalText: document.getElementById("messageText"),
    nextRound: document.getElementById("nextRoundButton"),
    recordButton: document.getElementById("recordButton"),
    recordBadge: document.getElementById("recordBadge"),
    recToast: document.getElementById("recToast"),
    songPicker: document.getElementById("songPicker"),
    songList: document.getElementById("songList"),
    showTopMarbleButtons: Array.from(document.querySelectorAll(".js-show-top-marble")),
    topShowcases: Array.from(document.querySelectorAll(".top-marble-showcase"))
  };

  let data = loadData();
  if (!Array.isArray(data.faces)) data.faces = [];
  if (!Array.isArray(data.foods)) data.foods = [];
  if (!Array.isArray(data.customMaps)) data.customMaps = [];
  if (!Array.isArray(data.customMinigames)) data.customMinigames = [];
  if (!Array.isArray(data.packs)) data.packs = [];
  data.packs = mergeIncomingPacks(data.packs);
  migrateFoodTastes();
  if (syncAllSaveGendersFromPacks()) persist();
  else if (data.packs.length) syncSharedPacksOut();
  let activeSlot = null;
  let currentRound = 0;
  let currentMap = null;
  let marbles = [];
  let particles = [];
  let playing = false;
  let roundCommitted = false;
  let lastTime = 0;
  let frameId = null;
  let editingPackId = null;
  let packDraft = [];
  let packGenderOpen = false;
  let createMarbleGender = "";
  let lastRoundSummary = null;
  let mapTest = false;
  let levelEditor = null;
  let recorder = null;
  let recordChunks = [];
  let canvasStream = null;
  let recToastTimer = null;
  let recordingActive = false;
  let recordMix = null;
  let topShowcaseOpen = false;
  let rejoinPickerOpen = false;
  let minigame = null;
  let roleplay = null;
  let marbleChatOpen = false;
  let faceEditor = null;
  let faceClipboard = { frame: null, faceId: "" };
  let foodTasteMode = "like";
  let foodThumbDrag = null;
  let roundSpeed = 1;
  const RP_WIDTH = 8000;
  const RP_HEIGHT = 6000;
  const FACE_SIZE = 256;
  const FACE_FPS = 8;
  const DROP_HIT = document.createElement("canvas").getContext("2d");

  function makeDropPath(size) {
    const path = new Path2D();
    const cx = size / 2;
    path.moveTo(cx, size * 0.03);
    path.bezierCurveTo(size * 0.70, size * 0.28, size * 0.94, size * 0.48, size * 0.94, size * 0.68);
    path.bezierCurveTo(size * 0.94, size * 0.90, size * 0.75, size * 0.975, cx, size * 0.975);
    path.bezierCurveTo(size * 0.25, size * 0.975, size * 0.06, size * 0.90, size * 0.06, size * 0.68);
    path.bezierCurveTo(size * 0.06, size * 0.48, size * 0.30, size * 0.28, cx, size * 0.03);
    path.closePath();
    return path;
  }

  const DROP_PATH = makeDropPath(FACE_SIZE);

  function pointInDrop(x, y) {
    return DROP_HIT.isPointInPath(DROP_PATH, x, y);
  }

  function editorIsEdible() {
    return !!(faceEditor && (faceEditor.kind === "food" || faceEditor.kind === "drink"));
  }

  function editorIsDrink() {
    return !!(faceEditor && faceEditor.kind === "drink");
  }

  function editorIsFood() {
    return !!(faceEditor && faceEditor.kind === "food");
  }

  function edibleKind(item) {
    return item && item.kind === "drink" ? "drink" : "food";
  }

  function edibleDefaultName(item) {
    return t(edibleKind(item) === "drink" ? "createDrink" : "createFood");
  }

  function listedEdibles(kind) {
    return (data.foods || []).filter((food) => edibleKind(food) === kind);
  }

  function clipDrinkFrame(frame) {
    if (!frame) return;
    const g = frame.getContext("2d");
    g.save();
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = "#000";
    g.fill(DROP_PATH);
    g.restore();
  }

  function clipCurrentDrinkFrame() {
    if (!editorIsDrink()) return;
    clipDrinkFrame(faceEditor && faceEditor.frames && faceEditor.frames[faceEditor.index]);
  }

  function withDrinkClip(ctx, fn) {
    if (!editorIsDrink()) {
      fn();
      return;
    }
    ctx.save();
    ctx.clip(DROP_PATH);
    fn();
    ctx.restore();
  }

  function bottleInnerPath(size) {
    const path = new Path2D();
    const cx = size / 2;
    path.moveTo(cx - 13, 54);
    path.lineTo(cx - 13, 88);
    path.bezierCurveTo(cx - 13, 104, cx - 56, 114, cx - 68, 130);
    path.lineTo(cx - 72, 214);
    path.bezierCurveTo(cx - 72, 238, cx - 38, 248, cx, 248);
    path.bezierCurveTo(cx + 38, 248, cx + 72, 238, cx + 72, 214);
    path.lineTo(cx + 68, 130);
    path.bezierCurveTo(cx + 56, 114, cx + 13, 104, cx + 13, 88);
    path.lineTo(cx + 13, 54);
    path.closePath();
    return path;
  }

  function bottleOuterPath(size) {
    const path = new Path2D();
    const cx = size / 2;
    path.moveTo(cx - 20, 42);
    path.lineTo(cx - 20, 86);
    path.bezierCurveTo(cx - 20, 104, cx - 64, 114, cx - 78, 130);
    path.lineTo(cx - 82, 214);
    path.bezierCurveTo(cx - 82, 244, cx - 42, 254, cx, 254);
    path.bezierCurveTo(cx + 42, 254, cx + 82, 244, cx + 82, 214);
    path.lineTo(cx + 78, 130);
    path.bezierCurveTo(cx + 64, 114, cx + 20, 104, cx + 20, 86);
    path.lineTo(cx + 20, 42);
    path.closePath();
    return path;
  }

  function composeDrinkBottle(dropFrame) {
    const out = blankFaceFrame();
    const g = out.getContext("2d");
    const s = FACE_SIZE;
    const cx = s / 2;
    const inner = bottleInnerPath(s);
    const outer = bottleOuterPath(s);
    g.fillStyle = "rgba(186, 230, 253, 0.42)";
    g.fill(outer);
    g.save();
    g.clip(inner);
    g.drawImage(dropFrame, cx - 78, 44, 156, 208);
    g.restore();
    g.save();
    g.clip(outer);
    g.fillStyle = "rgba(255, 255, 255, 0.22)";
    g.beginPath();
    g.ellipse(cx - 38, 152, 14, 72, -0.12, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.strokeStyle = "rgba(255, 255, 255, 0.7)";
    g.lineWidth = 6;
    g.stroke(outer);
    g.strokeStyle = "#64748b";
    g.lineWidth = 3;
    g.stroke(outer);
    g.fillStyle = "#94a3b8";
    g.fillRect(cx - 24, 38, 48, 10);
    g.fillStyle = "#e2e8f0";
    g.fillRect(cx - 22, 40, 44, 3);
    g.fillStyle = "#1e293b";
    g.beginPath();
    if (typeof g.roundRect === "function") g.roundRect(cx - 30, 6, 60, 34, 8);
    else g.rect(cx - 30, 6, 60, 34);
    g.fill();
    g.fillStyle = "#475569";
    g.fillRect(cx - 26, 12, 52, 6);
    g.fillStyle = "#cbd5e1";
    g.fillRect(cx - 18, 14, 36, 2);
    return out;
  }
  const HOUSE_W = 640;
  const HOUSE_H = 520;
  const HOUSE_ROOMS = ["sala", "cocina", "bano", "dorm1", "dorm2"];
  const RP_ZOOM = 0.28;
  const RP_FOOD_SIZE = 40;
  const faceImageCache = new Map();

  function MT(es, en) {
    return { es, en, pt: es, fr: en, de: en, it: en };
  }

  const MINIGAME_CORE = [
    { id: "race", icon: "🏁", kind: "race", hue: 28, duration: 22, title: MT("Carrera turbo", "Turbo race"), hint: MT("Clic para dar boost. La primera en la meta gana.", "Click to boost. First to the finish wins.") },
    { id: "stars", icon: "⭐", kind: "collectFloor", hue: 265, duration: 20, item: "star", itemDir: "down", title: MT("Lluvia de estrellas", "Star rain"), hint: MT("Clic para mover una pelota y atrapar estrellas.", "Click to move a marble and catch stars.") },
    { id: "bump", icon: "💥", kind: "arena", hue: 330, duration: 28, shrink: true, title: MT("Arena de empujones", "Bump arena"), hint: MT("Clic para empujar. Quedate en el círculo que se achica.", "Click to shove. Stay in the shrinking circle.") },
    { id: "orbs", icon: "🔮", kind: "collectFloat", hue: 195, duration: 20, item: "orb", click: "dash", title: MT("Caza de orbes", "Orb hunt"), hint: MT("Clic para lanzar la pelota más cercana hacia un orbe.", "Click to dash the nearest marble toward an orb.") },
    { id: "magnet", icon: "🧲", kind: "magnet", hue: 0, duration: 20, item: "coin", click: "pull", title: MT("Imán loco", "Crazy magnet"), hint: MT("Clic para atraer la pelota hacia el cursor y juntar monedas.", "Click to pull a marble toward the cursor and grab coins.") },
    { id: "meteors", icon: "☄️", kind: "dodgeFall", hue: 18, duration: 22, title: MT("Lluvia de meteoros", "Meteor rain"), hint: MT("Clic para esquivar. No dejes que te caiga un meteoro.", "Click to dodge. Don't get hit by a meteor.") },
    { id: "hoops", icon: "⭕", kind: "hoops", hue: 45, duration: 22, title: MT("Aros voladores", "Flying hoops"), hint: MT("Clic para saltar y pasar por los aros.", "Click to jump through the hoops.") },
    { id: "paint", icon: "🎨", kind: "paint", hue: 300, duration: 20, title: MT("Pintar el piso", "Paint the floor"), hint: MT("Clic para empujar. Pintá la mayor cantidad de casillas.", "Click to shove. Paint as many tiles as you can.") },
    { id: "king", icon: "👑", kind: "king", hue: 48, duration: 22, title: MT("Rey de la plataforma", "King of the platform"), hint: MT("Clic para saltar. Quedate arriba de la plataforma móvil.", "Click to jump. Stay on the moving platform.") },
    { id: "slide", icon: "🪙", kind: "collectSide", hue: 50, duration: 20, item: "coin", itemDir: "side", title: MT("Monedas deslizantes", "Sliding coins"), hint: MT("Clic para moverte y atrapar las monedas que cruzan.", "Click to move and catch coins sliding across.") },
    { id: "pinball", icon: "🧿", kind: "pinball", hue: 210, duration: 22, title: MT("Pinball", "Pinball"), hint: MT("Clic para impulsar. Rebotá en los bumpers.", "Click to launch. Bounce off the bumpers.") },
    { id: "soccer", icon: "⚽", kind: "soccer", hue: 130, duration: 24, title: MT("Golazo", "Goal rush"), hint: MT("Clic para patear. Mandá la pelota grande al arco.", "Click to kick. Send the big ball into the goal.") },
    { id: "sumo", icon: "🤼", kind: "sumo", hue: 25, duration: 24, shrink: false, title: MT("Sumo", "Sumo"), hint: MT("Clic para empujar a las otras afuera del círculo.", "Click to shove others out of the ring.") },
    { id: "ice", icon: "🧊", kind: "ice", hue: 190, duration: 20, title: MT("Pista helada", "Ice rink"), hint: MT("Clic para frenar o empujar. El hielo resbala mucho.", "Click to brake or shove. The ice is very slippery.") },
    { id: "balloons", icon: "🎈", kind: "collectRise", hue: 345, duration: 20, item: "balloon", itemDir: "up", title: MT("Caza globos", "Balloon hunt"), hint: MT("Clic para moverte y pinchar los globos que suben.", "Click to move and pop rising balloons.") },
    { id: "laser", icon: "🔦", kind: "laser", hue: 355, duration: 22, title: MT("Láser", "Laser"), hint: MT("Clic para dash. El láser barre la arena.", "Click to dash. The laser sweeps the arena.") },
    { id: "flash", icon: "⚡", kind: "flash", hue: 55, duration: 20, title: MT("Toque relámpago", "Lightning tap"), hint: MT("Cuando una pelota brilla, hacé clic en ella.", "When a marble flashes, click it.") },
    { id: "belts", icon: "➡️", kind: "belts", hue: 200, duration: 22, title: MT("Cintas transportadoras", "Conveyor belts"), hint: MT("Clic para saltar entre cintas. No te caigas.", "Click to jump between belts. Don't fall.") },
    { id: "blackhole", icon: "🕳️", kind: "blackhole", hue: 270, duration: 22, title: MT("Agujero negro", "Black hole"), hint: MT("Clic para escapar del centro y juntar gemas afuera.", "Click to escape the center and collect outer gems.") },
    { id: "volley", icon: "🏐", kind: "volley", hue: 160, duration: 22, title: MT("Vóley", "Volley"), hint: MT("Clic para golpear. No dejes caer la pelota.", "Click to hit. Don't let the ball drop.") },
    { id: "maze", icon: "🧩", kind: "maze", hue: 175, duration: 24, title: MT("Laberinto", "Maze"), hint: MT("Clic para dash. Llegá a la salida verde.", "Click to dash. Reach the green exit.") },
    { id: "potato", icon: "🥔", kind: "potato", hue: 32, duration: 20, title: MT("Papa caliente", "Hot potato"), hint: MT("Clic en otra pelota para pasarle la papa.", "Click another marble to pass the potato.") },
    { id: "flipgrav", icon: "↕️", kind: "flipgrav", hue: 220, duration: 20, title: MT("Gravedad invertida", "Gravity flip"), hint: MT("Clic para dar vuelta la gravedad de esa pelota.", "Click to flip that marble's gravity.") },
    { id: "targets", icon: "🎯", kind: "targets", hue: 8, duration: 20, title: MT("Tiro al blanco", "Target shot"), hint: MT("Clic para lanzar una pelota contra los blancos.", "Click to launch a marble into the targets.") },
    { id: "snow", icon: "❄️", kind: "snow", hue: 205, duration: 22, slow: true, title: MT("Nevada", "Snowfall"), hint: MT("Clic para correr. Evitá los copos grandes.", "Click to run. Avoid the big snowflakes.") },
    { id: "portals", icon: "🌀", kind: "portals", hue: 280, duration: 22, title: MT("Portales", "Portals"), hint: MT("Clic para dash. Los portales te teletransportan.", "Click to dash. Portals teleport you.") },
    { id: "rhythm", icon: "🎵", kind: "rhythm", hue: 310, duration: 20, title: MT("Ritmo", "Rhythm"), hint: MT("Clic en una pelota cuando el anillo la toque.", "Click a marble when the ring touches it.") },
    { id: "hooks", icon: "🪝", kind: "hooks", hue: 15, duration: 22, thin: true, title: MT("Ganchos", "Hooks"), hint: MT("Clic para zafar. Baján ganchos desde arriba.", "Click to escape. Hooks drop from above.") },
    { id: "bubbles", icon: "🫧", kind: "bubbles", hue: 185, duration: 20, item: "bubble", click: "dash", staticItems: true, title: MT("Burbujas", "Bubbles"), hint: MT("Clic para lanzar y reventar las burbujas quietas.", "Click to dash and pop the still bubbles.") },
    { id: "tornado", icon: "🌪️", kind: "tornado", hue: 230, duration: 22, title: MT("Tornado", "Tornado"), hint: MT("Clic para pelear la corriente y juntar hojas.", "Click to fight the current and grab leaves.") },
    { id: "mirror", icon: "🪞", kind: "mirror", hue: 250, duration: 20, item: "gem", click: "mirror", title: MT("Controles espejo", "Mirror controls"), hint: MT("Clic: la pelota va al lado contrario.", "Click: the marble goes the opposite way.") },
    { id: "relay", icon: "🚩", kind: "relay", hue: 140, duration: 24, title: MT("Postas", "Relay flags"), hint: MT("Clic para dash. Tocá las banderas en orden.", "Click to dash. Hit the flags in order.") },
    { id: "ghost", icon: "👻", kind: "ghost", hue: 260, duration: 22, title: MT("Fantasma", "Ghost"), hint: MT("Clic para huir. El fantasma persigue pelotas.", "Click to flee. The ghost chases marbles.") },
    { id: "mosaic", icon: "🟦", kind: "mosaic", hue: 215, duration: 20, title: MT("Zonas de color", "Color zones"), hint: MT("Clic para moverte. Quedate en tu zona de color.", "Click to move. Stay in your color zone.") },
    { id: "foodfeast", icon: "🍽", kind: "foodfeast", hue: 32, duration: 0, click: "dash", title: MT("Banquete", "Food feast"), hint: MT("Al jugar, elegí con límite o sin límite. Si la comida es tuya, solo juegan las que les gusta.", "When you play, pick with or without a limit. If the food is yours, only marbles that like it play.") },
    { id: "splitlove", icon: "💘", kind: "splitlove", hue: 330, duration: 0, click: "dash", title: MT("Círculos de pareja", "Couple circles"), hint: MT("Chicos a la izquierda, chicas a la derecha. Mandá uno de cada lado al tubo del techo. La cámara va al círculo cerrado de esa pareja; con ← volvés y cada círculo tiene su botón. Los círculos quedan para siempre y no se pueden borrar.", "Boys on the left, girls on the right. Send one from each side into the ceiling tube. The camera pans to that couple's locked circle; ← goes back and each circle has its own button. Circles stay forever and cannot be deleted.") },
    { id: "lockpair", icon: "🔒", kind: "lockpair", hue: 318, duration: 0, click: "dash", title: MT("Sala cerrada", "Locked room"), hint: MT("Un chico al azar queda atrapado con una chica al azar. El resto no entra. Cada partida sortea de nuevo.", "A random boy is stuck with a random girl. Everyone else is out. Each play rerolls the pair.") },
    { id: "boxescape", icon: "📦", kind: "boxescape", hue: 28, duration: 0, click: "dash", title: MT("Caja atascada", "Stuck box"), hint: MT("Todas las pelotas empiezan atrapadas en una caja. Más pelotas = caja más grande. La última en salir se saltea el próximo nivel de la campaña.", "Every marble starts stuck in a box. More marbles = bigger box. The last one out automatically skips the next campaign level.") },
    { id: "teamspike", icon: "📍", kind: "teamspike", hue: 200, duration: 0, click: "dash", title: MT("Pincho de equipos", "Team spike"), hint: MT("Cada partida elige un Lugar De Tipo al azar y usa sus equipos. Todas las pelotitas de cada equipo pasan por el tubo. Si ese lugar no está terminado, solo juegan las que ya tienen equipo. La última que queda le da a su equipo un minijuego a elección, y lo juegan solos, sin pelotitas de otros equipos.", "Each play picks a random Type Place and uses its teams. Every marble on each team goes through the tube. If that place is not finished, only marbles that already have a team play. The last marble left gives their team a minigame of their choice, and they play it alone, with no marbles from other teams.") }
  ];

  const COMBO_MOVES = [
    { id: "floor", hint: MT("Hay piso y gravedad.", "There's a floor and gravity.") },
    { id: "float", hint: MT("Flotás libre.", "You float freely.") },
    { id: "ice", hint: MT("La pista resbala.", "The ice is slippery.") },
    { id: "spin", hint: MT("Hay un remolino.", "There's a swirl.") },
    { id: "hole", hint: MT("El centro te atrae.", "The center pulls you in.") },
    { id: "belt", hint: MT("Hay cintas transportadoras.", "There are conveyor belts.") },
    { id: "flip", hint: MT("La gravedad se puede dar vuelta.", "Gravity can flip.") }
  ];
  const COMBO_CLICKS = [
    { id: "dash", hint: MT("Clic: dash.", "Click: dash.") },
    { id: "pull", hint: MT("Clic: imán.", "Click: magnet.") },
    { id: "shove", hint: MT("Clic: empujón.", "Click: shove.") },
    { id: "boost", hint: MT("Clic: boost.", "Click: boost.") },
    { id: "jump", hint: MT("Clic: salto.", "Click: jump.") },
    { id: "invert", hint: MT("Clic: al revés.", "Click: opposite way.") },
    { id: "brake", hint: MT("Clic: freno.", "Click: brake.") },
    { id: "tap", hint: MT("Clic: toque.", "Click: tap.") },
    { id: "pass", hint: MT("Clic: pasar el token.", "Click: pass the token.") }
  ];
  const COMBO_GOALS = [
    { id: "collect", icon: "⭐", hint: MT("Juntá objetos.", "Collect items.") },
    { id: "survive", icon: "💥", hint: MT("Sobreviví.", "Survive.") },
    { id: "race", icon: "🏁", hint: MT("Llegá a la meta.", "Reach the finish.") },
    { id: "paint", icon: "🎨", hint: MT("Pintá el piso.", "Paint the floor.") },
    { id: "flags", icon: "🚩", hint: MT("Tocá banderas en orden.", "Hit flags in order.") },
    { id: "zones", icon: "🟦", hint: MT("Quedate en tu zona.", "Stay in your zone.") },
    { id: "hoops", icon: "⭕", hint: MT("Pasá por aros.", "Go through hoops.") },
    { id: "kick", icon: "⚽", hint: MT("Meté goles.", "Score goals.") },
    { id: "flash", icon: "⚡", hint: MT("Tocá la que brilla.", "Tap the glowing one.") },
    { id: "exit", icon: "🧩", hint: MT("Llegá a la salida.", "Reach the exit.") }
  ];
  const COMBO_HAZARDS = [
    { id: "none", hint: MT("", "") },
    { id: "fall", hint: MT("Evitá lo que cae.", "Avoid falling stuff.") },
    { id: "laser", hint: MT("Cuidado con el láser.", "Watch the laser.") },
    { id: "ghost", hint: MT("Huí del fantasma.", "Flee the ghost.") },
    { id: "shrink", hint: MT("El círculo se achica.", "The ring shrinks.") },
    { id: "wind", hint: MT("Hay viento.", "There's wind.") },
    { id: "hooks", hint: MT("Bajan ganchos.", "Hooks drop from above.") }
  ];

  function buildExtraMinigames(count) {
    const adjectives = [
      "Ácido", "Astral", "Atómico", "Boreal", "Brutal", "Caótico", "Cítrico", "Cósmico", "Cristal", "Digital",
      "Dorado", "Eléctrico", "Épico", "Fantasma", "Feroz", "Flamígero", "Glacial", "Hiper", "Ígneo", "Infernal",
      "Lunar", "Magma", "Magneto", "Neón", "Ninja", "Órbita", "Oscuro", "Pixel", "Plasma", "Polar",
      "Quantum", "Rápido", "Retro", "Solar", "Sónico", "Stellar", "Súper", "Tóxico", "Turbo", "Ultra",
      "Urbano", "Violeta", "Volcánico", "Wild", "Xenón", "Zeta", "Alfa", "Beta", "Gamma", "Delta", "Omega"
    ];
    const nouns = [
      "Arena", "Aro", "Blitz", "Boost", "Burbuja", "Cañón", "Carrera", "Caza", "Circuito", "Combo",
      "Copo", "Dash", "Disco", "Duelo", "Eclipse", "Eco", "Esfera", "Fiebre", "Furia", "Galaxia",
      "Gema", "Gol", "Hoja", "Imán", "Isla", "Karma", "Laberinto", "Lava", "Lluvia", "Meta",
      "Nave", "Nube", "Ola", "Orbe", "Papa", "Pelota", "Pinball", "Portal", "Pulso", "Quasar",
      "Relámpago", "Ritmo", "Ronda", "Senda", "Sumo", "Tornado", "Trampa", "Umbra", "Valle", "Vortex",
      "Watt", "Yunque", "Zigzag", "Zona", "Arcade"
    ];
    const items = ["star", "orb", "coin", "gem", "balloon", "bubble"];
    const dirs = ["down", "up", "side"];
    const extras = [];
    for (let i = 0; extras.length < count; i += 1) {
      const move = COMBO_MOVES[i % COMBO_MOVES.length];
      const click = COMBO_CLICKS[Math.floor(i / COMBO_MOVES.length) % COMBO_CLICKS.length];
      const goal = COMBO_GOALS[Math.floor(i / (COMBO_MOVES.length * COMBO_CLICKS.length)) % COMBO_GOALS.length];
      const hazard = COMBO_HAZARDS[Math.floor(i / (COMBO_MOVES.length * COMBO_CLICKS.length * COMBO_GOALS.length)) % COMBO_HAZARDS.length];
      const adjective = adjectives[i % adjectives.length];
      const noun = nouns[Math.floor(i / adjectives.length) % nouns.length];
      const parts = [move.hint, click.hint, goal.hint];
      if (hazard.id !== "none") parts.push(hazard.hint);
      extras.push({
        id: `x${i}`,
        icon: goal.icon,
        kind: "combo",
        move: move.id,
        clickMode: click.id,
        goal: goal.id,
        hazard: hazard.id,
        hue: (i * 37 + 19) % 360,
        duration: 16 + (i % 16),
        item: items[i % items.length],
        itemDir: dirs[i % dirs.length],
        staticItems: i % 11 === 0 && goal.id === "collect",
        title: MT(`${adjective} ${noun}`, `${adjective} ${noun}`),
        hint: MT(parts.map((part) => part.es).filter(Boolean).join(" "), parts.map((part) => part.en).filter(Boolean).join(" "))
      });
    }
    return extras;
  }

  const MINIGAME_DEFS = MINIGAME_CORE;
  const FOOD_FEAST_GOAL = 100;
  const FOOD_FEAST_FIELD = 36;
  const MINI_PAGE_SIZE = 20;
  let miniQuery = "";
  let miniPage = 0;
  let pendingFoodFeastId = "";

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeFace(face) {
    const frames = Array.isArray(face && face.frames)
      ? face.frames.filter((frame) => typeof frame === "string" && frame.startsWith("data:image"))
      : [];
    return {
      id: (face && face.id) || makeId("face"),
      name: String((face && face.name) || t("createFace")).slice(0, 24),
      frames
    };
  }

  function getFace(id) {
    return (data.faces || []).find((face) => face.id === id) || null;
  }

  function normalizeFood(food) {
    const kind = edibleKind(food);
    let frames = Array.isArray(food && food.frames)
      ? food.frames.filter((frame) => typeof frame === "string" && frame.startsWith("data:image"))
      : [];
    let names = Array.isArray(food && food.variantNames)
      ? food.variantNames.map((name) => String(name || "").trim().slice(0, ITEM_NAME_MAX))
      : [];
    if (kind === "drink") {
      frames = frames.slice(0, 1);
      names = [];
    }
    while (names.length < frames.length) names.push("");
    const drop = kind === "drink" && typeof (food && food.drop) === "string" && food.drop.startsWith("data:image")
      ? food.drop
      : "";
    return {
      id: (food && food.id) || makeId(kind === "drink" ? "drink" : "food"),
      kind,
      name: String((food && food.name) || t(kind === "drink" ? "createDrink" : "createFood")).slice(0, ITEM_NAME_MAX),
      frames,
      variantNames: names.slice(0, frames.length),
      drop,
      bottled: kind === "drink" && !!(food && food.bottled),
      ai: !!(food && food.ai)
    };
  }

  function getFood(id) {
    return (data.foods || []).find((food) => food.id === id) || null;
  }

  const ERASER_R = 16;

  function normalizeLevelPart(part) {
    if (!part || !part.type) return null;
    const holes = Array.isArray(part.holes)
      ? part.holes.map((hole) => ({
          x: Number(hole.x) || 0,
          y: Number(hole.y) || 0,
          r: Math.max(4, Number(hole.r) || ERASER_R)
        }))
      : [];
    return {
      type: String(part.type),
      x: Number(part.x) || 0,
      y: Number(part.y) || 0,
      w: Math.max(12, Math.min(WIDTH, Number(part.w) || 40)),
      h: Math.max(12, Math.min(HEIGHT, Number(part.h) || 24)),
      rot: ((Number(part.rot) || 0) % 360 + 360) % 360,
      holes,
      invisible: !!part.invisible || isScriptType(String(part.type)),
      script: partHasScript(String(part.type)) ? normalizeScriptCfg(String(part.type), part.script) : undefined
    };
  }

  function partCenter(part) {
    return { x: part.x + part.w / 2, y: part.y + part.h / 2 };
  }

  function worldToLocal(part, x, y) {
    const c = partCenter(part);
    const a = -((part.rot || 0) * Math.PI) / 180;
    const dx = x - c.x;
    const dy = y - c.y;
    return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
  }

  function localToWorld(part, lx, ly) {
    const c = partCenter(part);
    const a = ((part.rot || 0) * Math.PI) / 180;
    return { x: c.x + lx * Math.cos(a) - ly * Math.sin(a), y: c.y + lx * Math.sin(a) + ly * Math.cos(a) };
  }

  function pointInPartBounds(part, x, y) {
    const p = worldToLocal(part, x, y);
    return Math.abs(p.x) <= part.w / 2 && Math.abs(p.y) <= part.h / 2;
  }

  function holeCovers(part, lx, ly) {
    return (part.holes || []).some((hole) => {
      const dx = lx - hole.x;
      const dy = ly - hole.y;
      return dx * dx + dy * dy <= hole.r * hole.r;
    });
  }

  function pointInPartSolid(part, x, y) {
    const p = worldToLocal(part, x, y);
    if (Math.abs(p.x) > part.w / 2 || Math.abs(p.y) > part.h / 2) return false;
    return !holeCovers(part, p.x, p.y);
  }

  function overlapsCirclePart(ball, part) {
    if (!part) return false;
    if (!part.rot && !(part.holes && part.holes.length)) return overlapsCircleRect(ball, part);
    const local = worldToLocal(part, ball.x, ball.y);
    const clamped = {
      x: Math.max(-part.w / 2, Math.min(part.w / 2, local.x)),
      y: Math.max(-part.h / 2, Math.min(part.h / 2, local.y))
    };
    const dx = local.x - clamped.x;
    const dy = local.y - clamped.y;
    if (dx * dx + dy * dy >= ball.radius * ball.radius) return false;
    if (!holeCovers(part, clamped.x, clamped.y)) return true;
    for (let i = 0; i < 8; i += 1) {
      const ang = (i / 8) * Math.PI * 2;
      if (pointInPartSolid(part, ball.x + Math.cos(ang) * ball.radius * 0.7, ball.y + Math.sin(ang) * ball.radius * 0.7)) return true;
    }
    return false;
  }

  function drawShapedPart(target, part, fill) {
    const size = Math.ceil(Math.hypot(part.w, part.h) + 36);
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const g = off.getContext("2d");
    g.translate(size / 2, size / 2);
    g.rotate(((part.rot || 0) * Math.PI) / 180);
    g.fillStyle = fill;
    g.fillRect(-part.w / 2, -part.h / 2, part.w, part.h);
    if (part.holes && part.holes.length) {
      g.globalCompositeOperation = "destination-out";
      part.holes.forEach((hole) => {
        g.beginPath();
        g.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
        g.fill();
      });
    }
    const c = partCenter(part);
    target.drawImage(off, c.x - size / 2, c.y - size / 2);
  }

  function normalizeCustomMap(item) {
    return {
      id: (item && item.id) || makeId("map"),
      name: String((item && item.name) || t("createMap")).slice(0, ITEM_NAME_MAX),
      difficulty: Math.max(1, Math.min(20, Number(item && item.difficulty) || 10)),
      parts: Array.isArray(item && item.parts) ? item.parts.map(normalizeLevelPart).filter(Boolean) : []
    };
  }

  function normalizeCustomMini(item) {
    return {
      id: (item && item.id) || makeId("mini"),
      name: String((item && item.name) || t("createMinigame")).slice(0, ITEM_NAME_MAX),
      parts: Array.isArray(item && item.parts)
        ? item.parts.map(normalizeLevelPart).filter((part) => part && part.type !== "death" && part.type !== "win")
        : []
    };
  }

  function generateAiFood() {
    const canvas = document.createElement("canvas");
    canvas.width = FACE_SIZE;
    canvas.height = FACE_SIZE;
    const g = canvas.getContext("2d");
    const cx = FACE_SIZE / 2;
    const cy = FACE_SIZE / 2;
    const recipes = [
      { kind: "apple", names: ["Manzana", "Manzana roja", "Manzanita"] },
      { kind: "burger", names: ["Hamburguesa", "Burger", "Hamburguesa IA"] },
      { kind: "pizza", names: ["Pizza", "Pizza extra", "Porción"] },
      { kind: "donut", names: ["Dona", "Donut", "Rosquilla"] },
      { kind: "icecream", names: ["Helado", "Cucurucho", "Helado doble"] },
      { kind: "taco", names: ["Taco", "Taquito", "Taco IA"] },
      { kind: "cupcake", names: ["Cupcake", "Muffin", "Pastelito"] },
      { kind: "sushi", names: ["Sushi", "Nigiri", "Sushi IA"] },
      { kind: "grapes", names: ["Uvas", "Racimo", "Uvas dulces"] },
      { kind: "cookie", names: ["Galleta", "Cookie", "Galleta chips"] },
      { kind: "melon", names: ["Sandía", "Sandía fría", "Tajada"] },
      { kind: "hotdog", names: ["Pancho", "Hot dog", "Salchicha"] },
      { kind: "cake", names: ["Torta", "Porción de torta", "Pastel"] },
      { kind: "banana", names: ["Banana", "Banana IA", "Plátano"] },
      { kind: "berry", names: ["Frutilla", "Fresa", "Frutilla IA"] },
      { kind: "egg", names: ["Huevo frito", "Huevito", "Huevo"] },
      { kind: "cheese", names: ["Queso", "Queso IA", "Cuña"] },
      { kind: "lolly", names: ["Chupetín", "Paleta", "Caramelo"] },
      { kind: "sandwich", names: ["Sándwich", "Tostado", "Sándwich IA"] },
      { kind: "candy", names: ["Caramelo", "Dulce", "Golosina"] }
    ];
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    const shift = Math.floor(Math.random() * 36) - 18;
    const h = (base) => (base + shift + 360) % 360;
    const col = (hue, s, l) => `hsl(${h(hue)} ${s}% ${l}%)`;
    g.clearRect(0, 0, FACE_SIZE, FACE_SIZE);
    const oval = (x, y, rx, ry, fill) => {
      g.fillStyle = fill;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
    };
    const circ = (x, y, r, fill) => oval(x, y, r, r, fill);
    if (recipe.kind === "apple") {
      circ(cx, cy + 12, 72, col(8, 78, 48));
      g.fillStyle = col(28, 42, 32);
      g.fillRect(cx - 5, cy - 78, 10, 28);
      g.fillStyle = col(128, 62, 42);
      g.beginPath();
      g.ellipse(cx + 28, cy - 62, 22, 12, -0.5, 0, Math.PI * 2);
      g.fill();
    } else if (recipe.kind === "burger") {
      oval(cx, cy + 48, 78, 22, col(36, 70, 42));
      oval(cx, cy + 28, 80, 14, col(88, 55, 42));
      oval(cx, cy + 12, 76, 16, col(22, 62, 32));
      oval(cx, cy - 4, 78, 12, col(46, 82, 58));
      oval(cx, cy - 32, 80, 28, col(36, 72, 52));
      circ(cx - 28, cy - 38, 6, col(8, 70, 42));
      circ(cx + 18, cy - 30, 5, col(8, 70, 42));
    } else if (recipe.kind === "pizza") {
      g.fillStyle = col(42, 78, 58);
      g.beginPath();
      g.moveTo(cx, cy - 88);
      g.lineTo(cx + 86, cy + 78);
      g.lineTo(cx - 86, cy + 78);
      g.closePath();
      g.fill();
      g.fillStyle = col(8, 72, 48);
      g.beginPath();
      g.moveTo(cx, cy - 62);
      g.lineTo(cx + 64, cy + 64);
      g.lineTo(cx - 64, cy + 64);
      g.closePath();
      g.fill();
      [ [-18, 8], [22, 18], [0, 42], [-30, 48], [28, 52] ].forEach((p) => circ(cx + p[0], cy + p[1], 10, col(8, 68, 38)));
    } else if (recipe.kind === "donut") {
      circ(cx, cy, 78, col(28, 62, 58));
      g.fillStyle = col(340, 72, 62);
      g.beginPath();
      g.arc(cx, cy, 78, Math.PI * 1.05, Math.PI * 1.95);
      g.arc(cx, cy, 34, Math.PI * 1.95, Math.PI * 1.05, true);
      g.fill();
      g.globalCompositeOperation = "destination-out";
      circ(cx, cy, 28, "#000");
      g.globalCompositeOperation = "source-over";
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        circ(cx + Math.cos(a) * 54, cy + Math.sin(a) * 54, 5, col(i * 30, 80, 58));
      }
    } else if (recipe.kind === "icecream") {
      g.fillStyle = col(32, 62, 48);
      g.beginPath();
      g.moveTo(cx - 42, cy + 8);
      g.lineTo(cx + 42, cy + 8);
      g.lineTo(cx, cy + 108);
      g.closePath();
      g.fill();
      circ(cx - 18, cy - 18, 34, col(8, 70, 62));
      circ(cx + 18, cy - 28, 34, col(300, 55, 72));
      circ(cx, cy - 58, 32, col(48, 80, 68));
    } else if (recipe.kind === "taco") {
      g.fillStyle = col(46, 82, 56);
      g.beginPath();
      g.arc(cx, cy + 18, 82, Math.PI, 0);
      g.closePath();
      g.fill();
      g.fillStyle = col(22, 58, 36);
      g.beginPath();
      g.arc(cx, cy + 10, 62, Math.PI, 0);
      g.fill();
      circ(cx - 22, cy - 8, 10, col(8, 72, 48));
      circ(cx + 18, cy - 4, 9, col(128, 58, 42));
      circ(cx, cy - 18, 8, col(48, 80, 52));
    } else if (recipe.kind === "cupcake") {
      g.fillStyle = col(18, 72, 58);
      g.beginPath();
      g.moveTo(cx - 52, cy + 8);
      g.lineTo(cx + 52, cy + 8);
      g.lineTo(cx + 38, cy + 88);
      g.lineTo(cx - 38, cy + 88);
      g.closePath();
      g.fill();
      circ(cx, cy - 8, 54, col(320, 70, 78));
      circ(cx, cy - 42, 28, col(320, 62, 86));
      circ(cx, cy - 68, 14, col(8, 78, 52));
    } else if (recipe.kind === "sushi") {
      oval(cx, cy + 10, 86, 46, col(40, 20, 92));
      oval(cx, cy - 8, 70, 28, col(8, 72, 48));
      g.fillStyle = col(140, 40, 28);
      g.fillRect(cx - 88, cy + 2, 176, 16);
    } else if (recipe.kind === "grapes") {
      g.fillStyle = col(128, 50, 32);
      g.fillRect(cx - 4, cy - 88, 8, 36);
      [ [0, -20], [-28, 4], [28, 4], [-14, 36], [16, 36], [0, 64], [-36, 48], [38, 50] ].forEach((p) => circ(cx + p[0], cy + p[1], 24, col(280, 55, 42)));
    } else if (recipe.kind === "cookie") {
      circ(cx, cy, 78, col(32, 62, 48));
      [ [-24, -18], [22, -28], [8, 12], [-18, 28], [30, 22], [-36, 6] ].forEach((p) => circ(cx + p[0], cy + p[1], 9, col(22, 48, 22)));
    } else if (recipe.kind === "melon") {
      g.fillStyle = col(128, 55, 38);
      g.beginPath();
      g.moveTo(cx - 90, cy + 50);
      g.arc(cx, cy + 50, 90, Math.PI, 0);
      g.closePath();
      g.fill();
      g.fillStyle = col(8, 72, 52);
      g.beginPath();
      g.moveTo(cx - 70, cy + 50);
      g.arc(cx, cy + 50, 70, Math.PI, 0);
      g.closePath();
      g.fill();
      [ [-28, 18], [8, 8], [32, 24], [-8, 32] ].forEach((p) => {
        g.fillStyle = "#111";
        g.beginPath();
        g.ellipse(cx + p[0], cy + p[1], 5, 8, 0.4, 0, Math.PI * 2);
        g.fill();
      });
    } else if (recipe.kind === "hotdog") {
      oval(cx, cy, 92, 38, col(36, 68, 52));
      oval(cx, cy, 78, 22, col(8, 68, 42));
      g.strokeStyle = col(8, 72, 48);
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(cx - 40, cy - 18);
      g.quadraticCurveTo(cx, cy + 28, cx + 40, cy - 10);
      g.stroke();
    } else if (recipe.kind === "cake") {
      g.fillStyle = col(28, 55, 78);
      g.fillRect(cx - 70, cy - 10, 140, 78);
      g.fillStyle = col(320, 62, 72);
      g.fillRect(cx - 70, cy - 28, 140, 26);
      g.fillStyle = col(28, 40, 42);
      g.fillRect(cx - 70, cy + 18, 140, 10);
      circ(cx, cy - 42, 16, col(8, 72, 52));
    } else if (recipe.kind === "banana") {
      g.strokeStyle = col(52, 88, 58);
      g.lineWidth = 36;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(cx - 70, cy - 40);
      g.quadraticCurveTo(cx + 10, cy + 90, cx + 78, cy + 10);
      g.stroke();
      g.fillStyle = col(28, 40, 28);
      g.beginPath();
      g.arc(cx - 70, cy - 40, 10, 0, Math.PI * 2);
      g.fill();
    } else if (recipe.kind === "berry") {
      g.fillStyle = col(8, 78, 52);
      g.beginPath();
      g.moveTo(cx, cy + 78);
      g.quadraticCurveTo(cx + 90, cy - 10, cx, cy - 40);
      g.quadraticCurveTo(cx - 90, cy - 10, cx, cy + 78);
      g.fill();
      g.fillStyle = col(128, 58, 38);
      g.beginPath();
      g.moveTo(cx, cy - 36);
      g.lineTo(cx - 28, cy - 70);
      g.lineTo(cx + 28, cy - 70);
      g.closePath();
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.35)";
      [ [-18, 0], [16, 12], [0, 32], [-22, 28], [24, -8] ].forEach((p) => circ(cx + p[0], cy + p[1], 4, "rgba(255,255,255,0.45)"));
    } else if (recipe.kind === "egg") {
      oval(cx, cy, 80, 64, col(40, 20, 96));
      circ(cx + 8, cy + 6, 32, col(48, 88, 58));
    } else if (recipe.kind === "cheese") {
      g.fillStyle = col(48, 88, 58);
      g.beginPath();
      g.moveTo(cx - 80, cy + 70);
      g.lineTo(cx + 86, cy + 70);
      g.lineTo(cx + 20, cy - 78);
      g.closePath();
      g.fill();
      circ(cx - 8, cy + 18, 14, col(48, 70, 42));
      circ(cx + 28, cy + 36, 10, col(48, 70, 42));
      circ(cx + 8, cy - 18, 12, col(48, 70, 42));
    } else if (recipe.kind === "lolly") {
      g.fillStyle = col(28, 30, 78);
      g.fillRect(cx - 8, cy + 20, 16, 90);
      circ(cx, cy - 28, 70, col(8, 78, 56));
      g.strokeStyle = "rgba(255,255,255,0.45)";
      g.lineWidth = 10;
      g.beginPath();
      g.arc(cx, cy - 28, 38, 0.4, 2.6);
      g.stroke();
    } else if (recipe.kind === "sandwich") {
      oval(cx, cy + 28, 86, 28, col(36, 62, 52));
      oval(cx, cy + 8, 86, 18, col(88, 50, 42));
      oval(cx, cy - 8, 86, 16, col(8, 68, 48));
      oval(cx, cy - 28, 86, 28, col(36, 62, 58));
    } else {
      oval(cx, cy, 70, 42, col(320, 72, 62));
      g.fillStyle = col(48, 80, 62);
      g.beginPath();
      g.moveTo(cx - 78, cy);
      g.lineTo(cx - 108, cy - 28);
      g.lineTo(cx - 108, cy + 28);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(cx + 78, cy);
      g.lineTo(cx + 108, cy - 28);
      g.lineTo(cx + 108, cy + 28);
      g.closePath();
      g.fill();
    }
    const extras = ["IA", "Secreta", "Cósmica", "Crujiente", "Misteriosa", "Galáctica"];
    const base = recipe.names[Math.floor(Math.random() * recipe.names.length)];
    const name = Math.random() < 0.5 ? `${extras[Math.floor(Math.random() * extras.length)]} ${base}` : base;
    return {
      id: makeId("food"),
      kind: "food",
      name: name.slice(0, ITEM_NAME_MAX),
      frames: [canvas.toDataURL("image/png")],
      ai: true
    };
  }

  function isBanqueteFood(food) {
    return !!(food && food.frames && food.frames.length && food.kind !== "drink");
  }

  function userCreatedFoods() {
    return (data.foods || []).filter((food) => isBanqueteFood(food) && !food.ai);
  }

  function pickRotatedFood(list, lastId) {
    if (!list.length) return null;
    const others = lastId ? list.filter((food) => food.id !== lastId) : list;
    const pool = others.length ? others : list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function lastBanqueteFoodId(save) {
    return (save && save.lastBanqueteFoodId) || data.lastBanqueteFoodId || "";
  }

  function rememberBanqueteFood(save, food) {
    if (!food || food.kind === "drink") return;
    if (save) save.lastBanqueteFoodId = food.id;
    data.lastBanqueteFoodId = food.id;
  }

  function pickMinigameFood() {
    const save = getSave();
    const lastId = lastBanqueteFoodId(save);
    const userFoods = userCreatedFoods();
    if (userFoods.length) {
      const food = pickRotatedFood(userFoods, lastId);
      rememberBanqueteFood(save, food);
      persist();
      return { food, userMade: true };
    }
    const aiFoods = (data.foods || []).filter((food) => isBanqueteFood(food) && food.ai);
    const reused = pickRotatedFood(aiFoods, lastId);
    if (reused) {
      rememberBanqueteFood(save, reused);
      persist();
      return { food: reused, userMade: false };
    }
    const made = generateAiFood();
    if (!Array.isArray(data.foods)) data.foods = [];
    data.foods.push(made);
    rememberBanqueteFood(save, made);
    persist();
    renderMenuFoods();
    renderRoleplayFoods();
    return { food: made, userMade: false };
  }

  function ensureEveryoneTriedFood(food) {
    const save = getSave();
    if (!save || !food) return;
    (save.marbles || []).forEach((record) => recordFoodTaste(record.id, food));
    balanceSaveFoodTastes(save);
    persist();
  }

  function livingFoodLikers(food) {
    const save = getSave();
    if (!save || !food) return [];
    return aliveMarbles(save).filter((marble) => marbleLikedTriedFood(marble, food));
  }

  function foodVariantCount(food) {
    return Math.max(1, ((food && food.frames) || []).length);
  }

  function randomFoodVariant(food) {
    return Math.floor(Math.random() * foodVariantCount(food));
  }

  function foodVariantTitle(food, index) {
    const names = (food && food.variantNames) || [];
    const extra = String(names[index] || "").trim();
    return extra ? ` · ${extra}` : "";
  }

  function foodDisplayName(food, index) {
    const base = (food && food.name) || edibleDefaultName(food);
    const extra = String(((food && food.variantNames) || [])[index] || "").trim();
    return extra ? `${base} (${extra})` : base;
  }

  function spawnFoodBite() {
    const food = minigame && minigame.extras ? minigame.extras.food : null;
    minigame.items.push({
      kind: "foodbite",
      foodId: food && food.id,
      variant: randomFoodVariant(food),
      x: 48 + Math.random() * 904,
      y: 48 + Math.random() * 504,
      r: 16,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      pulse: Math.random() * 6
    });
  }

  function shuffleList(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const hold = copy[i];
      copy[i] = copy[j];
      copy[j] = hold;
    }
    return copy;
  }

  function normalizeTastedFoods(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    Object.keys(raw).forEach((id) => {
      if (raw[id] === true) out[id] = true;
      else if (raw[id] === false) out[id] = false;
    });
    return out;
  }

  function marbleTriedFood(marble, food) {
    return !!(marble && food && marble.tastedFoods && Object.prototype.hasOwnProperty.call(marble.tastedFoods, food.id));
  }

  function marbleLikedTriedFood(marble, food) {
    return !!(marbleTriedFood(marble, food) && marble.tastedFoods[food.id] === true);
  }

  function marbleHatedTriedFood(marble, food) {
    return !!(marbleTriedFood(marble, food) && marble.tastedFoods[food.id] === false);
  }

  function marbleFoodLikeChance(record) {
    if (!record) return 0.75;
    if (typeof record.foodLikeChance !== "number" || record.foodLikeChance < 0.6) {
      record.foodLikeChance = 0.68 + Math.random() * 0.16;
    }
    return record.foodLikeChance;
  }

  function livingSaveMarbles(save) {
    return ((save && save.marbles) || []).filter((marble) => marble && marble.alive);
  }

  function foodTasteCounts(save, foodId) {
    let likes = 0;
    let hates = 0;
    livingSaveMarbles(save).forEach((marble) => {
      if (!marble.tastedFoods || !Object.prototype.hasOwnProperty.call(marble.tastedFoods, foodId)) return;
      if (marble.tastedFoods[foodId] === true) likes += 1;
      else hates += 1;
    });
    return { likes, hates };
  }

  function rollFoodLike(record) {
    const tried = Object.keys((record && record.tastedFoods) || {}).length;
    const liked = likedFoodCount(record);
    let chance = marbleFoodLikeChance(record);
    if (tried >= 1 && liked === tried) chance = 0.35;
    if (tried >= 1 && liked === 0) chance = 0.85;
    return Math.random() < chance;
  }

  function likedFoodCount(record) {
    return Object.values((record && record.tastedFoods) || {}).filter((value) => value === true).length;
  }

  function ensureMajorityLikes(save, foodId) {
    if (!save || !foodId) return;
    let { likes, hates } = foodTasteCounts(save, foodId);
    const haters = () => livingSaveMarbles(save).filter((marble) => marble.tastedFoods && marble.tastedFoods[foodId] === false);
    while (likes <= hates) {
      const pool = haters();
      if (!pool.length) break;
      pool[Math.floor(Math.random() * pool.length)].tastedFoods[foodId] = true;
      likes += 1;
      hates -= 1;
    }
  }

  function ensureVariedMarbleTastes(save) {
    if (!save) return;
    const foodIds = (data.foods || []).map((food) => food.id);
    livingSaveMarbles(save).forEach((record) => {
      record.tastedFoods = normalizeTastedFoods(record.tastedFoods);
      const tried = foodIds.filter((id) => Object.prototype.hasOwnProperty.call(record.tastedFoods, id));
      if (tried.length < 2) return;
      const liked = tried.filter((id) => record.tastedFoods[id] === true);
      const hated = tried.filter((id) => record.tastedFoods[id] === false);
      if (!hated.length) {
        const candidates = shuffleList(liked).filter((id) => {
          const { likes, hates } = foodTasteCounts(save, id);
          return likes - 1 > hates + 1;
        });
        if (candidates.length) record.tastedFoods[candidates[0]] = false;
      }
      if (!liked.length) {
        record.tastedFoods[shuffleList(hated)[0]] = true;
      }
    });
  }

  function balanceSaveFoodTastes(save) {
    if (!save) return;
    (data.foods || []).forEach((food) => ensureMajorityLikes(save, food.id));
    ensureVariedMarbleTastes(save);
    (data.foods || []).forEach((food) => ensureMajorityLikes(save, food.id));
  }

  function rerollMarbleFoodTastes(record) {
    if (!record) return;
    marbleFoodLikeChance(record);
    record.foodTasteV = 4;
    const tasted = normalizeTastedFoods(record.tastedFoods);
    const next = {};
    shuffleList(Object.keys(tasted)).forEach((id) => {
      record.tastedFoods = next;
      next[id] = rollFoodLike(record);
    });
    record.tastedFoods = next;
  }

  function migrateFoodTastes() {
    let changed = false;
    (data.saves || []).forEach((save) => {
      if (!save) return;
      (save.marbles || []).forEach((record) => {
        if (!record || record.foodTasteV === 4) return;
        rerollMarbleFoodTastes(record);
        changed = true;
      });
      balanceSaveFoodTastes(save);
    });
    if (changed) persist();
  }

  function allKnownMarbles() {
    const seen = new Set();
    const list = [];
    const add = (marble, saveName) => {
      if (!marble || !marble.id || seen.has(marble.id)) return;
      seen.add(marble.id);
      list.push({ marble, saveName: saveName || "" });
    };
    (data.saves || []).forEach((save) => {
      if (!save) return;
      (save.marbles || []).forEach((marble) => add(marble, save.name));
    });
    (data.retired || []).forEach((entry) => add(entry && entry.marble, entry && entry.saveName));
    return list;
  }

  function normalizeGender(value) {
    return value === "male" || value === "female" ? value : "";
  }

  function findPackMarbleSource(marble) {
    if (!marble) return null;
    if (marble.packId && marble.packMarbleId) {
      const pack = (data.packs || []).find((item) => item.id === marble.packId);
      const src = pack && (pack.marbles || []).find((item) => item.id === marble.packMarbleId);
      if (src && normalizeGender(src.gender)) return { pack, src };
    }
    const hits = [];
    (data.packs || []).forEach((pack) => {
      (pack.marbles || []).forEach((src) => {
        if (src.name === marble.name && normalizeGender(src.gender)) hits.push({ pack, src });
      });
    });
    if (!hits.length) return null;
    const colored = hits.filter((hit) => hit.src.color === marble.color);
    const pool = colored.length ? colored : hits;
    const genders = new Set(pool.map((hit) => normalizeGender(hit.src.gender)));
    if (genders.size !== 1) return null;
    return pool[0];
  }

  function applyPackGenderToMarble(marble) {
    const found = findPackMarbleSource(marble);
    if (!found) return false;
    const gender = normalizeGender(found.src.gender);
    if (!gender) return false;
    const linked = !!(marble.packId && marble.packMarbleId);
    if (!linked && marble.gender && marble.gender !== gender) return false;
    let changed = marble.gender !== gender;
    marble.gender = gender;
    if (!marble.packId) marble.packId = found.pack.id;
    if (!marble.packMarbleId) marble.packMarbleId = found.src.id;
    return changed;
  }

  function syncAllSaveGendersFromPacks() {
    let changed = false;
    (data.saves || []).forEach((save) => {
      if (!save) return;
      let saveChanged = false;
      (save.marbles || []).forEach((marble) => {
        if (applyPackGenderToMarble(marble)) saveChanged = true;
      });
      if (saveChanged) {
        sanitizePartners(save.marbles);
        changed = true;
      }
    });
    return changed;
  }

  function genderLabel(gender) {
    if (gender === "male") return t("packGenderMale");
    if (gender === "female") return t("packGenderFemale");
    return t("packGenderNone");
  }

  function findMarble(list, id) {
    return (list || []).find((item) => item && item.id === id) || null;
  }

  function gendersDone(list) {
    return Array.isArray(list) && list.length > 0 && list.every((item) => normalizeGender(item.gender));
  }

  function pairCompatible(a, b) {
    if (!a || !b || a.id === b.id) return false;
    const ga = normalizeGender(a.gender);
    const gb = normalizeGender(b.gender);
    return (ga === "male" && gb === "female") || (ga === "female" && gb === "male");
  }

  function clearPartner(list, marbleId) {
    const marble = findMarble(list, marbleId);
    if (!marble) return;
    const other = findMarble(list, marble.partnerId);
    marble.partnerId = "";
    if (other && other.partnerId === marble.id) other.partnerId = "";
  }

  function setPartner(list, idA, idB) {
    const a = findMarble(list, idA);
    const b = findMarble(list, idB);
    if (!pairCompatible(a, b)) return false;
    clearPartner(list, a.id);
    clearPartner(list, b.id);
    a.partnerId = b.id;
    b.partnerId = a.id;
    return true;
  }

  function sanitizePartners(list) {
    (list || []).forEach((marble) => {
      const other = findMarble(list, marble.partnerId);
      if (!other || other.partnerId !== marble.id || !pairCompatible(marble, other)) marble.partnerId = "";
    });
    return list;
  }

  function pairEntries(list) {
    const seen = new Set();
    const pairs = [];
    sanitizePartners(list);
    (list || []).forEach((marble) => {
      if (!marble.partnerId || seen.has(marble.id)) return;
      const other = findMarble(list, marble.partnerId);
      if (!other) return;
      seen.add(marble.id);
      seen.add(other.id);
      const boy = marble.gender === "male" ? marble : other;
      const girl = marble.gender === "female" ? marble : other;
      pairs.push({ boy, girl });
    });
    return pairs;
  }

  function unpairedOf(list, gender) {
    return (list || []).filter((item) => normalizeGender(item.gender) === gender && !findMarble(list, item.partnerId));
  }

  function partnerName(list, marble) {
    const other = findMarble(list, marble && marble.partnerId);
    return other ? other.name : "";
  }

  function fillSelect(select, items, emptyLabel) {
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = emptyLabel;
    select.appendChild(blank);
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      select.appendChild(option);
    });
  }

  function renderPairEditor(listEl, formEl, list, onChange) {
    if (!listEl || !formEl) return;
    listEl.innerHTML = "";
    formEl.innerHTML = "";
    const pairs = pairEntries(list);
    if (!pairs.length) {
      const empty = document.createElement("p");
      empty.className = "pair-empty";
      empty.textContent = t("pairNone");
      listEl.appendChild(empty);
    }
    pairs.forEach((pair) => {
      const row = document.createElement("div");
      row.className = "pair-row";
      row.innerHTML = `
        <i class="mini-marble" style="background:${pair.boy.color}"></i>
        <strong>${escapeHtml(pair.boy.name)}</strong>
        <span class="pair-heart">♥</span>
        <i class="mini-marble" style="background:${pair.girl.color}"></i>
        <strong>${escapeHtml(pair.girl.name)}</strong>
      `;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button ghost compact";
      remove.textContent = t("pairRemove");
      remove.addEventListener("click", () => {
        clearPartner(list, pair.boy.id);
        onChange();
      });
      row.appendChild(remove);
      listEl.appendChild(row);
    });
    const boys = unpairedOf(list, "male");
    const girls = unpairedOf(list, "female");
    if (!boys.length || !girls.length) {
      const need = document.createElement("p");
      need.className = "pair-empty";
      need.textContent = t("pairNeedBoth");
      formEl.appendChild(need);
      return;
    }
    const boySel = document.createElement("select");
    const girlSel = document.createElement("select");
    fillSelect(boySel, boys, t("pairBoy"));
    fillSelect(girlSel, girls, t("pairGirl"));
    const join = document.createElement("button");
    join.type = "button";
    join.className = "button secondary compact";
    join.textContent = t("pairJoin");
    join.addEventListener("click", () => {
      if (setPartner(list, boySel.value, girlSel.value)) onChange();
    });
    formEl.append(boySel, girlSel, join);
  }

  function normalizeMarble(item) {
    return {
      id: item.id || makeId("m"),
      name: String(item.name || "Marble").slice(0, ITEM_NAME_MAX),
      color: item.color || "#55d6ff",
      roundsSurvived: Math.max(0, Number(item.roundsSurvived) || 0),
      alive: item.alive !== false,
      roleplayFace: typeof item.roleplayFace === "string" ? item.roleplayFace : "",
      tastedFoods: normalizeTastedFoods(item.tastedFoods),
      foodLikeChance: typeof item.foodLikeChance === "number" ? item.foodLikeChance : undefined,
      foodTasteV: item.foodTasteV === 4 ? 4 : 0,
      gender: normalizeGender(item.gender),
      partnerId: typeof item.partnerId === "string" ? item.partnerId : "",
      packId: typeof item.packId === "string" ? item.packId : "",
      packMarbleId: typeof item.packMarbleId === "string" ? item.packMarbleId : "",
      skipNextRound: !!item.skipNextRound
    };
  }

  function campaignRound(save) {
    if (!save || !save.started) return 0;
    if (save.playLocked) return SKIP_ROUND;
    return save.round + 1;
  }

  function marbleScore(marble, save) {
    if (marble.alive && save && save.started) return Math.max(marble.roundsSurvived, campaignRound(save));
    return marble.roundsSurvived;
  }

  function syncAliveScores(save) {
    if (!save || !save.started) return save;
    const score = campaignRound(save);
    save.marbles.forEach((marble) => {
      if (marble.alive) marble.roundsSurvived = Math.max(marble.roundsSurvived, score);
    });
    return save;
  }

  function normalizeSave(save, index) {
    return syncAliveScores({
      id: save.id || makeId("save"),
      name: String(save.name || t("defaultSaveName", { n: index + 1 })).slice(0, 24),
      round: Math.max(0, Number(save.round) || 0),
      started: !!save.started,
      lastMapId: save.lastMapId || "",
      createdAt: Number(save.createdAt) || Date.now(),
      rejoinsLeft: 0,
      playLocked: !!save.playLocked,
      speedBoostPending: !!save.speedBoostPending,
      speedBoostUsed: !!save.speedBoostUsed,
      lastLayout: String(save.lastLayout || ""),
      lastObstacle: Number.isFinite(Number(save.lastObstacle)) ? Number(save.lastObstacle) : -1,
      holaBoost: !!save.holaBoost,
      holaBoostUsed: !!save.holaBoostUsed,
      roleplayLayout: save.roleplayLayout && typeof save.roleplayLayout === "object" ? save.roleplayLayout : {},
      roleplayCam: save.roleplayCam && typeof save.roleplayCam === "object" ? save.roleplayCam : null,
      roleplayHouses: Array.isArray(save.roleplayHouses) ? save.roleplayHouses.map(normalizeHouse) : [],
      marbleChat: normalizeMarbleChat(save.marbleChat),
      splitLoveRooms: Array.isArray(save.splitLoveRooms) ? save.splitLoveRooms : [],
      teamSpikeUsed: !!save.teamSpikeUsed,
      teamSpikeAt: Math.max(0, Number(save.teamSpikeAt) || 0),
      vipTicket: normalizeVipTicket(save.vipTicket),
      vipDecisive: !!save.vipDecisive,
      marbles: sanitizePartners(Array.isArray(save.marbles) ? save.marbles.map(normalizeMarble) : [])
    });
  }

  function normalizeVipTicket(ticket) {
    if (!ticket || !ticket.teamId || !ticket.teamName) return null;
    const members = Array.isArray(ticket.members) ? ticket.members.filter((item) => item && item.name).map((item) => ({
      id: String(item.id || ""),
      name: String(item.name).slice(0, 24),
      color: item.color || "#55d6ff"
    })) : [];
    if (!members.length) return null;
    return {
      teamId: String(ticket.teamId),
      teamName: String(ticket.teamName).slice(0, 24),
      teamColor: ticket.teamColor || "#facc15",
      placeName: String(ticket.placeName || "").slice(0, 40),
      members
    };
  }

  function normalizeChatMessage(msg) {
    return {
      id: (msg && msg.id) || makeId("msg"),
      marbleId: String((msg && msg.marbleId) || ""),
      name: String((msg && msg.name) || "").slice(0, 24),
      color: (msg && msg.color) || "#55d6ff",
      text: String((msg && msg.text) || "").slice(0, 200),
      at: Number(msg && msg.at) || Date.now()
    };
  }

  function defaultMarblesGroup(group) {
    return {
      id: "marbles",
      name: "Marbles",
      locked: true,
      messages: Array.isArray(group && group.messages) ? group.messages.map(normalizeChatMessage).filter((msg) => msg.text) : []
    };
  }

  function normalizeChatGroup(group) {
    if (!group) return null;
    if (group.id === "marbles" || group.locked) return defaultMarblesGroup(group);
    const name = String(group.name || "").trim().slice(0, 24);
    if (!name) return null;
    return {
      id: group.id || makeId("chat"),
      name,
      locked: false,
      messages: Array.isArray(group.messages) ? group.messages.map(normalizeChatMessage).filter((msg) => msg.text) : []
    };
  }

  function normalizeMarbleChat(chat) {
    const incoming = Array.isArray(chat && chat.groups) ? chat.groups.map(normalizeChatGroup).filter(Boolean) : [];
    const groups = incoming.filter((group) => group.id !== "marbles");
    const base = incoming.find((group) => group.id === "marbles");
    groups.unshift(defaultMarblesGroup(base));
    const activeId = String((chat && chat.activeId) || "marbles");
    return {
      groups,
      activeId: groups.some((group) => group.id === activeId) ? activeId : "marbles"
    };
  }

  function ensureMarbleChat(save) {
    if (!save) return null;
    save.marbleChat = normalizeMarbleChat(save.marbleChat);
    return save.marbleChat;
  }

  function activeChatGroup(save) {
    const chat = ensureMarbleChat(save);
    return chat.groups.find((group) => group.id === chat.activeId) || chat.groups[0];
  }

  function normalizeHouse(house) {
    const lights = house && house.lights && typeof house.lights === "object" ? house.lights : {};
    return {
      id: (house && house.id) || makeId("house"),
      x: Number.isFinite(Number(house && house.x)) ? Number(house.x) : RP_WIDTH / 2 - HOUSE_W / 2,
      y: Number.isFinite(Number(house && house.y)) ? Number(house.y) : RP_HEIGHT / 2 - HOUSE_H / 2,
      lights: {
        sala: !!lights.sala,
        cocina: !!lights.cocina,
        bano: !!lights.bano,
        dorm1: !!lights.dorm1,
        dorm2: !!lights.dorm2
      },
      bathOn: !!(house && house.bathOn),
      tvOn: !!(house && house.tvOn)
    };
  }

  function normalizePack(pack, index) {
    return {
      id: pack.id || makeId("pack"),
      name: String(pack.name || t("defaultPackName", { n: index + 1 })).slice(0, 24),
      updatedAt: Number(pack.updatedAt) || 0,
      marbles: sanitizePartners(
        Array.isArray(pack.marbles)
          ? pack.marbles
              .filter((marble) => marble && marble.name)
              .map((marble) => ({
                id: marble.id || makeId("pm"),
                name: String(marble.name).slice(0, ITEM_NAME_MAX),
                color: marble.color || "#55d6ff",
                gender: normalizeGender(marble.gender),
                partnerId: typeof marble.partnerId === "string" ? marble.partnerId : ""
              }))
          : []
      )
    };
  }

  function normalizeRetired(entry) {
    const marble = entry && (entry.marble || entry);
    return {
      saveName: String((entry && entry.saveName) || t("recoveredSave")).slice(0, 24),
      marble: normalizeMarble(marble || {})
    };
  }

  function archiveSave(save) {
    if (!save || !Array.isArray(save.marbles)) return;
    save.marbles.forEach((marble) => {
      if (!marble || !(marble.roundsSurvived > 0)) return;
      data.retired.push({
        saveName: save.name,
        marble: normalizeMarble(marble)
      });
    });
  }

  function mergeIncomingPacks(localPacks) {
    const local = Array.isArray(localPacks) ? localPacks.map((pack, index) => normalizePack(pack, index)) : [];
    const shared = window.SharedPacks ? SharedPacks.load() : [];
    const merged = window.SharedPacks ? SharedPacks.merge(local, shared) : local;
    return merged.map((pack, index) => normalizePack(pack, index));
  }

  function protectPacksFromWipe() {
    try {
      const raw = readStoredJson();
      const parsed = raw ? JSON.parse(raw) : null;
      const existing = parsed && Array.isArray(parsed.packs) ? parsed.packs.map(normalizePack) : [];
      if ((!data.packs || !data.packs.length) && existing.length) {
        data.packs = existing;
      }
      data.packs = mergeIncomingPacks(data.packs || []);
    } catch (_err) {
      if (!Array.isArray(data.packs)) data.packs = [];
    }
  }

  function syncSharedPacksOut() {
    if (!window.SharedPacks || !Array.isArray(data.packs) || !data.packs.length) return;
    SharedPacks.save(data.packs);
  }

  function storeWeight(raw) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!parsed || !Array.isArray(parsed.saves)) return -1;
      const saves = parsed.saves.filter(Boolean);
      const marbles = saves.reduce((total, save) => total + ((save.marbles && save.marbles.length) || 0), 0);
      const packs = Array.isArray(parsed.packs) ? parsed.packs.reduce((total, pack) => total + 1 + ((pack.marbles && pack.marbles.length) || 0), 0) : 0;
      const retired = Array.isArray(parsed.retired) ? parsed.retired.length : 0;
      const faces = Array.isArray(parsed.faces) ? parsed.faces.reduce((total, face) => total + 1 + ((face.frames && face.frames.length) || 0), 0) : 0;
      const foods = Array.isArray(parsed.foods) ? parsed.foods.reduce((total, food) => total + 1 + ((food.frames && food.frames.length) || 0), 0) : 0;
      const custom = ((parsed.customMaps && parsed.customMaps.length) || 0) + ((parsed.customMinigames && parsed.customMinigames.length) || 0);
      return saves.length * 100 + marbles + packs + retired + faces + foods + custom * 8 + (parsed.holaRedeemed ? 5 : 0);
    } catch (_error) {
      return -1;
    }
  }

  function readStoredJson() {
    const main = localStorage.getItem(STORAGE_KEY);
    const backup = localStorage.getItem(BACKUP_KEY);
    if (storeWeight(main) > 0) return main;
    if (storeWeight(backup) > 0) return backup;
    return main;
  }

  function hydrateData(parsed) {
    const saves = Array.from({ length: BASE_SLOTS + EXTRA_SLOTS }, (_, index) =>
      parsed.saves[index] ? normalizeSave(parsed.saves[index], index) : null
    );
    return {
      unlockedSlots: BASE_SLOTS,
      saves,
      packs: mergeIncomingPacks(Array.isArray(parsed.packs) ? parsed.packs.map(normalizePack) : []),
      retired: Array.isArray(parsed.retired) ? parsed.retired.map(normalizeRetired) : [],
      holaRedeemed: !!parsed.holaRedeemed,
      holaPending: !!parsed.holaPending,
      faces: Array.isArray(parsed.faces) ? parsed.faces.map(normalizeFace) : [],
      foods: Array.isArray(parsed.foods) ? parsed.foods.map(normalizeFood) : [],
      customMaps: Array.isArray(parsed.customMaps) ? parsed.customMaps.map(normalizeCustomMap) : [],
      customMinigames: Array.isArray(parsed.customMinigames) ? parsed.customMinigames.map(normalizeCustomMini) : []
    };
  }

  function loadData() {
    try {
      const raw = readStoredJson();
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Array.isArray(parsed.saves)) return hydrateData(parsed);
    } catch (_error) {
      /* Start with clean data. */
    }

    const fresh = {
      unlockedSlots: BASE_SLOTS,
      saves: Array(BASE_SLOTS + EXTRA_SLOTS).fill(null),
      packs: [],
      retired: [],
      holaRedeemed: false,
      holaPending: false,
      faces: [],
      foods: [],
      customMaps: [],
      customMinigames: []
    };
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      if (Array.isArray(legacy) && legacy.length) {
        fresh.saves[0] = normalizeSave(
          {
            name: t("recoveredSave"),
            marbles: legacy.map((item) => ({ ...item, roundsSurvived: 0, alive: true }))
          },
          0
        );
      }
    } catch (_error) {
      /* Ignore invalid legacy data. */
    }
    return fresh;
  }

  function persist() {
    try {
      protectPacksFromWipe();
      const json = JSON.stringify(data);
      const incoming = storeWeight(data);
      const existing = Math.max(storeWeight(localStorage.getItem(STORAGE_KEY)), storeWeight(localStorage.getItem(BACKUP_KEY)));
      if (incoming < 1 && existing > incoming) return;
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(BACKUP_KEY, json);
      syncSharedPacksOut();
    } catch (_error) {
      try {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
      } catch (_ignored) {
        /* Ignore quota errors. */
      }
    }
  }

  function getSave() {
    return activeSlot == null ? null : data.saves[activeSlot];
  }

  function aliveMarbles(save) {
    return save ? save.marbles.filter((marble) => marble.alive) : [];
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => {
      screen.classList.toggle("active", key === name);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlots() {
    data.packs = mergeIncomingPacks(data.packs || []);
    const used = data.saves.slice(0, data.unlockedSlots).filter(Boolean).length;
    ui.slotCounter.textContent = t("slotCounter", { used, total: data.unlockedSlots });
    ui.slotList.innerHTML = "";

    for (let index = 0; index < data.unlockedSlots; index += 1) {
      const save = data.saves[index];
      const slot = document.createElement("div");
      slot.tabIndex = 0;
      slot.setAttribute("role", "button");
      slot.className = `save-slot${save ? "" : " empty"}`;
      if (!save) {
        slot.innerHTML = `<strong>${escapeHtml(t("newSlot", { n: index + 1 }))}</strong><span>${escapeHtml(t("newGame"))}</span>`;
        slot.addEventListener("click", () => createSave(index));
        slot.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") createSave(index);
        });
      } else {
        const alive = aliveMarbles(save).length;
        const rejoinNote = save.rejoinsLeft > 0 ? ` · Rejoin ${save.rejoinsLeft}` : "";
        const shownRound = save.playLocked ? SKIP_ROUND : save.started ? save.round + 1 : 1;
        slot.innerHTML = `
          <strong>${escapeHtml(save.name)}</strong>
          <span>${escapeHtml(t("slotMeta", { round: shownRound, alive }) + rejoinNote)}</span>
        `;
        const rename = document.createElement("button");
        rename.type = "button";
        rename.className = "rename-slot";
        rename.title = t("renameSave");
        rename.setAttribute("aria-label", t("renameSave"));
        rename.textContent = "✎";
        rename.addEventListener("click", (event) => {
          event.stopPropagation();
          renameSave(index);
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-slot";
        remove.title = t("deleteSave");
        remove.textContent = "×";
        remove.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteSave(index);
        });
        slot.appendChild(rename);
        slot.appendChild(remove);
        slot.addEventListener("click", () => openSave(index));
        slot.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") openSave(index);
        });
      }
      ui.slotList.appendChild(slot);
    }
    renderTopShowcase();
  }

  function createSave(index) {
    const fallbackName = t("defaultSaveName", { n: index + 1 });
    const proposed = prompt(t("promptSaveName"), fallbackName);
    if (proposed == null) return;
    data.saves[index] = normalizeSave(
      {
        name: proposed.trim() || fallbackName,
        createdAt: Date.now(),
        marbles: []
      },
      index
    );
    persist();
    openSave(index);
  }

  function renameSave(index) {
    const save = data.saves[index];
    if (!save) return;
    const proposed = prompt(t("promptRenameSave"), save.name);
    if (proposed == null) return;
    const name = proposed.trim().slice(0, 24);
    if (!name || name === save.name) return;
    save.name = name;
    persist();
    if (activeSlot === index) {
      renderMenu();
    } else {
      renderSlots();
    }
  }

  function deleteSave(index) {
    const save = data.saves[index];
    if (!save || !confirm(t("deleteSaveConfirm", { name: save.name }))) return;
    archiveSave(save);
    data.saves[index] = null;
    if (activeSlot === index) activeSlot = null;
    persist();
    renderSlots();
  }

  function openSave(index) {
    if (!data.saves[index]) return;
    activeSlot = index;
    topShowcaseOpen = false;
    rejoinPickerOpen = false;
    renderMenu();
    showScreen("menu");
  }

  function renderMenu() {
    data.packs = mergeIncomingPacks(data.packs || []);
    const save = getSave();
    if (!save) {
      renderSlots();
      showScreen("slots");
      return;
    }
    const alive = aliveMarbles(save);
    ui.saveName.textContent = save.name;
    ui.roundBadge.textContent = save.playLocked
      ? t("roundBadge", { n: SKIP_ROUND })
      : save.started
        ? t("roundBadge", { n: save.round + 1 })
        : t("preparing");
    ui.count.textContent = t("marbleCount", { n: alive.length });
    ui.empty.hidden = alive.length > 0;
    ui.list.innerHTML = "";

    alive.forEach((marble) => {
      const chip = document.createElement("div");
      chip.className = "marble-chip";
      const mate = partnerName(save.marbles, marble);
      chip.innerHTML = `<i class="mini-marble" style="background:${marble.color}"></i><span>${escapeHtml(marble.name)}${mate ? ` <em class="pair-chip">♥ ${escapeHtml(mate)}</em>` : ""}</span>`;
      ui.list.appendChild(chip);
    });
    renderSavePairs(save);

    const canCreate = !save.started && !save.playLocked;
    const canPlay = save.started ? alive.length > 0 : alive.length >= MIN_MARBLES;
    ui.create.hidden = !canCreate;
    ui.creationLocked.hidden = canCreate;
    if (save.playLocked) {
      ui.play.disabled = false;
      ui.play.textContent = t("playRound");
      ui.requirement.hidden = true;
    } else {
      ui.play.disabled = !canPlay;
      if (save.speedBoostPending && !save.speedBoostUsed) {
        ui.play.textContent = t("playRoundBoost", { n: save.started ? save.round + 1 : 1 });
      } else {
        ui.play.textContent = save.started ? t("playRoundN", { n: save.round + 1 }) : t("startRound1");
      }
      ui.requirement.hidden = canPlay || save.started;
    }
    ui.minigames.disabled = alive.length === 0;
    ui.minigamesNeed.hidden = alive.length > 0;
    if (ui.roleplay) ui.roleplay.disabled = alive.length === 0;
    renderRejoinUi(save);
    renderPackPlacement(save, canCreate);
    renderLeaderboard(save);
    renderTopShowcase();
    renderMenuFaces();
    renderMenuFoods();
    renderCustomLists();
  }

  function canRejoin(save) {
    return !!save && save.rejoinsLeft > 0 && save.marbles.some((marble) => !marble.alive);
  }

  function toggleRejoinPicker() {
    if (!canRejoin(getSave())) {
      rejoinPickerOpen = false;
      renderRejoinUi();
      return;
    }
    rejoinPickerOpen = !rejoinPickerOpen;
    renderRejoinUi();
  }

  function reviveMarble(marbleId) {
    const save = getSave();
    if (!canRejoin(save) || !marbleId) return;
    const marble = save.marbles.find((item) => item.id === marbleId && !item.alive);
    if (!marble) return;
    marble.alive = true;
    save.rejoinsLeft = Math.max(0, save.rejoinsLeft - 1);
    rejoinPickerOpen = false;
    persist();
    if (!ui.modal.hidden) {
      ui.nextRound.hidden = aliveMarbles(save).length === 0;
      renderRejoinUi(save);
      return;
    }
    renderMenu();
  }

  function fillDeadList(target, dead) {
    target.innerHTML = "";
    dead.forEach((marble) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "marble-chip dead selectable";
      chip.innerHTML = `<i class="mini-marble" style="background:${marble.color}"></i><span>${escapeHtml(marble.name)}</span>`;
      chip.addEventListener("click", () => reviveMarble(marble.id));
      target.appendChild(chip);
    });
  }

  function renderRejoinUi(save) {
    const current = save || getSave();
    const dead = current ? current.marbles.filter((marble) => !marble.alive) : [];
    const available = canRejoin(current);
    const label = t("reviveMarble", { n: current ? current.rejoinsLeft : 0 });
    if (!available) rejoinPickerOpen = false;

    if (ui.rejoin) {
      ui.rejoin.hidden = !available || !ui.modal.hidden;
      ui.rejoin.textContent = label;
    }
    if (ui.eliminatedPanel) {
      ui.eliminatedPanel.hidden = !available || !rejoinPickerOpen || !ui.modal.hidden;
    }
    if (ui.eliminatedList && available && rejoinPickerOpen && ui.modal.hidden) {
      fillDeadList(ui.eliminatedList, dead);
    } else if (ui.eliminatedList) {
      ui.eliminatedList.innerHTML = "";
    }

    if (ui.modalRejoin) ui.modalRejoin.hidden = !available || ui.modal.hidden;
    if (ui.modalRejoinButton) {
      ui.modalRejoinButton.hidden = !available || ui.modal.hidden;
      ui.modalRejoinButton.textContent = label;
    }
    if (ui.modalRejoinPicker) ui.modalRejoinPicker.hidden = !available || ui.modal.hidden || !rejoinPickerOpen;
    if (ui.modalRejoinList && available && rejoinPickerOpen && !ui.modal.hidden) {
      fillDeadList(ui.modalRejoinList, dead);
    } else if (ui.modalRejoinList) {
      ui.modalRejoinList.innerHTML = "";
    }
  }

  function packPreview(pack) {
    return pack.marbles
      .slice(0, 12)
      .map((marble) => `<i style="background:${marble.color}" title="${escapeHtml(marble.name)}"></i>`)
      .join("");
  }

  function renderPackPlacement(save, canPlace) {
    ui.packPlacementPanel.hidden = !canPlace;
    ui.packPlacementList.innerHTML = "";
    ui.noPacksForSave.hidden = data.packs.length > 0;
    if (!canPlace) return;
    data.packs.forEach((pack) => {
      const row = document.createElement("div");
      row.className = "pack-placement-row";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(pack.name)}</strong>
          <span>${escapeHtml(t("packBalls", { n: pack.marbles.length }))}</span>
          <div class="pack-balls-preview">${packPreview(pack)}</div>
        </div>
      `;
      const place = document.createElement("button");
      place.type = "button";
      place.className = "button secondary compact";
      place.textContent = t("placePack");
      place.disabled = pack.marbles.length === 0;
      place.addEventListener("click", () => placePack(save, pack));
      row.appendChild(place);
      ui.packPlacementList.appendChild(row);
    });
  }

  function placePack(save, pack) {
    if (!save || save.started || !pack.marbles.length) return;
    const idMap = {};
    const copies = pack.marbles.map((marble) => {
      const id = makeId("m");
      idMap[marble.id] = id;
      return normalizeMarble({
        id,
        name: marble.name,
        color: marble.color,
        gender: normalizeGender(marble.gender),
        packId: pack.id,
        packMarbleId: marble.id,
        partnerId: "",
        roundsSurvived: 0,
        alive: true
      });
    });
    copies.forEach((copy, index) => {
      const src = pack.marbles[index];
      if (src && src.partnerId && idMap[src.partnerId]) copy.partnerId = idMap[src.partnerId];
    });
    sanitizePartners(copies);
    copies.forEach((copy) => save.marbles.push(copy));
    persist();
    renderMenu();
  }

  function renderPacks() {
    ui.packList.innerHTML = "";
    ui.emptyPacks.hidden = data.packs.length > 0;
    data.packs.forEach((pack) => {
      const row = document.createElement("div");
      row.className = "pack-row";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(pack.name)}</strong>
          <span>${escapeHtml(t("packBalls", { n: pack.marbles.length }))}</span>
          <div class="pack-balls-preview">${packPreview(pack)}</div>
        </div>
      `;
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "button secondary compact";
      edit.textContent = t("edit");
      edit.addEventListener("click", () => openPackEditor(pack.id));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pack-delete";
      remove.title = t("deletePack");
      remove.textContent = "×";
      remove.addEventListener("click", () => deletePack(pack.id));
      row.append(edit, remove);
      ui.packList.appendChild(row);
    });
  }

  function openPacks() {
    renderPacks();
    showScreen("packs");
  }

  function openPackEditor(packId) {
    const pack = data.packs.find((item) => item.id === packId) || null;
    editingPackId = pack ? pack.id : null;
    packDraft = sanitizePartners(
      pack ? pack.marbles.map((marble) => ({
        ...marble,
        gender: normalizeGender(marble.gender),
        partnerId: typeof marble.partnerId === "string" ? marble.partnerId : ""
      })) : []
    );
    ui.packName.value = pack ? pack.name : "";
    ui.packEditorTitle.textContent = pack ? t("editPack") : t("createPack");
    ui.packMarbleForm.reset();
    ui.packMarbleColor.value = "#55d6ff";
    packGenderOpen = packDraft.some((marble) => !normalizeGender(marble.gender));
    if (ui.packGenderNeed) ui.packGenderNeed.hidden = true;
    renderPackDraft();
    renderPackGenderPanel();
    renderPackPairs();
    showScreen("packEditor");
  }

  function packMissingGender() {
    return packDraft.filter((marble) => !normalizeGender(marble.gender));
  }

  function setPackMarbleGender(marbleId, gender) {
    const marble = packDraft.find((item) => item.id === marbleId);
    if (!marble) return;
    marble.gender = normalizeGender(gender);
    clearPartner(packDraft, marble.id);
    if (!packMissingGender().length && ui.packGenderNeed) ui.packGenderNeed.hidden = true;
    renderPackDraft();
    renderPackGenderPanel();
    renderPackPairs();
  }

  function openPackGenderPanel() {
    if (!packDraft.length) {
      if (ui.packGenderNeed) {
        ui.packGenderNeed.hidden = false;
        ui.packGenderNeed.textContent = t("packGenderEmpty");
      }
      packGenderOpen = false;
      renderPackGenderPanel();
      renderPackPairs();
      return;
    }
    packGenderOpen = true;
    if (ui.packGenderNeed) ui.packGenderNeed.hidden = true;
    renderPackGenderPanel();
    renderPackPairs();
    if (ui.packGenderPanel) ui.packGenderPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderPackGenderPanel() {
    if (!ui.packGenderPanel || !ui.packGenderList) return;
    ui.packGenderPanel.hidden = !packGenderOpen || !packDraft.length;
    ui.packGenderList.innerHTML = "";
    if (ui.packGenderPanel.hidden) return;
    packDraft.forEach((marble) => {
      const row = document.createElement("div");
      row.className = "pack-gender-row";
      const chosen = normalizeGender(marble.gender);
      row.innerHTML = `
        <i class="mini-marble" style="background:${marble.color}"></i>
        <strong>${escapeHtml(marble.name)}</strong>
      `;
      ["male", "female"].forEach((value) => {
        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = `pack-gender-pick${chosen === value ? " on" : ""}`;
        pick.textContent = value === "male" ? `♂ ${t("packGenderMale")}` : `♀ ${t("packGenderFemale")}`;
        pick.addEventListener("click", () => setPackMarbleGender(marble.id, value));
        row.appendChild(pick);
      });
      ui.packGenderList.appendChild(row);
    });
  }

  function requirePackGenders() {
    const missing = packMissingGender();
    if (!missing.length) {
      if (ui.packGenderNeed) ui.packGenderNeed.hidden = true;
      return true;
    }
    packGenderOpen = true;
    if (ui.packGenderNeed) {
      ui.packGenderNeed.hidden = false;
      ui.packGenderNeed.textContent = t("packGenderRequired", { n: missing.length });
    }
    renderPackGenderPanel();
    renderPackPairs();
    if (ui.packGenderPanel) ui.packGenderPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return false;
  }

  function renderPackPairs() {
    if (!ui.packPairPanel) return;
    const ready = gendersDone(packDraft);
    ui.packPairPanel.hidden = !ready;
    if (!ready) return;
    renderPairEditor(ui.packPairList, ui.packPairForm, packDraft, () => {
      renderPackDraft();
      renderPackPairs();
    });
  }

  function setSaveMarbleGender(marbleId, gender) {
    const save = getSave();
    const marble = save && findMarble(save.marbles, marbleId);
    if (!marble) return;
    marble.gender = normalizeGender(gender);
    sanitizePartners(save.marbles);
    persist();
    renderMenu();
  }

  function renderSaveGenderList(list) {
    if (!ui.saveGenderList) return;
    ui.saveGenderList.innerHTML = "";
    (list || []).forEach((marble) => {
      const row = document.createElement("div");
      row.className = "pack-gender-row";
      const chosen = normalizeGender(marble.gender);
      row.innerHTML = `
        <i class="mini-marble" style="background:${marble.color}"></i>
        <strong>${escapeHtml(marble.name)}${marble.alive ? "" : " ☠"}</strong>
      `;
      ["male", "female"].forEach((value) => {
        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = `pack-gender-pick${chosen === value ? " on" : ""}`;
        pick.textContent = value === "male" ? `♂ ${t("packGenderMale")}` : `♀ ${t("packGenderFemale")}`;
        pick.addEventListener("click", () => setSaveMarbleGender(marble.id, value));
        row.appendChild(pick);
      });
      ui.saveGenderList.appendChild(row);
    });
  }

  function renderSavePairs(save) {
    if (!ui.savePairPanel) return;
    const list = save && Array.isArray(save.marbles) ? save.marbles : [];
    ui.savePairPanel.hidden = false;
    renderSaveGenderList(list);
    if (!list.length) {
      if (ui.savePairList) ui.savePairList.innerHTML = "";
      if (ui.savePairForm) {
        ui.savePairForm.innerHTML = "";
        const need = document.createElement("p");
        need.className = "pair-empty";
        need.textContent = t("emptyInventory");
        ui.savePairForm.appendChild(need);
      }
      return;
    }
    renderPairEditor(ui.savePairList, ui.savePairForm, list, () => {
      persist();
      renderMenu();
    });
  }

  function leavePackEditor() {
    if (!requirePackGenders()) return;
    openPacks();
  }

  function renderPackDraft() {
    ui.packDraftList.innerHTML = "";
    ui.emptyPackDraft.hidden = packDraft.length > 0;
    packDraft.forEach((marble) => {
      const row = document.createElement("div");
      row.className = "pack-draft-row";
      const gender = normalizeGender(marble.gender);
      const mate = partnerName(packDraft, marble);
      row.innerHTML = `
        <i class="mini-marble" style="background:${marble.color}"></i>
        <div class="pack-draft-meta">
          <strong>${escapeHtml(marble.name)}</strong>
          <span class="pack-draft-gender${gender ? "" : " missing"}">${escapeHtml(genderLabel(gender))}${mate ? ` · ♥ ${escapeHtml(mate)}` : ""}</span>
        </div>
      `;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pack-remove-marble";
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        clearPartner(packDraft, marble.id);
        packDraft = packDraft.filter((item) => item.id !== marble.id);
        renderPackDraft();
        renderPackGenderPanel();
        renderPackPairs();
      });
      row.appendChild(remove);
      ui.packDraftList.appendChild(row);
    });
  }

  function addPackMarble(event) {
    event.preventDefault();
    const name = ui.packMarbleName.value.trim();
    if (!name) return;
    packDraft.push({
      id: makeId("pm"),
      name: name.slice(0, ITEM_NAME_MAX),
      color: ui.packMarbleColor.value,
      gender: "",
      partnerId: ""
    });
    ui.packMarbleName.value = "";
    renderPackDraft();
    renderPackGenderPanel();
    renderPackPairs();
    ui.packMarbleName.focus();
  }

  function savePack() {
    const name = ui.packName.value.trim();
    if (!name) {
      ui.packName.focus();
      return;
    }
    if (!requirePackGenders()) return;
    const existing = data.packs.find((pack) => pack.id === editingPackId);
    if (existing) {
      existing.name = name.slice(0, 24);
      existing.updatedAt = Date.now();
      existing.marbles = sanitizePartners(packDraft.map((marble) => ({
        id: marble.id,
        name: marble.name,
        color: marble.color,
        gender: normalizeGender(marble.gender),
        partnerId: marble.partnerId || ""
      })));
    } else {
      data.packs.push(
        normalizePack({
          id: makeId("pack"),
          name,
          updatedAt: Date.now(),
          marbles: packDraft
        }, data.packs.length)
      );
    }
    syncAllSaveGendersFromPacks();
    persist();
    renderPacks();
    showScreen("packs");
  }

  function deletePack(packId) {
    const pack = data.packs.find((item) => item.id === packId);
    if (!pack || !confirm(t("deletePackConfirm", { name: pack.name }))) return;
    data.packs = data.packs.filter((item) => item.id !== packId);
    persist();
    renderPacks();
  }

  function getTopMarbles() {
    const entries = [];
    data.saves.forEach((save) => {
      if (!save) return;
      save.marbles.forEach((marble) => {
        entries.push({ marble, saveName: save.name, deleted: false, score: marbleScore(marble, save) });
      });
    });
    data.retired.forEach((entry) => {
      entries.push({ marble: entry.marble, saveName: entry.saveName, deleted: true, score: entry.marble.roundsSurvived });
    });
    if (!entries.length) return { kind: "empty" };
    const max = Math.max(...entries.map((entry) => entry.score));
    if (max <= 0) return { kind: "none" };
    const tied = entries.filter((entry) => entry.score === max);
    if (tied.length > MAX_TOP_TIE) {
      return { kind: "tooMany", rounds: max, count: tied.length };
    }
    return { kind: "ok", entries: tied, rounds: max };
  }

  function topShowcaseHtml(result) {
    if (result.kind === "ok") {
      return result.entries
        .map((entry) => {
          const from = t(entry.deleted ? "topMarbleFromDeleted" : "topMarbleFrom", { save: entry.saveName });
          return `
            <div class="top-marble-card">
              <i class="mini-marble" style="background:${entry.marble.color}"></i>
              <div class="top-marble-meta">
                <strong>${escapeHtml(entry.marble.name)}</strong>
                <span class="top-save">${escapeHtml(from)}</span>
              </div>
              <span class="top-round">${escapeHtml(t("topMarbleRound", { n: result.rounds }))}</span>
            </div>
          `;
        })
        .join("");
    }
    if (result.kind === "tooMany") {
      return `<p class="top-marble-note">${escapeHtml(t("topMarbleTieBlocked", { n: result.count }))}</p>`;
    }
    return `<p class="top-marble-note">${escapeHtml(t("topMarbleNone"))}</p>`;
  }

  function renderTopShowcase() {
    const result = getTopMarbles();
    const disabled = result.kind === "empty" || result.kind === "none";
    ui.showTopMarbleButtons.forEach((button) => {
      button.disabled = disabled;
    });
    ui.topShowcases.forEach((showcase) => {
      if (!topShowcaseOpen) {
        showcase.hidden = true;
        showcase.innerHTML = "";
        return;
      }
      showcase.hidden = false;
      showcase.innerHTML = topShowcaseHtml(result);
    });
  }

  function toggleTopShowcase() {
    topShowcaseOpen = !topShowcaseOpen;
    renderTopShowcase();
  }

  function renderLeaderboard(save) {
    ui.leaderboard.innerHTML = "";
    const sorted = [...save.marbles].sort(
      (a, b) =>
        marbleScore(b, save) - marbleScore(a, save) || Number(b.alive) - Number(a.alive) || a.name.localeCompare(b.name)
    );
    if (!sorted.length) {
      ui.leaderboard.innerHTML = `<li class="empty">${escapeHtml(t("leaderboardEmpty"))}</li>`;
      return;
    }
    sorted.forEach((marble, index) => {
      const row = document.createElement("li");
      row.className = marble.alive ? "" : "dead";
      row.innerHTML = `
        <span class="rank">${index + 1}</span>
        <i class="mini-marble" style="background:${marble.color}"></i>
        <span class="name">${escapeHtml(marble.name)}${marble.alive ? "" : " ☠"}</span>
        <strong class="score">${marbleScore(marble, save)}</strong>
      `;
      ui.leaderboard.appendChild(row);
    });
  }

  function openCreate() {
    const save = getSave();
    if (!save || save.started) return;
    ui.form.reset();
    ui.color.value = "#55d6ff";
    createMarbleGender = "";
    if (ui.createGenderNeed) ui.createGenderNeed.hidden = true;
    updatePreview();
    renderCreateGender();
    renderCreatePair();
    showScreen("create");
    setTimeout(() => ui.name.focus(), 0);
  }

  function renderCreateGender() {
    if (ui.createGenderMale) {
      ui.createGenderMale.textContent = `♂ ${t("packGenderMale")}`;
      ui.createGenderMale.classList.toggle("on", createMarbleGender === "male");
    }
    if (ui.createGenderFemale) {
      ui.createGenderFemale.textContent = `♀ ${t("packGenderFemale")}`;
      ui.createGenderFemale.classList.toggle("on", createMarbleGender === "female");
    }
  }

  function setCreateMarbleGender(gender) {
    createMarbleGender = normalizeGender(gender);
    if (createMarbleGender && ui.createGenderNeed) ui.createGenderNeed.hidden = true;
    renderCreateGender();
    renderCreatePair();
  }

  function renderCreatePair() {
    if (!ui.createPairBox || !ui.createPairSelect) return;
    const save = getSave();
    const gender = normalizeGender(createMarbleGender);
    const want = gender === "male" ? "female" : gender === "female" ? "male" : "";
    const options = want && save ? unpairedOf(save.marbles, want) : [];
    const show = !!gender && options.length > 0;
    ui.createPairBox.hidden = !show;
    fillSelect(ui.createPairSelect, options, t("pairSkip"));
  }

  function requireCreateGender() {
    if (normalizeGender(createMarbleGender)) {
      if (ui.createGenderNeed) ui.createGenderNeed.hidden = true;
      return true;
    }
    if (ui.createGenderNeed) {
      ui.createGenderNeed.hidden = false;
      ui.createGenderNeed.textContent = t("packGenderRequired", { n: 1 });
    }
    return false;
  }

  function leaveCreate() {
    if (ui.name.value.trim() && !requireCreateGender()) return;
    showScreen("menu");
  }

  function updatePreview() {
    const name = ui.name.value.trim();
    ui.preview.style.setProperty("--marble-color", ui.color.value);
    ui.preview.querySelector("span").textContent = name ? name.slice(0, 2).toUpperCase() : "?";
  }

  function createMarble(event) {
    event.preventDefault();
    const save = getSave();
    const name = ui.name.value.trim();
    if (!save || save.started || !name) return;
    if (!requireCreateGender()) return;
    const created = normalizeMarble({
      id: makeId("m"),
      name,
      color: ui.color.value,
      gender: createMarbleGender,
      partnerId: "",
      roundsSurvived: 0,
      alive: true
    });
    save.marbles.push(created);
    const mateId = ui.createPairSelect && ui.createPairSelect.value;
    if (mateId) setPartner(save.marbles, created.id, mateId);
    persist();
    renderMenu();
    showScreen("menu");
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return function () {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function chooseMapId(round, lastMapId) {
    if (round === 13) return "13";
    let id;
    do {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
    } while (id === lastMapId || id === 13);
    return id;
  }

  function hashSeed(text) {
    let hash = 2166136261;
    for (const char of String(text)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  const LAYOUT_ALIAS = {
    ruins: "stairs", clouds: "islands", desert: "canyon", cyber: "zigzag",
    temple: "towers", sewer: "gauntlet", yin: "split", vines: "drops",
    marina: "bridge", abyss: "wells", frost: "ice", foundry: "factory",
    aurora: "night", magma: "volcano", bog: "swamp", orbit: "space"
  };

  const MAP_LAYOUTS = ["stairs", "ice", "volcano"];
  const LAYOUT_OBSTACLE = { stairs: 1, ice: 9, volcano: 5 };

  function baseLayout(layout) {
    return LAYOUT_ALIAS[layout] || layout;
  }

  const MAP_THEMES = {
    stairs: { label: { es: "Cueva de piedra", en: "Stone cave" }, sky: ["#5a3a28", "#140c08"], plat: ["#d7b48a", "#6b4423"], lava: ["#ffb703", "#6a040f"], accent: "#e9c46a" },
    islands: { label: { es: "Islas flotantes", en: "Floating isles" }, sky: ["#7fd0ea", "#16425b"], plat: ["#8fde7a", "#2d6a3a"], lava: ["#5eead4", "#0f766e"], accent: "#fff7c2" },
    canyon: { label: { es: "Cañón con viento", en: "Windy canyon" }, sky: ["#ff8a4c", "#3b0d0d"], plat: ["#e07a3d", "#7a2e12"], lava: ["#ff6b35", "#4a0000"], accent: "#ffd166" },
    zigzag: { label: { es: "Circuito neón", en: "Neon circuit" }, sky: ["#2b1144", "#050014"], plat: ["#d946ef", "#6b21a8"], lava: ["#22d3ee", "#0e7490"], accent: "#f0abfc" },
    towers: { label: { es: "Castillo", en: "Castle" }, sky: ["#6b7280", "#111827"], plat: ["#cbd5e1", "#334155"], lava: ["#f97316", "#7c2d12"], accent: "#f8fafc" },
    gauntlet: { label: { es: "Túnel metálico", en: "Metal tunnel" }, sky: ["#1f2937", "#020617"], plat: ["#9ca3af", "#111827"], lava: ["#ef4444", "#450a0a"], accent: "#facc15" },
    split: { label: { es: "Mundo partido", en: "Split world" }, sky: ["#1d4ed8", "#9a3412"], plat: ["#60a5fa", "#fb923c"], lava: ["#f43f5e", "#4c0519"], accent: "#fde68a" },
    drops: { label: { es: "Selva", en: "Jungle" }, sky: ["#14532d", "#022c22"], plat: ["#4ade80", "#166534"], lava: ["#84cc16", "#365314"], accent: "#bbf7d0" },
    bridge: { label: { es: "Atardecer", en: "Sunset" }, sky: ["#fb7185", "#3b0764"], plat: ["#fbbf24", "#92400e"], lava: ["#fb923c", "#7c2d12"], accent: "#fde68a" },
    wells: { label: { es: "Pozos", en: "Wells" }, sky: ["#134e4a", "#022c22"], plat: ["#5eead4", "#115e59"], lava: ["#2dd4bf", "#134e4a"], accent: "#99f6e4" },
    ice: { label: { es: "Hielo resbaloso", en: "Slippery ice" }, sky: ["#e0f2fe", "#0c4a6e"], plat: ["#bae6fd", "#0369a1"], lava: ["#38bdf8", "#0c4a6e"], accent: "#f0f9ff" },
    factory: { label: { es: "Cinta de fábrica", en: "Factory belt" }, sky: ["#44403c", "#0c0a09"], plat: ["#a8a29e", "#292524"], lava: ["#f59e0b", "#7c2d12"], accent: "#facc15" },
    night: { label: { es: "Noche estrellada", en: "Starry night" }, sky: ["#1e1b4b", "#020617"], plat: ["#a78bfa", "#4c1d95"], lava: ["#818cf8", "#1e1b4b"], accent: "#fde68a" },
    volcano: { label: { es: "Volcán", en: "Volcano" }, sky: ["#7f1d1d", "#1c1917"], plat: ["#fb923c", "#7c2d12"], lava: ["#f97316", "#450a0a"], accent: "#fed7aa" },
    swamp: { label: { es: "Pantano", en: "Swamp" }, sky: ["#365314", "#14532d"], plat: ["#a3e635", "#3f6212"], lava: ["#65a30d", "#365314"], accent: "#d9f99d" },
    space: { label: { es: "Gravedad cero", en: "Zero gravity" }, sky: ["#020617", "#0f172a"], plat: ["#67e8f9", "#155e75"], lava: ["#6366f1", "#1e1b4b"], accent: "#e0f2fe" },
    ruins: { label: { es: "Ruinas", en: "Ruins" }, sky: ["#78716c", "#1c1917"], plat: ["#a8a29e", "#44403c"], lava: ["#f97316", "#7c2d12"], accent: "#fecaca" },
    clouds: { label: { es: "Cielo de nubes", en: "Cloud sky" }, sky: ["#dbeafe", "#93c5fd"], plat: ["#f8fafc", "#94a3b8"], lava: ["#38bdf8", "#0369a1"], accent: "#fff" },
    desert: { label: { es: "Desierto", en: "Desert" }, sky: ["#fde68a", "#b45309"], plat: ["#fbbf24", "#92400e"], lava: ["#ea580c", "#7c2d12"], accent: "#fef3c7" },
    cyber: { label: { es: "Ciberciudad", en: "Cyber city" }, sky: ["#083344", "#022c22"], plat: ["#22d3ee", "#0f766e"], lava: ["#f472b6", "#831843"], accent: "#a5f3fc" },
    temple: { label: { es: "Templo", en: "Temple" }, sky: ["#713f12", "#1c1917"], plat: ["#f59e0b", "#78350f"], lava: ["#dc2626", "#450a0a"], accent: "#fde68a" },
    sewer: { label: { es: "Cloaca", en: "Sewer" }, sky: ["#365314", "#052e16"], plat: ["#84cc16", "#3f6212"], lava: ["#a3e635", "#365314"], accent: "#d9f99d" },
    yin: { label: { es: "Yin yang", en: "Yin yang" }, sky: ["#111827", "#f8fafc"], plat: ["#e5e7eb", "#111827"], lava: ["#ef4444", "#1f2937"], accent: "#fff" },
    vines: { label: { es: "Enredaderas", en: "Vines" }, sky: ["#052e16", "#14532d"], plat: ["#22c55e", "#14532d"], lava: ["#facc15", "#365314"], accent: "#bbf7d0" },
    marina: { label: { es: "Puerto", en: "Harbor" }, sky: ["#38bdf8", "#0c4a6e"], plat: ["#fdba74", "#9a3412"], lava: ["#0ea5e9", "#1e3a8a"], accent: "#fef3c7" },
    abyss: { label: { es: "Abismo", en: "Abyss" }, sky: ["#020617", "#1e1b4b"], plat: ["#818cf8", "#312e81"], lava: ["#c084fc", "#4c1d95"], accent: "#ddd6fe" },
    frost: { label: { es: "Ventisca", en: "Blizzard" }, sky: ["#f8fafc", "#334155"], plat: ["#e2e8f0", "#0ea5e9"], lava: ["#7dd3fc", "#1e3a8a"], accent: "#fff" },
    foundry: { label: { es: "Fundición", en: "Foundry" }, sky: ["#431407", "#0c0a09"], plat: ["#fb923c", "#7c2d12"], lava: ["#fbbf24", "#9a3412"], accent: "#fde68a" },
    aurora: { label: { es: "Aurora", en: "Aurora" }, sky: ["#064e3b", "#1e1b4b"], plat: ["#6ee7b7", "#5b21b6"], lava: ["#34d399", "#4c1d95"], accent: "#a7f3d0" },
    magma: { label: { es: "Magma", en: "Magma" }, sky: ["#450a0a", "#0c0a09"], plat: ["#ef4444", "#7f1d1d"], lava: ["#facc15", "#9a3412"], accent: "#fecaca" },
    bog: { label: { es: "Ciénaga", en: "Bog" }, sky: ["#1a2e05", "#022c22"], plat: ["#65a30d", "#365314"], lava: ["#84cc16", "#14532d"], accent: "#d9f99d" },
    orbit: { label: { es: "Órbita", en: "Orbit" }, sky: ["#0b1026", "#020617"], plat: ["#c4b5fd", "#5b21b6"], lava: ["#f472b6", "#4c1d95"], accent: "#f5d0fe" }
  };

  const MAP_RULES = {
    stairs: { gravity: 1, slide: 1, bounce: 0.2, wind: 0, minVx: 1.1, conveyor: 0 },
    islands: { gravity: 0.52, slide: 1, bounce: 0.85, wind: 0, minVx: 0.85, conveyor: 0 },
    canyon: { gravity: 1.15, slide: 1, bounce: 0.08, wind: 0.22, minVx: 1.45, conveyor: 0 },
    zigzag: { gravity: 0.9, slide: 1.2, bounce: 0.28, wind: 0, minVx: 1.55, conveyor: 0 },
    towers: { gravity: 1, slide: 1, bounce: 0.16, wind: 0, minVx: 1.15, conveyor: 0 },
    gauntlet: { gravity: 1, slide: 1.25, bounce: 0.02, wind: 0, minVx: 1.9, conveyor: 0.04 },
    split: { gravity: 1, slide: 1, bounce: 0.22, wind: 0, minVx: 1.15, conveyor: 0 },
    drops: { gravity: 1.4, slide: 0.82, bounce: 0.04, wind: 0, minVx: 0.95, conveyor: 0 },
    bridge: { gravity: 0.82, slide: 1, bounce: 0.35, wind: 0.06, minVx: 1.25, conveyor: 0 },
    wells: { gravity: 1.12, slide: 0.88, bounce: 0.5, wind: 0, minVx: 1, conveyor: 0 },
    ice: { gravity: 0.75, slide: 1.55, bounce: 0.04, wind: 0, minVx: 2.35, conveyor: 0 },
    factory: { gravity: 1, slide: 1.2, bounce: 0, wind: 0, minVx: 1.7, conveyor: 0.18 },
    night: { gravity: 0.7, slide: 1.05, bounce: 0.4, wind: 0, minVx: 1.05, conveyor: 0 },
    volcano: { gravity: 1.35, slide: 0.95, bounce: 0.12, wind: 0.05, minVx: 1.2, conveyor: 0 },
    swamp: { gravity: 1.05, slide: 0.7, bounce: 0.08, wind: 0, minVx: 0.75, conveyor: 0 },
    space: { gravity: 0.28, slide: 1.1, bounce: 0.95, wind: 0, minVx: 0.7, conveyor: 0 },
    ruins: { gravity: 1.08, slide: 1, bounce: 0.12, wind: 0, minVx: 1.2, conveyor: 0 },
    clouds: { gravity: 0.48, slide: 1, bounce: 0.9, wind: 0.08, minVx: 0.8, conveyor: 0 },
    desert: { gravity: 1.2, slide: 1.05, bounce: 0.06, wind: 0.28, minVx: 1.5, conveyor: 0 },
    cyber: { gravity: 0.88, slide: 1.25, bounce: 0.3, wind: 0, minVx: 1.65, conveyor: 0 },
    temple: { gravity: 1.05, slide: 1, bounce: 0.14, wind: 0, minVx: 1.2, conveyor: 0 },
    sewer: { gravity: 1.05, slide: 1.2, bounce: 0, wind: 0, minVx: 1.85, conveyor: 0.06 },
    yin: { gravity: 1, slide: 1, bounce: 0.2, wind: 0, minVx: 1.2, conveyor: 0 },
    vines: { gravity: 1.45, slide: 0.8, bounce: 0.03, wind: 0, minVx: 0.9, conveyor: 0 },
    marina: { gravity: 0.86, slide: 1, bounce: 0.32, wind: 0.1, minVx: 1.3, conveyor: 0 },
    abyss: { gravity: 1.2, slide: 0.85, bounce: 0.45, wind: 0, minVx: 1.05, conveyor: 0 },
    frost: { gravity: 0.72, slide: 1.65, bounce: 0.03, wind: 0.04, minVx: 2.5, conveyor: 0 },
    foundry: { gravity: 1.08, slide: 1.25, bounce: 0, wind: 0, minVx: 1.8, conveyor: 0.2 },
    aurora: { gravity: 0.68, slide: 1.08, bounce: 0.42, wind: 0, minVx: 1.1, conveyor: 0 },
    magma: { gravity: 1.42, slide: 0.92, bounce: 0.1, wind: 0.08, minVx: 1.25, conveyor: 0 },
    bog: { gravity: 1.12, slide: 0.62, bounce: 0.06, wind: 0, minVx: 0.7, conveyor: 0 },
    orbit: { gravity: 0.24, slide: 1.15, bounce: 1, wind: 0, minVx: 0.65, conveyor: 0 }
  };

  function mapRules() {
    return (currentMap && currentMap.rules) || MAP_RULES.stairs;
  }

  function layoutLabel(layout) {
    const pack = (MAP_THEMES[layout] || MAP_THEMES.stairs).label;
    const lang = typeof GameI18n.getLang === "function" ? GameI18n.getLang() : "es";
    return pack[lang] || pack.es;
  }

  function setCampaignTitle() {
    if (!currentMap) return;
    if (currentMap.custom) {
      ui.levelTitle.textContent = `${t("levelTitle", {
        round: currentRound,
        id: currentMap.name || currentMap.id,
        variant: currentMap.variant
      })} · ${t("levelDifficulty", { n: currentMap.difficulty || currentMap.variant || 1 })}`;
      return;
    }
    ui.levelTitle.textContent = `${t("levelTitle", {
      round: currentRound,
      id: currentMap.id,
      variant: currentMap.variant
    })} · ${layoutLabel(currentMap.layout)} · ${obstacleLabel(currentMap.obstacle)}`;
  }

  const OBSTACLE_PRESETS = [
    { kill: 2, good: 0, pads: 0, label: { es: "Lava en el camino", en: "Path lava" } },
    { kill: 2, good: 0, pads: 2, label: { es: "2 saltos", en: "2 jumps" } },
    { kill: 2, good: 0, pads: 4, label: { es: "4 saltos", en: "4 jumps" } },
    { kill: 3, good: 0, pads: 6, label: { es: "6 saltos", en: "6 jumps" } },
    { kill: 4, good: 0, pads: 0, label: { es: "Lava extra", en: "Extra lava" } },
    { kill: 6, good: 0, pads: 0, label: { es: "Doble lava", en: "Double lava" } },
    { kill: 2, good: 2, pads: 0, label: { es: "Lava buena", en: "Good lava" } },
    { kill: 3, good: 4, pads: 0, label: { es: "2 lavas buenas", en: "2 good lavas" } },
    { kill: 3, good: 0, pads: 2, label: { es: "Salto y lava", en: "Jump and lava" } },
    { kill: 5, good: 0, pads: 4, label: { es: "Saltar la lava", en: "Jump the lava" } },
    { kill: 2, good: 2, pads: 4, label: { es: "Saltos y portal", en: "Jumps and portal" } },
    { kill: 4, good: 2, pads: 0, label: { es: "2 lavas", en: "2 lavas" } },
    { kill: 4, good: 2, pads: 2, label: { es: "Mix chico", en: "Small mix" } },
    { kill: 6, good: 2, pads: 4, label: { es: "Mix medio", en: "Medium mix" } },
    { kill: 4, good: 4, pads: 2, label: { es: "Portales", en: "Portals" } },
    { kill: 6, good: 4, pads: 6, label: { es: "Mix grande", en: "Big mix" } },
    { kill: 8, good: 4, pads: 6, label: { es: "Caos", en: "Chaos" } }
  ];

  function obstacleLabel(index) {
    const pack = (OBSTACLE_PRESETS[index] || OBSTACLE_PRESETS[0]).label;
    const lang = typeof GameI18n.getLang === "function" ? GameI18n.getLang() : "es";
    return pack[lang] || pack.es;
  }

  function clampPlat(platform) {
    platform.w = Math.max(160, Math.min(760, platform.w));
    platform.x = Math.max(15, Math.min(WIDTH - 15 - platform.w, platform.x));
    platform.y = Math.max(46, Math.min(500, platform.y));
    platform.h = platform.h || 18;
    return platform;
  }

  function wallPlatforms() {
    return [
      { x: 0, y: 0, w: 15, h: HEIGHT },
      { x: WIDTH - 15, y: 0, w: 15, h: HEIGHT }
    ];
  }

  function makeHazardAt(x, y, rng, round, axis) {
    return {
      x,
      baseX: x,
      baseY: y,
      radius: 9 + rng() * 3,
      amplitude: 16 + rng() * 22,
      speed: 0.001 + rng() * 0.0011 + Math.min(0.00025, round * 0.00001),
      phase: rng() * Math.PI * 2,
      axis: axis || (rng() < 0.25 ? "x" : "y")
    };
  }

  function xOverlap(a, b) {
    return Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  }

  function canDropTo(from, to) {
    return !!from && !!to && to.y >= from.y + 36 && to.y - from.y <= 150 && xOverlap(from, to) >= 90;
  }

  function fillDrop(from, to, width) {
    const fillers = [];
    let current = from;
    const span = width || 320;
    for (let i = 0; i < 5 && !canDropTo(current, to); i += 1) {
      const nextY = Math.max(current.y + 70, Math.min(to.y - 50, current.y + 100));
      const left = Math.max(current.x, to.x);
      const right = Math.min(current.x + current.w, to.x + to.w);
      const center = right > left ? (left + right) / 2 : (current.x + current.w / 2 + to.x + to.w / 2) / 2;
      const step = clampPlat({ x: center - span / 2, y: nextY, w: span, h: current.h || 18 });
      if (step.y <= current.y + 24) break;
      fillers.push(step);
      current = step;
    }
    return fillers;
  }

  function linkRoute(steps, fillerW) {
    const route = [steps[0]];
    for (let i = 1; i < steps.length; i += 1) {
      fillDrop(route[route.length - 1], steps[i], fillerW).forEach((step) => route.push(step));
      route.push(steps[i]);
    }
    for (let i = 0; i < route.length - 1 && i < 16; i += 1) {
      if (canDropTo(route[i], route[i + 1])) continue;
      route.splice(i + 1, 0, clampPlat({
        x: Math.min(route[i].x, route[i + 1].x),
        y: route[i].y + 80,
        w: fillerW || 300,
        h: 22
      }));
    }
    for (let i = 0; i < route.length - 1; i += 1) {
      const from = route[i];
      const to = route[i + 1];
      if (!to || to.h >= HEIGHT - 4) continue;
      const needRight = from.x + from.w + 55;
      if (to.x + to.w < needRight) {
        const right = Math.min(WIDTH - 15, needRight);
        to.w = Math.min(760, right - 15);
        to.x = right - to.w;
        clampPlat(to);
      }
    }
    return hardenRoute(route);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function laneRects(route) {
    const floors = route.filter((platform) => platform.h < HEIGHT - 4);
    const rects = [];
    floors.forEach((platform, index) => {
      rects.push({ x: platform.x - 6, y: platform.y - 24, w: platform.w + 12, h: 40 });
      const next = floors[index + 1];
      if (!next) return;
      const left = Math.max(platform.x, next.x);
      const right = Math.min(platform.x + platform.w, next.x + next.w);
      if (right - left > 8) {
        rects.push({
          x: left - 8,
          y: platform.y,
          w: right - left + 16,
          h: Math.max(24, next.y - platform.y + 10)
        });
      }
    });
    return rects;
  }

  function hitsLane(rect, lanes) {
    return lanes.some((lane) => rectsOverlap(rect, lane));
  }

  function hardenRoute(route) {
    if (!route.length) return route;
    const first = route[0];
    first.x = 18;
    first.y = Math.min(first.y, 110);
    first.w = Math.max(340, first.w);
    first.h = Math.max(22, first.h);
    clampPlat(first);
    const last = route[route.length - 1];
    last.x = 200;
    last.y = 490;
    last.w = 760;
    last.h = 24;
    clampPlat(last);
    last.y = 490;
    for (let i = 0; i < route.length - 1; i += 1) {
      const from = route[i];
      const to = route[i + 1];
      if (!to || to.h >= HEIGHT - 4) continue;
      if (to === last) {
        to.y = 490;
        to.w = 760;
        to.x = 200;
      }
      if (to.y < from.y + 40) to.y = Math.min(490, from.y + 72);
      if (xOverlap(from, to) < 90) {
        const right = Math.min(WIDTH - 15, Math.max(from.x + from.w + 40, to.x + to.w));
        to.w = Math.min(760, Math.max(240, right - Math.min(from.x, to.x)));
        to.x = right - to.w;
        clampPlat(to);
      }
    }
    last.y = 490;
    last.w = 760;
    last.x = 200;
    return route;
  }

  function makeSafeRoute(layout, jitter) {
    const jx = (base, extra) => base + jitter(-extra, extra);
    const recipes = {
      stairs: { filler: 420, steps: [[18, 88, 420, 26], [90, 200, 500, 26], [170, 312, 580, 26], [250, 424, 640, 26], [220, 508, 760, 28]] },
      islands: { filler: 240, steps: [[18, 70, 300, 20], [160, 220, 340, 20], [340, 360, 360, 20], [220, 508, 760, 24]] },
      canyon: { filler: 260, steps: [[18, 70, 280, 34], [18, 200, 400, 34], [18, 330, 460, 34], [180, 508, 760, 30]] },
      zigzag: { filler: 280, steps: [[18, 80, 300, 22], [180, 200, 520, 22], [40, 330, 740, 22], [220, 440, 620, 22], [220, 508, 760, 26]] },
      towers: { filler: 220, steps: [[18, 64, 260, 18], [120, 150, 240, 18], [240, 236, 240, 18], [360, 322, 240, 18], [480, 408, 280, 18], [220, 508, 760, 24]] },
      gauntlet: { filler: 680, steps: [[18, 120, 740, 36], [30, 300, 750, 36], [200, 508, 760, 32]] },
      split: { filler: 300, steps: [[18, 90, 260, 24], [160, 230, 360, 24], [40, 370, 700, 24], [220, 508, 760, 28]] },
      drops: { filler: 260, steps: [[18, 60, 280, 18], [160, 210, 340, 18], [340, 360, 380, 18], [220, 508, 760, 24]] },
      bridge: { filler: 200, steps: [[18, 74, 220, 16], [160, 154, 200, 16], [310, 234, 200, 16], [460, 314, 200, 16], [600, 394, 220, 16], [220, 508, 760, 24]] },
      wells: { filler: 360, steps: [[18, 80, 560, 28], [180, 230, 500, 40], [40, 380, 720, 22], [200, 508, 760, 26]] },
      ice: { filler: 500, steps: [[18, 100, 620, 14], [80, 250, 700, 14], [140, 400, 720, 14], [200, 508, 760, 16]] },
      factory: { filler: 340, steps: [[18, 86, 360, 40], [200, 230, 380, 40], [380, 374, 400, 40], [200, 508, 760, 36]] },
      night: { filler: 260, steps: [[18, 96, 340, 16], [200, 240, 300, 16], [420, 380, 320, 16], [220, 508, 760, 20]] },
      volcano: { filler: 380, steps: [[18, 110, 480, 44], [140, 300, 560, 44], [200, 508, 760, 40]] },
      swamp: { filler: 300, steps: [[18, 100, 400, 26], [120, 250, 360, 30], [280, 390, 420, 28], [200, 508, 760, 28]] },
      space: { filler: 220, steps: [[18, 80, 260, 12], [220, 210, 240, 12], [430, 340, 260, 12], [220, 508, 760, 16]] },
      ruins: { filler: 280, steps: [[18, 76, 300, 22], [150, 190, 280, 22], [310, 310, 300, 22], [200, 430, 360, 22], [260, 508, 680, 24]] },
      clouds: { filler: 200, steps: [[18, 64, 240, 16], [220, 190, 220, 16], [430, 320, 240, 16], [260, 508, 680, 20]] },
      desert: { filler: 230, steps: [[18, 70, 240, 28], [40, 210, 320, 28], [80, 350, 360, 28], [240, 508, 680, 26]] },
      cyber: { filler: 240, steps: [[18, 72, 260, 16], [240, 180, 420, 16], [60, 300, 680, 16], [280, 420, 480, 16], [260, 508, 680, 20]] },
      temple: { filler: 200, steps: [[18, 60, 220, 16], [150, 150, 200, 16], [300, 240, 200, 16], [450, 330, 220, 16], [260, 508, 680, 22]] },
      sewer: { filler: 520, steps: [[18, 110, 640, 30], [80, 280, 640, 30], [240, 508, 680, 28]] },
      yin: { filler: 260, steps: [[18, 86, 220, 20], [200, 220, 280, 20], [80, 360, 600, 20], [260, 508, 680, 24]] },
      vines: { filler: 220, steps: [[18, 58, 240, 16], [200, 200, 260, 16], [400, 350, 280, 16], [260, 508, 680, 20]] },
      marina: { filler: 180, steps: [[18, 70, 190, 14], [180, 150, 180, 14], [340, 230, 180, 14], [500, 310, 180, 14], [260, 508, 680, 20]] },
      abyss: { filler: 300, steps: [[18, 74, 480, 24], [220, 220, 400, 34], [80, 370, 620, 20], [260, 508, 680, 22]] },
      frost: { filler: 420, steps: [[18, 96, 520, 12], [120, 250, 560, 12], [200, 400, 600, 12], [260, 508, 680, 14]] },
      foundry: { filler: 300, steps: [[18, 84, 300, 34], [240, 230, 320, 34], [420, 380, 340, 34], [260, 508, 680, 30]] },
      aurora: { filler: 230, steps: [[18, 90, 280, 14], [240, 230, 260, 14], [460, 370, 280, 14], [260, 508, 680, 18]] },
      magma: { filler: 320, steps: [[18, 108, 400, 38], [180, 300, 460, 38], [260, 508, 680, 34]] },
      bog: { filler: 250, steps: [[18, 96, 320, 22], [160, 250, 280, 24], [340, 390, 340, 24], [260, 508, 680, 24]] },
      orbit: { filler: 190, steps: [[18, 76, 220, 10], [260, 200, 200, 10], [480, 330, 220, 10], [260, 508, 680, 14]] }
    };
    const recipe = recipes[layout] || recipes[baseLayout(layout)] || recipes.stairs;
    const steps = recipe.steps.map((pair, index) => clampPlat({
      x: jx(pair[0], index === 0 ? 0 : 10),
      y: index === recipe.steps.length - 1 ? 508 : jx(pair[1], 6),
      w: jx(pair[2], 14),
      h: pair[3] || 22
    }));
    return linkRoute(steps, recipe.filler);
  }

  function interceptsRoute(platform, route) {
    return route.some((step) => {
      const closeY = Math.abs(platform.y - step.y) < 56;
      const under = platform.y > step.y - 8 && platform.y < step.y + 250;
      return (closeY || under) && xOverlap(platform, step) > 4;
    });
  }

  function buildLayoutPlatforms(layout, rng, jitter) {
    if (layout === "islands") {
      const spawn = clampPlat({ x: 15, y: 80 + jitter(0, 20), w: 280 + jitter(0, 40), h: 20 });
      const rest = Array.from({ length: 8 }, (_, index) => clampPlat({
        x: 40 + ((index * 110 + jitter(0, 40)) % 760),
        y: 150 + ((index * 52 + jitter(0, 24)) % 340),
        w: 160 + jitter(0, 70),
        h: 18
      }));
      rest.push(clampPlat({ x: 680, y: 510, w: 280, h: 22 }));
      return [spawn].concat(rest);
    }
    if (layout === "canyon") {
      const left = Array.from({ length: 3 }, (_, index) => clampPlat({
        x: 15,
        y: 90 + index * 140 + jitter(-8, 10),
        w: 240 + jitter(0, 40),
        h: 18
      }));
      const right = Array.from({ length: 3 }, (_, index) => clampPlat({
        x: 680 + jitter(-10, 16),
        y: 150 + index * 130 + jitter(-8, 10),
        w: 250 + jitter(0, 30),
        h: 18
      }));
      const bridges = Array.from({ length: 4 }, (_, index) => clampPlat({
        x: 160 + jitter(0, 40),
        y: 140 + index * 110 + jitter(-10, 12),
        w: 420 + jitter(0, 80),
        h: 18
      }));
      return left.concat(right, bridges);
    }
    if (layout === "zigzag") {
      const count = 5;
      const steps = Array.from({ length: count }, (_, index) => {
        const left = index % 2 === 0;
        return clampPlat({
          x: left ? 15 + jitter(0, 20) : 420 + jitter(0, 40),
          y: 80 + index * 100 + jitter(-6, 8),
          w: 320 + jitter(0, 60),
          h: 18
        });
      });
      for (let i = 0; i < count - 1; i += 1) {
        steps.push(clampPlat({
          x: 280 + jitter(-30, 30),
          y: (steps[i].y + steps[i + 1].y) / 2,
          w: 200 + jitter(0, 40),
          h: 16
        }));
      }
      return steps;
    }
    if (layout === "towers") {
      const cols = [20, 340, 680];
      const towers = cols.flatMap((x, col) => Array.from({ length: 3 }, (_, index) => clampPlat({
        x: x + jitter(0, 16),
        y: 90 + index * 140 + jitter(-8, 10) + col * 8,
        w: 220 + jitter(0, 30),
        h: 18
      })));
      towers[0] = clampPlat({ x: 15, y: 80, w: 260, h: 20 });
      towers.push(clampPlat({ x: 680, y: 520, w: 280, h: 22 }));
      return towers;
    }
    if (layout === "gauntlet") {
      return [
        clampPlat({ x: 15, y: 90 + jitter(-6, 10), w: 380 + jitter(0, 30), h: 20 }),
        clampPlat({ x: 40 + jitter(0, 20), y: 240 + jitter(-8, 10), w: 860, h: 20 }),
        clampPlat({ x: 30 + jitter(0, 16), y: 380 + jitter(-8, 10), w: 880, h: 20 }),
        clampPlat({ x: 160 + jitter(0, 30), y: 510, w: 780, h: 22 })
      ];
    }
    if (layout === "split") {
      const left = Array.from({ length: 3 }, (_, index) => clampPlat({
        x: 20,
        y: 90 + index * 130 + jitter(-6, 8),
        w: 280 + jitter(0, 30),
        h: 18
      }));
      const right = Array.from({ length: 3 }, (_, index) => clampPlat({
        x: 620,
        y: 110 + index * 125 + jitter(-6, 8),
        w: 280 + jitter(0, 30),
        h: 18
      }));
      const mids = [
        clampPlat({ x: 260, y: 180, w: 260, h: 16 }),
        clampPlat({ x: 280, y: 330, w: 280, h: 16 }),
        clampPlat({ x: 240, y: 520, w: 500, h: 22 })
      ];
      return left.concat(right, mids);
    }
    if (layout === "drops") {
      return [
        clampPlat({ x: 15, y: 80 + jitter(0, 12), w: 420 + jitter(0, 30), h: 22 }),
        clampPlat({ x: 220 + jitter(-20, 30), y: 230 + jitter(-8, 10), w: 400 + jitter(0, 40), h: 20 }),
        clampPlat({ x: 80 + jitter(0, 40), y: 370 + jitter(-8, 8), w: 380 + jitter(0, 40), h: 20 }),
        clampPlat({ x: 480 + jitter(-20, 20), y: 510, w: 420, h: 22 })
      ];
    }
    if (layout === "bridge") {
      const count = 6;
      return Array.from({ length: count }, (_, index) => clampPlat({
        x: 20 + index * 140 + jitter(-8, 10),
        y: 160 + Math.sin(index * 0.9) * 70 + index * 40,
        w: 180 + jitter(0, 40),
        h: 18
      }));
    }
    if (layout === "wells") {
      return [
        clampPlat({ x: 15, y: 80, w: 300, h: 18 }),
        clampPlat({ x: 280, y: 80, w: 240, h: 18 }),
        clampPlat({ x: 560, y: 90, w: 300, h: 18 }),
        clampPlat({ x: 15, y: 250, w: 260, h: 18 }),
        clampPlat({ x: 240, y: 270, w: 280, h: 18 }),
        clampPlat({ x: 520, y: 260, w: 320, h: 18 }),
        clampPlat({ x: 60, y: 430, w: 280, h: 18 }),
        clampPlat({ x: 380, y: 440, w: 280, h: 18 }),
        clampPlat({ x: 640, y: 520, w: 320, h: 22 })
      ];
    }
    const floors = 4;
    const stairs = Array.from({ length: floors }, (_, index) => clampPlat({
      x: index % 2 === 0 ? 15 + jitter(0, 30) : 280 + jitter(0, 80),
      y: 80 + index * 130 + jitter(-8, 8),
      w: 320 + jitter(0, 80),
      h: 18
    }));
    stairs[0] = clampPlat({ x: 15, y: 80, w: 300, h: 20 });
    return stairs;
  }

  function buildObstacles(route, preset, rng) {
    const jumpPads = [];
    const killPools = [];
    const goodLava = [];
    const floors = route.filter((platform) => platform.h < HEIGHT - 4);
    const playable = floors.slice(0, Math.max(1, floors.length - 1));
    const later = playable.slice(1);
    const lanes = laneRects(route);
    playable.forEach((platform, index) => {
      if (jumpPads.length >= preset.pads) return;
      if (index === 0) return;
      jumpPads.push({
        x: platform.x + Math.max(90, platform.w * 0.42),
        y: platform.y - 15,
        w: 46,
        h: 15
      });
    });
    later.forEach((platform) => {
      if (killPools.length >= preset.kill) return;
      const pit = {
        x: Math.max(18, platform.x - 62),
        y: platform.y + 20,
        w: 50,
        h: 22
      };
      if (!hitsLane(pit, lanes)) killPools.push(pit);
    });
    later.forEach((platform) => {
      if (killPools.length >= preset.kill) return;
      const pit = {
        x: Math.min(WIDTH - 78, platform.x + platform.w + 12),
        y: platform.y + 24,
        w: 54,
        h: 22
      };
      if (!hitsLane(pit, lanes)) killPools.push(pit);
    });
    later.forEach((platform, index) => {
      if (goodLava.length >= preset.good) return;
      if (platform.x < 96) return;
      const portal = {
        x: platform.x - 72,
        y: platform.y + 30,
        w: 48,
        h: 24
      };
      if ((index % 2 === 0 || preset.good > 2) && !hitsLane(portal, lanes)) goodLava.push(portal);
    });
    return {
      jumpPads: jumpPads.slice(0, preset.pads),
      killPools: killPools.filter((pool) => !hitsLane(pool, lanes)),
      goodLava: goodLava.filter((pool) => !hitsLane(pool, lanes))
    };
  }

  function mapFromCustom(custom, round) {
    const parts = (custom.parts || []).map(normalizeLevelPart).filter(Boolean);
    const spawn = parts.find((part) => part.type === "spawn") || { type: "spawn", x: 40, y: 90, w: 280, h: 18, rot: 0, holes: [] };
    const rest = parts.filter((part) => part.type === "spawn" || part.type === "platform");
    const platforms = [spawn].concat(rest.filter((part) => part !== spawn)).concat(wallPlatforms());
    const route = platforms.filter((plat) => plat.h <= 30);
    return {
      id: custom.name || custom.id || `C${round}`,
      name: custom.name || t("createMap"),
      custom: true,
      layout: "custom",
      obstacle: -1,
      variant: custom.difficulty || 10,
      difficulty: custom.difficulty || 10,
      platforms,
      route,
      scenery: [],
      blueBlocks: parts.filter((part) => part.type === "blue").map((part) => ({ ...part, active: true })),
      lava: parts.filter((part) => part.type === "lava"),
      killPools: parts.filter((part) => part.type === "kill"),
      goodLava: parts.filter((part) => part.type === "portal"),
      jumpPads: parts.filter((part) => part.type === "pad"),
      hazards: parts.filter((part) => part.type === "hazard").map((part) => {
        const c = partCenter(part);
        return {
          x: c.x,
          baseX: c.x,
          baseY: c.y,
          radius: Math.max(8, Math.min(part.w, part.h) / 2),
          amplitude: 18,
          speed: 0.0012,
          phase: 0,
          axis: "y",
          part
        };
      }),
      goal: parts.find((part) => part.type === "safe") || { type: "safe", x: 750, y: 400, w: 200, h: 52, rot: 0, holes: [] },
      theme: MAP_THEMES.stairs,
      rules: MAP_RULES.stairs,
      themeHue: 200
    };
  }

  function generateMap(round, lastMapId, lastLayout, lastObstacle) {
    const id = chooseMapId(round, lastMapId);
    const choices = MAP_LAYOUTS.filter((name) => name !== lastLayout);
    const layout = choices[Math.floor(Math.random() * choices.length)] || MAP_LAYOUTS[0];
    const rng = seededRandom(hashSeed(`${id}|${round}|${layout}`));
    const jitter = (min, max) => min + (max - min) * rng();
    const customs = (data.customMaps || []).filter((item) => item && item.parts && item.parts.length);
    const pool = MAP_LAYOUTS.length + customs.length;
    const pick = Math.floor(Math.random() * pool);
    if (pick >= MAP_LAYOUTS.length) {
      return mapFromCustom(customs[pick - MAP_LAYOUTS.length], round);
    }
    let obstacle = LAYOUT_OBSTACLE[layout] != null ? LAYOUT_OBSTACLE[layout] : 0;
    const preset = OBSTACLE_PRESETS[obstacle];
    const variant = 1 + MAP_LAYOUTS.indexOf(layout) * 17 + obstacle;
    const route = makeSafeRoute(layout, jitter);
    const platforms = route.concat(wallPlatforms());
    const extras = buildObstacles(route, preset, rng);
    const lava = [{ x: 15, y: 544, w: 970, h: 56 }];
    const blueBlocks = [];
    const mid = route[Math.min(2, Math.max(1, route.length - 2))];
    const hazards = mid
      ? [makeHazardAt(mid.x + 20, mid.y - 58, rng, round, "y")]
      : [];
    const goalPlat = route[route.length - 1];
    const goal = {
      x: Math.max(goalPlat.x + 36, goalPlat.x + goalPlat.w - 250),
      y: goalPlat.y - 52,
      w: Math.min(220, goalPlat.w - 48),
      h: 52
    };
    const theme = MAP_THEMES[layout] || MAP_THEMES[baseLayout(layout)] || MAP_THEMES.stairs;

    return {
      id,
      layout,
      obstacle,
      variant,
      platforms,
      route,
      scenery: buildScenery(layout, rng, jitter),
      blueBlocks,
      lava,
      killPools: extras.killPools,
      goodLava: extras.goodLava,
      jumpPads: extras.jumpPads,
      hazards,
      goal,
      theme,
      rules: MAP_RULES[layout] || MAP_RULES[baseLayout(layout)] || MAP_RULES.stairs,
      themeHue: Math.floor(jitter(0, 360))
    };
  }

  function buildScenery(layout, rng, jitter) {
    const items = [];
    const kind = baseLayout(layout);
    const rect = (x, y, w, h, color) => items.push({ kind: "rect", x, y, w, h, color });
    const circle = (x, y, r, color) => items.push({ kind: "circle", x, y, r, color });
    if (kind === "islands") {
      for (let i = 0; i < 8; i += 1) circle(70 + i * 120 + jitter(0, 30), 36 + jitter(0, 50), 22 + rng() * 20, "rgba(255,255,255,.28)");
      circle(860, 70, 40, "rgba(255,244,180,.35)");
    } else if (kind === "canyon") {
      for (let i = 0; i < 5; i += 1) {
        rect(15, 40 + i * 100, 70 + rng() * 40, 90, `rgba(120,30,10,${0.35 + rng() * 0.2})`);
        rect(880 + rng() * 20, 60 + i * 95, 80 + rng() * 40, 90, `rgba(150,40,12,${0.3 + rng() * 0.2})`);
      }
    } else if (kind === "zigzag") {
      for (let i = 0; i < 12; i += 1) rect(40 + i * 80, 20 + (i % 2) * 40, 8, 80, "rgba(240,171,252,.22)");
    } else if (kind === "towers") {
      [80, 360, 720].forEach((x) => {
        rect(x, 40, 54, 520, "rgba(51,65,85,.45)");
        rect(x - 10, 40, 74, 28, "rgba(203,213,225,.4)");
      });
    } else if (kind === "gauntlet") {
      for (let i = 0; i < 9; i += 1) rect(40 + i * 110, 20, 70, 14, i % 2 ? "rgba(250,204,21,.35)" : "rgba(0,0,0,.35)");
      rect(20, 160, 960, 8, "rgba(239,68,68,.25)");
    } else if (kind === "split") {
      rect(0, 0, 500, HEIGHT, "rgba(29,78,216,.18)");
      rect(500, 0, 500, HEIGHT, "rgba(154,52,18,.22)");
    } else if (kind === "drops") {
      for (let i = 0; i < 16; i += 1) rect(30 + i * 60, 0, 4, 180 + rng() * 200, "rgba(74,222,128,.2)");
    } else if (kind === "bridge") {
      circle(820, 70, 55, "rgba(253,224,71,.28)");
      for (let i = 0; i < 4; i += 1) rect(180 + i * 180, 200 + i * 60, 16, 220, "rgba(146,64,14,.28)");
    } else if (kind === "wells") {
      [180, 500, 780].forEach((x) => {
        circle(x, 120, 46, "rgba(45,212,191,.16)");
        circle(x, 120, 28, "rgba(15,94,89,.3)");
      });
    } else if (kind === "ice") {
      for (let i = 0; i < 10; i += 1) {
        items.push({ kind: "tri", x: 60 + i * 90, y: 20 + jitter(0, 30), s: 24 + rng() * 20, color: "rgba(224,242,254,.35)" });
      }
    } else if (kind === "factory") {
      for (let i = 0; i < 5; i += 1) circle(120 + i * 180, 70, 28, "rgba(250,204,21,.18)");
      rect(0, 180, WIDTH, 6, "rgba(250,204,21,.2)");
    } else if (kind === "night") {
      for (let i = 0; i < 40; i += 1) circle(20 + rng() * 960, 10 + rng() * 280, 1 + rng() * 2, "rgba(253,230,138,.7)");
      circle(860, 70, 36, "rgba(253,224,71,.28)");
    } else if (kind === "volcano") {
      rect(620, 80, 280, 480, "rgba(127,29,29,.35)");
      for (let i = 0; i < 8; i += 1) circle(700 + rng() * 180, 40 + rng() * 80, 8 + rng() * 12, "rgba(249,115,22,.35)");
    } else if (kind === "swamp") {
      for (let i = 0; i < 10; i += 1) circle(40 + i * 95, 40 + jitter(0, 40), 18 + rng() * 16, "rgba(163,230,53,.18)");
    } else if (kind === "space") {
      for (let i = 0; i < 50; i += 1) circle(rng() * 1000, rng() * 500, rng() * 2.2, "rgba(224,242,254,.7)");
      circle(140, 70, 22, "rgba(244,114,182,.25)");
      circle(820, 110, 30, "rgba(125,211,252,.2)");
    } else {
      for (let i = 0; i < 6; i += 1) rect(80 + i * 150, 30 + rng() * 20, 40, 16, "rgba(233,196,106,.2)");
    }
    if (layout === "ruins") {
      for (let i = 0; i < 5; i += 1) rect(90 + i * 170, 40, 18, 90 + rng() * 40, "rgba(168,162,158,.28)");
    } else if (layout === "clouds") {
      for (let i = 0; i < 6; i += 1) circle(80 + i * 150, 50 + jitter(0, 20), 34, "rgba(255,255,255,.45)");
    } else if (layout === "desert") {
      for (let i = 0; i < 4; i += 1) items.push({ kind: "tri", x: 120 + i * 200, y: 30, s: 50, color: "rgba(251,191,36,.22)" });
    } else if (layout === "cyber") {
      for (let i = 0; i < 10; i += 1) rect(40 + i * 96, 16, 40, 8, "rgba(34,211,238,.28)");
    } else if (layout === "temple") {
      rect(80, 40, 120, 70, "rgba(245,158,11,.22)");
      rect(760, 40, 140, 80, "rgba(245,158,11,.2)");
    } else if (layout === "sewer") {
      for (let i = 0; i < 8; i += 1) circle(70 + i * 115, 40, 16, "rgba(163,230,53,.22)");
    } else if (layout === "aurora") {
      for (let i = 0; i < 7; i += 1) rect(40 + i * 130, 10, 50, 120, "rgba(110,231,183,.12)");
    } else if (layout === "orbit") {
      circle(500, 80, 48, "rgba(196,181,253,.18)");
    }
    return items;
  }

  const MAP_EDITOR_PARTS = [
    { id: "spawn", key: "partSpawn", w: 280, h: 18, color: "#55d6ff" },
    { id: "platform", key: "partPlatform", w: 220, h: 18, color: "#d7b48a" },
    { id: "blue", key: "partBlue", w: 80, h: 22, color: "#3478f6" },
    { id: "lava", key: "partLava", w: 140, h: 28, color: "#ff6b35" },
    { id: "kill", key: "partKill", w: 70, h: 24, color: "#ef4444" },
    { id: "portal", key: "partPortal", w: 48, h: 24, color: "#22d3ee" },
    { id: "pad", key: "partPad", w: 70, h: 15, color: "#a78bfa" },
    { id: "hazard", key: "partHazard", w: 24, h: 24, color: "#fb7185" },
    { id: "safe", key: "partSafe", w: 180, h: 52, color: "#4ade80" }
  ];
  const MINI_EDITOR_PARTS = [
    { id: "spawn", key: "partStart", w: 160, h: 18, color: "#55d6ff" },
    { id: "platform", key: "partPlatform", w: 220, h: 18, color: "#d7b48a" },
    { id: "wall", key: "partWall", w: 18, h: 160, color: "#94a3b8" },
    { id: "finish", key: "partFinish", w: 36, h: 220, color: "#facc15" },
    { id: "hoop", key: "partHoop", w: 50, h: 50, color: "#fde68a" },
    { id: "flag", key: "partFlag", w: 28, h: 40, color: "#fb7185" },
    { id: "zone", key: "partZone", w: 120, h: 80, color: "#60a5fa" },
    { id: "bumper", key: "partBumper", w: 36, h: 36, color: "#c084fc" },
    { id: "conveyor", key: "partConveyor", w: 200, h: 18, color: "#22d3ee" },
    { id: "portal", key: "partMiniPortal", w: 48, h: 48, color: "#67e8f9" },
    { id: "hazard", key: "partHazard", w: 28, h: 28, color: "#ff6b35" },
    { id: "blackhole", key: "partBlackhole", w: 56, h: 56, color: "#c084fc" },
    { id: "goodlava", key: "partGoodLava", w: 70, h: 36, color: "#22d3ee" }
  ];
  const MINI_INVISIBLE_PARTS = [
    { id: "food", key: "partFood", w: 70, h: 70, color: "#f97316", invisible: true },
    { id: "points", key: "partPoints", w: 70, h: 70, color: "#facc15", invisible: true },
    { id: "speed", key: "partSpeed", w: 70, h: 70, color: "#38bdf8", invisible: true },
    { id: "jump", key: "partJump", w: 70, h: 70, color: "#a78bfa", invisible: true },
    { id: "sacrifice", key: "partSacrifice", w: 70, h: 70, color: "#fb7185", invisible: true },
    { id: "teleport", key: "partTeleport", w: 70, h: 70, color: "#22d3ee", invisible: true },
    { id: "gravity", key: "partGravity", w: 70, h: 70, color: "#818cf8", invisible: true }
  ];
  const SCRIPT_TYPES = MINI_INVISIBLE_PARTS.map((item) => item.id);

  function isScriptType(type) {
    return type === "food" || type === "points" || type === "speed" || type === "jump" || type === "sacrifice" || type === "teleport" || type === "gravity";
  }

  function isStartPart(type) {
    return type === "spawn";
  }

  function partHasScript(type) {
    return isScriptType(type) || isStartPart(type);
  }

  function ownedFoodCount() {
    try {
      return Math.max(1, ((data && data.foods) || []).filter((food) => isBanqueteFood(food) && !food.ai).length || 1);
    } catch (_error) {
      return 1;
    }
  }

  function defaultScriptCfg(type) {
    if (type === "food") return { bounce: true, foodCount: 1, likesOnly: true };
    if (type === "points") return { r: 255, g: 230, b: 102, speed: 1.2, bounceFloor: false };
    if (type === "speed") return { amount: 2.0 };
    if (type === "jump") return { height: "alto" };
    if (type === "sacrifice") return { who: "one" };
    if (type === "teleport") return { mode: "random", tx: 500, ty: 280 };
    if (type === "gravity") return { amount: 30, time: 8 };
    if (type === "spawn") return { who: "all", marbleId: "" };
    return {};
  }

  function clampNum(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function normalizeScriptCfg(type, raw) {
    const base = defaultScriptCfg(type);
    const src = raw && typeof raw === "object" ? raw : {};
    if (type === "food") {
      return {
        bounce: src.bounce !== false,
        foodCount: Math.max(1, Math.min(ownedFoodCount(), Math.round(Number(src.foodCount) || 1))),
        likesOnly: src.likesOnly !== false
      };
    }
    if (type === "points") {
      return {
        r: Math.round(clampNum(src.r, 0, 255, base.r)),
        g: Math.round(clampNum(src.g, 0, 255, base.g)),
        b: Math.round(clampNum(src.b, 0, 255, base.b)),
        speed: Math.round(clampNum(src.speed, 1, 2, base.speed) * 1000) / 1000,
        bounceFloor: !!src.bounceFloor
      };
    }
    if (type === "speed") {
      return { amount: Math.round(clampNum(src.amount, 1, 4, base.amount) * 10) / 10 };
    }
    if (type === "jump") {
      return { height: ["noTanAlto", "alto", "superAlto"].includes(src.height) ? src.height : "alto" };
    }
    if (type === "sacrifice") {
      return { who: "one" };
    }
    if (type === "teleport") {
      return {
        mode: src.mode === "point" ? "point" : "random",
        tx: clampNum(src.tx, 20, WIDTH - 20, 500),
        ty: clampNum(src.ty, 20, HEIGHT - 20, 280)
      };
    }
    if (type === "gravity") {
      return {
        amount: clampNum(src.amount, 0, 1000, 30),
        time: Math.max(0, Number(src.time) || 0)
      };
    }
    if (type === "spawn") {
      return {
        who: src.who === "one" ? "one" : "all",
        marbleId: String(src.marbleId || "")
      };
    }
    return base;
  }

  function editorPartDef(type) {
    const miniFirst = !!(levelEditor && levelEditor.mode === "mini");
    const lists = miniFirst
      ? MINI_EDITOR_PARTS.concat(MINI_INVISIBLE_PARTS, MAP_EDITOR_PARTS)
      : MAP_EDITOR_PARTS.concat(MINI_EDITOR_PARTS, MINI_INVISIBLE_PARTS);
    return lists.find((item) => item.id === type) || MAP_EDITOR_PARTS[1];
  }

  function defaultEditorParts(mode) {
    if (mode === "mini") {
      return [
        { type: "spawn", x: 60, y: 490, w: 160, h: 18, rot: 0, holes: [], script: defaultScriptCfg("spawn") },
        { type: "platform", x: 40, y: 508, w: 920, h: 18, rot: 0, holes: [] },
        { type: "points", x: 430, y: 300, w: 70, h: 70, invisible: true, rot: 0, holes: [] }
      ];
    }
    return [
      { type: "spawn", x: 40, y: 90, w: 280, h: 18, rot: 0, holes: [] },
      { type: "platform", x: 280, y: 220, w: 260, h: 18, rot: 0, holes: [] },
      { type: "platform", x: 520, y: 350, w: 260, h: 18, rot: 0, holes: [] },
      { type: "safe", x: 740, y: 400, w: 200, h: 52, rot: 0, holes: [] },
      { type: "lava", x: 15, y: 544, w: 970, h: 56, rot: 0, holes: [] }
    ];
  }

  function openLevelEditor(mode) {
    levelEditor = {
      mode,
      step: "place",
      parts: defaultEditorParts(mode),
      tool: "platform",
      selected: -1,
      name: "",
      difficulty: 10,
      drag: null,
      hover: null,
      erasing: false,
      pickingTeleport: false
    };
    closeScriptEditor();
    mapTest = false;
    if (ui.levelNameInput) ui.levelNameInput.value = "";
    if (ui.levelDiffInput) ui.levelDiffInput.value = "10";
    setLevelEditorStep("place");
    if (screens.levelEditor) screens.levelEditor.classList.toggle("mini-editor", mode === "mini");
    showScreen("levelEditor");
    renderLevelEditor();
  }

  function closeLevelEditor() {
    levelEditor = null;
    mapTest = false;
    renderMenu();
    showScreen("menu");
  }

  function setLevelEditorStep(step) {
    if (!levelEditor) return;
    levelEditor.step = step;
    if (ui.levelEditorPlace) ui.levelEditorPlace.hidden = step !== "place";
    if (ui.levelEditorName) ui.levelEditorName.hidden = step !== "name";
    if (ui.levelEditorDiff) ui.levelEditorDiff.hidden = step !== "diff";
    if (ui.levelEditorNext) ui.levelEditorNext.hidden = step === "diff";
    if (ui.levelEditorTitle) ui.levelEditorTitle.textContent = t(levelEditor.mode === "mini" ? "createMinigame" : "createMap");
    if (ui.levelEditorHint) {
      ui.levelEditorHint.textContent = step === "name" ? t("levelNameHint") : step === "diff" ? t("levelTestHint") : t("levelPlaceHint");
    }
    updateLevelDiffLabel();
  }

  function updateLevelDiffLabel() {
    if (!ui.levelDiffLabel || !levelEditor) return;
    const n = levelEditor.difficulty;
    const label = n <= 6 ? t("levelDiffEasy") : n >= 16 ? t("levelDiffHard") : t("levelDiffMid");
    ui.levelDiffLabel.textContent = t("levelDiffLabel", { n, label });
  }

  function renderLevelEditor() {
    if (!levelEditor) return;
    const visible = levelEditor.mode === "map" ? MAP_EDITOR_PARTS : MINI_EDITOR_PARTS;
    const fill = (target, list) => {
      if (!target) return;
      target.innerHTML = "";
      list.forEach((part) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `level-part${levelEditor.tool === part.id ? " active" : ""}`;
        button.textContent = t(part.key);
        button.addEventListener("click", () => {
          levelEditor.tool = part.id;
          renderLevelEditor();
        });
        target.appendChild(button);
      });
    };
    fill(ui.levelPartList, visible);
    if (ui.levelInvisibleWrap) ui.levelInvisibleWrap.hidden = levelEditor.mode !== "mini";
    fill(ui.levelInvisibleList, [{ id: "spawn", key: "partStart", w: 160, h: 18, color: "#55d6ff" }].concat(MINI_INVISIBLE_PARTS));
    syncEraserButton();
    syncScriptChrome();
    drawLevelEditor();
  }

  function drawLevelEditor() {
    const canvas = ui.levelEditorCanvas;
    if (!canvas || !levelEditor) return;
    const g = canvas.getContext("2d");
    g.fillStyle = "#071018";
    g.fillRect(0, 0, WIDTH, HEIGHT);
    levelEditor.parts.forEach((part, index) => {
      const def = editorPartDef(part.type);
      g.globalAlpha = part.invisible ? 0.35 : 0.92;
      if (!drawMiniSpecialPart(g, part)) {
        if (partIsShaped(part)) {
          drawShapedPart(g, part, def.color);
        } else {
          g.fillStyle = def.color;
          g.fillRect(part.x, part.y, part.w, part.h);
        }
      }
      if (part.invisible) {
        g.setLineDash([6, 5]);
        g.strokeStyle = def.color;
        g.lineWidth = 2;
        g.strokeRect(part.x, part.y, part.w, part.h);
        g.setLineDash([]);
      }
      if (index === levelEditor.selected) {
        g.save();
        const c = partCenter(part);
        g.translate(c.x, c.y);
        g.rotate(((part.rot || 0) * Math.PI) / 180);
        g.strokeStyle = "#eaf7ff";
        g.lineWidth = 2;
        g.strokeRect(-part.w / 2 - 2, -part.h / 2 - 2, part.w + 4, part.h + 4);
        g.restore();
      }
      g.globalAlpha = 1;
      g.fillStyle = "#041018";
      g.font = "700 11px Segoe UI";
      g.textAlign = "center";
      const label = partCenter(part);
      g.fillText(t(def.key), label.x, label.y + 4);
    });
    if (levelEditor.tool === "eraser" && levelEditor.hover) {
      g.beginPath();
      g.strokeStyle = "rgba(255,120,90,0.95)";
      g.fillStyle = "rgba(255,90,70,0.22)";
      g.arc(levelEditor.hover.x, levelEditor.hover.y, ERASER_R, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    const tele = levelEditor.parts.find((part) => part.type === "teleport" && part.script && part.script.mode === "point");
    if (tele) {
      g.beginPath();
      g.strokeStyle = "#67e8f9";
      g.fillStyle = "rgba(103,232,249,0.28)";
      g.arc(tele.script.tx, tele.script.ty, 10, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    if (ui.levelEditorCanvas) {
      ui.levelEditorCanvas.style.cursor = levelEditor.pickingTeleport
        ? "crosshair"
        : levelEditor.tool === "eraser"
          ? "cell"
          : "crosshair";
    }
  }

  function drawMiniSpecialPart(target, part) {
    const c = partCenter(part);
    if (part.type === "spawn") {
      target.fillStyle = "#55d6ff";
      target.fillRect(part.x, part.y, part.w, part.h);
      target.fillStyle = "rgba(234,247,255,0.35)";
      target.fillRect(part.x, part.y, part.w, Math.max(3, part.h / 3));
      return true;
    }
    if (part.type === "blackhole") {
      const r = Math.max(12, Math.min(part.w, part.h) / 2);
      target.fillStyle = "#120616";
      target.beginPath();
      target.arc(c.x, c.y, r, 0, Math.PI * 2);
      target.fill();
      target.fillStyle = "rgba(192,132,252,0.5)";
      target.beginPath();
      target.arc(c.x, c.y, r * 0.55, 0, Math.PI * 2);
      target.fill();
      return true;
    }
    if (part.type === "goodlava") {
      target.save();
      target.strokeStyle = "#7dd3fc";
      target.fillStyle = "rgba(56,189,248,0.32)";
      target.lineWidth = 3;
      target.beginPath();
      target.ellipse(c.x, c.y, part.w / 2, part.h / 2, 0, 0, Math.PI * 2);
      target.fill();
      target.stroke();
      target.restore();
      return true;
    }
    return false;
  }

  function editorCanvasPoint(event) {
    const canvas = ui.levelEditorCanvas;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * WIDTH,
      y: ((event.clientY - box.top) / box.height) * HEIGHT
    };
  }

  function hitEditorPart(point) {
    for (let i = levelEditor.parts.length - 1; i >= 0; i -= 1) {
      if (pointInPartBounds(levelEditor.parts[i], point.x, point.y)) return i;
    }
    return -1;
  }

  function selectedEditorPart() {
    if (!levelEditor || levelEditor.selected < 0) return null;
    return levelEditor.parts[levelEditor.selected] || null;
  }

  function needSelectedPart() {
    const part = selectedEditorPart();
    if (part) return part;
    if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("levelNeedSelect");
    return null;
  }

  function partIsShaped(part) {
    return !!(part && (((part.rot || 0) % 360) || (part.holes && part.holes.length)));
  }

  function eraserTouchesPart(part, point) {
    const local = worldToLocal(part, point.x, point.y);
    const cx = Math.max(-part.w / 2, Math.min(part.w / 2, local.x));
    const cy = Math.max(-part.h / 2, Math.min(part.h / 2, local.y));
    const dx = local.x - cx;
    const dy = local.y - cy;
    return dx * dx + dy * dy <= ERASER_R * ERASER_R;
  }

  function eraseSelectedAt(point) {
    const part = selectedEditorPart();
    if (!part || !eraserTouchesPart(part, point)) return false;
    if (!part.holes) part.holes = [];
    const local = worldToLocal(part, point.x, point.y);
    const last = part.holes[part.holes.length - 1];
    if (last && (local.x - last.x) * (local.x - last.x) + (local.y - last.y) * (local.y - last.y) < 36) return true;
    part.holes.push({ x: local.x, y: local.y, r: ERASER_R });
    return true;
  }

  function scaleSelectedPart(axis, factor) {
    const part = needSelectedPart();
    if (!part) return;
    const center = partCenter(part);
    if (axis === "x") {
      part.w = Math.max(16, Math.min(WIDTH, Math.round(part.w * factor)));
      (part.holes || []).forEach((hole) => {
        hole.x *= factor;
      });
    } else {
      part.h = Math.max(12, Math.min(HEIGHT, Math.round(part.h * factor)));
      (part.holes || []).forEach((hole) => {
        hole.y *= factor;
      });
    }
    part.x = center.x - part.w / 2;
    part.y = center.y - part.h / 2;
    drawLevelEditor();
  }

  function rotateSelectedPart() {
    const part = needSelectedPart();
    if (!part) return;
    part.rot = ((part.rot || 0) + 15) % 360;
    drawLevelEditor();
  }

  function setEraserTool() {
    if (!levelEditor) return;
    if (!selectedEditorPart()) {
      if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("levelNeedSelect");
    }
    levelEditor.tool = "eraser";
    renderLevelEditor();
  }

  function syncEraserButton() {
    if (ui.levelEraser) ui.levelEraser.classList.toggle("active", !!(levelEditor && levelEditor.tool === "eraser"));
  }

  function placeEditorPart(point) {
    if (!levelEditor || levelEditor.tool === "eraser") return;
    const def = editorPartDef(levelEditor.tool);
    const part = {
      type: def.id,
      x: Math.max(0, Math.min(WIDTH - def.w, point.x - def.w / 2)),
      y: Math.max(0, Math.min(HEIGHT - def.h, point.y - def.h / 2)),
      w: def.w,
      h: def.h,
      rot: 0,
      holes: [],
      invisible: !!def.invisible,
      script: partHasScript(def.id) ? defaultScriptCfg(def.id) : undefined
    };
    if (part.type === "safe" || isScriptType(part.type) || (part.type === "spawn" && levelEditor.mode !== "mini")) {
      levelEditor.parts = levelEditor.parts.filter((item) => item.type !== part.type);
    }
    levelEditor.parts.push(part);
    levelEditor.selected = levelEditor.parts.length - 1;
  }

  function handleEditorPointerDown(event) {
    if (!levelEditor || levelEditor.step !== "place") return;
    const point = editorCanvasPoint(event);
    levelEditor.hover = point;
    if (levelEditor.pickingTeleport) {
      const part = selectedEditorPart();
      if (part && part.type === "teleport") {
        part.script = normalizeScriptCfg("teleport", { ...(part.script || {}), mode: "point", tx: point.x, ty: point.y });
        levelEditor.pickingTeleport = false;
        if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("scriptTeleportPicked");
        renderScriptEditFields();
        drawLevelEditor();
      }
      return;
    }
    const hit = hitEditorPart(point);
    if (levelEditor.tool === "eraser") {
      if (hit >= 0) levelEditor.selected = hit;
      levelEditor.erasing = true;
      eraseSelectedAt(point);
    } else if (hit >= 0) {
      levelEditor.selected = hit;
      const part = levelEditor.parts[hit];
      levelEditor.drag = { dx: point.x - part.x, dy: point.y - part.y };
    } else {
      placeEditorPart(point);
      const part = selectedEditorPart();
      if (part) levelEditor.drag = { dx: point.x - part.x, dy: point.y - part.y };
    }
    try {
      if (ui.levelEditorCanvas.setPointerCapture) ui.levelEditorCanvas.setPointerCapture(event.pointerId);
    } catch (_error) {
      /* Some browsers reject capture on synthetic events. */
    }
    syncScriptChrome();
    drawLevelEditor();
  }

  function handleEditorPointerMove(event) {
    if (!levelEditor) return;
    const point = editorCanvasPoint(event);
    levelEditor.hover = point;
    if (levelEditor.tool === "eraser" && levelEditor.erasing) {
      eraseSelectedAt(point);
      drawLevelEditor();
      return;
    }
    if (!levelEditor.drag || levelEditor.selected < 0) {
      if (levelEditor.tool === "eraser") drawLevelEditor();
      return;
    }
    const part = levelEditor.parts[levelEditor.selected];
    part.x = Math.max(-part.w / 2, Math.min(WIDTH - part.w / 2, point.x - levelEditor.drag.dx));
    part.y = Math.max(-part.h / 2, Math.min(HEIGHT - part.h / 2, point.y - levelEditor.drag.dy));
    drawLevelEditor();
  }

  function handleEditorPointerUp() {
    if (!levelEditor) return;
    levelEditor.drag = null;
    levelEditor.erasing = false;
  }

  function deleteSelectedPart() {
    if (!levelEditor || levelEditor.selected < 0) return;
    levelEditor.parts.splice(levelEditor.selected, 1);
    levelEditor.selected = -1;
    if (ui.scriptEditPanel) ui.scriptEditPanel.hidden = true;
    syncScriptChrome();
    drawLevelEditor();
  }

  function editorMarbleChoices() {
    const save = getSave();
    return ((save && save.marbles) || []).filter((marble) => marble && marble.id);
  }

  function syncScriptChrome() {
    const part = selectedEditorPart();
    const isScript = !!(part && partHasScript(part.type));
    if (ui.levelEditScript) ui.levelEditScript.hidden = !isScript;
    if (ui.scriptEditPanel && !isScript) ui.scriptEditPanel.hidden = true;
  }

  function openScriptEditor() {
    const part = selectedEditorPart();
    if (!part || !partHasScript(part.type)) return;
    part.script = normalizeScriptCfg(part.type, part.script);
    if (ui.scriptEditTitle) ui.scriptEditTitle.textContent = t(editorPartDef(part.type).key);
    if (ui.scriptEditPanel) ui.scriptEditPanel.hidden = false;
    renderScriptEditFields();
  }

  function closeScriptEditor() {
    if (levelEditor) levelEditor.pickingTeleport = false;
    if (ui.scriptEditPanel) ui.scriptEditPanel.hidden = true;
  }

  function scriptField(html) {
    const wrap = document.createElement("label");
    wrap.className = "script-field";
    wrap.innerHTML = html;
    return wrap;
  }

  function bindScriptInput(root, selector, onChange) {
    const el = root.querySelector(selector);
    if (!el) return;
    el.addEventListener("input", onChange);
    el.addEventListener("change", onChange);
  }

  function renderScriptEditFields() {
    const part = selectedEditorPart();
    if (!part || !ui.scriptEditFields) return;
    part.script = normalizeScriptCfg(part.type, part.script);
    const cfg = part.script;
    const box = ui.scriptEditFields;
    box.innerHTML = "";
    if (part.type === "food") {
      const maxFoods = ownedFoodCount();
      box.appendChild(scriptField(`<span>${t("scriptFoodBounce")}</span><input id="sfBounce" type="checkbox"${cfg.bounce ? " checked" : ""} />`));
      box.appendChild(scriptField(`<span>${t("scriptFoodCount")}</span><input id="sfCount" type="number" min="1" max="${maxFoods}" step="1" value="${cfg.foodCount}" />`));
      box.appendChild(scriptField(`<span>${t("scriptFoodLikesOnly")}</span><input id="sfLikes" type="checkbox"${cfg.likesOnly ? " checked" : ""} />`));
      bindScriptInput(box, "#sfBounce", () => {
        cfg.bounce = box.querySelector("#sfBounce").checked;
      });
      bindScriptInput(box, "#sfCount", () => {
        cfg.foodCount = Math.max(1, Math.min(maxFoods, Math.round(Number(box.querySelector("#sfCount").value) || 1)));
        box.querySelector("#sfCount").value = String(cfg.foodCount);
      });
      bindScriptInput(box, "#sfLikes", () => {
        cfg.likesOnly = box.querySelector("#sfLikes").checked;
      });
    } else if (part.type === "points") {
      box.appendChild(scriptField(`<span>R</span><input id="sfR" type="number" min="0" max="255" step="1" value="${cfg.r}" />`));
      box.appendChild(scriptField(`<span>G</span><input id="sfG" type="number" min="0" max="255" step="1" value="${cfg.g}" />`));
      box.appendChild(scriptField(`<span>B</span><input id="sfB" type="number" min="0" max="255" step="1" value="${cfg.b}" />`));
      box.appendChild(scriptField(`<span>${t("scriptPointSpeed")}</span><input id="sfPSpeed" type="number" min="1" max="2" step="0.001" value="${cfg.speed.toFixed(3)}" />`));
      box.appendChild(scriptField(`<span>${t("scriptPointBounce")}</span><input id="sfPBounce" type="checkbox"${cfg.bounceFloor ? " checked" : ""} />`));
      const paint = () => {
        cfg.r = Math.round(clampNum(box.querySelector("#sfR").value, 0, 255, cfg.r));
        cfg.g = Math.round(clampNum(box.querySelector("#sfG").value, 0, 255, cfg.g));
        cfg.b = Math.round(clampNum(box.querySelector("#sfB").value, 0, 255, cfg.b));
        cfg.speed = Math.round(clampNum(box.querySelector("#sfPSpeed").value, 1, 2, cfg.speed) * 1000) / 1000;
        cfg.bounceFloor = box.querySelector("#sfPBounce").checked;
      };
      ["#sfR", "#sfG", "#sfB", "#sfPSpeed", "#sfPBounce"].forEach((sel) => bindScriptInput(box, sel, paint));
    } else if (part.type === "speed") {
      box.appendChild(scriptField(`<span>${t("scriptSpeedAmount")}</span><input id="sfAmount" type="number" min="1" max="4" step="0.1" value="${cfg.amount.toFixed(1)}" />`));
      bindScriptInput(box, "#sfAmount", () => {
        cfg.amount = Math.round(clampNum(box.querySelector("#sfAmount").value, 1, 4, cfg.amount) * 10) / 10;
        box.querySelector("#sfAmount").value = cfg.amount.toFixed(1);
      });
    } else if (part.type === "jump") {
      const sel = document.createElement("label");
      sel.className = "script-field";
      sel.innerHTML = `<span>${t("scriptJumpHeight")}</span><select id="sfJump">
        <option value="noTanAlto">${t("scriptJumpLow")}</option>
        <option value="alto">${t("scriptJumpMid")}</option>
        <option value="superAlto">${t("scriptJumpHigh")}</option>
      </select>`;
      box.appendChild(sel);
      const jump = box.querySelector("#sfJump");
      jump.value = cfg.height;
      jump.addEventListener("change", () => {
        cfg.height = jump.value;
      });
    } else if (part.type === "sacrifice") {
      const sel = document.createElement("label");
      sel.className = "script-field";
      sel.innerHTML = `<span>${t("scriptSacrificeWho")}</span><select id="sfSac">
        <option value="one">${t("scriptSacrificeOne")}</option>
      </select>`;
      box.appendChild(sel);
      const sac = box.querySelector("#sfSac");
      sac.value = "one";
      cfg.who = "one";
    } else if (part.type === "teleport") {
      const sel = document.createElement("label");
      sel.className = "script-field";
      sel.innerHTML = `<span>${t("scriptTeleportWhere")}</span><select id="sfTele">
        <option value="random">${t("scriptTeleportRandom")}</option>
        <option value="point">${t("scriptTeleportPoint")}</option>
      </select>`;
      box.appendChild(sel);
      const tele = box.querySelector("#sfTele");
      tele.value = cfg.mode;
      tele.addEventListener("change", () => {
        cfg.mode = tele.value === "point" ? "point" : "random";
        if (cfg.mode === "point") {
          levelEditor.pickingTeleport = true;
          if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("scriptTeleportPick");
        } else {
          levelEditor.pickingTeleport = false;
        }
        drawLevelEditor();
      });
      if (cfg.mode === "point") {
        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "button ghost compact";
        pick.textContent = t("scriptTeleportPickBtn");
        pick.addEventListener("click", () => {
          levelEditor.pickingTeleport = true;
          if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("scriptTeleportPick");
        });
        box.appendChild(pick);
      }
    } else if (part.type === "gravity") {
      box.appendChild(scriptField(`<span>${t("scriptGravityAmount")}</span><input id="sfGrav" type="number" min="0" max="1000" step="1" value="${cfg.amount}" />`));
      box.appendChild(scriptField(`<span>${t("scriptGravityTime")}</span><input id="sfTime" type="number" min="0" step="1" value="${cfg.time}" />`));
      bindScriptInput(box, "#sfGrav", () => {
        cfg.amount = clampNum(box.querySelector("#sfGrav").value, 0, 1000, cfg.amount);
      });
      bindScriptInput(box, "#sfTime", () => {
        cfg.time = Math.max(0, Number(box.querySelector("#sfTime").value) || 0);
      });
    } else if (part.type === "spawn") {
      const who = document.createElement("label");
      who.className = "script-field";
      who.innerHTML = `<span>${t("scriptStartWho")}</span><select id="sfStartWho">
        <option value="all">${t("scriptStartAll")}</option>
        <option value="one">${t("scriptStartOne")}</option>
      </select>`;
      box.appendChild(who);
      const whoSel = box.querySelector("#sfStartWho");
      whoSel.value = cfg.who === "one" ? "one" : "all";
      whoSel.addEventListener("change", () => {
        cfg.who = whoSel.value === "one" ? "one" : "all";
        renderScriptEditFields();
      });
      if (cfg.who === "one") {
        const choices = editorMarbleChoices();
        if (!choices.length) {
          const empty = document.createElement("p");
          empty.className = "empty";
          empty.textContent = t("scriptStartNeedMarble");
          box.appendChild(empty);
        } else {
          const pick = document.createElement("label");
          pick.className = "script-field";
          pick.innerHTML = `<span>${t("scriptStartPick")}</span><select id="sfStartMarble">${
            choices.map((marble) => `<option value="${marble.id}">${String(marble.name || "").replace(/</g, "")}</option>`).join("")
          }</select>`;
          box.appendChild(pick);
          const marbleSel = box.querySelector("#sfStartMarble");
          if (!choices.some((marble) => marble.id === cfg.marbleId)) cfg.marbleId = choices[0].id;
          marbleSel.value = cfg.marbleId;
          marbleSel.addEventListener("change", () => {
            cfg.marbleId = marbleSel.value;
          });
        }
      }
    }
  }

  function advanceLevelEditor() {
    if (!levelEditor) return;
    if (levelEditor.step === "place") {
      if (levelEditor.mode === "map") {
        const hasSpawn = levelEditor.parts.some((part) => part.type === "spawn");
        const hasSafe = levelEditor.parts.some((part) => part.type === "safe");
        if (!hasSpawn || !hasSafe) {
          if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("levelNeedSafe");
          return;
        }
      }
      setLevelEditorStep("name");
      if (ui.levelNameInput) ui.levelNameInput.focus();
      return;
    }
    if (levelEditor.step === "name") {
      const name = String((ui.levelNameInput && ui.levelNameInput.value) || "").trim().slice(0, ITEM_NAME_MAX);
      if (!name) {
        if (ui.levelEditorHint) ui.levelEditorHint.textContent = t("levelNeedName");
        if (ui.levelNameInput) ui.levelNameInput.focus();
        return;
      }
      levelEditor.name = name;
      if (levelEditor.mode === "mini") {
        finishCustomMini();
        return;
      }
      beginMapTest();
    }
  }

  function beginMapTest() {
    const save = getSave();
    const roster = save && Array.isArray(save.marbles) && save.marbles.length
      ? save.marbles.slice()
      : [
          { id: "test-a", name: "A", color: "#55d6ff" },
          { id: "test-b", name: "B", color: "#ff6b35" },
          { id: "test-c", name: "C", color: "#4ade80" }
        ];
    currentMap = mapFromCustom({
      id: "test",
      name: levelEditor.name,
      difficulty: 1,
      parts: levelEditor.parts
    }, 1);
    currentRound = 1;
    mapTest = true;
    roundCommitted = false;
    particles = [];
    const spawn = currentMap.platforms[0];
    const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(roster.length))));
    marbles = roster.map((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const startX = spawn.x + 36 + col * 30;
      const startY = spawn.y - RADIUS - row * 28;
      return {
        recordId: item.id,
        name: item.name,
        color: item.color,
        x: startX,
        y: startY,
        vx: 1.45,
        vy: 0,
        startX,
        startY,
        startVx: 1.45,
        radius: RADIUS,
        state: "active",
        safeTimer: 0,
        hazardCooldown: 0,
        still: 0,
        lastProgressX: spawn.x,
        lastProgressY: spawn.y,
        noProgress: 0,
        padCooldown: 0,
        teleportCooldown: 0,
        spawnProtect: 0
      };
    });
    playing = true;
    minigame = null;
    lastTime = performance.now();
    setGameChrome("campaign");
    ui.levelTitle.textContent = `${levelEditor.name} · ${t("levelTestHint")}`;
    ui.modal.hidden = true;
    showScreen("game");
    updateStatus();
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(loop);
  }

  function finishMapTest() {
    stopGame();
    mapTest = false;
    currentMap = null;
    marbles = [];
    ui.modal.hidden = true;
    if (!levelEditor) {
      renderMenu();
      showScreen("menu");
      return;
    }
    setLevelEditorStep("diff");
    showScreen("levelEditor");
  }

  function finishCustomMap() {
    if (!levelEditor) return;
    if (!Array.isArray(data.customMaps)) data.customMaps = [];
    data.customMaps.push(normalizeCustomMap({
      id: makeId("map"),
      name: levelEditor.name,
      difficulty: levelEditor.difficulty,
      parts: levelEditor.parts
    }));
    persist();
    closeLevelEditor();
  }

  function finishCustomMini() {
    if (!levelEditor) return;
    if (!Array.isArray(data.customMinigames)) data.customMinigames = [];
    data.customMinigames.push(normalizeCustomMini({
      id: makeId("mini"),
      name: levelEditor.name,
      parts: levelEditor.parts
    }));
    persist();
    closeLevelEditor();
  }

  function deleteCustomMap(id) {
    if (!id || !Array.isArray(data.customMaps)) return;
    const before = data.customMaps.length;
    data.customMaps = data.customMaps.filter((item) => item && item.id !== id);
    if (data.customMaps.length === before) return;
    persist();
    renderCustomLists();
    if (ui.status) ui.status.textContent = t("customMapDeleted");
  }

  function deleteCustomMini(id) {
    if (!id || !Array.isArray(data.customMinigames)) return;
    const before = data.customMinigames.length;
    data.customMinigames = data.customMinigames.filter((item) => item && item.id !== id);
    if (data.customMinigames.length === before) return;
    persist();
    renderCustomLists();
    if (ui.minigameModal && !ui.minigameModal.hidden) renderMinigamePicker();
    if (ui.status) ui.status.textContent = t("customMiniDeleted");
  }

  function renderCustomLists() {
    const fill = (target, list, kind) => {
      if (!target) return;
      target.innerHTML = "";
      list.forEach((item) => {
        const row = document.createElement("div");
        row.className = "custom-level-row";
        const name = document.createElement("span");
        name.textContent = kind === "map" ? `${item.name} · ${item.difficulty}/20` : item.name;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "face-delete custom-level-delete";
        remove.textContent = "×";
        remove.title = t(kind === "map" ? "deleteCustomMap" : "deleteCustomMini");
        remove.setAttribute("aria-label", t(kind === "map" ? "deleteCustomMap" : "deleteCustomMini"));
        remove.addEventListener("click", (event) => {
          event.stopPropagation();
          if (kind === "map") deleteCustomMap(item.id);
          else deleteCustomMini(item.id);
        });
        row.appendChild(name);
        row.appendChild(remove);
        target.appendChild(row);
      });
    };
    fill(ui.customMapList, data.customMaps || [], "map");
    fill(ui.customMiniList, data.customMinigames || [], "mini");
  }

  function beginRound() {
    const save = getSave();
    const alive = aliveMarbles(save);
    if (!save || save.playLocked) return;
    if ((!save.started && alive.length < MIN_MARBLES) || (save.started && !alive.length)) return;
    if (!save.started) {
      save.started = true;
      persist();
    }
    currentRound = save.round + 1;
    currentMap = generateMap(currentRound, save.lastMapId, save.lastLayout, save.lastObstacle);
    save.lastLayout = currentMap.layout || "";
    save.lastObstacle = currentMap.obstacle;
    const boost = save.speedBoostPending && !save.speedBoostUsed;
    roundSpeed = boost ? 2 : 1;
    if (boost) {
      save.speedBoostPending = false;
      save.speedBoostUsed = true;
      persist();
    }
    particles = [];
    roundCommitted = false;
    const spawn = currentMap.platforms[0];
    const goal = currentMap.platforms[currentMap.platforms.length - 1] || spawn;
    const skipIds = new Set(alive.filter((item) => item.skipNextRound).map((item) => item.id));
    const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(alive.length))));
    marbles = alive.map((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const skipping = skipIds.has(item.id);
      const startX = skipping ? goal.x + goal.w / 2 : spawn.x + 36 + col * 30;
      const startY = skipping ? goal.y - RADIUS : spawn.y - RADIUS - row * 28;
      const startVx = skipping ? 0 : (1.35 + Math.random() * 0.35 + Math.min(0.25, currentRound * 0.01)) * roundSpeed;
      return {
        recordId: item.id,
        name: item.name,
        color: item.color,
        x: startX,
        y: startY,
        vx: startVx,
        vy: 0,
        startX,
        startY,
        startVx,
        radius: RADIUS,
        state: skipping ? "safe" : "active",
        safeTimer: skipping ? 1 : 0,
        hazardCooldown: 0,
        still: 0,
        lastProgressX: spawn.x,
        lastProgressY: spawn.y,
        noProgress: 0,
        padCooldown: 0,
        teleportCooldown: 0,
        spawnProtect: skipping ? 80 : 0
      };
    });
    if (skipIds.size) {
      save.marbles.forEach((item) => {
        if (item.skipNextRound) item.skipNextRound = false;
      });
      persist();
    }
    playing = true;
    minigame = null;
    lastTime = performance.now();
    setGameChrome("campaign");
    setCampaignTitle();
    ui.modal.hidden = true;
    showScreen("game");
    updateStatus();
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(loop);
    if (!marbles.some((ball) => ball.state === "active")) checkRoundEnd();
  }

  function stopGame() {
    playing = false;
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  function exitRound() {
    if (mapTest) {
      finishMapTest();
      return;
    }
    if (minigame && minigame.playing && !minigame.ended) {
      finishMinigame();
      return;
    }
    stopRecording();
    if (roleplay && roleplay.inside) {
      leaveHouse();
      return;
    }
    if (roleplay) saveRoleplayMarbles();
    stopGame();
    minigame = null;
    roleplay = null;
    marbleChatOpen = false;
    currentMap = null;
    if (ui.roleplayFaces) ui.roleplayFaces.hidden = true;
    if (ui.houseNav) ui.houseNav.hidden = true;
    if (ui.marbleChatPanel) ui.marbleChatPanel.hidden = true;
    if (ui.canvasWrap) ui.canvasWrap.hidden = false;
    ui.modal.hidden = true;
    if (ui.minigameModal) ui.minigameModal.hidden = true;
    rejoinPickerOpen = false;
    setGameChrome("campaign");
    renderMenu();
    showScreen("menu");
  }

  function updateStatus() {
    const active = marbles.filter((marble) => marble.state === "active").length;
    const safe = marbles.filter((marble) => marble.state === "safe").length;
    const base = t("levelStatus", { active, safe, total: marbles.length });
    ui.status.textContent = roundSpeed > 1 ? `${base} · ${t("speedBoostActive")}` : base;
  }

  function overlapsCircleRect(ball, rect) {
    const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return dx * dx + dy * dy < ball.radius * ball.radius;
  }

  function resolveShapedBlock(ball, block) {
    if (!overlapsCirclePart(ball, block)) return;
    const local = worldToLocal(block, ball.x, ball.y);
    const hw = block.w / 2;
    const hh = block.h / 2;
    const cx = Math.max(-hw, Math.min(hw, local.x));
    const cy = Math.max(-hh, Math.min(hh, local.y));
    if (holeCovers(block, cx, cy)) return;
    const dx = local.x - cx;
    const dy = local.y - cy;
    const dist2 = dx * dx + dy * dy;
    let nlx = local.x;
    let nly = local.y;
    let hitY = false;
    if (dist2 > 1e-6) {
      const dist = Math.sqrt(dist2);
      const push = ball.radius - dist + 0.25;
      nlx = local.x + (dx / dist) * push;
      nly = local.y + (dy / dist) * push;
      hitY = Math.abs(dy) >= Math.abs(dx);
    } else {
      const ox = hw - Math.abs(local.x);
      const oy = hh - Math.abs(local.y);
      if (ox < oy) {
        nlx = local.x >= 0 ? hw + ball.radius : -hw - ball.radius;
      } else {
        nly = local.y >= 0 ? hh + ball.radius : -hh - ball.radius;
        hitY = true;
      }
    }
    const world = localToWorld(block, nlx, nly);
    ball.x = world.x;
    ball.y = world.y;
    const a = -((block.rot || 0) * Math.PI) / 180;
    const vx = ball.vx * Math.cos(a) - ball.vy * Math.sin(a);
    const vy = ball.vx * Math.sin(a) + ball.vy * Math.cos(a);
    let nvx = vx;
    let nvy = vy;
    if (hitY) {
      if (nly < 0) {
        nvy = -Math.abs(vy) * (mapRules().bounce || 0.18);
        nvx = Math.max(nvx, (mapRules().minVx || 1.15) * roundSpeed);
        ball.grounded = true;
      } else {
        nvy = Math.abs(vy) * 0.25;
      }
    } else {
      nvx = Math.abs(vx) * 0.4 + 0.35;
    }
    const ar = ((block.rot || 0) * Math.PI) / 180;
    ball.vx = nvx * Math.cos(ar) - nvy * Math.sin(ar);
    ball.vy = nvx * Math.sin(ar) + nvy * Math.cos(ar);
  }

  function resolveBlock(ball, block, previousX, previousY) {
    if (partIsShaped(block)) {
      resolveShapedBlock(ball, block);
      return;
    }
    if (!overlapsCircleRect(ball, block)) return;
    const previousBottom = previousY + ball.radius;
    const previousTop = previousY - ball.radius;
    const previousRight = previousX + ball.radius;
    const previousLeft = previousX - ball.radius;
    const overX = ball.x >= block.x && ball.x <= block.x + block.w;
    if (previousBottom <= block.y + 3 && ball.vy >= 0 && overX) {
      ball.y = block.y - ball.radius;
      ball.vy *= -(mapRules().bounce || 0.18);
      ball.vx = Math.max(ball.vx, (mapRules().minVx || 1.15) * roundSpeed);
      ball.grounded = true;
    } else if (previousTop >= block.y + block.h - 3 && ball.vy < 0) {
      ball.y = block.y + block.h + ball.radius;
      ball.vy *= -0.25;
    } else if (previousRight <= block.x + 3) {
      if (block.active === true) {
        ball.x = block.x - ball.radius;
        ball.vx = 0.2;
      } else if (block.h >= HEIGHT - 4) {
        ball.x = block.x + block.w + ball.radius;
        ball.vx = Math.max(1.2, Math.abs(ball.vx));
      } else {
        ball.x = block.x + ball.radius + 2;
        ball.y = Math.min(ball.y, block.y - ball.radius);
        ball.vx = Math.max(1.1, Math.abs(ball.vx));
        ball.vy = Math.min(ball.vy, 0);
      }
    } else if (previousLeft >= block.x + block.w - 3) {
      if (block.h >= HEIGHT - 4) {
        ball.x = block.x - ball.radius;
        ball.vx = Math.max(0.4, Math.abs(ball.vx) * 0.35);
      }
    } else {
      ball.y = block.y - ball.radius;
      ball.vy = -0.4;
      ball.vx = Math.max(ball.vx, 1.05 * roundSpeed);
      ball.grounded = true;
    }
  }

  function resolveMarbleCollisions() {
    const active = marbles.filter((marble) => marble.state === "active");
    for (let i = 0; i < active.length; i += 1) {
      for (let j = i + 1; j < active.length; j += 1) {
        const a = active[i];
        const b = active[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const minimum = a.radius + b.radius;
        if (distance <= 0 || distance >= minimum) continue;
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minimum - distance;
        a.x -= nx * overlap * 0.35;
        a.y -= ny * overlap * 0.2;
        b.x += nx * overlap * 0.35;
        b.y += ny * overlap * 0.2;
        const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relative < 0) {
          const impulse = relative * 0.28;
          a.vx += impulse * nx;
          a.vy += impulse * ny * 0.4;
          b.vx -= impulse * nx;
          b.vy -= impulse * ny * 0.4;
        }
        if (a.vx < 0.7) a.vx = 0.7;
        if (b.vx < 0.7) b.vx = 0.7;
      }
    }
  }

  function hazardPosition(hazard, time) {
    const movement = Math.sin(time * hazard.speed * roundSpeed + hazard.phase) * hazard.amplitude;
    return {
      x: hazard.axis === "x" ? hazard.baseX + movement : hazard.x,
      y: hazard.axis === "y" ? hazard.baseY - Math.abs(movement) : hazard.baseY
    };
  }

  function touchesHazard(ball, hazard, time) {
    const position = hazardPosition(hazard, time);
    return Math.hypot(ball.x - position.x, ball.y - position.y) < ball.radius + hazard.radius - 2;
  }

  function addParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i += 1) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color
      });
    }
  }

  function teleportHome(ball) {
    const spawn = currentMap.route[0] || currentMap.platforms[0];
    ball.x = Number.isFinite(ball.startX) ? ball.startX : spawn.x + 36;
    ball.y = Number.isFinite(ball.startY) ? ball.startY : spawn.y - ball.radius;
    ball.vx = Number.isFinite(ball.startVx) ? ball.startVx : 1.5 * roundSpeed;
    ball.vy = 0;
    ball.grounded = true;
    ball.teleportCooldown = 80;
    ball.spawnProtect = 50;
    ball.still = 0;
    ball.noProgress = 0;
    ball.lastProgressX = ball.x;
    ball.lastProgressY = ball.y;
    addParticles(ball.x, ball.y, "#38bdf8", 16);
  }

  function loseMarble(ball) {
    if (ball.state !== "active") return;
    ball.state = "lost";
    addParticles(ball.x, ball.y, "#ff315c", 20);
    updateStatus();
    checkRoundEnd();
  }

  function rescueMarble(ball) {
    if (ball.state !== "active") return;
    ball.state = "safe";
    ball.safeTimer = 1;
    addParticles(ball.x, ball.y, "#4ade80", 22);
    updateStatus();
    checkRoundEnd();
  }

  function checkRoundEnd() {
    if (marbles.some((marble) => marble.state === "active") || roundCommitted) return;
    roundCommitted = true;
    playing = false;
    if (mapTest) {
      finishMapTest();
      return;
    }
    const save = getSave();
    const safeIds = new Set(marbles.filter((marble) => marble.state === "safe").map((marble) => marble.recordId));
    const lostIds = new Set(marbles.filter((marble) => marble.state === "lost").map((marble) => marble.recordId));
    save.marbles.forEach((record) => {
      if (safeIds.has(record.id)) record.roundsSurvived = currentRound;
      if (lostIds.has(record.id)) {
        record.alive = false;
        record.roundsSurvived = Math.max(record.roundsSurvived, currentRound - 1);
      }
    });
    save.round = currentRound;
    syncAliveScores(save);
    save.lastMapId = currentMap.id;
    save.lastLayout = currentMap.layout || "";
    save.lastObstacle = currentMap.obstacle;
    persist();

    lastRoundSummary = { saved: safeIds.size, lost: lostIds.size, round: currentRound };
    showRoundModal();
  }

  function updateMarbles(step, time) {
    const solids = currentMap.platforms.concat(currentMap.blueBlocks.filter((block) => block.active));
    marbles.forEach((ball) => {
      if (ball.state !== "active") {
        if (ball.safeTimer > 0) ball.safeTimer = Math.max(0, ball.safeTimer - 0.025 * step);
        return;
      }
      const previousX = ball.x;
      const previousY = ball.y;
      const pace = roundSpeed;
      const cap = MAX_SPEED * pace;
      const rules = mapRules();
      ball.grounded = false;
      ball.vy = Math.min(cap, ball.vy + GRAVITY * rules.gravity * pace * step);
      ball.vx = Math.max(-cap, Math.min(cap, ball.vx + rules.wind * step));
      ball.x += (ball.vx + (ball.grounded ? rules.conveyor : 0)) * step;
      ball.y += ball.vy * step;
      ball.vx *= Math.pow(Math.max(0.97, 0.999 / rules.slide), step);
      ball.hazardCooldown = Math.max(0, ball.hazardCooldown - step);
      ball.padCooldown = Math.max(0, (ball.padCooldown || 0) - step);
      ball.teleportCooldown = Math.max(0, (ball.teleportCooldown || 0) - step);
      ball.spawnProtect = Math.max(0, (ball.spawnProtect || 0) - step);
      solids.forEach((block) => resolveBlock(ball, block, previousX, previousY));
      const pad = (currentMap.jumpPads || []).find((item) => overlapsCirclePart(ball, item));
      if (pad && ball.padCooldown <= 0) {
        ball.vy = -9.6 * pace;
        ball.vx = Math.max(ball.vx, 2.3 * pace);
        ball.padCooldown = 20;
        ball.noProgress = 0;
        addParticles(ball.x, ball.y, "#facc15", 10);
      }
      if (ball.grounded) {
        ball.vx += rules.conveyor * step;
        if (ball.vx < rules.minVx * pace) ball.vx = rules.minVx * pace;
      }
      if (ball.x > (ball.lastProgressX || 0) + 10 || ball.y > (ball.lastProgressY || 0) + 14) {
        ball.lastProgressX = ball.x;
        ball.lastProgressY = ball.y;
        ball.noProgress = 0;
      } else {
        ball.noProgress = (ball.noProgress || 0) + step;
      }
      const idle = Math.abs(ball.vx) < 0.35 && Math.abs(ball.vy) < 0.45;
      ball.still = idle ? (ball.still || 0) + step : 0;
      if ((ball.teleportCooldown || 0) <= 0 && (ball.spawnProtect || 0) <= 0 && (ball.still > 16 || ball.noProgress > 26)) {
        ball.x += 36;
        ball.vx = 3.2 * pace;
        ball.vy = Math.min(ball.vy, 1.1);
        ball.still = 0;
        ball.noProgress = 0;
        ball.lastProgressX = ball.x - 16;
        ball.lastProgressY = ball.y;
      }
      ball.x = Math.max(RADIUS + 8, Math.min(WIDTH - RADIUS - 8, ball.x));

      const protectedBall = (ball.teleportCooldown || 0) > 0 || (ball.spawnProtect || 0) > 0;
      const good = !protectedBall && (currentMap.goodLava || []).find((pool) => overlapsCirclePart(ball, pool));
      if (good) {
        teleportHome(ball);
        return;
      }
      const dead = !protectedBall && (
        currentMap.lava.some((pool) => overlapsCirclePart(ball, pool)) ||
        (currentMap.killPools || []).some((pool) => overlapsCirclePart(ball, pool)) ||
        currentMap.hazards.some((hazard) => touchesHazard(ball, hazard, time)) ||
        ball.y - ball.radius > HEIGHT
      );
      if (dead) {
        loseMarble(ball);
        return;
      }
      if (overlapsCirclePart(ball, currentMap.goal)) rescueMarble(ball);
    });
    resolveMarbleCollisions();
  }

  function updateParticles(step) {
    particles.forEach((particle) => {
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      particle.vy += 0.08 * step;
      particle.life -= 0.025 * step;
    });
    particles = particles.filter((particle) => particle.life > 0);
  }

  function drawBackground(time) {
    const layout = baseLayout(currentMap.layout);
    const theme = currentMap.theme || MAP_THEMES[layout] || MAP_THEMES.stairs;
    const gradient = ctx.createLinearGradient(0, 0, layout === "split" ? WIDTH : 0, HEIGHT);
    gradient.addColorStop(0, theme.sky[0]);
    gradient.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (layout === "islands" || layout === "bridge") {
      ctx.fillStyle = "rgba(253,224,71,.35)";
      ctx.beginPath();
      ctx.arc(layout === "bridge" ? 820 : 860, 70, 52, 0, Math.PI * 2);
      ctx.fill();
    }
    if (layout === "drops") {
      ctx.fillStyle = "rgba(20,83,45,.55)";
      for (let x = 0; x < WIDTH; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 35, 90 + (x % 3) * 20);
        ctx.lineTo(x + 70, 0);
        ctx.fill();
      }
    }
    if (layout === "towers") {
      ctx.fillStyle = "rgba(15,23,42,.45)";
      [120, 400, 700].forEach((x, i) => {
        ctx.fillRect(x, 80 + i * 20, 90, 500);
        ctx.fillRect(x - 16, 80 + i * 20, 122, 24);
      });
    }
    if (layout === "volcano") {
      ctx.fillStyle = "rgba(69,10,10,.5)";
      ctx.beginPath();
      ctx.moveTo(520, 560);
      ctx.lineTo(760, 90);
      ctx.lineTo(1000, 560);
      ctx.fill();
    }
    if (layout === "space") {
      ctx.fillStyle = "rgba(244,114,182,.18)";
      ctx.beginPath();
      ctx.arc(160, 90, 34, 0, Math.PI * 2);
      ctx.fill();
    }
    if (layout === "gauntlet") {
      ctx.fillStyle = "rgba(250,204,21,.12)";
      for (let y = 0; y < HEIGHT; y += 40) ctx.fillRect(0, y, WIDTH, 8);
    }
    if (layout === "zigzag") {
      ctx.strokeStyle = "rgba(240,171,252,.16)";
      ctx.lineWidth = 3;
      for (let x = -200; x < WIDTH + 200; x += 46) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 220, HEIGHT);
        ctx.stroke();
      }
    }
    (currentMap.scenery || []).forEach((item) => {
      ctx.fillStyle = item.color;
      if (item.kind === "circle") {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.kind === "tri") {
        ctx.beginPath();
        ctx.moveTo(item.x, item.y + item.s);
        ctx.lineTo(item.x + item.s * 0.5, item.y);
        ctx.lineTo(item.x + item.s, item.y + item.s);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(item.x, item.y, item.w, item.h);
      }
    });
    drawWeather(time);
  }

  function drawWeather(time) {
    const layout = baseLayout(currentMap.layout);
    ctx.save();
    if (layout === "ice" || layout === "night") {
      ctx.fillStyle = "rgba(255,255,255,.55)";
      for (let i = 0; i < 36; i += 1) {
        const x = (time * 0.06 + i * 81) % WIDTH;
        const y = (time * 0.14 + i * 53) % (HEIGHT - 40);
        ctx.fillRect(x, y, 2, layout === "ice" ? 7 : 2);
      }
    } else if (layout === "drops" || layout === "swamp") {
      ctx.fillStyle = "rgba(190,242,100,.35)";
      for (let i = 0; i < 18; i += 1) {
        const x = (time * 0.03 + i * 97) % WIDTH;
        const y = (time * 0.05 + i * 61) % 240;
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (layout === "volcano" || layout === "factory") {
      ctx.fillStyle = layout === "volcano" ? "rgba(251,146,60,.55)" : "rgba(250,204,21,.4)";
      for (let i = 0; i < 22; i += 1) {
        const x = (i * 73 + Math.sin(time * 0.002 + i) * 20) % WIDTH;
        const y = HEIGHT - ((time * 0.08 + i * 40) % 420);
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (layout === "canyon") {
      ctx.fillStyle = "rgba(255,210,140,.18)";
      for (let i = 0; i < 12; i += 1) {
        const x = (time * 0.2 + i * 90) % WIDTH;
        ctx.fillRect(x, 80 + i * 30, 90, 10);
      }
    }
    ctx.restore();
  }

  function drawPlatforms() {
    const theme = currentMap.theme || MAP_THEMES[currentMap.layout] || MAP_THEMES.stairs;
    currentMap.platforms.forEach((platform) => {
      if (platform.h >= HEIGHT - 4) {
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        return;
      }
      if (partIsShaped(platform)) {
        drawShapedPart(ctx, platform, theme.plat[0]);
        return;
      }
      const kind = baseLayout(currentMap.layout);
      const top = kind === "split" && platform.x > 420 ? "#fb923c" : theme.plat[0];
      const bottom = kind === "split" && platform.x > 420 ? "#9a3412" : theme.plat[1];
      const gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.h);
      gradient.addColorStop(0, top);
      gradient.addColorStop(1, bottom);
      ctx.fillStyle = gradient;
      if (kind === "stairs" || kind === "canyon" || kind === "towers") {
        ctx.fillStyle = bottom;
        ctx.fillRect(platform.x + 12, platform.y + platform.h, 16, Math.min(90, 560 - platform.y));
        ctx.fillRect(platform.x + platform.w - 28, platform.y + platform.h, 16, Math.min(90, 560 - platform.y));
      }
      if (kind === "islands" || kind === "wells" || kind === "swamp") {
        roundRect(platform.x, platform.y, platform.w, platform.h + 4, 12);
        ctx.fill();
      } else if (kind === "ice" || kind === "space") {
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        ctx.fillStyle = "rgba(255,255,255,.5)";
        ctx.fillRect(platform.x, platform.y, platform.w, 3);
      } else if (kind === "gauntlet" || kind === "factory") {
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        ctx.fillStyle = theme.accent;
        for (let x = platform.x + 8; x < platform.x + platform.w; x += 28) {
          ctx.fillRect(x, platform.y + 4, 10, Math.max(4, platform.h - 8));
        }
      } else if (kind === "zigzag" || kind === "night") {
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 16;
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        ctx.fillStyle = "rgba(255,255,255,.25)";
        ctx.fillRect(platform.x, platform.y, platform.w, 4);
      }
    });
  }

  function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawBlueBlocks() {
    currentMap.blueBlocks.forEach((block) => {
      if (!block.active) return;
      if (partIsShaped(block)) {
        drawShapedPart(ctx, block, "#3478f6");
        return;
      }
      const gradient = ctx.createLinearGradient(block.x, block.y, block.x + block.w, block.y + block.h);
      gradient.addColorStop(0, "#62a8ff");
      gradient.addColorStop(1, "#244dcc");
      ctx.fillStyle = gradient;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.strokeStyle = "#b9dcff";
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x + 1, block.y + 1, block.w - 2, block.h - 2);
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      for (let y = block.y + 9; y < block.y + block.h; y += 12) {
        ctx.beginPath();
        ctx.moveTo(block.x + 4, y);
        ctx.lineTo(block.x + block.w - 4, y);
        ctx.stroke();
      }
    });
  }

  function drawLavaPool(pool, time, top, bottom, spark) {
    if (partIsShaped(pool)) {
      drawShapedPart(ctx, pool, top);
      return;
    }
    const gradient = ctx.createLinearGradient(0, pool.y, 0, pool.y + pool.h);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(pool.x, pool.y, pool.w, pool.h);
    ctx.fillStyle = spark;
    for (let x = pool.x + 8; x < pool.x + pool.w; x += 18) {
      ctx.beginPath();
      ctx.arc(x, pool.y + 4 + Math.sin(time * 0.005 + x * 0.08) * 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLava(time) {
    const theme = currentMap.theme || MAP_THEMES.stairs;
    currentMap.lava.forEach((pool) => drawLavaPool(pool, time, theme.lava[0], theme.lava[1], theme.accent));
    (currentMap.killPools || []).forEach((pool) => drawLavaPool(pool, time, "#fb7185", "#9f1239", "#fecdd3"));
    (currentMap.goodLava || []).forEach((pool) => {
      const cx = pool.x + pool.w / 2;
      const cy = pool.y + pool.h / 2;
      const pulse = 0.65 + Math.sin(time * 0.012) * 0.25;
      ctx.save();
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `rgba(125,211,252,${pulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pool.w / 2, pool.h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, pool.w / 3.2, pool.h / 3.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(56,189,248,.32)";
      ctx.fill();
      ctx.restore();
    });
  }

  function drawJumpPads(time) {
    (currentMap.jumpPads || []).forEach((pad) => {
      if (partIsShaped(pad)) {
        drawShapedPart(ctx, pad, "#facc15");
        return;
      }
      const pulse = 0.7 + Math.sin(time * 0.01) * 0.2;
      ctx.save();
      ctx.shadowColor = `rgba(250,204,21,${pulse})`;
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#facc15";
      ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
      ctx.restore();
      ctx.fillStyle = "#854d0e";
      ctx.beginPath();
      ctx.moveTo(pad.x + pad.w / 2, pad.y + 2);
      ctx.lineTo(pad.x + pad.w - 6, pad.y + pad.h - 3);
      ctx.lineTo(pad.x + 6, pad.y + pad.h - 3);
      ctx.closePath();
      ctx.fill();
    });
  }

  function drawHazards(time) {
    currentMap.hazards.forEach((hazard) => {
      const position = hazardPosition(hazard, time);
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(time * 0.004);
      ctx.fillStyle = "#ff315c";
      ctx.shadowColor = "#ff315c";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let i = 0; i < 20; i += 1) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = i % 2 ? hazard.radius : hazard.radius + 7;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (!i) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3f0715";
      ctx.beginPath();
      ctx.arc(0, 0, hazard.radius * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawGoal(time) {
    const goal = currentMap.goal;
    if (partIsShaped(goal)) {
      drawShapedPart(ctx, goal, "#22c55e");
      const c = partCenter(goal);
      ctx.fillStyle = "#052e16";
      ctx.font = "900 13px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SAFE", c.x, c.y);
      return;
    }
    const pulse = 0.72 + Math.sin(time * 0.006) * 0.18;
    const layout = baseLayout(currentMap.layout);
    ctx.save();
    ctx.shadowColor = `rgba(74,222,128,${pulse})`;
    ctx.shadowBlur = 26;
    if (layout === "space" || layout === "night" || layout === "wells") {
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(goal.x + goal.w / 2, goal.y + goal.h / 2, Math.min(goal.w, goal.h) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (layout === "factory" || layout === "gauntlet") {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    } else if (layout === "volcano") {
      ctx.fillStyle = "#fb923c";
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    } else {
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    }
    ctx.restore();
    ctx.strokeStyle = "#bbf7d0";
    ctx.lineWidth = 3;
    ctx.strokeRect(goal.x + 1.5, goal.y + 1.5, goal.w - 3, goal.h - 3);
    ctx.fillStyle = "#052e16";
    ctx.font = "900 13px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SAFE", goal.x + goal.w / 2, goal.y + goal.h / 2);
  }

  function shadeColor(hex, amount) {
    const number = parseInt(String(hex).replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (number >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((number >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (number & 255) + amount));
    return `rgb(${r},${g},${b})`;
  }

  function drawMarble(ball) {
    if (ball.state === "lost" || (ball.state === "safe" && ball.safeTimer <= 0)) return;
    const radius = ball.state === "safe" ? ball.radius * ball.safeTimer : ball.radius;
    const gradient = ctx.createRadialGradient(
      ball.x - radius * 0.35,
      ball.y - radius * 0.4,
      2,
      ball.x,
      ball.y,
      radius
    );
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(0.22, ball.color);
    gradient.addColorStop(1, shadeColor(ball.color, -50));
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = ball.state === "safe" ? 24 : 8;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, Math.max(0.5, radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    if (roleplay && ball === roleplay.selected) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (roleplay && ball.face) drawCustomFace(ball, radius);
    if (ball.state === "active" || ball.state === "done") {
      ctx.fillStyle = "#eaf7ff";
      ctx.font = "700 10px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(ball.name, ball.x, ball.y - ball.radius - 7);
    }
    if (roleplay && ball.eatFx && (roleplay.time || 0) < ball.eatFx.until) {
      ctx.fillStyle = ball.eatFx.like ? "#fb7185" : "#94a3b8";
      ctx.font = "800 18px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(ball.eatFx.like ? "♥" : "✕", ball.x, ball.y - radius - 20);
    }
  }

  function drawParticles() {
    particles.forEach((particle) => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
  }

  function draw(time) {
    drawBackground(time);
    drawLava(time);
    drawPlatforms();
    drawJumpPads(time);
    drawBlueBlocks();
    drawHazards(time);
    drawGoal(time);
    marbles.forEach(drawMarble);
    drawParticles();
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.font = "900 42px Segoe UI";
    ctx.textAlign = "left";
    ctx.fillText(layoutLabel(currentMap.layout), 28, 52);
    ctx.restore();
  }

  function loop(time) {
    const delta = Math.min(32, time - lastTime || 16.67);
    const step = delta / 16.67;
    lastTime = time;
    if (roleplay) {
      roleplay.time = time;
      drawRoleplay();
    } else if (minigame) {
      if (minigame.playing) updateMinigame(step, time);
      updateParticles(step);
      drawMinigame(time);
    } else {
      if (playing) updateMarbles(step, time);
      updateParticles(step);
      if (currentMap) draw(time);
    }
    frameId = requestAnimationFrame(loop);
  }

  function canvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT
    };
  }

  function setGameChrome(mode) {
    const isMini = mode === "mini";
    const isRole = mode === "roleplay";
    if (ui.campaignLegend) ui.campaignLegend.hidden = isMini || isRole;
    if (ui.minigameLegend) ui.minigameLegend.hidden = !isMini;
    if (ui.splitPairNav) ui.splitPairNav.hidden = !(isMini && minigame && minigame.kind === "splitlove" && (minigame.extras.rooms || []).length);
    if (ui.teamSpikeNav) ui.teamSpikeNav.hidden = !(isMini && minigame && minigame.kind === "teamspike");
    if (ui.roleplayLegend) ui.roleplayLegend.hidden = !isRole || marbleChatOpen;
    if (ui.roleplayFaces) ui.roleplayFaces.hidden = !isRole || marbleChatOpen;
    if (ui.houseNav) ui.houseNav.hidden = !(isRole && roleplay && roleplay.inside) || marbleChatOpen;
    if (ui.marbleChatPanel) ui.marbleChatPanel.hidden = !isRole || !marbleChatOpen;
    if (ui.canvasWrap) ui.canvasWrap.hidden = !!(isRole && marbleChatOpen);
    if (ui.addHouse) ui.addHouse.hidden = !isRole || marbleChatOpen || !!(roleplay && roleplay.inside);
    if (ui.modeBadge) {
      ui.modeBadge.textContent = isRole
        ? t("roleplayMode")
        : isMini
          ? t("miniMode")
          : (currentMap ? layoutLabel(currentMap.layout) : "EASY DEMON");
    }
  }

  function rpWorldPoint(event) {
    const point = canvasPosition(event);
    return {
      x: roleplay.camX + point.x / roleplay.zoom,
      y: roleplay.camY + point.y / roleplay.zoom
    };
  }

  function rpPointer(event) {
    return roleplay && roleplay.inside ? canvasPosition(event) : rpWorldPoint(event);
  }

  function clampRoleplayCam() {
    if (!roleplay) return;
    const viewW = WIDTH / roleplay.zoom;
    const viewH = HEIGHT / roleplay.zoom;
    roleplay.camX = Math.max(0, Math.min(RP_WIDTH - viewW, roleplay.camX));
    roleplay.camY = Math.max(0, Math.min(RP_HEIGHT - viewH, roleplay.camY));
  }

  function currentHouse() {
    if (!roleplay || !roleplay.inside) return null;
    return (roleplay.houses || []).find((house) => house.id === roleplay.inside) || null;
  }

  function houseRoomName(room) {
    const keys = { sala: "houseSala", cocina: "houseKitchen", bano: "houseBath", dorm1: "houseBed1", dorm2: "houseBed2" };
    return t(keys[room] || "houseSala");
  }

  function houseHit(x, y) {
    const list = roleplay && roleplay.houses ? roleplay.houses : [];
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const house = list[i];
      if (x >= house.x && x <= house.x + HOUSE_W && y >= house.y && y <= house.y + HOUSE_H) return house;
    }
    return null;
  }

  function marbleInHouseView(ball) {
    if (!roleplay || !roleplay.inside) return !ball.houseId;
    return ball.houseId === roleplay.inside && (ball.houseRoom || "sala") === (roleplay.room || "sala");
  }

  function marbleAtWorld(x, y) {
    for (let i = marbles.length - 1; i >= 0; i -= 1) {
      const ball = marbles[i];
      if (!marbleInHouseView(ball)) continue;
      if (Math.hypot(ball.x - x, ball.y - y) <= ball.radius + 6) return ball;
    }
    return null;
  }

  function houseHotspots(room) {
    const light = { id: "light", x: 430, y: 18, w: 140, h: 90 };
    const door = { id: "door", x: 8, y: 430, w: 210, h: 170 };
    if (room === "sala") return [light, { id: "tv", x: 690, y: 210, w: 230, h: 150 }, door];
    if (room === "bano") return [light, { id: "bath", x: 70, y: 300, w: 320, h: 180 }, door];
    return [light, door];
  }

  function hotspotAt(x, y) {
    if (!roleplay || !roleplay.inside) return null;
    const spots = houseHotspots(roleplay.room || "sala");
    for (let i = spots.length - 1; i >= 0; i -= 1) {
      const spot = spots[i];
      if (x >= spot.x && x <= spot.x + spot.w && y >= spot.y && y <= spot.y + spot.h) return spot;
    }
    return null;
  }

  function sendMarbleIntoHouse(ball, house, room) {
    if (!ball || !house) return;
    ball.houseId = house.id;
    ball.houseRoom = room && HOUSE_ROOMS.includes(room) ? room : "sala";
    ball.x = 180 + Math.random() * 280;
    ball.y = 400 + Math.random() * 80;
  }

  function teleportHouseMarble(ball) {
    const house = currentHouse();
    if (!roleplay || !house || !ball || ball.houseId !== house.id) return;
    sendMarbleIntoHouse(ball, house, roleplay.room || "sala");
    roleplay.selected = ball;
    roleplay.draftFace = ball.face || "";
    saveRoleplayMarbles();
    updateHouseChrome();
  }

  function marbleHitsDoor(ball) {
    if (!ball || !roleplay || !roleplay.inside) return false;
    const door = houseHotspots(roleplay.room || "sala").find((spot) => spot.id === "door");
    if (!door) return false;
    const nx = Math.max(door.x, Math.min(door.x + door.w, ball.x));
    const ny = Math.max(door.y, Math.min(door.y + door.h, ball.y));
    return Math.hypot(ball.x - nx, ball.y - ny) <= ball.radius + 10;
  }

  function renderHouseMarbles() {
    if (!ui.houseMarbleList) return;
    ui.houseMarbleList.innerHTML = "";
    if (!roleplay || !roleplay.inside) return;
    const room = roleplay.room || "sala";
    marbles
      .filter((ball) => ball.houseId === roleplay.inside)
      .forEach((ball) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "button compact house-marble-btn";
        if ((ball.houseRoom || "sala") === room) button.classList.add("active");
        button.innerHTML = `<i class="mini-marble" style="background:${ball.color}"></i><span>${escapeHtml(ball.name)}</span>`;
        button.addEventListener("click", () => teleportHouseMarble(ball));
        ui.houseMarbleList.appendChild(button);
      });
  }

  function addRoleplayHouse() {
    if (!roleplay || roleplay.inside) return;
    const viewW = WIDTH / roleplay.zoom;
    const viewH = HEIGHT / roleplay.zoom;
    roleplay.houses.push(normalizeHouse({
      id: makeId("house"),
      x: roleplay.camX + viewW / 2 - HOUSE_W / 2,
      y: roleplay.camY + viewH / 2 - HOUSE_H / 2
    }));
    saveRoleplayMarbles();
    ui.status.textContent = t("addHouse");
  }

  function enterHouse(house) {
    if (!roleplay || !house) return;
    roleplay.inside = house.id;
    roleplay.room = roleplay.room && HOUSE_ROOMS.includes(roleplay.room) ? roleplay.room : "sala";
    roleplay.drag = null;
    roleplay.houseDrag = null;
    roleplay.pan = null;
    updateHouseChrome();
  }

  function leaveHouse() {
    if (!roleplay) return;
    roleplay.inside = null;
    roleplay.drag = null;
    roleplay.houseDrag = null;
    updateHouseChrome();
    ui.levelTitle.textContent = t("roleplayTitle");
    ui.status.textContent = t("roleplayStatus", { n: marbles.filter((ball) => !ball.houseId).length });
  }

  function setHouseRoom(room) {
    if (!roleplay || !roleplay.inside || !HOUSE_ROOMS.includes(room)) return;
    roleplay.room = room;
    updateHouseChrome();
  }

  function toggleHouseProp(id) {
    const house = currentHouse();
    if (!house) return;
    const room = roleplay.room || "sala";
    if (id === "light") house.lights[room] = !house.lights[room];
    if (id === "tv" && room === "sala") house.tvOn = !house.tvOn;
    if (id === "bath" && room === "bano") house.bathOn = !house.bathOn;
    saveRoleplayMarbles();
  }

  function updateHouseChrome() {
    const inside = !!(roleplay && roleplay.inside);
    if (ui.houseNav) ui.houseNav.hidden = !inside || marbleChatOpen;
    if (ui.addHouse) ui.addHouse.hidden = inside || marbleChatOpen;
    if (ui.roleplayFaces) ui.roleplayFaces.hidden = !roleplay || marbleChatOpen;
    document.querySelectorAll("[data-house-room]").forEach((button) => {
      button.classList.toggle("active", inside && button.getAttribute("data-house-room") === (roleplay.room || "sala"));
    });
    if (inside) {
      ui.levelTitle.textContent = t("houseInside", { room: houseRoomName(roleplay.room || "sala") });
      const here = marbles.filter((ball) => ball.houseId === roleplay.inside && (ball.houseRoom || "sala") === (roleplay.room || "sala")).length;
      ui.status.textContent = t("roleplayStatus", { n: here });
    }
    renderHouseMarbles();
    if (inside) renderRoleplayFaces();
  }

  function drawHouse(house) {
    const x = house.x;
    const y = house.y;
    const lit = Object.values(house.lights).some(Boolean);
    ctx.fillStyle = "#7c2d12";
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 210);
    ctx.lineTo(x + HOUSE_W / 2, y + 20);
    ctx.lineTo(x + HOUSE_W - 20, y + 210);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f8ead2";
    ctx.fillRect(x + 48, y + 200, HOUSE_W - 96, HOUSE_H - 220);
    ctx.fillStyle = "#b45309";
    ctx.fillRect(x + HOUSE_W / 2 - 36, y + 292, 72, HOUSE_H - 312);
    ctx.fillStyle = lit ? "#fde68a" : "#7dd3fc";
    ctx.fillRect(x + 90, y + 260, 88, 70);
    ctx.fillRect(x + HOUSE_W - 178, y + 260, 88, 70);
    ctx.strokeStyle = "#431407";
    ctx.lineWidth = 6;
    ctx.strokeRect(x + 90, y + 260, 88, 70);
    ctx.strokeRect(x + HOUSE_W - 178, y + 260, 88, 70);
    ctx.fillStyle = "#fff7ed";
    ctx.font = "800 28px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("🏠", x + HOUSE_W / 2, y + 150);
  }

  function drawHouseInterior(house, time) {
    const room = roleplay.room || "sala";
    const lit = !!house.lights[room];
    const palettes = {
      sala: ["#f5d0a9", "#d4a574", "#7c3f12"],
      cocina: ["#fde68a", "#fbbf24", "#b45309"],
      bano: ["#a5f3fc", "#67e8f9", "#0e7490"],
      dorm1: ["#ddd6fe", "#c4b5fd", "#6d28d9"],
      dorm2: ["#fecdd3", "#fda4af", "#be123c"]
    };
    const [wall, floor, accent] = palettes[room] || palettes.sala;
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = floor;
    ctx.fillRect(0, 430, WIDTH, 170);
    ctx.fillStyle = "#fff7ed";
    ctx.fillRect(0, 0, WIDTH, 70);
    ctx.fillStyle = lit ? "#fde68a" : "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(470, 18);
    ctx.lineTo(530, 18);
    ctx.lineTo(560, 88);
    ctx.lineTo(440, 88);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = lit ? "rgba(253, 224, 71, 0.35)" : "rgba(15, 23, 42, 0.08)";
    ctx.beginPath();
    ctx.ellipse(500, 210, lit ? 220 : 90, lit ? 70 : 28, 0, 0, Math.PI * 2);
    ctx.fill();

    if (room === "sala") {
      ctx.fillStyle = accent;
      roundRect(70, 330, 360, 120, 18);
      ctx.fill();
      ctx.fillStyle = "#78350f";
      roundRect(90, 300, 320, 48, 12);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      roundRect(700, 210, 220, 140, 10);
      ctx.fill();
      if (house.tvOn) {
        const pulse = 0.55 + Math.sin(time * 0.01) * 0.25;
        ctx.fillStyle = `rgba(96, 165, 250, ${pulse})`;
        ctx.fillRect(714, 224, 192, 112);
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(734, 250, 70, 40);
        ctx.fillStyle = "#86efac";
        ctx.fillRect(820, 270, 60, 44);
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(714, 224, 192, 112);
      }
    } else if (room === "cocina") {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(40, 250, 920, 180);
      ctx.fillStyle = accent;
      ctx.fillRect(40, 250, 920, 22);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(80, 290, 160, 120);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(300, 310, 220, 20);
      ctx.fillRect(300, 350, 220, 20);
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(760, 280, 140, 130);
    } else if (room === "bano") {
      ctx.fillStyle = "#e0f2fe";
      roundRect(70, 300, 320, 180, 24);
      ctx.fill();
      ctx.strokeStyle = "#0369a1";
      ctx.lineWidth = 6;
      roundRect(70, 300, 320, 180, 24);
      ctx.stroke();
      if (house.bathOn) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.72)";
        roundRect(86, 348, 288, 116, 18);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(140 + (Math.sin(time * 0.008) * 18), 390, 10, 0, Math.PI * 2);
        ctx.arc(220, 410 + Math.sin(time * 0.01) * 8, 8, 0, Math.PI * 2);
        ctx.arc(300, 380, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f8fafc";
      roundRect(520, 300, 110, 150, 16);
      ctx.fill();
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath();
      ctx.ellipse(780, 360, 70, 36, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = accent;
      roundRect(120, 250, 420, 200, 20);
      ctx.fill();
      ctx.fillStyle = "#fff7ed";
      roundRect(140, 268, 380, 70, 14);
      ctx.fill();
      ctx.fillStyle = "#64748b";
      ctx.fillRect(680, 250, 90, 200);
    }

    if (!lit) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.46)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(470, 18);
      ctx.lineTo(530, 18);
      ctx.lineTo(560, 88);
      ctx.lineTo(440, 88);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#7c2d12";
    ctx.fillRect(24, 470, 150, 130);
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(150, 545, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff7ed";
    ctx.font = "800 18px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(t("houseExit"), 99, 540);
    ctx.fillStyle = "#0f172a";
    ctx.font = "800 22px Segoe UI";
    ctx.textAlign = "left";
    ctx.fillText(houseRoomName(room), 24, 44);
  }

  function sendMarbleOutside(ball) {
    if (!ball) return;
    const house = (roleplay.houses || []).find((item) => item.id === ball.houseId);
    ball.houseId = "";
    ball.houseRoom = "";
    if (house) {
      ball.x = Math.max(ball.radius, Math.min(RP_WIDTH - ball.radius, house.x + HOUSE_W / 2));
      ball.y = Math.max(ball.radius, Math.min(RP_HEIGHT - ball.radius, house.y + HOUSE_H + 48));
    }
  }

  function faceFrameImage(face, index) {
    if (!face || !face.frames || !face.frames[index]) return null;
    const key = `${face.id}:${index}`;
    let img = faceImageCache.get(key);
    if (!img) {
      img = new Image();
      img.src = face.frames[index];
      faceImageCache.set(key, img);
    }
    return img;
  }

  function drawCustomFace(ball, radius) {
    const face = getFace(ball.face);
    if (!face || !face.frames.length) return;
    const frame = Math.floor(((roleplay && roleplay.time) || 0) / (1000 / FACE_FPS)) % face.frames.length;
    const img = faceFrameImage(face, frame);
    if (!img || !img.complete || !img.naturalWidth) return;
    const size = radius * 1.55;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, radius * 0.82, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, ball.x - size / 2, ball.y - size / 2, size, size);
    ctx.restore();
  }

  function persistRoleplayFace(ball) {
    const save = getSave();
    if (!save) return;
    const record = save.marbles.find((item) => item.id === ball.recordId);
    if (!record) return;
    record.roleplayFace = ball.face || "";
    if (!save.roleplayLayout || typeof save.roleplayLayout !== "object") save.roleplayLayout = {};
    const prev = save.roleplayLayout[ball.recordId] || {};
    save.roleplayLayout[ball.recordId] = {
      x: Number.isFinite(ball.x) ? ball.x : prev.x,
      y: Number.isFinite(ball.y) ? ball.y : prev.y,
      face: ball.face || ""
    };
    persist();
  }

  function applyRoleplayLook() {
    if (!roleplay || !roleplay.selected) return;
    roleplay.selected.face = roleplay.draftFace || "";
    persistRoleplayFace(roleplay.selected);
    renderRoleplayFaces();
  }

  function deleteCustomFace(id) {
    if (!id || !Array.isArray(data.faces)) return;
    data.faces = data.faces.filter((face) => face.id !== id);
    [...faceImageCache.keys()].forEach((key) => {
      if (key.startsWith(`${id}:`)) faceImageCache.delete(key);
    });
    (data.saves || []).forEach((save) => {
      if (!save) return;
      (save.marbles || []).forEach((marble) => {
        if (marble.roleplayFace === id) marble.roleplayFace = "";
      });
      if (save.roleplayLayout && typeof save.roleplayLayout === "object") {
        Object.keys(save.roleplayLayout).forEach((key) => {
          if (save.roleplayLayout[key] && save.roleplayLayout[key].face === id) {
            save.roleplayLayout[key].face = "";
          }
        });
      }
    });
    marbles.forEach((ball) => {
      if (ball.face === id) ball.face = "";
    });
    if (roleplay && roleplay.draftFace === id) roleplay.draftFace = "";
    persist();
    renderRoleplayFaces();
    renderMenuFaces();
    if (roleplay) ui.status.textContent = t("faceDeleted");
  }

  function makeFaceThumb(face, onPick) {
    const wrap = document.createElement("div");
    wrap.className = "face-thumb-wrap";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "roleplay-face thumb";
    button.title = face.name || t("createFace");
    if (roleplay && roleplay.draftFace === face.id) button.classList.add("active");
    if (face.frames[0]) {
      const img = document.createElement("img");
      img.src = face.frames[0];
      img.alt = face.name || t("createFace");
      button.appendChild(img);
    } else {
      button.textContent = "∅";
    }
    button.addEventListener("click", () => {
      if (onPick) onPick(face);
    });
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "face-copy";
    copy.title = t("copyFace");
    copy.setAttribute("aria-label", t("copyFace"));
    copy.textContent = "⧉";
    copy.addEventListener("click", (event) => {
      event.stopPropagation();
      copySavedFace(face.id);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "face-delete";
    remove.title = t("deleteFace");
    remove.setAttribute("aria-label", t("deleteFace"));
    remove.textContent = "×";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteCustomFace(face.id);
    });
    wrap.appendChild(button);
    wrap.appendChild(copy);
    wrap.appendChild(remove);
    return wrap;
  }

  function renderMenuFaces() {
    if (!ui.menuFaceList) return;
    ui.menuFaceList.innerHTML = "";
    (data.faces || []).forEach((face) => {
      ui.menuFaceList.appendChild(makeFaceThumb(face));
    });
  }

  function deleteCustomFood(id) {
    if (!id || !Array.isArray(data.foods)) return;
    const gone = data.foods.find((food) => food.id === id);
    data.foods = data.foods.filter((food) => food.id !== id);
    (data.saves || []).forEach((save) => {
      if (!save || !Array.isArray(save.roleplayFoods)) return;
      save.roleplayFoods = save.roleplayFoods.filter((item) => item && item.foodId !== id);
    });
    if (roleplay && Array.isArray(roleplay.foods)) {
      roleplay.foods = roleplay.foods.filter((item) => item.foodId !== id);
    }
    persist();
    renderMenuFoods();
    renderRoleplayFoods();
    if (screens.foodLikes && screens.foodLikes.classList.contains("active")) renderFoodLikes();
    if (roleplay) ui.status.textContent = t(gone && gone.kind === "drink" ? "drinkDeleted" : "foodDeleted");
  }

  function makeFoodThumb(food, options) {
    const wrap = document.createElement("div");
    wrap.className = "face-thumb-wrap";
    const drink = edibleKind(food) === "drink";
    const label = food.name || edibleDefaultName(food);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "roleplay-face thumb" + (drink ? " drink-thumb" : "");
    button.title = label;
    if (food.frames[0]) {
      const img = document.createElement("img");
      img.src = food.frames[0];
      img.alt = label;
      button.appendChild(img);
    } else {
      button.textContent = drink ? "🥤" : "🍽";
    }
    button.addEventListener("pointerdown", (event) => startFoodThumbDrag(food, event));
    button.addEventListener("pointermove", handleFoodThumbMove);
    button.addEventListener("pointerup", handleFoodThumbUp);
    button.addEventListener("pointercancel", handleFoodThumbUp);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "face-delete";
    remove.title = t(drink ? "deleteDrink" : "deleteFood");
    remove.setAttribute("aria-label", t(drink ? "deleteDrink" : "deleteFood"));
    remove.textContent = "×";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteCustomFood(food.id);
    });
    wrap.appendChild(button);
    wrap.appendChild(remove);
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "face-edit";
    edit.title = t(drink ? "drinkEdit" : "foodEdit");
    edit.setAttribute("aria-label", t(drink ? "drinkEdit" : "foodEdit"));
    edit.textContent = "✎";
    edit.addEventListener("click", (event) => {
      event.stopPropagation();
      openFoodEditor(food);
    });
    wrap.appendChild(edit);
    if (edibleKind(food) !== "drink" && foodVariantCount(food) > 1) {
      const badge = document.createElement("span");
      badge.className = "food-variant-badge";
      badge.textContent = String(foodVariantCount(food));
      wrap.appendChild(badge);
    }
    return wrap;
  }

  function fillEdibleList(node, kind) {
    if (!node) return;
    node.innerHTML = "";
    listedEdibles(kind).forEach((food) => {
      node.appendChild(makeFoodThumb(food));
    });
  }

  function renderMenuFoods() {
    fillEdibleList(ui.menuFoodList, "food");
    fillEdibleList(ui.menuDrinkList, "drink");
  }

  function renderFoodLikes() {
    if (!ui.foodLikesList) return;
    const hate = foodTasteMode === "hate";
    if (ui.foodLikesTitle) ui.foodLikesTitle.textContent = t(hate ? "foodHates" : "foodLikes");
    if (ui.foodLikesHintText) ui.foodLikesHintText.textContent = t(hate ? "foodHatesHint" : "foodLikesHint");
    const foods = data.foods || [];
    ui.foodLikesList.innerHTML = "";
    if (ui.emptyFoods) ui.emptyFoods.hidden = foods.length > 0;
    if (!foods.length) return;
    const save = getSave();
    const seenIds = new Set();
    const crowd = (save
      ? (save.marbles || []).filter((marble) => marble.alive).map((marble) => ({ marble, saveName: save.name }))
      : allKnownMarbles().filter((entry) => entry.marble && entry.marble.alive)
    ).filter((entry) => {
      if (!entry.marble || !entry.marble.id || seenIds.has(entry.marble.id)) return false;
      seenIds.add(entry.marble.id);
      return true;
    });
    foods.forEach((food) => {
      const tasters = crowd.filter((entry) => marbleTriedFood(entry.marble, food));
      const fans = tasters.filter((entry) => hate
        ? marbleHatedTriedFood(entry.marble, food) && !marbleLikedTriedFood(entry.marble, food)
        : marbleLikedTriedFood(entry.marble, food) && !marbleHatedTriedFood(entry.marble, food));
      const card = document.createElement("article");
      card.className = "food-like-card";
      const head = document.createElement("div");
      head.className = "food-like-head";
      if (food.frames[0]) {
        const img = document.createElement("img");
        img.src = food.frames[0];
        img.alt = food.name || edibleDefaultName(food);
        head.appendChild(img);
      } else {
        const empty = document.createElement("div");
        empty.className = "food-like-empty";
        empty.textContent = edibleKind(food) === "drink" ? "🥤" : "🍽";
        head.appendChild(empty);
      }
      const title = document.createElement("div");
      const kindTag = edibleKind(food) === "drink" ? ` · ${escapeHtml(t("createDrink"))}` : "";
      title.innerHTML = `<strong>${escapeHtml(food.name || edibleDefaultName(food))}${kindTag}</strong><span>${escapeHtml(t("foodFanCount", { n: fans.length }))}</span>`;
      head.appendChild(title);
      card.appendChild(head);
      if (!fans.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = t(tasters.length ? (hate ? "foodNoHaters" : "foodNoFans") : "foodNotTried");
        card.appendChild(empty);
      } else {
        const list = document.createElement("div");
        list.className = "food-fan-list";
        fans.forEach((entry) => {
          const chip = document.createElement("span");
          chip.className = "food-fan-chip";
          const saveBit = !getSave() && entry.saveName ? ` · ${entry.saveName}` : "";
          chip.innerHTML = `<i style="background:${entry.marble.color}"></i><span>${escapeHtml(entry.marble.name)}${escapeHtml(saveBit)}</span>`;
          list.appendChild(chip);
        });
        card.appendChild(list);
      }
      ui.foodLikesList.appendChild(card);
    });
  }

  function openFoodLikes() {
    foodTasteMode = "like";
    renderFoodLikes();
    showScreen("foodLikes");
  }

  function openFoodHates() {
    foodTasteMode = "hate";
    renderFoodLikes();
    showScreen("foodLikes");
  }

  function normalizeRoleplayFood(item) {
    const food = getFood(item && item.foodId);
    const max = foodVariantCount(food) - 1;
    let variant = Number.isFinite(item && item.variant) ? Math.round(item.variant) : randomFoodVariant(food);
    if (variant < 0 || variant > max) variant = 0;
    return {
      id: (item && item.id) || makeId("bite"),
      foodId: (item && item.foodId) || "",
      variant,
      x: Number.isFinite(item && item.x) ? item.x : 0,
      y: Number.isFinite(item && item.y) ? item.y : 0,
      houseId: (item && item.houseId) || "",
      houseRoom: (item && item.houseRoom) || ""
    };
  }

  function foodInView(item) {
    if (!roleplay || !item) return false;
    if (roleplay.inside) return item.houseId === roleplay.inside && (item.houseRoom || "sala") === (roleplay.room || "sala");
    return !item.houseId;
  }

  function foodAtWorld(x, y) {
    const list = roleplay && Array.isArray(roleplay.foods) ? roleplay.foods : [];
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const item = list[i];
      if (!foodInView(item) || !getFood(item.foodId)) continue;
      if (Math.hypot(item.x - x, item.y - y) <= RP_FOOD_SIZE / 2 + 6) return item;
    }
    return null;
  }

  function addRoleplayFood(foodId, x, y) {
    if (!roleplay) return null;
    if (!Array.isArray(roleplay.foods)) roleplay.foods = [];
    const item = normalizeRoleplayFood({
      id: makeId("bite"),
      foodId,
      variant: randomFoodVariant(getFood(foodId)),
      x,
      y,
      houseId: roleplay.inside || "",
      houseRoom: roleplay.inside ? roleplay.room || "sala" : ""
    });
    roleplay.foods.push(item);
    return item;
  }

  function feedAllDropTarget(event) {
    const src = event.target;
    const prev = src && src.style ? src.style.pointerEvents : "";
    if (src && src.style) src.style.pointerEvents = "none";
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (src && src.style) src.style.pointerEvents = prev;
    return el && el.closest("[data-feed-all]");
  }

  function highlightFeedAll(event) {
    const over = !!(event && feedAllDropTarget(event));
    document.querySelectorAll("[data-feed-all]").forEach((button) => {
      button.classList.toggle("drop-hover", over);
    });
  }

  function clearFeedAllHighlight() {
    document.querySelectorAll("[data-feed-all]").forEach((button) => {
      button.classList.remove("drop-hover");
    });
  }

  function recordFoodTaste(recordId, food) {
    const save = getSave();
    const record = save && save.marbles.find((marble) => marble.id === recordId);
    if (!record || !food) return false;
    record.tastedFoods = normalizeTastedFoods(record.tastedFoods);
    record.foodTasteV = 4;
    if (Object.prototype.hasOwnProperty.call(record.tastedFoods, food.id)) {
      return record.tastedFoods[food.id] === true;
    }
    let likes = rollFoodLike(record);
    record.tastedFoods[food.id] = likes;
    balanceSaveFoodTastes(save);
    return record.tastedFoods[food.id] === true;
  }

  function feedAllMarbles(food) {
    const save = getSave();
    if (!save || !food || !save.marbles.length) return false;
    save.marbles.forEach((record) => {
      recordFoodTaste(record.id, food);
    });
    balanceSaveFoodTastes(save);
    save.marbles.forEach((record) => {
      const likes = !!(record.tastedFoods && record.tastedFoods[food.id]);
      const ball = marbles.find((item) => item.recordId === record.id);
      if (ball && roleplay) {
        ball.eatFx = { like: likes, until: (roleplay.time || 0) + 1400 };
      }
    });
    persist();
    const message = t("feedAllDone", { food: food.name || edibleDefaultName(food) });
    if (roleplay) ui.status.textContent = message;
    return true;
  }

  function startFoodThumbDrag(food, event) {
    if (!food) return;
    event.preventDefault();
    event.stopPropagation();
    foodThumbDrag = { foodId: food.id };
    if (event.currentTarget && event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (roleplay) startPaletteFoodDrag(food, event);
  }

  function handleFoodThumbMove(event) {
    if (roleplay && roleplay.foodDrag) {
      handleRoleplayMove(event);
      highlightFeedAll(event);
      return;
    }
    if (foodThumbDrag) highlightFeedAll(event);
  }

  function handleFoodThumbUp(event) {
    const overFeedAll = feedAllDropTarget(event);
    let draggedFood = foodThumbDrag ? getFood(foodThumbDrag.foodId) : null;
    if (!draggedFood && roleplay && roleplay.foodDrag) {
      const item = (roleplay.foods || []).find((bite) => bite.id === roleplay.foodDrag.id);
      draggedFood = item ? getFood(item.foodId) : null;
    }
    if (overFeedAll && draggedFood) {
      if (roleplay && roleplay.foodDrag) {
        const item = (roleplay.foods || []).find((bite) => bite.id === roleplay.foodDrag.id);
        if (item) roleplay.foods = roleplay.foods.filter((bite) => bite.id !== item.id);
        roleplay.foodDrag = null;
      }
      feedAllMarbles(draggedFood);
      foodThumbDrag = null;
      clearFeedAllHighlight();
      if (event.currentTarget && event.currentTarget.hasPointerCapture && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }
    foodThumbDrag = null;
    clearFeedAllHighlight();
    if (roleplay) handleRoleplayUp(event);
  }

  function startPaletteFoodDrag(food, event) {
    if (!roleplay || !food) return;
    const point = spawnFoodPoint(event);
    const item = addRoleplayFood(food.id, point.x, point.y);
    roleplay.foodDrag = {
      id: item.id,
      ox: 0,
      oy: 0,
      sx: event.clientX,
      sy: event.clientY,
      moved: true,
      fromList: true
    };
    roleplay.drag = null;
    roleplay.houseDrag = null;
    roleplay.pan = null;
  }

  function spawnFoodPoint(event) {
    const canvasPoint = canvasPosition(event);
    const overCanvas = canvasPoint.x >= 0 && canvasPoint.x <= WIDTH && canvasPoint.y >= 0 && canvasPoint.y <= HEIGHT;
    if (!overCanvas) {
      if (roleplay.inside) return { x: WIDTH / 2, y: HEIGHT / 2 };
      return {
        x: roleplay.camX + WIDTH / (2 * roleplay.zoom),
        y: roleplay.camY + HEIGHT / (2 * roleplay.zoom)
      };
    }
    const point = rpPointer(event);
    if (roleplay.inside) {
      return {
        x: Math.max(RP_FOOD_SIZE / 2, Math.min(WIDTH - RP_FOOD_SIZE / 2, point.x)),
        y: Math.max(RP_FOOD_SIZE / 2, Math.min(HEIGHT - RP_FOOD_SIZE / 2, point.y))
      };
    }
    return {
      x: Math.max(RP_FOOD_SIZE / 2, Math.min(RP_WIDTH - RP_FOOD_SIZE / 2, point.x)),
      y: Math.max(RP_FOOD_SIZE / 2, Math.min(RP_HEIGHT - RP_FOOD_SIZE / 2, point.y))
    };
  }

  function eatRoleplayFood(item, ball) {
    if (!roleplay || !item || !ball) return;
    const food = getFood(item.foodId);
    roleplay.foods = (roleplay.foods || []).filter((bite) => bite.id !== item.id);
    const likes = recordFoodTaste(ball.recordId, food);
    ball.eatFx = { like: likes, until: (roleplay.time || 0) + 1400 };
    const drink = edibleKind(food) === "drink";
    ui.status.textContent = t(likes
      ? (drink ? "marbleDrankLike" : "marbleAteLike")
      : (drink ? "marbleDrankHate" : "marbleAteHate"), {
      name: ball.name,
      food: foodDisplayName(food, item.variant)
    });
  }

  function drawRoleplayFood(item) {
    if (!foodInView(item)) return;
    const food = getFood(item.foodId);
    const size = RP_FOOD_SIZE;
    const img = food ? faceFrameImage(food, item.variant || 0) : null;
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, item.x - size / 2, item.y - size / 2, size, size);
    } else {
      ctx.font = "28px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(edibleKind(food) === "drink" ? "🥤" : "🍽", item.x, item.y);
    }
  }

  function renderRoleplayFoods() {
    fillEdibleList(ui.roleplayFoodList, "food");
    fillEdibleList(ui.roleplayDrinkList, "drink");
  }

  function renderRoleplayFaces() {
    if (!ui.roleplayFaceList) return;
    ui.roleplayFaceList.innerHTML = "";
    const empty = document.createElement("button");
    empty.type = "button";
    empty.className = "roleplay-face";
    empty.textContent = "∅";
    empty.title = t("roleplayNoFace");
    if (roleplay && !roleplay.draftFace) empty.classList.add("active");
    empty.addEventListener("click", () => {
      if (!roleplay || !roleplay.selected) return;
      roleplay.draftFace = "";
      applyRoleplayLook();
    });
    ui.roleplayFaceList.appendChild(empty);
    (data.faces || []).forEach((face) => {
      ui.roleplayFaceList.appendChild(
        makeFaceThumb(face, () => {
          if (!roleplay || !roleplay.selected) return;
          roleplay.draftFace = face.id;
          applyRoleplayLook();
        })
      );
    });
  }

  function marbleChatSenders() {
    return (roleplay ? marbles : []).filter((ball) => ball && ball.state !== "lost");
  }

  function renderMarbleChat() {
    const save = getSave();
    if (!save || !ui.marbleChatPanel) return;
    const chat = ensureMarbleChat(save);
    const group = activeChatGroup(save);
    if (ui.marbleChatTitle) ui.marbleChatTitle.textContent = group.name;
    if (roleplay) {
      ui.levelTitle.textContent = t("marbleChatTitle", { group: group.name });
      ui.status.textContent = t("marbleChat");
    }
    if (ui.marbleChatGroupList) {
      ui.marbleChatGroupList.innerHTML = "";
      chat.groups.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "marble-chat-group" + (item.id === chat.activeId ? " active" : "");
        button.textContent = item.name;
        button.addEventListener("click", () => {
          chat.activeId = item.id;
          persist();
          renderMarbleChat();
        });
        ui.marbleChatGroupList.appendChild(button);
      });
    }
    if (ui.marbleChatSender) {
      const keep = ui.marbleChatSender.value;
      const senders = marbleChatSenders();
      ui.marbleChatSender.innerHTML = "";
      senders.forEach((ball) => {
        const option = document.createElement("option");
        option.value = ball.recordId;
        option.textContent = ball.name;
        ui.marbleChatSender.appendChild(option);
      });
      const preferred = (roleplay && roleplay.selected && roleplay.selected.recordId) || keep;
      if (senders.some((ball) => ball.recordId === preferred)) ui.marbleChatSender.value = preferred;
    }
    if (!ui.marbleChatMessages) return;
    ui.marbleChatMessages.innerHTML = "";
    if (!group.messages.length) {
      const empty = document.createElement("p");
      empty.className = "marble-chat-empty";
      empty.textContent = t("marbleChatEmpty");
      ui.marbleChatMessages.appendChild(empty);
      return;
    }
    group.messages.forEach((msg) => {
      const row = document.createElement("div");
      row.className = "marble-chat-msg";
      row.innerHTML = `<i style="background:${msg.color}"></i><div><strong>${escapeHtml(msg.name)}</strong><p>${escapeHtml(msg.text)}</p></div>`;
      ui.marbleChatMessages.appendChild(row);
    });
    ui.marbleChatMessages.scrollTop = ui.marbleChatMessages.scrollHeight;
  }

  function openMarbleChat() {
    if (!roleplay) return;
    marbleChatOpen = true;
    ensureMarbleChat(getSave()).activeId = ensureMarbleChat(getSave()).activeId || "marbles";
    setGameChrome("roleplay");
    renderMarbleChat();
    if (ui.marbleChatInput) ui.marbleChatInput.focus();
  }

  function closeMarbleChat() {
    if (!marbleChatOpen) return;
    marbleChatOpen = false;
    if (roleplay) {
      setGameChrome("roleplay");
      updateHouseChrome();
      ui.levelTitle.textContent = t("roleplayTitle");
      ui.status.textContent = t("roleplayStatus", { n: marbles.filter((ball) => !ball.houseId).length });
    }
  }

  function addMarbleChatGroup() {
    const save = getSave();
    if (!save) return;
    const chat = ensureMarbleChat(save);
    const proposed = prompt(t("marbleChatPromptGroup"), "");
    if (proposed == null) return;
    const name = String(proposed).trim().slice(0, 24);
    if (!name) {
      ui.status.textContent = t("marbleChatNeedName");
      return;
    }
    const group = { id: makeId("chat"), name, locked: false, messages: [] };
    chat.groups.push(group);
    chat.activeId = group.id;
    persist();
    renderMarbleChat();
  }

  function sendMarbleChat(event) {
    if (event) event.preventDefault();
    const save = getSave();
    if (!save || !roleplay) return;
    const group = activeChatGroup(save);
    const text = String((ui.marbleChatInput && ui.marbleChatInput.value) || "").trim().slice(0, 200);
    if (!text) return;
    const senders = marbleChatSenders();
    const sender = senders.find((ball) => ball.recordId === (ui.marbleChatSender && ui.marbleChatSender.value)) || senders[0];
    if (!sender) {
      ui.status.textContent = t("marbleChatNeedMarble");
      return;
    }
    group.messages.push(normalizeChatMessage({
      marbleId: sender.recordId,
      name: sender.name,
      color: sender.color,
      text,
      at: Date.now()
    }));
    if (ui.marbleChatInput) ui.marbleChatInput.value = "";
    persist();
    renderMarbleChat();
  }

  function saveRoleplayMarbles(showMessage) {
    const save = getSave();
    if (!save || !roleplay) return;
    save.roleplayLayout = {};
    marbles.forEach((ball) => {
      save.roleplayLayout[ball.recordId] = {
        x: ball.x,
        y: ball.y,
        face: ball.face || "",
        houseId: ball.houseId || "",
        houseRoom: ball.houseRoom || ""
      };
      const record = save.marbles.find((item) => item.id === ball.recordId);
      if (record) record.roleplayFace = ball.face || "";
    });
    save.roleplayCam = { x: roleplay.camX, y: roleplay.camY, zoom: roleplay.zoom };
    save.roleplayHouses = (roleplay.houses || []).map(normalizeHouse);
    save.roleplayFoods = (roleplay.foods || []).map(normalizeRoleplayFood);
    persist();
    if (showMessage) ui.status.textContent = t("roleplaySaved");
  }

  function beginRoleplay() {
    const save = getSave();
    const living = aliveMarbles(save);
    if (!save || !living.length) return;
    stopRecording();
    minigame = null;
    currentMap = null;
    marbleChatOpen = false;
    playing = true;
    ensureMarbleChat(save);
    const cols = Math.max(8, Math.ceil(Math.sqrt(living.length)));
    const gap = 56;
    const startX = RP_WIDTH / 2 - (cols * gap) / 2;
    const startY = RP_HEIGHT / 2 - (Math.ceil(living.length / cols) * gap) / 2;
    const layout = save.roleplayLayout || {};
    marbles = living.map((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const saved = layout[item.id] || {};
      return {
        recordId: item.id,
        name: item.name,
        color: item.color,
        face: saved.face || item.roleplayFace || "",
        houseId: saved.houseId || "",
        houseRoom: saved.houseRoom || "",
        x: Number.isFinite(saved.x) ? saved.x : startX + col * gap,
        y: Number.isFinite(saved.y) ? saved.y : startY + row * gap,
        vx: 0,
        vy: 0,
        radius: RADIUS,
        state: "active"
      };
    });
    const savedCam = save.roleplayCam || {};
    const zoom = RP_ZOOM;
    roleplay = {
      camX: Number.isFinite(savedCam.x) ? savedCam.x : RP_WIDTH / 2 - WIDTH / (2 * zoom),
      camY: Number.isFinite(savedCam.y) ? savedCam.y : RP_HEIGHT / 2 - HEIGHT / (2 * zoom),
      zoom,
      selected: null,
      drag: null,
      houseDrag: null,
      pan: null,
      time: 0,
      draftFace: "",
      houses: Array.isArray(save.roleplayHouses) ? save.roleplayHouses.map(normalizeHouse) : [],
      foods: Array.isArray(save.roleplayFoods) ? save.roleplayFoods.map(normalizeRoleplayFood) : [],
      foodDrag: null,
      inside: null,
      room: "sala"
    };
    clampRoleplayCam();
    ui.levelTitle.textContent = t("roleplayTitle");
    ui.status.textContent = t("roleplayStatus", { n: marbles.filter((ball) => !ball.houseId).length });
    setGameChrome("roleplay");
    updateHouseChrome();
    renderRoleplayFaces();
    renderRoleplayFoods();
    ui.modal.hidden = true;
    showScreen("game");
    lastTime = performance.now();
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(loop);
  }

  function drawRoleplay() {
    if (roleplay.inside) {
      const house = currentHouse();
      if (house) {
        ctx.save();
        drawHouseInterior(house, roleplay.time || 0);
        marbles.filter(marbleInHouseView).forEach(drawMarble);
        (roleplay.foods || []).forEach(drawRoleplayFood);
        ctx.restore();
        return;
      }
      leaveHouse();
    }
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#7dd3fc");
    sky.addColorStop(1, "#bbf7d0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.scale(roleplay.zoom, roleplay.zoom);
    ctx.translate(-roleplay.camX, -roleplay.camY);
    ctx.fillStyle = "#86efac";
    ctx.fillRect(0, 0, RP_WIDTH, RP_HEIGHT);
    ctx.strokeStyle = "rgba(22,101,52,.12)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= RP_WIDTH; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, RP_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= RP_HEIGHT; y += 200) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(RP_WIDTH, y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(251,191,36,.22)";
    ctx.fillRect(RP_WIDTH / 2 - 900, RP_HEIGHT / 2 - 520, 1800, 1040);
    ctx.fillStyle = "rgba(59,130,246,.18)";
    ctx.beginPath();
    ctx.arc(900, 800, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(RP_WIDTH - 700, RP_HEIGHT - 900, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(244,114,182,.2)";
    ctx.beginPath();
    ctx.arc(RP_WIDTH - 1100, 1000, 180, 0, Math.PI * 2);
    ctx.fill();
    (roleplay.houses || []).forEach(drawHouse);
    marbles.filter(marbleInHouseView).forEach(drawMarble);
    (roleplay.foods || []).forEach(drawRoleplayFood);
    ctx.restore();
  }

  function handleRoleplayDown(event) {
    if (!roleplay) return false;
    const inside = !!roleplay.inside;
    const point = rpPointer(event);
    const bite = foodAtWorld(point.x, point.y);
    const ball = marbleAtWorld(point.x, point.y);
    roleplay.houseDrag = null;
    roleplay.hotspot = null;
    roleplay.foodDrag = null;
    if (bite) {
      roleplay.foodDrag = {
        id: bite.id,
        ox: point.x - bite.x,
        oy: point.y - bite.y,
        sx: event.clientX,
        sy: event.clientY,
        moved: false
      };
      roleplay.drag = null;
      roleplay.pan = null;
    } else if (ball) {
      roleplay.selected = ball;
      roleplay.draftFace = ball.face || "";
      roleplay.drag = {
        id: ball.recordId,
        ox: point.x - ball.x,
        oy: point.y - ball.y,
        sx: event.clientX,
        sy: event.clientY,
        moved: false
      };
      roleplay.pan = null;
      renderRoleplayFaces();
    } else if (inside) {
      const spot = hotspotAt(point.x, point.y);
      roleplay.drag = null;
      if (spot) {
        roleplay.pan = null;
        roleplay.hotspot = { id: spot.id, sx: event.clientX, sy: event.clientY };
      } else {
        roleplay.hotspot = null;
        roleplay.pan = null;
      }
    } else {
      const house = houseHit(point.x, point.y);
      roleplay.drag = null;
      if (house) {
        roleplay.houseDrag = {
          id: house.id,
          ox: point.x - house.x,
          oy: point.y - house.y,
          sx: event.clientX,
          sy: event.clientY,
          moved: false
        };
        roleplay.pan = null;
      } else {
        roleplay.pan = { x: event.clientX, y: event.clientY, camX: roleplay.camX, camY: roleplay.camY };
      }
    }
    canvas.setPointerCapture(event.pointerId);
    return true;
  }

  function handleRoleplayMove(event) {
    if (!roleplay) return;
    const inside = !!roleplay.inside;
    const point = rpPointer(event);
    if (roleplay.foodDrag) {
      const item = (roleplay.foods || []).find((bite) => bite.id === roleplay.foodDrag.id);
      if (!item) return;
      if (Math.hypot(event.clientX - roleplay.foodDrag.sx, event.clientY - roleplay.foodDrag.sy) > 4) {
        roleplay.foodDrag.moved = true;
      }
      const maxX = inside ? WIDTH : RP_WIDTH;
      const maxY = inside ? HEIGHT : RP_HEIGHT;
      item.x = Math.max(RP_FOOD_SIZE / 2, Math.min(maxX - RP_FOOD_SIZE / 2, point.x - roleplay.foodDrag.ox));
      item.y = Math.max(RP_FOOD_SIZE / 2, Math.min(maxY - RP_FOOD_SIZE / 2, point.y - roleplay.foodDrag.oy));
      highlightFeedAll(event);
      return;
    }
    if (roleplay.drag) {
      const ball = marbles.find((item) => item.recordId === roleplay.drag.id);
      if (!ball) return;
      if (Math.hypot(event.clientX - roleplay.drag.sx, event.clientY - roleplay.drag.sy) > 4) {
        roleplay.drag.moved = true;
      }
      const maxX = inside ? WIDTH : RP_WIDTH;
      const maxY = inside ? HEIGHT : RP_HEIGHT;
      ball.x = Math.max(ball.radius, Math.min(maxX - ball.radius, point.x - roleplay.drag.ox));
      ball.y = Math.max(ball.radius, Math.min(maxY - ball.radius, point.y - roleplay.drag.oy));
      ball.vx = 0;
      ball.vy = 0;
      return;
    }
    if (roleplay.houseDrag) {
      const house = (roleplay.houses || []).find((item) => item.id === roleplay.houseDrag.id);
      if (!house) return;
      if (Math.hypot(event.clientX - roleplay.houseDrag.sx, event.clientY - roleplay.houseDrag.sy) > 6) {
        roleplay.houseDrag.moved = true;
      }
      house.x = Math.max(0, Math.min(RP_WIDTH - HOUSE_W, point.x - roleplay.houseDrag.ox));
      house.y = Math.max(0, Math.min(RP_HEIGHT - HOUSE_H, point.y - roleplay.houseDrag.oy));
      return;
    }
    if (roleplay.pan) {
      roleplay.camX = roleplay.pan.camX - (event.clientX - roleplay.pan.x) / roleplay.zoom;
      roleplay.camY = roleplay.pan.camY - (event.clientY - roleplay.pan.y) / roleplay.zoom;
      clampRoleplayCam();
    }
  }

  function handleRoleplayUp(event) {
    if (!roleplay) return;
    const inside = !!roleplay.inside;
    if (roleplay.foodDrag) {
      const item = (roleplay.foods || []).find((bite) => bite.id === roleplay.foodDrag.id);
      if (item) {
        if (feedAllDropTarget(event)) {
          const food = getFood(item.foodId);
          roleplay.foods = roleplay.foods.filter((bite) => bite.id !== item.id);
          feedAllMarbles(food);
        } else {
          const canvasPoint = canvasPosition(event);
          const overCanvas = canvasPoint.x >= 0 && canvasPoint.x <= WIDTH && canvasPoint.y >= 0 && canvasPoint.y <= HEIGHT;
          const fed = overCanvas ? marbleAtWorld(item.x, item.y) : null;
          if (fed) eatRoleplayFood(item, fed);
        }
      }
    } else if (roleplay.drag && roleplay.drag.moved) {
      const ball = marbles.find((item) => item.recordId === roleplay.drag.id);
      let kickedName = "";
      if (ball && inside) {
        if (marbleHitsDoor(ball)) {
          kickedName = ball.name;
          sendMarbleOutside(ball);
        }
      } else if (ball && !inside) {
        const house = houseHit(ball.x, ball.y);
        if (house) sendMarbleIntoHouse(ball, house);
      }
      if (ball) {
        const bite = foodAtWorld(ball.x, ball.y);
        if (bite) eatRoleplayFood(bite, ball);
      }
      if (inside) updateHouseChrome();
      if (kickedName) ui.status.textContent = t("marbleKicked", { name: kickedName });
    } else if (roleplay.drag && !roleplay.drag.moved) {
      renderRoleplayFaces();
    } else if (roleplay.houseDrag && !roleplay.houseDrag.moved) {
      const house = (roleplay.houses || []).find((item) => item.id === roleplay.houseDrag.id);
      if (house) enterHouse(house);
    } else if (roleplay.hotspot && Math.hypot(event.clientX - roleplay.hotspot.sx, event.clientY - roleplay.hotspot.sy) < 8) {
      if (roleplay.hotspot.id === "door") leaveHouse();
      else toggleHouseProp(roleplay.hotspot.id);
    }
    roleplay.drag = null;
    roleplay.houseDrag = null;
    roleplay.hotspot = null;
    roleplay.pan = null;
    roleplay.foodDrag = null;
    foodThumbDrag = null;
    clearFeedAllHighlight();
    saveRoleplayMarbles();
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  function handleRoleplayWheel(event) {
    if (!roleplay) return;
    event.preventDefault();
  }

  function blankFaceFrame() {
    const frame = document.createElement("canvas");
    frame.width = FACE_SIZE;
    frame.height = FACE_SIZE;
    return frame;
  }

  function cloneFaceFrame(source) {
    const copy = blankFaceFrame();
    if (source) copy.getContext("2d").drawImage(source, 0, 0);
    return copy;
  }

  function cloneCanvas(source) {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    copy.getContext("2d").drawImage(source, 0, 0);
    return copy;
  }

  function canvasFromDataUrl(src) {
    const canvas = blankFaceFrame();
    if (!src) return canvas;
    const img = new Image();
    img.onload = () => {
      canvas.getContext("2d").drawImage(img, 0, 0, FACE_SIZE, FACE_SIZE);
      if (editorIsDrink()) clipDrinkFrame(canvas);
      if (faceEditor) renderFaceEditor();
    };
    img.src = src;
    if (img.complete && img.naturalWidth) {
      canvas.getContext("2d").drawImage(img, 0, 0, FACE_SIZE, FACE_SIZE);
      if (editorIsDrink()) clipDrinkFrame(canvas);
    }
    return canvas;
  }

  function stashFoodVariantName() {
    if (!editorIsFood()) return;
    if (!Array.isArray(faceEditor.variantNames)) faceEditor.variantNames = [];
    faceEditor.variantNames[faceEditor.index] = String((ui.foodVariantName && ui.foodVariantName.value) || "").trim().slice(0, ITEM_NAME_MAX);
  }

  function showFoodVariantName() {
    if (!ui.foodVariantName) return;
    ui.foodVariantName.value = ((faceEditor && faceEditor.variantNames) || [])[faceEditor.index] || "";
  }

  function addFoodVariant() {
    if (!editorIsFood()) return;
    stampFaceSelection();
    stashFoodVariantName();
    pushFaceHistory();
    faceEditor.frames.push(cloneFaceFrame(faceEditor.frames[faceEditor.index]));
    if (editorIsDrink()) clipDrinkFrame(faceEditor.frames[faceEditor.frames.length - 1]);
    if (!Array.isArray(faceEditor.variantNames)) faceEditor.variantNames = [];
    faceEditor.variantNames.push("");
    faceEditor.index = faceEditor.frames.length - 1;
    showFoodVariantName();
    renderFaceEditor();
  }

  function deleteFoodVariant() {
    if (!editorIsFood()) return;
    if (faceEditor.frames.length <= 1) {
      if (ui.faceEditorHint) ui.faceEditorHint.textContent = t("foodNeedVariant");
      return;
    }
    stampFaceSelection();
    stashFoodVariantName();
    pushFaceHistory();
    faceEditor.frames.splice(faceEditor.index, 1);
    faceEditor.variantNames.splice(faceEditor.index, 1);
    faceEditor.index = Math.min(faceEditor.index, faceEditor.frames.length - 1);
    showFoodVariantName();
    renderFaceEditor();
  }

  function ensureFaceFrame() {
    if (!faceEditor) return null;
    if (!faceEditor.frames.length) {
      faceEditor.frames.push(blankFaceFrame());
      faceEditor.index = 0;
    }
    return faceEditor.frames[faceEditor.index];
  }

  function inkFace(ctx) {
    const color = editorIsEdible() ? faceEditor.color || (editorIsDrink() ? "#38bdf8" : "#f97316") : "#000000";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 8;
  }

  function snapshotFace() {
    const frame = faceEditor && faceEditor.frames[faceEditor.index];
    return {
      index: faceEditor.index,
      frame: frame ? cloneFaceFrame(frame) : null,
      selection: faceEditor.selection
        ? {
            x: faceEditor.selection.x,
            y: faceEditor.selection.y,
            w: faceEditor.selection.w,
            h: faceEditor.selection.h,
            canvas: cloneCanvas(faceEditor.selection.canvas)
          }
        : null
    };
  }

  function restoreFaceSnapshot(snap) {
    if (!snap || !faceEditor) return;
    faceEditor.index = snap.index;
    const frame = ensureFaceFrame();
    const draw = frame.getContext("2d");
    draw.clearRect(0, 0, FACE_SIZE, FACE_SIZE);
    if (snap.frame) draw.drawImage(snap.frame, 0, 0);
    clipCurrentDrinkFrame();
    faceEditor.selection = snap.selection
      ? {
          x: snap.selection.x,
          y: snap.selection.y,
          w: snap.selection.w,
          h: snap.selection.h,
          canvas: cloneCanvas(snap.selection.canvas)
        }
      : null;
  }

  function pushFaceHistory() {
    if (!faceEditor) return;
    faceEditor.undo.push(snapshotFace());
    if (faceEditor.undo.length > 40) faceEditor.undo.shift();
    faceEditor.redo = [];
  }

  function undoFace() {
    if (!faceEditor || !faceEditor.undo.length) return false;
    faceEditor.redo.push(snapshotFace());
    restoreFaceSnapshot(faceEditor.undo.pop());
    renderFaceEditor();
    return true;
  }

  function redoFace() {
    if (!faceEditor || !faceEditor.redo.length) return false;
    faceEditor.undo.push(snapshotFace());
    restoreFaceSnapshot(faceEditor.redo.pop());
    renderFaceEditor();
    return true;
  }

  function stampFaceSelection() {
    if (!faceEditor || !faceEditor.selection) return;
    const frame = ensureFaceFrame();
    const sel = faceEditor.selection;
    frame.getContext("2d").drawImage(sel.canvas, sel.x, sel.y, sel.w, sel.h);
    faceEditor.selection = null;
    clipCurrentDrinkFrame();
  }

  function extractFaceSelection(x, y, w, h) {
    const frame = ensureFaceFrame();
    const sx = Math.max(0, Math.round(Math.min(x, x + w)));
    const sy = Math.max(0, Math.round(Math.min(y, y + h)));
    const sw = Math.min(FACE_SIZE - sx, Math.round(Math.abs(w)));
    const sh = Math.min(FACE_SIZE - sy, Math.round(Math.abs(h)));
    if (sw < 4 || sh < 4) return;
    const piece = document.createElement("canvas");
    piece.width = sw;
    piece.height = sh;
    piece.getContext("2d").drawImage(frame, sx, sy, sw, sh, 0, 0, sw, sh);
    frame.getContext("2d").clearRect(sx, sy, sw, sh);
    faceEditor.selection = { x: sx, y: sy, w: sw, h: sh, canvas: piece };
  }

  function hitFaceSelection(point) {
    const sel = faceEditor && faceEditor.selection;
    return !!(sel && point.x >= sel.x && point.x <= sel.x + sel.w && point.y >= sel.y && point.y <= sel.y + sel.h);
  }

  function transformFaceSelection(kind) {
    const sel = faceEditor && faceEditor.selection;
    if (!sel) return false;
    pushFaceHistory();
    const src = sel.canvas;
    const angle = kind === "rotate" ? Math.PI / 12 : 0;
    const factor = kind === "grow" ? 1.2 : kind === "shrink" ? 0.8 : 1;
    let nw = Math.max(8, Math.round(src.width * factor));
    let nh = Math.max(8, Math.round(src.height * factor));
    if (kind === "rotate") {
      const c = Math.abs(Math.cos(angle));
      const s = Math.abs(Math.sin(angle));
      nw = Math.max(8, Math.round(src.width * c + src.height * s));
      nh = Math.max(8, Math.round(src.width * s + src.height * c));
    }
    const out = document.createElement("canvas");
    out.width = nw;
    out.height = nh;
    const ctx = out.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.translate(nw / 2, nh / 2);
    if (kind === "rotate") {
      ctx.rotate(angle);
      ctx.drawImage(src, -src.width / 2, -src.height / 2);
    } else {
      ctx.drawImage(src, -nw / 2, -nh / 2, nw, nh);
    }
    const cx = sel.x + sel.w / 2;
    const cy = sel.y + sel.h / 2;
    sel.canvas = out;
    sel.w = nw;
    sel.h = nh;
    sel.x = cx - nw / 2;
    sel.y = cy - nh / 2;
    renderFaceEditor();
    return true;
  }

  function syncFaceToolButtons() {
    document.querySelectorAll("[data-face-tool]").forEach((button) => {
      button.classList.toggle("active", !!faceEditor && button.getAttribute("data-face-tool") === faceEditor.tool);
    });
    if (ui.faceCanvas) {
      ui.faceCanvas.style.cursor = faceEditor && faceEditor.tool === "move" ? "move" : faceEditor && faceEditor.tool === "fill" ? "cell" : "crosshair";
    }
  }

  function setFaceTool(tool) {
    if (!faceEditor) return;
    if ((tool === "draw" || tool === "fill" || tool === "line" || tool === "square" || tool === "circle") && faceEditor.selection) {
      pushFaceHistory();
      stampFaceSelection();
    }
    faceEditor.tool = tool;
    syncFaceToolButtons();
    renderFaceEditor();
  }

  function applyFaceTransform(kind) {
    if (!faceEditor) return;
    if (kind === "move") {
      setFaceTool("move");
      return;
    }
    if (faceEditor.selection) {
      transformFaceSelection(kind);
      setFaceTool("move");
      return;
    }
    setFaceTool(kind);
  }

  function drawFaceShape(ctx, tool, a, b) {
    inkFace(ctx);
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(b.x - a.x);
    const h = Math.abs(b.y - a.y);
    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      return;
    }
    if (tool === "square") {
      ctx.strokeRect(x, y, Math.max(1, w), Math.max(1, h));
      return;
    }
    if (tool === "circle") {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function copyFaceFrame() {
    if (!faceEditor) return false;
    stampFaceSelection();
    const frame = faceEditor.frames[faceEditor.index];
    if (!frame) return false;
    faceClipboard.frame = cloneFaceFrame(frame);
    return true;
  }

  function pasteFaceFrame() {
    if (!faceEditor || !faceClipboard.frame) return false;
    pushFaceHistory();
    stampFaceSelection();
    const frame = ensureFaceFrame();
    const draw = frame.getContext("2d");
    draw.clearRect(0, 0, FACE_SIZE, FACE_SIZE);
    draw.drawImage(faceClipboard.frame, 0, 0);
    clipCurrentDrinkFrame();
    renderFaceEditor();
    return true;
  }

  function copySavedFace(id) {
    if (!getFace(id)) return false;
    faceClipboard.faceId = id;
    if (roleplay) ui.status.textContent = t("faceCopied");
    return true;
  }

  function pasteSavedFace() {
    if (!roleplay || !roleplay.selected || !faceClipboard.faceId || !getFace(faceClipboard.faceId)) return false;
    roleplay.draftFace = faceClipboard.faceId;
    applyRoleplayLook();
    ui.status.textContent = t("facePasted");
    return true;
  }

  function typingInField(target) {
    return !!(target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable));
  }

  function renderFaceEditor() {
    if (!ui.faceCanvas || !faceEditor) return;
    const faceCtx = ui.faceCanvas.getContext("2d");
    faceCtx.clearRect(0, 0, FACE_SIZE, FACE_SIZE);
    const prev = !editorIsEdible() && faceEditor.index > 0 ? faceEditor.frames[faceEditor.index - 1] : null;
    if (prev) {
      faceCtx.globalAlpha = 0.5;
      faceCtx.drawImage(prev, 0, 0);
      faceCtx.globalAlpha = 1;
    }
    const frame = faceEditor.frames[faceEditor.index];
    if (frame) faceCtx.drawImage(frame, 0, 0);
    if (faceEditor.selection) {
      const sel = faceEditor.selection;
      faceCtx.drawImage(sel.canvas, sel.x, sel.y, sel.w, sel.h);
      faceCtx.save();
      faceCtx.strokeStyle = "#fb7185";
      faceCtx.setLineDash([6, 4]);
      faceCtx.lineWidth = 2;
      faceCtx.strokeRect(sel.x, sel.y, sel.w, sel.h);
      faceCtx.restore();
    }
    if (faceEditor.preview) {
      if (faceEditor.preview.kind === "shape") {
        drawFaceShape(faceCtx, faceEditor.preview.tool, faceEditor.preview.start, faceEditor.preview.end);
      } else if (faceEditor.preview.kind === "select") {
        const a = faceEditor.preview.start;
        const b = faceEditor.preview.end;
        faceCtx.save();
        faceCtx.strokeStyle = "#38bdf8";
        faceCtx.setLineDash([5, 4]);
        faceCtx.lineWidth = 2;
        faceCtx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
        faceCtx.restore();
      }
    }
    if (editorIsDrink()) {
      faceCtx.save();
      faceCtx.fillStyle = "#0a1823";
      const mask = new Path2D();
      mask.rect(0, 0, FACE_SIZE, FACE_SIZE);
      mask.addPath(DROP_PATH);
      faceCtx.fill(mask, "evenodd");
      faceCtx.strokeStyle = "#38bdf8";
      faceCtx.lineWidth = 3;
      faceCtx.stroke(DROP_PATH);
      faceCtx.restore();
    }
    const total = faceEditor.frames.length;
    const n = total ? faceEditor.index + 1 : 0;
    if (ui.faceFrameLabel) {
      if (editorIsDrink()) {
        ui.faceFrameLabel.textContent = "";
      } else if (editorIsFood()) {
        const extra = String((faceEditor.variantNames || [])[faceEditor.index] || "").trim();
        ui.faceFrameLabel.textContent = t("foodVariant", { n, total, name: extra ? ` · ${extra}` : "" });
      } else {
        ui.faceFrameLabel.textContent = t("faceFrame", { n, total });
      }
    }
  }

  function activeScreenName() {
    return Object.keys(screens).find((key) => screens[key] && screens[key].classList.contains("active")) || "slots";
  }

  function syncFaceEditorChrome() {
    const edible = editorIsEdible();
    const drink = editorIsDrink();
    if (ui.faceEditorTitle) {
      ui.faceEditorTitle.textContent = t(drink ? "createDrink" : edible ? "createFood" : "createFace");
    }
    if (ui.faceEditorHint) {
      ui.faceEditorHint.textContent = t(drink ? "drinkEditorHint" : edible ? "foodEditorHint" : "faceEditorHint");
    }
    if (ui.foodMetaWrap) ui.foodMetaWrap.hidden = !edible;
    if (ui.faceColorWrap) ui.faceColorWrap.hidden = !edible;
    if (ui.foodVariantWrap) ui.foodVariantWrap.hidden = !editorIsFood();
    if (ui.faceFrameLabel) ui.faceFrameLabel.hidden = drink;
    if (ui.faceFrameShortcuts) ui.faceFrameShortcuts.hidden = drink;
    if (ui.foodNameLabel) ui.foodNameLabel.textContent = t(drink ? "drinkName" : "foodName");
    if (ui.foodName) ui.foodName.setAttribute("placeholder", t(drink ? "drinkNamePlaceholder" : "foodNamePlaceholder"));
    if (ui.foodVariantName) ui.foodVariantName.setAttribute("placeholder", t("foodVariantPlaceholder"));
    if (edible && ui.faceColor) ui.faceColor.value = faceEditor.color || (drink ? "#38bdf8" : "#f97316");
    if (ui.faceCanvas) ui.faceCanvas.classList.toggle("drop-canvas", drink);
    if (editorIsFood()) showFoodVariantName();
  }

  function openFaceEditor(kind) {
    const returnTo = roleplay ? "game" : activeScreenName();
    const drink = kind === "drink";
    const edible = kind === "food" || drink;
    faceEditor = {
      kind: drink ? "drink" : kind === "food" ? "food" : "face",
      color: drink ? "#38bdf8" : "#f97316",
      frames: edible ? [blankFaceFrame()] : [],
      variantNames: kind === "food" ? [""] : [],
      editId: "",
      index: 0,
      drawing: false,
      last: null,
      tool: "draw",
      undo: [],
      redo: [],
      selection: null,
      preview: null,
      drag: null,
      fromRoleplay: !!roleplay,
      returnTo
    };
    if (drink) clipDrinkFrame(faceEditor.frames[0]);
    if (ui.foodName) ui.foodName.value = "";
    if (ui.foodVariantName) ui.foodVariantName.value = "";
    syncFaceEditorChrome();
    syncFaceToolButtons();
    renderFaceEditor();
    showScreen("faceEditor");
  }

  function openFoodEditor(food) {
    openFaceEditor(food && food.kind === "drink" ? "drink" : "food");
    if (!food || !food.id) return;
    faceEditor.editId = food.id;
    const drink = food.kind === "drink";
    const frames = drink
      ? [food.drop || (!food.bottled && food.frames && food.frames[0]) || ""]
      : (food.frames && food.frames.length ? food.frames : [""]);
    faceEditor.frames = frames.map((src) => canvasFromDataUrl(src));
    faceEditor.variantNames = drink ? [] : (food.variantNames || []).slice();
    while (faceEditor.variantNames.length < faceEditor.frames.length) faceEditor.variantNames.push("");
    faceEditor.index = 0;
    if (ui.foodName) ui.foodName.value = food.name || "";
    if (!drink) showFoodVariantName();
    renderFaceEditor();
  }

  function closeFaceEditor() {
    const returnTo = faceEditor && faceEditor.returnTo;
    const backToRoleplay = !!(faceEditor && (faceEditor.fromRoleplay || returnTo === "game") && roleplay);
    if (ui.faceCanvas) ui.faceCanvas.classList.remove("drop-canvas");
    faceEditor = null;
    if (backToRoleplay) {
      showScreen("game");
      setGameChrome("roleplay");
      updateHouseChrome();
      renderRoleplayFaces();
      renderRoleplayFoods();
      return;
    }
    if (returnTo === "foodLikes") {
      renderFoodLikes();
      showScreen("foodLikes");
      return;
    }
    if (returnTo === "menu" && getSave()) {
      renderMenu();
      showScreen("menu");
      return;
    }
    renderSlots();
    showScreen("slots");
  }

  function faceNextFrame() {
    if (!faceEditor || editorIsDrink()) return;
    stampFaceSelection();
    if (editorIsFood()) {
      stashFoodVariantName();
      if (faceEditor.index < faceEditor.frames.length - 1) faceEditor.index += 1;
      showFoodVariantName();
      renderFaceEditor();
      return;
    }
    if (!faceEditor.frames.length || faceEditor.index >= faceEditor.frames.length - 1) {
      faceEditor.frames.push(blankFaceFrame());
      faceEditor.index = faceEditor.frames.length - 1;
    } else {
      faceEditor.index += 1;
    }
    renderFaceEditor();
  }

  function facePrevFrame() {
    if (!faceEditor || !faceEditor.frames.length || editorIsDrink()) return;
    stampFaceSelection();
    if (editorIsFood()) stashFoodVariantName();
    faceEditor.index = Math.max(0, faceEditor.index - 1);
    if (editorIsFood()) showFoodVariantName();
    renderFaceEditor();
  }

  function faceCanvasPoint(event) {
    const rect = ui.faceCanvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FACE_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * FACE_SIZE
    };
  }

  function faceInkHex() {
    if (!editorIsEdible()) return "#000000";
    return faceEditor.color || (editorIsDrink() ? "#38bdf8" : "#f97316");
  }

  function hexToRgba(hex) {
    let value = String(hex || "#000000").replace("#", "");
    if (value.length === 3) value = value.split("").map((part) => part + part).join("");
    const n = parseInt(value, 16) || 0;
    return [n >> 16 & 255, n >> 8 & 255, n & 255, 255];
  }

  function fillFaceAt(px, py) {
    if (!faceEditor) return;
    if (editorIsDrink() && !pointInDrop(px, py)) return;
    const frame = ensureFaceFrame();
    const draw = frame.getContext("2d");
    const width = FACE_SIZE;
    const height = FACE_SIZE;
    const x0 = Math.max(0, Math.min(width - 1, Math.floor(px)));
    const y0 = Math.max(0, Math.min(height - 1, Math.floor(py)));
    const image = draw.getImageData(0, 0, width, height);
    const pixels = image.data;
    const start = (y0 * width + x0) * 4;
    const tr = pixels[start];
    const tg = pixels[start + 1];
    const tb = pixels[start + 2];
    const ta = pixels[start + 3];
    const [fr, fg, fb, fa] = hexToRgba(faceInkHex());
    const tol = 12;
    if (Math.abs(tr - fr) <= tol && Math.abs(tg - fg) <= tol && Math.abs(tb - fb) <= tol && Math.abs(ta - fa) <= tol) {
      return;
    }
    const matches = (index) =>
      Math.abs(pixels[index] - tr) <= tol &&
      Math.abs(pixels[index + 1] - tg) <= tol &&
      Math.abs(pixels[index + 2] - tb) <= tol &&
      Math.abs(pixels[index + 3] - ta) <= tol;
    const stack = [x0, y0];
    const seen = new Uint8Array(width * height);
    seen[y0 * width + x0] = 1;
    while (stack.length) {
      const y = stack.pop();
      const x = stack.pop();
      if (editorIsDrink() && !pointInDrop(x, y)) continue;
      const index = (y * width + x) * 4;
      if (!matches(index)) continue;
      pixels[index] = fr;
      pixels[index + 1] = fg;
      pixels[index + 2] = fb;
      pixels[index + 3] = fa;
      if (x > 0 && !seen[y * width + x - 1]) {
        seen[y * width + x - 1] = 1;
        stack.push(x - 1, y);
      }
      if (x + 1 < width && !seen[y * width + x + 1]) {
        seen[y * width + x + 1] = 1;
        stack.push(x + 1, y);
      }
      if (y > 0 && !seen[(y - 1) * width + x]) {
        seen[(y - 1) * width + x] = 1;
        stack.push(x, y - 1);
      }
      if (y + 1 < height && !seen[(y + 1) * width + x]) {
        seen[(y + 1) * width + x] = 1;
        stack.push(x, y + 1);
      }
    }
    draw.putImageData(image, 0, 0);
    clipCurrentDrinkFrame();
    renderFaceEditor();
  }

  function strokeFace(from, to) {
    if (!faceEditor) return;
    const frame = ensureFaceFrame();
    const draw = frame.getContext("2d");
    withDrinkClip(draw, () => {
      inkFace(draw);
      draw.beginPath();
      draw.arc(to.x, to.y, 4, 0, Math.PI * 2);
      draw.fill();
      if (from.x !== to.x || from.y !== to.y) {
        draw.beginPath();
        draw.moveTo(from.x, from.y);
        draw.lineTo(to.x, to.y);
        draw.stroke();
      }
    });
    clipCurrentDrinkFrame();
    renderFaceEditor();
  }

  function handleFacePointerDown(event) {
    if (!faceEditor || !ui.faceCanvas) return;
    event.preventDefault();
    const point = faceCanvasPoint(event);
    const tool = faceEditor.tool;
    if (editorIsDrink() && !pointInDrop(point.x, point.y) && (tool === "draw" || tool === "fill" || tool === "line" || tool === "square" || tool === "circle")) {
      return;
    }
    faceEditor.drawing = true;
    faceEditor.last = point;
    faceEditor.drag = null;
    faceEditor.preview = null;
    if (tool === "draw") {
      pushFaceHistory();
      strokeFace(point, point);
    } else if (tool === "fill") {
      if (faceEditor.selection) {
        pushFaceHistory();
        stampFaceSelection();
      } else {
        pushFaceHistory();
      }
      fillFaceAt(point.x, point.y);
      faceEditor.drawing = false;
    } else if (tool === "line" || tool === "square" || tool === "circle") {
      if (faceEditor.selection) {
        pushFaceHistory();
        stampFaceSelection();
      }
      faceEditor.preview = { kind: "shape", tool, start: point, end: point };
    } else if (tool === "move" && hitFaceSelection(point)) {
      pushFaceHistory();
      faceEditor.drag = { ox: point.x - faceEditor.selection.x, oy: point.y - faceEditor.selection.y };
    } else if (tool === "move" || tool === "grow" || tool === "shrink" || tool === "rotate") {
      if (faceEditor.selection) {
        pushFaceHistory();
        stampFaceSelection();
      }
      faceEditor.preview = { kind: "select", start: point, end: point };
    }
    ui.faceCanvas.setPointerCapture(event.pointerId);
  }

  function handleFacePointerMove(event) {
    if (!faceEditor || !faceEditor.drawing) return;
    const point = faceCanvasPoint(event);
    if (faceEditor.drag && faceEditor.selection) {
      faceEditor.selection.x = point.x - faceEditor.drag.ox;
      faceEditor.selection.y = point.y - faceEditor.drag.oy;
      renderFaceEditor();
      return;
    }
    if (faceEditor.preview) {
      faceEditor.preview.end = point;
      renderFaceEditor();
      return;
    }
    if (faceEditor.tool === "draw") {
      strokeFace(faceEditor.last || point, point);
      faceEditor.last = point;
    }
  }

  function handleFacePointerUp(event) {
    if (!faceEditor) return;
    if (faceEditor.preview && faceEditor.preview.kind === "shape") {
      pushFaceHistory();
      const frame = ensureFaceFrame();
      withDrinkClip(frame.getContext("2d"), () => {
        drawFaceShape(frame.getContext("2d"), faceEditor.preview.tool, faceEditor.preview.start, faceEditor.preview.end);
      });
      clipCurrentDrinkFrame();
    } else if (faceEditor.preview && faceEditor.preview.kind === "select") {
      const a = faceEditor.preview.start;
      const b = faceEditor.preview.end;
      pushFaceHistory();
      extractFaceSelection(a.x, a.y, b.x - a.x, b.y - a.y);
      const tool = faceEditor.tool;
      if (faceEditor.selection && (tool === "grow" || tool === "shrink" || tool === "rotate")) {
        transformFaceSelection(tool);
        setFaceTool("move");
      }
    }
    faceEditor.drawing = false;
    faceEditor.last = null;
    faceEditor.preview = null;
    faceEditor.drag = null;
    renderFaceEditor();
    if (ui.faceCanvas && ui.faceCanvas.hasPointerCapture(event.pointerId)) {
      ui.faceCanvas.releasePointerCapture(event.pointerId);
    }
  }

  function saveCustomFace() {
    if (!faceEditor) return;
    stampFaceSelection();
    const edible = editorIsEdible();
    const drink = editorIsDrink();
    if (drink) faceEditor.frames.forEach(clipDrinkFrame);
    const frames = faceEditor.frames.map((frame) => frame.toDataURL("image/png"));
    if (edible) {
      const name = String((ui.foodName && ui.foodName.value) || "").trim().slice(0, ITEM_NAME_MAX);
      if (!name) {
        if (ui.faceEditorHint) ui.faceEditorHint.textContent = t(drink ? "drinkNeedName" : "foodNeedName");
        if (ui.foodName) ui.foodName.focus();
        return;
      }
      if (!Array.isArray(data.foods)) data.foods = [];
      if (!drink) stashFoodVariantName();
      const dropUrl = drink && faceEditor.frames[0] ? faceEditor.frames[0].toDataURL("image/png") : "";
      const savedFrames = drink
        ? [composeDrinkBottle(faceEditor.frames[0]).toDataURL("image/png")]
        : faceEditor.frames.map((frame) => frame.toDataURL("image/png"));
      const variantNames = drink ? [] : (faceEditor.variantNames || []).slice(0, savedFrames.length);
      while (variantNames.length < savedFrames.length) variantNames.push("");
      const payload = {
        id: faceEditor.editId || makeId(drink ? "drink" : "food"),
        kind: drink ? "drink" : "food",
        name,
        frames: savedFrames,
        variantNames,
        drop: drink ? dropUrl : "",
        bottled: !!drink,
        ai: false
      };
      const existing = data.foods.findIndex((item) => item.id === payload.id);
      if (existing >= 0) data.foods[existing] = payload;
      else data.foods.push(payload);
      [...faceImageCache.keys()].forEach((key) => {
        if (key.startsWith(`${payload.id}:`)) faceImageCache.delete(key);
      });
    } else {
      if (!Array.isArray(data.faces)) data.faces = [];
      data.faces.push({
        id: makeId("face"),
        name: `${t("createFace")} ${data.faces.length + 1}`,
        frames
      });
    }
    persist();
    const fromRoleplay = faceEditor.fromRoleplay;
    closeFaceEditor();
    if (fromRoleplay && roleplay) {
      ui.status.textContent = t(drink ? "drinkSaved" : edible ? "foodSaved" : "faceSaved");
    }
  }

  function miniText(pack) {
    if (!pack) return "";
    const lang = typeof GameI18n.getLang === "function" ? GameI18n.getLang() : "es";
    return pack[lang] || pack.es || pack.en || "";
  }

  function customMiniDef(item) {
    return {
      id: item.id,
      icon: "🛠",
      kind: "custom",
      hue: 40,
      duration: 0,
      click: "dash",
      title: { es: item.name, en: item.name, fr: item.name, de: item.name, pt: item.name, it: item.name },
      hint: { es: t("customMiniHint"), en: t("customMiniHint") },
      custom: item
    };
  }

  function allMinigames() {
    return MINIGAME_DEFS.concat((data.customMinigames || []).map(customMiniDef));
  }

  function minigameDef(id) {
    return allMinigames().find((item) => item.id === id) || MINIGAME_DEFS[0];
  }

  function layoutMinigameMarbles(alive, place) {
    return alive.map((item, index) => {
      const pos = place(index, alive.length);
      return {
        recordId: item.id,
        name: item.name,
        color: item.color,
        x: pos.x,
        y: pos.y,
        vx: pos.vx || 0,
        vy: pos.vy || 0,
        radius: RADIUS,
        state: "active",
        score: 0,
        grounded: false,
        gender: normalizeGender(item.gender)
      };
    });
  }

  function clampMarble(ball, padding) {
    const pad = padding == null ? ball.radius : padding;
    if (ball.x < pad) {
      ball.x = pad;
      ball.vx = Math.abs(ball.vx) * 0.55;
    }
    if (ball.x > WIDTH - pad) {
      ball.x = WIDTH - pad;
      ball.vx = -Math.abs(ball.vx) * 0.55;
    }
    if (ball.y < pad) {
      ball.y = pad;
      ball.vy = Math.abs(ball.vy) * 0.45;
    }
    if (ball.y > HEIGHT - pad) {
      ball.y = HEIGHT - pad;
      ball.vy = -Math.abs(ball.vy) * 0.4;
    }
  }

  function nearestActiveMarble(point, maxDist) {
    let best = null;
    let bestDist = maxDist;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const dist = Math.hypot(ball.x - point.x, ball.y - point.y);
      if (dist < bestDist) {
        best = ball;
        bestDist = dist;
      }
    });
    return best;
  }

  function filteredMinigames() {
    const query = miniQuery.trim().toLowerCase();
    const list = allMinigames();
    if (!query) return list;
    return list.filter((game) => {
      const title = miniText(game.title).toLowerCase();
      const hint = miniText(game.hint).toLowerCase();
      return title.includes(query) || hint.includes(query) || game.kind.includes(query);
    });
  }

  function renderMinigamePicker() {
    if (!ui.minigameList) return;
    const catalog = document.getElementById("minigameCatalogHint");
    if (catalog) {
      const ticket = getSave() && getSave().vipTicket;
      const base = `${t("minigamesHint")} ${t("miniCatalog", { n: allMinigames().length })}`;
      catalog.textContent = ticket
        ? `${base} ${t("miniMovieHeld", { team: ticket.teamName })}`
        : base;
    }
    const filtered = filteredMinigames();
    const pages = Math.max(1, Math.ceil(filtered.length / MINI_PAGE_SIZE));
    if (miniPage >= pages) miniPage = pages - 1;
    if (miniPage < 0) miniPage = 0;
    const start = miniPage * MINI_PAGE_SIZE;
    const slice = filtered.slice(start, start + MINI_PAGE_SIZE);
    ui.minigameList.innerHTML = "";
    slice.forEach((game) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "minigame-choice";
      button.innerHTML = `<span class="mini-icon">${game.icon}</span><strong>${escapeHtml(miniText(game.title))}</strong><span>${escapeHtml(miniText(game.hint))}</span>`;
      button.addEventListener("click", () => requestMinigame(game.id));
      ui.minigameList.appendChild(button);
    });
    const pageInfo = document.getElementById("minigamePageInfo");
    if (pageInfo) {
      pageInfo.textContent = t("miniPage", {
        page: miniPage + 1,
        pages,
        shown: slice.length,
        n: filtered.length
      });
    }
    const prev = document.getElementById("minigamePrev");
    const next = document.getElementById("minigameNext");
    if (prev) prev.disabled = miniPage <= 0;
    if (next) next.disabled = miniPage >= pages - 1;
  }

  function setMinigamePickerStep(step) {
    const modes = step === "food";
    if (ui.minigameBrowse) ui.minigameBrowse.hidden = modes;
    if (ui.minigameCloseRow) ui.minigameCloseRow.hidden = modes;
    if (ui.foodFeastMode) ui.foodFeastMode.hidden = !modes;
  }

  function openMinigamePicker() {
    const save = getSave();
    if (!aliveMarbles(save).length) return;
    miniQuery = "";
    miniPage = 0;
    pendingFoodFeastId = "";
    const search = document.getElementById("minigameSearch");
    if (search) search.value = "";
    setMinigamePickerStep("browse");
    renderMinigamePicker();
    ui.minigameModal.hidden = false;
    search?.focus();
  }

  function playRandomMinigame() {
    const save = getSave();
    const alive = aliveMarbles(save);
    const pool = filteredMinigames().filter((game) => {
      if ((game.kind === "splitlove" || game.kind === "lockpair") && !splitLoveHasGenders(alive)) return false;
      return true;
    });
    if (!pool.length) return;
    requestMinigame(pool[Math.floor(Math.random() * pool.length)].id);
  }

  function closeMinigamePicker() {
    pendingFoodFeastId = "";
    setMinigamePickerStep("browse");
    if (ui.minigameModal) ui.minigameModal.hidden = true;
  }

  function requestMinigame(id) {
    const def = minigameDef(id);
    if (def.kind === "foodfeast") {
      pendingFoodFeastId = id;
      setMinigamePickerStep("food");
      if (ui.minigameModal) ui.minigameModal.hidden = false;
      return;
    }
    startMinigame(id);
  }

  function startMinigame(id, options) {
    const save = getSave();
    const alive = aliveMarbles(save);
    if (!alive.length) return;
    const def = minigameDef(id);
    let players = alive;
    let rewardName = "";
    const ticket = save.vipTicket;
    if (ticket && Array.isArray(ticket.members) && ticket.members.length) {
      const ids = new Set(ticket.members.map((item) => item.id).filter(Boolean));
      const names = new Set(ticket.members.map((item) => String(item.name || "").toLowerCase()).filter(Boolean));
      const byId = alive.filter((item) => ids.has(item.id));
      players = byId.length ? byId : alive.filter((item) => names.has(String(item.name || "").toLowerCase()));
      if (!players.length) {
        const msg = t("miniMovieNeed");
        if (ui.status) ui.status.textContent = msg;
        const catalog = document.getElementById("minigameCatalogHint");
        if (catalog) catalog.textContent = msg;
        return;
      }
      rewardName = ticket.teamName || "";
    }
    if ((def.kind === "splitlove" || def.kind === "lockpair") && !splitLoveHasGenders(players)) {
      const msg = t("miniSplitNeedGenders");
      if (ui.status) ui.status.textContent = msg;
      const catalog = document.getElementById("minigameCatalogHint");
      if (catalog) catalog.textContent = msg;
      return;
    }
    if (def.kind === "custom") {
      const sac = firstScript((def.custom && def.custom.parts) || [], "sacrifice");
      if (sac && sac.who === "one" && players.length < 2) {
        if (ui.status) ui.status.textContent = t("scriptSacrificeNeedTwo");
        return;
      }
    }
    minigame = {
      id: def.id,
      kind: def.kind,
      playing: true,
      ended: false,
      elapsed: 0,
      duration: def.kind === "custom" || def.duration === 0 ? 0 : (def.duration || 20),
      hue: def.hue || 200,
      def,
      foodLimited: def.kind === "foodfeast" ? !!(options && options.foodLimited) : false,
      items: [],
      platforms: [],
      walls: [],
      tiles: [],
      extras: {},
      spawn: 0,
      arenaR: 230
    };
    particles = [];
    currentMap = null;
    playing = false;
    setupMinigameWorld(def, players);
    if ((def.kind === "foodfeast" || def.kind === "custom") && !marbles.length) {
      minigame = null;
      setGameChrome("campaign");
      ui.status.textContent = t("miniFoodNoLikers");
      if (ui.minigameModal) ui.minigameModal.hidden = false;
      return;
    }
    if (rewardName && save.vipTicket) {
      save.vipTicket = null;
      save.vipDecisive = false;
      persist();
    }
    closeMinigamePicker();
    ui.modal.hidden = true;
    setGameChrome("mini");
    const foodName = def.kind === "foodfeast" && minigame.extras.food ? minigame.extras.food.name : "";
    const modeLabel = def.kind === "foodfeast" ? ` · ${t(minigame.foodLimited ? "miniFoodLimited" : "miniFoodUnlimited")}` : "";
    ui.levelTitle.textContent = foodName
      ? `${def.icon} ${miniText(def.title)} · ${foodName}${modeLabel}${rewardName ? " · " + rewardName : ""}`
      : `${def.icon} ${miniText(def.title)}${rewardName ? " · " + rewardName : ""}`;
    if (ui.minigameHint) {
      const hint = def.kind === "foodfeast"
        ? t(minigame.foodLimited ? "miniFoodHintLimited" : "miniFoodHintUnlimited", {
          food: foodName || edibleDefaultName(minigame.extras && minigame.extras.food),
          n: FOOD_FEAST_GOAL
        })
        : miniText(def.hint);
      const extra = def.kind === "foodfeast" && minigame.extras.aiFood
        ? ` ${t("miniFoodMade", { food: foodName })}`
        : def.kind === "foodfeast" && minigame.extras.userMade
          ? ` ${t("miniFoodLikersOnly", { food: foodName, n: marbles.length })}`
          : "";
      const rewardNote = rewardName ? ` ${t("miniTeamRewardPlaying", { team: rewardName })}` : "";
      ui.minigameHint.textContent = `${hint}${extra}${rewardNote} ${t("miniNoPenalty")}`;
    }
    updateMinigameStatus();
    showScreen("game");
    lastTime = performance.now();
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(loop);
  }

  function spreadFloor(index, total, y) {
    const cols = Math.max(1, Math.min(total, 12));
    return { x: 70 + (index % cols) * (860 / cols), y: y == null ? 508 : y };
  }

  function spreadGrid(index) {
    return { x: 80 + (index % 8) * 110, y: 90 + Math.floor(index / 8) * 70, vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.4 };
  }

  function spreadCircle(index, total, radius) {
    const angle = (index / Math.max(1, total)) * Math.PI * 2;
    const ring = radius || 70;
    return {
      x: 500 + Math.cos(angle) * ring,
      y: 300 + Math.sin(angle) * ring,
      vx: Math.cos(angle + 1.1) * 1.3,
      vy: Math.sin(angle + 1.1) * 1.3
    };
  }

  function setupMinigameWorld(def, alive) {
    const kind = def.kind;
    if (kind === "custom") {
      setupCustomMinigame(def, alive);
      return;
    }
    if (kind === "combo") {
      setupComboWorld(def, alive);
      return;
    }
    if (kind === "race") {
      marbles = layoutMinigameMarbles(alive, (index, total) => ({
        x: 48 + (index % 3) * 28,
        y: 430 - Math.floor(index / 3) * 32,
        vx: 1.1
      }));
    } else if (kind === "collectFloor" || kind === "collectSide" || kind === "collectRise" || kind === "ice" || kind === "hoops" || kind === "king" || kind === "belts" || kind === "flipgrav" || kind === "snow" || kind === "hooks") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadFloor(index, total, kind === "king" || kind === "belts" ? 220 : 508));
    } else if (kind === "arena" || kind === "sumo" || kind === "tornado" || kind === "blackhole" || kind === "pinball") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadCircle(index, total, kind === "pinball" ? 160 : 70));
    } else if (kind === "soccer" || kind === "volley") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadFloor(index, total, 420));
      minigame.extras.ball = { x: 500, y: 240, vx: 2.2, vy: 0, r: 18 };
    } else if (kind === "maze") {
      marbles = layoutMinigameMarbles(alive, (index) => ({ x: 60 + (index % 4) * 28, y: 80 + Math.floor(index / 4) * 32 }));
      minigame.walls = [
        { x: 180, y: 20, w: 18, h: 430 },
        { x: 360, y: 150, w: 18, h: 430 },
        { x: 540, y: 20, w: 18, h: 430 },
        { x: 720, y: 150, w: 18, h: 430 },
        { x: 180, y: 20, w: 160, h: 18 },
        { x: 540, y: 432, w: 160, h: 18 }
      ];
      minigame.extras.goal = { x: 900, y: 250, w: 70, h: 90 };
    } else if (kind === "paint") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
      const cols = 16;
      const rows = 10;
      minigame.tiles = Array.from({ length: cols * rows }, (_, i) => ({
        x: (i % cols) * (WIDTH / cols),
        y: Math.floor(i / cols) * (HEIGHT / rows),
        w: WIDTH / cols,
        h: HEIGHT / rows,
        owner: ""
      }));
    } else if (kind === "relay") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadFloor(index, total, 300));
      minigame.items = [180, 400, 620, 840].map((x, index) => ({ kind: "flag", x, y: 180 + (index % 2) * 220, r: 18, n: index + 1 }));
      marbles.forEach((ball) => {
        ball.next = 1;
      });
    } else if (kind === "mosaic") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
      minigame.extras.zones = [
        { x: 0, y: 0, w: 500, h: 300, color: "rgba(85,214,255,0.18)" },
        { x: 500, y: 0, w: 500, h: 300, color: "rgba(255,107,53,0.18)" },
        { x: 0, y: 300, w: 500, h: 300, color: "rgba(192,132,252,0.18)" },
        { x: 500, y: 300, w: 500, h: 300, color: "rgba(74,222,128,0.18)" }
      ];
      marbles.forEach((ball, index) => {
        ball.zone = index % 4;
      });
    } else if (kind === "portals") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
      minigame.extras.portals = [
        { x: 140, y: 160, r: 28, color: "#60a5fa" },
        { x: 860, y: 440, r: 28, color: "#f472b6" }
      ];
    } else if (kind === "ghost") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
      minigame.extras.ghost = { x: 500, y: 40, vx: 0, vy: 0 };
    } else if (kind === "potato") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadCircle(index, total, 120));
      minigame.extras.holder = marbles[0] ? marbles[0].recordId : "";
    } else if (kind === "flash") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadCircle(index, total, 140));
      minigame.extras.flashId = marbles[0] ? marbles[0].recordId : "";
      minigame.extras.flashIn = 0;
    } else if (kind === "rhythm") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadCircle(index, total, 150));
      minigame.extras.ring = 90;
    } else if (kind === "targets") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadFloor(index, total, 500));
      minigame.items = Array.from({ length: 4 }, (_, i) => ({ kind: "target", x: 200 + i * 180, y: 90, r: 22, vx: 1.6 + i * 0.3 }));
    } else if (kind === "laser") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
      minigame.extras.laserY = 80;
      minigame.extras.laserDir = 1;
    } else if (kind === "foodfeast") {
      const picked = pickMinigameFood();
      const food = picked && picked.food;
      minigame.extras.food = food;
      minigame.extras.userMade = !!(picked && picked.userMade);
      minigame.extras.aiFood = !minigame.extras.userMade;
      let players = alive;
      if (minigame.extras.userMade && food) {
        ensureEveryoneTriedFood(food);
        players = livingFoodLikers(food);
      }
      marbles = layoutMinigameMarbles(players, (index, total) => spreadGrid(index, total));
      while (minigame.items.length < FOOD_FEAST_FIELD) spawnFoodBite();
    } else if (kind === "splitlove") {
      setupSplitLove(alive);
    } else if (kind === "lockpair") {
      setupLockPair(alive);
    } else if (kind === "boxescape") {
      setupBoxEscape(alive);
    } else if (kind === "teamspike") {
      setupTeamSpike(alive);
    } else {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
    }
    if (kind === "pinball") {
      minigame.items = [
        { x: 280, y: 180, r: 26 },
        { x: 720, y: 180, r: 26 },
        { x: 500, y: 320, r: 34 },
        { x: 340, y: 430, r: 22 },
        { x: 660, y: 430, r: 22 }
      ];
    }
    if (kind === "king") {
      minigame.platforms = [{ x: 360, y: 280, w: 280, h: 18, base: 360 }];
    }
    if (kind === "belts") {
      minigame.platforms = [
        { x: 40, y: 260, w: 280, h: 16, dir: 1 },
        { x: 360, y: 340, w: 280, h: 16, dir: -1 },
        { x: 680, y: 260, w: 280, h: 16, dir: 1 },
        { x: 200, y: 460, w: 280, h: 16, dir: -1 },
        { x: 560, y: 500, w: 280, h: 16, dir: 1 }
      ];
    }
    if (def.staticItems) {
      minigame.items = Array.from({ length: 10 }, () => ({
        kind: def.item || "orb",
        x: 70 + Math.random() * 860,
        y: 70 + Math.random() * 460,
        r: 12,
        pulse: Math.random() * 6
      }));
    }
    if (kind === "tornado" || kind === "blackhole") {
      minigame.items = Array.from({ length: 8 }, () => ({
        kind: "gem",
        x: 80 + Math.random() * 840,
        y: 80 + Math.random() * 440,
        r: 10,
        pulse: 0
      }));
    }
  }

  function updateMinigameStatus() {
    if (!minigame) return;
    if (minigame.kind === "foodfeast") {
      if (minigame.extras.goneName && minigame.elapsed < (minigame.extras.goneUntil || 0)) {
        ui.status.textContent = t("miniFoodGone", { name: minigame.extras.goneName, n: FOOD_FEAST_GOAL });
        return;
      }
      const food = minigame.extras.food;
      const leader = marbles.slice().sort((a, b) => (b.score || 0) - (a.score || 0))[0];
      const key = minigame.foodLimited ? "miniFoodStatus" : "miniFoodStatusUnlimited";
      ui.status.textContent = t(key, {
        food: (food && food.name) || edibleDefaultName(food),
        name: leader ? leader.name : "—",
        n: leader ? Math.round(leader.score || 0) : 0,
        goal: FOOD_FEAST_GOAL
      });
      return;
    }
    if (minigame.kind === "splitlove") {
      const extras = minigame.extras || {};
      const rooms = extras.rooms || [];
      if (extras.noMorePairs) {
        ui.status.textContent = t("miniSplitNoMore", { n: rooms.length });
        return;
      }
      ui.status.textContent = t("miniSplitStatus", { n: rooms.length });
      return;
    }
    if (minigame.kind === "lockpair") {
      const extras = minigame.extras || {};
      ui.status.textContent = t("miniLockStatus", {
        boy: extras.boyName || "—",
        girl: extras.girlName || "—"
      });
      return;
    }
    if (minigame.kind === "boxescape") {
      const extras = minigame.extras || {};
      const inside = marbles.filter((ball) => ball.state === "active" && !ball.escaped).length;
      ui.status.textContent = extras.lastName
        ? t("miniBoxLast", { name: extras.lastName, n: extras.out || 0 })
        : t("miniBoxStatus", { n: inside });
      return;
    }
    if (minigame.kind === "teamspike") {
      updateTeamSpikeStatus();
      return;
    }
    ui.status.textContent = t("miniStatus");
  }

  function grantSpeedBoost() {
    const save = getSave();
    if (!save || save.speedBoostUsed || save.speedBoostPending) return false;
    save.speedBoostPending = true;
    persist();
    return true;
  }

  function finishMinigame() {
    if (!minigame || minigame.ended) return;
    minigame.playing = false;
    minigame.ended = true;
    showMinigameModal();
  }

  function rankMinigame() {
    if (minigame && minigame.kind === "teamspike") {
      const winnerId = minigame.extras && minigame.extras.winnerId;
      const ranked = marbles.slice().sort((a, b) => (b.phase === "circle" ? 1 : 0) - (a.phase === "circle" ? 1 : 0));
      const winners = winnerId ? ranked.filter((ball) => ball.recordId === winnerId) : [];
      return { ranked, winners, topScore: winners.length };
    }
    if (minigame && minigame.kind === "boxescape") {
      const ranked = marbles.slice().sort((a, b) => (b.exitOrder || 0) - (a.exitOrder || 0));
      const lastId = minigame.extras && minigame.extras.lastId;
      const winners = lastId
        ? ranked.filter((ball) => ball.recordId === lastId)
        : ranked.slice(0, 1);
      return { ranked, winners, topScore: winners[0] ? winners[0].exitOrder || 0 : 0 };
    }
    const ranked = marbles.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    const topScore = ranked[0] ? ranked[0].score || 0 : 0;
    const winners = ranked.filter((ball) => (ball.score || 0) === topScore && topScore > 0);
    return { ranked, winners, topScore };
  }

  function showMinigameModal() {
    const { ranked, winners } = rankMinigame();
    const names = (winners.length ? winners : ranked.slice(0, 1)).map((ball) => ball.name).join(", ");
    const title = winners.length > 1 ? t("miniTie", { names }) : t("miniWinner", { name: names });
    const lines = ranked
      .slice(0, 6)
      .map((ball, index) => `${index + 1}. ${ball.name} · ${Math.round(ball.score || 0)}`)
      .join(" · ");
    ui.modalIcon.textContent = "🎮";
    ui.modalTitle.textContent = `${t("miniResultTitle")} · ${title}`;
    const granted = winners.length > 0 && grantSpeedBoost();
    const boxNote = minigame.kind === "boxescape" && minigame.extras.lastName
      ? ` ${t("miniBoxSkip", { name: minigame.extras.lastName })}`
      : "";
    const teamExtras = minigame.kind === "teamspike" ? minigame.extras : null;
    const teamNote = teamExtras && teamExtras.winnerName
      ? ` ${teamExtras.ticketGranted
        ? t("miniTeamVipWin", { name: teamExtras.winnerName, team: teamExtras.teamName })
        : t("miniTeamVipHeld", { name: teamExtras.winnerName, holder: teamExtras.heldName || teamExtras.teamName })}`
      : "";
    ui.modalText.textContent = `${lines}. ${t("miniNoPenalty")}${granted ? ` ${t("miniSpeedBoost")}` : ""}${boxNote}${teamNote}`;
    ui.nextRound.hidden = true;
    if (ui.modalRejoin) ui.modalRejoin.hidden = true;
    ui.modal.hidden = false;
  }

  function spawnCollectible() {
    const def = minigame.def;
    const dir = def.itemDir || "down";
    const item = {
      kind: def.item || "orb",
      x: 40 + Math.random() * 920,
      y: dir === "up" ? HEIGHT + 12 : dir === "side" ? 40 + Math.random() * 480 : -16,
      r: def.item === "balloon" ? 14 : 10,
      vx: dir === "side" ? (Math.random() < 0.5 ? -2.4 : 2.4) : 0,
      vy: dir === "up" ? -(2.1 + Math.random() * 1.6) : dir === "side" ? 0 : 2.1 + Math.random() * 1.8,
      pulse: Math.random() * 6
    };
    if (dir === "side") item.x = item.vx < 0 ? WIDTH + 12 : -12;
    minigame.items.push(item);
  }

  function spawnHazard() {
    const thin = minigame.def.thin;
    const slow = minigame.def.slow;
    minigame.items.push({
      kind: "hazard",
      x: 30 + Math.random() * 940,
      y: -20,
      r: thin ? 7 : slow ? 18 : 14,
      vy: slow ? 1.6 + Math.random() : thin ? 3.2 + Math.random() : 2.6 + Math.random() * 1.6
    });
  }

  function collectItem(ball, item) {
    return Math.hypot(ball.x - item.x, ball.y - item.y) < ball.radius + (item.r || 10);
  }

  function itemColor(kind) {
    if (kind === "star") return "#ffe566";
    if (kind === "coin") return "#fbbf24";
    if (kind === "gem") return "#c084fc";
    if (kind === "balloon") return "#fb7185";
    if (kind === "bubble") return "#7dd3fc";
    if (kind === "leaf") return "#86efac";
    return "#7af0ff";
  }

  function takeItems(ball) {
    minigame.items = minigame.items.filter((item) => {
      if (item.kind === "hazard" || item.kind === "target" || item.kind === "flag") return true;
      if (!collectItem(ball, item)) return true;
      ball.score += 1;
      addParticles(item.x, item.y, itemColor(item.kind), 10);
      return false;
    });
  }

  function dashToward(ball, point, speed, invert) {
    const dx = invert ? ball.x - point.x : point.x - ball.x;
    const dy = invert ? ball.y - point.y : point.y - ball.y;
    const dist = Math.max(12, Math.hypot(dx, dy));
    ball.vx = (dx / dist) * speed;
    ball.vy = (dy / dist) * speed;
  }

  function resolveWorldBlocks(ball, prevX, prevY, blocks) {
    blocks.forEach((block) => {
      const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.w));
      const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.h));
      if ((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2 >= ball.radius * ball.radius) return;
      if (prevY + ball.radius <= block.y + 3 && ball.vy >= 0) {
        ball.y = block.y - ball.radius;
        ball.vy = 0.12;
        ball.grounded = true;
        if (block.dir) ball.vx += block.dir * 0.12;
      } else {
        ball.x = prevX;
        ball.vx *= -0.45;
      }
    });
  }

  function lastStandingCheck() {
    const alive = marbles.filter((ball) => ball.state === "active");
    if (!alive.length || (marbles.length > 1 && alive.length === 1 && minigame.elapsed > 2.4)) {
      alive.forEach((ball) => {
        ball.score = Math.max(ball.score, minigame.elapsed + 2);
      });
      finishMinigame();
    }
  }

  function updateMinigame(step) {
    minigame.elapsed += step / 60;
    updateMinigameStatus();
    const kind = minigame.kind;
    if (kind === "race") updateRace(step);
    else if (kind === "collectFloor") updateCollectFloor(step);
    else if (kind === "collectSide") updateCollectSide(step);
    else if (kind === "collectRise") updateCollectRise(step);
    else if (kind === "collectFloat") updateCollectFloat(step);
    else if (kind === "magnet") updateMagnet(step);
    else if (kind === "bubbles") updateBubbles(step);
    else if (kind === "mirror") updateMirror(step);
    else if (kind === "arena") updateArena(step);
    else if (kind === "sumo") updateSumo(step);
    else if (kind === "dodgeFall") updateDodgeFall(step);
    else if (kind === "snow") updateSnow(step);
    else if (kind === "hooks") updateHooks(step);
    else if (kind === "combo") updateCombo(step);
    else if (kind === "paint") updatePaint(step);
    else if (kind === "king") updateKing(step);
    else if (kind === "pinball") updatePinball(step);
    else if (kind === "soccer") updateSoccer(step);
    else if (kind === "ice") updateIce(step);
    else if (kind === "laser") updateLaser(step);
    else if (kind === "flash") updateFlash(step);
    else if (kind === "belts") updateBelts(step);
    else if (kind === "blackhole") updateBlackhole(step);
    else if (kind === "volley") updateVolley(step);
    else if (kind === "maze") updateMaze(step);
    else if (kind === "potato") updatePotato(step);
    else if (kind === "flipgrav") updateFlipgrav(step);
    else if (kind === "targets") updateTargets(step);
    else if (kind === "portals") updatePortals(step);
    else if (kind === "rhythm") updateRhythm(step);
    else if (kind === "tornado") updateTornado(step);
    else if (kind === "relay") updateRelay(step);
    else if (kind === "ghost") updateGhost(step);
    else if (kind === "mosaic") updateMosaic(step);
    else if (kind === "hoops") updateHoops(step);
    else if (kind === "foodfeast") updateFoodFeast(step);
    else if (kind === "splitlove") updateSplitLove(step);
    else if (kind === "lockpair") updateLockPair(step);
    else if (kind === "boxescape") updateBoxEscape(step);
    else if (kind === "teamspike") updateTeamSpike(step);
    else if (kind === "custom") updateCustomMinigame(step);
  }

  function firstScript(parts, type) {
    const part = (parts || []).find((item) => item && item.type === type);
    return part ? normalizeScriptCfg(type, part.script) : null;
  }

  function customScriptBag(parts) {
    const bag = {};
    SCRIPT_TYPES.forEach((type) => {
      const cfg = firstScript(parts, type);
      if (cfg) bag[type] = cfg;
    });
    return bag;
  }

  function countCustomItems(kind) {
    return ((minigame && minigame.items) || []).filter((item) => item.kind === kind).length;
  }

  function spawnCustomFoodBite() {
    const foods = (minigame.extras && minigame.extras.foods) || [];
    const food = foods[Math.floor(Math.random() * Math.max(1, foods.length))] || minigame.extras.food;
    minigame.items.push({
      kind: "foodbite",
      foodId: food && food.id,
      variant: randomFoodVariant(food),
      x: 48 + Math.random() * 904,
      y: 48 + Math.random() * 504,
      r: 16,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      pulse: Math.random() * 6
    });
  }

  function spawnCustomPoint() {
    const cfg = minigame.extras.pointCfg || defaultScriptCfg("points");
    minigame.items.push({
      kind: "star",
      x: 40 + Math.random() * 920,
      y: -16 - Math.random() * 40,
      r: 9,
      vx: 0,
      vy: cfg.speed,
      color: `rgb(${cfg.r},${cfg.g},${cfg.b})`,
      pulse: Math.random() * 6
    });
  }

  function fillCustomScriptField(kind, want, spawn) {
    let guard = 0;
    while (countCustomItems(kind) < want && guard < 80) {
      spawn();
      guard += 1;
    }
  }

  function pickScriptFoods(count) {
    const user = userCreatedFoods();
    if (user.length) {
      return shuffleList(user).slice(0, Math.max(1, Math.min(user.length, count)));
    }
    const picked = pickMinigameFood();
    return picked && picked.food ? [picked.food] : [];
  }

  function marbleLikesAllFoods(record, foods) {
    return foods.every((food) => marbleLikedTriedFood(record, food));
  }

  function setupCustomMinigame(def, alive) {
    const parts = ((def.custom && def.custom.parts) || []).map(normalizeLevelPart).filter(Boolean);
    const scripts = customScriptBag(parts);
    minigame.platforms = parts.filter((part) => part.type === "platform" || part.type === "conveyor" || part.type === "wall" || part.type === "spawn");
    minigame.walls = parts.filter((part) => part.type === "wall");
    minigame.extras.parts = parts;
    minigame.extras.scripts = scripts;
    minigame.extras.used = {};
    minigame.extras.teleportIn = 0;
    minigame.extras.foodField = scripts.food ? 28 : 0;
    minigame.extras.pointField = scripts.points ? 22 : 0;
    minigame.extras.pointCfg = scripts.points || null;
    let players = alive;
    if (scripts.food) {
      const foods = pickScriptFoods(scripts.food.foodCount);
      foods.forEach((food) => ensureEveryoneTriedFood(food));
      minigame.extras.foods = foods;
      minigame.extras.food = foods[0] || null;
      if (scripts.food.likesOnly && foods.length) {
        players = alive.filter((marble) => marbleLikesAllFoods(marble, foods));
      }
      fillCustomScriptField("foodbite", minigame.extras.foodField, spawnCustomFoodBite);
    }
    if (scripts.points) fillCustomScriptField("star", minigame.extras.pointField, spawnCustomPoint);
    const starts = parts.filter((part) => part.type === "spawn").map((part) => ({
      ...part,
      script: normalizeScriptCfg("spawn", part.script)
    }));
    const floor = starts.find((part) => part.script.who !== "one")
      || starts[0]
      || parts.find((part) => part.type === "platform")
      || { x: 40, y: 508, w: 920, h: 18 };
    minigame.extras.home = { x: floor.x + Math.min(36, Math.max(12, floor.w / 2)), y: floor.y - RADIUS };
    const padSpot = (part, index, count) => {
      const cols = Math.max(1, Math.min(count, Math.max(1, Math.floor((part.w - 20) / 28))));
      return {
        x: part.x + 16 + (index % cols) * Math.min(28, Math.max(18, (part.w - 32) / Math.max(1, cols))),
        y: part.y - RADIUS - Math.floor(index / cols) * 28,
        vx: 0
      };
    };
    const spots = new Map();
    starts.forEach((start) => {
      if (start.script.who !== "one" || !start.script.marbleId) return;
      const marble = players.find((item) => item.id === start.script.marbleId);
      if (marble && !spots.has(marble.id)) spots.set(marble.id, padSpot(start, 0, 1));
    });
    const leftovers = players.filter((item) => !spots.has(item.id));
    leftovers.forEach((item, index) => {
      spots.set(item.id, padSpot(floor, index, leftovers.length));
    });
    marbles = layoutMinigameMarbles(players, (index) => spots.get(players[index].id) || padSpot(floor, index, players.length));
    if (scripts.sacrifice) {
      const pool = marbles.filter((ball) => ball.state === "active");
      if (pool.length) {
        const victim = pool[Math.floor(Math.random() * pool.length)];
        victim.state = "lost";
        addParticles(victim.x, victim.y, "#fb7185", 12);
      }
    }
  }

  function updateCustomMinigame(step) {
    const parts = (minigame.extras && minigame.extras.parts) || [];
    const scripts = (minigame.extras && minigame.extras.scripts) || {};
    const solids = minigame.platforms || [];
    const foodCfg = scripts.food;
    const pointCfg = scripts.points;
    let winner = "";
    if (foodCfg) fillCustomScriptField("foodbite", minigame.extras.foodField, spawnCustomFoodBite);
    if (pointCfg) fillCustomScriptField("star", minigame.extras.pointField, spawnCustomPoint);
    minigame.items = minigame.items.filter((item) => {
      item.x += (item.vx || 0) * step;
      item.y += (item.vy || 0) * step;
      item.pulse = (item.pulse || 0) + 0.08 * step;
      if (item.kind === "star") {
        if (item.y > HEIGHT - 18) {
          if (pointCfg && pointCfg.bounceFloor) {
            item.y = HEIGHT - 18;
            item.vy = -Math.abs(item.vy || 1) * 0.72;
          } else {
            return false;
          }
        }
        return true;
      }
      if (item.kind === "foodbite") {
        if (foodCfg && foodCfg.bounce) {
          if (item.x < 28 || item.x > WIDTH - 28) item.vx = -(item.vx || 1);
          if (item.y < 28 || item.y > HEIGHT - 28) item.vy = -(item.vy || 1);
          item.x = Math.max(28, Math.min(WIDTH - 28, item.x));
          item.y = Math.max(28, Math.min(HEIGHT - 28, item.y));
        } else if (item.x < -20 || item.x > WIDTH + 20 || item.y < -20 || item.y > HEIGHT + 20) {
          return false;
        }
      }
      return true;
    });
    if (scripts.teleport) {
      minigame.extras.teleportIn = (minigame.extras.teleportIn || 0) + step;
      if (minigame.extras.teleportIn > 70) {
        minigame.extras.teleportIn = 0;
        const pool = marbles.filter((ball) => ball.state === "active");
        const ball = pool[Math.floor(Math.random() * pool.length)];
        if (ball) {
          if (scripts.teleport.mode === "point") {
            ball.x = scripts.teleport.tx;
            ball.y = scripts.teleport.ty;
          } else {
            ball.x = 60 + Math.random() * 880;
            ball.y = 70 + Math.random() * 380;
          }
          addParticles(ball.x, ball.y, "#67e8f9", 10);
        }
      }
    }
    const gravActive = scripts.gravity && minigame.elapsed < (Number(scripts.gravity.time) || 0);
    const grav = gravActive ? Number(scripts.gravity.amount) / 100 : GRAVITY;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const prevX = ball.x;
      const prevY = ball.y;
      ball.vy += grav * step;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      ball.teleportCooldown = Math.max(0, (ball.teleportCooldown || 0) - step);
      ball.bumpCooldown = Math.max(0, (ball.bumpCooldown || 0) - step);
      solids.forEach((block) => resolveBlock(ball, block, prevX, prevY));
      parts.forEach((part) => {
        if (part.type !== "blackhole") return;
        const c = partCenter(part);
        const dx = c.x - ball.x;
        const dy = c.y - ball.y;
        const dist = Math.max(12, Math.hypot(dx, dy));
        const pull = Math.min(part.w, part.h) / 2;
        ball.vx += (dx / dist) * 0.09 * step;
        ball.vy += (dy / dist) * 0.09 * step;
        if (dist < pull * 0.45) {
          ball.state = "lost";
          addParticles(c.x, c.y, "#c084fc", 14);
        }
      });
      const belt = parts.find((part) => part.type === "conveyor" && overlapsCirclePart(ball, part));
      if (belt) ball.vx += 0.18 * step;
      const bumper = parts.find((part) => part.type === "bumper" && overlapsCirclePart(ball, part));
      if (bumper && (ball.bumpCooldown || 0) <= 0) {
        ball.vx *= -1.05;
        ball.vy *= -1.05;
        ball.bumpCooldown = 12;
      }
      const portal = parts.find((part) => part.type === "portal" && overlapsCirclePart(ball, part));
      if (portal && (ball.teleportCooldown || 0) <= 0) {
        const other = parts.find((part) => part.type === "portal" && part !== portal);
        if (other) {
          ball.x = other.x + other.w / 2;
          ball.y = other.y + other.h / 2;
          ball.teleportCooldown = 28;
        }
      }
      const good = parts.find((part) => part.type === "goodlava" && overlapsCirclePart(ball, part));
      if (good && (ball.teleportCooldown || 0) <= 0) {
        const home = minigame.extras.home || { x: 80, y: 80 };
        ball.x = home.x;
        ball.y = home.y;
        ball.vx = 0;
        ball.vy = 0;
        ball.teleportCooldown = 28;
        addParticles(ball.x, ball.y, "#7dd3fc", 10);
      }
      minigame.items = minigame.items.filter((item) => {
        if (!collectItem(ball, item)) return true;
        if (item.kind === "foodbite") {
          const food = getFood(item.foodId) || minigame.extras.food;
          const record = (getSave() && getSave().marbles || []).find((marble) => marble.id === ball.recordId);
          const liked = !food || marbleLikedTriedFood(record, food);
          if (foodCfg && !foodCfg.likesOnly && !liked) ball.score -= 1;
          else ball.score += 1;
          addParticles(item.x, item.y, liked ? ball.color : "#fb7185", 10);
          return false;
        }
        if (item.kind === "star") {
          ball.score += 1;
          addParticles(item.x, item.y, item.color || "#ffe566", 8);
          return false;
        }
        return true;
      });
      parts.forEach((part, index) => {
        if (part.invisible || isScriptType(part.type)) return;
        if (!["hoop", "flag", "finish", "zone", "hazard"].includes(part.type)) return;
        if (!overlapsCirclePart(ball, part)) return;
        if (part.type === "hazard") {
          ball.state = "lost";
          return;
        }
        const key = `${ball.recordId}:${index}`;
        if (minigame.extras.used[key]) return;
        minigame.extras.used[key] = true;
        if (part.type === "zone" || part.type === "hoop" || part.type === "flag") ball.score += 10;
        if (part.type === "finish") {
          ball.score += 50;
          winner = ball.name;
        }
      });
      if (ball.x < 16) { ball.x = 16; ball.vx = Math.abs(ball.vx); }
      if (ball.x > WIDTH - 16) { ball.x = WIDTH - 16; ball.vx = -Math.abs(ball.vx); }
      if (ball.y > HEIGHT + 40) ball.state = "lost";
    });
    if (winner || !marbles.some((ball) => ball.state === "active")) finishMinigame();
  }

  function updateFoodFeast(step) {
    while (minigame.items.length < FOOD_FEAST_FIELD) spawnFoodBite();
    minigame.items.forEach((item) => {
      item.x += (item.vx || 0) * step;
      item.y += (item.vy || 0) * step;
      item.pulse = (item.pulse || 0) + 0.08 * step;
      if (item.x < 28 || item.x > WIDTH - 28) item.vx *= -1;
      if (item.y < 28 || item.y > HEIGHT - 28) item.vy *= -1;
      item.x = Math.max(28, Math.min(WIDTH - 28, item.x));
      item.y = Math.max(28, Math.min(HEIGHT - 28, item.y));
    });
    let vanished = "";
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius + 4);
      minigame.items = minigame.items.filter((item) => {
        if (!collectItem(ball, item)) return true;
        ball.score += 1;
        addParticles(item.x, item.y, ball.color, 10);
        return false;
      });
      if (minigame.foodLimited && ball.score >= FOOD_FEAST_GOAL) {
        ball.score = FOOD_FEAST_GOAL;
        ball.state = "lost";
        vanished = ball.name;
        addParticles(ball.x, ball.y, ball.color, 22);
      }
    });
    resolveMarbleCollisions();
    if (vanished) {
      minigame.extras.goneName = vanished;
      minigame.extras.goneUntil = minigame.elapsed + 2.4;
    }
    if (minigame.foodLimited && !marbles.some((ball) => ball.state === "active")) finishMinigame();
  }

  const SL_WALL = { x: 490, y: 0, w: 20, h: 600 };
  const SL_FLOOR = 548;
  const SL_BOY_TUBE = { x: 180, y: 0, w: 40, h: 80 };
  const SL_GIRL_TUBE = { x: 780, y: 0, w: 40, h: 80 };
  const SL_ROOM_R = 128;
  const SL_ROOM_X0 = 1500;
  const SL_ROOM_GAP = 540;
  const SL_ROOM_Y = 300;

  function splitLoveHasGenders(list) {
    const items = list || [];
    return items.some((item) => normalizeGender(item.gender) === "male")
      && items.some((item) => normalizeGender(item.gender) === "female");
  }

  function normalizeSplitLoveRooms(list) {
    return (Array.isArray(list) ? list : []).map((room, index) => ({
      id: room && room.id ? String(room.id) : `room-${index + 1}`,
      boyId: String((room && room.boyId) || ""),
      girlId: String((room && room.girlId) || ""),
      boyName: String((room && room.boyName) || ""),
      girlName: String((room && room.girlName) || ""),
      cx: Number.isFinite(Number(room && room.cx)) ? Number(room.cx) : SL_ROOM_X0 + index * SL_ROOM_GAP,
      cy: Number.isFinite(Number(room && room.cy)) ? Number(room.cy) : SL_ROOM_Y,
      r: Number.isFinite(Number(room && room.r)) ? Number(room.r) : SL_ROOM_R
    }));
  }

  function persistSplitLoveRooms() {
    const save = getSave();
    if (!save || !minigame || minigame.kind !== "splitlove") return;
    save.splitLoveRooms = normalizeSplitLoveRooms(minigame.extras.rooms);
    persist();
  }

  function setupSplitLove(alive) {
    const save = getSave();
    const rooms = normalizeSplitLoveRooms(save && save.splitLoveRooms);
    const lockedIds = new Set();
    rooms.forEach((room) => {
      if (room.boyId) lockedIds.add(room.boyId);
      if (room.girlId) lockedIds.add(room.girlId);
    });
    const free = (alive || []).filter((item) => !lockedIds.has(item.id));
    const boys = free.filter((item) => normalizeGender(item.gender) === "male");
    const girls = free.filter((item) => normalizeGender(item.gender) === "female");
    const placeSide = (index, total, left) => {
      const cols = Math.max(1, Math.min(total, 6));
      const origin = left ? 46 : 546;
      return {
        x: origin + (index % cols) * (380 / cols),
        y: 500 - Math.floor(index / cols) * 38
      };
    };
    const boyMarbles = layoutMinigameMarbles(boys, (index, total) => placeSide(index, total, true));
    const girlMarbles = layoutMinigameMarbles(girls, (index, total) => placeSide(index, total, false));
    const locked = [];
    rooms.forEach((room) => {
      const boy = (alive || []).find((item) => item.id === room.boyId);
      const girl = (alive || []).find((item) => item.id === room.girlId);
      if (boy) {
        const [ball] = layoutMinigameMarbles([boy], () => ({ x: room.cx - 30, y: room.cy }));
        ball.roomId = room.id;
        locked.push(ball);
      }
      if (girl) {
        const [ball] = layoutMinigameMarbles([girl], () => ({ x: room.cx + 30, y: room.cy }));
        ball.roomId = room.id;
        locked.push(ball);
      }
    });
    marbles = boyMarbles.concat(girlMarbles, locked);
    minigame.extras = {
      view: "arena",
      roomId: "",
      camX: 0,
      camY: 0,
      camTX: 0,
      camTY: 0,
      boyTube: "",
      girlTube: "",
      pairReady: 0,
      rooms,
      noMorePairs: rooms.length > 0 && !(boys.length && girls.length)
    };
    renderSplitNav();
  }

  function pickRandomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function setupLockPair(alive) {
    const boys = (alive || []).filter((item) => normalizeGender(item.gender) === "male");
    const girls = (alive || []).filter((item) => normalizeGender(item.gender) === "female");
    const boy = pickRandomItem(boys);
    const girl = pickRandomItem(girls);
    const cx = 500;
    const cy = 300;
    const r = 168;
    marbles = layoutMinigameMarbles([boy, girl], (index) => ({
      x: cx + (index === 0 ? -34 : 34),
      y: cy + (index === 0 ? -8 : 8)
    }));
    minigame.extras = {
      cx,
      cy,
      r,
      boyName: boy.name,
      girlName: girl.name
    };
  }

  function updateLockPair(step) {
    const extras = minigame.extras;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.28 * step;
      ball.vx *= 0.992;
      ball.vy *= 0.992;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      containInCircle(ball, extras.cx, extras.cy, extras.r);
      ball.score = minigame.elapsed;
    });
    resolveSplitLoveCollisions();
  }

  function drawLockPairWorld() {
    const extras = minigame.extras;
    ctx.fillStyle = "rgba(15, 6, 18, 0.88)";
    ctx.beginPath();
    ctx.arc(extras.cx, extras.cy, extras.r + 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(extras.cx, extras.cy, extras.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#fda4af";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(extras.cx, extras.cy, extras.r - 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(251, 113, 133, 0.22)";
    ctx.font = "900 42px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("♥", extras.cx, extras.cy + 14);
    ctx.fillStyle = "#ffe4e6";
    ctx.font = "800 16px Segoe UI";
    ctx.fillText(`${extras.boyName} + ${extras.girlName}`, extras.cx, extras.cy - extras.r - 18);
  }

  function boxEscapeSize(count) {
    const n = Math.max(1, count || 1);
    return Math.min(420, 140 + n * 22);
  }

  function setupBoxEscape(alive) {
    const players = alive && alive.length ? alive : [];
    const size = boxEscapeSize(players.length);
    const holeH = Math.max(56, Math.min(90, 40 + players.length * 4));
    const box = {
      x: (WIDTH - size) / 2,
      y: (HEIGHT - size) / 2 - 10,
      w: size,
      h: size,
      holeH
    };
    const cols = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(Math.max(1, players.length)))));
    marbles = layoutMinigameMarbles(players, (index, total) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const rows = Math.ceil(total / cols);
      return {
        x: box.x + 28 + (box.w - 56) * ((col + 0.5) / cols),
        y: box.y + 28 + (box.h - 56) * ((row + 0.5) / Math.max(1, rows))
      };
    });
    minigame.extras = { box, out: 0, lastId: "", lastName: "", done: false };
  }

  function marbleEscapesBox(ball, box) {
    if (ball.escaped) return;
    const holeTop = box.y + (box.h - box.holeH) / 2;
    const holeBot = holeTop + box.holeH;
    const outRight = ball.x > box.x + box.w + ball.radius * 0.2;
    const throughHole = ball.x > box.x + box.w - 8 && ball.y > holeTop && ball.y < holeBot;
    if (outRight || (throughHole && ball.x > box.x + box.w - 2)) {
      ball.escaped = true;
      minigame.extras.out += 1;
      ball.exitOrder = minigame.extras.out;
      ball.score = minigame.extras.out;
      const remaining = marbles.filter((item) => !item.escaped);
      if (!remaining.length) {
        minigame.extras.lastId = ball.recordId;
        minigame.extras.lastName = ball.name;
        grantBoxSkip(ball);
        minigame.extras.done = true;
      }
      addParticles(ball.x, ball.y, ball.color, 14);
    }
  }

  function grantBoxSkip(ball) {
    const save = getSave();
    if (!save || !ball) return;
    const record = save.marbles.find((item) => item.id === ball.recordId);
    if (!record) return;
    record.skipNextRound = true;
    persist();
  }

  function resolveBoxWalls(ball, box) {
    if (ball.escaped) return;
    const holeTop = box.y + (box.h - box.holeH) / 2;
    const holeBot = holeTop + box.holeH;
    const inHoleY = ball.y > holeTop + 2 && ball.y < holeBot - 2;
    const pad = ball.radius;
    if (ball.x - pad < box.x) {
      ball.x = box.x + pad;
      ball.vx = Math.abs(ball.vx) * 0.45;
    }
    if (ball.y - pad < box.y) {
      ball.y = box.y + pad;
      ball.vy = Math.abs(ball.vy) * 0.35;
    }
    if (ball.y + pad > box.y + box.h) {
      ball.y = box.y + box.h - pad;
      ball.vy = -Math.abs(ball.vy) * 0.35;
    }
    if (ball.x + pad > box.x + box.w && !inHoleY) {
      ball.x = box.x + box.w - pad;
      ball.vx = -Math.abs(ball.vx) * 0.45;
    }
  }

  function updateBoxEscape(step) {
    const extras = minigame.extras;
    const box = extras.box;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.26 * step;
      ball.vx *= 0.994;
      ball.vy *= 0.994;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      resolveBoxWalls(ball, box);
      marbleEscapesBox(ball, box);
      if (ball.escaped) {
        ball.x = Math.max(ball.radius, Math.min(WIDTH - ball.radius, ball.x));
        ball.y = Math.max(ball.radius, Math.min(HEIGHT - ball.radius, ball.y));
      }
    });
    resolveSplitLoveCollisions();
    if (extras.done && minigame.elapsed > 0.35) finishMinigame();
  }

  function drawBoxEscapeWorld() {
    const box = minigame.extras.box;
    const holeTop = box.y + (box.h - box.holeH) / 2;
    ctx.fillStyle = "rgba(42, 24, 8, 0.88)";
    ctx.fillRect(box.x - 10, box.y - 10, box.w + 20, box.h + 20);
    ctx.fillStyle = "#c2410c";
    ctx.fillRect(box.x, box.y, box.w, 14);
    ctx.fillRect(box.x, box.y + box.h - 14, box.w, 14);
    ctx.fillRect(box.x, box.y, 14, box.h);
    ctx.fillRect(box.x + box.w - 14, box.y, 14, holeTop - box.y);
    ctx.fillRect(box.x + box.w - 14, holeTop + box.holeH, 14, box.y + box.h - (holeTop + box.holeH));
    ctx.strokeStyle = "#fdba74";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = "rgba(253, 186, 116, 0.35)";
    ctx.fillRect(box.x + box.w - 6, holeTop, 18, box.holeH);
    ctx.fillStyle = "#ffedd5";
    ctx.font = "800 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(t("miniBoxDoor"), box.x + box.w + 8, holeTop - 10);
  }

  const TEAM_SPIKE_COLORS = ["#38bdf8", "#f472b6", "#facc15", "#4ade80"];

  function teamSpikeCooldown(save) {
    if (!save || !save.teamSpikeUsed) return 0;
    return Math.max(0, (Number(save.teamSpikeAt) || 0) + 10 - (Number(save.round) || 0));
  }

  function teamsAllBig(extras) {
    return extras.teams.length > 0 && extras.teams.every((team) => marbles.filter((ball) => ball.teamId === team.id).length >= 1);
  }

  function loadTypePlaces() {
    try {
      const raw = localStorage.getItem("tipo-knowledge-v1") || localStorage.getItem("tipo-knowwledge-v1");
      const data = raw ? JSON.parse(raw) : {};
      const places = Array.isArray(data.places) ? data.places : [];
      return places.filter((place) => place && place.id && Array.isArray(place.types) && place.types.some((type) => type && type.id));
    } catch (_err) {
      return [];
    }
  }

  function typePlaceFinished(place) {
    if (!place.types.length) return false;
    const questions = Array.isArray(place.questions) ? place.questions : [];
    if (questions.length < 15) return false;
    for (let i = 0; i < 15; i += 1) {
      const question = questions[i] || {};
      const options = Array.isArray(question.options) ? question.options : [];
      if (!String(question.text || "").trim()) return false;
      if (options.length < 4 || options.slice(0, 4).some((option) => !String(option || "").trim())) return false;
    }
    const profiles = place.profiles && typeof place.profiles === "object" ? place.profiles : {};
    if (!place.types.every((type) => Array.isArray(profiles[type.id]) && profiles[type.id].length === 15)) return false;
    if (!window.SharedPacks) return false;
    const assignments = place.assignments && typeof place.assignments === "object" ? place.assignments : {};
    const typeIds = new Set(place.types.map((type) => type.id));
    let total = 0;
    let done = 0;
    SharedPacks.load().forEach((pack) => {
      if (!pack || !pack.id) return;
      (pack.marbles || []).forEach((marble) => {
        if (!marble || !marble.id || !marble.name) return;
        total += 1;
        const typeId = assignments[pack.id + "::" + marble.id];
        if (typeId && typeIds.has(typeId)) done += 1;
      });
    });
    return done === total;
  }

  function typeForMarble(place, item) {
    const assignments = place.assignments && typeof place.assignments === "object" ? place.assignments : {};
    const typeIds = new Set(place.types.map((type) => type.id));
    const direct = item.packId && item.packMarbleId ? assignments[item.packId + "::" + item.packMarbleId] : "";
    if (direct && typeIds.has(direct)) return direct;
    if (!item.packMarbleId) return "";
    const suffix = "::" + item.packMarbleId;
    const key = Object.keys(assignments).find((name) => name.endsWith(suffix) && typeIds.has(assignments[name]));
    return key ? assignments[key] : "";
  }

  function setupTeamSpike(alive) {
    const source = alive && alive.length ? alive : [];
    const places = loadTypePlaces();
    const place = places.length ? places[Math.floor(Math.random() * places.length)] : null;
    const finished = place ? typePlaceFinished(place) : false;
    const typeByRecord = new Map();
    if (place) {
      source.forEach((item) => {
        const typeId = typeForMarble(place, item);
        if (typeId) typeByRecord.set(item.id, typeId);
      });
      if (finished && place.types.length) {
        const types = place.types.filter((type) => type && type.id);
        source.forEach((item) => {
          if (typeByRecord.has(item.id)) return;
          const counts = types.map((type) => source.filter((other) => typeByRecord.get(other.id) === type.id).length);
          let best = 0;
          counts.forEach((count, index) => {
            if (count < counts[best]) best = index;
          });
          typeByRecord.set(item.id, types[best].id);
        });
      }
    }
    const players = source.filter((item) => typeByRecord.has(item.id));
    const used = [];
    players.forEach((item) => {
      const typeId = typeByRecord.get(item.id);
      if (typeId && !used.includes(typeId)) used.push(typeId);
    });
    const typeList = place ? place.types.filter((type) => type && used.includes(type.id)) : [];
    const teams = typeList.map((type, index) => {
      const x = 60 + index * 1180;
      return {
        id: type.id,
        name: type.name || String(index + 1),
        color: type.color || TEAM_SPIKE_COLORS[index % TEAM_SPIKE_COLORS.length],
        x,
        y: 78,
        w: 900,
        h: 450,
        tube: { x: x + 432, y: 78, w: 36, h: 78 },
        picks: []
      };
    });
    const last = teams[teams.length - 1];
    const circleR = 200;
    const circle = last
      ? { cx: last.x + last.w + 820, cy: 310, r: circleR }
      : null;
    const spike = circle ? { x: circle.cx, base: circle.cy - circle.r + 22, h: 86, w: 34 } : null;
    const grouped = teams.map(() => []);
    players.forEach((item) => {
      const index = teams.findIndex((team) => team.id === typeByRecord.get(item.id));
      if (index >= 0) grouped[index].push(item);
    });
    const ordered = grouped.reduce((list, group) => list.concat(group), []);
    marbles = layoutMinigameMarbles(ordered, (index) => {
      let cursor = index;
      let teamIndex = 0;
      while (teamIndex < grouped.length && cursor >= grouped[teamIndex].length) {
        cursor -= grouped[teamIndex].length;
        teamIndex += 1;
      }
      const team = teams[teamIndex] || teams[0];
      return {
        x: team.x + 70 + (cursor % 6) * 72,
        y: team.y + team.h - 70 - Math.floor(cursor / 6) * 46
      };
    });
    marbles.forEach((ball, index) => {
      let cursor = index;
      let teamIndex = 0;
      while (teamIndex < grouped.length && cursor >= grouped[teamIndex].length) {
        cursor -= grouped[teamIndex].length;
        teamIndex += 1;
      }
      const team = teams[teamIndex];
      ball.teamId = team ? team.id : "";
      ball.homeX = ball.x;
      ball.homeY = ball.y;
      ball.phase = "area";
      ball.picked = false;
    });
    const views = teams.map((team) => ({
      id: team.id,
      camX: team.x + team.w / 2 - WIDTH / 2,
      camY: 0
    }));
    if (circle) {
      views.push({
        id: "circle",
        camX: circle.cx - WIDTH / 2,
        camY: circle.cy - HEIGHT / 2
      });
    }
    if (!views.length) views.push({ id: "none", camX: 0, camY: 0 });
    minigame.extras = {
      teams,
      circle,
      spike,
      views,
      view: 0,
      camX: views[0].camX,
      camY: 0,
      camTX: views[0].camX,
      camTY: 0,
      phase: "pick",
      winnerId: "",
      winnerName: "",
      teamName: "",
      placeName: place ? String(place.name || "Lugar") : "",
      finished,
      heldName: (getSave() && getSave().vipTicket && getSave().vipTicket.teamName) || "",
      decisive: !(getSave() && getSave().vipTicket),
      ticketGranted: false,
      skipped: false,
      cooldownLeft: teamSpikeCooldown(getSave()),
      doneAt: 0,
      landed: 0
    };
    launchAllTeamMarbles();
    renderTeamSpikeNav();
  }

  function lookTeamSpike(index) {
    const extras = minigame && minigame.kind === "teamspike" ? minigame.extras : null;
    if (!extras || !extras.views || !extras.views.length) return;
    const next = (index + extras.views.length) % extras.views.length;
    extras.view = next;
    extras.camTX = extras.views[next].camX;
    extras.camTY = extras.views[next].camY;
    renderTeamSpikeNav();
  }

  function renderTeamSpikeNav() {
    if (!ui.teamSpikeNav || !minigame || minigame.kind !== "teamspike") {
      if (ui.teamSpikeNav) ui.teamSpikeNav.hidden = true;
      return;
    }
    const extras = minigame.extras;
    const current = extras.views[extras.view];
    ui.teamSpikeNav.hidden = false;
    if (ui.teamSpikeLabel) {
      const place = extras.placeName ? extras.placeName + " · " : "";
      ui.teamSpikeLabel.textContent = current && current.id === "circle"
        ? place + t("miniTeamCircleName")
        : place + t("miniTeamArea", { name: (extras.teams.find((team) => team.id === current.id) || {}).name || "" });
    }
  }

  function updateTeamSpikeStatus() {
    const extras = minigame.extras || {};
    if (extras.winnerName) {
      ui.status.textContent = extras.ticketGranted
        ? t("miniTeamVipWin", { name: extras.winnerName, team: extras.teamName })
        : t("miniTeamVipHeld", { name: extras.winnerName, holder: extras.heldName || extras.teamName });
      return;
    }
    if (!extras.teams.length) {
      ui.status.textContent = extras.placeName
        ? t(extras.finished ? "miniTeamEmpty" : "miniTeamNone", { place: extras.placeName })
        : t("miniTeamNoPlace");
      return;
    }
    if (extras.phase === "circle" || extras.phase === "travel") {
      ui.status.textContent = t("miniTeamCircle");
      return;
    }
    const note = (!extras.finished && extras.placeName ? t("miniTeamPartial", { place: extras.placeName }) + " " : "")
      + (extras.heldName
        ? t("miniTeamVipBusyNow", { team: extras.heldName }) + " "
        : extras.decisive
          ? t("miniTeamVipDecisive") + " "
          : "");
    if (!teamsAllBig(extras)) {
      ui.status.textContent = note + t("miniTeamNeed");
      return;
    }
    const current = extras.views[extras.view];
    const team = current && extras.teams.find((item) => item.id === current.id);
    const teamSize = team ? marbles.filter((ball) => ball.teamId === team.id).length : 0;
    if (team && team.picks.length < teamSize) {
      ui.status.textContent = note + t("miniTeamPick", { name: team.name });
      return;
    }
    const waiting = extras.teams.filter((item) => item.picks.length < marbles.filter((ball) => ball.teamId === item.id).length).map((item) => item.name);
    ui.status.textContent = note + (waiting.length ? t("miniTeamWait", { names: waiting.join(", ") }) : t("miniTeamCircle"));
  }

  function grantVipTicket(team) {
    const save = getSave();
    if (!save || !team || save.vipTicket) return false;
    const members = marbles.filter((ball) => ball.teamId === team.id && ball.name).map((ball) => ({
      id: ball.recordId,
      name: ball.name,
      color: ball.color
    }));
    if (!members.length) return false;
    save.vipTicket = {
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      placeName: (minigame.extras && minigame.extras.placeName) || "",
      members
    };
    save.vipDecisive = false;
    persist();
    return true;
  }

  function cleanMovieWords(value) {
    return String(value || "")
      .replace(/[.!?;,"«»]/g, " ")
      .replace(/\b(?:y|entonces|despues|después|luego|then|and)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function vipMovieScript(ticket) {
    const cast = (ticket.members || []).map((item) => cleanMovieWords(item.name)).filter(Boolean);
    const team = cleanMovieWords(ticket.teamName) || "equipo";
    const home = cleanMovieWords(ticket.placeName);
    if (!cast.length) cast.push(team);
    const at = (index) => cast[index % cast.length];
    const nextTo = (index) => (cast.length > 1 ? cast[(index + 1) % cast.length] : "");
    const spot = (place) => ({
      park: "en el parque",
      house: "en la casa",
      sky: "en el cielo",
      sea: "en el mar",
      city: "en la ciudad",
      woods: "en el bosque"
    }[place] || "en el parque");
    const shot = (who, action, when, place, extra) => [who, action, extra, when, spot(place)].filter(Boolean).join(" ");
    const tell = (who, when, place, text) => who + " " + when + " " + spot(place) + " \"" + text + "\"";
    const chapters = [
      function park(a, b) {
        const lines = [
          shot(a, "camina", "de dia", "park", "feliz"),
          shot(a, "juega", "de dia", "park", "con un juguete"),
          shot(a, "come", "de dia", "park", "pizza"),
          shot(a, "baila", "de dia", "park"),
          tell(a, "de dia", "park", "el parque es del equipo " + team)
        ];
        if (b) {
          lines.push(shot(b, "corre", "de dia", "park"));
          lines.push(shot(a, "abraza a " + b, "de dia", "park"));
        }
        return lines;
      },
      function house(a, b) {
        const lines = [
          shot(a, "llega", "de tarde", "house"),
          shot(a, "lee", "de tarde", "house"),
          shot(a, "duerme", "de tarde", "house", "tranquilo"),
          tell(a, "de tarde", "house", "hoy filmamos al equipo " + team)
        ];
        if (b) {
          lines.push(shot(b, "salta", "de tarde", "house"));
          lines.push(shot(a, "abraza a " + b, "de tarde", "house"));
        }
        return lines;
      },
      function sky(a, b) {
        const lines = [
          shot(a, "vuela", "de dia", "sky"),
          shot(a, "gira", "de dia", "sky"),
          shot(a, "brilla", "de dia", "sky"),
          tell(a, "de dia", "sky", "la estrella es del equipo " + team)
        ];
        if (b) {
          lines.push(shot(b, "vuela", "de dia", "sky"));
          lines.push(shot(b, "cae", "de dia", "sky"));
          lines.push(shot(a, "ayuda a " + b, "de dia", "sky"));
        }
        return lines;
      },
      function sea(a, b) {
        const lines = [
          shot(a, "nada", "de noche", "sea", "tranquilo"),
          shot(a, "nada", "de noche", "sea", "asustado con tormenta"),
          tell(a, "de noche", "sea", "el equipo " + team + " nada junto")
        ];
        if (b) {
          lines.push(shot(b, "nada", "de noche", "sea"));
          lines.push(shot(a, "abraza a " + b, "de noche", "sea"));
        }
        return lines;
      },
      function city(a, b) {
        const lines = [
          shot(a, "corre", "de mañana", "city", "rapido"),
          shot(a, "tropieza", "de mañana", "city"),
          shot(a, "salta", "de mañana", "city"),
          tell(a, "de mañana", "city", "el equipo " + team + " no se rinde")
        ];
        if (b) {
          lines.push(shot(b, "persigue a " + a, "de mañana", "city"));
          lines.push(shot(a, "gana", "de mañana", "city"));
        }
        return lines;
      },
      function woods(a, b) {
        const lines = [
          shot(a, "camina", "de noche", "woods", "lento con nieve"),
          shot(a, "esconde", "de noche", "woods"),
          shot(a, "muestra", "de noche", "woods", "una flor"),
          tell(a, "de noche", "woods", "el bosque es del equipo " + team)
        ];
        if (b) {
          lines.push(shot(b, "busca a " + a, "de noche", "woods"));
          lines.push(shot(a, "abraza a " + b, "de noche", "woods"));
        }
        return lines;
      }
    ];
    for (let i = chapters.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = chapters[i];
      chapters[i] = chapters[j];
      chapters[j] = swap;
    }
    const lines = [
      shot(cast[0], "llega", "de noche", "house", "emocionado"),
      tell(cast[0], "de noche", "house", (home ? "desde " + home + " " : "") + "el equipo " + team + " va a vivir una pelicula larga")
    ];
    chapters.forEach((chapter, index) => {
      lines.push.apply(lines, chapter(at(index), nextTo(index)));
    });
    lines.push(shot(cast[0], "corre", "de noche", "house", "asustado con tormenta"));
    if (cast[1]) lines.push(shot(cast[1], "abraza a " + cast[0], "de noche", "house"));
    const finale = ["baila", "canta", "gira", "salta", "brilla", "rie"];
    cast.forEach((name, index) => {
      lines.push(shot(name, finale[index % finale.length], "de noche", "house", "feliz"));
    });
    lines.push(shot(cast[0], "gana", "de noche", "house"));
    lines.push(tell(cast[0], "de noche", "house", "somos el equipo " + team));
    return lines.filter(Boolean).join(". ") + ".";
  }

  function loadTextMovies() {
    try {
      const raw = JSON.parse(localStorage.getItem(TEXT_MOVIE_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter((item) => item && item.id && item.name && item.text).map((item) => ({
        id: String(item.id),
        name: String(item.name).slice(0, 40),
        text: String(item.text).slice(0, TEXT_MOVIE_CHARS),
        duration: Math.max(10, Math.min(3600, Number(item.duration) || 10))
      }));
    } catch (_err) {
      return [];
    }
  }

  function persistTextMovies(list) {
    try {
      localStorage.setItem(TEXT_MOVIE_KEY, JSON.stringify(list.slice(0, TEXT_MOVIE_LIMIT)));
    } catch (_err) {
      /* el navegador no aceptó más texto guardado */
    }
  }

  function renderTextMovies() {
    const listEl = textAnimUi.savedList;
    if (!listEl) return;
    listEl.innerHTML = "";
    const list = loadTextMovies();
    if (!list.length) {
      const empty = document.createElement("p");
      empty.className = "text-anim-saved-empty";
      empty.textContent = t("textAnimSavedEmpty");
      listEl.appendChild(empty);
      return;
    }
    list.forEach((item) => {
      const row = document.createElement("div");
      row.className = "text-anim-saved-row";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const load = document.createElement("button");
      load.type = "button";
      load.className = "button secondary compact";
      load.textContent = t("textAnimLoad");
      load.addEventListener("click", () => {
        if (textAnimVip || (textAnimUi.input && textAnimUi.input.readOnly)) return;
        if (textAnimUi.input) textAnimUi.input.value = item.text;
        if (textAnimUi.duration) textAnimUi.duration.value = String(item.duration);
        if (textAnimUi.saveName) textAnimUi.saveName.value = item.name;
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button secondary compact";
      remove.textContent = t("textAnimDeleteSaved");
      remove.addEventListener("click", () => {
        persistTextMovies(loadTextMovies().filter((entry) => entry.id !== item.id));
        renderTextMovies();
      });
      row.appendChild(name);
      row.appendChild(load);
      row.appendChild(remove);
      listEl.appendChild(row);
    });
  }

  function saveCurrentTextMovie() {
    if (textAnimVip || (textAnimUi.input && textAnimUi.input.readOnly)) return;
    const text = (textAnimUi.input && textAnimUi.input.value ? textAnimUi.input.value : "").trim();
    if (!text) {
      if (textAnimUi.input) textAnimUi.input.focus();
      return;
    }
    let name = (textAnimUi.saveName && textAnimUi.saveName.value ? textAnimUi.saveName.value : "").trim().slice(0, 40);
    if (!name) name = text.replace(/\s+/g, " ").slice(0, 24) || t("textAnimSaveFallback");
    const duration = readTextAnimDuration();
    const list = loadTextMovies();
    const existing = list.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.name = name;
      existing.text = text.slice(0, TEXT_MOVIE_CHARS);
      existing.duration = duration;
    } else {
      list.unshift({
        id: "txt-" + Date.now().toString(36),
        name,
        text: text.slice(0, TEXT_MOVIE_CHARS),
        duration
      });
    }
    persistTextMovies(list);
    if (textAnimUi.saveName) textAnimUi.saveName.value = name;
    renderTextMovies();
  }

  function unlockVipMovieForm() {
    textAnimVip = false;
    if (textAnimUi.input) textAnimUi.input.readOnly = false;
    if (textAnimUi.duration) textAnimUi.duration.disabled = false;
    if (textAnimUi.convert) textAnimUi.convert.disabled = false;
    if (textAnimUi.check) textAnimUi.check.disabled = false;
    if (textAnimUi.library) textAnimUi.library.hidden = false;
    renderTextMovies();
  }

  function lockVipMovie(script, seconds, teamName) {
    if (textAnimUi.input) {
      textAnimUi.input.value = script;
      textAnimUi.input.readOnly = true;
    }
    if (textAnimUi.duration) {
      textAnimUi.duration.value = String(seconds);
      textAnimUi.duration.disabled = true;
    }
    if (textAnimUi.convert) textAnimUi.convert.disabled = true;
    if (textAnimUi.check) textAnimUi.check.disabled = true;
    textAnimVip = true;
    if (textAnimUi.library) textAnimUi.library.hidden = true;
    const title = document.querySelector("#textAnimScreen h1");
    if (title) title.textContent = t("miniMovieTitle", { team: teamName });
    const eyebrow = document.querySelector("#textAnimScreen .eyebrow");
    if (eyebrow) eyebrow.textContent = t("miniMovieEyebrow");
  }

  function launchAllTeamMarbles() {
    const extras = minigame.extras;
    if (!extras || !extras.teams.length || !extras.circle) return;
    extras.teams.forEach((team) => {
      const members = marbles.filter((ball) => ball.teamId === team.id && ball.phase === "area");
      team.picks = members.map((ball) => ball.recordId);
      members.forEach((ball, index) => {
        ball.phase = "tubeWait";
        ball.tubeDelay = index * 18;
        ball.picked = false;
      });
    });
    extras.phase = "travel";
    extras.landed = 0;
  }

  function sendTeamThroughTube(team) {
    const members = marbles.filter((ball) => ball.teamId === team.id && (ball.phase === "area" || ball.phase === "tubeWait"));
    team.picks = members.map((ball) => ball.recordId);
    members.forEach((ball, index) => {
      ball.phase = "tubeWait";
      ball.tubeDelay = index * 18;
      ball.picked = false;
      ball.vx = 0;
      ball.vy = 0;
    });
    const extras = minigame.extras;
    if (extras.teams.every((item) => item.picks.length === marbles.filter((ball) => ball.teamId === item.id).length)) extras.phase = "travel";
  }

  function spikeHits(ball, spike) {
    const tipY = spike.base + spike.h;
    const half = spike.w / 2 + ball.radius * 0.85;
    const top = ball.y - ball.radius;
    if (Math.abs(ball.x - spike.x) > half) return false;
    return top < tipY + 6 && ball.y > spike.base - ball.radius;
  }

  function updateTeamSpike(step) {
    const extras = minigame.extras;
    if (!extras.teams.length || !extras.circle) return;
    extras.camX += (extras.camTX - extras.camX) * Math.min(1, 0.1 * step);
    extras.camY += (extras.camTY - extras.camY) * Math.min(1, 0.1 * step);
    let arrivals = 0;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const team = extras.teams.find((item) => item.id === ball.teamId);
      if (ball.phase === "tubeWait" && team) {
        ball.tubeDelay -= step;
        if (ball.tubeDelay > 0) return;
        ball.phase = "tube";
        ball.x = team.tube.x + team.tube.w / 2;
        ball.y = team.tube.y + team.tube.h - ball.radius - 4;
        ball.vx = 0;
        ball.vy = -3.2;
      }
      if (ball.phase === "tube" && team) {
        const tube = team.tube;
        const cx = tube.x + tube.w / 2;
        ball.vx += (cx - ball.x) * 0.2 * step;
        ball.vy -= 0.55 * step;
        ball.x += ball.vx * step;
        ball.y += ball.vy * step;
        containInRect(ball, tube.x + 2, tube.y - 30, tube.w - 4, tube.h + 28);
        if (ball.y < tube.y + ball.radius) {
          extras.landed = (extras.landed || 0) + 1;
          const total = Math.max(1, marbles.filter((item) => item.teamId).length);
          const span = total <= 1 ? 0.5 : (extras.landed - 1) / (total - 1);
          const angle = Math.PI * (0.12 + 0.76 * span);
          const ring = Math.max(36, extras.circle.r * 0.62);
          ball.phase = "circle";
          ball.x = extras.circle.cx + Math.cos(angle) * ring;
          ball.y = extras.circle.cy + Math.sin(angle) * ring;
          ball.vx = 0;
          ball.vy = 0;
        }
        return;
      }
      if (ball.phase === "circle") {
        ball.vy += 0.28 * step;
        ball.vx *= 0.992;
        ball.vy *= 0.992;
        ball.x += ball.vx * step;
        ball.y += ball.vy * step;
        containInCircle(ball, extras.circle.cx, extras.circle.cy, extras.circle.r);
        if (!extras.winnerId && spikeHits(ball, extras.spike)) {
          ball.phase = "out";
          ball.x = ball.homeX;
          ball.y = ball.homeY;
          ball.vx = 0;
          ball.vy = 0;
          addParticles(extras.spike.x, extras.spike.base + extras.spike.h, ball.color, 16);
        }
        return;
      }
      if (!team) return;
      ball.vy += 0.3 * step;
      ball.vx *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      containInRect(ball, team.x + 8, team.y + team.tube.h, team.w - 16, team.h - team.tube.h - 8);
    });
    resolveSplitLoveCollisions();
    const traveling = marbles.some((ball) => ball.phase === "tube" || ball.phase === "tubeWait");
    if (extras.phase === "travel" && !traveling) {
      extras.phase = "circle";
      const circleIndex = extras.views.findIndex((item) => item.id === "circle");
      if (circleIndex >= 0) lookTeamSpike(circleIndex);
    }
    if (extras.phase === "circle" && !extras.winnerId && !traveling) {
      const alive = marbles.filter((ball) => ball.phase === "circle");
      const entered = marbles.some((ball) => ball.phase === "circle" || ball.phase === "out");
      if (entered && alive.length === 1) {
        const winner = alive[0];
        const team = extras.teams.find((item) => item.id === winner.teamId);
        extras.winnerId = winner.recordId;
        extras.winnerName = winner.name;
        extras.teamName = team ? team.name : "";
        extras.ticketGranted = !extras.heldName && grantVipTicket(team);
        extras.doneAt = minigame.elapsed;
      }
    }
    if (extras.winnerId && minigame.elapsed > extras.doneAt + 0.45) finishMinigame();
  }

  function drawTeamSpikeWorld() {
    const extras = minigame.extras;
    if (!extras || !extras.teams) return;
    extras.teams.forEach((team) => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(team.x, team.y, team.w, team.h);
      ctx.strokeStyle = team.color;
      ctx.lineWidth = 6;
      ctx.strokeRect(team.x, team.y, team.w, team.h);
      ctx.fillStyle = "#334155";
      ctx.fillRect(team.tube.x, team.tube.y, team.tube.w, team.tube.h);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.strokeRect(team.tube.x, team.tube.y, team.tube.w, team.tube.h);
      ctx.fillStyle = team.color;
      ctx.font = "800 22px Segoe UI";
      ctx.textAlign = "left";
      ctx.fillText(t("miniTeamArea", { name: team.name }), team.x + 18, team.y + 36);
    });
    if (!extras.teams.length || !extras.circle || !extras.spike) return;
    const circle = extras.circle;
    const spike = extras.spike;
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, circle.r + 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fecaca";
    ctx.beginPath();
    ctx.moveTo(spike.x - spike.w / 2, spike.base);
    ctx.lineTo(spike.x + spike.w / 2, spike.base);
    ctx.lineTo(spike.x, spike.base + spike.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe4e6";
    ctx.font = "800 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(t("miniTeamCircleName"), circle.cx, circle.cy - circle.r - 18);
  }

  function handleTeamSpikeClick(point) {
    const extras = minigame.extras;
    if (!extras || extras.winnerId) return;
    if (extras.phase !== "circle") return;
    const target = nearestActiveMarble(point, 220);
    if (target && target.phase === "circle") {
      addParticles(point.x, point.y, target.color, 7);
      dashToward(target, point, 16);
    }
  }

  function splitLoveLookAt(view, roomId) {
    if (!minigame || minigame.kind !== "splitlove") return;
    const extras = minigame.extras;
    extras.view = view;
    extras.roomId = roomId || "";
    if (view === "arena") {
      extras.camTX = 0;
      extras.camTY = 0;
    } else {
      const room = (extras.rooms || []).find((item) => item.id === roomId);
      if (!room) return;
      extras.camTX = room.cx - WIDTH / 2;
      extras.camTY = room.cy - HEIGHT / 2;
    }
    renderSplitNav();
  }

  function renderSplitNav() {
    if (!ui.splitPairNav || !minigame || minigame.kind !== "splitlove") {
      if (ui.splitPairNav) ui.splitPairNav.hidden = true;
      return;
    }
    const rooms = minigame.extras.rooms || [];
    ui.splitPairNav.hidden = !rooms.length;
    if (ui.splitPairBack) {
      ui.splitPairBack.disabled = minigame.extras.view === "arena";
      ui.splitPairBack.textContent = t("miniSplitBack");
    }
    if (!ui.splitPairRooms) return;
    ui.splitPairRooms.innerHTML = "";
    rooms.forEach((room, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button secondary compact";
      if (minigame.extras.roomId === room.id) button.classList.add("active");
      button.setAttribute("data-split-room", room.id);
      button.textContent = t("miniSplitRoom", {
        n: index + 1,
        boy: room.boyName,
        girl: room.girlName
      });
      ui.splitPairRooms.appendChild(button);
    });
  }

  function containInCircle(ball, cx, cy, radius) {
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.hypot(dx, dy);
    const max = Math.max(8, radius - ball.radius - 3);
    if (dist <= max) return;
    const nx = dx / (dist || 1);
    const ny = dy / (dist || 1);
    ball.x = cx + nx * max;
    ball.y = cy + ny * max;
    const vn = ball.vx * nx + ball.vy * ny;
    if (vn > 0) {
      ball.vx -= vn * nx * 1.55;
      ball.vy -= vn * ny * 1.55;
    }
  }

  function containInRect(ball, x, y, w, h) {
    const minX = x + ball.radius + 2;
    const maxX = x + w - ball.radius - 2;
    const minY = y + ball.radius + 2;
    const maxY = y + h - ball.radius - 2;
    if (ball.x < minX) {
      ball.x = minX;
      ball.vx = Math.abs(ball.vx) * 0.25;
    }
    if (ball.x > maxX) {
      ball.x = maxX;
      ball.vx = -Math.abs(ball.vx) * 0.25;
    }
    if (ball.y < minY) {
      ball.y = minY;
      ball.vy = Math.abs(ball.vy) * 0.25;
    }
    if (ball.y > maxY) {
      ball.y = maxY;
      ball.vy = -Math.abs(ball.vy) * 0.2;
    }
  }

  function nearTubeMouth(ball, tube) {
    const cx = tube.x + tube.w / 2;
    return Math.abs(ball.x - cx) < tube.w * 0.42 + 4
      && ball.y > tube.y + tube.h - 6
      && ball.y < tube.y + tube.h + 28;
  }

  function insideTube(ball, tube) {
    return ball.x > tube.x + 1
      && ball.x < tube.x + tube.w - 1
      && ball.y > tube.y
      && ball.y < tube.y + tube.h + ball.radius * 0.45;
  }

  function bounceOffRect(ball, rect) {
    const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    if (dx * dx + dy * dy >= ball.radius * ball.radius) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      ball.x = dx >= 0 ? rect.x + rect.w + ball.radius : rect.x - ball.radius;
      ball.vx *= -0.45;
    } else {
      ball.y = dy >= 0 ? rect.y + rect.h + ball.radius : rect.y - ball.radius;
      ball.vy *= -0.35;
    }
  }

  function resolveSplitLoveCollisions() {
    const active = marbles.filter((ball) => ball.state === "active");
    for (let i = 0; i < active.length; i += 1) {
      for (let j = i + 1; j < active.length; j += 1) {
        const a = active[i];
        const b = active[j];
        if ((a.roomId || "") !== (b.roomId || "")) continue;
        if ((a.inTube || "") !== (b.inTube || "") && (a.inTube || b.inTube)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const minimum = a.radius + b.radius;
        if (distance <= 0 || distance >= minimum) continue;
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minimum - distance;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;
        const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relative < 0) {
          const impulse = relative * 0.42;
          a.vx += impulse * nx;
          a.vy += impulse * ny;
          b.vx -= impulse * nx;
          b.vy -= impulse * ny;
        }
      }
    }
  }

  function sealSplitLovePair() {
    const extras = minigame.extras;
    const boy = marbles.find((ball) => ball.recordId === extras.boyTube);
    const girl = marbles.find((ball) => ball.recordId === extras.girlTube);
    if (!boy || !girl) return;
    const index = extras.rooms.length;
    const room = {
      id: `room-${index + 1}`,
      boyId: boy.recordId,
      girlId: girl.recordId,
      boyName: boy.name,
      girlName: girl.name,
      cx: SL_ROOM_X0 + index * SL_ROOM_GAP,
      cy: SL_ROOM_Y,
      r: SL_ROOM_R
    };
    extras.rooms.push(room);
    boy.roomId = room.id;
    girl.roomId = room.id;
    boy.inTube = "";
    girl.inTube = "";
    boy.x = room.cx - 30;
    girl.x = room.cx + 30;
    boy.y = room.cy;
    girl.y = room.cy;
    boy.vx = 1.2;
    girl.vx = -1.2;
    boy.vy = -1.4;
    girl.vy = -1.4;
    boy.score += 10;
    girl.score += 10;
    extras.boyTube = "";
    extras.girlTube = "";
    extras.pairReady = 0;
    addParticles(boy.x, boy.y, boy.color, 16);
    addParticles(girl.x, girl.y, girl.color, 16);
    persistSplitLoveRooms();
    splitLoveLookAt("room", room.id);
    setGameChrome("mini");
  }

  function updateSplitLove(step) {
    const extras = minigame.extras;
    extras.camX += (extras.camTX - extras.camX) * Math.min(1, 0.09 * step);
    extras.camY += (extras.camTY - extras.camY) * Math.min(1, 0.09 * step);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const room = extras.rooms.find((item) => item.id === ball.roomId);
      if (room) {
        ball.vy += 0.28 * step;
        ball.vx *= 0.992;
        ball.vy *= 0.992;
        ball.x += ball.vx * step;
        ball.y += ball.vy * step;
        containInCircle(ball, room.cx, room.cy, room.r);
        return;
      }
      const tube = ball.gender === "male" ? SL_BOY_TUBE : SL_GIRL_TUBE;
      const tubeKey = ball.gender === "male" ? "boyTube" : "girlTube";
      const occupant = extras[tubeKey];
      const ownsTube = occupant === ball.recordId;
      if (ownsTube || (!occupant && (nearTubeMouth(ball, tube) || insideTube(ball, tube)))) {
        const cx = tube.x + tube.w / 2;
        ball.vx += (cx - ball.x) * 0.18 * step;
        ball.vy -= 1.15 * step;
        ball.x += ball.vx * step;
        ball.y += ball.vy * step;
        if (insideTube(ball, tube) || ball.y < tube.y + tube.h + 4) {
          extras[tubeKey] = ball.recordId;
          ball.inTube = ball.gender === "male" ? "boy" : "girl";
          containInRect(ball, tube.x + 1, tube.y + 3, tube.w - 2, tube.h - 5);
        }
        return;
      }
      ball.inTube = "";
      ball.vy += 0.32 * step;
      ball.vx *= 0.988;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > SL_FLOOR - ball.radius) {
        ball.y = SL_FLOOR - ball.radius;
        ball.vy *= -0.18;
        if (Math.abs(ball.vy) < 0.6) ball.vy = 0;
        ball.grounded = true;
      } else {
        ball.grounded = false;
      }
      if (ball.gender === "male") {
        if (ball.x + ball.radius > SL_WALL.x) {
          ball.x = SL_WALL.x - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.4;
        }
        if (ball.x < ball.radius + 8) {
          ball.x = ball.radius + 8;
          ball.vx = Math.abs(ball.vx) * 0.4;
        }
      } else {
        if (ball.x - ball.radius < SL_WALL.x + SL_WALL.w) {
          ball.x = SL_WALL.x + SL_WALL.w + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.4;
        }
        if (ball.x > WIDTH - ball.radius - 8) {
          ball.x = WIDTH - ball.radius - 8;
          ball.vx = -Math.abs(ball.vx) * 0.4;
        }
      }
      if (ball.y < ball.radius + 4) {
        ball.y = ball.radius + 4;
        ball.vy = Math.abs(ball.vy) * 0.3;
      }
      const atOwnMouth = ball.y >= tube.y + tube.h - 2
        && Math.abs(ball.x - (tube.x + tube.w / 2)) < tube.w * 0.55;
      if (!atOwnMouth) bounceOffRect(ball, tube);
      bounceOffRect(ball, ball.gender === "male" ? SL_GIRL_TUBE : SL_BOY_TUBE);
    });
    resolveSplitLoveCollisions();
    if (extras.boyTube && extras.girlTube) {
      extras.pairReady += step;
      if (extras.pairReady > 22) sealSplitLovePair();
    } else {
      extras.pairReady = 0;
    }
    const freeBoys = marbles.some((ball) => ball.state === "active" && ball.gender === "male" && !ball.roomId);
    const freeGirls = marbles.some((ball) => ball.state === "active" && ball.gender === "female" && !ball.roomId);
    extras.noMorePairs = extras.rooms.length > 0 && !(freeBoys && freeGirls);
  }

  function drawSplitLoveWorld() {
    const extras = minigame.extras;
    ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
    ctx.fillRect(0, 0, SL_WALL.x, HEIGHT);
    ctx.fillStyle = "rgba(244, 114, 182, 0.14)";
    ctx.fillRect(SL_WALL.x + SL_WALL.w, 0, WIDTH - SL_WALL.x - SL_WALL.w, HEIGHT);
    ctx.fillStyle = "#1a2430";
    ctx.fillRect(0, SL_FLOOR, WIDTH, HEIGHT - SL_FLOOR);
    ctx.fillStyle = "#0f1722";
    ctx.fillRect(SL_WALL.x, SL_WALL.y, SL_WALL.w, SL_WALL.h);
    ctx.fillStyle = "rgba(248, 250, 252, 0.18)";
    ctx.fillRect(SL_WALL.x + 8, 0, 3, HEIGHT);
    const drawTube = (tube, occupied, rim, glow) => {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(tube.x - 6, 0, tube.w + 12, 14);
      ctx.fillStyle = occupied ? glow : "#475569";
      ctx.fillRect(tube.x, tube.y, tube.w, tube.h);
      ctx.fillStyle = "#020617";
      ctx.fillRect(tube.x + 6, 12, tube.w - 12, tube.h - 16);
      ctx.strokeStyle = occupied ? rim : "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.strokeRect(tube.x + 1, tube.y + 1, tube.w - 2, tube.h - 2);
      ctx.fillStyle = occupied ? rim : "rgba(226, 232, 240, 0.85)";
      ctx.beginPath();
      ctx.ellipse(tube.x + tube.w / 2, tube.y + tube.h, tube.w / 2 - 1, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.ellipse(tube.x + tube.w / 2, tube.y + tube.h, tube.w / 2 - 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawTube(SL_BOY_TUBE, !!extras.boyTube, "#7dd3fc", "#0284c7");
    drawTube(SL_GIRL_TUBE, !!extras.girlTube, "#f9a8d4", "#db2777");
    ctx.textAlign = "center";
    ctx.font = "900 22px Segoe UI";
    ctx.fillStyle = "#7dd3fc";
    ctx.fillText(t("miniSplitBoys"), 250, 118);
    ctx.fillStyle = "#f9a8d4";
    ctx.fillText(t("miniSplitGirls"), 750, 118);
    extras.rooms.forEach((room) => {
      ctx.fillStyle = "rgba(15, 6, 18, 0.92)";
      ctx.beginPath();
      ctx.arc(room.cx, room.cy, room.r + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(room.cx, room.cy, room.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(room.cx, room.cy, room.r - 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(251, 113, 133, 0.22)";
      ctx.font = "900 36px Segoe UI";
      ctx.fillText("♥", room.cx, room.cy + 12);
      ctx.fillStyle = "#ffe4e6";
      ctx.font = "800 14px Segoe UI";
      ctx.fillText(`${room.boyName} + ${room.girlName}`, room.cx, room.cy - room.r - 16);
    });
  }

  function minigameWorldPoint(point) {
    if (minigame && (minigame.kind === "splitlove" || minigame.kind === "teamspike") && minigame.extras) {
      return {
        x: point.x + (minigame.extras.camX || 0),
        y: point.y + (minigame.extras.camY || 0)
      };
    }
    return point;
  }

  function updateRace(step) {
    const floor = 520;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.35 * step;
      ball.vx = Math.min(8.2, ball.vx + 0.045 * step);
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > floor - ball.radius) {
        ball.y = floor - ball.radius;
        ball.vy = 0;
      }
      ball.x = Math.max(ball.radius, Math.min(WIDTH - ball.radius, ball.x));
      ball.score = ball.x;
      if (ball.x >= 920) {
        ball.state = "done";
        ball.score = Math.round(10000 - minigame.elapsed * 8);
        addParticles(ball.x, ball.y, ball.color, 16);
      }
    });
    resolveMarbleCollisions();
    if (marbles.every((ball) => ball.state !== "active")) finishMinigame();
  }

  function updateCollectFloor(step) {
    minigame.spawn += step;
    if (minigame.spawn > 20) {
      minigame.spawn = 0;
      spawnCollectible();
    }
    minigame.items.forEach((item) => {
      item.x += (item.vx || 0) * step;
      item.y += (item.vy || 0) * step;
    });
    minigame.items = minigame.items.filter((item) => item.y > -40 && item.y < HEIGHT + 40 && item.x > -40 && item.x < WIDTH + 40);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.38 * step;
      ball.vx *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateCollectFloat(step) {
    const def = minigame.def;
    minigame.spawn += step;
    if (!def.staticItems && minigame.items.length < Math.max(3, Math.min(8, 2 + marbles.length)) && minigame.spawn > 16) {
      minigame.spawn = 0;
      spawnCollectible();
      minigame.items[minigame.items.length - 1].vy = 0;
      minigame.items[minigame.items.length - 1].y = 50 + Math.random() * 500;
    }
    minigame.items.forEach((item) => {
      item.pulse = (item.pulse || 0) + 0.08 * step;
    });
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius + 4);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateArena(step) {
    if (minigame.def.shrink) minigame.arenaR = Math.max(88, 230 - minigame.elapsed * 5.2);
    const wind = Math.sin(minigame.elapsed * 1.7) * 0.04;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx += wind * step;
      ball.vy += Math.cos(minigame.elapsed * 1.1) * 0.03 * step;
      ball.vx *= 0.994;
      ball.vy *= 0.994;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (Math.hypot(ball.x - 500, ball.y - 300) > minigame.arenaR - 4) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, ball.color, 16);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateDodgeFall(step) {
    minigame.spawn += step;
    if (minigame.spawn > (minigame.def.slow ? 28 : 16)) {
      minigame.spawn = 0;
      spawnHazard();
    }
    minigame.items.forEach((item) => {
      item.y += item.vy * step;
    });
    minigame.items = minigame.items.filter((item) => item.y < HEIGHT + 30);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.35 * step;
      ball.vx *= 0.98;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      if (minigame.items.some((item) => collectItem(ball, item))) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, "#ff6b35", 16);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateCollectSide(step) {
    minigame.spawn += step;
    if (minigame.spawn > 18) {
      minigame.spawn = 0;
      spawnCollectible();
    }
    minigame.items.forEach((item) => {
      item.x += (item.vx || 2.4) * step;
      if (item.x < -24 || item.x > WIDTH + 24) item.vx *= -1;
    });
    minigame.items = minigame.items.filter((item) => item.y > -40 && item.y < HEIGHT + 40);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.4 * step;
      ball.vx *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.x < ball.radius || ball.x > WIDTH - ball.radius) ball.vx *= -0.72;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateCollectRise(step) {
    minigame.spawn += step;
    if (minigame.spawn > 22) {
      minigame.spawn = 0;
      spawnCollectible();
      const last = minigame.items[minigame.items.length - 1];
      last.kind = "balloon";
      last.r = 10;
    }
    minigame.items.forEach((item) => {
      item.y += (item.vy || -2.2) * step;
      item.r = Math.min(22, (item.r || 10) + 0.04 * step);
    });
    minigame.items = minigame.items.filter((item) => item.y > -50);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.26 * step;
      ball.vx *= 0.98;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy *= -0.22;
      }
      clampMarble(ball, ball.radius);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateMagnet(step) {
    minigame.spawn += step;
    if (minigame.items.length < 7 && minigame.spawn > 14) {
      minigame.spawn = 0;
      spawnCollectible();
      const last = minigame.items[minigame.items.length - 1];
      last.vy = 0;
      last.y = 50 + Math.random() * 500;
    }
    minigame.items.forEach((item) => {
      const near = marbles.filter((ball) => ball.state === "active").sort((a, b) => Math.hypot(a.x - item.x, a.y - item.y) - Math.hypot(b.x - item.x, b.y - item.y))[0];
      if (near) {
        const dx = near.x - item.x;
        const dy = near.y - item.y;
        const dist = Math.max(8, Math.hypot(dx, dy));
        item.x += (dx / dist) * 1.1 * step;
        item.y += (dy / dist) * 1.1 * step;
      }
      item.pulse = (item.pulse || 0) + 0.1 * step;
    });
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.97;
      ball.vy *= 0.97;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius + 4);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateBubbles(step) {
    if (!minigame.items.length) {
      minigame.items = Array.from({ length: 10 }, () => ({
        kind: "bubble",
        x: 70 + Math.random() * 860,
        y: 70 + Math.random() * 460,
        r: 10 + Math.random() * 8,
        pulse: Math.random() * 6,
        grow: 0.03 + Math.random() * 0.04
      }));
    }
    minigame.items.forEach((item) => {
      item.r = 8 + Math.abs(Math.sin((item.pulse || 0) + minigame.elapsed * (item.grow || 0.08))) * 10;
      item.y -= 0.25 * step;
      if (item.y < -20) item.y = HEIGHT + 10;
      item.pulse = (item.pulse || 0) + 0.06 * step;
    });
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.98;
      ball.vy *= 0.98;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius + 4);
      minigame.items = minigame.items.filter((item) => {
        if (!collectItem(ball, item)) return true;
        ball.score += Math.max(1, Math.round(item.r / 6));
        addParticles(item.x, item.y, "#7dd3fc", 10);
        return false;
      });
    });
    resolveMarbleCollisions();
  }

  function updateMirror(step) {
    minigame.spawn += step;
    if (minigame.items.length < 6 && minigame.spawn > 16) {
      minigame.spawn = 0;
      spawnCollectible();
      const last = minigame.items[minigame.items.length - 1];
      last.vy = 0;
      last.y = 50 + Math.random() * 500;
    }
    if (Math.floor(minigame.elapsed / 4) !== Math.floor((minigame.elapsed - step / 60) / 4)) {
      minigame.items.forEach((item) => {
        item.x = WIDTH - item.x;
      });
    }
    minigame.items.forEach((item) => {
      item.pulse = (item.pulse || 0) + 0.08 * step;
    });
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius + 4);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateSumo(step) {
    minigame.arenaR = 210;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.992;
      ball.vy *= 0.992;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (Math.hypot(ball.x - 500, ball.y - 300) > minigame.arenaR - 4) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, ball.color, 16);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    marbles.forEach((a, index) => {
      if (a.state !== "active") return;
      marbles.slice(index + 1).forEach((b) => {
        if (b.state !== "active") return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < a.radius + b.radius + 2) {
          a.vx -= (dx / Math.max(1, dist)) * 0.8;
          a.vy -= (dy / Math.max(1, dist)) * 0.8;
          b.vx += (dx / Math.max(1, dist)) * 0.8;
          b.vy += (dy / Math.max(1, dist)) * 0.8;
        }
      });
    });
    lastStandingCheck();
  }

  function updateSnow(step) {
    minigame.spawn += step;
    if (minigame.spawn > 28) {
      minigame.spawn = 0;
      spawnHazard();
      const last = minigame.items[minigame.items.length - 1];
      last.r = 18;
      last.vy = 1.4 + Math.random();
      last.wx = Math.random() * 6;
    }
    minigame.items.forEach((item) => {
      item.y += item.vy * step;
      item.x += Math.sin(minigame.elapsed * 1.4 + (item.wx || 0)) * 1.6 * step;
    });
    minigame.items = minigame.items.filter((item) => item.y < HEIGHT + 30);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.3 * step;
      ball.vx *= 0.995;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      if (minigame.items.some((item) => collectItem(ball, item))) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, "#e0f2fe", 16);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateHooks(step) {
    minigame.spawn += step;
    if (minigame.spawn > 15) {
      minigame.spawn = 0;
      spawnHazard();
      const last = minigame.items[minigame.items.length - 1];
      last.r = 7;
      last.vy = 3.4 + Math.random();
      last.phase = Math.random() * 6;
    }
    minigame.items.forEach((item) => {
      item.y += item.vy * step;
      item.x += Math.sin(minigame.elapsed * 5 + (item.phase || 0)) * 3.2 * step;
    });
    minigame.items = minigame.items.filter((item) => item.y < HEIGHT + 30);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.36 * step;
      ball.vx *= 0.97;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      if (minigame.items.some((item) => collectItem(ball, item))) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, "#ff6b35", 16);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updatePaint(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius);
      minigame.tiles.forEach((tile) => {
        if (ball.x > tile.x && ball.x < tile.x + tile.w && ball.y > tile.y && ball.y < tile.y + tile.h) {
          tile.owner = ball.recordId;
          tile.color = ball.color;
        }
      });
      ball.score = minigame.tiles.filter((tile) => tile.owner === ball.recordId).length;
    });
    resolveMarbleCollisions();
  }

  function updateKing(step) {
    const platform = minigame.platforms[0];
    platform.x = 220 + Math.sin(minigame.elapsed * 1.3) * 260;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.grounded = false;
      ball.vy += 0.34 * step;
      ball.vx *= 0.99;
      const prevY = ball.y;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      resolveWorldBlocks(ball, ball.x, prevY, minigame.platforms);
      if (ball.grounded) ball.score += step / 10;
      if (ball.y > HEIGHT + 16) {
        ball.state = "lost";
        addParticles(ball.x, HEIGHT - 16, ball.color, 12);
      }
      clampMarble(ball, ball.radius);
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updatePinball(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.22 * step;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius + 2);
      minigame.items.forEach((bumper) => {
        const dx = ball.x - bumper.x;
        const dy = ball.y - bumper.y;
        const dist = Math.hypot(dx, dy);
        if (dist < ball.radius + bumper.r) {
          const nx = dx / Math.max(0.1, dist);
          const ny = dy / Math.max(0.1, dist);
          ball.x = bumper.x + nx * (ball.radius + bumper.r);
          ball.y = bumper.y + ny * (ball.radius + bumper.r);
          ball.vx = nx * 6.2;
          ball.vy = ny * 6.2;
          ball.score += 1;
          addParticles(bumper.x, bumper.y, "#93c5fd", 8);
        }
      });
    });
    resolveMarbleCollisions();
  }

  function updateSoccer(step) {
    const puck = minigame.extras.ball;
    puck.vy += 0.2 * step;
    puck.vx *= 0.995;
    puck.x += puck.vx * step;
    puck.y += puck.vy * step;
    if (puck.y > 520 - puck.r) {
      puck.y = 520 - puck.r;
      puck.vy *= -0.62;
    }
    if (puck.x < puck.r || puck.x > WIDTH - puck.r) puck.vx *= -0.7;
    puck.x = Math.max(puck.r, Math.min(WIDTH - puck.r, puck.x));
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.34 * step;
      ball.vx *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 520 - ball.radius) {
        ball.y = 520 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      const dx = puck.x - ball.x;
      const dy = puck.y - ball.y;
      const dist = Math.hypot(dx, dy);
      if (dist < ball.radius + puck.r) {
        puck.vx += (dx / Math.max(1, dist)) * 3.4 + ball.vx * 0.4;
        puck.vy += (dy / Math.max(1, dist)) * 3.4 + ball.vy * 0.4;
        minigame.extras.last = ball;
      }
    });
    if (puck.x > 910 && puck.y > 210 && puck.y < 390) {
      if (minigame.extras.last) minigame.extras.last.score += 1;
      puck.x = 500;
      puck.y = 240;
      puck.vx = (Math.random() - 0.5) * 3;
      puck.vy = 0;
      addParticles(940, 300, "#4ade80", 18);
    }
    resolveMarbleCollisions();
  }

  function updateIce(step) {
    minigame.spawn += step;
    if (minigame.spawn > 24) {
      minigame.spawn = 0;
      spawnCollectible();
      const last = minigame.items[minigame.items.length - 1];
      last.kind = "gem";
      last.vy = 0;
      last.y = 80 + Math.random() * 400;
    }
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.12 * step;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy *= -0.15;
      }
      clampMarble(ball, ball.radius);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateLaser(step) {
    minigame.extras.laserY += minigame.extras.laserDir * 2.1 * step;
    if (minigame.extras.laserY > 560 || minigame.extras.laserY < 40) minigame.extras.laserDir *= -1;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.986;
      ball.vy *= 0.986;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius);
      if (Math.abs(ball.y - minigame.extras.laserY) < ball.radius + 5) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, "#fb7185", 14);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateFlash(step) {
    minigame.extras.flashIn += step;
    if (minigame.extras.flashIn > 70) {
      minigame.extras.flashIn = 0;
      const pool = marbles.filter((ball) => ball.state === "active");
      if (pool.length) minigame.extras.flashId = pool[Math.floor(Math.random() * pool.length)].recordId;
    }
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.96;
      ball.vy *= 0.96;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, 80);
    });
    resolveMarbleCollisions();
  }

  function updateBelts(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.grounded = false;
      ball.vy += 0.32 * step;
      const prevY = ball.y;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      resolveWorldBlocks(ball, ball.x, prevY, minigame.platforms);
      if (ball.y > HEIGHT + 16) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, HEIGHT - 12, ball.color, 12);
        return;
      }
      if (ball.grounded) ball.score += step / 12;
      clampMarble(ball, ball.radius);
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateBlackhole(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const dx = 500 - ball.x;
      const dy = 300 - ball.y;
      const dist = Math.max(18, Math.hypot(dx, dy));
      ball.vx += (dx / dist) * 0.085 * step;
      ball.vy += (dy / dist) * 0.085 * step;
      ball.vx *= 0.99;
      ball.vy *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (dist < 26) {
        ball.state = "lost";
        ball.score = Math.max(0, ball.score);
        addParticles(500, 300, "#c084fc", 16);
        return;
      }
      takeItems(ball);
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateVolley(step) {
    const puck = minigame.extras.ball;
    puck.vy += 0.18 * step;
    puck.x += puck.vx * step;
    puck.y += puck.vy * step;
    if (puck.x < puck.r || puck.x > WIDTH - puck.r) puck.vx *= -1;
    if (puck.y < puck.r) puck.vy = Math.abs(puck.vy);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.32 * step;
      ball.vx *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 530 - ball.radius) {
        ball.y = 530 - ball.radius;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      if (Math.hypot(puck.x - ball.x, puck.y - ball.y) < ball.radius + puck.r) {
        puck.vy = -7.2;
        puck.vx += (puck.x - ball.x) * 0.12;
        ball.score += 1;
      }
    });
    if (puck.y > HEIGHT) {
      puck.x = 500;
      puck.y = 160;
      puck.vx = (Math.random() - 0.5) * 3;
      puck.vy = 0;
    }
    resolveMarbleCollisions();
  }

  function updateMaze(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.96;
      ball.vy *= 0.96;
      const prevX = ball.x;
      const prevY = ball.y;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      resolveWorldBlocks(ball, prevX, prevY, minigame.walls);
      clampMarble(ball, ball.radius);
      const goal = minigame.extras.goal;
      if (ball.x > goal.x && ball.x < goal.x + goal.w && ball.y > goal.y && ball.y < goal.y + goal.h) {
        ball.state = "done";
        ball.score = Math.round(5000 - minigame.elapsed * 8);
        addParticles(ball.x, ball.y, "#4ade80", 16);
      }
    });
    resolveMarbleCollisions();
    if (marbles.every((ball) => ball.state !== "active")) finishMinigame();
  }

  function updatePotato(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.99;
      ball.vy *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, 40);
      if (ball.recordId === minigame.extras.holder) ball.hold = (ball.hold || 0) + step / 60;
      ball.score = Math.max(0, minigame.elapsed - (ball.hold || 0));
    });
    resolveMarbleCollisions();
  }

  function updateFlipgrav(step) {
    minigame.spawn += step;
    if (minigame.spawn > 22) {
      minigame.spawn = 0;
      spawnCollectible();
    }
    minigame.items.forEach((item) => {
      item.y += (item.vy || 2) * step;
    });
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const g = ball.flip ? -0.34 : 0.34;
      ball.vy += g * step;
      ball.vx *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (!ball.flip && ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
      }
      if (ball.flip && ball.y < ball.radius + 16) {
        ball.y = ball.radius + 16;
        ball.vy = 0;
      }
      clampMarble(ball, ball.radius);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateTargets(step) {
    minigame.items.forEach((item) => {
      item.x += item.vx * step;
      if (item.x < 80 || item.x > 920) item.vx *= -1;
    });
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vy += 0.28 * step;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
        ball.vx *= 0.92;
      }
      clampMarble(ball, ball.radius);
      minigame.items.forEach((item) => {
        if (collectItem(ball, item)) {
          ball.score += 1;
          item.y = 70 + Math.random() * 80;
          addParticles(item.x, item.y, "#fb7185", 10);
        }
      });
    });
    resolveMarbleCollisions();
  }

  function updatePortals(step) {
    const [a, b] = minigame.extras.portals;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius);
      if (!ball.portalCool && Math.hypot(ball.x - a.x, ball.y - a.y) < a.r) {
        ball.x = b.x;
        ball.y = b.y;
        ball.portalCool = 18;
        ball.score += 1;
      } else if (!ball.portalCool && Math.hypot(ball.x - b.x, ball.y - b.y) < b.r) {
        ball.x = a.x;
        ball.y = a.y;
        ball.portalCool = 18;
        ball.score += 1;
      }
      if (ball.portalCool) ball.portalCool -= step;
    });
    minigame.spawn += step;
    if (minigame.spawn > 26) {
      minigame.spawn = 0;
      spawnCollectible();
      const last = minigame.items[minigame.items.length - 1];
      last.vy = 0;
      last.y = 80 + Math.random() * 420;
    }
    marbles.forEach((ball) => {
      if (ball.state === "active") takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateRhythm(step) {
    minigame.extras.ring -= 1.15 * step;
    if (minigame.extras.ring < 18) minigame.extras.ring = 96;
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.94;
      ball.vy *= 0.94;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, 70);
    });
    resolveMarbleCollisions();
  }

  function updateTornado(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const dx = ball.x - 500;
      const dy = ball.y - 300;
      ball.vx += -dy * 0.0018 * step;
      ball.vy += dx * 0.0018 * step;
      ball.vx *= 0.99;
      ball.vy *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, 20);
      takeItems(ball);
    });
    resolveMarbleCollisions();
  }

  function updateRelay(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius);
      const next = minigame.items.find((item) => item.n === ball.next);
      if (next && collectItem(ball, next)) {
        ball.next += 1;
        ball.score += 1;
        addParticles(next.x, next.y, "#4ade80", 10);
        if (ball.next > minigame.items.length) {
          ball.state = "done";
          ball.score += 8;
        }
      }
    });
    resolveMarbleCollisions();
  }

  function updateGhost(step) {
    const ghost = minigame.extras.ghost;
    const prey = marbles.filter((ball) => ball.state === "active").sort((a, b) => Math.hypot(a.x - ghost.x, a.y - ghost.y) - Math.hypot(b.x - ghost.x, b.y - ghost.y))[0];
    if (prey) {
      dashToward(ghost, prey, 2.15);
      ghost.x += ghost.vx * step;
      ghost.y += ghost.vy * step;
    }
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius);
      if (Math.hypot(ball.x - ghost.x, ball.y - ghost.y) < ball.radius + 16) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, "#e5e7eb", 14);
        return;
      }
      ball.score = minigame.elapsed;
    });
    resolveMarbleCollisions();
    lastStandingCheck();
  }

  function updateMosaic(step) {
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.vx *= 0.985;
      ball.vy *= 0.985;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      clampMarble(ball, ball.radius);
      const zone = minigame.extras.zones[ball.zone];
      if (ball.x >= zone.x && ball.x <= zone.x + zone.w && ball.y >= zone.y && ball.y <= zone.y + zone.h) {
        ball.score += step / 8;
      }
    });
    resolveMarbleCollisions();
  }

  function updateHoops(step) {
    minigame.spawn += step;
    if (minigame.spawn > 50) {
      minigame.spawn = 0;
      minigame.items.push({ kind: "hoop", x: WIDTH + 20, y: 180 + Math.random() * 220, r: 34, vx: -2.6 });
    }
    minigame.items.forEach((item) => {
      item.x += item.vx * step;
    });
    minigame.items = minigame.items.filter((item) => item.x > -40);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      ball.grounded = false;
      ball.vy += 0.34 * step;
      ball.vx *= 0.99;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
        ball.grounded = true;
      }
      clampMarble(ball, ball.radius);
      minigame.items.forEach((item) => {
        if (!item.hit && Math.abs(ball.x - item.x) < 12 && Math.abs(ball.y - item.y) < item.r) {
          item.hit = true;
          ball.score += 1;
          addParticles(item.x, item.y, "#fde68a", 10);
        }
      });
    });
    resolveMarbleCollisions();
  }

  function setupComboWorld(def, alive) {
    const move = def.move;
    const goal = def.goal;
    const hazard = def.hazard;
    if (goal === "race") {
      marbles = layoutMinigameMarbles(alive, (index) => ({
        x: 48 + (index % 3) * 28,
        y: 430 - Math.floor(index / 3) * 32,
        vx: 1.1
      }));
    } else if (goal === "exit") {
      marbles = layoutMinigameMarbles(alive, (index) => ({ x: 60 + (index % 4) * 28, y: 80 + Math.floor(index / 4) * 32 }));
    } else if (move === "belt") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadFloor(index, total, 220));
    } else if (move === "spin" || move === "hole" || hazard === "shrink") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadCircle(index, total, 70));
    } else if (move === "floor" || move === "ice" || move === "flip" || goal === "hoops" || goal === "kick") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadFloor(index, total, goal === "kick" ? 420 : 508));
    } else if (goal === "paint" || goal === "zones") {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
    } else {
      marbles = layoutMinigameMarbles(alive, (index, total) => spreadGrid(index, total));
    }
    if (move === "belt") {
      minigame.platforms = [
        { x: 40, y: 260, w: 280, h: 16, dir: 1 },
        { x: 360, y: 340, w: 280, h: 16, dir: -1 },
        { x: 680, y: 260, w: 280, h: 16, dir: 1 },
        { x: 200, y: 460, w: 280, h: 16, dir: -1 },
        { x: 560, y: 500, w: 280, h: 16, dir: 1 }
      ];
    }
    if (goal === "paint") {
      const cols = 16;
      const rows = 10;
      minigame.tiles = Array.from({ length: cols * rows }, (_, i) => ({
        x: (i % cols) * (WIDTH / cols),
        y: Math.floor(i / cols) * (HEIGHT / rows),
        w: WIDTH / cols,
        h: HEIGHT / rows,
        owner: ""
      }));
    }
    if (goal === "flags") {
      minigame.items = [180, 400, 620, 840].map((x, index) => ({ kind: "flag", x, y: 180 + (index % 2) * 220, r: 18, n: index + 1 }));
      marbles.forEach((ball) => {
        ball.next = 1;
      });
    }
    if (goal === "zones") {
      minigame.extras.zones = [
        { x: 0, y: 0, w: 500, h: 300, color: "rgba(85,214,255,0.18)" },
        { x: 500, y: 0, w: 500, h: 300, color: "rgba(255,107,53,0.18)" },
        { x: 0, y: 300, w: 500, h: 300, color: "rgba(192,132,252,0.18)" },
        { x: 500, y: 300, w: 500, h: 300, color: "rgba(74,222,128,0.18)" }
      ];
      marbles.forEach((ball, index) => {
        ball.zone = index % 4;
      });
    }
    if (goal === "kick") {
      minigame.extras.ball = { x: 500, y: 240, vx: 2.2, vy: 0, r: 18 };
    }
    if (goal === "exit") {
      minigame.walls = [
        { x: 180, y: 20, w: 18, h: 430 },
        { x: 360, y: 150, w: 18, h: 430 },
        { x: 540, y: 20, w: 18, h: 430 },
        { x: 720, y: 150, w: 18, h: 430 },
        { x: 180, y: 20, w: 160, h: 18 },
        { x: 540, y: 432, w: 160, h: 18 }
      ];
      minigame.extras.goal = { x: 900, y: 250, w: 70, h: 90 };
    }
    if (goal === "flash") {
      minigame.extras.flashId = marbles[0] ? marbles[0].recordId : "";
      minigame.extras.flashIn = 0;
    }
    if (def.clickMode === "pass") {
      minigame.extras.holder = marbles[0] ? marbles[0].recordId : "";
    }
    if (hazard === "ghost") {
      minigame.extras.ghost = { x: 500, y: 40, vx: 0, vy: 0 };
    }
    if (hazard === "laser") {
      minigame.extras.laserY = 80;
      minigame.extras.laserDir = 1;
    }
    if (def.staticItems && goal === "collect") {
      minigame.items = Array.from({ length: 10 }, () => ({
        kind: def.item || "orb",
        x: 70 + Math.random() * 860,
        y: 70 + Math.random() * 460,
        r: 12,
        pulse: Math.random() * 6
      }));
    }
  }

  function comboHasFloor(def) {
    return def.move === "floor" || def.move === "ice" || def.move === "flip" || def.goal === "race" || def.goal === "hoops" || def.goal === "kick";
  }

  function comboUsesRing(def) {
    return def.hazard === "shrink" || (def.goal === "survive" && (def.move === "spin" || def.move === "hole"));
  }

  function applyComboMove(ball, step, def) {
    if (def.move === "belt") {
      ball.grounded = false;
      ball.vy += 0.32 * step;
      const prevY = ball.y;
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;
      resolveWorldBlocks(ball, ball.x, prevY, minigame.platforms);
      if (ball.y > HEIGHT + 16) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, HEIGHT - 12, ball.color, 12);
      }
      clampMarble(ball, ball.radius);
      return;
    }
    if (def.move === "floor") {
      ball.vy += 0.38 * step;
      ball.vx *= 0.985;
    } else if (def.move === "ice") {
      ball.vy += 0.14 * step;
      ball.vx *= 0.998;
    } else if (def.move === "float") {
      ball.vx *= 0.985;
      ball.vy *= 0.985;
    } else if (def.move === "spin") {
      const dx = ball.x - 500;
      const dy = ball.y - 300;
      ball.vx += -dy * 0.0018 * step;
      ball.vy += dx * 0.0018 * step;
      ball.vx *= 0.99;
      ball.vy *= 0.99;
    } else if (def.move === "hole") {
      const dx = 500 - ball.x;
      const dy = 300 - ball.y;
      const dist = Math.max(18, Math.hypot(dx, dy));
      ball.vx += (dx / dist) * 0.085 * step;
      ball.vy += (dy / dist) * 0.085 * step;
      ball.vx *= 0.99;
      ball.vy *= 0.99;
    } else if (def.move === "flip") {
      ball.vy += (ball.flip ? -0.34 : 0.34) * step;
      ball.vx *= 0.99;
    }
    if (def.hazard === "wind") {
      ball.vx += Math.sin(minigame.elapsed * 1.7) * 0.05 * step;
    }
    ball.x += ball.vx * step;
    ball.y += ball.vy * step;
    if (def.move === "floor" || def.goal === "race" || def.goal === "hoops" || def.goal === "kick") {
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
        ball.grounded = true;
      }
    }
    if (def.move === "ice") {
      if (ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy *= -0.15;
      }
    }
    if (def.move === "flip") {
      if (!ball.flip && ball.y > 540 - ball.radius) {
        ball.y = 540 - ball.radius;
        ball.vy = 0;
        ball.grounded = true;
      }
      if (ball.flip && ball.y < ball.radius + 16) {
        ball.y = ball.radius + 16;
        ball.vy = 0;
        ball.grounded = true;
      }
    }
    if (def.goal === "exit") {
      resolveWorldBlocks(ball, ball.x, ball.y, minigame.walls);
    }
    clampMarble(ball, ball.radius);
  }

  function applyComboHazard(ball, step, def) {
    if (def.hazard === "shrink" || comboUsesRing(def)) {
      if (Math.hypot(ball.x - 500, ball.y - 300) > minigame.arenaR - 4) {
        ball.state = "lost";
        ball.score = minigame.elapsed;
        addParticles(ball.x, ball.y, ball.color, 14);
        return true;
      }
    }
    if (def.move === "hole" && Math.hypot(ball.x - 500, ball.y - 300) < 26) {
      ball.state = "lost";
      ball.score = Math.max(0, ball.score);
      addParticles(500, 300, "#c084fc", 16);
      return true;
    }
    if ((def.hazard === "fall" || def.hazard === "hooks") && minigame.items.some((item) => item.kind === "hazard" && collectItem(ball, item))) {
      ball.state = "lost";
      ball.score = minigame.elapsed;
      addParticles(ball.x, ball.y, "#ff6b35", 14);
      return true;
    }
    if (def.hazard === "laser" && Math.abs(ball.y - minigame.extras.laserY) < ball.radius + 5) {
      ball.state = "lost";
      ball.score = minigame.elapsed;
      addParticles(ball.x, ball.y, "#fb7185", 14);
      return true;
    }
    if (def.hazard === "ghost" && minigame.extras.ghost && Math.hypot(ball.x - minigame.extras.ghost.x, ball.y - minigame.extras.ghost.y) < ball.radius + 16) {
      ball.state = "lost";
      ball.score = minigame.elapsed;
      addParticles(ball.x, ball.y, "#e5e7eb", 14);
      return true;
    }
    return false;
  }

  function applyComboGoal(ball, step, def) {
    if (def.goal === "collect") takeItems(ball);
    if (def.goal === "survive") ball.score = minigame.elapsed;
    if (def.goal === "race") {
      ball.score = Math.max(ball.score || 0, ball.x);
      if (ball.x >= 920) {
        ball.state = "done";
        ball.score = Math.round(10000 - minigame.elapsed * 8);
        addParticles(ball.x, ball.y, ball.color, 16);
      }
    }
    if (def.goal === "paint") {
      minigame.tiles.forEach((tile) => {
        if (ball.x > tile.x && ball.x < tile.x + tile.w && ball.y > tile.y && ball.y < tile.y + tile.h) {
          tile.owner = ball.recordId;
          tile.color = ball.color;
        }
      });
      ball.score = minigame.tiles.filter((tile) => tile.owner === ball.recordId).length;
    }
    if (def.goal === "flags") {
      const next = minigame.items.find((item) => item.n === ball.next);
      if (next && collectItem(ball, next)) {
        ball.next += 1;
        ball.score += 1;
        addParticles(next.x, next.y, "#4ade80", 10);
        if (ball.next > minigame.items.filter((item) => item.kind === "flag").length) {
          ball.state = "done";
          ball.score += 8;
        }
      }
    }
    if (def.goal === "zones") {
      const zone = minigame.extras.zones[ball.zone];
      if (zone && ball.x >= zone.x && ball.x <= zone.x + zone.w && ball.y >= zone.y && ball.y <= zone.y + zone.h) {
        ball.score += step / 8;
      }
    }
    if (def.goal === "hoops") {
      minigame.items.forEach((item) => {
        if (item.kind === "hoop" && !item.hit && Math.abs(ball.x - item.x) < 12 && Math.abs(ball.y - item.y) < item.r) {
          item.hit = true;
          ball.score += 1;
          addParticles(item.x, item.y, "#fde68a", 10);
        }
      });
    }
    if (def.goal === "exit") {
      const goal = minigame.extras.goal;
      if (goal && ball.x > goal.x && ball.x < goal.x + goal.w && ball.y > goal.y && ball.y < goal.y + goal.h) {
        ball.state = "done";
        ball.score = Math.round(5000 - minigame.elapsed * 8);
        addParticles(ball.x, ball.y, "#4ade80", 16);
      }
    }
    if (def.clickMode === "pass" && minigame.extras.holder) {
      if (ball.recordId === minigame.extras.holder) {
        if (def.goal === "survive") ball.hold = (ball.hold || 0) + step / 60;
        else ball.score += step / 10;
      }
      if (def.goal === "survive") ball.score = Math.max(0, minigame.elapsed - (ball.hold || 0));
    }
  }

  function updateComboPuck(step, def) {
    const puck = minigame.extras.ball;
    if (!puck) return;
    puck.vy += (def.move === "float" ? 0.08 : 0.2) * step;
    puck.vx *= 0.995;
    puck.x += puck.vx * step;
    puck.y += puck.vy * step;
    if (puck.y > 520 - puck.r) {
      puck.y = 520 - puck.r;
      puck.vy *= -0.62;
    }
    if (puck.x < puck.r || puck.x > WIDTH - puck.r) puck.vx *= -0.7;
    puck.x = Math.max(puck.r, Math.min(WIDTH - puck.r, puck.x));
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      const dist = Math.hypot(puck.x - ball.x, puck.y - ball.y);
      if (dist < ball.radius + puck.r) {
        puck.vx += ((puck.x - ball.x) / Math.max(1, dist)) * 3.4 + ball.vx * 0.4;
        puck.vy += ((puck.y - ball.y) / Math.max(1, dist)) * 3.4 + ball.vy * 0.4;
        minigame.extras.last = ball;
      }
    });
    if (puck.x > 910 && puck.y > 210 && puck.y < 390 && minigame.extras.last) {
      minigame.extras.last.score += 1;
      puck.x = 500;
      puck.y = 240;
      puck.vx = (Math.random() - 0.5) * 3;
      puck.vy = 0;
      addParticles(940, 300, "#4ade80", 18);
    }
  }

  function updateCombo(step) {
    const def = minigame.def;
    minigame.spawnCollect = (minigame.spawnCollect || 0) + step;
    minigame.spawnHazardT = (minigame.spawnHazardT || 0) + step;
    minigame.spawnHoop = (minigame.spawnHoop || 0) + step;
    if (def.hazard === "shrink") minigame.arenaR = Math.max(88, 230 - minigame.elapsed * 5.2);
    else if (comboUsesRing(def)) minigame.arenaR = 210;
    if (def.goal === "collect" && !def.staticItems && minigame.spawnCollect > 20) {
      minigame.spawnCollect = 0;
      spawnCollectible();
      if (def.move === "float" || def.move === "spin" || def.move === "hole") {
        const last = minigame.items[minigame.items.length - 1];
        last.vy = 0;
        last.y = 50 + Math.random() * 500;
      }
    }
    if (def.goal === "hoops" && minigame.spawnHoop > 50) {
      minigame.spawnHoop = 0;
      minigame.items.push({ kind: "hoop", x: WIDTH + 20, y: 180 + Math.random() * 220, r: 34, vx: -2.6 });
    }
    if ((def.hazard === "fall" || def.hazard === "hooks") && minigame.spawnHazardT > (def.hazard === "hooks" ? 15 : 18)) {
      minigame.spawnHazardT = 0;
      spawnHazard();
      const last = minigame.items[minigame.items.length - 1];
      if (def.hazard === "hooks") {
        last.r = 7;
        last.vy = 3.3 + Math.random();
        last.phase = Math.random() * 6;
      }
    }
    minigame.items.forEach((item) => {
      item.x += (item.vx || 0) * step;
      item.y += (item.vy || 0) * step;
      if (item.phase != null) item.x += Math.sin(minigame.elapsed * 5 + item.phase) * 3.2 * step;
      item.pulse = (item.pulse || 0) + 0.06 * step;
    });
    minigame.items = minigame.items.filter((item) => item.kind === "flag" || item.kind === "target" || (item.x > -50 && item.x < WIDTH + 50 && item.y > -50 && item.y < HEIGHT + 50));
    if (def.hazard === "laser") {
      minigame.extras.laserY += minigame.extras.laserDir * 2.1 * step;
      if (minigame.extras.laserY > 560 || minigame.extras.laserY < 40) minigame.extras.laserDir *= -1;
    }
    if (def.hazard === "ghost" && minigame.extras.ghost) {
      const ghost = minigame.extras.ghost;
      const prey = marbles.filter((ball) => ball.state === "active").sort((a, b) => Math.hypot(a.x - ghost.x, a.y - ghost.y) - Math.hypot(b.x - ghost.x, b.y - ghost.y))[0];
      if (prey) {
        dashToward(ghost, prey, 2.15);
        ghost.x += ghost.vx * step;
        ghost.y += ghost.vy * step;
      }
    }
    if (def.goal === "flash") {
      minigame.extras.flashIn += step;
      if (minigame.extras.flashIn > 70) {
        minigame.extras.flashIn = 0;
        const pool = marbles.filter((ball) => ball.state === "active");
        if (pool.length) minigame.extras.flashId = pool[Math.floor(Math.random() * pool.length)].recordId;
      }
    }
    if (def.goal === "kick") updateComboPuck(step, def);
    marbles.forEach((ball) => {
      if (ball.state !== "active") return;
      applyComboMove(ball, step, def);
      if (ball.state !== "active") return;
      if (applyComboHazard(ball, step, def)) return;
      applyComboGoal(ball, step, def);
    });
    resolveMarbleCollisions();
    if (def.goal === "survive" || def.hazard === "shrink" || def.hazard === "fall" || def.hazard === "hooks" || def.hazard === "laser" || def.hazard === "ghost" || def.move === "belt" || def.move === "hole") {
      lastStandingCheck();
    }
    if ((def.goal === "race" || def.goal === "exit" || def.goal === "flags") && marbles.every((ball) => ball.state !== "active")) finishMinigame();
  }

  function handleComboClick(point, target) {
    const def = minigame.def;
    if (!target && def.goal !== "flash") return;
    if (def.goal === "flash" && target) {
      if (target.recordId === minigame.extras.flashId) {
        target.score += 1;
        minigame.extras.flashIn = 70;
        addParticles(target.x, target.y, "#facc15", 14);
      }
      return;
    }
    if (!target) return;
    if (def.clickMode === "pass") {
      if (target.recordId !== minigame.extras.holder) {
        minigame.extras.holder = target.recordId;
        addParticles(target.x, target.y, "#f59e0b", 12);
      }
      return;
    }
    if (def.clickMode === "dash") dashToward(target, point, 7.1);
    else if (def.clickMode === "pull") dashToward(target, point, 6.4);
    else if (def.clickMode === "shove") {
      const dist = Math.max(12, Math.hypot(target.x - point.x, target.y - point.y));
      target.vx += ((target.x - point.x) / dist) * 4.2;
      target.vy += ((target.y - point.y) / dist) * 4.2;
    } else if (def.clickMode === "boost") {
      target.vx = Math.min(9, target.vx + 3.4);
      target.vy = -1.6;
    } else if (def.clickMode === "jump") {
      target.vy = -7.1;
      target.vx += (point.x - target.x) * 0.03;
    } else if (def.clickMode === "invert") {
      if (def.move === "flip") {
        target.flip = !target.flip;
        target.vy *= 0.2;
      } else {
        dashToward(target, point, 7, true);
      }
    } else if (def.clickMode === "brake") {
      target.vx *= 0.18;
      target.vy *= 0.18;
    } else if (def.clickMode === "tap") {
      target.vx += (point.x - target.x) * 0.05;
      target.vy += (point.y - target.y) * 0.05;
      if (def.goal !== "flash") target.score += 0.15;
    }
  }

  function handleSplitLoveClick(point) {
    const extras = minigame.extras || {};
    const room = (extras.rooms || []).find((item) => Math.hypot(point.x - item.cx, point.y - item.cy) < item.r + 24);
    let pool = marbles.filter((ball) => ball.state === "active");
    if (room) {
      pool = pool.filter((ball) => ball.roomId === room.id);
    } else {
      const gender = point.x < SL_WALL.x + SL_WALL.w / 2 ? "male" : "female";
      pool = pool.filter((ball) => ball.gender === gender && !ball.roomId);
    }
    let target = null;
    let best = 1e9;
    pool.forEach((ball) => {
      const dist = Math.hypot(ball.x - point.x, ball.y - point.y);
      if (dist < best) {
        best = dist;
        target = ball;
      }
    });
    if (!target) return;
    addParticles(point.x, point.y, target.color, 7);
    if (!target.roomId) {
      const extras = minigame.extras;
      const tube = target.gender === "male" ? SL_BOY_TUBE : SL_GIRL_TUBE;
      const tubeKey = target.gender === "male" ? "boyTube" : "girlTube";
      const tubeCx = tube.x + tube.w / 2;
      const tubeCy = tube.y + tube.h - 4;
      if (Math.hypot(point.x - tubeCx, point.y - tubeCy) < 36) {
        if (!extras[tubeKey] || extras[tubeKey] === target.recordId) {
          extras[tubeKey] = target.recordId;
          target.inTube = target.gender === "male" ? "boy" : "girl";
          target.x = tubeCx;
          target.y = tube.y + tube.h * 0.42;
          target.vx = 0;
          target.vy = 0;
          addParticles(target.x, target.y, target.color, 12);
          return;
        }
      }
    }
    dashToward(target, point, 8.4);
  }

  function handleMinigameClick(event) {
    if (!minigame || !minigame.playing) return;
    const point = minigameWorldPoint(canvasPosition(event));
    if (minigame.kind === "splitlove") {
      handleSplitLoveClick(point);
      return;
    }
    if (minigame.kind === "lockpair") {
      const target = nearestActiveMarble(point, 420);
      if (target) {
        addParticles(point.x, point.y, target.color, 7);
        dashToward(target, point, 7.6);
      }
      return;
    }
    if (minigame.kind === "teamspike") {
      handleTeamSpikeClick(point);
      return;
    }
    if (minigame.kind === "boxescape") {
      const target = nearestActiveMarble(point, 420);
      if (target && !target.escaped) {
        addParticles(point.x, point.y, target.color, 7);
        dashToward(target, point, 8.2);
      }
      return;
    }
    const click = minigame.def.click || minigame.def.clickMode || "";
    const tight = click === "potato" || click === "pass" || minigame.kind === "potato" || minigame.kind === "flash" || minigame.def.goal === "flash";
    const target = nearestActiveMarble(point, tight ? 80 : 120);
    if (minigame.kind === "combo") {
      if (target) addParticles(point.x, point.y, target.color, 7);
      handleComboClick(point, target);
      return;
    }
    if (!target && minigame.kind !== "rhythm") return;
    if (target) addParticles(point.x, point.y, target.color, 7);
    if (minigame.kind === "race" && target) {
      target.vx = Math.min(9, target.vx + 3.4);
      target.vy = -1.6;
    } else if ((minigame.kind === "arena" || minigame.kind === "sumo") && target) {
      const dist = Math.max(12, Math.hypot(target.x - point.x, target.y - point.y));
      target.vx += ((target.x - point.x) / dist) * 4.2;
      target.vy += ((target.y - point.y) / dist) * 4.2;
    } else if ((minigame.kind === "collectFloor" || minigame.kind === "collectSide" || minigame.kind === "collectRise" || minigame.kind === "ice" || minigame.kind === "dodgeFall" || minigame.kind === "snow" || minigame.kind === "hooks" || minigame.kind === "targets" || minigame.kind === "hoops") && target) {
      target.vx += (point.x - target.x) * 0.08;
      if (minigame.kind === "hoops" || minigame.kind === "targets") target.vy = -7.1;
    } else if (minigame.kind === "king" || minigame.kind === "belts") {
      if (target && target.grounded) {
        target.vy = -7.3;
        target.vx += (point.x - target.x) * 0.03;
      }
    } else if (minigame.kind === "flash" && target) {
      if (target.recordId === minigame.extras.flashId) {
        target.score += 1;
        minigame.extras.flashIn = 70;
        addParticles(target.x, target.y, "#facc15", 14);
      }
    } else if (minigame.kind === "potato" && target) {
      if (target.recordId !== minigame.extras.holder) {
        minigame.extras.holder = target.recordId;
        addParticles(target.x, target.y, "#f59e0b", 12);
      }
    } else if (minigame.kind === "flipgrav" && target) {
      target.flip = !target.flip;
      target.vy *= 0.2;
    } else if (minigame.kind === "rhythm" && target) {
      if (Math.abs(minigame.extras.ring - 34) < 10) target.score += 1;
    } else if (click === "pull" && target) {
      dashToward(target, point, 6.4);
    } else if (click === "mirror" && target) {
      dashToward(target, point, 7, true);
    } else if (minigame.kind === "custom" && target) {
      const scripts = (minigame.extras && minigame.extras.scripts) || {};
      const speedAmt = scripts.speed ? Number(scripts.speed.amount) || 2 : 1;
      dashToward(target, point, 7.1 * speedAmt);
      if (scripts.jump) {
        const height = scripts.jump.height;
        target.vy = height === "noTanAlto" ? -5.4 : height === "superAlto" ? -12.5 : -8.4;
      }
    } else if (target) {
      dashToward(target, point, 7.1);
    }
  }

  function drawMinigameBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, `hsl(${minigame.hue} 46% 16%)`);
    gradient.addColorStop(1, "#03070a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    for (let x = 0; x < WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
  }

  function drawFoodBite(item, time) {
    const food = getFood(item.foodId) || (minigame && minigame.extras && minigame.extras.food);
    const size = (item.r || 16) * 2.25;
    const img = food ? faceFrameImage(food, item.variant || 0) : null;
    const wobble = 1 + Math.sin((time || 0) * 0.008 + (item.pulse || 0)) * 0.08;
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, item.x - (size * wobble) / 2, item.y - (size * wobble) / 2, size * wobble, size * wobble);
      return;
    }
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(item.x, item.y, (item.r || 16) * wobble, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawItemShape(item, time) {
    if (item.kind === "foodbite") {
      drawFoodBite(item, time);
      return;
    }
    const color = item.color || (item.kind === "hazard" ? "#ff6b35" : itemColor(item.kind));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.r || 10, 0, Math.PI * 2);
    ctx.fill();
    if (item.kind === "hoop") {
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (item.kind === "flag") {
      ctx.fillStyle = "#eaf7ff";
      ctx.font = "800 12px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(String(item.n), item.x, item.y + 4);
    }
    if (item.pulse != null && item.kind !== "hazard") {
      ctx.globalAlpha = 0.35 + Math.sin(time * 0.008 + item.pulse) * 0.2;
      ctx.beginPath();
      ctx.arc(item.x, item.y, (item.r || 10) + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawMinigame(time) {
    drawMinigameBackground(time);
    const kind = minigame.kind;
    if (kind === "splitlove" || kind === "teamspike") {
      ctx.save();
      ctx.translate(-(minigame.extras.camX || 0), -(minigame.extras.camY || 0));
      if (kind === "splitlove") drawSplitLoveWorld();
      else drawTeamSpikeWorld();
    }
    if (kind === "lockpair") drawLockPairWorld();
    if (kind === "boxescape") drawBoxEscapeWorld();
    if (kind === "custom") {
      ((minigame.extras && minigame.extras.parts) || []).forEach((part) => {
        if (part.invisible || isScriptType(part.type)) return;
        if (drawMiniSpecialPart(ctx, part)) return;
        const def = editorPartDef(part.type);
        if (partIsShaped(part)) {
          drawShapedPart(ctx, part, def.color);
        } else {
          ctx.fillStyle = def.color;
          ctx.fillRect(part.x, part.y, part.w, part.h);
        }
      });
    }
    if (kind === "foodfeast" || (kind === "custom" && minigame.extras && minigame.extras.scripts && minigame.extras.scripts.food)) {
      ctx.fillStyle = "rgba(255, 214, 102, 0.08)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    if (kind === "collectFloor" || kind === "collectSide" || kind === "collectRise" || kind === "ice" || kind === "dodgeFall" || kind === "snow" || kind === "hooks" || kind === "soccer" || kind === "volley" || kind === "hoops" || kind === "targets" || kind === "flipgrav" || (kind === "combo" && comboHasFloor(minigame.def))) {
      ctx.fillStyle = "#22303a";
      ctx.fillRect(0, 540, WIDTH, 60);
    }
    if (kind === "arena" || kind === "sumo" || kind === "tornado" || (kind === "combo" && comboUsesRing(minigame.def))) {
      ctx.beginPath();
      ctx.arc(500, 300, minigame.arenaR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 80, 140, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "#ff6b9d";
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    if (kind === "race" || (kind === "combo" && minigame.def.goal === "race")) {
      ctx.fillStyle = "#2a3540";
      ctx.fillRect(0, 520, WIDTH, 80);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(920, 80, 10, 440);
      ctx.fillStyle = "#dcfce7";
      ctx.font = "900 14px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText("META", 925, 68);
    }
    if (kind === "blackhole" || (kind === "combo" && minigame.def.move === "hole")) {
      ctx.fillStyle = "rgba(192,132,252,0.35)";
      ctx.beginPath();
      ctx.arc(500, 300, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    if (kind === "paint" || (kind === "combo" && minigame.def.goal === "paint")) {
      minigame.tiles.forEach((tile) => {
        ctx.fillStyle = tile.color || "rgba(255,255,255,0.03)";
        ctx.fillRect(tile.x + 1, tile.y + 1, tile.w - 2, tile.h - 2);
      });
    }
    if (kind === "mosaic" || (kind === "combo" && minigame.def.goal === "zones")) {
      minigame.extras.zones.forEach((zone) => {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      });
    }
    if (kind === "maze" || (kind === "combo" && minigame.def.goal === "exit")) {
      ctx.fillStyle = "#64748b";
      minigame.walls.forEach((wall) => ctx.fillRect(wall.x, wall.y, wall.w, wall.h));
      const goal = minigame.extras.goal;
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    }
    if (kind !== "custom") {
      (minigame.platforms || []).forEach((platform) => {
        ctx.fillStyle = "#8ec5ff";
        ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      });
    }
    if (kind === "laser" || (kind === "combo" && minigame.def.hazard === "laser")) {
      ctx.fillStyle = "rgba(251,113,133,0.85)";
      ctx.fillRect(0, minigame.extras.laserY - 3, WIDTH, 6);
    }
    if (kind === "portals") {
      minigame.extras.portals.forEach((portal) => {
        ctx.fillStyle = portal.color;
        ctx.beginPath();
        ctx.arc(portal.x, portal.y, portal.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    if (kind === "ghost" || (kind === "combo" && minigame.def.hazard === "ghost" && minigame.extras.ghost)) {
      ctx.fillStyle = "rgba(226,232,240,0.9)";
      ctx.beginPath();
      ctx.arc(minigame.extras.ghost.x, minigame.extras.ghost.y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    if (kind === "rhythm") {
      marbles.forEach((ball) => {
        if (ball.state !== "active") return;
        ctx.strokeStyle = "#f9a8d4";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, minigame.extras.ring, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    if ((kind === "soccer" || kind === "volley" || (kind === "combo" && minigame.def.goal === "kick")) && minigame.extras.ball) {
      if (kind === "soccer" || (kind === "combo" && minigame.def.goal === "kick")) {
        ctx.fillStyle = "rgba(74,222,128,0.25)";
        ctx.fillRect(910, 210, 80, 180);
      }
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(minigame.extras.ball.x, minigame.extras.ball.y, minigame.extras.ball.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (kind === "pinball") {
      minigame.items.forEach((bumper) => {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      minigame.items.forEach((item) => drawItemShape(item, time));
    }
    if (kind === "potato" || (kind === "combo" && minigame.def.clickMode === "pass")) {
      const holder = marbles.find((ball) => ball.recordId === minigame.extras.holder && ball.state === "active");
      if (holder) {
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(holder.x, holder.y - holder.radius - 12, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (kind === "flash" || (kind === "combo" && minigame.def.goal === "flash")) {
      const lit = marbles.find((ball) => ball.recordId === minigame.extras.flashId);
      if (lit && lit.state === "active") {
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(lit.x, lit.y, lit.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    marbles.forEach(drawMarble);
    if (kind === "teamspike") {
      marbles.forEach((ball) => {
        if (!ball.picked || ball.phase !== "area") return;
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    drawParticles();
    if (kind === "splitlove" || kind === "teamspike") ctx.restore();
    const board = marbles.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4);
    ctx.textAlign = "left";
    ctx.font = "700 12px Segoe UI";
    board.forEach((ball, index) => {
      ctx.fillStyle = "rgba(4,10,16,0.55)";
      ctx.fillRect(14, 14 + index * 22, minigame.kind === "foodfeast" ? 220 : 170, 20);
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(26, 24 + index * 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#eaf7ff";
      const scoreText = minigame.kind === "foodfeast" && minigame.foodLimited
        ? `${ball.name} ${Math.round(ball.score || 0)}/${FOOD_FEAST_GOAL}`
        : `${ball.name} ${Math.round(ball.score || 0)}`;
      ctx.fillText(scoreText, 38, 28 + index * 22);
    });
  }

  function handleCanvasClick(event) {
    if (roleplay) return;
    if (minigame && minigame.playing) {
      handleMinigameClick(event);
      return;
    }
    if (!playing || !currentMap) return;
    const point = canvasPosition(event);
    const block = currentMap.blueBlocks.find((item) => item.active && pointInPartSolid(item, point.x, point.y));
    if (!block) return;
    block.active = false;
    addParticles(point.x, point.y, "#3478f6", 15);
  }

  function showRoundModal() {
    if (!lastRoundSummary) return;
    const { saved, lost, round } = lastRoundSummary;
    ui.modalIcon.textContent = saved ? "🏁" : "🌋";
    ui.modalTitle.textContent = saved ? t("roundWon", { n: round }) : t("gameOver");
    ui.modalText.textContent = t("roundResult", { saved, lost });
    ui.nextRound.hidden = saved === 0 && aliveMarbles(getSave()).length === 0;
    ui.modal.hidden = false;
    rejoinPickerOpen = false;
    renderRejoinUi(getSave());
  }

  function refreshLanguage() {
    GameI18n.applyDom(document);
    if (screens.slots.classList.contains("active")) renderSlots();
    if (screens.menu.classList.contains("active") && activeSlot != null) renderMenu();
    if (screens.packs.classList.contains("active")) renderPacks();
    if (screens.packEditor.classList.contains("active")) {
      ui.packEditorTitle.textContent = editingPackId ? t("editPack") : t("createPack");
      renderPackDraft();
      renderPackGenderPanel();
      renderPackPairs();
    }
    if (screens.create && screens.create.classList.contains("active")) {
      renderCreateGender();
      renderCreatePair();
    }
    renderMenuFaces();
    renderMenuFoods();
    if (screens.faceEditor && screens.faceEditor.classList.contains("active") && faceEditor) {
      syncFaceEditorChrome();
      renderFaceEditor();
    }
    if (screens.foodLikes && screens.foodLikes.classList.contains("active")) renderFoodLikes();
    if (screens.levelEditor && screens.levelEditor.classList.contains("active") && levelEditor) {
      setLevelEditorStep(levelEditor.step);
      renderLevelEditor();
    }
    if (screens.game.classList.contains("active") && roleplay) {
      setGameChrome("roleplay");
      updateHouseChrome();
      if (!roleplay.inside) {
        ui.levelTitle.textContent = t("roleplayTitle");
        ui.status.textContent = t("roleplayStatus", { n: marbles.filter((ball) => !ball.houseId).length });
      }
      renderRoleplayFaces();
      renderRoleplayFoods();
    } else if (screens.game.classList.contains("active") && minigame) {
      const def = minigameDef(minigame.id);
      ui.levelTitle.textContent = `${def.icon} ${miniText(def.title)}`;
      if (ui.minigameHint) ui.minigameHint.textContent = `${miniText(def.hint)} ${t("miniNoPenalty")}`;
      updateMinigameStatus();
      if (!ui.modal.hidden) showMinigameModal();
    } else if (screens.game.classList.contains("active") && currentMap) {
      setCampaignTitle();
      updateStatus();
      if (!ui.modal.hidden) showRoundModal();
    }
    if (ui.minigameModal && !ui.minigameModal.hidden) renderMinigamePicker();
    updateRecordButton();
    renderSongList();
  }

  function isRecording() {
    return recordingActive || (recorder && recorder.state === "recording");
  }

  function pickRecorderMime() {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm"
    ];
    if (typeof MediaRecorder === "undefined") return "";
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function getCanvasStream() {
    if (!canvasStream) canvasStream = canvas.captureStream(60);
    return canvasStream;
  }

  function getRecordAudioTrack() {
    const audioEl = window.SharedMusic && typeof SharedMusic.getAudio === "function" ? SharedMusic.getAudio() : null;
    if (!audioEl) return null;
    if (recordMix && recordMix.failed) return null;
    if (!recordMix) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        const ctx = new AudioCtx();
        const dest = ctx.createMediaStreamDestination();
        const source = ctx.createMediaElementSource(audioEl);
        source.connect(ctx.destination);
        source.connect(dest);
        recordMix = { ctx, dest, source };
      } catch (_error) {
        recordMix = { failed: true };
        return null;
      }
    }
    if (recordMix.ctx && recordMix.ctx.state === "suspended") {
      recordMix.ctx.resume().catch(() => {});
    }
    return recordMix.dest ? recordMix.dest.stream.getAudioTracks()[0] || null : null;
  }

  function updateRecordButton() {
    if (!ui.recordButton) return;
    const recording = isRecording();
    ui.recordButton.textContent = recording ? t("recStop") : t("recStart");
    ui.recordButton.classList.toggle("active", recording);
    ui.recordBadge.hidden = !recording;
  }

  function showRecToast(message) {
    if (!ui.recToast) return;
    ui.recToast.textContent = message;
    ui.recToast.hidden = false;
    clearTimeout(recToastTimer);
    recToastTimer = setTimeout(() => {
      ui.recToast.hidden = true;
    }, 2800);
  }

  function downloadRecording(blob) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `marble-escape-r${currentRound || 1}-${stamp}.webm`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
    showRecToast(t("recSaved"));
  }

  function startRecording() {
    if (isRecording()) return;
    if (typeof MediaRecorder === "undefined" || typeof canvas.captureStream !== "function") {
      showRecToast(t("recUnsupported"));
      return;
    }
    const tracks = getCanvasStream().getVideoTracks().slice();
    const audioTrack = getRecordAudioTrack();
    if (audioTrack) tracks.push(audioTrack);
    const mime = pickRecorderMime();
    try {
      recordChunks = [];
      recorder = mime ? new MediaRecorder(new MediaStream(tracks), { mimeType: mime }) : new MediaRecorder(new MediaStream(tracks));
    } catch (_error) {
      showRecToast(t("recError"));
      return;
    }
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) recordChunks.push(event.data);
    };
    recorder.onstop = () => {
      recordingActive = false;
      const blob = new Blob(recordChunks, { type: recorder.mimeType || "video/webm" });
      recorder = null;
      recordChunks = [];
      updateRecordButton();
      if (blob.size) downloadRecording(blob);
      else showRecToast(t("recError"));
    };
    recorder.onerror = () => {
      recordingActive = false;
      updateRecordButton();
      showRecToast(t("recError"));
    };
    recordingActive = true;
    recorder.start(250);
    updateRecordButton();
  }

  function stopRecording() {
    if (!recorder || recorder.state === "inactive") {
      recordingActive = false;
      updateRecordButton();
      return;
    }
    try {
      if (recorder.state === "recording") recorder.requestData();
      recorder.stop();
    } catch (_error) {
      recordingActive = false;
      updateRecordButton();
    }
  }

  function toggleRecording() {
    if (isRecording()) stopRecording();
    else startRecording();
  }

  function renderSongList() {
    if (!ui.songList || !window.SharedMusic || typeof SharedMusic.getPlaylist !== "function") return;
    const titles = SharedMusic.getPlaylist();
    const current = typeof SharedMusic.getIndex === "function" ? SharedMusic.getIndex() : -1;
    ui.songList.innerHTML = "";
    titles.forEach((title, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `song-item${index === current ? " active" : ""}`;
      item.textContent = title;
      item.addEventListener("click", (event) => {
        event.stopPropagation();
        SharedMusic.playIndex(index);
        renderSongList();
      });
      ui.songList.appendChild(item);
    });
  }

  function toggleSongPicker() {
    const nextHidden = !ui.songPicker.hidden;
    ui.songPicker.hidden = nextHidden;
    if (!nextHidden) renderSongList();
  }

  const textAnimUi = {
    input: document.getElementById("textAnimInput"),
    duration: document.getElementById("textAnimDuration"),
    convert: document.getElementById("textAnimConvert"),
    check: document.getElementById("textAnimCheck"),
    checkPanel: document.getElementById("textAnimCheckPanel"),
    checkPreview: document.getElementById("textAnimCheckPreview"),
    checkFixes: document.getElementById("textAnimCheckFixes"),
    scan: document.getElementById("textAnimScan"),
    canvas: document.getElementById("textAnimCanvas"),
    result: document.getElementById("textAnimResult"),
    replay: document.getElementById("textAnimReplay"),
    download: document.getElementById("textAnimDownload"),
    back: document.getElementById("backFromTextAnim"),
    library: document.getElementById("textAnimLibrary"),
    saveName: document.getElementById("textAnimSaveName"),
    save: document.getElementById("textAnimSave"),
    savedList: document.getElementById("textAnimSavedList")
  };
  let textAnim = null;
  let textAnimVip = false;
  const TEXT_MOVIE_KEY = "marble-escape-text-movies-v1";
  const TEXT_MOVIE_LIMIT = 40;
  const TEXT_MOVIE_CHARS = 80000;
  const TEXT_ANIM_MAX_CHARS = 3600000;
  if (textAnimUi.input) textAnimUi.input.maxLength = TEXT_ANIM_MAX_CHARS;

  const TEXT_ANIM_COLORS = {
    marble: "#e2e8f0",
    action: "#fb923c",
    verb: "#facc15",
    adjective: "#c4b5fd",
    mood: "#f9a8d4",
    place: "#4ade80",
    object: "#22d3ee",
    direction: "#38bdf8",
    time: "#fbbf24",
    weather: "#2dd4bf",
    quantity: "#a3e635",
    exclaim: "#fb7185",
    connector: "#a5b4fc",
    chat: "#e879f9",
    world: "#67e8f9",
    look: "#f0abfc",
    word: "#64748b"
  };
  const TEXT_ANIM_ACTIONS = [
    { id: "jump", label: "saltar", words: ["salta", "saltar", "salto", "brinca", "brincar", "jump", "jumps", "jumping"] },
    { id: "run", label: "correr", words: ["corre", "correr", "corriendo", "run", "runs", "running", "sprint", "correte"] },
    { id: "walk", label: "caminar", words: ["camina", "caminar", "anda", "andar", "walk", "walks", "walking"] },
    { id: "dance", label: "bailar", words: ["baila", "bailar", "baile", "dance", "dances", "dancing"] },
    { id: "fly", label: "volar", words: ["vuela", "volar", "vuelo", "fly", "flies", "flying"] },
    { id: "spin", label: "girar", words: ["gira", "girar", "giro", "spin", "spins", "spinning", "rota", "rotar"] },
    { id: "sleep", label: "dormir", words: ["duerme", "dormir", "sueño", "sueno", "sleep", "sleeps", "sleeping", "descansa"] },
    { id: "eat", label: "comer", words: ["come", "comer", "eat", "eats", "eating", "prueba"] },
    { id: "hug", label: "abrazar", words: ["abraza", "abrazar", "abrazo", "hug", "hugs", "hugging"] },
    { id: "kiss", label: "besar", words: ["besa", "besar", "beso", "kiss", "kisses"] },
    { id: "chase", label: "perseguir", words: ["persigue", "perseguir", "alcance", "chase", "chases"] },
    { id: "fight", label: "pelear", words: ["pelea", "pelear", "golpea", "fight", "fights", "ataca", "atacar"] },
    { id: "push", label: "empujar", words: ["empuja", "empujar", "push", "pushes"] },
    { id: "fall", label: "caer", words: ["cae", "caer", "caida", "fall", "falls", "falling", "tropieza"] },
    { id: "hide", label: "esconderse", words: ["esconde", "esconder", "oculta", "hide", "hides", "hiding"] },
    { id: "sit", label: "sentarse", words: ["sienta", "sentar", "sit", "sits", "sitting"] },
    { id: "wave", label: "saludar", words: ["saluda", "saludar", "hola", "wave", "waves", "hi"] },
    { id: "look", label: "mirar", words: ["mira", "mirar", "look", "looks", "watching"] },
    { id: "laugh", label: "reír", words: ["rie", "ríe", "reir", "reír", "risa", "laugh", "laughs"] },
    { id: "cry", label: "llorar", words: ["llora", "llorar", "llanto", "cry", "cries", "crying"] },
    { id: "love", label: "querer", words: ["ama", "amar", "love", "loves", "enamorado", "enamorada"] },
    { id: "swim", label: "nadar", words: ["nada", "nadar", "swim", "swims"] },
    { id: "climb", label: "subir", words: ["sube", "subir", "trepa", "climb", "climbs"] },
    { id: "sing", label: "cantar", words: ["canta", "cantar", "sing", "sings"] },
    { id: "glow", label: "brillar", words: ["brilla", "brillar", "glow", "glows"] },
    { id: "grow", label: "crecer", words: ["crece", "crecer", "agranda", "grow", "grows"] },
    { id: "shrink", label: "achicar", words: ["achica", "encoge", "shrink", "shrinks"] },
    { id: "throw", label: "lanzar", words: ["lanza", "lanzar", "tira", "throw", "throws"] },
    { id: "play", label: "jugar", words: ["juega", "jugar", "juego", "juegan", "jugamos", "jugando", "jugo", "jugó", "play", "plays", "playing", "played"] }
  ];
  const TEXT_ANIM_VERBS = [
    { id: "be", label: "ser", words: ["es", "son", "era", "eran", "fue", "fueron", "ser", "soy", "eres", "somos", "sea", "being", "is", "are", "was", "were", "be"] },
    { id: "stay", label: "estar", words: ["esta", "está", "estan", "están", "estaba", "estuvo", "estar", "estoy", "estamos"] },
    { id: "can", label: "poder", words: ["puede", "pueden", "pudo", "poder", "puedo", "podemos", "can", "could"] },
    { id: "must", label: "deber", words: ["debe", "deben", "deber", "debia", "must", "should"] },
    { id: "say", label: "decir", words: ["dice", "decir", "habla", "hablar", "grita", "susurra", "dicen", "hablan", "dijo", "dije", "decis", "decís", "decimos", "diga", "digan", "say", "says", "talk", "talks"] },
    { id: "think", label: "pensar", words: ["piensa", "pensar", "piensan", "penso", "think", "thinks"] },
    { id: "wait", label: "esperar", words: ["espera", "esperar", "esperan", "espero", "wait", "waits"] },
    { id: "want", label: "querer", words: ["quiere", "querer", "quieren", "quiero", "quiso", "want", "wants"] },
    { id: "go", label: "ir", words: ["va", "ir", "viene", "venir", "van", "vienen", "voy", "vamos", "fue", "iba", "go", "goes", "come", "comes"] },
    { id: "have", label: "tener", words: ["tiene", "tener", "tienen", "tengo", "tenemos", "tuvo", "tenia", "have", "has", "had"] },
    { id: "do", label: "hacer", words: ["hace", "hacer", "hacen", "hago", "hizo", "haciendo", "do", "does", "did"] },
    { id: "find", label: "encontrar", words: ["encuentra", "encontrar", "busca", "buscar", "encuentran", "buscan", "find", "finds"] },
    { id: "open", label: "abrir", words: ["abre", "abrir", "cierra", "cerrar", "abren", "open", "opens"] },
    { id: "ask", label: "preguntar", words: ["pregunta", "preguntar", "responde", "preguntan", "ask", "asks"] },
    { id: "see", label: "ver", words: ["ve", "ver", "vio", "ven", "veo", "vemos", "see", "sees", "saw"] },
    { id: "give", label: "dar", words: ["da", "dar", "dio", "dan", "doy", "give", "gives"] },
    { id: "put", label: "poner", words: ["pone", "poner", "puso", "ponen", "pongo", "put"] },
    { id: "know", label: "saber", words: ["sabe", "saber", "saben", "supe", "know", "knows"] },
    { id: "feel", label: "sentir", words: ["siente", "sentir", "sienten", "sintio", "feel", "feels"] },
    { id: "arrive", label: "llegar", words: ["llega", "llegar", "llegan", "llego", "llegó"] },
    { id: "leave", label: "salir", words: ["sale", "salir", "salen", "salio", "vuelve", "volver"] },
    { id: "carry", label: "llevar", words: ["lleva", "llevar", "llevan", "llevo", "deja", "dejar"] },
    { id: "start", label: "empezar", words: ["empieza", "empezar", "empieza", "termina", "terminar", "start", "starts"] },
    { id: "help", label: "ayudar", words: ["ayuda", "ayudar", "ayudan", "uso", "usa", "usar", "help"] },
    { id: "change", label: "cambiar", words: ["cambia", "cambiar", "crean", "crea", "crear", "change"] },
    { id: "live", label: "vivir", words: ["vive", "vivir", "viven", "vivo", "vivimos", "live", "lives"] },
    { id: "work", label: "trabajar", words: ["trabaja", "trabajar", "trabajan", "trabajo", "work", "works"] },
    { id: "read", label: "leer", words: ["lee", "leer", "leen", "leo", "leemos", "read", "reads"] },
    { id: "write", label: "escribir", words: ["escribe", "escribir", "escriben", "escribo", "write", "writes"] },
    { id: "learn", label: "aprender", words: ["aprende", "aprender", "aprenden", "estudio", "estudia", "estudiar", "learn"] },
    { id: "remember", label: "recordar", words: ["recuerda", "recordar", "recuerdan", "olvida", "olvidar", "remember"] },
    { id: "need", label: "necesitar", words: ["necesita", "necesitar", "necesitan", "necesito", "need", "needs"] },
    { id: "try", label: "intentar", words: ["intenta", "intentar", "tratan", "trata", "tratar", "try", "tries"] },
    { id: "win", label: "ganar", words: ["gana", "ganar", "ganan", "gano", "pierde", "perder", "win", "wins"] },
    { id: "stop", label: "parar", words: ["parar", "paran", "paro", "detiene", "stop", "stops"] },
    { id: "call", label: "llamar", words: ["llama", "llamar", "llaman", "llamo", "call", "calls"] },
    { id: "show", label: "mostrar", words: ["muestra", "mostrar", "muestran", "show", "shows"] },
    { id: "hear", label: "oír", words: ["oye", "oir", "oír", "oyen", "escucha", "escuchar", "hear", "hears"] },
    { id: "touch", label: "tocar", words: ["toca", "tocar", "tocan", "touch", "touches"] },
    { id: "choose", label: "elegir", words: ["elige", "elegir", "eligen", "choose", "picks"] },
    { id: "keep", label: "guardar", words: ["guarda", "guardar", "mantienen", "mantiene", "keep"] },
    { id: "happen", label: "pasar", words: ["pasa", "pasar", "pasan", "ocurre", "ocurrir", "happen"] },
    { id: "believe", label: "creer", words: ["cree", "creer", "creen", "creo", "believe"] },
    { id: "seem", label: "parecer", words: ["parece", "parecer", "parecen", "seem", "seems"] }
  ];
  const TEXT_ANIM_ADJECTIVES = [
    { id: "big", label: "grande", words: ["grande", "grandes", "enorme", "enormes", "gigante", "gigantes", "big", "huge"] },
    { id: "small", label: "pequeño", words: ["pequeno", "pequeño", "pequena", "pequeña", "pequenos", "pequeños", "chico", "chica", "tiny", "small", "little"] },
    { id: "fast", label: "rápido", words: ["rapido", "rápido", "rapida", "rápida", "rapidos", "rápidos", "veloz", "veloces", "fast", "quick"] },
    { id: "slow", label: "lento", words: ["lento", "lenta", "lentos", "lentas", "slow"] },
    { id: "strong", label: "fuerte", words: ["fuerte", "fuertes", "strong"] },
    { id: "weak", label: "débil", words: ["debil", "débil", "debiles", "débiles", "weak"] },
    { id: "shiny", label: "brillante", words: ["brillante", "brillantes", "shiny", "glowing"] },
    { id: "dark", label: "oscuro", words: ["oscuro", "oscura", "oscuros", "oscuras", "dark"] },
    { id: "tall", label: "alto", words: ["alto", "alta", "altos", "altas", "tall"] },
    { id: "new", label: "nuevo", words: ["nuevo", "nueva", "nuevos", "nuevas", "new"] },
    { id: "old", label: "viejo", words: ["viejo", "vieja", "viejos", "viejas", "old"] },
    { id: "pretty", label: "linda", words: ["hermoso", "hermosa", "hermosos", "hermosas", "lindo", "linda", "lindos", "lindas", "bonito", "bonita", "bonitos", "pretty", "beautiful"] },
    { id: "ugly", label: "fea", words: ["feo", "fea", "feos", "feas", "ugly", "pixelada", "pixelado", "pixeladas", "pixelados"] },
    { id: "hot", label: "caliente", words: ["caliente", "calientes", "hot"] },
    { id: "cold", label: "frío", words: ["frio", "frío", "fria", "fría", "frios", "fríos", "cold"] },
    { id: "red", label: "rojo", words: ["rojo", "roja", "rojos", "rojas", "red"] },
    { id: "blue", label: "azul", words: ["azul", "azules", "blue"] },
    { id: "green", label: "verde", words: ["verde", "verdes", "green"] },
    { id: "yellow", label: "amarillo", words: ["amarillo", "amarilla", "amarillos", "yellow"] },
    { id: "pink", label: "rosa", words: ["rosa", "rosas", "rosado", "rosada", "pink"] },
    { id: "gold", label: "dorado", words: ["dorado", "dorada", "dorados", "gold", "golden"] },
    { id: "brave", label: "valiente", words: ["valiente", "valientes", "brave"] },
    { id: "tired", label: "cansado", words: ["cansado", "cansada", "cansados", "tired"] },
    { id: "happy", label: "feliz", words: ["feliz", "felices", "contento", "contenta", "contentos", "alegre", "alegres", "happy"] },
    { id: "sad", label: "triste", words: ["triste", "tristes", "deprimido", "deprimida", "sad"] },
    { id: "angry", label: "enojado", words: ["enojado", "enojada", "enojados", "furioso", "furiosa", "enojada", "angry", "mad"] },
    { id: "scared", label: "asustado", words: ["asustado", "asustada", "asustados", "scared"] },
    { id: "calm", label: "tranquilo", words: ["tranquilo", "tranquila", "tranquilos", "calm"] },
    { id: "good", label: "bueno", words: ["bueno", "buena", "buenos", "buenas", "buen", "malo", "mala", "malos", "good", "bad"] },
    { id: "young", label: "joven", words: ["joven", "jovenes", "jóvenes", "young"] },
    { id: "long", label: "largo", words: ["largo", "larga", "largos", "corto", "corta", "anchos", "long", "short"] },
    { id: "soft", label: "suave", words: ["suave", "suaves", "duro", "dura", "blando", "soft", "hard"] },
    { id: "smart", label: "listo", words: ["listo", "lista", "inteligente", "tonto", "tonta", "smart"] },
    { id: "special", label: "especial", words: ["especial", "especiales", "unico", "único", "rara", "raro", "normal", "special"] },
    { id: "easy", label: "fácil", words: ["facil", "fácil", "faciles", "dificil", "difícil", "easy", "hard"] },
    { id: "full", label: "lleno", words: ["lleno", "llena", "vacio", "vacío", "vacia", "full", "empty"] },
    { id: "rich", label: "rico", words: ["rico", "rica", "pobre", "pobres", "rich", "poor"] },
    { id: "clean", label: "limpio", words: ["limpio", "limpia", "sucio", "sucia", "clean", "dirty"] },
    { id: "true", label: "verdadero", words: ["verdadero", "verdadera", "falso", "falsa", "true", "false"] },
    { id: "free", label: "libre", words: ["libre", "libres", "ocupado", "ocupada", "free", "busy"] },
    { id: "safe", label: "seguro", words: ["seguro", "segura", "peligroso", "peligrosa", "safe"] },
    { id: "fun", label: "divertido", words: ["divertido", "divertida", "aburrido", "aburrida", "fun", "funny"] },
    { id: "kind", label: "amable", words: ["amable", "amables", "grosero", "kind", "nice"] },
    { id: "alive", label: "vivo", words: ["vivo", "viva", "muerto", "muerta", "sano", "enfermo", "alive"] },
    { id: "best", label: "mejor", words: ["mejor", "mejores", "peor", "peores", "best", "worst"] }
  ];
  const TEXT_ANIM_MOODS = [
    { id: "happy", label: "feliz", words: ["feliz", "contento", "contenta", "alegre", "happy", "joy", "euforico", "eufórico"] },
    { id: "sad", label: "triste", words: ["triste", "sad", "deprimido", "deprimida", "melancolico", "dolido"] },
    { id: "angry", label: "enojado", words: ["enojado", "enojada", "furioso", "furiosa", "molesto", "irritado", "angry", "mad"] },
    { id: "scared", label: "asustado", words: ["asustado", "asustada", "scared", "miedo", "nervioso", "ansioso", "aterrado"] },
    { id: "calm", label: "tranquilo", words: ["tranquilo", "tranquila", "calm", "sereno", "relajado", "aliviado"] },
    { id: "love", label: "enamorado", words: ["enamorado", "enamorada", "celoso", "celosa", "agradecido"] },
    { id: "shy", label: "tímido", words: ["timido", "tímido", "avergonzado", "avergonzada", "inseguro"] },
    { id: "proud", label: "orgulloso", words: ["orgulloso", "orgullosa", "confiado", "esperanzado"] },
    { id: "bored", label: "aburrido", words: ["aburrido", "aburrida", "solo", "sola", "solitario"] },
    { id: "excited", label: "emocionado", words: ["emocionado", "emocionada", "sorprendido", "sorprendida", "ilusionado"] }
  ];
  const TEXT_ANIM_PLACES = [
    { id: "house", label: "casa", words: ["casa", "hogar", "house", "home", "sala", "cocina"] },
    { id: "sky", label: "cielo", words: ["cielo", "aire", "sky"] },
    { id: "floor", label: "suelo", words: ["piso", "suelo", "floor", "tierra"] },
    { id: "park", label: "parque", words: ["parque", "park", "jardin", "jardín", "patio"] },
    { id: "sea", label: "mar", words: ["mar", "playa", "sea", "ocean", "playa"] },
    { id: "city", label: "ciudad", words: ["ciudad", "calle", "escuela", "city"] },
    { id: "woods", label: "bosque", words: ["bosque", "woods", "forest"] },
    { id: "mountain", label: "montaña", words: ["montana", "montaña", "mountain"] }
  ];
  const TEXT_ANIM_OBJECTS = [
    { id: "food", label: "comida", words: ["comida", "pizza", "food", "torta", "pan"] },
    { id: "flower", label: "flor", words: ["flor", "flores", "flower"] },
    { id: "star", label: "estrella", words: ["estrella", "estrellas", "star"] },
    { id: "heart", label: "corazón", words: ["corazon", "corazón", "heart"] },
    { id: "fire", label: "fuego", words: ["fuego", "fire"] },
    { id: "water", label: "agua", words: ["agua", "water"] },
    { id: "ball", label: "pelota", words: ["pelota", "pelotas", "ball"] },
    { id: "tree", label: "árbol", words: ["arbol", "árbol", "tree"] },
    { id: "toy", label: "juguete", words: ["juguete", "juguetes", "juego", "toy", "game"] },
    { id: "phone", label: "celular", words: ["celular", "telefono", "teléfono", "phone"] }
  ];
  const TEXT_ANIM_DIRECTIONS = [
    { id: "left", label: "izquierda", words: ["izquierda", "left"] },
    { id: "right", label: "derecha", words: ["derecha", "right"] },
    { id: "up", label: "arriba", words: ["arriba", "up"] },
    { id: "down", label: "abajo", words: ["abajo", "down"] },
    { id: "near", label: "cerca", words: ["cerca", "lejos", "near", "far"] }
  ];
  const TEXT_ANIM_TIMES = [
    { id: "now", label: "ahora", words: ["ahora", "now"] },
    { id: "later", label: "luego", words: ["luego", "despues", "después", "later"] },
    { id: "night", label: "noche", words: ["noche", "night"] },
    { id: "day", label: "día", words: ["dia", "día", "day", "tarde", "mañana", "manana"] }
  ];
  const TEXT_ANIM_WEATHER = [
    { id: "rain", label: "lluvia", words: ["lluvia", "llueve", "rain"] },
    { id: "snow", label: "nieve", words: ["nieve", "nieva", "snow"] },
    { id: "wind", label: "viento", words: ["viento", "wind"] },
    { id: "storm", label: "tormenta", words: ["tormenta", "storm"] }
  ];
  const TEXT_ANIM_QUANTITY = [
    { id: "many", label: "muchos", words: ["muchos", "muchas", "todos", "todas", "many", "all"] },
    { id: "few", label: "pocos", words: ["pocos", "pocas", "few"] },
    { id: "one", label: "uno", words: ["uno", "una", "dos", "tres", "one", "two", "three"] }
  ];
  const TEXT_ANIM_EXCLAIM = [
    { id: "wow", label: "wow", words: ["wow", "guau", "ole", "olé", "yay", "hurra", "yeah"] },
    { id: "oh", label: "oh", words: ["oh", "ah", "uy", "oops"] }
  ];
  const TEXT_ANIM_CONNECTORS = [
    { id: "and", label: "y", words: ["y", "e", "and"] },
    { id: "or", label: "o", words: ["o", "u", "or"] },
    { id: "but", label: "pero", words: ["pero", "sino", "aunque", "but"] },
    { id: "because", label: "porque", words: ["porque", "pues", "because"] },
    { id: "if", label: "si", words: ["si", "sí", "if"] },
    { id: "that", label: "que", words: ["que", "that"] },
    { id: "then", label: "entonces", words: ["entonces", "despues", "después", "luego", "then"] },
    { id: "also", label: "tambien", words: ["tambien", "también", "ademas", "además", "also"] },
    { id: "with", label: "con", words: ["con", "sin", "para", "por", "with", "without"] },
    { id: "when", label: "cuando", words: ["cuando", "donde", "dónde", "como", "cómo", "while", "when"] }
  ];
  const TEXT_ANIM_CHAT = [
    { id: "hi", label: "hola", words: ["hola", "holis", "buenas", "ola", "hello", "hey"] },
    { id: "bye", label: "chau", words: ["chau", "adios", "adiós", "bye", "chao"] },
    { id: "lol", label: "jaja", words: ["jaja", "jajaja", "jeje", "lol", "lmao", "xd", "xdd"] },
    { id: "ok", label: "ok", words: ["ok", "oka", "okis", "dale", "sip", "nop", "ye", "yep", "nope"] },
    { id: "pls", label: "porfa", words: ["porfa", "porfis", "pls", "plz", "please", "gracias", "grax", "thx", "ty"] },
    { id: "bro", label: "bro", words: ["bro", "amigo", "amiga", "crack", "capo", "bestie", "dude"] },
    { id: "loveu", label: "tqm", words: ["tqm", "tq", "ily", "bb", "bebe", "baby", "uwu", "owo"] },
    { id: "omg", label: "omg", words: ["omg", "wtf", "gg", "ez", "afk", "brb", "idk", "tbh", "ngl"] }
  ];
  const TEXT_ANIM_STOP = new Set([
    "el", "la", "los", "las", "de", "del", "un", "una", "en", "a",
    "su", "sus", "al", "se", "le", "lo", "te", "me", "mi", "tu", "yo", "no", "muy", "mas", "ya",
    "the", "of", "to", "in", "as", "at", "on"
  ]);
  const TEXT_ANIM_MOOD_IDS = new Set(["happy", "sad", "angry", "scared", "calm", "love", "shy", "proud", "bored", "excited"]);
  const TEXT_ANIM_WORLDS = [
    { id: "marblechat", label: "Marblechat", words: ["marblechat", "marble-chat"] },
    { id: "real", label: "real", words: ["real", "realista", "reales"] }
  ];
  const TEXT_ANIM_LOOKS = [
    { id: "secret", label: "secreto", words: ["secreto", "secreta", "secretos", "secretas", "secretamente", "secret"] },
    { id: "pretty", label: "linda", words: ["linda", "lindo", "lindas", "lindos", "bonito", "bonita", "hermoso", "hermosa", "hermosos", "pretty", "beautiful", "realista"] },
    { id: "ugly", label: "fea", words: ["fea", "feo", "feas", "feos", "ugly", "pixelada", "pixelado", "pixeladas", "pixelados"] }
  ];
  const TEXT_ANIM_VERB_ACTION = {
    be: "glow", stay: "sit", can: "jump", must: "walk", say: "wave", think: "look",
    wait: "sit", want: "love", go: "walk", have: "look", do: "play", find: "look",
    open: "push", ask: "wave", see: "look", give: "throw", put: "throw", know: "look",
    feel: "love", arrive: "walk", leave: "walk", carry: "walk", start: "play",
    help: "hug", change: "spin", live: "walk", work: "walk", read: "sit", write: "sit",
    learn: "look", remember: "look", need: "look", try: "jump", win: "dance",
    stop: "sit", call: "wave", show: "look", hear: "look", touch: "push",
    choose: "look", keep: "sit", happen: "spin", believe: "look", seem: "look",
    other: "wave"
  };
  const TEXT_ANIM_LEXICONS = [
    ["world", TEXT_ANIM_WORLDS],
    ["look", TEXT_ANIM_LOOKS],
    ["action", TEXT_ANIM_ACTIONS],
    ["verb", TEXT_ANIM_VERBS],
    ["adjective", TEXT_ANIM_ADJECTIVES],
    ["mood", TEXT_ANIM_MOODS],
    ["place", TEXT_ANIM_PLACES],
    ["object", TEXT_ANIM_OBJECTS],
    ["direction", TEXT_ANIM_DIRECTIONS],
    ["time", TEXT_ANIM_TIMES],
    ["weather", TEXT_ANIM_WEATHER],
    ["quantity", TEXT_ANIM_QUANTITY],
    ["exclaim", TEXT_ANIM_EXCLAIM],
    ["connector", TEXT_ANIM_CONNECTORS]
  ];
  const TEXT_ANIM_LEGEND = [
    { type: "marble", key: "textAnimKindMarble" },
    { type: "action", key: "textAnimKindAction" },
    { type: "verb", key: "textAnimKindVerb" },
    { type: "adjective", key: "textAnimKindAdj" },
    { type: "mood", key: "textAnimKindMood" },
    { type: "place", key: "textAnimKindPlace" },
    { type: "object", key: "textAnimKindObject" },
    { type: "direction", key: "textAnimKindDir" },
    { type: "time", key: "textAnimKindTime" },
    { type: "weather", key: "textAnimKindWeather" },
    { type: "quantity", key: "textAnimKindQty" },
    { type: "exclaim", key: "textAnimKindExclaim" },
    { type: "connector", key: "textAnimKindConn" },
    { type: "chat", key: "textAnimKindChat" },
    { type: "world", key: "textAnimKindWorld" },
    { type: "look", key: "textAnimKindLook" }
  ];

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function foldAnimWord(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9ñ]/g, "");
  }

  function collectMarbleCatalog() {
    const found = [];
    const seen = new Set();
    const push = (marble) => {
      if (!marble || !marble.name) return;
      const key = String(marble.name).trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      found.push({
        id: marble.id || key,
        name: String(marble.name).trim(),
        color: marble.color || "#55d6ff"
      });
    };
    const save = getSave();
    (save ? [save] : data.saves.filter(Boolean)).forEach((slot) => {
      (slot.marbles || []).forEach(push);
    });
    (data.packs || []).forEach((pack) => {
      (pack.marbles || []).forEach(push);
    });
    return found.sort((a, b) => b.name.length - a.name.length);
  }

  function matchMarbleNamePrefix(rest, name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return null;
    let pos = 0;
    for (let i = 0; i < parts.length; i += 1) {
      if (i > 0) {
        const gap = rest.slice(pos).match(/^\s+/);
        if (!gap) return null;
        pos += gap[0].length;
      }
      const word = rest.slice(pos).match(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/);
      if (!word || foldAnimWord(word[0]) !== foldAnimWord(parts[i])) return null;
      pos += word[0].length;
    }
    const next = rest.charAt(pos);
    if (next && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(next)) return null;
    return rest.slice(0, pos);
  }

  function matchMarbleAt(rest, catalog) {
    let best = null;
    catalog.forEach((marble) => {
      const text = matchMarbleNamePrefix(rest, marble.name);
      if (!text) return;
      if (!best || text.length > best.text.length) best = { marble, text };
    });
    return best;
  }

  function matchQuotedChat(rest) {
    if (!rest) return null;
    const open = rest.charAt(0);
    const close = open === "«" ? "»" : open === "“" ? "”" : open === "'" || open === "\"" ? open : "";
    if (!close) return null;
    const limit = Math.min(rest.length, 282);
    for (let i = 1; i < limit; i += 1) {
      const ch = rest.charAt(i);
      if (ch === "\n") return null;
      if (ch === close) {
        const inner = rest.slice(1, i).trim();
        if (!inner) return null;
        return { text: rest.slice(0, i + 1), message: inner.slice(0, 200) };
      }
    }
    return null;
  }

  function collectChatDetectWords() {
    const bag = [];
    const seen = new Set();
    const push = (raw) => {
      const folded = foldAnimWord(raw);
      if (!folded || folded.length < 2 || folded.length > 24 || TEXT_ANIM_STOP.has(folded) || seen.has(folded)) return;
      seen.add(folded);
      bag.push({ id: "chat", label: raw, words: [raw] });
    };
    TEXT_ANIM_CHAT.forEach((item) => item.words.forEach(push));
    const save = getSave();
    (save ? [save] : data.saves.filter(Boolean)).forEach((slot) => {
      (((slot.marbleChat && slot.marbleChat.groups) || [])).forEach((group) => {
        (group.messages || []).forEach((msg) => {
          String(msg && msg.text || "").split(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/).forEach(push);
        });
      });
    });
    return bag;
  }

  function matchAnimLexicon(word, lexicon) {
    const folded = foldAnimWord(word);
    if (!folded) return null;
    return lexicon.find((item) => item.words.some((entry) => foldAnimWord(entry) === folded)) || null;
  }

  function animWordStems(folded) {
    const stems = new Set([folded]);
    const suffixes = [
      "amente", "mente", "aciones", "imiento", "iendo", "yendo", "ando", "ieron", "aron", "aban",
      "abas", "amos", "emos", "imos", "ados", "adas", "idos", "idas", "osos", "osas", "ivos", "ivas",
      "ables", "ibles", "ices", "ado", "ada", "ido", "ida", "oso", "osa", "ivo", "iva", "able", "ible",
      "aba", "ste", "ron", "ais", "eis", "ar", "er", "ir", "es", "os", "as", "an", "en", "on", "o", "a", "e", "s"
    ];
    suffixes.forEach((suffix) => {
      if (folded.length > suffix.length + 2 && folded.endsWith(suffix)) {
        stems.add(folded.slice(0, -suffix.length));
      }
    });
    if (folded.endsWith("ces") && folded.length > 4) stems.add(folded.slice(0, -3) + "z");
    return stems;
  }

  function isAnimInflectionOf(folded, base) {
    if (!folded || !base) return false;
    if (folded === base) return true;
    const left = animWordStems(folded);
    const right = animWordStems(base);
    let overlap = false;
    left.forEach((stem) => {
      if (overlap || stem.length < 4) return;
      if (right.has(stem)) overlap = true;
    });
    return overlap;
  }

  function matchAnimLexiconFlex(word, lexicon) {
    const folded = foldAnimWord(word);
    if (!folded) return null;
    const exact = matchAnimLexicon(word, lexicon);
    if (exact) return exact;
    if (folded.length < 4) return null;
    return lexicon.find((item) => item.words.some((entry) => isAnimInflectionOf(folded, foldAnimWord(entry)))) || null;
  }

  function guessAnimKind(word) {
    const folded = foldAnimWord(word);
    if (!folded || folded.length < 4 || TEXT_ANIM_STOP.has(folded)) return null;
    if (/(ando|iendo|yendo|aba|aban|aron|ieron|aria|erian)$/.test(folded)) return "verb";
    if (/(ar|er|ir)$/.test(folded) && folded.length >= 5) return "verb";
    if (/(oso|osa|osos|osas|ivo|iva|ivos|ivas|able|ible|ento|enta|ices)$/.test(folded)) return "adjective";
    if (/(ado|ada|ados|adas|ido|ida|idos|idas)$/.test(folded) && folded.length >= 5) return "adjective";
    return null;
  }

  function tokenizeAnimText(text) {
    const catalog = collectMarbleCatalog();
    const tokens = [];
    const hits = [];
    const used = new Set();
    let index = 0;
    const src = String(text || "");
    while (index < src.length) {
      const rest = src.slice(index);
      const quoted = matchQuotedChat(rest);
      if (quoted) {
        tokens.push({ type: "chat", text: quoted.text, message: quoted.message, chat: { id: "say", label: quoted.message, words: [quoted.message] } });
        index += quoted.text.length;
        continue;
      }
      const marbleMatch = matchMarbleAt(rest, catalog);
      if (marbleMatch) {
        tokens.push({ type: "marble", text: marbleMatch.text, marble: marbleMatch.marble });
        if (!used.has(marbleMatch.marble.name.toLowerCase())) {
          hits.push(marbleMatch.marble);
          used.add(marbleMatch.marble.name.toLowerCase());
        }
        index += marbleMatch.text.length;
        continue;
      }
      const space = rest.match(/^\s+/);
      if (space) {
        tokens.push({ type: "space", text: space[0] });
        index += space[0].length;
        continue;
      }
      const worldPhrase = rest.match(/^(marble[\s-]*chat)/i);
      if (worldPhrase) {
        tokens.push({ type: "world", text: worldPhrase[0], world: TEXT_ANIM_WORLDS[0] });
        index += worldPhrase[0].length;
        continue;
      }
      const word = rest.match(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/) || rest.match(/^./);
      const raw = word ? word[0] : src[index];
      let tagged = null;
      TEXT_ANIM_LEXICONS.forEach((entry) => {
        if (tagged) return;
        const hit = matchAnimLexicon(raw, entry[1]);
        if (hit) tagged = { kind: entry[0], hit };
      });
      if (!tagged) {
        TEXT_ANIM_LEXICONS.forEach((entry) => {
          if (tagged) return;
          const hit = matchAnimLexiconFlex(raw, entry[1]);
          if (hit) tagged = { kind: entry[0], hit };
        });
      }
      if (tagged) {
        const folded = foldAnimWord(raw);
        const infinitive = tagged.kind === "action" && /(?:ar|er|ir)$/.test(folded) && folded.length >= 5;
        const kind = infinitive ? "verb" : tagged.kind;
        const token = { type: kind, text: raw };
        token[tagged.kind] = tagged.hit;
        if (infinitive) token.verb = tagged.hit;
        tokens.push(token);
      } else {
        const guess = guessAnimKind(raw);
        if (guess === "verb") tokens.push({ type: "verb", text: raw, verb: { id: "other", label: raw, words: [raw] } });
        else if (guess === "adjective") tokens.push({ type: "adjective", text: raw, adjective: { id: "other", label: raw, words: [raw] } });
        else tokens.push({ type: "word", text: raw });
      }
      index += raw.length;
    }
    return { tokens, hits };
  }

  function splitAnimClauses(text) {
    const held = [];
    let masked = "";
    let i = 0;
    const src = String(text || "");
    while (i < src.length) {
      const quoted = matchQuotedChat(src.slice(i));
      if (quoted) {
        held.push(quoted.text);
        masked += "⟦Q" + (held.length - 1) + "⟧";
        i += quoted.text.length;
      } else {
        masked += src.charAt(i);
        i += 1;
      }
    }
    return masked
      .replace(/(\S)\s+(marble[\s-]*chat|\breal(?:ista|es)?\b)/gi, "$1\n$2")
      .split(/\s*(?:[.!?;,\n]|\by\b|\bentonces\b|\bdespues\b|\bdespués\b|\bluego\b|\bthen\b|\band\b)\s*/i)
      .map((part) => part.replace(/⟦Q(\d+)⟧/g, (_, n) => held[Number(n)] || "").trim())
      .filter(Boolean);
  }

  function detectAnimWorld(text) {
    const src = String(text || "");
    let last = "";
    const re = /marble[\s-]*chat|\breal(?:ista|es)?\b/gi;
    let match;
    while ((match = re.exec(src))) {
      last = /marble/i.test(match[0]) ? "marblechat" : "real";
    }
    return last;
  }

  function detectAnimLookStyle(text) {
    const src = String(text || "");
    let last = "";
    const re = /\b(?:pixelad[ao]s?|feas?|feos?|ugly|lind[ao]s?|bonit[ao]s?|hermos[ao]s?|pretty|beautiful)\b/gi;
    let match;
    while ((match = re.exec(src))) {
      last = /pixelad|fea|feo|ugly/i.test(match[0]) ? "ugly" : "pretty";
    }
    return last;
  }

  function clauseHasSecret(clause) {
    return /\bsecret(?:o|a|os|as|amente)?\b|\bsecret\b/i.test(String(clause || ""));
  }

  function chatAfterSecret(clause) {
    const after = String(clause || "").replace(/^[\s\S]*?\bsecret(?:o|a|os|as|amente)?\b\s*[:\-]?\s*/i, "").trim();
    if (!after || after === String(clause || "").trim()) return "";
    const quoted = matchQuotedChat(after);
    if (quoted) return quoted.message;
    const cleaned = after.replace(/^["«“']+|["»”']+$/g, "").trim();
    const folded = foldAnimWord(cleaned);
    if (/^(marblechat|real|realista|reales|linda|lindo|lindas|lindos|fea|feo|feas|feos)$/.test(folded)) return "";
    return cleaned;
  }

  function defaultAnimActors(hits) {
    if (hits && hits.length) return hits.slice();
    return collectMarbleCatalog();
  }

  function parseTextAnim(text) {
    const full = tokenizeAnimText(text);
    const clauses = splitAnimClauses(text);
    const scenes = [];
    let lastMarbles = defaultAnimActors(full.hits);
    let lastWorld = "";
    let lastLook = "";
    let secretPending = false;
    clauses.forEach((clause) => {
      const parsed = tokenizeAnimText(clause);
      const marbles = parsed.tokens.filter((token) => token.type === "marble").map((token) => token.marble);
      const pick = (type) => parsed.tokens.find((token) => token.type === type);
      const actionTok = pick("action") || parsed.tokens.find((token) => token.action);
      const moodTok = pick("mood");
      const placeTok = pick("place");
      const adjTok = pick("adjective");
      const objTok = pick("object");
      const dirTok = pick("direction");
      const weatherTok = pick("weather");
      const timeTok = pick("time");
      const qtyTok = pick("quantity");
      const verbTok = pick("verb") || parsed.tokens.find((token) => token.verb);
      const worldTok = pick("world");
      const lookToks = parsed.tokens.filter((token) => token.type === "look");
      const secret = lookToks.some((token) => token.look && token.look.id === "secret") || clauseHasSecret(clause);
      if (secret) secretPending = true;
      const prettyLook = lookToks.find((token) => token.look && token.look.id === "pretty") || (adjTok && adjTok.adjective && adjTok.adjective.id === "pretty");
      const uglyLook = lookToks.find((token) => token.look && token.look.id === "ugly") || (adjTok && adjTok.adjective && adjTok.adjective.id === "ugly");
      const clauseWorld = worldTok ? worldTok.world.id : detectAnimWorld(clause);
      const world = clauseWorld || lastWorld;
      const look = uglyLook ? "ugly" : prettyLook ? "pretty" : (detectAnimLookStyle(clause) || lastLook);
      if (world) lastWorld = world;
      if (look) lastLook = look;
      let chatMsgs = parsed.tokens.filter((token) => token.type === "chat").map((token) => token.message).filter(Boolean);
      let chat = chatMsgs.join(" ");
      if ((secret || secretPending) && !chat) chat = chatAfterSecret(clause);
      const sceneSecret = !!(chat && (secret || secretPending));
      if (chat && sceneSecret) secretPending = false;
      let action = actionTok ? actionTok.action.id : "idle";
      if (action === "idle" && verbTok && verbTok.verb) {
        action = TEXT_ANIM_VERB_ACTION[verbTok.verb.id] || TEXT_ANIM_VERB_ACTION.other;
      }
      const pair = action === "hug" || action === "kiss" || action === "chase" || action === "fight" || action === "push" || action === "look" || action === "love";
      const subjects = marbles.length ? marbles : lastMarbles;
      if (!subjects.length) return;
      const target = pair && subjects.length > 1 ? subjects[1] : null;
      const actors = pair && target ? [subjects[0], target] : subjects;
      scenes.push({
        text: clause,
        action,
        actionLabel: actionTok ? actionTok.action.label : (verbTok && verbTok.verb ? verbTok.verb.label : (chat ? chat : "")),
        mood: moodTok ? moodTok.mood.id : (adjTok && TEXT_ANIM_MOOD_IDS.has(adjTok.adjective.id) ? adjTok.adjective.id : ""),
        place: placeTok ? placeTok.place.id : "",
        adjective: adjTok ? adjTok.adjective.id : "",
        object: objTok ? objTok.object.id : "",
        direction: dirTok ? dirTok.direction.id : "",
        weather: weatherTok ? weatherTok.weather.id : "",
        time: timeTok ? timeTok.time.id : "",
        quantity: qtyTok ? qtyTok.quantity.id : "",
        chat,
        secret: sceneSecret,
        world,
        look,
        actors
      });
      lastMarbles = actors;
    });
    const docWorld = detectAnimWorld(text);
    const docLook = detectAnimLookStyle(text);
    if (!scenes.length) {
      const chat = full.tokens.filter((token) => token.type === "chat").map((token) => token.message).filter(Boolean).join(" ") || chatAfterSecret(text);
      const verbTok = full.tokens.find((token) => token.type === "verb" || token.verb);
      const actionTok = full.tokens.find((token) => token.type === "action" || token.action);
      let action = actionTok && actionTok.action ? actionTok.action.id : "idle";
      if (action === "idle" && verbTok && verbTok.verb) {
        action = TEXT_ANIM_VERB_ACTION[verbTok.verb.id] || TEXT_ANIM_VERB_ACTION.other;
      }
      const actors = defaultAnimActors(full.hits);
      if (actors.length) {
        scenes.push({
          text: text,
          action,
          actionLabel: actionTok && actionTok.action ? actionTok.action.label : (verbTok && verbTok.verb ? verbTok.verb.label : chat),
          mood: "",
          place: "",
          adjective: "",
          object: "",
          direction: "",
          weather: "",
          time: "",
          quantity: "",
          chat,
          secret: !!(chat && (clauseHasSecret(text) || full.tokens.some((token) => token.look && token.look.id === "secret"))),
          world: docWorld,
          look: docLook,
          actors
        });
      }
    }
    let pendingSecret = false;
    scenes.forEach((scene) => {
      if (docLook && !scene.look) scene.look = docLook;
      if (clauseHasSecret(scene.text) || scene.secret) pendingSecret = true;
      if (pendingSecret && scene.chat) {
        scene.secret = true;
        pendingSecret = false;
      }
    });
    const actions = [];
    const seenAct = new Set();
    scenes.forEach((scene) => {
      if (scene.actionLabel && !seenAct.has(scene.actionLabel)) {
        seenAct.add(scene.actionLabel);
        actions.push(scene.actionLabel);
      }
    });
    return { tokens: full.tokens, hits: full.hits, scenes, actions };
  }

  function animKindColor(token) {
    if (token.type === "marble" && token.marble) return token.marble.color;
    return TEXT_ANIM_COLORS[token.type] || TEXT_ANIM_COLORS.word;
  }

  function renderTextAnimScan(parsed) {
    const el = textAnimUi.scan;
    if (!el) return;
    el.hidden = false;
    const used = new Set();
    parsed.tokens.forEach((token) => {
      if (token.type !== "word" && token.type !== "space") used.add(token.type);
    });
    const legend = TEXT_ANIM_LEGEND.filter((item) => used.has(item.type))
      .map((item) => {
        const color = TEXT_ANIM_COLORS[item.type];
        return `<span class="scan-chip" style="color:${color};border-color:${color}">${escapeHtml(t(item.key))}</span>`;
      })
      .join("");
    const sentence = parsed.tokens.map((token) => {
      if (token.type === "space") return " ";
      const color = animKindColor(token);
      const cls = token.type === "word" ? "scan-word" : "scan-hit";
      return `<span class="${cls}" style="color:${color}">${escapeHtml(token.text)}</span>`;
    }).join("");
    el.innerHTML = `<span class="scan-legend">${legend}</span><span class="scan-line">${sentence}</span>`;
  }

  function hideTextAnimCheck() {
    if (textAnimUi.checkPanel) textAnimUi.checkPanel.hidden = true;
    if (textAnimUi.checkPreview) textAnimUi.checkPreview.innerHTML = "";
    if (textAnimUi.checkFixes) textAnimUi.checkFixes.innerHTML = "";
  }

  function animKindLabel(type) {
    const item = TEXT_ANIM_LEGEND.find((entry) => entry.type === type);
    return item ? t(item.key) : type;
  }

  function isAnimFixableMiss(token) {
    if (!token || token.type !== "word") return false;
    const folded = foldAnimWord(token.text);
    if (!folded || folded.length < 2) return false;
    if (TEXT_ANIM_STOP.has(folded)) return false;
    if (/^\d+$/.test(folded)) return false;
    return true;
  }

  function animLevenshtein(a, b) {
    if (a === b) return 0;
    const left = String(a || "");
    const right = String(b || "");
    if (!left.length) return right.length;
    if (!right.length) return left.length;
    if (Math.abs(left.length - right.length) > 4) return 99;
    const row = new Array(right.length + 1);
    for (let j = 0; j <= right.length; j += 1) row[j] = j;
    for (let i = 1; i <= left.length; i += 1) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= right.length; j += 1) {
        const cur = row[j];
        const cost = left.charAt(i - 1) === right.charAt(j - 1) ? 0 : 1;
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
        prev = cur;
      }
    }
    return row[right.length];
  }

  function collectAnimHintCatalog() {
    const items = [];
    const seen = new Set();
    const add = (word, kind) => {
      const folded = foldAnimWord(word);
      if (!folded || folded.length < 2 || TEXT_ANIM_STOP.has(folded)) return;
      const key = folded + "|" + kind;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ word: String(word), folded, kind });
    };
    collectMarbleCatalog().forEach((marble) => add(marble.name, "marble"));
    TEXT_ANIM_LEXICONS.forEach((entry) => {
      const kind = entry[0];
      if (kind === "chat") return;
      entry[1].forEach((item) => {
        (item.words || []).forEach((word) => {
          const folded = foldAnimWord(word);
          const asVerb = kind === "action" && /(?:ar|er|ir)$/.test(folded) && folded.length >= 5;
          add(word, asVerb ? "verb" : kind);
        });
      });
    });
    return items;
  }

  function suggestAnimFix(folded, catalog) {
    let best = null;
    let bestScore = 100;
    catalog.forEach((item) => {
      let score = 100;
      if (item.folded === folded) {
        score = 0;
      } else {
        let prefix = 0;
        const max = Math.min(folded.length, item.folded.length);
        while (prefix < max && folded.charAt(prefix) === item.folded.charAt(prefix)) prefix += 1;
        const gap = Math.abs(folded.length - item.folded.length);
        if (item.kind === "marble" && prefix >= 3 && (folded.startsWith(item.folded) || item.folded.startsWith(folded))) {
          score = 0.6 + gap * 0.15;
        } else if (prefix >= 3 && gap <= 3) {
          score = gap + (Math.max(folded.length, item.folded.length) - prefix) * 0.45;
        } else {
          const dist = animLevenshtein(folded, item.folded);
          if (dist <= 2 && item.folded.charAt(0) === folded.charAt(0)) score = dist;
        }
      }
      if (item.kind === "marble") score -= 0.2;
      if (score < bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return bestScore <= 2.5 ? best : null;
  }

  function renderTextAnimCheck(parsed) {
    const panel = textAnimUi.checkPanel;
    const preview = textAnimUi.checkPreview;
    const fixes = textAnimUi.checkFixes;
    if (!panel || !preview || !fixes) return;
    panel.hidden = false;
    const used = new Set();
    parsed.tokens.forEach((token) => {
      if (token.type !== "word" && token.type !== "space") used.add(token.type);
    });
    const legend = TEXT_ANIM_LEGEND.filter((item) => used.has(item.type))
      .map((item) => {
        const color = TEXT_ANIM_COLORS[item.type];
        return `<span class="scan-chip" style="color:${color};border-color:${color}">${escapeHtml(t(item.key))}</span>`;
      })
      .join("");
    const sentence = parsed.tokens.map((token) => {
      if (token.type === "space") return " ";
      if (isAnimFixableMiss(token)) {
        return `<span class="scan-miss">${escapeHtml(token.text)}</span>`;
      }
      const color = animKindColor(token);
      const cls = token.type === "word" ? "scan-word" : "scan-hit";
      return `<span class="${cls}" style="color:${color}">${escapeHtml(token.text)}</span>`;
    }).join("");
    preview.innerHTML = `<span class="scan-legend">${legend}</span><span class="scan-line">${sentence}</span>`;
    const seenMiss = new Set();
    const misses = [];
    parsed.tokens.forEach((token) => {
      if (!isAnimFixableMiss(token)) return;
      const folded = foldAnimWord(token.text);
      if (seenMiss.has(folded)) return;
      seenMiss.add(folded);
      misses.push(token.text);
    });
    if (!misses.length) {
      fixes.innerHTML = `<p class="text-anim-ok">${escapeHtml(t("textAnimCheckAllGood"))}</p>`;
      return;
    }
    const catalog = collectAnimHintCatalog();
    const lines = misses.slice(0, 24).map((word) => {
      const hint = suggestAnimFix(foldAnimWord(word), catalog);
      if (hint) {
        return `<p class="text-anim-fix">${escapeHtml(t("textAnimCheckFix", {
          word,
          hint: hint.word,
          kind: animKindLabel(hint.kind)
        }))}</p>`;
      }
      return `<p class="text-anim-fix">${escapeHtml(t("textAnimCheckUnknown", { word }))}</p>`;
    });
    fixes.innerHTML = `<strong>${escapeHtml(t("textAnimCheckFixes"))}</strong>${lines.join("")}`;
  }

  function clampTextAnimInput() {
    const raw = textAnimUi.input ? textAnimUi.input.value : "";
    if (raw.length > TEXT_ANIM_MAX_CHARS && textAnimUi.input) {
      textAnimUi.input.value = raw.slice(0, TEXT_ANIM_MAX_CHARS);
    }
    return (textAnimUi.input ? textAnimUi.input.value : raw).slice(0, TEXT_ANIM_MAX_CHARS);
  }

  function checkTextAnim() {
    const text = clampTextAnimInput().trim();
    if (textAnimUi.scan) {
      textAnimUi.scan.hidden = true;
      textAnimUi.scan.innerHTML = "";
    }
    if (textAnimUi.result) textAnimUi.result.hidden = true;
    if (!text) {
      if (textAnimUi.checkPreview) textAnimUi.checkPreview.innerHTML = "";
      if (textAnimUi.checkFixes) {
        textAnimUi.checkFixes.innerHTML = `<p class="text-anim-fix">${escapeHtml(t("textAnimCheckEmpty"))}</p>`;
      }
      if (textAnimUi.checkPanel) textAnimUi.checkPanel.hidden = false;
      if (textAnimUi.input) textAnimUi.input.focus();
      return;
    }
    const preview = text.length > 12000 ? text.slice(0, 12000) : text;
    renderTextAnimCheck(tokenizeAnimText(preview));
  }

  async function pasteAndCheckTextAnim() {
    if (navigator.clipboard && typeof navigator.clipboard.readText === "function") {
      try {
        const pasted = await navigator.clipboard.readText();
        if (pasted && textAnimUi.input) {
          textAnimUi.input.value = pasted.slice(0, TEXT_ANIM_MAX_CHARS);
        }
      } catch (_err) {
        /* permiso denegado o portapapeles vacío: se revisa el textarea */
      }
    }
    checkTextAnim();
  }

  function openTextAnim() {
    if (textAnim && textAnim.frameId) cancelAnimationFrame(textAnim.frameId);
    textAnim = null;
    hideTextAnimCheck();
    unlockVipMovieForm();
    renderTextMovies();
    if (textAnimUi.scan) {
      textAnimUi.scan.hidden = true;
      textAnimUi.scan.textContent = "";
      textAnimUi.scan.innerHTML = "";
    }
    if (textAnimUi.result) textAnimUi.result.hidden = true;
    showScreen("textAnim");
  }

  function stopTextAnimRecord() {
    if (!textAnim || !textAnim.recorder) return;
    try {
      if (textAnim.recorder.state !== "inactive") textAnim.recorder.stop();
    } catch (_err) {
      /* ignore */
    }
  }

  function startTextAnimRecord(canvas) {
    if (!canvas || typeof canvas.captureStream !== "function" || typeof MediaRecorder === "undefined") return null;
    try {
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        if (!chunks.length || !textAnim) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
        if (textAnim.downloadUrl) URL.revokeObjectURL(textAnim.downloadUrl);
        textAnim.downloadUrl = URL.createObjectURL(blob);
        if (textAnimUi.download) {
          textAnimUi.download.href = textAnim.downloadUrl;
          textAnimUi.download.download = "marble-animacion.webm";
        }
        if (textAnimUi.result) textAnimUi.result.hidden = false;
      };
      recorder.start();
      return recorder;
    } catch (_err) {
      return null;
    }
  }

  function readTextAnimDuration() {
    const raw = textAnimUi.duration ? Number(textAnimUi.duration.value) : 10;
    return Math.max(10, Math.min(3600, Number.isFinite(raw) ? raw : 10));
  }

  function makeAnimCast(parsed) {
    const ground = 500;
    const seen = new Map();
    parsed.scenes.forEach((scene) => {
      scene.actors.forEach((marble) => {
        if (!seen.has(marble.id)) seen.set(marble.id, marble);
      });
    });
    parsed.hits.forEach((marble) => {
      if (!seen.has(marble.id)) seen.set(marble.id, marble);
    });
    const list = Array.from(seen.values());
    return list.map((marble, index) => {
      const count = Math.max(1, list.length);
      const span = count === 1 ? 0 : Math.min(560, 200 * (count - 1));
      const homeX = 500 - span / 2 + (count === 1 ? 0 : index * (span / (count - 1)));
      return {
        id: marble.id,
        name: marble.name,
        color: marble.color,
        homeX,
        x: homeX,
        y: ground,
        spin: 0,
        scale: 1,
        squashX: 1,
        squashY: 1,
        face: 1,
        hop: 0,
        trail: [],
        prevHop: 0,
        poseScene: -1,
        fromX: homeX,
        fromY: ground,
        renderX: homeX,
        renderY: ground,
        wobble: 0,
        rings: []
      };
    });
  }

  function easeInOutSine(value) {
    return 0.5 - Math.cos(Math.max(0, Math.min(1, value)) * Math.PI) / 2;
  }

  function animLerp(a, b, t) {
    return a + (b - a) * t;
  }

  function jumpArc(progress, height) {
    const cycle = progress - Math.floor(progress);
    return 4 * cycle * (1 - cycle) * height;
  }

  function fillAnimRoundRect(ctx2, x, y, w, h, r) {
    if (typeof ctx2.roundRect === "function") {
      ctx2.beginPath();
      ctx2.roundRect(x, y, w, h, r);
      ctx2.fill();
      return;
    }
    const radius = Math.min(r, h / 2, w / 2);
    ctx2.beginPath();
    ctx2.moveTo(x + radius, y);
    ctx2.arcTo(x + w, y, x + w, y + h, radius);
    ctx2.arcTo(x + w, y + h, x, y + h, radius);
    ctx2.arcTo(x, y + h, x, y, radius);
    ctx2.arcTo(x, y, x + w, y, radius);
    ctx2.closePath();
    ctx2.fill();
  }

  function drawAnimTrail(ctx2, actor) {
    const trail = actor.trail || [];
    if (trail.length > 1) {
      ctx2.save();
      ctx2.lineCap = "round";
      ctx2.lineJoin = "round";
      ctx2.strokeStyle = actor.drawColor || actor.color;
      ctx2.beginPath();
      trail.forEach((pt, index) => {
        if (index === 0) ctx2.moveTo(pt.x, pt.y);
        else ctx2.lineTo(pt.x, pt.y);
      });
      ctx2.globalAlpha = 0.28;
      ctx2.lineWidth = 18 * (actor.scale || 1);
      ctx2.stroke();
      ctx2.globalAlpha = 0.12;
      ctx2.lineWidth = 28 * (actor.scale || 1);
      ctx2.stroke();
      ctx2.restore();
    }
    trail.forEach((pt, index) => {
      const fade = (index + 1) / (trail.length + 1);
      ctx2.globalAlpha = fade * 0.28;
      ctx2.fillStyle = actor.drawColor || actor.color;
      ctx2.beginPath();
      ctx2.arc(pt.x, pt.y, 13 * (actor.scale || 1) * fade, 0, Math.PI * 2);
      ctx2.fill();
    });
    ctx2.globalAlpha = 1;
  }

  function drawAnimMarble(ctx2, actor, extras, asReflection) {
    const drawX = actor.renderX != null ? actor.renderX : actor.x;
    const drawY = actor.renderY != null ? actor.renderY : actor.y;
    const r = 24 * (actor.scale || 1);
    const hop = actor.hop || 0;
    const shadow = Math.max(0.18, 1 - hop / 170);
    const paint = actor.drawColor || actor.color;
    const mood = extras && extras.mood;
    const action = extras && extras.action;
    const clock = extras && extras.clock ? extras.clock : 0;
    if (!asReflection) {
      ctx2.save();
      ctx2.translate(drawX, 508);
      ctx2.fillStyle = "rgba(0,0,0," + (0.42 * shadow) + ")";
      ctx2.beginPath();
      ctx2.ellipse(0, 0, r * (1.28 - hop / 260) * (actor.squashX || 1), 6.5 * shadow, 0, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.restore();
    }
    const glow = mood === "angry" ? "#fb7185" : mood === "sad" ? "#7dd3fc" : mood === "love" ? "#fb7185" : mood === "happy" || mood === "excited" ? "#fde047" : action === "glow" ? "#fde047" : paint;
    ctx2.save();
    ctx2.translate(drawX, drawY);
    if (asReflection) ctx2.scale(1, -0.55);
    ctx2.scale((actor.squashX || 1) * (actor.face || 1), actor.squashY || 1);
    ctx2.rotate((actor.spin || 0) + (actor.wobble || 0));
    const pretty = extras && extras.look === "pretty";
    const ugly = extras && extras.look === "ugly";
    ctx2.shadowColor = glow;
    ctx2.shadowBlur = pretty ? 64 : ugly ? 2 : action === "glow" || mood === "happy" || mood === "excited" ? 38 : 24;
    if (ugly) {
      ctx2.fillStyle = paint;
      ctx2.beginPath();
      ctx2.arc(0, 0, r, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.shadowBlur = 0;
      ctx2.strokeStyle = "#020617";
      ctx2.lineWidth = 3;
      ctx2.stroke();
      ctx2.fillStyle = "rgba(255,255,255,0.22)";
      ctx2.fillRect(-10, -10, 8, 8);
    } else if (pretty) {
      const body = ctx2.createRadialGradient(-7, -9, 1.1, 2, 7, r * 1.12);
      body.addColorStop(0, "#ffffff");
      body.addColorStop(0.1, "#ffffff");
      body.addColorStop(0.22, paint);
      body.addColorStop(0.62, paint);
      body.addColorStop(0.88, paint);
      body.addColorStop(1, "#0b1220");
      ctx2.fillStyle = body;
      ctx2.beginPath();
      ctx2.arc(0, 0, r, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.shadowBlur = 0;
      const skyRef = ctx2.createLinearGradient(0, -r, 0, r);
      skyRef.addColorStop(0, "rgba(186, 230, 253, 0.42)");
      skyRef.addColorStop(0.45, "rgba(186, 230, 253, 0)");
      skyRef.addColorStop(0.7, "rgba(22, 163, 74, 0)");
      skyRef.addColorStop(1, "rgba(21, 128, 61, 0.28)");
      ctx2.fillStyle = skyRef;
      ctx2.beginPath();
      ctx2.arc(0, 0, r, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.strokeStyle = "rgba(255,255,255,0.55)";
      ctx2.lineWidth = 2.6;
      ctx2.stroke();
      ctx2.strokeStyle = "rgba(125, 211, 252, 0.35)";
      ctx2.lineWidth = 5;
      ctx2.beginPath();
      ctx2.arc(0, 0, r - 1.5, -2.4, -0.4);
      ctx2.stroke();
      ctx2.fillStyle = "rgba(255,255,255,0.9)";
      ctx2.beginPath();
      ctx2.ellipse(-7.2, -8.2, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = "rgba(255,255,255,0.35)";
      ctx2.beginPath();
      ctx2.ellipse(8, -5, r * 0.08, r * 0.14, 0.35, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = "rgba(255,255,255,0.16)";
      ctx2.beginPath();
      ctx2.ellipse(6, 9, r * 0.38, r * 0.22, 0.45, 0, Math.PI * 2);
      ctx2.fill();
    } else {
      const body = ctx2.createRadialGradient(-9, -10, 2.5, 3, 6, r * 1.05);
      body.addColorStop(0, "#ffffff");
      body.addColorStop(0.14, paint);
      body.addColorStop(0.62, paint);
      body.addColorStop(1, "#05070c");
      ctx2.fillStyle = body;
      ctx2.beginPath();
      ctx2.arc(0, 0, r, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.shadowBlur = 0;
      ctx2.strokeStyle = "rgba(255,255,255,0.28)";
      ctx2.lineWidth = 2.2;
      ctx2.stroke();
      ctx2.fillStyle = "rgba(255,255,255,0.2)";
      ctx2.beginPath();
      ctx2.ellipse(7, 8, r * 0.42, r * 0.28, 0.4, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = "rgba(255,255,255,0.72)";
      ctx2.beginPath();
      ctx2.ellipse(-7.5, -8.5, r * 0.24, r * 0.17, -0.45, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = "rgba(255,255,255,0.22)";
      ctx2.beginPath();
      ctx2.ellipse(8, -6, r * 0.1, r * 0.16, 0.3, 0, Math.PI * 2);
      ctx2.fill();
    }
    const eyeY = mood === "sad" || action === "cry" ? 2.4 : mood === "angry" ? -1.4 : mood === "shy" ? 1.4 : 0;
    const look = action === "look" ? 1.4 : 0;
    const sleepy = action === "sleep" || mood === "bored";
    const blinkWave = Math.sin(clock * 2.7 + (actor.homeX || 0) * 0.04);
    const blink = sleepy ? true : blinkWave > 0.93 || blinkWave < -0.97;
    const eyeOpen = blink ? 0.42 : mood === "surprised" || mood === "excited" ? 3.2 : 2.55;
    ctx2.fillStyle = "#041018";
    ctx2.beginPath();
    ctx2.ellipse(-5 + look, eyeY, 2.2, eyeOpen, 0, 0, Math.PI * 2);
    ctx2.ellipse(6 + look, eyeY, 2.2, eyeOpen, 0, 0, Math.PI * 2);
    ctx2.fill();
    if (!blink && !sleepy) {
      ctx2.fillStyle = "rgba(255,255,255,0.95)";
      ctx2.beginPath();
      ctx2.arc(-4.1 + look, eyeY - 0.9, 0.75, 0, Math.PI * 2);
      ctx2.arc(6.9 + look, eyeY - 0.9, 0.75, 0, Math.PI * 2);
      ctx2.fill();
    }
    if (mood === "angry") {
      ctx2.strokeStyle = "#041018";
      ctx2.lineWidth = 2.1;
      ctx2.beginPath();
      ctx2.moveTo(-9, -7);
      ctx2.lineTo(-2, -3.2);
      ctx2.moveTo(9, -7);
      ctx2.lineTo(2, -3.2);
      ctx2.stroke();
    } else if (mood === "sad" || action === "cry") {
      ctx2.strokeStyle = "#041018";
      ctx2.lineWidth = 1.8;
      ctx2.beginPath();
      ctx2.moveTo(-8, -2);
      ctx2.lineTo(-3, -5);
      ctx2.moveTo(8, -2);
      ctx2.lineTo(3, -5);
      ctx2.stroke();
    }
    ctx2.strokeStyle = "#041018";
    ctx2.lineWidth = 2;
    ctx2.beginPath();
    if (mood === "happy" || mood === "excited" || action === "laugh" || action === "play") {
      ctx2.arc(0, 4.2, 6.4, 0.18, Math.PI - 0.18);
    } else if (mood === "sad" || action === "cry") {
      ctx2.arc(0, 9, 5.2, Math.PI + 0.35, -0.35);
    } else if (mood === "love" || action === "kiss") {
      ctx2.ellipse(0, 6.2, 2.2, 1.6, 0, 0, Math.PI * 2);
    } else {
      ctx2.moveTo(-3.2, 6.2);
      ctx2.quadraticCurveTo(0, 7.4, 3.2, 6.2);
    }
    ctx2.stroke();
    if (mood === "happy" || mood === "love" || mood === "shy" || action === "kiss") {
      ctx2.fillStyle = "rgba(251,113,133,0.45)";
      ctx2.beginPath();
      ctx2.ellipse(-10, 5, 3.2, 1.7, 0, 0, Math.PI * 2);
      ctx2.ellipse(10, 5, 3.2, 1.7, 0, 0, Math.PI * 2);
      ctx2.fill();
    }
    ctx2.strokeStyle = "rgba(255,255,255,0.38)";
    ctx2.lineWidth = 2.3;
    ctx2.beginPath();
    ctx2.arc(-2, -3, r * 0.72, -1.2, -0.22);
    ctx2.stroke();
    ctx2.restore();
    if (asReflection) return;
    ctx2.save();
    ctx2.translate(drawX, drawY + r * (actor.squashY || 1) + 16);
    ctx2.fillStyle = "rgba(2, 6, 23, 0.7)";
    const label = String(actor.name).slice(0, 12);
    ctx2.font = "800 12px Segoe UI";
    const lw = Math.max(36, ctx2.measureText(label).width + 16);
    fillAnimRoundRect(ctx2, -lw / 2, -11, lw, 16, 8);
    ctx2.fillStyle = "#f8fafc";
    ctx2.textAlign = "center";
    ctx2.fillText(label, 0, 1);
    ctx2.restore();
  }

  function spawnAnimSpark(list, x, y, color, extra) {
    if (list.length > 140) list.splice(0, list.length - 140);
    list.push(Object.assign({
      x,
      y,
      vx: (Math.random() - 0.5) * 3.2,
      vy: -1.2 - Math.random() * 2.4,
      life: 1,
      color,
      size: 3
    }, extra || {}));
  }

  function poseAnimActor(actor, scene, progress, buddy, sparks) {
    const ground = 500;
    const adj = scene.adjective || "";
    const rate = adj === "fast" ? 1.85 : adj === "slow" ? 0.42 : 1;
    const p = easeInOutSine(progress);
    let action = scene.action || "idle";
    if (scene.place === "sky" && action !== "fall" && action !== "hug" && action !== "kiss" && action !== "cry" && action !== "sleep" && action !== "sit") action = "fly";
    else if (scene.place === "sea" && action !== "jump" && action !== "fly" && action !== "hug" && action !== "kiss" && action !== "fall") action = "swim";
    const prevX = actor.x;
    actor.scale = adj === "big" ? 1.55 : adj === "small" ? 0.58 : adj === "tall" ? 1.28 : adj === "strong" ? 1.18 : 1;
    actor.spin = 0;
    actor.squashX = 1;
    actor.squashY = 1;
    actor.x = actor.homeX;
    actor.y = ground;
    actor.hop = 0;
    const tint = { red: "#ef4444", blue: "#3b82f6", green: "#22c55e", yellow: "#eab308", pink: "#ec4899", gold: "#fbbf24" };
    actor.drawColor = tint[adj] || actor.color;
    const bob = (cycles, amp) => Math.abs(Math.sin(progress * Math.PI * cycles * rate)) * amp;
    if (action === "jump") {
      const cycle = (progress * 2.35 * rate) % 1;
      if (cycle < 0.16) {
        const crouch = cycle / 0.16;
        actor.squashX = 1.1 + crouch * 0.42;
        actor.squashY = 1 - crouch * 0.42;
        actor.y = ground + crouch * 14;
        actor.hop = 0;
      } else {
        const t = (cycle - 0.16) / 0.84;
        actor.hop = jumpArc(t, 228);
        actor.y = ground - actor.hop;
        actor.x = actor.homeX + Math.sin(progress * Math.PI * 2 * rate) * 36;
        actor.spin = Math.sin(t * Math.PI) * 0.55 * actor.face;
        const land = t > 0.88;
        actor.squashX = land ? 1.42 : 0.72;
        actor.squashY = land ? 0.62 : 1.34;
        if (land && Math.random() < 0.55) spawnAnimSpark(sparks, actor.x, ground + 4, "#bbf7d0", { vx: (Math.random() - 0.5) * 3.4, vy: -0.8, size: 2.4 });
      }
    } else if (action === "run") {
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 5 * rate) * 150;
      actor.hop = bob(14, 22);
      actor.y = ground - actor.hop;
      actor.squashX = 1.22;
      actor.squashY = 0.8 + bob(14, 0.16);
      actor.spin = Math.sin(progress * Math.PI * 5 * rate) * 0.28;
      if (Math.random() < 0.34) spawnAnimSpark(sparks, actor.x - 18 * actor.face, ground + 2, "#86efac", { vx: -1.8 * actor.face, vy: -0.35, size: 2.2 });
    } else if (action === "walk") {
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 2.2 * rate) * 78;
      actor.hop = bob(9, 12);
      actor.y = ground - actor.hop;
      actor.squashX = 1 + bob(9, 0.1);
      actor.squashY = 1 - bob(9, 0.1);
      actor.spin = Math.sin(progress * Math.PI * 2.2 * rate) * 0.14;
    } else if (action === "dance") {
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 8 * rate) * 42;
      actor.hop = bob(10, 36);
      actor.y = ground - actor.hop;
      actor.spin = Math.sin(progress * Math.PI * 10 * rate) * 0.55;
      actor.squashX = 0.9 + bob(10, 0.2);
      actor.squashY = 1.1 - bob(10, 0.18);
      if (Math.random() < 0.16) spawnAnimSpark(sparks, actor.x, actor.y - 26, ["#f472b6", "#facc15", "#38bdf8"][Math.floor(Math.random() * 3)]);
    } else if (action === "fly") {
      actor.hop = 260 + Math.sin(progress * Math.PI * 3 * rate) * 36;
      actor.y = ground - actor.hop;
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 2 * rate) * 70;
      actor.spin = Math.sin(progress * Math.PI * 2 * rate) * 0.25;
      actor.squashX = 1.12;
      actor.squashY = 0.86;
      if (Math.random() < 0.12) spawnAnimSpark(sparks, actor.x, actor.y + 18, "#e0f2fe", { vx: 0, vy: 1.4, size: 2 });
    } else if (action === "spin") {
      actor.spin = progress * Math.PI * 10 * rate;
      actor.y = ground - 18;
      actor.squashX = 1.15;
      actor.squashY = 0.85;
    } else if (action === "sleep") {
      actor.y = ground + 8;
      actor.scale *= 0.9;
      actor.squashX = 1.28;
      actor.squashY = 0.72;
      actor.spin = 0.35;
      if (Math.random() < 0.08) sparks.push({ x: actor.x + 20, y: actor.y - 26, vx: 0.25, vy: -0.55, life: 1, color: "#e2e8f0", glyph: "z", size: 3 });
    } else if (action === "eat") {
      actor.hop = bob(10, 8);
      actor.y = ground - actor.hop;
      actor.squashY = 0.9 + Math.sin(progress * Math.PI * 10 * rate) * 0.12;
    } else if (action === "sit") {
      actor.y = ground + 12;
      actor.squashX = 1.22;
      actor.squashY = 0.78;
    } else if (action === "hide") {
      actor.scale *= 0.42 + Math.abs(Math.cos(progress * Math.PI)) * 0.18;
      actor.y = ground + 14;
    } else if (action === "fall") {
      actor.y = 70 + p * (ground - 70);
      actor.spin = p * Math.PI * 2.4;
      actor.squashY = 1.15;
      actor.hop = Math.max(0, ground - actor.y);
      if (p > 0.92) {
        actor.squashX = 1.35;
        actor.squashY = 0.68;
      }
    } else if (action === "wave") {
      actor.y = ground - bob(9, 16);
      actor.spin = Math.sin(progress * Math.PI * 8 * rate) * 0.4;
      if (Math.random() < 0.14) spawnAnimSpark(sparks, actor.x + 22, actor.y - 22, "#fde047");
    } else if (action === "laugh") {
      actor.hop = bob(14, 24);
      actor.y = ground - actor.hop;
      actor.squashX = 1.08;
      actor.squashY = 0.9;
      if (Math.random() < 0.12) spawnAnimSpark(sparks, actor.x, actor.y - 28, "#facc15");
    } else if (action === "cry") {
      actor.y = ground + 4;
      actor.squashY = 0.9;
      if (Math.random() < 0.2) sparks.push({ x: actor.x + 5, y: actor.y - 2, vx: 0.15, vy: 2.2, life: 1, color: "#38bdf8", size: 2 });
    } else if ((action === "hug" || action === "kiss" || action === "love") && buddy) {
      const mid = (actor.homeX + buddy.homeX) / 2;
      actor.x = actor.homeX + (mid - actor.homeX) * Math.min(1, p * 1.35);
      actor.y = ground - Math.sin(p * Math.PI) * 14;
      actor.squashX = 1.12;
      actor.squashY = 0.9;
      if (p > 0.35 && Math.random() < 0.16) sparks.push({ x: mid, y: ground - 46, vx: (Math.random() - 0.5) * 1.6, vy: -1.3, life: 1, color: "#fb7185", glyph: "♥", size: 3 });
    } else if ((action === "chase" || action === "fight" || action === "push" || action === "look") && buddy) {
      const toward = buddy.homeX - actor.homeX;
      actor.x = actor.homeX + toward * (action === "look" ? 0.1 : 0.32 + 0.18 * Math.sin(progress * Math.PI * 4 * rate));
      if (action === "fight" || action === "push") {
        actor.x += Math.sin(progress * 30 * rate) * 14;
        actor.spin = Math.sin(progress * 30 * rate) * 0.25;
      }
      actor.hop = action === "chase" ? bob(12, 16) : bob(8, 6);
      actor.y = ground - actor.hop;
      if (action === "fight" && Math.random() < 0.12) spawnAnimSpark(sparks, actor.x, actor.y - 10, "#fb7185", { size: 4 });
    } else if (action === "swim") {
      actor.y = 438 + Math.sin(progress * Math.PI * 4 * rate) * 16;
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 2 * rate) * 86;
      actor.spin = Math.sin(progress * Math.PI * 2 * rate) * 0.2;
      actor.squashX = 1.18;
      actor.squashY = 0.82;
      if (Math.random() < 0.18) spawnAnimSpark(sparks, actor.x, actor.y + 16, "#7dd3fc", { vx: 0, vy: -0.8, size: 2 });
    } else if (action === "climb") {
      actor.y = ground - p * 170;
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 8 * rate) * 8;
      actor.hop = ground - actor.y;
    } else if (action === "glow" || adj === "shiny") {
      actor.y = ground - 8 - bob(4, 6);
      if (Math.random() < 0.22) spawnAnimSpark(sparks, actor.x + (Math.random() - 0.5) * 28, actor.y - 20, "#fde047", { size: 4 });
    } else if (action === "grow") {
      actor.scale = 0.62 + p * 1.05;
      actor.y = ground;
    } else if (action === "shrink") {
      actor.scale = 1.15 - p * 0.62;
      actor.y = ground + p * 8;
    } else if (action === "sing") {
      actor.y = ground - bob(6, 12);
      actor.spin = Math.sin(progress * Math.PI * 4 * rate) * 0.2;
      if (Math.random() < 0.12) sparks.push({ x: actor.x + 18, y: actor.y - 30, vx: 0.5, vy: -0.9, life: 1, color: "#c4b5fd", glyph: "♪", size: 3 });
    } else if (action === "throw") {
      actor.x = actor.homeX + Math.sin(p * Math.PI) * 46;
      actor.spin = -p * 0.6;
      if (p > 0.2 && p < 0.85) {
        const tx = actor.x + (1 - p) * 160;
        const ty = ground - Math.sin((p - 0.2) / 0.65 * Math.PI) * 90;
        sparks.push({ x: tx, y: ty, vx: 0, vy: 0, life: 0.35, color: actor.color, size: 8 });
      }
    } else if (action === "play") {
      actor.x = actor.homeX + Math.sin(progress * Math.PI * 6 * rate) * 54;
      actor.hop = bob(9, 42);
      actor.y = ground - actor.hop;
      actor.spin = Math.sin(progress * Math.PI * 7 * rate) * 0.45;
      actor.squashX = 0.9 + bob(9, 0.2);
      actor.squashY = 1.1 - bob(9, 0.18);
      if (Math.random() < 0.14) spawnAnimSpark(sparks, actor.x, actor.y - 20, "#86efac");
    } else if (scene.chat) {
      actor.hop = 14 + Math.abs(Math.sin(progress * Math.PI * 7 + actor.homeX)) * 16;
      actor.y = ground - actor.hop;
      actor.squashX = 1.08 + Math.sin(progress * Math.PI * 8) * 0.08;
      actor.squashY = 0.9 + Math.sin(progress * Math.PI * 8) * 0.1;
      actor.spin = Math.sin(progress * Math.PI * 5) * 0.12;
      if (Math.random() < 0.1) spawnAnimSpark(sparks, actor.x + (Math.random() - 0.5) * 24, actor.y - 28, "#e879f9", { size: 2.5, vy: -0.8 });
    } else {
      actor.hop = 8 + Math.sin(progress * Math.PI * 2.4 + actor.homeX) * 8;
      actor.y = ground - actor.hop;
      actor.squashX = 1.04;
      actor.squashY = 0.96 + Math.sin(progress * Math.PI * 2.4) * 0.04;
    }
    if (scene.mood === "happy" && Math.random() < 0.07) spawnAnimSpark(sparks, actor.x, actor.y - 28, "#fde047");
    if (scene.mood === "angry" && Math.random() < 0.09) spawnAnimSpark(sparks, actor.x, actor.y - 30, "#fb7185");
    if (scene.mood === "scared") {
      actor.x += Math.sin(progress * 40) * 3;
      actor.squashX = 0.9;
    }
    if (scene.object === "star" && Math.random() < 0.1) sparks.push({ x: actor.x, y: actor.y - 44, vx: 0, vy: -0.5, life: 1, color: "#fde047", glyph: "★", size: 3 });
    if (scene.object === "heart" && Math.random() < 0.1) sparks.push({ x: actor.x, y: actor.y - 38, vx: 0, vy: -0.55, life: 1, color: "#fb7185", glyph: "♥", size: 3 });
    if (scene.weather === "wind") {
      actor.x += Math.sin(progress * 9) * 18;
      actor.spin += 0.18;
    }
    if (scene.direction === "left") actor.x -= 80;
    if (scene.direction === "right") actor.x += 80;
    if (scene.direction === "up") actor.y -= 90;
    if (scene.direction === "down") actor.y += 12;
    actor.face = actor.x >= prevX ? 1 : -1;
    if ((actor.prevHop || 0) > 55 && actor.hop < 14) {
      actor.wobble = 0.34;
      if (!actor.rings) actor.rings = [];
      actor.rings.push({ life: 1, r: 8 });
    } else actor.wobble *= 0.82;
    actor.prevHop = actor.hop;
    if (!actor.trail) actor.trail = [];
    const trailOn = action === "run" || action === "jump" || action === "fly" || action === "dance" || action === "chase" || action === "spin" || action === "play";
    if (trailOn) {
      actor.trail.push({ x: actor.x, y: actor.y });
      if (actor.trail.length > 14) actor.trail.shift();
    } else if (actor.trail.length) actor.trail.shift();
  }

  function drawAnimHills(ctx2, canvas, y, color, stretch) {
    ctx2.fillStyle = color;
    ctx2.beginPath();
    ctx2.moveTo(0, canvas.height);
    ctx2.lineTo(0, y);
    ctx2.quadraticCurveTo(160 * stretch, y - 90, 340 * stretch, y + 8);
    ctx2.quadraticCurveTo(540 * stretch, y - 110, 760, y + 18);
    ctx2.quadraticCurveTo(900, y - 50, canvas.width, y + 10);
    ctx2.lineTo(canvas.width, canvas.height);
    ctx2.fill();
  }

  function drawAnimTree(ctx2, tx, baseY, sway, scale) {
    ctx2.save();
    ctx2.translate(tx, baseY);
    ctx2.rotate(sway);
    ctx2.scale(scale || 1, scale || 1);
    ctx2.fillStyle = "#5b3210";
    ctx2.fillRect(-8, -8, 16, 92);
    ctx2.fillStyle = "#15803d";
    ctx2.beginPath();
    ctx2.arc(0, -42, 38, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = "#22c55e";
    ctx2.beginPath();
    ctx2.arc(-22, -18, 24, 0, Math.PI * 2);
    ctx2.arc(24, -16, 22, 0, Math.PI * 2);
    ctx2.arc(4, -58, 20, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = "rgba(187, 247, 208, 0.28)";
    ctx2.beginPath();
    ctx2.arc(-10, -50, 12, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.restore();
  }

  function drawAnimWorld(ctx2, scene, elapsed, canvas) {
    const night = scene.time === "night" || scene.mood === "sad";
    const storm = scene.weather === "storm";
    const sea = scene.place === "sea" || scene.action === "swim";
    const hot = scene.adjective === "hot";
    const wind = scene.weather === "wind";
    const chatWorld = scene.world === "marblechat";
    const realWorld = scene.world === "real" || scene.look === "pretty";
    const sky = ctx2.createLinearGradient(0, 0, 0, canvas.height);
    if (chatWorld) {
      sky.addColorStop(0, "#ffffff");
      sky.addColorStop(1, "#ffffff");
    } else if (realWorld && !night && !storm && !sea && !hot) {
      sky.addColorStop(0, "#e0f2fe");
      sky.addColorStop(0.35, "#bae6fd");
      sky.addColorStop(0.7, "#7dd3fc");
      sky.addColorStop(1, "#38bdf8");
    } else if (night) {
      sky.addColorStop(0, "#020617");
      sky.addColorStop(0.42, "#1e1b4b");
      sky.addColorStop(1, "#111827");
    } else if (storm) {
      sky.addColorStop(0, "#1e293b");
      sky.addColorStop(0.5, "#334155");
      sky.addColorStop(1, "#0f172a");
    } else if (sea) {
      sky.addColorStop(0, "#082f49");
      sky.addColorStop(0.45, "#0284c7");
      sky.addColorStop(1, "#164e63");
    } else if (hot) {
      sky.addColorStop(0, "#9a3412");
      sky.addColorStop(0.4, "#f59e0b");
      sky.addColorStop(1, "#7c2d12");
    } else {
      sky.addColorStop(0, "#36b5ff");
      sky.addColorStop(0.38, "#7dd3fc");
      sky.addColorStop(0.72, "#38bdf8");
      sky.addColorStop(1, "#155e75");
    }
    ctx2.fillStyle = sky;
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    if (!night && !storm && !chatWorld) {
      const sunX = 160 + Math.sin(elapsed * 0.12) * 40;
      const sunY = 78 + Math.cos(elapsed * 0.1) * 10;
      ctx2.save();
      ctx2.translate(sunX, sunY);
      const prettySun = scene.look === "pretty" || realWorld;
      const glow = ctx2.createRadialGradient(0, 0, 8, 0, 0, prettySun ? 170 : 120);
      glow.addColorStop(0, hot ? "rgba(251,146,60,0.55)" : prettySun ? "rgba(254,249,195,0.7)" : "rgba(253,224,71,0.5)");
      glow.addColorStop(prettySun ? 0.35 : 1, prettySun ? "rgba(253,224,71,0.22)" : "rgba(253,224,71,0)");
      if (prettySun) glow.addColorStop(1, "rgba(186, 230, 253, 0)");
      ctx2.fillStyle = glow;
      ctx2.beginPath();
      ctx2.arc(0, 0, prettySun ? 170 : 120, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = hot ? "#fb923c" : prettySun ? "#fff7ed" : "#fde047";
      ctx2.shadowColor = hot ? "#f97316" : "#facc15";
      ctx2.shadowBlur = prettySun ? 72 : 48;
      ctx2.beginPath();
      ctx2.arc(0, 0, prettySun ? 32 : 38, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.shadowBlur = 0;
      if (!prettySun) {
        ctx2.strokeStyle = hot ? "rgba(251, 146, 60, 0.5)" : "rgba(253, 224, 71, 0.5)";
        ctx2.lineWidth = 3.2;
        for (let i = 0; i < 16; i += 1) {
          const ang = elapsed * 0.55 + i * (Math.PI * 2 / 16);
          ctx2.beginPath();
          ctx2.moveTo(Math.cos(ang) * 48, Math.sin(ang) * 48);
          ctx2.lineTo(Math.cos(ang) * 78, Math.sin(ang) * 78);
          ctx2.stroke();
        }
      }
      ctx2.restore();
    }
    if (night) {
      ctx2.fillStyle = "#f8fafc";
      for (let i = 0; i < 56; i += 1) {
        const twinkle = 0.25 + Math.abs(Math.sin(elapsed * 2.4 + i * 1.7)) * 0.75;
        ctx2.globalAlpha = twinkle;
        ctx2.beginPath();
        ctx2.arc((i * 97 + 40) % canvas.width, 18 + (i * 37) % 230, i % 7 === 0 ? 2.2 : 1.05, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;
      ctx2.save();
      ctx2.translate(860, 78);
      ctx2.fillStyle = "#fde68a";
      ctx2.shadowColor = "#fef3c7";
      ctx2.shadowBlur = 26;
      ctx2.beginPath();
      ctx2.arc(0, 0, 28, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.shadowBlur = 0;
      ctx2.fillStyle = "#020617";
      ctx2.beginPath();
      ctx2.arc(12, -8, 22, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.restore();
    }
    if (!chatWorld) {
    const clearDay = realWorld && !night && !storm && !sea;
    ctx2.fillStyle = clearDay
      ? "rgba(255, 255, 255, 0.92)"
      : night || storm
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(255, 255, 255, 0.38)";
      for (let i = 0; i < (realWorld ? 9 : 7); i += 1) {
        const cx = (i * 210 + elapsed * (18 + i * 3) * (wind ? 2.2 : 1)) % (canvas.width + 220) - 110;
        const cy = 70 + (i * 27) % 110 + Math.sin(elapsed * 0.55 + i) * 8;
        ctx2.beginPath();
        ctx2.ellipse(cx, cy, clearDay ? 92 : 78, clearDay ? 30 : 24, 0, 0, Math.PI * 2);
        ctx2.ellipse(cx + 42, cy + 8, 58, 20, 0, 0, Math.PI * 2);
        ctx2.ellipse(cx - 36, cy + 10, 46, 18, 0, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
    if (!night && !storm && !chatWorld) {
      ctx2.strokeStyle = "rgba(15, 23, 42, 0.42)";
      ctx2.lineWidth = 1.7;
      ctx2.lineCap = "round";
      for (let i = 0; i < 6; i += 1) {
        const x = (elapsed * (28 + i * 9) + i * 170) % (canvas.width + 60) - 30;
        const y = 58 + (i * 27) % 86 + Math.sin(elapsed * 1.8 + i) * 5;
        const flap = Math.sin(elapsed * 9 + i) * 7;
        ctx2.beginPath();
        ctx2.moveTo(x - 9, y + flap);
        ctx2.lineTo(x, y);
        ctx2.lineTo(x + 9, y + flap);
        ctx2.stroke();
      }
    }
    if (!chatWorld) {
      drawAnimHills(ctx2, canvas, 268, night ? "rgba(15, 23, 42, 0.55)" : realWorld ? "rgba(125, 211, 252, 0.45)" : "rgba(56, 189, 248, 0.28)", 1.08);
      drawAnimHills(ctx2, canvas, 338, night ? "rgba(15, 23, 42, 0.7)" : realWorld ? "rgba(74, 222, 128, 0.35)" : "rgba(14, 116, 144, 0.42)", 1.05);
      drawAnimHills(ctx2, canvas, 408, night ? "rgba(6, 78, 59, 0.8)" : "rgba(21, 128, 61, 0.82)", 1);
    }
    if (scene.place === "city") {
      for (let i = 0; i < 9; i += 1) {
        const bx = 40 + i * 108;
        const bh = 70 + (i * 37) % 110;
        ctx2.fillStyle = night ? "rgba(15, 23, 42, 0.85)" : "rgba(30, 41, 59, 0.72)";
        ctx2.fillRect(bx, 500 - bh, 70, bh);
        ctx2.fillStyle = night ? "rgba(253, 224, 71, 0.55)" : "rgba(226, 232, 240, 0.28)";
        for (let wy = 500 - bh + 10; wy < 490; wy += 16) {
          ctx2.fillRect(bx + 10, wy, 8, 8);
          ctx2.fillRect(bx + 28, wy, 8, 8);
          ctx2.fillRect(bx + 46, wy, 8, 8);
        }
      }
    }
    if (scene.place === "mountain") {
      ctx2.fillStyle = night ? "#1e293b" : "#64748b";
      ctx2.beginPath();
      ctx2.moveTo(40, 500);
      ctx2.lineTo(280, 210);
      ctx2.lineTo(520, 500);
      ctx2.fill();
      ctx2.beginPath();
      ctx2.moveTo(340, 500);
      ctx2.lineTo(700, 150);
      ctx2.lineTo(980, 500);
      ctx2.fill();
      if (!night && !storm) {
        ctx2.fillStyle = "#f8fafc";
        ctx2.beginPath();
        ctx2.moveTo(640, 230);
        ctx2.lineTo(700, 150);
        ctx2.lineTo(770, 250);
        ctx2.fill();
      }
    }
    if (!chatWorld && scene.place !== "sea" && scene.place !== "city" && scene.place !== "mountain" && scene.place !== "sky") {
      drawAnimTree(ctx2, 108, 500, Math.sin(elapsed * 1.4) * 0.05, 1.12);
      drawAnimTree(ctx2, 868, 500, Math.sin(elapsed * 1.2 + 1) * 0.06, 0.98);
      drawAnimTree(ctx2, 300, 500, Math.sin(elapsed * 1.1) * 0.035, 0.62);
      drawAnimTree(ctx2, 700, 500, Math.sin(elapsed * 1.05 + 0.7) * 0.04, 0.7);
      ctx2.fillStyle = "#15803d";
      for (let i = 0; i < 8; i += 1) {
        const bx = 60 + i * 120;
        const sway = Math.sin(elapsed * 1.8 + i) * 0.12;
        ctx2.save();
        ctx2.translate(bx, 500);
        ctx2.rotate(sway);
        ctx2.beginPath();
        ctx2.ellipse(0, -14, 22, 16, 0, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      }
    }
    if (scene.place === "house") {
      ctx2.fillStyle = "rgba(253, 230, 138, 0.92)";
      ctx2.fillRect(742, 328, 176, 172);
      ctx2.fillStyle = "rgba(234, 88, 12, 0.92)";
      ctx2.beginPath();
      ctx2.moveTo(724, 328);
      ctx2.lineTo(830, 228);
      ctx2.lineTo(936, 328);
      ctx2.fill();
      ctx2.fillStyle = night ? "rgba(253, 224, 71, 0.7)" : "rgba(56, 189, 248, 0.45)";
      ctx2.fillRect(784, 372, 32, 32);
      ctx2.fillRect(848, 372, 32, 32);
      ctx2.fillStyle = "rgba(15, 23, 42, 0.7)";
      ctx2.fillRect(850, 430, 38, 70);
    }
    if (!chatWorld && scene.place !== "sea" && scene.place !== "city" && scene.place !== "mountain" && scene.place !== "sky") {
      for (let i = 0; i < 14; i += 1) {
        const fx = 40 + i * 70;
        const sway = Math.sin(elapsed * 2.4 + i) * 4;
        ctx2.strokeStyle = "#4ade80";
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        ctx2.moveTo(fx, 500);
        ctx2.quadraticCurveTo(fx + sway, 486, fx + sway, 470);
        ctx2.stroke();
        ctx2.fillStyle = ["#fb7185", "#facc15", "#c4b5fd", "#38bdf8", "#f97316"][i % 5];
        ctx2.beginPath();
        ctx2.arc(fx + sway, 468, 7, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.fillStyle = "#fef08a";
        ctx2.beginPath();
        ctx2.arc(fx + sway, 468, 2.4, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
    if (!night && !storm && scene.place !== "sea") {
      ctx2.fillStyle = "#fb7185";
      for (let i = 0; i < 5; i += 1) {
        const bx = (elapsed * (22 + i * 6) + i * 190) % (canvas.width + 40) - 20;
        const by = 250 + Math.sin(elapsed * 2.5 + i) * 28 + (i * 31) % 80;
        const wing = 5 + Math.sin(elapsed * 14 + i) * 3;
        ctx2.save();
        ctx2.translate(bx, by);
        ctx2.beginPath();
        ctx2.ellipse(-wing, 0, wing, 3.2, -0.4, 0, Math.PI * 2);
        ctx2.ellipse(wing, 0, wing, 3.2, 0.4, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      }
      ctx2.fillStyle = "rgba(254, 240, 138, 0.55)";
      for (let i = 0; i < 18; i += 1) {
        const px = (i * 73 + elapsed * 18) % canvas.width;
        const py = 220 + (i * 47 + elapsed * 12) % 250;
        ctx2.globalAlpha = 0.25 + Math.abs(Math.sin(elapsed * 2 + i)) * 0.4;
        ctx2.beginPath();
        ctx2.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;
    }
    const ground = ctx2.createLinearGradient(0, 500, 0, 600);
    if (chatWorld) {
      ground.addColorStop(0, "#d1d5db");
      ground.addColorStop(0.28, "#9ca3af");
      ground.addColorStop(1, "#4b5563");
    } else if (realWorld && !sea && !night && !storm) {
      ground.addColorStop(0, "#86efac");
      ground.addColorStop(0.22, "#4ade80");
      ground.addColorStop(1, "#15803d");
    } else if (realWorld && !sea) {
      ground.addColorStop(0, "#166534");
      ground.addColorStop(0.3, "#14532d");
      ground.addColorStop(1, "#052e16");
    } else {
      ground.addColorStop(0, sea ? "#22d3ee" : "#4ade80");
      ground.addColorStop(0.22, sea ? "#0e7490" : "#16a34a");
      ground.addColorStop(1, sea ? "#164e63" : "#052e16");
    }
    ctx2.fillStyle = ground;
    ctx2.fillRect(0, 500, canvas.width, 100);
    if (!sea && !chatWorld) {
      ctx2.fillStyle = "rgba(180, 83, 9, 0.18)";
      ctx2.beginPath();
      ctx2.ellipse(500, 528, 340, 18, 0, 0, Math.PI * 2);
      ctx2.fill();
    }
    if (chatWorld) {
      ctx2.fillStyle = "#6b7280";
      ctx2.fillRect(0, 498, canvas.width, 8);
      ctx2.fillStyle = "#9ca3af";
      for (let i = 0; i < 18; i += 1) {
        const gx = 20 + i * 56;
        ctx2.fillRect(gx, 508, 28, 4);
      }
    } else if (sea) {
      ctx2.save();
      for (let layer = 0; layer < 3; layer += 1) {
        ctx2.strokeStyle = layer === 0 ? "rgba(255,255,255,0.55)" : "rgba(125, 211, 252, 0.4)";
        ctx2.lineWidth = 3 - layer;
        ctx2.beginPath();
        for (let x = 0; x <= canvas.width; x += 8) {
          const y = 500 + layer * 10 + Math.sin(x / 28 + elapsed * (2.4 + layer)) * (7 - layer * 2);
          if (x === 0) ctx2.moveTo(x, y);
          else ctx2.lineTo(x, y);
        }
        ctx2.stroke();
      }
      ctx2.restore();
    } else {
      ctx2.fillStyle = "rgba(21, 128, 61, 0.35)";
      ctx2.fillRect(0, 498, canvas.width, 6);
      ctx2.strokeStyle = "rgba(187, 247, 208, 0.28)";
      ctx2.lineWidth = 1.4;
      for (let i = 0; i < 36; i += 1) {
        const gx = (i * 37 + elapsed * 26) % canvas.width;
        ctx2.beginPath();
        ctx2.moveTo(gx, 512);
        ctx2.quadraticCurveTo(gx + 6, 502, gx + 12, 512);
        ctx2.stroke();
      }
    }
    if (scene.weather === "rain" || storm) {
      ctx2.strokeStyle = "rgba(186, 230, 253, 0.62)";
      ctx2.lineWidth = 1.5;
      for (let i = 0; i < 90; i += 1) {
        const rx = (i * 73 + elapsed * 460) % canvas.width;
        const ry = (i * 51 + elapsed * 580) % canvas.height;
        ctx2.beginPath();
        ctx2.moveTo(rx, ry);
        ctx2.lineTo(rx + 8, ry + 22);
        ctx2.stroke();
      }
    }
    if (scene.weather === "snow") {
      ctx2.fillStyle = "#e2e8f0";
      for (let i = 0; i < 64; i += 1) {
        const sx = (i * 80 + elapsed * 36 + Math.sin(elapsed + i) * 18) % canvas.width;
        const sy = (i * 47 + elapsed * 64) % canvas.height;
        ctx2.globalAlpha = 0.55 + (i % 3) * 0.15;
        ctx2.beginPath();
        ctx2.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;
    }
    if (wind) {
      ctx2.strokeStyle = "rgba(226, 232, 240, 0.22)";
      ctx2.lineWidth = 2;
      for (let i = 0; i < 10; i += 1) {
        const y = 120 + i * 36;
        const x = (elapsed * 180 + i * 90) % (canvas.width + 120) - 60;
        ctx2.beginPath();
        ctx2.moveTo(x, y);
        ctx2.quadraticCurveTo(x + 40, y - 6, x + 90, y);
        ctx2.stroke();
      }
    }
    if (storm && Math.sin(elapsed * 19) > 0.94) {
      ctx2.fillStyle = "rgba(255,255,255,0.22)";
      ctx2.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (night) {
      ctx2.fillStyle = "#fde047";
      for (let i = 0; i < 16; i += 1) {
        const fx = (i * 83 + elapsed * 16) % canvas.width;
        const fy = 340 + Math.sin(elapsed * 2.2 + i) * 22;
        ctx2.globalAlpha = 0.2 + Math.abs(Math.sin(elapsed * 3.4 + i)) * 0.55;
        ctx2.beginPath();
        ctx2.arc(fx, fy, 2.1, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;
    }
  }

  function drawAnimForeground(ctx2, elapsed, canvas, scene) {
    const chatWorld = scene && scene.world === "marblechat";
    for (let i = 0; i < 26; i += 1) {
      const x = 8 + i * 40 + Math.sin(elapsed * 2.4 + i) * 3;
      const h = 52 + (i % 5) * 8;
      ctx2.fillStyle = chatWorld ? (i % 2 ? "#9ca3af" : "#6b7280") : i % 2 ? "#15803d" : "#166534";
      ctx2.beginPath();
      ctx2.moveTo(x, 600);
      ctx2.quadraticCurveTo(x + 3, 600 - h, x + 8, 600);
      ctx2.fill();
    }
    const mist = ctx2.createLinearGradient(0, 430, 0, 600);
    if (chatWorld) {
      mist.addColorStop(0, "rgba(255,255,255,0)");
      mist.addColorStop(1, "rgba(148,163,184,0.18)");
    } else {
      mist.addColorStop(0, "rgba(2,6,23,0)");
      mist.addColorStop(1, "rgba(2,6,23,0.22)");
    }
    ctx2.fillStyle = mist;
    ctx2.fillRect(0, 430, canvas.width, 170);
  }

  function wrapAnimSpeechLines(ctx2, raw) {
    const words = raw.split(" ");
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const next = line ? line + " " + word : word;
      if (ctx2.measureText(next).width > 180 && line) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    if (line) lines.push(line);
    const shown = lines.slice(0, 3);
    if (lines.length > 3) shown[2] = shown[2].slice(0, Math.max(4, shown[2].length - 1)) + "…";
    return shown;
  }

  function drawAnimThought(ctx2, actor, message, clock) {
    const raw = String(message || "").replace(/\s+/g, " ").trim();
    if (!raw) return;
    const x = actor.renderX != null ? actor.renderX : actor.x;
    const y = actor.renderY != null ? actor.renderY : actor.y;
    ctx2.save();
    ctx2.font = "700 14px Segoe UI";
    const shown = wrapAnimSpeechLines(ctx2, raw);
    const width = Math.max(64, Math.min(210, shown.reduce((best, item) => Math.max(best, ctx2.measureText(item).width), 0) + 28));
    const height = 22 + shown.length * 18;
    const bob = Math.sin((clock || 0) * 2.4) * 3;
    const cx = x;
    const top = y - 58 - height + bob;
    ctx2.fillStyle = "rgba(226, 232, 240, 0.95)";
    ctx2.strokeStyle = "rgba(100, 116, 139, 0.65)";
    ctx2.lineWidth = 2;
    [[x - 6, y - 28, 5], [x - 14, y - 40, 7], [x - 8, y - 50, 9]].forEach((dot) => {
      ctx2.beginPath();
      ctx2.arc(dot[0], dot[1] + bob * 0.4, dot[2], 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
    });
    ctx2.beginPath();
    ctx2.ellipse(cx - width * 0.28, top + height * 0.55, width * 0.32, height * 0.42, 0, 0, Math.PI * 2);
    ctx2.ellipse(cx + width * 0.22, top + height * 0.52, width * 0.3, height * 0.4, 0, 0, Math.PI * 2);
    ctx2.ellipse(cx, top + height * 0.38, width * 0.42, height * 0.38, 0, 0, Math.PI * 2);
    ctx2.ellipse(cx - width * 0.08, top + height * 0.62, width * 0.36, height * 0.32, 0, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.stroke();
    ctx2.fillStyle = "#334155";
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    shown.forEach((item, index) => {
      ctx2.fillText(item, cx, top + 18 + index * 18);
    });
    ctx2.restore();
  }

  function drawAnimSpeech(ctx2, actor, message, clock, secret) {
    if (secret) {
      drawAnimThought(ctx2, actor, message, clock);
      return;
    }
    const raw = String(message || "").replace(/\s+/g, " ").trim();
    if (!raw) return;
    const x = actor.renderX != null ? actor.renderX : actor.x;
    const y = actor.renderY != null ? actor.renderY : actor.y;
    ctx2.save();
    ctx2.font = "700 14px Segoe UI";
    const shown = wrapAnimSpeechLines(ctx2, raw);
    const width = Math.max(48, Math.min(196, shown.reduce((best, item) => Math.max(best, ctx2.measureText(item).width), 0) + 22));
    const height = 16 + shown.length * 18;
    const bob = Math.sin((clock || 0) * 3.2) * 3;
    const bx = x - width / 2;
    const by = y - 46 - height + bob;
    ctx2.shadowColor = "rgba(192, 38, 211, 0.35)";
    ctx2.shadowBlur = 12;
    ctx2.fillStyle = "#fdf4ff";
    fillAnimRoundRect(ctx2, bx, by, width, height, 12);
    ctx2.shadowBlur = 0;
    ctx2.beginPath();
    ctx2.moveTo(x - 8, by + height);
    ctx2.lineTo(x, by + height + 10);
    ctx2.lineTo(x + 8, by + height);
    ctx2.closePath();
    ctx2.fill();
    ctx2.strokeStyle = "rgba(232, 121, 249, 0.85)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.fillStyle = "#86198f";
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    shown.forEach((item, index) => {
      ctx2.fillText(item, x, by + 14 + index * 18);
    });
    ctx2.restore();
  }

  let animPixelScratch = null;
  function pixelateAnimCanvas(ctx2, canvas, scale) {
    const w = Math.max(32, Math.round(canvas.width / (scale || 14)));
    const h = Math.max(18, Math.round(canvas.height / (scale || 14)));
    if (!animPixelScratch) animPixelScratch = document.createElement("canvas");
    animPixelScratch.width = w;
    animPixelScratch.height = h;
    const px = animPixelScratch.getContext("2d");
    px.imageSmoothingEnabled = false;
    px.drawImage(canvas, 0, 0, w, h);
    try {
      const img = px.getImageData(0, 0, w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.round(d[i] / 48) * 48;
        d[i + 1] = Math.round(d[i + 1] / 48) * 48;
        d[i + 2] = Math.round(d[i + 2] / 48) * 48;
      }
      px.putImageData(img, 0, 0);
    } catch (_err) {
      /* ignore tainted canvas */
    }
    ctx2.imageSmoothingEnabled = false;
    ctx2.drawImage(animPixelScratch, 0, 0, canvas.width, canvas.height);
    ctx2.imageSmoothingEnabled = true;
  }

  function drawAnimVignette(ctx2, canvas, scene) {
    if (scene && scene.world === "marblechat") return;
    const vg = ctx2.createRadialGradient(canvas.width / 2, canvas.height * 0.55, 180, canvas.width / 2, canvas.height * 0.55, 640);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,6,23,0.42)");
    ctx2.fillStyle = vg;
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
  }

  function playTextAnimation(sourceText) {
    const canvas = textAnimUi.canvas;
    if (!canvas) return;
    const ctx2 = canvas.getContext("2d");
    const parsed = parseTextAnim(sourceText);
    const duration = readTextAnimDuration();
    const cast = makeAnimCast(parsed);
    const sparks = [];
    if (textAnim && textAnim.frameId) cancelAnimationFrame(textAnim.frameId);
    stopTextAnimRecord();
    textAnim = {
      phase: "scan",
      started: performance.now(),
      tokens: parsed.tokens,
      hits: parsed.hits,
      scenes: parsed.scenes,
      actions: parsed.actions,
      cast,
      sparks,
      duration,
      sourceText,
      frameId: null,
      recorder: null,
      camX: 0,
      camY: 0,
      camZ: 1.06,
      shake: 0,
      downloadUrl: textAnim && textAnim.downloadUrl
    };
    renderTextAnimScan(parsed);
    if (textAnimUi.result) textAnimUi.result.hidden = true;
    const chatScan = detectAnimWorld(sourceText) === "marblechat" || parsed.scenes.some((scene) => scene.world === "marblechat");
    if (chatScan) {
      textAnim.phase = "play";
      textAnim.recorder = startTextAnimRecord(canvas);
    }
    const loop = (now) => {
      if (!textAnim) return;
      const elapsed = (now - textAnim.started) / 1000;
      if (textAnim.phase === "scan") {
        const sky = ctx2.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, "#082f49");
        sky.addColorStop(0.5, "#0f172a");
        sky.addColorStop(1, "#020617");
        ctx2.fillStyle = sky;
        ctx2.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 22; i += 1) {
          ctx2.fillStyle = "rgba(125, 211, 252," + (0.04 + (i % 4) * 0.02) + ")";
          ctx2.beginPath();
          ctx2.arc((i * 79 + elapsed * 36) % canvas.width, 40 + (i * 41) % 260, 10 + (i % 5) * 4, 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.fillStyle = "#e0f2fe";
        ctx2.font = "800 28px Segoe UI";
        ctx2.textAlign = "center";
        ctx2.shadowColor = "#38bdf8";
        ctx2.shadowBlur = 18;
        ctx2.fillText(t("textAnimScanning"), canvas.width / 2, 72);
        ctx2.shadowBlur = 0;
        let x = 50;
        let y = 140;
        textAnim.tokens.forEach((token) => {
          const label = token.text.replace(/\s+/g, " ");
          if (!label.trim()) {
            x += 8;
            return;
          }
          const color = animKindColor(token);
          ctx2.font = token.type === "word" ? "600 20px Segoe UI" : "800 22px Segoe UI";
          const textW = ctx2.measureText(label).width;
          const pad = token.type === "word" ? 4 : 10;
          const boxW = textW + pad * 2;
          if (x + boxW > canvas.width - 36) {
            x = 50;
            y += 44;
          }
          if (token.type !== "word") {
            ctx2.fillStyle = color;
            ctx2.globalAlpha = 0.22;
            fillAnimRoundRect(ctx2, x, y - 22, boxW, 32, 8);
            ctx2.globalAlpha = 1;
          }
          ctx2.fillStyle = color;
          ctx2.textAlign = "left";
          ctx2.fillText(label, x + pad, y);
          x += boxW + 8;
        });
        let lx = 50;
        const ly = canvas.height - 36;
        TEXT_ANIM_LEGEND.forEach((item) => {
          if (!textAnim.tokens.some((token) => token.type === item.type)) return;
          const chip = t(item.key);
          ctx2.font = "700 13px Segoe UI";
          const cw = ctx2.measureText(chip).width + 16;
          ctx2.fillStyle = TEXT_ANIM_COLORS[item.type];
          ctx2.globalAlpha = 0.2;
          fillAnimRoundRect(ctx2, lx, ly - 16, cw, 24, 8);
          ctx2.globalAlpha = 1;
          ctx2.fillStyle = TEXT_ANIM_COLORS[item.type];
          ctx2.fillText(chip, lx + 8, ly);
          lx += cw + 10;
        });
        if (elapsed > 2 || textAnim.tokens.length > 90) {
          textAnim.phase = "play";
          textAnim.started = now;
          textAnim.recorder = startTextAnimRecord(canvas);
        }
      } else {
        const playTime = elapsed;
        const sceneCount = Math.max(1, textAnim.scenes.length);
        const sceneLen = textAnim.duration / sceneCount;
        const sceneIndex = Math.min(sceneCount - 1, Math.floor(playTime / sceneLen));
        const scene = textAnim.scenes[sceneIndex] || { action: "idle", actors: textAnim.hits, text: textAnim.sourceText };
        const local = sceneLen ? Math.min(1, (playTime - sceneIndex * sceneLen) / sceneLen) : 1;
        const activeIds = new Set((scene.actors || []).map((item) => item.id));
        const byId = {};
        textAnim.cast.forEach((actor) => {
          byId[actor.id] = actor;
        });
        textAnim.cast.forEach((actor) => {
          const on = activeIds.has(actor.id);
          const buddyMarble = (scene.actors || []).find((item) => item.id !== actor.id);
          const buddy = buddyMarble ? byId[buddyMarble.id] : null;
          if (on) poseAnimActor(actor, scene, local, buddy, textAnim.sparks);
          else {
            actor.y = 500 - Math.abs(Math.sin(playTime * 2 + actor.homeX)) * 5;
            actor.x = actor.homeX;
            actor.scale = 0.72;
            actor.spin = 0;
            actor.squashX = 1.06;
            actor.squashY = 0.94;
            actor.hop = 0;
            actor.face = 1;
            actor.drawColor = actor.color;
            actor.wobble = 0;
            if (actor.trail && actor.trail.length) actor.trail.shift();
          }
          if (actor.poseScene !== sceneIndex) {
            actor.fromX = actor.renderX != null ? actor.renderX : actor.x;
            actor.fromY = actor.renderY != null ? actor.renderY : actor.y;
            actor.poseScene = sceneIndex;
          }
          const blend = easeInOutSine(Math.min(1, local / 0.14));
          actor.renderX = animLerp(actor.fromX, actor.x, blend);
          actor.renderY = animLerp(actor.fromY, actor.y, blend);
          if (on && (actor.prevHop || 0) < 18 && actor.hop < 12 && actor.wobble > 0.16) {
            textAnim.shake = Math.max(textAnim.shake, 5.5);
            for (let d = 0; d < 4; d += 1) {
              spawnAnimSpark(textAnim.sparks, actor.renderX + (Math.random() - 0.5) * 18, 502, "#bbf7d0", {
                vx: (Math.random() - 0.5) * 3.4,
                vy: -0.4 - Math.random(),
                size: 2.4
              });
            }
          }
        });
        const live = textAnim.cast.filter((actor) => activeIds.has(actor.id));
        const focus = live.length ? live.reduce((sum, actor) => sum + (actor.renderX != null ? actor.renderX : actor.x), 0) / live.length : 500;
        const hop = live.length ? live.reduce((sum, actor) => sum + (actor.hop || 0), 0) / live.length : 0;
        const wantX = (focus - 500) * 0.52;
        const wantY = -96 - hop * 0.18;
        const wantZ = 1.18 + Math.min(0.14, hop / 900);
        textAnim.camX = animLerp(textAnim.camX, wantX, 0.12);
        textAnim.camY = animLerp(textAnim.camY, wantY, 0.12);
        textAnim.camZ = animLerp(textAnim.camZ, wantZ, 0.1);
        if (scene.action === "fight" || scene.action === "fall") textAnim.shake = Math.max(textAnim.shake, 3.2);
        textAnim.shake *= 0.86;
        const sh = textAnim.shake;
        ctx2.save();
        ctx2.translate(canvas.width / 2 + Math.sin(playTime * 52) * sh, canvas.height / 2 + Math.cos(playTime * 47) * sh);
        ctx2.scale(textAnim.camZ, textAnim.camZ);
        ctx2.translate(-canvas.width / 2 - textAnim.camX, -canvas.height / 2 + textAnim.camY);
        drawAnimWorld(ctx2, scene, playTime, canvas);
        const ordered = textAnim.cast.slice().sort((a, b) => (a.renderY || a.y) - (b.renderY || b.y));
        const sea = scene.place === "sea" || scene.action === "swim";
        if (sea) {
          ctx2.save();
          ctx2.beginPath();
          ctx2.rect(0, 500, canvas.width, 100);
          ctx2.clip();
          ctx2.globalAlpha = 0.28;
          ordered.forEach((actor) => {
            const extras = Object.assign({}, scene, { clock: playTime, dim: !activeIds.has(actor.id) });
            const keepY = actor.renderY;
            actor.renderY = 1000 - (actor.renderY || actor.y);
            drawAnimMarble(ctx2, actor, extras, true);
            actor.renderY = keepY;
          });
          ctx2.restore();
        }
        ordered.forEach((actor) => {
          drawAnimTrail(ctx2, actor);
          const dx = actor.renderX != null ? actor.renderX : actor.x;
          const dy = actor.renderY != null ? actor.renderY : actor.y;
          if (activeIds.has(actor.id) && (scene.action === "run" || scene.action === "jump" || scene.action === "chase" || scene.action === "fly")) {
            ctx2.strokeStyle = "rgba(255,255,255,0.28)";
            ctx2.lineWidth = 2;
            ctx2.lineCap = "round";
            for (let s = 0; s < 4; s += 1) {
              const oy = dy - 8 + s * 8;
              const ox = dx - (28 + s * 10) * (actor.face || 1);
              ctx2.beginPath();
              ctx2.moveTo(ox, oy);
              ctx2.lineTo(ox - 18 * (actor.face || 1), oy + 2);
              ctx2.stroke();
            }
          }
          if (actor.rings && actor.rings.length) {
            actor.rings = actor.rings.filter((ring) => {
              ring.life -= 0.045;
              ring.r += 3.2;
              if (ring.life <= 0) return false;
              ctx2.strokeStyle = "rgba(187, 247, 208," + (ring.life * 0.55) + ")";
              ctx2.lineWidth = 2.4;
              ctx2.beginPath();
              ctx2.ellipse(dx, 506, ring.r, ring.r * 0.28, 0, 0, Math.PI * 2);
              ctx2.stroke();
              return true;
            });
          }
          const extras = Object.assign({}, scene, { clock: playTime, dim: !activeIds.has(actor.id) });
          if (extras.dim) ctx2.globalAlpha = 0.42;
          drawAnimMarble(ctx2, actor, extras);
          ctx2.globalAlpha = 1;
          if (scene.action === "eat" && activeIds.has(actor.id)) {
            const dx = actor.renderX != null ? actor.renderX : actor.x;
            const dy = actor.renderY != null ? actor.renderY : actor.y;
            ctx2.font = "28px Segoe UI";
            ctx2.textAlign = "center";
            ctx2.fillText("🍕", dx + 30, dy - 4);
          }
        });
        if (scene.chat && live.length) {
          const speaker = live.find((actor) => activeIds.has(actor.id)) || live[0];
          drawAnimSpeech(ctx2, speaker, scene.chat, playTime, scene.secret);
        }
        textAnim.sparks = textAnim.sparks.filter((spark) => {
          spark.vy += spark.glyph ? 0.015 : 0.055;
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.life -= 0.015;
          if (spark.life <= 0) return false;
          ctx2.globalAlpha = Math.max(0, spark.life);
          ctx2.fillStyle = spark.color;
          if (spark.glyph) {
            ctx2.font = "800 18px Segoe UI";
            ctx2.textAlign = "center";
            ctx2.fillText(spark.glyph, spark.x, spark.y);
          } else {
            ctx2.beginPath();
            ctx2.arc(spark.x, spark.y, (spark.size || 3) * (0.65 + spark.life * 0.45), 0, Math.PI * 2);
            ctx2.fill();
          }
          ctx2.globalAlpha = 1;
          return true;
        });
        drawAnimForeground(ctx2, playTime, canvas, scene);
        drawAnimVignette(ctx2, canvas, scene);
        ctx2.restore();
        if (scene.look === "ugly") pixelateAnimCanvas(ctx2, canvas, 14);
        const fadeEdge = Math.min(local, 1 - local);
        if (fadeEdge < 0.08) {
          ctx2.fillStyle = "rgba(2,6,23," + ((0.08 - fadeEdge) / 0.08 * 0.28) + ")";
          ctx2.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx2.fillStyle = "rgba(2, 6, 23, 0.55)";
        fillAnimRoundRect(ctx2, 56, 14, canvas.width - 112, 76, 20);
        ctx2.strokeStyle = "rgba(125, 211, 252, 0.25)";
        ctx2.lineWidth = 2;
        ctx2.strokeRect(62, 20, canvas.width - 124, 64);
        const caption = scene.text.length > 58 ? scene.text.slice(0, 56) + "…" : scene.text;
        ctx2.fillStyle = "#eaf7ff";
        ctx2.font = "800 22px Segoe UI";
        ctx2.textAlign = "center";
        ctx2.fillText(caption, canvas.width / 2, 46);
        ctx2.fillStyle = "#fdba74";
        ctx2.font = "700 15px Segoe UI";
        ctx2.fillText(scene.actionLabel ? scene.actionLabel : t("textAnimPlaying"), canvas.width / 2, 70);
        const barW = canvas.width - 160;
        ctx2.fillStyle = "rgba(15,23,42,0.65)";
        fillAnimRoundRect(ctx2, 80, canvas.height - 22, barW, 8, 4);
        ctx2.fillStyle = "#38bdf8";
        fillAnimRoundRect(ctx2, 80, canvas.height - 22, barW * Math.min(1, playTime / Math.max(0.01, textAnim.duration)), 8, 4);
        if (playTime >= textAnim.duration) {
          stopTextAnimRecord();
          if (!textAnim.recorder && textAnimUi.result) textAnimUi.result.hidden = false;
          textAnim.phase = "done";
          return;
        }
      }
      textAnim.frameId = requestAnimationFrame(loop);
    };
    textAnim.frameId = requestAnimationFrame(loop);
  }

  function convertTextAnim() {
    hideTextAnimCheck();
    const text = clampTextAnimInput().trim();
    if (!text) {
      if (textAnimUi.input) textAnimUi.input.focus();
      return;
    }
    playTextAnimation(text);
  }

  if (ui.renameSave) {
    ui.renameSave.addEventListener("click", () => {
      if (activeSlot != null) renameSave(activeSlot);
    });
  }
  document.getElementById("backToSlots").addEventListener("click", () => {
    activeSlot = null;
    closeMinigamePicker();
    renderSlots();
    showScreen("slots");
  });
  ui.minigameModal.addEventListener("click", (event) => {
    if (event.target === ui.minigameModal) closeMinigamePicker();
  });
  const openPacksButton = document.getElementById("openPacksButton");
  if (openPacksButton) openPacksButton.addEventListener("click", openPacks);
  const textAnimButton = document.getElementById("textAnimButton");
  if (textAnimButton) textAnimButton.addEventListener("click", openTextAnim);
  if (textAnimUi.back) {
    textAnimUi.back.addEventListener("click", () => {
      if (textAnim && textAnim.frameId) cancelAnimationFrame(textAnim.frameId);
      stopTextAnimRecord();
      unlockVipMovieForm();
      if (window.GameI18n) GameI18n.applyDom();
      renderMenu();
      showScreen("menu");
    });
  }
  if (textAnimUi.convert) textAnimUi.convert.addEventListener("click", convertTextAnim);
  if (textAnimUi.check) textAnimUi.check.addEventListener("click", () => { pasteAndCheckTextAnim(); });
  if (textAnimUi.save) textAnimUi.save.addEventListener("click", saveCurrentTextMovie);
  if (textAnimUi.replay) textAnimUi.replay.addEventListener("click", convertTextAnim);
  document.getElementById("backFromPacks").addEventListener("click", () => {
    renderSlots();
    showScreen("slots");
  });
  document.getElementById("newPackButton").addEventListener("click", () => openPackEditor(null));
  document.getElementById("cancelPackEditor").addEventListener("click", leavePackEditor);
  document.getElementById("packGenderButton").addEventListener("click", openPackGenderPanel);
  document.getElementById("savePackButton").addEventListener("click", savePack);
  document.getElementById("createButton").addEventListener("click", openCreate);
  if (ui.createMap) ui.createMap.addEventListener("click", () => openLevelEditor("map"));
  if (ui.createMinigame) ui.createMinigame.addEventListener("click", () => openLevelEditor("mini"));
  const cancelLevelEditor = document.getElementById("cancelLevelEditor");
  if (cancelLevelEditor) cancelLevelEditor.addEventListener("click", closeLevelEditor);
  if (ui.levelEditorNext) ui.levelEditorNext.addEventListener("click", advanceLevelEditor);
  if (ui.levelDeletePart) ui.levelDeletePart.addEventListener("click", deleteSelectedPart);
  if (ui.levelGrowX) ui.levelGrowX.addEventListener("click", () => scaleSelectedPart("x", 1.12));
  if (ui.levelShrinkX) ui.levelShrinkX.addEventListener("click", () => scaleSelectedPart("x", 1 / 1.12));
  if (ui.levelGrowY) ui.levelGrowY.addEventListener("click", () => scaleSelectedPart("y", 1.12));
  if (ui.levelShrinkY) ui.levelShrinkY.addEventListener("click", () => scaleSelectedPart("y", 1 / 1.12));
  if (ui.levelRotate) ui.levelRotate.addEventListener("click", rotateSelectedPart);
  if (ui.levelEraser) ui.levelEraser.addEventListener("click", setEraserTool);
  if (ui.levelEditScript) ui.levelEditScript.addEventListener("click", openScriptEditor);
  if (ui.scriptEditDone) ui.scriptEditDone.addEventListener("click", closeScriptEditor);
  if (ui.levelFinishButton) ui.levelFinishButton.addEventListener("click", finishCustomMap);
  if (ui.levelDiffInput) {
    ui.levelDiffInput.addEventListener("input", () => {
      if (!levelEditor) return;
      levelEditor.difficulty = Math.max(1, Math.min(20, Number(ui.levelDiffInput.value) || 10));
      updateLevelDiffLabel();
    });
  }
  if (ui.levelEditorCanvas) {
    ui.levelEditorCanvas.addEventListener("pointerdown", handleEditorPointerDown);
    ui.levelEditorCanvas.addEventListener("pointermove", handleEditorPointerMove);
    ui.levelEditorCanvas.addEventListener("pointerup", handleEditorPointerUp);
    ui.levelEditorCanvas.addEventListener("pointercancel", handleEditorPointerUp);
  }
  document.getElementById("cancelCreate").addEventListener("click", leaveCreate);
  document.getElementById("cancelCreateTop").addEventListener("click", leaveCreate);
  if (ui.createGenderMale) ui.createGenderMale.addEventListener("click", () => setCreateMarbleGender("male"));
  if (ui.createGenderFemale) ui.createGenderFemale.addEventListener("click", () => setCreateMarbleGender("female"));
  document.getElementById("playButton").addEventListener("click", beginRound);
  ui.minigames.addEventListener("click", openMinigamePicker);
  if (ui.roleplay) ui.roleplay.addEventListener("click", beginRoleplay);
  if (ui.roleplaySave) ui.roleplaySave.addEventListener("click", () => saveRoleplayMarbles(true));
  if (ui.marbleChat) ui.marbleChat.addEventListener("click", openMarbleChat);
  if (ui.marbleChatBack) ui.marbleChatBack.addEventListener("click", closeMarbleChat);
  if (ui.marbleChatAddGroup) ui.marbleChatAddGroup.addEventListener("click", addMarbleChatGroup);
  if (ui.marbleChatForm) ui.marbleChatForm.addEventListener("submit", sendMarbleChat);
  if (ui.addHouse) ui.addHouse.addEventListener("click", addRoleplayHouse);
  if (ui.leaveHouse) ui.leaveHouse.addEventListener("click", leaveHouse);
  document.querySelectorAll("[data-house-room]").forEach((button) => {
    button.addEventListener("click", () => setHouseRoom(button.getAttribute("data-house-room")));
  });
  if (ui.createFace) ui.createFace.addEventListener("click", () => openFaceEditor("face"));
  if (ui.createFaceMenu) ui.createFaceMenu.addEventListener("click", () => openFaceEditor("face"));
  if (ui.createFood) ui.createFood.addEventListener("click", openFoodEditor);
  if (ui.createFoodMenu) ui.createFoodMenu.addEventListener("click", openFoodEditor);
  if (ui.createFoodSlots) ui.createFoodSlots.addEventListener("click", openFoodEditor);
  if (ui.createFoodLikes) ui.createFoodLikes.addEventListener("click", openFoodEditor);
  if (ui.createDrink) ui.createDrink.addEventListener("click", () => openFaceEditor("drink"));
  if (ui.createDrinkMenu) ui.createDrinkMenu.addEventListener("click", () => openFaceEditor("drink"));
  if (ui.createDrinkSlots) ui.createDrinkSlots.addEventListener("click", () => openFaceEditor("drink"));
  if (ui.createDrinkLikes) ui.createDrinkLikes.addEventListener("click", () => openFaceEditor("drink"));
  if (ui.foodLikes) ui.foodLikes.addEventListener("click", openFoodLikes);
  if (ui.foodHates) ui.foodHates.addEventListener("click", openFoodHates);
  document.querySelectorAll("[data-feed-all]").forEach((button) => {
    button.addEventListener("click", () => {
      if (roleplay) ui.status.textContent = t("feedAllNeed");
    });
  });
  const backFromFoodLikes = document.getElementById("backFromFoodLikes");
  if (backFromFoodLikes) {
    backFromFoodLikes.addEventListener("click", () => {
      if (getSave()) {
        renderMenu();
        showScreen("menu");
        return;
      }
      renderSlots();
      showScreen("slots");
    });
  }
  if (ui.faceColor) {
    ui.faceColor.addEventListener("input", () => {
      if (editorIsEdible()) faceEditor.color = ui.faceColor.value;
    });
  }
  if (ui.saveFace) ui.saveFace.addEventListener("click", saveCustomFace);
  if (ui.cancelFaceEditor) ui.cancelFaceEditor.addEventListener("click", closeFaceEditor);
  if (ui.faceCanvas) {
    ui.faceCanvas.addEventListener("pointerdown", handleFacePointerDown);
    ui.faceCanvas.addEventListener("pointermove", handleFacePointerMove);
    ui.faceCanvas.addEventListener("pointerup", handleFacePointerUp);
    ui.faceCanvas.addEventListener("pointercancel", handleFacePointerUp);
  }
  if (ui.foodAddVariant) ui.foodAddVariant.addEventListener("click", addFoodVariant);
  if (ui.foodDelVariant) ui.foodDelVariant.addEventListener("click", deleteFoodVariant);
  if (ui.foodVariantName) {
    ui.foodVariantName.addEventListener("change", stashFoodVariantName);
    ui.foodVariantName.addEventListener("blur", stashFoodVariantName);
  }
  if (ui.copyFaceFrame) ui.copyFaceFrame.addEventListener("click", copyFaceFrame);
  if (ui.pasteFaceFrame) ui.pasteFaceFrame.addEventListener("click", pasteFaceFrame);
  if (ui.faceUndo) ui.faceUndo.addEventListener("click", undoFace);
  if (ui.faceRedo) ui.faceRedo.addEventListener("click", redoFace);
  if (ui.faceGrow) ui.faceGrow.addEventListener("click", () => applyFaceTransform("grow"));
  if (ui.faceShrink) ui.faceShrink.addEventListener("click", () => applyFaceTransform("shrink"));
  if (ui.faceRotate) ui.faceRotate.addEventListener("click", () => applyFaceTransform("rotate"));
  document.querySelectorAll("[data-face-tool]").forEach((button) => {
    button.addEventListener("click", () => setFaceTool(button.getAttribute("data-face-tool")));
  });
  window.addEventListener("keydown", (event) => {
    if (typingInField(event.target)) return;
    const key = event.key.toLowerCase();
    const combo = event.ctrlKey || event.metaKey;
    if (combo && key === "z") {
      if (faceEditor && (event.shiftKey ? redoFace() : undoFace())) event.preventDefault();
      return;
    }
    if (combo && key === "y") {
      if (faceEditor && redoFace()) event.preventDefault();
      return;
    }
    if (combo && key === "c") {
      if (faceEditor && copyFaceFrame()) {
        event.preventDefault();
        return;
      }
      if (roleplay && roleplay.selected && copySavedFace(roleplay.selected.face)) {
        event.preventDefault();
      }
      return;
    }
    if (combo && key === "v") {
      if (faceEditor && pasteFaceFrame()) {
        event.preventDefault();
        return;
      }
      if (roleplay && pasteSavedFace()) event.preventDefault();
      return;
    }
    if (!faceEditor || combo || event.repeat || editorIsDrink()) return;
    if (key === "a") {
      event.preventDefault();
      facePrevFrame();
    } else if (key === "d") {
      event.preventDefault();
      faceNextFrame();
    }
  });
  if (ui.splitPairBack) {
    ui.splitPairBack.addEventListener("click", () => {
      if (minigame && minigame.kind === "splitlove") splitLoveLookAt("arena");
    });
  }
  if (ui.teamSpikePrev) ui.teamSpikePrev.addEventListener("click", () => {
    if (minigame && minigame.kind === "teamspike") lookTeamSpike(minigame.extras.view - 1);
  });
  if (ui.teamSpikeNext) ui.teamSpikeNext.addEventListener("click", () => {
    if (minigame && minigame.kind === "teamspike") lookTeamSpike(minigame.extras.view + 1);
  });
  if (ui.splitPairRooms) {
    ui.splitPairRooms.addEventListener("click", (event) => {
      const button = event.target.closest("[data-split-room]");
      if (!button || !minigame || minigame.kind !== "splitlove") return;
      splitLoveLookAt("room", button.getAttribute("data-split-room"));
    });
  }
  document.getElementById("closeMinigamePicker").addEventListener("click", closeMinigamePicker);
  if (ui.foodFeastLimited) {
    ui.foodFeastLimited.addEventListener("click", () => {
      const id = pendingFoodFeastId || "foodfeast";
      startMinigame(id, { foodLimited: true });
    });
  }
  if (ui.foodFeastUnlimited) {
    ui.foodFeastUnlimited.addEventListener("click", () => {
      const id = pendingFoodFeastId || "foodfeast";
      startMinigame(id, { foodLimited: false });
    });
  }
  if (ui.foodFeastModeBack) {
    ui.foodFeastModeBack.addEventListener("click", () => {
      pendingFoodFeastId = "";
      setMinigamePickerStep("browse");
    });
  }
  document.getElementById("minigameSearch").addEventListener("input", (event) => {
    miniQuery = event.target.value;
    miniPage = 0;
    renderMinigamePicker();
  });
  document.getElementById("minigameRandom").addEventListener("click", playRandomMinigame);
  document.getElementById("minigamePrev").addEventListener("click", () => {
    miniPage -= 1;
    renderMinigamePicker();
  });
  document.getElementById("minigameNext").addEventListener("click", () => {
    miniPage += 1;
    renderMinigamePicker();
  });
  ui.rejoin.addEventListener("click", toggleRejoinPicker);
  if (ui.modalRejoinButton) ui.modalRejoinButton.addEventListener("click", toggleRejoinPicker);
  document.getElementById("backToMenu").addEventListener("click", exitRound);
  document.getElementById("messageButton").addEventListener("click", exitRound);
  document.getElementById("nextRoundButton").addEventListener("click", () => {
    ui.modal.hidden = true;
    beginRound();
  });
  ui.packMarbleForm.addEventListener("submit", addPackMarble);
  ui.form.addEventListener("submit", createMarble);
  ui.name.addEventListener("input", updatePreview);
  ui.color.addEventListener("input", updatePreview);
  canvas.addEventListener("pointerdown", (event) => {
    if (handleRoleplayDown(event)) return;
    handleCanvasClick(event);
  });
  canvas.addEventListener("pointermove", handleRoleplayMove);
  canvas.addEventListener("pointerup", handleRoleplayUp);
  canvas.addEventListener("pointercancel", handleRoleplayUp);
  canvas.addEventListener("wheel", handleRoleplayWheel, { passive: false });
  ui.recordButton.addEventListener("click", toggleRecording);
  ui.showTopMarbleButtons.forEach((button) => {
    button.addEventListener("click", toggleTopShowcase);
  });
  document.getElementById("btnMusicList").addEventListener("click", (event) => {
    event.stopPropagation();
    toggleSongPicker();
  });
  document.addEventListener("click", (event) => {
    if (ui.songPicker.hidden) return;
    if (ui.songPicker.contains(event.target) || event.target.closest("#btnMusicList")) return;
    ui.songPicker.hidden = true;
  });
  GameI18n.onChange(refreshLanguage);
  window.addEventListener("pagehide", () => {
    if (roleplay) saveRoleplayMarbles();
    persist();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (roleplay) saveRoleplayMarbles();
      persist();
    }
  });

  renderSlots();
  renderSongList();
  updateRecordButton();
  updatePreview();
  const sharedAudio = window.SharedMusic && typeof SharedMusic.getAudio === "function" ? SharedMusic.getAudio() : null;
  sharedAudio?.addEventListener("play", () => {
    if (!ui.songPicker.hidden) renderSongList();
  });
})();
