// Depends on: constants.js, game.js, settings.js

const boardCv = document.getElementById('board');
const ctx     = boardCv.getContext('2d');
const nextCv  = document.getElementById('next-cv');
const nextCtx = nextCv.getContext('2d');
const holdCv  = document.getElementById('hold-cv');
const holdCtx = holdCv.getContext('2d');

function updateUI() {
  document.getElementById('score').textContent   = state.score.toLocaleString();
  document.getElementById('hiscore').textContent = state.hiScore.toLocaleString();
  document.getElementById('level').textContent   = state.level;
  document.getElementById('lines').textContent   = state.lines;
}

function drawCell(c, r, color, context, size = CELL) {
  const x = c * size + 1, y = r * size + 1, w = size - 2, h = size - 2;
  if (settings.blockImg) {
    context.drawImage(settings.blockImg, x, y, w, h);
  } else {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
    context.fillStyle = 'rgba(255,255,255,0.18)';
    context.fillRect(x, y, w, 4);
    context.fillStyle = 'rgba(0,0,0,0.25)';
    context.fillRect(x, y + h - 4, w, 4);
  }
}

function drawMini(context, cv, type) {
  const ns = 22;
  context.clearRect(0, 0, cv.width, cv.height);
  if (type == null) return;
  const mat    = PIECES[type];
  const colors = themeColors();
  const ox     = Math.floor((cv.width  - mat[0].length * ns) / 2);
  const oy     = Math.floor((cv.height - mat.length    * ns) / 2);
  mat.forEach((row, r) =>
    row.forEach((val, c) => {
      if (!val) return;
      const x = ox + c * ns + 1, y = oy + r * ns + 1, s = ns - 2;
      if (settings.blockImg) {
        context.drawImage(settings.blockImg, x, y, s, s);
      } else {
        context.fillStyle = colors[type - 1];
        context.fillRect(x, y, s, s);
        context.fillStyle = 'rgba(255,255,255,0.2)';
        context.fillRect(x, y, s, 3);
      }
    })
  );
}

function draw() {
  ctx.clearRect(0, 0, boardCv.width, boardCv.height);

  // grid lines
  ctx.strokeStyle = '#1a1a3a';
  ctx.lineWidth   = 0.5;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);

  // placed blocks
  const colors = themeColors();
  state.board.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val) drawCell(c, r, colors[val - 1], ctx);
    })
  );

  if (state.piece) {
    // ghost
    const gy = ghostY();
    state.piece.matrix.forEach((row, r) =>
      row.forEach((val, c) => {
        if (!val) return;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(
          (state.piece.x + c) * CELL + 1,
          (gy + r) * CELL + 1,
          CELL - 2, CELL - 2
        );
      })
    );

    // active piece
    state.piece.matrix.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val) drawCell(
          state.piece.x + c,
          state.piece.y + r,
          colors[state.piece.type - 1],
          ctx
        );
      })
    );
  }

  // pause overlay on canvas
  if (state.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, boardCv.width, boardCv.height);
    ctx.fillStyle = '#fff';
    ctx.font      = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', boardCv.width / 2, boardCv.height / 2);
    ctx.textAlign = 'left';
  }

  drawMini(nextCtx, nextCv, state.nextPiece ? state.nextPiece.type : null);
  drawMini(holdCtx, holdCv, state.heldType);
  updateUI();
}
