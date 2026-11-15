(function () {
  "use strict";

  const ATTACK_TOOLS = [
    { label: "+", insert: "+" },
    { label: "−", insert: "-" },
    { label: "×", insert: "*" },
    { label: "÷", insert: "/" },
    { label: "√", insert: "sqrt(" },
    { label: "∛", insert: "cbrt(" },
    { label: "^", insert: "^" },
    { label: "n", insert: "n" },
    { label: "π", insert: "pi" },
    { label: "e", insert: "e" }
  ];

  const BLOCK_LIVES = [10, 100, 1000, 10000, 100000, 1000000];
  const MEGA_LIFE = 10000000;

  /** @type {Array<{id:string,name:string,color:string,text:string,attack:string,lastN:number|null}>} */
  let circles = [];
  /** @type {Array<{id:string,r:number,g:number,b:number,color:string}>} */
  let squares = [];
  /** @type {Array<{id:string,name:string,color:string,text:string,attack:string,lastN:number|null}>} */
  let aliveCircles = [];
  /** @type {Array<[object, object]>} */
  let currentPairs = [];
  let pendingPairIndex = -1;
  let raceAnim = 0;

  const circleCount = document.getElementById("circleCount");
  const circleList = document.getElementById("circleList");
  const circleError = document.getElementById("circleError");
  const btnStartCircleBattle = document.getElementById("btnStartCircleBattle");
  const squareCount = document.getElementById("squareCount");
  const squareList = document.getElementById("squareList");
  const squareError = document.getElementById("squareError");
  const btnStartSquareRace = document.getElementById("btnStartSquareRace");
  const rgbPreview = document.getElementById("rgbPreview");
  const pairList = document.getElementById("pairList");
  const bracketHint = document.getElementById("bracketHint");
  const winnerBox = document.getElementById("winnerBox");
  const fightGrid = document.getElementById("fightGrid");
  const fightTitle = document.getElementById("fightTitle");
  const fightHint = document.getElementById("fightHint");
  const btnBackFromFight = document.getElementById("btnBackFromFight");
  const raceCanvas = document.getElementById("raceCanvas");
  const raceResult = document.getElementById("raceResult");
  const raceCtx = raceCanvas.getContext("2d");

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function uid(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
  }

  function formatLife(n) {
    if (n >= 1000000) return n / 1000000 + "M";
    return String(n);
  }

  function evaluateAttack(expr, lastN) {
    let raw = String(expr || "").trim().toLowerCase().replace(/\s+/g, "");
    if (!raw) throw new Error("Escribí un ataque");

    // La primera vez, n se ignora (vale 0).
    const nValue = lastN === null || lastN === undefined ? 0 : Number(lastN);

    raw = raw
      .replace(/π/g, "pi")
      .replace(/\^/g, "**")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/cbrt\(/g, "Math.cbrt(")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/\bn\b/g, "(" + nValue + ")");

    if (!/^[0-9+\-*/().,A-Za-z_]+$/.test(raw)) {
      throw new Error("Ataque inválido");
    }
    if (/(?:alert|eval|Function|window|document|this)/i.test(raw)) {
      throw new Error("Ataque inválido");
    }

    let value;
    try {
      // eslint-disable-next-line no-new-func
      value = Function('"use strict"; return (' + raw + ");")();
    } catch (_err) {
      throw new Error("No se pudo calcular el ataque");
    }
    if (!Number.isFinite(value)) throw new Error("El ataque no dio un número válido");
    return Math.abs(value);
  }

  function buildAttackTools() {
    const wrap = document.getElementById("attackTools");
    wrap.innerHTML = "";
    ATTACK_TOOLS.forEach((tool) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = tool.label;
      btn.addEventListener("click", () => {
        const input = document.getElementById("cAttack");
        input.value += tool.insert;
        input.focus();
      });
      wrap.appendChild(btn);
    });
  }

  function renderCircles() {
    circleCount.textContent = String(circles.length);
    btnStartCircleBattle.disabled = !(circles.length >= 10 && circles.length % 2 === 0);
    circleList.innerHTML = "";
    circles.forEach((ball, index) => {
      const row = document.createElement("div");
      row.className = "chip";
      row.innerHTML =
        '<div class="chip-swatch" style="background:' + ball.color + '">' + ball.text + "</div>" +
        "<div><strong>" + ball.name + "</strong><span>" + ball.attack + "</span></div>";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn ghost";
      del.style.margin = "0 0 0 auto";
      del.textContent = "X";
      del.addEventListener("click", () => {
        circles.splice(index, 1);
        renderCircles();
      });
      row.appendChild(del);
      circleList.appendChild(row);
    });
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function makePairs(list) {
    const shuffled = shuffle(list);
    const pairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      pairs.push([shuffled[i], shuffled[i + 1]]);
    }
    return pairs;
  }

  function startBracket() {
    aliveCircles = circles.map((c) => Object.assign({}, c, { lastN: null }));
    currentPairs = makePairs(aliveCircles);
    winnerBox.hidden = true;
    renderPairs();
    show("screenCircleBracket");
  }

  function renderPairs() {
    pairList.innerHTML = "";
    if (aliveCircles.length === 1) {
      bracketHint.textContent = "¡Tenemos campeón!";
      winnerBox.hidden = false;
      winnerBox.textContent = "Ganador: " + aliveCircles[0].name + " (" + aliveCircles[0].text + ")";
      return;
    }

    bracketHint.textContent = "Ronda con " + aliveCircles.length + " pelotitas · tocá un grupo";
    currentPairs.forEach((pair, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pair-card";
      btn.innerHTML =
        '<div class="pair-side"><span class="chip-swatch" style="background:' + pair[0].color + '">' + pair[0].text + "</span><strong>" + pair[0].name + "</strong></div>" +
        "<span>VS</span>" +
        '<div class="pair-side"><strong>' + pair[1].name + '</strong><span class="chip-swatch" style="background:' + pair[1].color + '">' + pair[1].text + "</span></div>";
      btn.addEventListener("click", () => openFight(index));
      pairList.appendChild(btn);
    });
  }

  function hasSpecificAttackValue(attack) {
    // "Valor específico" = hay un número concreto en la fórmula de ataque.
    return /\d/.test(String(attack || ""));
  }

  function openFight(pairIndex) {
    pendingPairIndex = pairIndex;
    const pair = currentPairs[pairIndex];
    fightTitle.textContent = pair[0].name + " vs " + pair[1].name;
    fightHint.textContent = "El primero en destruir todos los bloques pasa de ronda";
    btnBackFromFight.hidden = true;
    fightGrid.innerHTML = "";

    // Sin número concreto en el ataque → gana de una vez.
    const autoA = !hasSpecificAttackValue(pair[0].attack);
    const autoB = !hasSpecificAttackValue(pair[1].attack);
    if (autoA || autoB) {
      let winner;
      let loser;
      if (autoA && !autoB) {
        winner = pair[0];
        loser = pair[1];
      } else if (autoB && !autoA) {
        winner = pair[1];
        loser = pair[0];
      } else {
        winner = pair[0];
        loser = pair[1];
      }
      fightGrid.innerHTML =
        '<article class="fighter won"><strong>' + winner.name +
        "</strong><p class='hint'>Sin valor específico para quitar · gana de una vez</p></article>" +
        '<article class="fighter lost"><strong>' + loser.name + "</strong></article>";
      finishFight(pairIndex, winner, loser);
      show("screenCircleFight");
      return;
    }

    const hasMega = Math.random() < 0.5;
    const states = pair.map((ball) => ({
      ball: ball,
      blocks: BLOCK_LIVES.map((hp) => ({ hp: hp, max: hp, done: false, mega: false })).concat(
        hasMega ? [{ hp: MEGA_LIFE, max: MEGA_LIFE, done: false, mega: true }] : []
      ),
      finished: false
    }));

    let decided = false;

    function paint() {
      fightGrid.innerHTML = "";
      states.forEach((state) => {
        const card = document.createElement("article");
        card.className = "fighter" + (state.finished ? " won" : "") + (decided && !state.finished ? " lost" : "");
        const head = document.createElement("div");
        head.className = "fighter-head";
        head.innerHTML =
          '<span class="chip-swatch" style="background:' + state.ball.color + '">' + state.ball.text + "</span>" +
          "<div><strong>" + state.ball.name + "</strong><span class='hint'>Ataque: " + state.ball.attack + "</span></div>";
        const blocksWrap = document.createElement("div");
        blocksWrap.className = "blocks";

        state.blocks.forEach((block) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "block" + (block.mega ? " mega" : "");
          btn.disabled = decided || block.done || state.finished;
          btn.textContent = block.done
            ? "Destruido (" + formatLife(block.max) + ")"
            : "Bloque " + formatLife(block.max) + " · vida " + Math.ceil(block.hp);
          btn.addEventListener("click", () => {
            if (decided || block.done || state.finished) return;
            let dmg;
            try {
              dmg = evaluateAttack(state.ball.attack, state.ball.lastN);
            } catch (err) {
              window.alert(err.message || "Ataque inválido");
              return;
            }
            state.ball.lastN = dmg;
            block.hp -= dmg;
            if (block.hp <= 0) {
              block.hp = 0;
              block.done = true;
            }
            if (state.blocks.every((b) => b.done)) {
              state.finished = true;
              if (!decided) {
                decided = true;
                finishFight(pairIndex, state.ball, pair.find((p) => p.id !== state.ball.id));
              }
            }
            paint();
          });
          blocksWrap.appendChild(btn);
        });

        card.appendChild(head);
        card.appendChild(blocksWrap);
        fightGrid.appendChild(card);
      });
    }

    paint();
    show("screenCircleFight");
  }

  function finishFight(pairIndex, winner, loser) {
    fightHint.textContent = winner.name + " califica · " + loser.name + " queda afuera";
    btnBackFromFight.hidden = false;
    btnBackFromFight.onclick = () => {
      aliveCircles = aliveCircles.filter((c) => c.id !== loser.id);
      // Keep winner's lastN updated from fight object
      const keep = aliveCircles.find((c) => c.id === winner.id);
      if (keep) keep.lastN = winner.lastN;
      if (aliveCircles.length === 1) {
        currentPairs = [];
        renderPairs();
        show("screenCircleBracket");
        return;
      }
      if (aliveCircles.length % 2 !== 0) {
        // Shouldn't happen with even start and eliminate one per pair, but if odd remain, bye?
        // With even pairs each round, winners are half - always even until 2 then 1.
      }
      currentPairs = makePairs(aliveCircles);
      renderPairs();
      show("screenCircleBracket");
    };
  }

  function clampByte(n) {
    return Math.max(0, Math.min(255, Number(n) || 0));
  }

  function updateRgbPreview() {
    const r = clampByte(document.getElementById("sR").value);
    const g = clampByte(document.getElementById("sG").value);
    const b = clampByte(document.getElementById("sB").value);
    rgbPreview.style.background = "rgb(" + r + "," + g + "," + b + ")";
  }

  function renderSquares() {
    squareCount.textContent = String(squares.length);
    btnStartSquareRace.disabled = squares.length < 1;
    squareList.innerHTML = "";
    squares.forEach((sq, index) => {
      const row = document.createElement("div");
      row.className = "chip";
      row.innerHTML =
        '<div class="chip-swatch square" style="background:' + sq.color + '"></div>' +
        "<div><strong>RGB(" + sq.r + ", " + sq.g + ", " + sq.b + ")</strong><span>Cuadrado " + (index + 1) + "</span></div>";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn ghost";
      del.style.margin = "0 0 0 auto";
      del.textContent = "X";
      del.addEventListener("click", () => {
        squares.splice(index, 1);
        renderSquares();
      });
      row.appendChild(del);
      squareList.appendChild(row);
    });
  }

  function startSquareRace() {
    cancelAnimationFrame(raceAnim);
    raceResult.hidden = true;
    document.getElementById("raceHint").textContent = "Salen en diagonal y rebotan · el último en la meta pierde";
    const W = raceCanvas.width;
    const H = raceCanvas.height;
    const size = 22;
    const speed = 1.35;

    const runners = squares.map((sq, i) => {
      // Misma velocidad para todos, empezando en diagonal (no recto).
      const dir = i % 2 === 0 ? 1 : -1;
      return {
        id: sq.id,
        color: sq.color,
        x: 30 + (i % 5) * 28,
        y: 40 + Math.floor(i / 5) * 36,
        vx: speed,
        vy: speed * dir,
        size: size,
        finished: false,
        finishOrder: 0
      };
    });

    const obstacles = [];
    for (let i = 0; i < 10; i += 1) {
      const kind = Math.random();
      const x = 140 + (i % 5) * 120 + Math.random() * 20;
      const y = 60 + Math.floor(i / 5) * 180 + Math.random() * 40;
      if (kind < 0.55) {
        obstacles.push({ type: "white", x: x, y: y, w: 46, h: 46 });
      } else {
        const owner = squares[Math.floor(Math.random() * squares.length)];
        obstacles.push({
          type: "ball",
          x: x,
          y: y,
          w: 46,
          h: 46,
          color: owner.color,
          ownerId: owner.id,
          broken: false
        });
      }
    }
    const goal = { x: W - 78, y: H / 2 - 48, w: 48, h: 96 };

    let finishCount = 0;

    function hitBox(a, b) {
      return a.x < b.x + b.w && a.x + a.size > b.x && a.y < b.y + b.h && a.y + a.size > b.y;
    }

    function bounceOff(r, box) {
      const cx = r.x + r.size / 2;
      const cy = r.y + r.size / 2;
      const bx = box.x + box.w / 2;
      const by = box.y + box.h / 2;
      const dx = cx - bx;
      const dy = cy - by;
      if (Math.abs(dx) * box.h > Math.abs(dy) * box.w) {
        r.vx *= -1;
        r.x += r.vx > 0 ? 2 : -2;
      } else {
        r.vy *= -1;
        r.y += r.vy > 0 ? 2 : -2;
      }
    }

    function frame() {
      raceCtx.clearRect(0, 0, W, H);
      raceCtx.fillStyle = "#07111f";
      raceCtx.fillRect(0, 0, W, H);

      raceCtx.strokeStyle = "rgb(56 189 248 / 0.25)";
      raceCtx.strokeRect(8, 8, W - 16, H - 16);

      obstacles.forEach((obs) => {
        if (obs.type === "white") {
          raceCtx.fillStyle = "#f8fafc";
          raceCtx.fillRect(obs.x, obs.y, obs.w, obs.h);
        } else if (!obs.broken) {
          raceCtx.fillStyle = obs.color;
          raceCtx.fillRect(obs.x, obs.y, obs.w, obs.h);
          raceCtx.strokeStyle = "#fff";
          raceCtx.strokeRect(obs.x + 0.5, obs.y + 0.5, obs.w - 1, obs.h - 1);
        }
      });

      raceCtx.fillStyle = "#22c55e";
      raceCtx.fillRect(goal.x, goal.y, goal.w, goal.h);
      raceCtx.fillStyle = "#052e16";
      raceCtx.font = "bold 12px Segoe UI";
      raceCtx.fillText("META", goal.x + 8, goal.y + 24);

      let allDone = true;
      runners.forEach((r) => {
        if (!r.finished) {
          allDone = false;
          r.x += r.vx;
          r.y += r.vy;

          // Rebote en bordes.
          if (r.x <= 8) { r.x = 8; r.vx = Math.abs(r.vx); }
          if (r.y <= 8) { r.y = 8; r.vy = Math.abs(r.vy); }
          if (r.x + r.size >= W - 8) { r.x = W - 8 - r.size; r.vx = -Math.abs(r.vx); }
          if (r.y + r.size >= H - 8) { r.y = H - 8 - r.size; r.vy = -Math.abs(r.vy); }

          obstacles.forEach((obs) => {
            if (obs.type === "ball" && obs.broken) return;
            if (obs.type === "gone") return;
            if (!hitBox(r, obs)) return;
            if (obs.type === "ball" && obs.ownerId === r.id) {
              obs.broken = true;
              return;
            }
            // Blancos y bloques de otro color: rebotan.
            bounceOff(r, obs);
          });

          if (hitBox(r, goal)) {
            r.finished = true;
            finishCount += 1;
            r.finishOrder = finishCount;
            r.vx = 0;
            r.vy = 0;
            r.x = goal.x + (goal.w - r.size) / 2;
            r.y = goal.y + 8 + (finishCount - 1) * (r.size + 4);
          }
        }

        raceCtx.fillStyle = r.color;
        raceCtx.fillRect(r.x, r.y, r.size, r.size);
        raceCtx.strokeStyle = "rgb(255 255 255 / 0.35)";
        raceCtx.strokeRect(r.x, r.y, r.size, r.size);
      });

      if (allDone && runners.length) {
        const sorted = runners.slice().sort((a, b) => a.finishOrder - b.finishOrder);
        const loser = sorted[sorted.length - 1];
        const winner = sorted[0];
        raceResult.hidden = false;
        raceResult.innerHTML =
          "Primero: RGB " + winner.color + "<br>Último (pierde): RGB " + loser.color;
        document.getElementById("raceHint").textContent = "Carrera terminada";
        return;
      }

      raceAnim = requestAnimationFrame(frame);
    }

    show("screenSquareRace");
    raceAnim = requestAnimationFrame(frame);
  }

  buildAttackTools();
  updateRgbPreview();

  document.getElementById("btnPlay").addEventListener("click", () => show("screenChoose"));
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnCircles").addEventListener("click", () => {
    renderCircles();
    show("screenCircleCreate");
  });
  document.getElementById("btnSquares").addEventListener("click", () => {
    renderSquares();
    updateRgbPreview();
    show("screenSquareCreate");
  });
  document.getElementById("btnBackFromCircleCreate").addEventListener("click", () => show("screenChoose"));
  document.getElementById("btnBackFromSquareCreate").addEventListener("click", () => show("screenChoose"));
  document.getElementById("btnBackFromBracket").addEventListener("click", () => show("screenCircleCreate"));
  document.getElementById("btnBackFromRace").addEventListener("click", () => {
    cancelAnimationFrame(raceAnim);
    show("screenSquareCreate");
  });

  document.getElementById("circleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    circleError.hidden = true;
    const name = document.getElementById("cName").value.trim();
    const color = document.getElementById("cColor").value;
    const text = document.getElementById("cText").value.trim();
    const attack = document.getElementById("cAttack").value.trim();
    if (!name) return;
    if (!text || text.length > 3) {
      circleError.hidden = false;
      circleError.textContent = "El texto debe tener entre 1 y 3 letras.";
      return;
    }
    try {
      evaluateAttack(attack, null);
    } catch (err) {
      // Allow formulas with n for later; only reject if invalid without n when n present
      if (/\bn\b/i.test(attack)) {
        // Validate by substituting n=1 temporarily for create-time check
        try {
          evaluateAttack(attack.replace(/\bn\b/gi, "1"), 1);
        } catch (err2) {
          circleError.hidden = false;
          circleError.textContent = err2.message || "Ataque inválido";
          return;
        }
      } else {
        circleError.hidden = false;
        circleError.textContent = err.message || "Ataque inválido";
        return;
      }
    }
    circles.push({ id: uid("c"), name: name, color: color, text: text, attack: attack, lastN: null });
    document.getElementById("circleForm").reset();
    document.getElementById("cColor").value = "#38bdf8";
    renderCircles();
  });

  btnStartCircleBattle.addEventListener("click", startBracket);

  document.getElementById("squareForm").addEventListener("submit", (event) => {
    event.preventDefault();
    squareError.hidden = true;
    const r = clampByte(document.getElementById("sR").value);
    const g = clampByte(document.getElementById("sG").value);
    const b = clampByte(document.getElementById("sB").value);
    squares.push({
      id: uid("s"),
      r: r,
      g: g,
      b: b,
      color: "rgb(" + r + ", " + g + ", " + b + ")"
    });
    renderSquares();
  });

  ["sR", "sG", "sB"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateRgbPreview);
  });

  btnStartSquareRace.addEventListener("click", startSquareRace);
})();
