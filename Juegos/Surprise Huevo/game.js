(function () {
  "use strict";

  const STORAGE_KEY = "surprise-huevo-accounts-v1";
  const DAILY_BONUS = 10000;

  const EGGS = [
    {
      id: "gumi-yum-wildlife",
      name: "Gumi Yum WILDLIFE",
      short: "Gumi Yum",
      price: 4000,
      icon: "🦁",
      color: "#f59e0b",
      prizes: [
        { id: "leon-dorado", name: "León Dorado", emoji: "🦁", superRaro: true },
        { id: "tortuga", name: "Tortuga", emoji: "🐢" },
        { id: "gato", name: "Gato", emoji: "🐱" },
        { id: "tigre", name: "Tigre", emoji: "🐯" },
        { id: "jabali", name: "Jabalí", emoji: "🐗" },
        { id: "canguro", name: "Canguro", emoji: "🦘" },
        { id: "jirafa", name: "Jirafa", emoji: "🦒" },
        { id: "cocodrilo", name: "Cocodrilo", emoji: "🐊" },
        { id: "hipopotamo", name: "Hipopótamo", emoji: "🦛" },
        { id: "koala", name: "Koala", emoji: "🐨" },
        { id: "mono", name: "Mono", emoji: "🐵" },
        { id: "aguila", name: "Águila", emoji: "🦅" },
        { id: "toro", name: "Toro", emoji: "🐂" },
        { id: "elefante", name: "Elefante", emoji: "🐘" },
        { id: "leopardo", name: "Leopardo", emoji: "🐆" },
        { id: "venado", name: "Venado", emoji: "🦌" },
        { id: "mono-2", name: "Mono", emoji: "🐒" },
        { id: "bufalo", name: "Búfalo", emoji: "🐃" },
        { id: "lagarto", name: "Lagarto", emoji: "🦎" },
        { id: "suricata", name: "Suricata", emoji: "🐿️" },
        { id: "cerdo-hormiguero", name: "Cerdo Hormiguero", emoji: "🦡" },
        { id: "topo", name: "Topo", emoji: "🐀" },
        { id: "hiena", name: "Hiena", emoji: "🐺" },
        { id: "conejo", name: "Conejo", emoji: "🐰" },
        { id: "dik-dik", name: "Dik-dik", emoji: "🦌" },
        { id: "cebra", name: "Cebra", emoji: "🦓" },
        { id: "ornitorrinco", name: "Ornitorrinco", emoji: "🦆" }
      ]
    },
    {
      id: "gemini-mitica",
      name: "Huevo Gemini MÍTICA Y LEYENDAS",
      short: "Gemini",
      price: 5000,
      icon: "🔥",
      color: "#a855f7",
      prizes: [
        { id: "fenix-dorado", name: "Fénix Dorado", emoji: "🐦‍🔥", superRaro: true },
        { id: "dragon-fuego", name: "Dragón de Fuego", emoji: "🐉" },
        { id: "unicornio", name: "Unicornio Celestial", emoji: "🦄" },
        { id: "kraken", name: "Kraken", emoji: "🦑" },
        { id: "grifo", name: "Grifo", emoji: "🦅" },
        { id: "pegaso", name: "Pegaso", emoji: "🐴" },
        { id: "minotauro", name: "Minotauro", emoji: "🐂" },
        { id: "hidra", name: "Hidra", emoji: "🐍" },
        { id: "basilisco", name: "Basilisco", emoji: "🦎" },
        { id: "quimera", name: "Quimera", emoji: "🦁" },
        { id: "gargola", name: "Gárgola", emoji: "🗿" },
        { id: "yeti", name: "Yeti", emoji: "🦍" },
        { id: "hombre-lobo", name: "Hombre Lobo", emoji: "🐺" },
        { id: "sirena", name: "Sirena", emoji: "🧜‍♀️" },
        { id: "ciclope", name: "Cíclope", emoji: "👁️" },
        { id: "goblin", name: "Goblin", emoji: "👺" },
        { id: "golem", name: "Golem", emoji: "🪨" },
        { id: "fenix", name: "Fénix", emoji: "🔥" },
        { id: "kitsune", name: "Kitsune", emoji: "🦊" },
        { id: "centauro", name: "Centauro", emoji: "🏹" },
        { id: "tsx-900", name: "T_S_X-900", emoji: "🤖", desc: "Robot guardián antiguo de piedra rúnica y circuitos luminosos" },
        { id: "esfinge", name: "Esfinge", emoji: "🦁" },
        { id: "banshee", name: "Banshee", emoji: "👻" },
        { id: "slime-abisal", name: "Slime Abisal", emoji: "🫧", desc: "Mini monstruo gelatinoso y translúcido con ojos flotantes" },
        { id: "wyvern", name: "Wyvern", emoji: "🐲" }
      ]
    },
    {
      id: "jose-yummy-pelotitas",
      name: "Jose Yummy PELOTITAS",
      short: "Pelotitas",
      price: 4000,
      icon: "🔴",
      color: "#ef4444",
      prizes: [
        { id: "reddo", name: "Reddo", emoji: "🔴", desc: "Pelotita Roja" },
        { id: "pinki", name: "Pinki", emoji: "🩷", desc: "Pelotita Rosa", superRaro: true },
        { id: "blacku", name: "Blacku", emoji: "⚫", desc: "Pelota Negra" },
        { id: "yeller", name: "Yeller", emoji: "🟡", desc: "Pelota Amarilla" },
        { id: "diego", name: "Diego", emoji: "🟢", desc: "Pelota Verde" },
        { id: "cf", name: "ÇF", emoji: "🟣", desc: "Pelota Violeta" },
        { id: "imbifer", name: "Imbifer", emoji: "🟠", desc: "Pelota Color Piel" },
        { id: "bifer", name: "Bifer", emoji: "🔴", desc: "Pelota Roja" },
        { id: "circu", name: "Circu", emoji: "🟣", desc: "Pelota Violeta" },
        { id: "bifer3000", name: "Bifer3000", emoji: "⚪", desc: "Pelota Gris" },
        { id: "grayne", name: "Grayne", emoji: "⚪", desc: "Pelota Gris" },
        { id: "john", name: "John", emoji: "🟠", desc: "Pelota Naranja" },
        { id: "jack", name: "Jack", emoji: "🟠", desc: "Pelota Naranja" },
        { id: "salvef", name: "Salvef", emoji: "🟥", desc: "Pelota Naranja Rojizo" },
        { id: "kint", name: "Kint", emoji: "⚪", desc: "Pelota Blanco" },
        { id: "grassy", name: "Grassy", emoji: "🟢", desc: "Pelota Verde" },
        { id: "snowball", name: "Snowball", emoji: "⚪", desc: "Pelota Blanco" },
        { id: "breepo", name: "Breepo", emoji: "🟤", desc: "Pelota Marron" },
        { id: "sam", name: "Sam", emoji: "🔵", desc: "Pelota Azul" },
        { id: "orangey", name: "Orangey", emoji: "🟠", desc: "Pelota Naranja" },
        { id: "pinvilet", name: "PinVilet", emoji: "🟣", desc: "Pelota Violeta" },
        { id: "pikuniku", name: "PIKUNIKU", emoji: "🟨", desc: "Pelota Amarilla tirando a Blanco" },
        { id: "masad", name: "Masad", emoji: "🟥", desc: "Pelota Rojo Oscuro" },
        { id: "reddo-brick", name: "Reddo Brick", emoji: "🔴", desc: "Pelota Rojo" },
        { id: "woodster", name: "Woodster", emoji: "🟤", desc: "Pelota Marron" }
      ]
    },
    {
      id: "jose-yummy-animales",
      name: "Jose Yummy ANIMALES",
      short: "JY Animales",
      price: 3000,
      icon: "🐯",
      color: "#22c55e",
      prizes: [
        { id: "tigre", name: "Tigre", emoji: "🐯", superRaro: true },
        { id: "cebra", name: "Cebra", emoji: "🦓" },
        { id: "jirafa", name: "Jirafa", emoji: "🦒" },
        { id: "dinosaurio", name: "Dinosaurio", emoji: "🦕" },
        { id: "pez", name: "Pez", emoji: "🐟" },
        { id: "delfin", name: "Delfín", emoji: "🐬" },
        { id: "gato", name: "Gato", emoji: "🐱" },
        { id: "foca", name: "Foca", emoji: "🦭" },
        { id: "burro", name: "Burro", emoji: "🫏" },
        { id: "cerdo", name: "Cerdo", emoji: "🐷" },
        { id: "buho", name: "Buho", emoji: "🦉" },
        { id: "gusano", name: "Gusano", emoji: "🪱" },
        { id: "mariposa", name: "Mariposa", emoji: "🦋" },
        { id: "hormiga", name: "Hormiga", emoji: "🐜" },
        { id: "arana", name: "Araña", emoji: "🕷️" },
        { id: "rana", name: "Rana", emoji: "🐸" },
        { id: "suricata", name: "Suricata", emoji: "🐿️" },
        { id: "canguro", name: "Canguro", emoji: "🦘" },
        { id: "conejo", name: "Conejo", emoji: "🐰" },
        { id: "hipopotamo", name: "Hipopótamo", emoji: "🦛" },
        { id: "golem", name: "Gólem", emoji: "🪨" },
        { id: "22", name: "22", emoji: "❓" },
        { id: "23", name: "23", emoji: "❓" },
        { id: "24", name: "24", emoji: "❓" },
        { id: "25", name: "25", emoji: "❓" },
        { id: "26", name: "26", emoji: "❓" },
        { id: "27", name: "27", emoji: "❓" }
      ]
    },
    {
      id: "gemijose-huevito",
      name: "GemiJose Huevito",
      short: "GemiJose",
      price: 2750,
      icon: "✨",
      color: "#06b6d4",
      prizes: [
        { id: "glitchu", name: "Glitchu", emoji: "💠", desc: "Pelotita mezcla de azul eléctrico y rosa neón que parpadea" },
        { id: "dulcetto", name: "DulcettoVainilla", emoji: "🥟", desc: "Forma de dumpling, amarillo claro", superRaro: true },
        { id: "nebulita", name: "Nebulita", emoji: "🌌", desc: "Azul medianoche con estrellas y polvo estelar" },
        { id: "tigresafari", name: "TigreSafari", emoji: "🟠", desc: "Naranja con rayas negras" },
        { id: "ciber-rayo", name: "Ciber-Rayo", emoji: "⚡", desc: "Amarillo metálico con circuitos azules" },
        { id: "dios-marbley", name: "Dios Marbley", emoji: "⚪", desc: "Blanca con rayas grises" },
        { id: "magma-core", name: "Magma-Core", emoji: "🌋", desc: "Obsidiana con grietas de lava" },
        { id: "stereo", name: "Stereo", emoji: "🔵", desc: "Azul que parpadea verde" },
        { id: "eco-burbuja", name: "Eco-Burbuja", emoji: "🫧", desc: "Translúcida aguamarina con burbuja en el núcleo" },
        { id: "chunno", name: "Chunno", emoji: "🟡", desc: "Amarilla con letras ⋑ϖ en el centro" },
        { id: "solaris-x", name: "Solaris-X", emoji: "☀️", desc: "Dorada con llamaradas solares" },
        { id: "josu-hype", name: "Josu-Hype", emoji: "💚", desc: "Verde con cara de bebé y número 2026" },
        { id: "neon-glow", name: "Neon-Glow", emoji: "💚", desc: "Verde lima que brilla en la oscuridad" },
        { id: "numcatorce", name: "Numcatorce", emoji: "🍴", desc: "Verde oscura con un tenedor en el núcleo" },
        { id: "frost-byte", name: "Frost-Byte", emoji: "❄️", desc: "Azul hielo con escarcha y vapor frío" },
        { id: "zubba", name: "Zubba", emoji: "🟢", desc: "Verde que rebota mucho" },
        { id: "aero-drift", name: "Aero-Drift", emoji: "💨", desc: "Celeste con corrientes de aire" },
        { id: "tigre", name: "Tigre", emoji: "🐯" },
        { id: "quantum-dot", name: "Quantum-Dot", emoji: "🟣", desc: "Violeta que cambia de color con puntos cuánticos" },
        { id: "gordit", name: "Gordit", emoji: "🟠", desc: "Pelotita naranja más grande que las demás" }
      ]
    },
    {
      id: "josu-animales",
      name: "Josu Animales ANIMALES",
      short: "Josu Animales",
      price: 4000,
      icon: "🦒",
      color: "#84cc16",
      prizes: [
        { id: "venado", name: "Venado", emoji: "🦌" },
        { id: "cebra", name: "Cebra", emoji: "🦓" },
        { id: "leopardo", name: "Leopardo", emoji: "🐆" },
        { id: "jirafa", name: "Jirafa", emoji: "🦒" },
        { id: "hiena", name: "Hiena", emoji: "🐺", superRaro: true },
        { id: "burro", name: "Burro", emoji: "🫏" },
        { id: "gorila", name: "Gorila", emoji: "🦍" },
        { id: "caballo", name: "Caballo", emoji: "🐴" },
        { id: "rinoceronte", name: "Rinoceronte", emoji: "🦏" },
        { id: "tigre", name: "Tigre", emoji: "🐯" },
        { id: "leon", name: "León", emoji: "🦁" },
        { id: "pajaro", name: "Pájaro", emoji: "🐦" },
        { id: "vaca", name: "Vaca", emoji: "🐮" },
        { id: "bufalo", name: "Búfalo", emoji: "🐃" },
        { id: "lobo", name: "Lobo", emoji: "🐺" },
        { id: "serpiente", name: "Serpiente", emoji: "🐍" },
        { id: "mono", name: "Mono", emoji: "🐵" },
        { id: "buho", name: "Búho", emoji: "🦉" },
        { id: "gallo", name: "Gallo", emoji: "🐓" },
        { id: "tucan", name: "Tucán", emoji: "🦜" },
        { id: "leon-2", name: "León", emoji: "🦁" },
        { id: "oveja", name: "Oveja", emoji: "🐑" },
        { id: "dik-dik", name: "Dik-dik", emoji: "🦌" },
        { id: "burro-2", name: "Burro", emoji: "🫏" },
        { id: "loro", name: "Loro", emoji: "🦜" }
      ]
    }
  ];

  const eggById = Object.fromEntries(EGGS.map((egg) => [egg.id, egg]));

  let db = loadDb();
  let currentZone = "shop";
  let busy = false;
  let pendingLoginId = "";

  const zoneNav = document.getElementById("zoneNav");
  const shopGrid = document.getElementById("shopGrid");
  const eggZones = document.getElementById("eggZones");
  const moneyLabel = document.getElementById("moneyLabel");
  const dailyLabel = document.getElementById("dailyLabel");
  const userLabel = document.getElementById("userLabel");
  const accountListWrap = document.getElementById("accountListWrap");
  const accountList = document.getElementById("accountList");
  const loginForm = document.getElementById("loginForm");
  const createForm = document.getElementById("createForm");
  const loginError = document.getElementById("loginError");
  const createError = document.getElementById("createError");

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function blankProfile() {
    return {
      money: 0,
      inventory: {},
      opened: {},
      recent: []
    };
  }

  function normalizeAccount(raw, fallbackName) {
    const base = blankProfile();
    if (!raw || typeof raw !== "object") {
      return {
        name: fallbackName || "Jugador",
        password: "",
        ...base
      };
    }
    return {
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : (fallbackName || "Jugador"),
      password: typeof raw.password === "string" ? raw.password : "",
      money: Number(raw.money) || 0,
      inventory: raw.inventory && typeof raw.inventory === "object" ? raw.inventory : {},
      opened: raw.opened && typeof raw.opened === "object" ? raw.opened : {},
      recent: Array.isArray(raw.recent) ? raw.recent.slice(0, 40) : []
    };
  }

  function loadDb() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") {
        return { currentUser: null, lastDaily: "", accounts: {} };
      }
      const accounts = {};
      if (parsed.accounts && typeof parsed.accounts === "object") {
        Object.keys(parsed.accounts).forEach((id) => {
          accounts[id] = normalizeAccount(parsed.accounts[id], id);
        });
      }
      const currentUser = typeof parsed.currentUser === "string" && accounts[parsed.currentUser]
        ? parsed.currentUser
        : null;
      return {
        currentUser,
        lastDaily: typeof parsed.lastDaily === "string" ? parsed.lastDaily : "",
        accounts
      };
    } catch (_err) {
      return { currentUser: null, lastDaily: "", accounts: {} };
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (_err) {
      /* ignore */
    }
  }

  function accountIds() {
    return Object.keys(db.accounts).sort((a, b) =>
      db.accounts[a].name.localeCompare(db.accounts[b].name, "es")
    );
  }

  function currentAccount() {
    if (!db.currentUser || !db.accounts[db.currentUser]) return null;
    return db.accounts[db.currentUser];
  }

  function slugifyName(name) {
    return name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "jugador";
  }

  function uniqueAccountId(name) {
    const base = slugifyName(name);
    let id = base;
    let n = 2;
    while (db.accounts[id]) {
      id = base + "-" + n;
      n += 1;
    }
    return id;
  }

  function applyDailyBonus() {
    const today = todayKey();
    const ids = accountIds();
    if (!ids.length) {
      dailyLabel.textContent = "Sin cuentas";
      return false;
    }
    if (db.lastDaily === today) {
      dailyLabel.textContent = "Bonus diario ya cobrado en todas las cuentas";
      return false;
    }
    ids.forEach((id) => {
      db.accounts[id].money += DAILY_BONUS;
    });
    db.lastDaily = today;
    persist();
    dailyLabel.textContent = "+$10.000 hoy en " + ids.length + (ids.length === 1 ? " cuenta" : " cuentas");
    return true;
  }

  function moneyText(n) {
    return "$" + Number(n).toLocaleString("es-AR");
  }

  function ownedCount(eggId) {
    const acc = currentAccount();
    if (!acc) return 0;
    return Number(acc.inventory[eggId]) || 0;
  }

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function setZone(zoneId) {
    currentZone = zoneId;
    document.querySelectorAll(".zone-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.zone === zoneId);
    });
    document.querySelectorAll(".zone-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.zone === zoneId);
    });
  }

  function pickPrize(egg) {
    const weights = egg.prizes.map((prize) => (prize.superRaro ? 1 : 8));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < egg.prizes.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return egg.prizes[i];
    }
    return egg.prizes[0];
  }

  function renderMoney() {
    const acc = currentAccount();
    moneyLabel.textContent = moneyText(acc ? acc.money : 0);
    userLabel.textContent = acc ? acc.name : "Sin cuenta";
  }

  function hideLoginForm() {
    pendingLoginId = "";
    loginForm.hidden = true;
    loginError.hidden = true;
    document.getElementById("loginPassword").value = "";
    createForm.hidden = false;
  }

  function showLoginFor(accountId) {
    const acc = db.accounts[accountId];
    if (!acc) return;
    pendingLoginId = accountId;
    createForm.hidden = true;
    loginForm.hidden = false;
    loginError.hidden = true;
    document.getElementById("loginTitle").textContent = "Entrar";
    document.getElementById("loginUserHint").textContent = "Cuenta: " + acc.name;
    document.getElementById("loginPassword").value = "";
    document.getElementById("loginPassword").focus();
  }

  function deleteAccount(accountId) {
    const acc = db.accounts[accountId];
    if (!acc) return;
    const ok = window.confirm(
      '¿Borrar la cuenta "' + acc.name + '"?\nSe pierde el dinero, huevos y colección. No se puede deshacer.'
    );
    if (!ok) return;
    delete db.accounts[accountId];
    if (db.currentUser === accountId) db.currentUser = null;
    if (pendingLoginId === accountId) hideLoginForm();
    persist();
    renderAccountScreen();
  }

  function renderAccountScreen() {
    hideLoginForm();
    createError.hidden = true;
    document.getElementById("createName").value = "";
    document.getElementById("createPassword").value = "";
    const ids = accountIds();
    accountListWrap.hidden = ids.length === 0;
    accountList.innerHTML = "";
    ids.forEach((id) => {
      const acc = db.accounts[id];
      const row = document.createElement("div");
      row.className = "account-row";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "account-item";
      btn.innerHTML =
        '<span class="account-item-name">' + acc.name + "</span>" +
        '<span class="account-item-money">' + moneyText(acc.money) + "</span>";
      btn.addEventListener("click", () => showLoginFor(id));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn danger account-delete";
      del.title = "Borrar cuenta";
      del.setAttribute("aria-label", "Borrar cuenta " + acc.name);
      del.textContent = "Borrar";
      del.addEventListener("click", () => deleteAccount(id));

      row.appendChild(btn);
      row.appendChild(del);
      accountList.appendChild(row);
    });
  }

  function renderNav() {
    zoneNav.innerHTML = "";
    const shopTab = document.createElement("button");
    shopTab.type = "button";
    shopTab.className = "zone-tab" + (currentZone === "shop" ? " active" : "");
    shopTab.dataset.zone = "shop";
    shopTab.textContent = "🛒 Tienda";
    shopTab.addEventListener("click", () => setZone("shop"));
    zoneNav.appendChild(shopTab);

    EGGS.forEach((egg) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "zone-tab" + (currentZone === egg.id ? " active" : "");
      tab.dataset.zone = egg.id;
      const count = ownedCount(egg.id);
      tab.innerHTML = egg.icon + " " + egg.short + (count ? ' <span class="tab-count">' + count + "</span>" : "");
      tab.addEventListener("click", () => setZone(egg.id));
      zoneNav.appendChild(tab);
    });
  }

  function renderShop() {
    shopGrid.innerHTML = "";
    const acc = currentAccount();
    const money = acc ? acc.money : 0;
    EGGS.forEach((egg) => {
      const card = document.createElement("article");
      card.className = "shop-card";
      card.style.setProperty("--egg-accent", egg.color);
      const canBuy = money >= egg.price;
      card.innerHTML =
        '<div class="shop-icon">' + egg.icon + "</div>" +
        "<h4>" + egg.name + "</h4>" +
        '<p class="shop-meta">' + egg.prizes.length + " figuras · " + moneyText(egg.price) + "</p>" +
        '<p class="shop-owned">En inventario: <strong>' + ownedCount(egg.id) + "</strong></p>" +
        '<button type="button" class="btn primary buy-btn"' + (canBuy ? "" : " disabled") + ">Comprar</button>";
      const btn = card.querySelector(".buy-btn");
      btn.addEventListener("click", () => buyEgg(egg.id));
      shopGrid.appendChild(card);
    });
  }

  function openedList(eggId) {
    const acc = currentAccount();
    const bag = acc && acc.opened[eggId];
    if (!bag || typeof bag !== "object") return [];
    return Object.keys(bag).map((prizeId) => ({
      prizeId,
      count: bag[prizeId],
      prize: eggById[eggId].prizes.find((p) => p.id === prizeId)
    })).filter((row) => row.prize && row.count > 0);
  }

  function renderEggZones() {
    eggZones.innerHTML = "";
    EGGS.forEach((egg) => {
      const panel = document.createElement("div");
      panel.className = "zone-panel" + (currentZone === egg.id ? " active" : "");
      panel.dataset.zone = egg.id;
      panel.style.setProperty("--egg-accent", egg.color);

      const count = ownedCount(egg.id);
      const collection = openedList(egg.id);

      panel.innerHTML =
        '<div class="zone-head">' +
          "<h3>" + egg.icon + " " + egg.name + "</h3>" +
          '<p class="hint">Huevos sin abrir: <strong id="count-' + egg.id + '">' + count + "</strong> · Precio en tienda: " + moneyText(egg.price) + "</p>" +
        "</div>" +
        '<div class="stage" id="stage-' + egg.id + '">' +
          '<p class="hint crack-hint" id="hint-' + egg.id + '">' +
            (count > 0 ? "Tocá el huevo para abrirlo." : "Comprá este huevo en la tienda para abrirlo acá.") +
          "</p>" +
          '<button type="button" class="egg" id="egg-' + egg.id + '" aria-label="Abrir huevo"' + (count > 0 ? "" : " disabled") + ">" +
            '<span class="egg-shell">🥚</span>' +
            '<span class="egg-crack" hidden>✨</span>' +
          "</button>" +
          '<div class="surprise" id="surprise-' + egg.id + '" hidden>' +
            '<p class="surprise-emoji"></p>' +
            "<strong class=\"surprise-name\"></strong>" +
            '<p class="surprise-desc"></p>' +
            '<p class="rarity"></p>' +
          "</div>" +
        "</div>" +
        '<div class="card-soft">' +
          "<h4>Colección de esta zona</h4>" +
          '<div class="history-list" id="col-' + egg.id + '"></div>' +
          '<p class="hint empty-col"' + (collection.length ? " hidden" : "") + ">Todavía no abriste figuras de este huevo.</p>" +
        "</div>";

      eggZones.appendChild(panel);

      const col = panel.querySelector("#col-" + egg.id);
      collection.forEach((row) => {
        const chip = document.createElement("span");
        chip.className = "chip" + (row.prize.superRaro ? " super" : "");
        chip.title = row.prize.desc || row.prize.name;
        chip.textContent = row.prize.emoji + " " + row.prize.name + (row.count > 1 ? " ×" + row.count : "");
        col.appendChild(chip);
      });

      const eggBtn = panel.querySelector("#egg-" + egg.id);
      eggBtn.addEventListener("click", () => crackEgg(egg.id));
    });
  }

  function buyEgg(eggId) {
    const egg = eggById[eggId];
    const acc = currentAccount();
    if (!egg || !acc) return;
    if (acc.money < egg.price) return;
    acc.money -= egg.price;
    acc.inventory[eggId] = ownedCount(eggId) + 1;
    persist();
    renderMoney();
    renderNav();
    renderShop();
    const countEl = document.getElementById("count-" + eggId);
    const hint = document.getElementById("hint-" + eggId);
    const eggBtn = document.getElementById("egg-" + eggId);
    if (countEl) countEl.textContent = String(ownedCount(eggId));
    if (hint) hint.textContent = "Tocá el huevo para abrirlo.";
    if (eggBtn) eggBtn.disabled = false;
  }

  function crackEgg(eggId) {
    if (busy) return;
    const egg = eggById[eggId];
    const acc = currentAccount();
    if (!egg || !acc || ownedCount(eggId) < 1) return;

    busy = true;
    acc.inventory[eggId] = ownedCount(eggId) - 1;
    persist();

    const eggBtn = document.getElementById("egg-" + eggId);
    const shell = eggBtn.querySelector(".egg-shell");
    const crack = eggBtn.querySelector(".egg-crack");
    const surprise = document.getElementById("surprise-" + eggId);
    const hint = document.getElementById("hint-" + eggId);
    const countEl = document.getElementById("count-" + eggId);

    eggBtn.disabled = true;
    surprise.hidden = true;
    shell.hidden = false;
    crack.hidden = true;
    eggBtn.classList.remove("burst");
    eggBtn.classList.add("shake");
    hint.textContent = "¡Craaack!";
    if (countEl) countEl.textContent = String(ownedCount(eggId));

    window.setTimeout(() => {
      eggBtn.classList.remove("shake");
      eggBtn.classList.add("burst");
      shell.hidden = true;
      crack.hidden = false;

      const prize = pickPrize(egg);
      if (!acc.opened[eggId]) acc.opened[eggId] = {};
      acc.opened[eggId][prize.id] = (Number(acc.opened[eggId][prize.id]) || 0) + 1;
      acc.recent.unshift({
        eggId,
        prizeId: prize.id,
        name: prize.name,
        emoji: prize.emoji,
        at: Date.now()
      });
      acc.recent = acc.recent.slice(0, 40);
      persist();

      window.setTimeout(() => {
        crack.hidden = true;
        surprise.hidden = false;
        surprise.querySelector(".surprise-emoji").textContent = prize.emoji;
        surprise.querySelector(".surprise-name").textContent = prize.name;
        surprise.querySelector(".surprise-desc").textContent = prize.desc || "";
        const rarity = surprise.querySelector(".rarity");
        rarity.textContent = prize.superRaro ? "Super Raro" : "Común";
        rarity.className = "rarity " + (prize.superRaro ? "super" : "comun");
        hint.textContent = ownedCount(eggId) > 0
          ? "¡Figura encontrada! Tocá otra vez para abrir otro."
          : "¡Figura encontrada! No te quedan huevos de esta zona.";
        eggBtn.classList.remove("burst");
        shell.hidden = false;
        eggBtn.disabled = ownedCount(eggId) < 1;
        busy = false;
        renderNav();
        renderShop();
        refreshCollection(eggId);
      }, 280);
    }, 450);
  }

  function refreshCollection(eggId) {
    const col = document.getElementById("col-" + eggId);
    if (!col) return;
    const panel = col.closest(".zone-panel");
    const empty = panel.querySelector(".empty-col");
    const collection = openedList(eggId);
    col.innerHTML = "";
    if (empty) empty.hidden = collection.length > 0;
    collection.forEach((row) => {
      const chip = document.createElement("span");
      chip.className = "chip" + (row.prize.superRaro ? " super" : "");
      chip.title = row.prize.desc || row.prize.name;
      chip.textContent = row.prize.emoji + " " + row.prize.name + (row.count > 1 ? " ×" + row.count : "");
      col.appendChild(chip);
    });
  }

  function enterHub() {
    if (!currentAccount()) {
      openAccountScreen();
      return;
    }
    applyDailyBonus();
    renderMoney();
    renderNav();
    renderShop();
    renderEggZones();
    setZone(currentZone === "shop" ? "shop" : currentZone);
    show("screenHub");
  }

  function openAccountScreen() {
    renderAccountScreen();
    show("screenAccount");
  }

  function loginAs(accountId) {
    if (!db.accounts[accountId]) return;
    db.currentUser = accountId;
    persist();
    hideLoginForm();
    enterHub();
  }

  function logout() {
    db.currentUser = null;
    persist();
    busy = false;
    openAccountScreen();
  }

  document.getElementById("btnPlay").addEventListener("click", () => {
    if (currentAccount()) enterHub();
    else openAccountScreen();
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnBackFromAccount").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnLogout").addEventListener("click", logout);
  document.getElementById("btnCancelLogin").addEventListener("click", hideLoginForm);

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const acc = db.accounts[pendingLoginId];
    const password = document.getElementById("loginPassword").value;
    if (!acc) {
      loginError.hidden = false;
      loginError.textContent = "Esa cuenta ya no existe.";
      return;
    }
    if (password !== acc.password) {
      loginError.hidden = false;
      loginError.textContent = "Contraseña incorrecta.";
      return;
    }
    loginError.hidden = true;
    loginAs(pendingLoginId);
  });

  createForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("createName").value.trim();
    const password = document.getElementById("createPassword").value;
    createError.hidden = true;
    if (name.length < 2) {
      createError.hidden = false;
      createError.textContent = "El nombre necesita al menos 2 letras.";
      return;
    }
    if (password.length < 1) {
      createError.hidden = false;
      createError.textContent = "Poné una contraseña.";
      return;
    }
    const duplicate = accountIds().some((id) => db.accounts[id].name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      createError.hidden = false;
      createError.textContent = "Ya hay una cuenta con ese nombre.";
      return;
    }

    applyDailyBonus();
    const id = uniqueAccountId(name);
    db.accounts[id] = {
      name,
      password,
      ...blankProfile(),
      money: DAILY_BONUS
    };
    db.currentUser = id;
    if (db.lastDaily !== todayKey()) db.lastDaily = todayKey();
    persist();
    enterHub();
  });
})();
