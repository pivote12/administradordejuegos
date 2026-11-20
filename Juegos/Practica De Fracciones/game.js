(function () {
  "use strict";

  const BOARD_KEY = "practica-fracciones-board-v1";
  const AI_NAME = "IA";

  /** @type {string[]} */
  let alive = [];
  /** @type {string[]} */
  let eliminated = [];
  let currentPlayer = "";
  /** @type {{num:number,den:number}|null} */
  let currentAnswer = null;
  let vsAi = false;
  let aiTimer = 0;

  const namesInput = document.getElementById("namesInput");
  const namesError = document.getElementById("namesError");
  const namesCount = document.getElementById("namesCount");
  const btnStartMatch = document.getElementById("btnStartMatch");
  const aliveList = document.getElementById("aliveList");
  const outList = document.getElementById("outList");
  const matchHint = document.getElementById("matchHint");
  const turnLabel = document.getElementById("turnLabel");
  const problemText = document.getElementById("problemText");
  const answerForm = document.getElementById("answerForm");
  const answerInput = document.getElementById("answerInput");
  const answerError = document.getElementById("answerError");
  const btnAnswer = document.getElementById("btnAnswer");
  const aiNote = document.getElementById("aiNote");
  const winnerName = document.getElementById("winnerName");
  const boardList = document.getElementById("boardList");
  const boardEmpty = document.getElementById("boardEmpty");
  const btnVsAi = document.getElementById("btnVsAi");
  const btnBoardVsAi = document.getElementById("btnBoardVsAi");

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  function simplify(num, den) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    if (den === 0) return { num: 0, den: 1 };
    const g = gcd(num, den);
    return { num: num / g, den: den / g };
  }

  function fracEqual(a, b) {
    return a.num * b.den === b.num * a.den;
  }

  function formatFrac(f) {
    const s = simplify(f.num, f.den);
    if (s.den === 1) return String(s.num);
    if (Math.abs(s.num) > s.den) {
      const whole = Math.trunc(s.num / s.den);
      const rem = Math.abs(s.num % s.den);
      if (rem === 0) return String(whole);
      return whole + " " + rem + "/" + s.den;
    }
    return s.num + "/" + s.den;
  }

  function parseAnswer(text) {
    const raw = String(text || "").trim().replace(",", ".");
    if (!raw) return null;

    const mixed = raw.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) {
      const whole = Number(mixed[1]);
      const num = Number(mixed[2]);
      const den = Number(mixed[3]);
      if (!den) return null;
      const sign = whole < 0 ? -1 : 1;
      return simplify(sign * (Math.abs(whole) * den + num), den);
    }

    const simple = raw.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (simple) {
      const num = Number(simple[1]);
      const den = Number(simple[2]);
      if (!den) return null;
      return simplify(num, den);
    }

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      const value = Number(raw);
      if (!Number.isFinite(value)) return null;
      const den = 10000;
      return simplify(Math.round(value * den), den);
    }

    return null;
  }

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function randomProper() {
    const den = randInt(2, 12);
    const num = randInt(1, den - 1);
    return simplify(num, den);
  }

  function makeProblem() {
    const a = randomProper();
    const b = randomProper();
    const op = Math.random() < 0.5 ? "+" : "-";
    let result;
    if (op === "+") {
      result = simplify(a.num * b.den + b.num * a.den, a.den * b.den);
    } else {
      // Evitar resultado negativo: restar el menor del mayor
      const av = a.num / a.den;
      const bv = b.num / b.den;
      const left = av >= bv ? a : b;
      const right = av >= bv ? b : a;
      result = simplify(left.num * right.den - right.num * left.den, left.den * right.den);
      return {
        text: formatFrac(left) + " − " + formatFrac(right),
        answer: result
      };
    }
    return {
      text: formatFrac(a) + " + " + formatFrac(b),
      answer: result
    };
  }

  function loadBoard() {
    try {
      const parsed = JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((row) => ({
          name: String(row.name || "").trim(),
          trophies: Math.max(0, Math.floor(Number(row.trophies) || 0))
        }))
        .filter((row) => row.name)
        .sort((a, b) => b.trophies - a.trophies || a.name.localeCompare(b.name, "es"));
    } catch (_err) {
      return [];
    }
  }

  function saveBoard(rows) {
    try {
      localStorage.setItem(BOARD_KEY, JSON.stringify(rows));
    } catch (_err) {
      /* ignore */
    }
  }

  function addTrophy(name) {
    const rows = loadBoard();
    const found = rows.find((row) => row.name.toLowerCase() === name.toLowerCase());
    if (found) found.trophies += 1;
    else rows.push({ name: name, trophies: 1 });
    rows.sort((a, b) => b.trophies - a.trophies || a.name.localeCompare(b.name, "es"));
    saveBoard(rows);
    return rows;
  }

  function topPlayer() {
    const rows = loadBoard();
    return rows[0] || null;
  }

  function syncVsAiButtons() {
    const top = topPlayer();
    const can = !!(top && top.name && top.name !== AI_NAME);
    btnVsAi.hidden = !can;
    btnBoardVsAi.hidden = !can;
    if (can) {
      btnVsAi.textContent = "Jugar vs IA (" + top.name + ")";
      btnBoardVsAi.textContent = "1.º vs IA (" + top.name + ")";
    }
  }

  function parseNames(text) {
    const seen = new Set();
    const names = [];
    String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((name) => {
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        names.push(name);
      });
    return names;
  }

  function refreshNamesUi() {
    const names = parseNames(namesInput.value);
    namesCount.textContent = names.length + " nombre" + (names.length === 1 ? "" : "s") + " válido" + (names.length === 1 ? "" : "s");
    btnStartMatch.disabled = names.length < 2;
    namesError.hidden = true;
  }

  function renderAlive() {
    aliveList.innerHTML = "";
    alive.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      if (name === currentPlayer) li.style.borderColor = "var(--accent)";
      aliveList.appendChild(li);
    });
    outList.innerHTML = "";
    eliminated.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      outList.appendChild(li);
    });
    matchHint.textContent =
      alive.length === 1
        ? "Queda 1 · coronando ganador"
        : "Quedan " + alive.length + " en juego · falla = eliminado";
  }

  function clearAiTimer() {
    if (aiTimer) {
      window.clearTimeout(aiTimer);
      aiTimer = 0;
    }
  }

  function setHumanTurnUi(enabled) {
    answerInput.disabled = !enabled;
    btnAnswer.disabled = !enabled;
    answerForm.hidden = !enabled;
    aiNote.hidden = enabled;
  }

  function nextTurn() {
    clearAiTimer();
    answerError.hidden = true;
    answerInput.value = "";

    if (alive.length <= 1) {
      finishWinner(alive[0] || eliminated[eliminated.length - 1] || "—");
      return;
    }

    currentPlayer = alive[Math.floor(Math.random() * alive.length)];
    const problem = makeProblem();
    currentAnswer = problem.answer;
    problemText.textContent = problem.text;
    turnLabel.textContent = "Turno de " + currentPlayer;
    renderAlive();

    if (vsAi && currentPlayer === AI_NAME) {
      setHumanTurnUi(false);
      aiNote.hidden = false;
      aiNote.textContent = "La IA está resolviendo…";
      aiTimer = window.setTimeout(() => {
        // La IA casi siempre acierta; a veces falla para que haya drama.
        const success = Math.random() > 0.12;
        resolveTurn(success, success ? formatFrac(currentAnswer) : "0/1");
      }, 900 + Math.floor(Math.random() * 700));
      return;
    }

    setHumanTurnUi(true);
    answerInput.focus();
  }

  function resolveTurn(success, shown) {
    if (!currentPlayer) return;
    if (success) {
      turnLabel.textContent = currentPlayer + " acertó (" + shown + ") · sigue en juego";
      window.setTimeout(nextTurn, 700);
      return;
    }
    alive = alive.filter((name) => name !== currentPlayer);
    eliminated.push(currentPlayer);
    turnLabel.textContent = currentPlayer + " falló · eliminado";
    renderAlive();
    window.setTimeout(nextTurn, 850);
  }

  function finishWinner(name) {
    clearAiTimer();
    currentPlayer = "";
    currentAnswer = null;
    if (name && name !== AI_NAME) addTrophy(name);
    winnerName.textContent = name || "—";
    syncVsAiButtons();
    show("screenWinner");
  }

  function startMatch(names, againstAi) {
    vsAi = !!againstAi;
    alive = names.slice();
    eliminated = [];
    currentPlayer = "";
    currentAnswer = null;
    show("screenMatch");
    nextTurn();
  }

  function renderBoard() {
    const rows = loadBoard();
    boardList.innerHTML = "";
    boardEmpty.hidden = rows.length > 0;
    rows.forEach((row, index) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="board-rank">#' + (index + 1) + "</span>" +
        "<strong>" + row.name + "</strong> · " +
        row.trophies + " trofeo" + (row.trophies === 1 ? "" : "s");
      boardList.appendChild(li);
    });
    syncVsAiButtons();
  }

  function startVsAi() {
    const top = topPlayer();
    if (!top || !top.name || top.name === AI_NAME) return;
    startMatch([top.name, AI_NAME], true);
  }

  document.getElementById("btnPlay").addEventListener("click", () => {
    refreshNamesUi();
    show("screenNames");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => {
    syncVsAiButtons();
    show("screenTitle");
  });
  document.getElementById("btnBackNames").addEventListener("click", () => {
    clearAiTimer();
    show("screenNames");
  });
  document.getElementById("btnOpenBoard").addEventListener("click", () => {
    renderBoard();
    show("screenBoard");
  });
  document.getElementById("btnBackBoard").addEventListener("click", () => {
    syncVsAiButtons();
    show("screenTitle");
  });
  document.getElementById("btnWinnerBoard").addEventListener("click", () => {
    renderBoard();
    show("screenBoard");
  });
  document.getElementById("btnWinnerAgain").addEventListener("click", () => {
    refreshNamesUi();
    show("screenNames");
  });
  document.getElementById("btnWinnerHome").addEventListener("click", () => {
    syncVsAiButtons();
    show("screenTitle");
  });
  btnVsAi.addEventListener("click", startVsAi);
  btnBoardVsAi.addEventListener("click", startVsAi);

  namesInput.addEventListener("input", refreshNamesUi);
  btnStartMatch.addEventListener("click", () => {
    const names = parseNames(namesInput.value);
    if (names.length < 2) {
      namesError.hidden = false;
      namesError.textContent = "Necesitás al menos 2 nombres.";
      return;
    }
    startMatch(names, false);
  });

  answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentAnswer || !currentPlayer) return;
    if (vsAi && currentPlayer === AI_NAME) return;
    const parsed = parseAnswer(answerInput.value);
    if (!parsed) {
      answerError.hidden = false;
      answerError.textContent = "Escribí una fracción válida (ej: 5/6 o 1 1/2).";
      return;
    }
    answerError.hidden = true;
    const ok = fracEqual(parsed, currentAnswer);
    resolveTurn(ok, formatFrac(parsed));
  });

  refreshNamesUi();
  syncVsAiButtons();
})();
