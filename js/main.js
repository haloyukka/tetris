// Depends on: constants.js, game.js, settings.js, render.js

const overlay = document.getElementById('overlay');

// ─── Game loop ────────────────────────────────────────────────────────────────

function loop(ts) {
  if (!state.paused && !state.settingsOpen) {
    if (state.lineClearPending) {
      // ライン消去硬直: Lv20-23=150ms, Lv24+=50ms, それ以外=300ms
      const clearDelay = state.level >= 24 ? 50 : state.level >= 20 ? 150 : 300;
      if (ts - state.lineClearTimer > clearDelay) {
        state.lineClearPending = false;
        spawnNext();
      }
    } else if (state.isLocking) {
      // ロックディレイ: Lv24+=100ms, それ以外=500ms
      const lockDelay = state.level >= 24 ? 100 : 500;
      if (ts - state.lockTimer > lockDelay) place();
    } else if (state.piece) {
      const g = gravity();
      if (g === 0) {
        // 20G: 出現即接地 → ロック開始
        while (valid(state.piece, 0, 1)) state.piece.y++;
        state.isLocking = true;
        state.lockTimer = ts;
      } else if (ts - state.lastTime > g) {
        if (valid(state.piece, 0, 1)) state.piece.y++;
        else { state.isLocking = true; state.lockTimer = ts; }
        state.lastTime = ts;
      }
    }
  }
  draw();
  if (state.gameOver) { endGame(); return; }
  state.animId = requestAnimationFrame(loop);
}

function startGame() {
  initGame();
  overlay.style.display = 'none';
  cancelAnimationFrame(state.animId);
  state.animId = requestAnimationFrame(loop);
}

function endGame() {
  cancelAnimationFrame(state.animId);
  if (state.score > state.hiScore) {
    state.hiScore = state.score;
    localStorage.setItem('tetris_hi', String(state.hiScore));
  }
  overlay.innerHTML = `
    <h2>ゲームオーバー</h2>
    <p>スコア: ${state.score.toLocaleString()} &nbsp;|&nbsp; 最高: ${state.hiScore.toLocaleString()}</p>
    <button class="btn" id="start-btn">もう一度</button>
  `;
  overlay.style.display = 'flex';
  document.getElementById('start-btn').addEventListener('click', startGame);
}

// ─── Input ────────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (overlay.style.display !== 'none') {
    if (e.code === 'Space') { e.preventDefault(); startGame(); }
    return;
  }
  if (state.settingsOpen || state.gameOver || state.lineClearPending) return;

  if (e.code === 'KeyP') { state.paused = !state.paused; draw(); return; }
  if (state.paused) return;

  switch (e.code) {
    case 'ArrowLeft':
      if (valid(state.piece, -1, 0)) {
        state.piece.x--;
        if (gravity() === 0) {
          while (valid(state.piece, 0, 1)) state.piece.y++;
          state.lockTimer = performance.now();
        } else if (state.isLocking && valid(state.piece, 0, 1)) {
          state.isLocking = false;
        }
        draw();
      }
      break;
    case 'ArrowRight':
      if (valid(state.piece, 1, 0)) {
        state.piece.x++;
        if (gravity() === 0) {
          while (valid(state.piece, 0, 1)) state.piece.y++;
          state.lockTimer = performance.now();
        } else if (state.isLocking && valid(state.piece, 0, 1)) {
          state.isLocking = false;
        }
        draw();
      }
      break;
    case 'ArrowDown':
      if (valid(state.piece, 0, 1)) {
        state.piece.y++;
        state.score++;
        draw();
      } else if (!state.isLocking) {
        state.isLocking = true;
        state.lockTimer = performance.now();
        draw();
      }
      break;
    case 'ArrowUp':
      tryRotate();
      if (gravity() === 0) {
        while (valid(state.piece, 0, 1)) state.piece.y++;
        state.lockTimer = performance.now();
      } else if (state.isLocking && valid(state.piece, 0, 1)) {
        state.isLocking = false;
      }
      draw();
      break;
    case 'Space':
      e.preventDefault();
      {
        const dy = ghostY() - state.piece.y;
        state.piece.y  += dy;
        state.score    += dy * 2;
        state.isLocking = false;
        place();
        if (state.gameOver) endGame();
        else draw();
      }
      break;
    case 'KeyC':
    case 'ShiftLeft':
    case 'ShiftRight':
      holdPiece();
      if (state.gameOver) endGame();
      else draw();
      break;
  }
});

document.getElementById('pause-btn').addEventListener('click', () => {
  if (state.gameOver || overlay.style.display !== 'none' || state.settingsOpen) return;
  state.paused = !state.paused;
  draw();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

loadSettings();
initThemeButtons();
updateUI();
bindSettingsEvents();

document.getElementById('start-btn').addEventListener('click', startGame);
