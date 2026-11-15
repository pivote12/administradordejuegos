(function (global) {
  "use strict";

  const STORAGE_KEY = "symbolism-symbols-v1";
  const STORAGE_BAK = "symbolism-symbols-v1-bak";
  const FONT_FAMILY = "SymbolismLetters";
  const PUA_START = 0xe000;
  const PUA_END = 0xf8ff;
  const UNITS = 1024;
  const GRID = 32;

  let fontPromise = null;
  let fontToken = 0;
  let fontObjectUrl = null;

  function makeId(prefix) {
    return (prefix || "sym") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function codeToChar(code) {
    return String.fromCharCode(code);
  }

  function isPuaChar(ch) {
    if (!ch) return false;
    const c = ch.charCodeAt(0);
    return c >= PUA_START && c <= PUA_END;
  }

  function normalizeSymbol(raw, index) {
    if (!raw || !raw.image) return null;
    const id = raw.id || makeId("sym");
    let code = Number(raw.code);
    if (!code || code < PUA_START || code > PUA_END) {
      if (raw.char && isPuaChar(raw.char)) code = raw.char.charCodeAt(0);
      else code = PUA_START + (index % (PUA_END - PUA_START + 1));
    }
    return {
      id: id,
      code: code,
      char: codeToChar(code),
      name: String(raw.name || "Letra").slice(0, 40),
      image: raw.image,
      createdAt: Number(raw.createdAt) || Date.now()
    };
  }

  function assignUniqueCodes(list) {
    const used = new Set();
    let next = PUA_START;
    list.forEach((sym) => {
      let code = sym.code;
      if (!code || code < PUA_START || code > PUA_END || used.has(code)) {
        while (used.has(next) && next <= PUA_END) next += 1;
        code = next;
        next += 1;
      }
      used.add(code);
      sym.code = code;
      sym.char = codeToChar(code);
    });
    return list;
  }

  function loadSymbols() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_BAK);
      const parsed = JSON.parse(raw || "[]");
      if (!Array.isArray(parsed)) return [];
      return assignUniqueCodes(
        parsed.map((item, i) => normalizeSymbol(item, i)).filter(Boolean)
      );
    } catch (_err) {
      return [];
    }
  }

  function saveSymbols(list) {
    const normalized = assignUniqueCodes(
      (list || []).map((item, i) => normalizeSymbol(item, i)).filter(Boolean)
    );
    const json = JSON.stringify(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_BAK, json);
    } catch (_err) {
      try {
        localStorage.setItem(STORAGE_KEY, json);
      } catch (_err2) {
        return null;
      }
    }
    fontPromise = null;
    return normalized;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("img"));
      img.src = src;
    });
  }

  function imageToGlyphPath(img) {
    const canvas = document.createElement("canvas");
    canvas.width = GRID;
    canvas.height = GRID;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, GRID, GRID);
    const scale = Math.min(GRID / Math.max(img.width, 1), GRID / Math.max(img.height, 1));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const ox = Math.floor((GRID - w) / 2);
    const oy = Math.floor((GRID - h) / 2);
    ctx.drawImage(img, ox, oy, w, h);
    const data = ctx.getImageData(0, 0, GRID, GRID).data;
    const path = new opentype.Path();
    const cell = UNITS / GRID;
    let inked = 0;

    for (let y = 0; y < GRID; y += 1) {
      let runStart = -1;
      for (let x = 0; x <= GRID; x += 1) {
        let dark = false;
        if (x < GRID) {
          const i = (y * GRID + x) * 4;
          const a = data[i + 3];
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          dark = a > 20 && !(r > 240 && g > 240 && b > 240);
        }
        if (dark) {
          if (runStart < 0) runStart = x;
        } else if (runStart >= 0) {
          const x0 = runStart * cell;
          const x1 = x * cell;
          const y1 = (GRID - y) * cell;
          const y0 = y1 - cell;
          path.moveTo(x0, y0);
          path.lineTo(x1, y0);
          path.lineTo(x1, y1);
          path.lineTo(x0, y1);
          path.close();
          inked += 1;
          runStart = -1;
        }
      }
    }

    if (!inked) {
      // trazo mínimo para que la letra no quede vacía
      path.moveTo(UNITS * 0.2, UNITS * 0.2);
      path.lineTo(UNITS * 0.8, UNITS * 0.2);
      path.lineTo(UNITS * 0.8, UNITS * 0.8);
      path.lineTo(UNITS * 0.2, UNITS * 0.8);
      path.close();
    }
    return path;
  }

  async function buildFontBuffer(symbols) {
    if (typeof opentype === "undefined") {
      throw new Error("Falta opentype.js");
    }

    const glyphs = [
      new opentype.Glyph({
        name: ".notdef",
        advanceWidth: UNITS / 2,
        path: new opentype.Path()
      }),
      new opentype.Glyph({
        name: "space",
        unicode: 32,
        advanceWidth: UNITS * 0.35,
        path: new opentype.Path()
      })
    ];

    for (let i = 0; i < symbols.length; i += 1) {
      const sym = symbols[i];
      let path = new opentype.Path();
      try {
        const img = await loadImage(sym.image);
        path = imageToGlyphPath(img);
      } catch (_err) {
        path = new opentype.Path();
        path.moveTo(UNITS * 0.25, UNITS * 0.25);
        path.lineTo(UNITS * 0.75, UNITS * 0.25);
        path.lineTo(UNITS * 0.75, UNITS * 0.75);
        path.lineTo(UNITS * 0.25, UNITS * 0.75);
        path.close();
      }
      glyphs.push(
        new opentype.Glyph({
          name: "u" + sym.code.toString(16),
          unicode: sym.code,
          advanceWidth: UNITS * 0.95,
          path: path
        })
      );
    }

    const font = new opentype.Font({
      familyName: FONT_FAMILY,
      styleName: "Regular",
      unitsPerEm: UNITS,
      ascender: Math.round(UNITS * 0.88),
      descender: -Math.round(UNITS * 0.12),
      glyphs: glyphs
    });
    return font.toArrayBuffer();
  }

  async function ensureFont(force) {
    if (fontPromise && !force) return fontPromise;
    const token = ++fontToken;
    fontPromise = (async () => {
      const symbols = loadSymbols();
      const buffer = await buildFontBuffer(symbols);
      if (token !== fontToken) return FONT_FAMILY;

      if (fontObjectUrl) {
        try {
          URL.revokeObjectURL(fontObjectUrl);
        } catch (_err) {
          /* ignore */
        }
      }

      const blob = new Blob([buffer], { type: "font/ttf" });
      fontObjectUrl = URL.createObjectURL(blob);
      const face = new FontFace(FONT_FAMILY, "url(" + fontObjectUrl + ")");
      face.display = "block";
      await face.load();
      document.fonts.add(face);
      await document.fonts.ready;
      applyFontToDocument();
      return FONT_FAMILY;
    })();
    return fontPromise;
  }

  function applyFontStyle(el) {
    if (!el) return;
    el.style.fontFamily = "'" + FONT_FAMILY + "', 'Segoe UI Symbol', 'Cascadia Code', Consolas, monospace";
  }

  function applyFontToDocument() {
    document.documentElement.style.setProperty(
      "--symbolism-font",
      "'" + FONT_FAMILY + "', 'Segoe UI Symbol', 'Cascadia Code', Consolas, monospace"
    );
    document.querySelectorAll(".sym-glyph, #notesArea, .letter-chip").forEach(applyFontStyle);
  }

  /** Nodo de letra tipográfica (texto, no imagen). */
  function makeLetterNode(sym, className) {
    const el = document.createElement("span");
    el.className = className || "sym-glyph";
    el.textContent = sym.char;
    el.title = sym.name || "Letra";
    applyFontStyle(el);
    return el;
  }

  function migrateTextToLetters(text) {
    const symbols = loadSymbols();
    const byId = new Map(symbols.map((s) => [s.id, s]));
    let out = String(text || "");
    out = out.replace(/\{\{SYM:([^}]+)\}\}/g, (_, id) => {
      const sym = byId.get(id);
      return sym ? sym.char : "";
    });
    out = out.replace(/(?:⟦|\[\[)SYM:([^⟧\]]+)(?:⟧|\]\])/g, (_, id) => {
      const sym = byId.get(id);
      return sym ? sym.char : "";
    });
    out = out.replace(/#S\d+#/g, () => "");
    return out;
  }

  global.SymbolLetters = {
    STORAGE_KEY: STORAGE_KEY,
    FONT_FAMILY: FONT_FAMILY,
    loadSymbols: loadSymbols,
    saveSymbols: saveSymbols,
    normalizeSymbol: normalizeSymbol,
    assignUniqueCodes: assignUniqueCodes,
    ensureFont: ensureFont,
    applyFontStyle: applyFontStyle,
    applyFontToDocument: applyFontToDocument,
    makeLetterNode: makeLetterNode,
    migrateTextToLetters: migrateTextToLetters,
    isPuaChar: isPuaChar,
    makeId: makeId,
    nextCode: function (list) {
      const used = new Set((list || []).map((s) => s.code));
      let code = PUA_START;
      while (used.has(code) && code <= PUA_END) code += 1;
      return code;
    },
    prepareInks: function () {
      return Promise.resolve(loadSymbols());
    },
    textToEditorHtml: function (text) {
      return migrateTextToLetters(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    editorHtmlToText: function (root) {
      return root.value != null ? String(root.value) : migrateTextToLetters(root.textContent || "");
    },
    copyLetterDrawing: async function (sym) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sym.char);
        return true;
      }
      const area = document.createElement("textarea");
      area.value = sym.char;
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (_err) {
        ok = false;
      }
      area.remove();
      return ok;
    }
  };
})(window);
