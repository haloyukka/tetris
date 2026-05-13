# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

Open `index.html` directly in any modern browser — no build step, server, or dependencies required.

## Architecture

ES modules, no bundler. Entry point: `js/main.js` loaded via `<script type="module">`.

```
tetris/
├── index.html          # HTML structure only
├── css/style.css       # all styles
└── js/
    ├── constants.js    # COLS, ROWS, CELL, THEME_COLORS, PIECES
    ├── game.js         # shared `state` object + pure game logic
    ├── settings.js     # customization state, LocalStorage, settings UI events
    ├── render.js       # canvas drawing (draw, updateUI)
    └── main.js         # game loop, input handlers, wires all modules together
```

Dependency order (no circular imports):
`constants` ← `game` ← `settings` ← `render` ← `main`

### Canvas
- Main board: 300×600 px (`COLS=10`, `ROWS=20`, `CELL=30`)
- NEXT / HOLD mini-canvases: 96×72 px each

### Game State (`js/game.js` — `state` object)
`board`, `piece`, `nextPiece`, `heldType`, `canHold`, `score`, `level`, `lines`, `hiScore`, `dropInterval`, `gameOver`, `paused`, `settingsOpen`

### Key Functions
| File | Function | Purpose |
|---|---|---|
| `game.js` | `valid(p, dx, dy, mat)` | Collision detection |
| `game.js` | `tryRotate()` | Rotation with wall-kick (±2 cells) |
| `game.js` | `ghostY()` | Landing row preview |
| `game.js` | `place()` → `clearLines()` | Lock piece, clear rows, update score |
| `game.js` | `holdPiece()` | HOLD mechanic |
| `game.js` | `initGame()` | Reset all state for new game |
| `render.js` | `draw()` | Full frame render (board + ghost + pieces + mini canvases + UI) |
| `settings.js` | `loadSettings()` | Read theme / images from LocalStorage |
| `settings.js` | `applyBg()` / `applyBlockImg()` | Apply and persist customizations |
| `main.js` | `loop(ts)` | rAF game loop |
| `main.js` | `startGame()` / `endGame()` | Game lifecycle + overlay management |

### Scoring & Speed
- Lines cleared (1/2/3/4): 100/300/500/800 × level
- Soft drop +1 pt/cell; hard drop +2 pt/cell
- Level up every 10 lines; drop interval = `Math.max(100, 1000 − (level−1)×90)` ms
- High score persisted in `localStorage` key `tetris_hi`

### Customization (LocalStorage keys)
| Key | Content |
|---|---|
| `tetris_theme` | Selected theme name |
| `tetris_bg` | Background image as base64 data URL |
| `tetris_block` | Block image as base64 data URL |
| `tetris_hi` | High score (number) |
