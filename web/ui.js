(function () {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const ROWS = ["QWERTZUIO", "ASDFGHJK", "PYXCVBNML"];
  const ROTOR_NAMES = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
  const MAX_PLUGS = 10;

  const $ = (id) => document.getElementById(id);

  let inputText = "";
  let outputText = "";
  let settingsValid = true;

  const lamps = {};
  const keys = {};

  function fillSelect(el, options) {
    for (const [value, label] of options) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      el.appendChild(opt);
    }
  }

  function buildSettings() {
    const rotorOptions = Object.keys(ROTOR_NAMES).map((k) => [k, ROTOR_NAMES[k]]);
    const letterOptions = [...LETTERS].map((c) => [c, c]);
    for (let i = 0; i < 3; i++) {
      fillSelect($("rotor" + i), rotorOptions);
      fillSelect($("ring" + i), letterOptions);
      fillSelect($("win" + i), letterOptions);
      $("rotor" + i).value = String(i + 1);
    }
  }

  function buildBoards() {
    for (const row of ROWS) {
      const lampRow = document.createElement("div");
      lampRow.className = "board-row";
      const keyRow = document.createElement("div");
      keyRow.className = "board-row";
      for (const c of row) {
        const lamp = document.createElement("div");
        lamp.className = "lamp";
        lamp.textContent = c;
        lamps[c] = lamp;
        lampRow.appendChild(lamp);

        const key = document.createElement("button");
        key.className = "key";
        key.textContent = c;
        key.type = "button";
        key.addEventListener("click", () => pressKey(c));
        keys[c] = key;
        keyRow.appendChild(key);
      }
      $("lampboard").appendChild(lampRow);
      $("keyboard").appendChild(keyRow);
    }
  }

  function parsePlugboard(text) {
    const tokens = text.toUpperCase().trim().split(/\s+/).filter(Boolean);
    if (tokens.length > MAX_PLUGS) {
      throw new Error("플러그보드는 최대 " + MAX_PLUGS + "쌍까지 가능합니다.");
    }
    const used = new Set();
    const pairs = [];
    for (const t of tokens) {
      if (!/^[A-Z]{2}$/.test(t)) {
        throw new Error("잘못된 플러그 쌍: " + t);
      }
      if (t[0] === t[1]) {
        throw new Error("같은 글자끼리는 연결할 수 없습니다: " + t);
      }
      for (const c of t) {
        if (used.has(c)) {
          throw new Error("글자가 중복 사용되었습니다: " + c);
        }
        used.add(c);
      }
      pairs.push([t[0], t[1]]);
    }
    return pairs;
  }

  function readSettings() {
    return {
      rotor_set: [$("rotor0").value, $("rotor1").value, $("rotor2").value],
      ring_set: [$("ring0").value, $("ring1").value, $("ring2").value],
      window_set: [$("win0").value, $("win1").value, $("win2").value],
      reflector_id: $("reflector").value,
      board_set: parsePlugboard($("plugboard").value),
    };
  }

  function setError(msg) {
    $("error").textContent = msg;
    settingsValid = !msg;
    for (const c in keys) keys[c].disabled = !settingsValid;
  }

  function renderWindows(window_set) {
    for (let i = 0; i < 3; i++) {
      const base = window_set[i].charCodeAt(0) - 65;
      const n = ((base + POS[i]) % 26 + 26) % 26;
      $("w" + i).textContent = String.fromCharCode(n + 65);
    }
  }

  function renderLamp(letter) {
    for (const c in lamps) lamps[c].classList.toggle("on", c === letter);
  }

  function renderTexts() {
    $("inputText").textContent = inputText;
    $("outputText").textContent = outputText;
  }

  function resetMachine() {
    inputText = "";
    outputText = "";
    reset();
    renderLamp(null);
    renderTexts();
    try {
      const s = readSettings();
      setError("");
      renderWindows(s.window_set);
    } catch (e) {
      setError(e.message);
    }
  }

  function pressKey(letter) {
    if (!settingsValid) return;
    let s;
    try {
      s = readSettings();
    } catch (e) {
      setError(e.message);
      return;
    }
    inputText += letter;
    outputText = encrypt(inputText, s.rotor_set, s.ring_set, s.window_set, s.reflector_id, s.board_set);
    renderWindows(s.window_set);
    renderLamp(outputText[outputText.length - 1]);
    renderTexts();
  }

  function flashKey(letter) {
    const key = keys[letter];
    if (!key) return;
    key.classList.add("pressed");
    setTimeout(() => key.classList.remove("pressed"), 100);
  }

  function bindEvents() {
    $("settings").addEventListener("change", resetMachine);
    $("plugboard").addEventListener("input", resetMachine);
    $("resetBtn").addEventListener("click", resetMachine);

    document.addEventListener("keydown", (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      const letter = e.key.toUpperCase();
      if (!LETTERS.includes(letter)) return;
      e.preventDefault();
      flashKey(letter);
      pressKey(letter);
    });
  }

  buildSettings();
  buildBoards();
  bindEvents();
  resetMachine();
})();
