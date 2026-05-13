# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

Open `index.html` directly in any modern browser — no build step, server, or dependencies required.

## Architecture

Single-file application: all HTML, CSS, and JavaScript are in `index.html`.

### Canvas
- Main board: 300×600 px canvas (10 cols × 20 rows, 30 px cells — `COLS`, `ROWS`, `CELL`)
- Next-piece preview: 120×80 px canvas

### Game State
Core mutable state: `board` (20×10 number grid), `piece`, `nextPiece`, `score`, `level`, `lines`, `dropInterval`, `gameOver`, `paused`.

### Key Functions
- `newBoard()` / `randomPiece()` — initialization
- `valid(p, dx, dy, mat)` — collision detection (walls + locked cells)
- `rotate(matrix)` — 90° clockwise via transpose + row-reverse
- `ghostY()` — finds the landing row for the ghost piece
- `place()` — locks active piece, calls `clearLines()`, spawns next
- `clearLines()` — removes full rows, updates score/level/speed
- `draw()` — renders board, ghost piece, active piece, and preview canvas
- `loop(ts)` — `requestAnimationFrame` game loop driving gravity

### Scoring & Speed
- Lines cleared (1/2/3/4): 100/300/500/800 × level
- Soft drop +1 pt/cell; hard drop +2 pt/cell
- Level increments every 10 lines; drop interval = `Math.max(100, 1000 − (level−1)×90)` ms
