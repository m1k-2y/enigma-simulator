# Enigma Simulator

Enigma M3 simulator with a Python core and a browser UI that renders the machine as a CSS 3D scene.

## Layout

| Path | What it is |
|------|------------|
| `src/core.py` | Rotor, reflector and plugboard logic (reference implementation) |
| `src/main.py` | `encrypt()` wrapper and CLI |
| `test/test_enigeuma.py` | pytest vectors for the Python core |
| `docs/core.js` | Line-for-line JavaScript port of `src/core.py` + `encrypt()` |
| `docs/ui.js` | Browser UI: settings, lampboard, keyboard, plugboard cables |
| `docs/index.html` | Page markup and the 3D scene styling |

**All web development happens in `docs/`.** It is the only copy of the browser app and is what GitHub Pages serves
(Settings → Pages → Source: `main` branch, `/docs` folder). There is no build step; open `docs/index.html` directly.

## Run

```bash
# Python core
python -m src.main
pytest

# Browser UI
xdg-open docs/index.html   # or any static server pointed at docs/
```

## Verify the JS port

```bash
node -e 'const {encrypt}=require("./docs/core.js");
console.log(encrypt("AAAAA",["1","2","3"],["A","A","A"],["A","A","A"],"B",[]));   // BDZGO
console.log(encrypt("AAAAA",["1","2","3"],["A","A","A"],["A","D","U"],"B",[]));   // EQIBM'
```
