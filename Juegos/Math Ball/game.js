(function () {
  "use strict";

  const STORAGE_KEY = "math-ball-balls-v1";

  /** @type {Array<{id:string,value:number,color:string,label:string}>} */
  let balls = loadBalls();
  /** @type {Set<string>} */
  let selected = new Set();
  let raceTimer = 0;
  /** @type {Array<object>} */
  let racers = [];
  let raceDone = false;
  let lastWinner = null;

  const ballCount = document.getElementById("ballCount");
  const ballList = document.getElementById("ballList");
  const ballError = document.getElementById("ballError");
  const btnGoSelect = document.getElementById("btnGoSelect");
  const selectGrid = document.getElementById("selectGrid");
  const btnStartRace = document.getElementById("btnStartRace");
  const board = document.getElementById("board");
  const raceHint = document.getElementById("raceHint");
  const raceResult = document.getElementById("raceResult");
  const challengeBox = document.getElementById("challengeBox");
  const maxCreatedEl = document.getElementById("maxCreated");
  const challengeValue = document.getElementById("challengeValue");

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function uid() {
    return "b-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
  }

  function loadBalls() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => ({
          id: String(item.id || uid()),
          value: Math.floor(Number(item.value)),
          color: String(item.color || "#38bdf8"),
          label: String(item.label || item.value)
        }))
        .filter((item) => Number.isFinite(item.value) && item.value >= 1)
        .sort((a, b) => a.value - b.value);
    } catch (_err) {
      return [];
    }
  }

  function saveBalls() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(balls));
    } catch (_err) {
      /* ignore */
    }
  }

  function maxCreated() {
    return balls.reduce((max, ball) => Math.max(max, ball.value), 0);
  }

  function sortBalls() {
    balls.sort((a, b) => a.value - b.value);
  }

  function renderBalls() {
    sortBalls();
    saveBalls();
    ballCount.textContent = String(balls.length);
    btnGoSelect.disabled = balls.length < 3;
    ballList.innerHTML = "";
    balls.forEach((ball, index) => {
      const row = document.createElement("div");
      row.className = "ball-chip";
      row.innerHTML =
        '<div class="swatch" style="background:' + ball.color + '">' + ball.label + "</div>" +
        "<div><strong>#" + (index + 1) + " · valor " + ball.value + "</strong>" +
        "<span class='hint'>Texto: " + ball.label + "</span></div>";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn ghost";
      del.style.margin = "0 0 0 auto";
      del.textContent = "X";
      del.addEventListener("click", () => {
        balls = balls.filter((item) => item.id !== ball.id);
        selected.delete(ball.id);
        renderBalls();
      });
      row.appendChild(del);
      ballList.appendChild(row);
    });
  }

  function renderSelect() {
    selectGrid.innerHTML = "";
    if (balls.length === 3) {
      selected = new Set(balls.map((ball) => ball.id));
    }
    balls.forEach((ball) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "select-chip" + (selected.has(ball.id) ? " selected" : "");
      btn.innerHTML =
        '<div class="swatch" style="background:' + ball.color + '">' + ball.label + "</div>" +
        "<div><strong>valor " + ball.value + "</strong><span class='hint'>" +
        (selected.has(ball.id) ? "Seleccionada" : "Tocá para elegir") +
        "</span></div>";
      btn.addEventListener("click", () => {
        if (balls.length === 3) return;
        if (selected.has(ball.id)) selected.delete(ball.id);
        else selected.add(ball.id);
        renderSelect();
      });
      selectGrid.appendChild(btn);
    });
    btnStartRace.disabled = selected.size < 3;
  }

  function collatzNext(n) {
    if (n % 2 === 0) return n / 2;
    return 3 * n + 1;
  }

  function valueToBottom(value, maxValue) {
    const safeMax = Math.max(2, maxValue);
    const ratio = Math.log(Math.max(1, value)) / Math.log(safeMax);
    const boardH = board.clientHeight || 500;
    const ballH = 56;
    return Math.max(8, Math.min(boardH - ballH - 8, ratio * (boardH - ballH - 16)));
  }

  function stopRace() {
    if (raceTimer) {
      window.clearInterval(raceTimer);
      raceTimer = 0;
    }
  }

  function paintRacers(maxValue) {
    racers.forEach((racer) => {
      racer.el.style.left = racer.x + "px";
      racer.el.style.bottom = valueToBottom(racer.current, maxValue) + "px";
      racer.el.textContent = String(racer.current);
      racer.el.classList.toggle("done", racer.current === 1);
    });
  }

  function finishRace(winner) {
    stopRace();
    raceDone = true;
    lastWinner = winner;
    raceHint.textContent = "¡Collatz terminado!";
    raceResult.hidden = false;
    raceResult.textContent =
      "Ganador: " + winner.label + " (empezó en " + winner.start + ")";
    maxCreatedEl.textContent = String(maxCreated());
    challengeValue.min = String(maxCreated() + 1);
    challengeValue.value = String(maxCreated() + 1);
    challengeBox.hidden = false;
  }

  function startRace(list) {
    stopRace();
    raceDone = false;
    raceResult.hidden = true;
    challengeBox.hidden = true;
    board.innerHTML = "";
    const width = board.clientWidth || 900;
    const gap = width / (list.length + 1);
    const maxStart = Math.max.apply(null, list.map((item) => item.value));

    racers = list.map((ball, index) => {
      const el = document.createElement("div");
      el.className = "racer";
      el.style.background = ball.color;
      el.title = "Original: " + ball.label;
      board.appendChild(el);
      return {
        id: ball.id,
        label: ball.label,
        color: ball.color,
        start: ball.value,
        current: ball.value,
        x: gap * (index + 1) - 28,
        el: el
      };
    });

    paintRacers(maxStart);
    raceHint.textContent = "Corriendo Collatz… más arriba = mayor valor actual";

    raceTimer = window.setInterval(() => {
      let maxNow = 1;
      let allOne = true;
      racers.forEach((racer) => {
        if (racer.current !== 1) {
          allOne = false;
          racer.current = collatzNext(racer.current);
        }
        if (racer.current > maxNow) maxNow = racer.current;
      });
      const scaleMax = Math.max(maxStart, maxNow);
      paintRacers(scaleMax);

      const winners = racers.filter((racer) => racer.current === 1);
      if (winners.length && !allOne) {
        // Primer@ en llegar a 1 en este tick.
        const first = winners[0];
        // Si varios llegan juntos, gana el de menor start original.
        winners.sort((a, b) => a.start - b.start);
        finishRace(winners[0] || first);
        return;
      }
      if (allOne) {
        racers.sort((a, b) => a.start - b.start);
        finishRace(racers[0]);
      }
    }, 450);
  }

  function openSelect() {
    if (balls.length < 3) return;
    selected = balls.length === 3 ? new Set(balls.map((b) => b.id)) : new Set();
    renderSelect();
    show("screenSelect");
  }

  document.getElementById("btnPlay").addEventListener("click", () => {
    renderBalls();
    show("screenCreate");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnBackFromSelect").addEventListener("click", () => {
    renderBalls();
    show("screenCreate");
  });
  document.getElementById("btnBackFromRace").addEventListener("click", () => {
    stopRace();
    openSelect();
  });
  btnGoSelect.addEventListener("click", openSelect);

  document.getElementById("ballForm").addEventListener("submit", (event) => {
    event.preventDefault();
    ballError.hidden = true;
    const value = Math.floor(Number(document.getElementById("ballValue").value));
    const color = document.getElementById("ballColor").value;
    if (!Number.isFinite(value) || value < 1) {
      ballError.hidden = false;
      ballError.textContent = "Poné un número entero mayor o igual a 1.";
      return;
    }
    if (balls.some((ball) => ball.value === value)) {
      ballError.hidden = false;
      ballError.textContent = "Ese número ya está usado. Tiene que ser único.";
      return;
    }
    balls.push({
      id: uid(),
      value: value,
      color: color,
      label: String(value)
    });
    document.getElementById("ballValue").value = "";
    renderBalls();
  });

  btnStartRace.addEventListener("click", () => {
    const chosen = balls.filter((ball) => selected.has(ball.id));
    if (chosen.length < 3) return;
    show("screenRace");
    window.requestAnimationFrame(() => startRace(chosen));
  });

  document.getElementById("btnChallenge").addEventListener("click", () => {
    if (!lastWinner) return;
    const challenge = Math.floor(Number(challengeValue.value));
    const max = maxCreated();
    if (!Number.isFinite(challenge) || challenge <= max) {
      window.alert("El desafío tiene que ser mayor que " + max + ".");
      return;
    }
    const rival = {
      id: "challenge-" + challenge,
      value: challenge,
      color: "#f472b6",
      label: String(challenge)
    };
    const champ = {
      id: lastWinner.id,
      value: lastWinner.start,
      color: lastWinner.color,
      label: lastWinner.label
    };
    // Also allow adding a mid filler if only 2 - Collatz needs 3? User said select at least 3.
    // For challenge: winner + bigger rival + optional ghost of max created
    const fillerValue = Math.max(1, Math.floor((champ.value + rival.value) / 2));
    const filler = {
      id: "filler-" + fillerValue,
      value: fillerValue === champ.value || fillerValue === rival.value ? rival.value - 1 : fillerValue,
      color: "#94a3b8",
      label: String(fillerValue === champ.value || fillerValue === rival.value ? rival.value - 1 : fillerValue)
    };
    if (filler.value < 1 || filler.value === champ.value || filler.value === rival.value) {
      filler.value = Math.max(1, rival.value - 2);
      filler.label = String(filler.value);
    }
    startRace([champ, filler, rival]);
  });

  renderBalls();
})();
