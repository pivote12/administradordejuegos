(function () {
  "use strict";

  const DECIMAL_CONSTANTS = [
    {
      id: "pi",
      name: "π",
      digits: "3.14159265358979323846264338327950288419716939937510"
    },
    {
      id: "e",
      name: "e",
      digits: "2.71828182845904523536028747135266249775724709369995"
    },
    {
      id: "phi",
      name: "ϕ",
      label: "phi",
      digits: "1.61803398"
    },
    {
      id: "sqrt2",
      name: "√2",
      label: "Square Root Of 2",
      digits: "1.41421356"
    },
    {
      id: "euler-mascheroni",
      name: "γ",
      label: "Euler-Mascheroni",
      digits: "0.57721566"
    },
    {
      id: "jos4",
      name: "Ꜿ",
      digits: "0.1418722",
      thanks: true
    },
    {
      id: "jos5",
      name: "Ꝛ",
      digits: "0.276663",
      thanks: true
    },
    {
      id: "jos3",
      name: "⊃",
      digits: "0.132843726639274",
      thanks: true
    }
  ];

  GameI18n.init("decimal-explorer");

  const LABEL_KEYS = {
    phi: "labelPhi",
    "Square Root Of 2": "labelSqrt2",
    "Euler-Mascheroni": "labelEuler",
  };

  const screens = {
    title: document.getElementById("screenTitle"),
    play: document.getElementById("screenPlay")
  };

  const ui = {
    intro: document.getElementById("decimalExplorerIntro"),
    play: document.getElementById("decimalExplorerPlay"),
    form: document.getElementById("formDecimalSearch"),
    inputWhole: document.getElementById("inputDecimalWhole"),
    inputFrac: document.getElementById("inputDecimalFrac"),
    prefix: document.getElementById("decimalSearchPrefix"),
    results: document.getElementById("decimalResults"),
    noResults: document.getElementById("decimalNoResults")
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      if (el) {
        el.classList.toggle("active", key === name);
      }
    });
  }

  function clampDigitInput(input) {
    if (!input) {
      return;
    }
    const digit = input.value.replace(/\D/g, "").slice(0, 1);
    input.value = digit;
  }

  function resetDecimalExplorer() {
    if (ui.intro) {
      ui.intro.hidden = false;
    }
    if (ui.play) {
      ui.play.hidden = true;
    }
    if (ui.form) {
      ui.form.reset();
    }
    if (ui.prefix) {
      ui.prefix.hidden = true;
      ui.prefix.textContent = "";
    }
    if (ui.results) {
      ui.results.innerHTML = "";
    }
    if (ui.noResults) {
      ui.noResults.hidden = true;
    }
  }

  function openDecimalPlay() {
    if (ui.intro) {
      ui.intro.hidden = true;
    }
    if (ui.play) {
      ui.play.hidden = false;
    }
    ui.inputWhole?.focus();
  }

  function formatDisplayDigits(digits) {
    if (digits.length <= 18) {
      return digits;
    }
    return `${digits.slice(0, 18)}…`;
  }

  function exploreDecimals(wholeDigit, fracDigit) {
    const prefix = `${wholeDigit}.${fracDigit}`;
    return DECIMAL_CONSTANTS.filter((entry) => entry.digits.startsWith(prefix)).map((entry) => ({
      ...entry,
      prefix
    }));
  }

  function renderDecimalResults(matches, prefix) {
    if (!ui.results || !ui.prefix || !ui.noResults) {
      return;
    }

    ui.results.innerHTML = "";
    ui.prefix.textContent = GameI18n.t("numbersStarting", { prefix });
    ui.prefix.hidden = false;

    if (!matches.length) {
      ui.noResults.hidden = false;
      return;
    }

    ui.noResults.hidden = true;

    matches.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "decimal-result";

      const symbolWrap = document.createElement("div");
      symbolWrap.className = "decimal-result-symbol-wrap";

      const symbol = document.createElement("span");
      symbol.className = "decimal-result-symbol";
      symbol.textContent = entry.name;

      symbolWrap.appendChild(symbol);

      if (entry.label) {
        const label = document.createElement("span");
        label.className = "decimal-result-label";
        label.textContent = LABEL_KEYS[entry.label] ? GameI18n.t(LABEL_KEYS[entry.label]) : entry.label;
        symbolWrap.appendChild(label);
      }

      const value = document.createElement("span");
      value.className = "decimal-result-value";
      value.textContent = formatDisplayDigits(entry.digits);

      li.appendChild(symbolWrap);
      li.appendChild(value);

      if (entry.thanks) {
        const thanks = document.createElement("p");
        thanks.className = "decimal-thanks";
        thanks.textContent = GameI18n.t("thanks");
        li.appendChild(thanks);
      }

      ui.results.appendChild(li);
    });
  }

  function onDecimalSearch(event) {
    event.preventDefault();
    clampDigitInput(ui.inputWhole);
    clampDigitInput(ui.inputFrac);

    const whole = ui.inputWhole?.value ?? "";
    const frac = ui.inputFrac?.value ?? "";

    if (!/^[0-9]$/.test(whole) || !/^[0-9]$/.test(frac)) {
      alert(GameI18n.t("digitAlert"));
      return;
    }

    const matches = exploreDecimals(whole, frac);
    renderDecimalResults(matches, `${whole}.${frac}`);
  }

  function startBackgroundMusic() {
    if (window.AlgicosathlonMusic) {
      window.AlgicosathlonMusic.start();
    }
  }

  document.getElementById("btnPlay")?.addEventListener("click", () => {
    startBackgroundMusic();
    resetDecimalExplorer();
    showScreen("play");
  });

  document.getElementById("btnBackTitle")?.addEventListener("click", () => {
    resetDecimalExplorer();
    showScreen("title");
  });

  document.getElementById("btnDecimalPlay")?.addEventListener("click", () => {
    startBackgroundMusic();
    openDecimalPlay();
  });
  ui.form?.addEventListener("submit", onDecimalSearch);
  ui.inputWhole?.addEventListener("input", () => clampDigitInput(ui.inputWhole));
  ui.inputFrac?.addEventListener("input", () => clampDigitInput(ui.inputFrac));

  document.body.addEventListener("click", startBackgroundMusic, { once: true });
  document.body.addEventListener("keydown", startBackgroundMusic, { once: true });

  GameI18n.onChange(() => GameI18n.applyDom());
})();
