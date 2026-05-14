// Depends on: constants.js

// Shared mutable game state — read/written by all modules
const state = {
  board:        null,
  piece:        null,
  nextPiece:    null,
  heldType:     null,
  canHold:      true,
  score:        0,
  level:        1,
  lines:        0,
  hiScore:      parseInt(localStorage.getItem('tetris_hi') || '0'),
  gameOver:     false,
  paused:       false,
  settingsOpen: false,
  animId:           null,
  lastTime:         0,
  isLocking:        false,
  lockTimer:        0,
  lineClearPending: false,
  lineClearTimer:   0,
};

function gravity() {
  return GRAVITY_MS[Math.min(state.level - 1, GRAVITY_MS.length - 1)];
}

function newBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function makePiece(type) {
  const matrix = PIECES[type].map(row => [...row]);
  return {
    type,
    matrix,
    x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2),
    y: 0,
  };
}

function randomPiece() {
  return makePiece(Math.floor(Math.random() * 7) + 1);
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function valid(p, dx = 0, dy = 0, mat = p.matrix) {
  return mat.every((row, r) =>
    row.every((val, c) => {
      if (!val) return true;
      const nx = p.x + c + dx;
      const ny = p.y + r + dy;
      return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !state.board[ny][nx];
    })
  );
}

function tryRotate() {
  const rot = rotate(state.piece.matrix);
  for (const dx of [0, 1, -1, 2, -2]) {
    if (valid(state.piece, dx, 0, rot)) {
      state.piece.matrix = rot;
      state.piece.x += dx;
      return;
    }
  }
}

function ghostY() {
  let dy = 0;
  while (valid(state.piece, 0, dy + 1)) dy++;
  return state.piece.y + dy;
}

function spawnNext() {
  state.piece     = state.nextPiece;
  state.nextPiece = randomPiece();
  state.canHold   = true;
  state.isLocking = false;
  if (!valid(state.piece)) { state.gameOver = true; return; }
  if (gravity() === 0) while (valid(state.piece, 0, 1)) state.piece.y++;
}

function holdPiece() {
  if (!state.canHold) return;
  state.canHold   = false;
  state.isLocking = false;
  if (state.heldType === null) {
    state.heldType  = state.piece.type;
    state.piece     = state.nextPiece;
    state.nextPiece = randomPiece();
  } else {
    const prev     = state.heldType;
    state.heldType = state.piece.type;
    state.piece    = makePiece(prev);
  }
  if (!valid(state.piece)) { state.gameOver = true; return; }
  if (gravity() === 0) while (valid(state.piece, 0, 1)) state.piece.y++;
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state.board[r].every(v => v)) {
      state.board.splice(r, 1);
      state.board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (!cleared) { spawnNext(); return; }
  const pts = [0, 100, 300, 500, 800];
  state.score += (pts[cleared] || 800) * state.level;
  state.lines += cleared;
  state.level  = Math.floor(state.lines / 10) + 1;
  if (state.score > state.hiScore) {
    state.hiScore = state.score;
    localStorage.setItem('tetris_hi', String(state.hiScore));
  }
  state.lineClearPending = true;
  state.lineClearTimer   = performance.now();
}

function place() {
  state.piece.matrix.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) state.board[state.piece.y + r][state.piece.x + c] = state.piece.type;
    })
  );
  state.piece     = null;
  state.isLocking = false;
  clearLines();
}

function initGame() {
  state.board            = newBoard();
  state.piece            = randomPiece();
  state.nextPiece        = randomPiece();
  state.heldType         = null;
  state.canHold          = true;
  state.score            = 0;
  state.level            = 1;
  state.lines            = 0;
  state.gameOver         = false;
  state.paused           = false;
  state.lastTime         = 0;
  state.isLocking        = false;
  state.lockTimer        = 0;
  state.lineClearPending = false;
  state.lineClearTimer   = 0;
}
