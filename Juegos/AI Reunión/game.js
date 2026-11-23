(function () {
  "use strict";

  const CUSTOM_KEY = "ai-reunion-custom-ais-v1";
  const PERM_KEY = "ai-reunion-permanent-memory-v1";
  const SESSION_KEY = "ai-reunion-session-v1";

  const BASE_AIS = [
    {
      id: "chatgpt",
      name: "ChatGPT",
      color: "#22c55e",
      personality: "Clara, ordenada y útil. Explica paso a paso y resume al final."
    },
    {
      id: "grok",
      name: "Grok",
      color: "#f8fafc",
      personality: "Ingeniosa, directa y con humor seco. Va al grano sin perder picante."
    },
    {
      id: "gemini",
      name: "Gemini",
      color: "#38bdf8",
      personality: "Analítica y amplia. Conecta ideas y ofrece varias perspectivas."
    },
    {
      id: "claude",
      name: "Claude",
      color: "#fb923c",
      personality: "Cuidadosa, reflexiva y amable. Prioriza matices y seguridad."
    },
    {
      id: "copilot",
      name: "Copilot",
      color: "#a3e635",
      personality: "Práctica y orientada a acción. Propone pasos concretos y ejemplos."
    }
  ];

  /** @type {Set<string>} */
  let selected = new Set();
  /** @type {Array<{role:string,name?:string,aiId?:string,text:string}>} */
  let chatMemory = [];
  let busy = false;

  const aiGrid = document.getElementById("aiGrid");
  const btnStartChat = document.getElementById("btnStartChat");
  const selectError = document.getElementById("selectError");
  const customHelper = document.getElementById("customHelper");
  const createError = document.getElementById("createError");
  const permanentInput = document.getElementById("permanentInput");
  const permanentStatus = document.getElementById("permanentStatus");
  const chatLog = document.getElementById("chatLog");
  const chatHint = document.getElementById("chatHint");
  const chatInput = document.getElementById("chatInput");
  const btnSend = document.getElementById("btnSend");

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function uid() {
    return "ai-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
  }

  function loadCustom() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => ({
          id: String(item.id || uid()),
          name: String(item.name || "").trim(),
          personality: String(item.personality || "").trim(),
          helperId: String(item.helperId || "chatgpt"),
          custom: true
        }))
        .filter((item) => item.name && item.personality);
    } catch (_err) {
      return [];
    }
  }

  function saveCustom(list) {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    } catch (_err) {
      /* ignore */
    }
  }

  function loadPermanent() {
    try {
      return String(localStorage.getItem(PERM_KEY) || "");
    } catch (_err) {
      return "";
    }
  }

  function savePermanent(text) {
    try {
      localStorage.setItem(PERM_KEY, String(text || ""));
    } catch (_err) {
      /* ignore */
    }
  }

  function clearSession() {
    chatMemory = [];
    selected = new Set();
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_err) {
      /* ignore */
    }
  }

  function saveSession() {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          selected: Array.from(selected),
          chatMemory: chatMemory
        })
      );
    } catch (_err) {
      /* ignore */
    }
  }

  function loadSession() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return;
      selected = new Set(Array.isArray(parsed.selected) ? parsed.selected.map(String) : []);
      chatMemory = Array.isArray(parsed.chatMemory) ? parsed.chatMemory : [];
    } catch (_err) {
      /* ignore */
    }
  }

  function allAis() {
    return BASE_AIS.concat(loadCustom());
  }

  function getAi(id) {
    return allAis().find((ai) => ai.id === id) || null;
  }

  function helperOf(ai) {
    if (!ai) return BASE_AIS[0];
    if (!ai.custom) return ai;
    return BASE_AIS.find((base) => base.id === ai.helperId) || BASE_AIS[0];
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

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clip(text, max) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max - 1).trim() + "…";
  }

  function recentUserMessages(limit) {
    return chatMemory
      .filter((msg) => msg.role === "user")
      .slice(-limit)
      .map((msg) => msg.text);
  }

  function buildReply(ai, userText) {
    const helper = helperOf(ai);
    const permanent = loadPermanent().trim();
    const history = recentUserMessages(4);
    const topic = clip(userText, 140);
    const memBit = permanent
      ? " Teniendo en cuenta la memoria permanente: \"" + clip(permanent, 160) + "\"."
      : "";
    const histBit = history.length > 1
      ? " Mirando lo que ya dijiste en esta pestaña (" + history.slice(0, -1).map((h) => "\"" + clip(h, 40) + "\"").join("; ") + ")."
      : "";

    const openings = {
      chatgpt: [
        "Voy a ordenarlo claro:",
        "Buena pregunta. Te lo dejo práctico:",
        "Resumo y después detallo:"
      ],
      grok: [
        "Ok, sin vueltas:",
        "Ja. Vamos al grano:",
        "Me gusta el planteo. Escuchá:"
      ],
      gemini: [
        "Lo miro desde varios ángulos:",
        "Hay capas interesantes acá:",
        "Conecto ideas rápido:"
      ],
      claude: [
        "Con cuidado y con contexto:",
        "Te respondo con matices:",
        "Vamos con calma y precisión:"
      ],
      copilot: [
        "Plan de acción:",
        "Te armo pasos concretos:",
        "Aplicado a lo que pediste:"
      ]
    };

    const middles = [
      "Sobre \"" + topic + "\", yo (como " + ai.name + ") aportaría foco en lo útil y lo verificable.",
      "Respecto a \"" + topic + "\", mi lectura es: partí de lo esencial, después refiná.",
      "Con \"" + topic + "\" conviene separar hechos, supuestos y siguiente paso."
    ];

    const customBit = ai.custom
      ? " Personalidad activa: " + clip(ai.personality, 120) + ". Respondo con ayuda de " + helper.name + "."
      : " Estilo " + helper.name + ": " + clip(helper.personality, 100);

    const closings = {
      chatgpt: ["Si querés, lo bajamos a una checklist.", "¿Seguimos con un ejemplo?"],
      grok: ["Listo. Tirame el siguiente challenge.", "Sin drama: afinamos en el próximo mensaje."],
      gemini: ["Puedo expandir cualquier rama de esto.", "Si querés, comparo alternativas."],
      claude: ["Decime si preferís más detalle o más breve.", "Estoy para ajustar el tono."],
      copilot: ["Próximo paso sugerido: probarlo y volver con el resultado.", "Si querés, te armo el borrador completo."]
    };

    const helperId = helper.id;
    return (
      pick(openings[helperId] || openings.chatgpt) +
      " " +
      pick(middles) +
      customBit +
      "." +
      memBit +
      histBit +
      " " +
      pick(closings[helperId] || closings.chatgpt)
    );
  }

  function renderSelect() {
    const list = allAis();
    aiGrid.innerHTML = "";
    list.forEach((ai) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-chip" + (selected.has(ai.id) ? " selected" : "");
      btn.innerHTML =
        "<strong style=\"color:" + (ai.color || "var(--accent)") + "\">" + ai.name + "</strong>" +
        "<span>" +
        (ai.custom
          ? "Custom · ayuda: " + (helperOf(ai).name)
          : clip(ai.personality, 70)) +
        "</span>";
      btn.addEventListener("click", () => {
        if (selected.has(ai.id)) selected.delete(ai.id);
        else selected.add(ai.id);
        selectError.hidden = true;
        renderSelect();
        saveSession();
      });
      aiGrid.appendChild(btn);
    });
    btnStartChat.disabled = selected.size < 1;
  }

  function fillHelperSelect() {
    customHelper.innerHTML = "";
    BASE_AIS.forEach((ai) => {
      const opt = document.createElement("option");
      opt.value = ai.id;
      opt.textContent = ai.name;
      customHelper.appendChild(opt);
    });
  }

  function appendMessage(msg) {
    const row = document.createElement("article");
    row.className = "msg" + (msg.role === "user" ? " user" : "");
    if (msg.role === "ai") {
      const ai = getAi(msg.aiId);
      const name = document.createElement("p");
      name.className = "msg-ai-name";
      name.textContent = msg.name || (ai && ai.name) || "IA";
      if (ai && ai.color) name.style.color = ai.color;
      row.appendChild(name);
    } else {
      const name = document.createElement("p");
      name.className = "msg-ai-name";
      name.textContent = "Vos";
      row.appendChild(name);
    }
    const body = document.createElement("p");
    body.textContent = msg.text;
    row.appendChild(body);
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function renderChat() {
    chatLog.innerHTML = "";
    chatMemory.forEach(appendMessage);
    const names = Array.from(selected)
      .map((id) => getAi(id))
      .filter(Boolean)
      .map((ai) => ai.name);
    chatHint.textContent =
      names.length
        ? "En reunión: " + names.join(", ") + " · respuestas en orden aleatorio"
        : "Sin IAs seleccionadas";
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function sendMessage(text) {
    if (busy || !text.trim() || selected.size < 1) return;
    busy = true;
    btnSend.disabled = true;
    chatInput.disabled = true;

    const userMsg = { role: "user", text: text.trim() };
    chatMemory.push(userMsg);
    appendMessage(userMsg);
    saveSession();

    const order = shuffle(Array.from(selected));
    chatHint.textContent = "Las IAs responden en orden aleatorio…";

    for (let i = 0; i < order.length; i += 1) {
      const ai = getAi(order[i]);
      if (!ai) continue;
      await wait(450 + Math.floor(Math.random() * 500));
      const reply = {
        role: "ai",
        aiId: ai.id,
        name: ai.name,
        text: buildReply(ai, userMsg.text)
      };
      chatMemory.push(reply);
      appendMessage(reply);
      saveSession();
      chatHint.textContent =
        "Respondió " + ai.name + " (" + (i + 1) + "/" + order.length + ")";
    }

    chatHint.textContent =
      "Listo · " +
      Array.from(selected)
        .map((id) => (getAi(id) || {}).name)
        .filter(Boolean)
        .join(", ");
    busy = false;
    btnSend.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }

  document.getElementById("btnPlay").addEventListener("click", () => {
    // Nueva visita a selección: la pestaña puede tener sesión, pero si no hay selección se empieza limpio.
    loadSession();
    if (selected.size === 0) chatMemory = [];
    renderSelect();
    show("screenSelect");
  });

  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnBackFromCreate").addEventListener("click", () => {
    renderSelect();
    show("screenSelect");
  });
  document.getElementById("btnBackFromPermanent").addEventListener("click", () => {
    renderSelect();
    show("screenSelect");
  });
  document.getElementById("btnBackFromChat").addEventListener("click", () => {
    renderSelect();
    show("screenSelect");
  });

  document.getElementById("btnCreateAi").addEventListener("click", () => {
    fillHelperSelect();
    document.getElementById("customName").value = "";
    document.getElementById("customPersonality").value = "";
    createError.hidden = true;
    show("screenCreateAi");
  });

  document.getElementById("btnPermanentMemory").addEventListener("click", () => {
    permanentInput.value = loadPermanent();
    permanentStatus.textContent = loadPermanent().trim()
      ? "Hay memoria permanente guardada."
      : "Todavía no hay memoria permanente.";
    show("screenPermanent");
  });

  document.getElementById("btnSavePermanent").addEventListener("click", () => {
    savePermanent(permanentInput.value);
    permanentStatus.textContent = "Guardado: todas las IAs ya tienen esta memoria permanente.";
  });

  document.getElementById("btnSaveCustom").addEventListener("click", () => {
    createError.hidden = true;
    const name = document.getElementById("customName").value.trim();
    const personality = document.getElementById("customPersonality").value.trim();
    const helperId = customHelper.value;
    if (name.length < 2) {
      createError.hidden = false;
      createError.textContent = "Poné un nombre de IA (mínimo 2 letras).";
      return;
    }
    if (personality.length < 4) {
      createError.hidden = false;
      createError.textContent = "Describí la personalidad.";
      return;
    }
    if (!BASE_AIS.some((ai) => ai.id === helperId)) {
      createError.hidden = false;
      createError.textContent = "Elegí una IA que ayude.";
      return;
    }
    const list = loadCustom();
    list.push({
      id: uid(),
      name,
      personality,
      helperId,
      custom: true
    });
    saveCustom(list);
    renderSelect();
    show("screenSelect");
  });

  btnStartChat.addEventListener("click", () => {
    if (selected.size < 1) {
      selectError.hidden = false;
      selectError.textContent = "Elegí al menos una IA.";
      return;
    }
    saveSession();
    renderChat();
    show("screenChat");
    chatInput.focus();
  });

  document.getElementById("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value;
    chatInput.value = "";
    sendMessage(text);
  });

  // Al abrir/cerrar pestaña: la memoria de chat vive solo en sessionStorage.
  loadSession();
  fillHelperSelect();
})();
