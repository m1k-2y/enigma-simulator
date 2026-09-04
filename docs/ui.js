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

        const post = document.createElement("div");
        post.className = "key-post";
        const key = document.createElement("button");
        key.className = "key";
        key.textContent = c;
        key.type = "button";
        key.addEventListener("click", () => pressKey(c));
        post.appendChild(key);
        keys[c] = post;
        keyRow.appendChild(post);
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

  // ---- plug pairs: single source of truth, mirrored to jacks and the text field ----

  function pairsToText(pairs) {
    return pairs.map((p) => p[0] + p[1]).join(" ");
  }

  function parsePlugText(text) {
    const tokens = text.toUpperCase().trim().split(/\s+/).filter(Boolean);
    const used = new Set();
    const pairs = [];
    for (const t of tokens) {
      if (!/^[A-Z]{1,2}$/.test(t)) return { pairs: null, error: "잘못된 입력: " + t };
      if (t.length === 1) continue;
      if (t[0] === t[1]) return { pairs: null, error: "같은 글자끼리는 연결할 수 없습니다: " + t };
      for (const c of t) {
        if (used.has(c)) return { pairs: null, error: "글자가 중복 사용되었습니다: " + c };
        used.add(c);
      }
      pairs.push([t[0], t[1]]);
    }
    if (pairs.length > MAX_PLUGS) return { pairs: null, error: "플러그보드는 최대 " + MAX_PLUGS + "쌍까지 가능합니다." };
    return { pairs: pairs, error: null };
  }

  function setPlugError(msg) {
    $("plugError").textContent = msg || "";
  }

  function setPairs(pairs, fromText) {
    const changed = pairsToText(pairs) !== pairsToText(plugPairs);
    plugPairs = pairs.map((p) => [p[0], p[1]]);
    pendingJack = null;
    if (!fromText) {
      $("plugText").value = pairsToText(plugPairs);
      setPlugError("");
    }
    renderPlugboard();
    if (changed) resetMachine();
  }

  function pairIndexOf(letter) {
    return plugPairs.findIndex((p) => p[0] === letter || p[1] === letter);
  }

  function clickJack(letter) {
    if (pairIndexOf(letter) !== -1) return;
    if (pendingJack === letter) {
      pendingJack = null;
      renderPlugboard();
    } else if (pendingJack === null) {
      if (plugPairs.length >= MAX_PLUGS) return;
      pendingJack = letter;
      renderPlugboard();
    } else {
      setPairs(plugPairs.concat([[pendingJack, letter]]), false);
    }
  }

  function removePair(index) {
    setPairs(plugPairs.filter((_, i) => i !== index), false);
  }

  function clearPlugboard() {
    setPairs([], false);
  }

  function onPlugTextInput() {
    const r = parsePlugText($("plugText").value);
    setPlugError(r.error);
    if (!r.error) setPairs(r.pairs, true);
  }

  function onPlugTextChange() {
    const r = parsePlugText($("plugText").value);
    if (!r.error) $("plugText").value = pairsToText(plugPairs);
  }

  // ---- cables: layout coordinates (offset*), so CSS transforms on ancestors do not matter ----

  function localPos(el, root) {
    let x = 0, y = 0;
    while (el && el !== root) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return { x: x, y: y };
  }

  function jackCenter(letter) {
    const jack = jacks[letter];
    const p = localPos(jack, $("plugboard"));
    return { x: p.x + jack.offsetWidth / 2, y: p.y + jack.offsetHeight / 2 };
  }

  function cablePath(a, b) {
    const sag = 26 + Math.abs(a.x - b.x) * 0.12;
    return "M" + a.x + "," + a.y +
      " C" + a.x + "," + (a.y + sag) + " " + b.x + "," + (b.y + sag) + " " + b.x + "," + b.y;
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function renderCables() {
    const svg = $("cables");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    plugPairs.forEach((pair, index) => {
      const a = jackCenter(pair[0]);
      const b = jackCenter(pair[1]);
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

  // ---- machine ----

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

  function renderReflector(reflector_id) {
    $("ukw").textContent = reflector_id;
  }

  function resetMachine() {
    inputText = "";
    outputText = "";
    reset();
    renderLamp(null);
    renderTexts();
    const s = readSettings();
    renderWindows(s.window_set);
    renderReflector(s.reflector_id);
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

  function bindEvents() {
    $("settings").addEventListener("change", (e) => {
      if (e.target.tagName === "SELECT") resetMachine();
    });
    $("resetBtn").addEventListener("click", resetMachine);
    $("clearPlugsBtn").addEventListener("click", clearPlugboard);
    $("plugText").addEventListener("input", onPlugTextInput);
    $("plugText").addEventListener("change", onPlugTextChange);
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
