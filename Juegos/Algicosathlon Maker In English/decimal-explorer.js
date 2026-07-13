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

  const THANKS_MESSAGE = "¡Gracias José por crear este numero!";

  let showScreen = null;

  const ui = {
    intro: null,
    play: null,
    form: null,
    inputWhole: null,
    inputFrac: null,
    prefix: null,
    results: null,
    noResults: null
  };

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    ui.prefix.textContent = `Numbers starting with ${prefix}:`;
    ui.prefix.hidden = false;

    if (!matches.length) {
      ui.noResults.hidden = false;
      return;
    }

    ui.noResults.hidden = true;

    matches.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "decimal-result";

      const symbol = document.createElement("span");
      symbol.className = "decimal-result-symbol";
      symbol.textContent = entry.name;

      const value = document.createElement("span");
      value.className = "decimal-result-value";
      value.textContent = formatDisplayDigits(entry.digits);

      li.appendChild(symbol);
      li.appendChild(value);

      if (entry.thanks) {
        const thanks = document.createElement("p");
        thanks.className = "decimal-thanks";
        thanks.textContent = THANKS_MESSAGE;
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
      alert("Enter exactly one digit (0–9) for each field.");
      return;
    }

    const matches = exploreDecimals(whole, frac);
    renderDecimalResults(matches, `${whole}.${frac}`);
  }

  function bindEvents() {
    document.getElementById("btnAnotherGame")?.addEventListener("click", () => {
      if (showScreen) {
        showScreen("anotherGames");
      }
    });

    document.getElementById("btnBackFromAnotherGames")?.addEventListener("click", () => {
      if (showScreen) {
        showScreen("title");
      }
    });

    document.getElementById("btnOpenDecimalExplorer")?.addEventListener("click", () => {
      resetDecimalExplorer();
      if (showScreen) {
        showScreen("decimalExplorer");
      }
    });

    document.getElementById("btnBackFromDecimalExplorer")?.addEventListener("click", () => {
      resetDecimalExplorer();
      if (showScreen) {
        showScreen("anotherGames");
      }
    });

    document.getElementById("btnDecimalPlay")?.addEventListener("click", openDecimalPlay);
    ui.form?.addEventListener("submit", onDecimalSearch);

    ui.inputWhole?.addEventListener("input", () => clampDigitInput(ui.inputWhole));
    ui.inputFrac?.addEventListener("input", () => clampDigitInput(ui.inputFrac));
  }

  function init(navigate) {
    showScreen = navigate;

    ui.intro = document.getElementById("decimalExplorerIntro");
    ui.play = document.getElementById("decimalExplorerPlay");
    ui.form = document.getElementById("formDecimalSearch");
    ui.inputWhole = document.getElementById("inputDecimalWhole");
    ui.inputFrac = document.getElementById("inputDecimalFrac");
    ui.prefix = document.getElementById("decimalSearchPrefix");
    ui.results = document.getElementById("decimalResults");
    ui.noResults = document.getElementById("decimalNoResults");

    bindEvents();
  }

  window.DecimalExplorer = { init };
})();
