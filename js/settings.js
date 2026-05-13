// Depends on: constants.js, game.js

const settings = {
  currentTheme: 'Classic',
  blockImg:     null,
};

function themeColors() {
  return THEME_COLORS[settings.currentTheme];
}

function loadSettings() {
  settings.currentTheme = localStorage.getItem('tetris_theme') || 'Classic';
  const savedBg    = localStorage.getItem('tetris_bg');
  const savedBlock = localStorage.getItem('tetris_block');
  if (savedBg)    applyBg(savedBg, false);
  if (savedBlock) applyBlockImg(savedBlock, false);
}

function applyBg(dataUrl, save = true) {
  document.body.style.backgroundImage = dataUrl ? `url(${dataUrl})` : '';
  const prev = document.getElementById('bg-prev');
  if (dataUrl) { prev.src = dataUrl; prev.style.display = 'block'; }
  else           prev.style.display = 'none';
  if (save) {
    if (dataUrl) localStorage.setItem('tetris_bg', dataUrl);
    else         localStorage.removeItem('tetris_bg');
  }
}

function applyBlockImg(dataUrl, save = true) {
  const prev = document.getElementById('block-prev');
  if (!dataUrl) {
    settings.blockImg  = null;
    prev.style.display = 'none';
    if (save) localStorage.removeItem('tetris_block');
    return;
  }
  const img  = new Image();
  img.onload = () => { settings.blockImg = img; };
  img.src    = dataUrl;
  prev.src   = dataUrl;
  prev.style.display = 'block';
  if (save) localStorage.setItem('tetris_block', dataUrl);
}

function initThemeButtons() {
  const container = document.getElementById('theme-btns');
  container.innerHTML = '';
  Object.keys(THEME_COLORS).forEach(name => {
    const btn       = document.createElement('button');
    btn.className   = 'theme-btn' + (name === settings.currentTheme ? ' active' : '');
    btn.textContent = name;
    btn.onclick = () => {
      settings.currentTheme = name;
      localStorage.setItem('tetris_theme', name);
      container.querySelectorAll('.theme-btn').forEach(b =>
        b.classList.toggle('active', b.textContent === name)
      );
    };
    container.appendChild(btn);
  });
}

function bindSettingsEvents() {
  const modal = document.getElementById('settings-modal');

  document.getElementById('settings-btn').addEventListener('click', () => {
    state.settingsOpen = true;
    modal.classList.add('open');
  });

  document.getElementById('close-settings').addEventListener('click', () => {
    state.settingsOpen = false;
    modal.classList.remove('open');
  });

  document.getElementById('bg-upload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('10MB以内の画像を選択してください'); return; }
    const reader  = new FileReader();
    reader.onload = ev => applyBg(ev.target.result);
    reader.readAsDataURL(file);
  });

  document.getElementById('reset-bg').addEventListener('click', () => {
    applyBg(null);
    document.getElementById('bg-upload').value = '';
  });

  document.getElementById('block-upload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('10MB以内の画像を選択してください'); return; }
    const reader  = new FileReader();
    reader.onload = ev => applyBlockImg(ev.target.result);
    reader.readAsDataURL(file);
  });

  document.getElementById('reset-block').addEventListener('click', () => {
    applyBlockImg(null);
    document.getElementById('block-upload').value = '';
  });
}
