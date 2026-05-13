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
  animId:       null,
  lastTime:     0,
  dropInterval: 1000,
};

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

function holdPiece() {
  if (!state.canHold) return;
  state.canHold = false;
  if (state.heldType === null) {
    state.heldType  = state.piece.type;
    state.piece     = state.nextPiece;
    state.nextPiece = randomPiece();
  } else {
    const prev     = state.heldType;
    state.heldType = state.piece.type;
    state.piece    = makePiece(prev);
  }
  if (!valid(state.piece)) state.gameOver = true;
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
  if (!cleared) return;
  const pts = [0, 100, 300, 500, 800];
  state.score += (pts[cleared] || 800) * state.level;
  state.lines += cleared;
  state.level        = Math.floor(state.lines / 10) + 1;
  state.dropInterval = Math.max(100, 1000 - (state.level - 1) * 90);
  if (state.score > state.hiScore) {
    state.hiScore = state.score;
    localStorage.setItem('tetris_hi', String(state.hiScore));
  }
}

function place() {
  state.piece.matrix.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) state.board[state.piece.y + r][state.piece.x + c] = state.piece.type;
    })
  );
  clearLines();
  state.canHold   = true;
  state.piece     = state.nextPiece;
  state.nextPiece = randomPiece();
  if (!valid(state.piece)) state.gameOver = true;
}

function initGame() {
  state.board        = newBoard();
  state.piece        = randomPiece();
  state.nextPiece    = randomPiece();
  state.heldType     = null;
  state.canHold      = true;
  state.score        = 0;
  state.level        = 1;
  state.lines        = 0;
  state.dropInterval = 1000;
  state.gameOver     = false;
  state.paused       = false;
  state.lastTime     = 0;
}
