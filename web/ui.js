(function () {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const ROWS = ["QWERTZUIO", "ASDFGHJK", "PYXCVBNML"];
  const ROTOR_NAMES = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
  const MAX_PLUGS = 10;
  const SVG_NS = "http://www.w3.org/2000/svg";

  const $ = (id) => document.getElementById(id);

  let inputText = "";
  let outputText = "";
  let plugPairs = [];
  let pendingJack = null;

  const lamps = {};
  const keys = {};
  const jacks = {};

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

  function buildPlugboard() {
    for (const row of ROWS) {
      const jackRow = document.createElement("div");
      jackRow.className = "jack-row";
      for (const c of row) {
        const jack = document.createElement("button");
        jack.className = "jack";
        jack.type = "button";
        jack.dataset.letter = c;
        jack.textContent = c;
        jack.addEventListener("click", () => clickJack(c));
        jacks[c] = jack;
        jackRow.appendChild(jack);
      }
      $("jacks").appendChild(jackRow);
    }
  }

  function pairIndexOf(letter) {
    return plugPairs.findIndex((p) => p[0] === letter || p[1] === letter);
  }

  function clickJack(letter) {
    if (pairIndexOf(letter) !== -1) return;
    if (pendingJack === letter) {
      pendingJack = null;
    } else if (pendingJack === null) {
      if (plugPairs.length >= MAX_PLUGS) return;
      pendingJack = letter;
    } else {
      plugPairs.push([pendingJack, letter]);
      pendingJack = null;
      resetMachine();
    }
    renderPlugboard();
  }

  function removePair(index) {
    plugPairs.splice(index, 1);
    pendingJack = null;
    resetMachine();
    renderPlugboard();
  }

  function jackCenter(letter, base) {
    const r = jacks[letter].getBoundingClientRect();
    return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
  }

  function cablePath(a, b) {
    const sag = 26 + Math.abs(a.x - b.x) * 0.12;
    const c1 = { x: a.x, y: a.y + sag };
    const c2 = { x: b.x, y: b.y + sag };
    return "M" + a.x + "," + a.y + " C" + c1.x + "," + c1.y + " " + c2.x + "," + c2.y + " " + b.x + "," + b.y;
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function renderCables() {
    const svg = $("cables");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const base = svg.getBoundingClientRect();
    plugPairs.forEach((pair, index) => {
      const a = jackCenter(pair[0], base);
      const b = jackCenter(pair[1], base);
      const d = cablePath(a, b);
      const g = svgEl("g", { class: "cable" });
      g.appendChild(svgEl("path", { class: "cable-shadow", d: d }));
      g.appendChild(svgEl("path", { class: "cable-line", d: d }));
      g.appendChild(svgEl("circle", { class: "plug", cx: a.x, cy: a.y, r: 6 }));
      g.appendChild(svgEl("circle", { class: "plug", cx: b.x, cy: b.y, r: 6 }));
      const hit = svgEl("path", { class: "cable-hit", d: d });
      hit.addEventListener("click", () => removePair(index));
      g.appendChild(hit);
      svg.appendChild(g);
    });
  }

  function renderPlugboard() {
    const full = plugPairs.length >= MAX_PLUGS;
    for (const c in jacks) {
      const used = pairIndexOf(c) !== -1;
      jacks[c].classList.toggle("used", used);
      jacks[c].classList.toggle("pending", pendingJack === c);
      jacks[c].disabled = used || (full && pendingJack === null);
    }
    $("plugCount").textContent = plugPairs.length + " / " + MAX_PLUGS;
    renderCables();
  }

  function readSettings() {
    return {
      rotor_set: [$("rotor0").value, $("rotor1").value, $("rotor2").value],
      ring_set: [$("ring0").value, $("ring1").value, $("ring2").value],
      window_set: [$("win0").value, $("win1").value, $("win2").value],
      reflector_id: $("reflector").value,
      board_set: plugPairs.map((p) => [p[0], p[1]]),
    };
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
    renderWindows(readSettings().window_set);
  }

  function pressKey(letter) {
    const s = readSettings();
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

  function clearPlugboard() {
    plugPairs = [];
    pendingJack = null;
    renderPlugboard();
  }

  function bindEvents() {
    $("settings").addEventListener("change", resetMachine);
    $("resetBtn").addEventListener("click", resetMachine);
    $("clearPlugsBtn").addEventListener("click", () => {
      clearPlugboard();
      resetMachine();
    });
    window.addEventListener("resize", renderCables);

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
  buildPlugboard();
  bindEvents();
  renderPlugboard();
  resetMachine();
})();
