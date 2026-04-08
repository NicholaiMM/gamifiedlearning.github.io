/**
 * The Seven Stars – Match-3 Game Engine
 * 6×6 grid, score target 1000 → narrative reveal (suspect: Marcus)
 */
'use strict';

(function () {

  // ── Constants ──────────────────────────────────────────
  const ROWS          = 6;
  const COLS          = 6;
  const WIN_SCORE     = 1000;
  const MOVES_INIT    = 30;
  const MATCH_POINTS  = { 3: 50, 4: 100, 5: 200 };
  const SYMBOLS = ['🔴','🔵','🟢','🟡','🟣','⭐'];

  // ── State ─────────────────────────────────────────────
  let board      = [];   // 2-D array of symbol indices (0–5)
  let score      = 0;
  let moves      = MOVES_INIT;
  let selected   = null; // { r, c }
  let busy       = false;

  // ── DOM refs ──────────────────────────────────────────
  const boardEl      = document.getElementById('board');
  const scoreEl      = document.getElementById('score-val');
  const movesEl      = document.getElementById('moves-val');
  const barFill      = document.getElementById('bar-fill');
  const msgEl        = document.getElementById('msg');
  const winOverlay   = document.getElementById('win-overlay');
  const btnRestart   = document.getElementById('btn-restart');
  const btnRestart2  = document.getElementById('btn-restart2');

  // ── Init ──────────────────────────────────────────────
  function init() {
    score    = 0;
    moves    = MOVES_INIT;
    selected = null;
    busy     = false;
    board    = buildBoard();
    updateHUD();
    render();
    setMsg('Select two adjacent gems to swap.', '');
  }

  function buildBoard() {
    let b;
    do {
      b = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => randSym())
      );
    } while (findMatches(b).length > 0);  // start with no pre-existing matches
    return b;
  }

  function randSym() { return Math.floor(Math.random() * SYMBOLS.length); }

  // ── Rendering ─────────────────────────────────────────
  function render() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = SYMBOLS[board[r][c]];
        cell.dataset.r = r;
        cell.dataset.c = c;
        if (selected && selected.r === r && selected.c === c) {
          cell.classList.add('selected');
        }
        cell.addEventListener('click', onCellClick);
        boardEl.appendChild(cell);
      }
    }
  }

  function cellEl(r, c) {
    return boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  }

  // ── Click handling ────────────────────────────────────
  function onCellClick(e) {
    if (busy) return;
    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;

    if (!selected) {
      selected = { r, c };
      render();
      setMsg('Now select an adjacent gem.', 'info');
    } else if (selected.r === r && selected.c === c) {
      selected = null;
      render();
      setMsg('Selection cleared.', '');
    } else if (isAdjacent(selected, { r, c })) {
      const prev = selected;
      selected = null;
      doSwap(prev.r, prev.c, r, c);
    } else {
      selected = { r, c };
      render();
      setMsg('Not adjacent – pick a neighbour.', 'bad');
    }
  }

  function isAdjacent(a, b) {
    return (Math.abs(a.r - b.r) + Math.abs(a.c - b.c)) === 1;
  }

  // ── Swap & match pipeline ─────────────────────────────
  async function doSwap(r1, c1, r2, c2) {
    busy = true;
    swap(r1, c1, r2, c2);
    render();

    const matches = findMatches(board);
    if (matches.length === 0) {
      // invalid swap – revert
      swap(r1, c1, r2, c2);
      render();
      setMsg('No match found – try again.', 'bad');
      busy = false;
      return;
    }

    moves--;
    updateHUD();
    await resolveMatches();
    busy = false;

    if (score >= WIN_SCORE) {
      showWin();
      return;
    }
    if (moves <= 0) {
      setMsg('Out of moves! Restarting…', 'bad');
      await delay(1500);
      init();
    }
  }

  function swap(r1, c1, r2, c2) {
    const tmp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tmp;
  }

  async function resolveMatches() {
    let matches = findMatches(board);
    while (matches.length > 0) {
      // Animate matched cells
      const matchedSet = new Set(matches.map(([r, c]) => `${r},${c}`));
      matchedSet.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        const el = cellEl(r, c);
        if (el) el.classList.add('matched');
      });

      // Score
      const grouped = groupMatches(matches);
      grouped.forEach(len => {
        const pts = MATCH_POINTS[Math.min(len, 5)] || MATCH_POINTS[5];
        score = Math.min(score + pts, WIN_SCORE);
      });
      updateHUD();
      setMsg(`+${grouped.reduce((a, l) => a + (MATCH_POINTS[Math.min(l, 5)] || MATCH_POINTS[5]), 0)} pts`, 'good');

      await delay(380);

      // Remove matched
      matchedSet.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        board[r][c] = -1; // empty
      });

      // Gravity
      applyGravity();
      render();

      // Animate new cells falling
      boardEl.querySelectorAll('.cell').forEach(el => {
        if (el.textContent !== '') el.classList.add('fall');
      });

      await delay(300);
      matches = findMatches(board);
    }
  }

  // ── Match detection ───────────────────────────────────
  function findMatches(b) {
    const matched = new Set();
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 3; c++) {
        const sym = b[r][c];
        if (sym < 0) continue;
        let len = 1;
        while (c + len < COLS && b[r][c + len] === sym) len++;
        if (len >= 3) {
          for (let k = 0; k < len; k++) matched.add(`${r},${c + k}`);
        }
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 3; r++) {
        const sym = b[r][c];
        if (sym < 0) continue;
        let len = 1;
        while (r + len < ROWS && b[r + len][c] === sym) len++;
        if (len >= 3) {
          for (let k = 0; k < len; k++) matched.add(`${r + k},${c}`);
        }
      }
    }
    return [...matched].map(k => k.split(',').map(Number));
  }

  function groupMatches(matches) {
    // Group matches into horizontal and vertical runs, return their lengths
    const cellSet = new Set(matches.map(([r, c]) => `${r},${c}`));
    const visited = new Set();
    const runs = [];

    matches.forEach(([r, c]) => {
      const key = `${r},${c}`;
      if (visited.has(key)) return;

      // Try horizontal run
      if (!visited.has(`${r},${c - 1}`) && cellSet.has(`${r},${c + 1}`)) {
        let len = 1;
        while (cellSet.has(`${r},${c + len}`)) {
          visited.add(`${r},${c + len}`);
          len++;
        }
        visited.add(key);
        runs.push(len);
        return;
      }

      // Try vertical run
      if (!visited.has(`${r - 1},${c}`) && cellSet.has(`${r + 1},${c}`)) {
        let len = 1;
        while (cellSet.has(`${r + len},${c}`)) {
          visited.add(`${r + len},${c}`);
          len++;
        }
        visited.add(key);
        runs.push(len);
        return;
      }

      // Isolated cell (part of a cross-match already counted)
      visited.add(key);
    });

    return runs.length > 0 ? runs : [Math.min(matches.length, 5)];
  }

  // ── Gravity (drop tiles down) ─────────────────────────
  function applyGravity() {
    for (let c = 0; c < COLS; c++) {
      // Collect non-empty
      const col = [];
      for (let r = 0; r < ROWS; r++) {
        if (board[r][c] >= 0) col.push(board[r][c]);
      }
      // Fill from bottom, new tiles on top
      for (let r = ROWS - 1; r >= 0; r--) {
        board[r][c] = col.length > 0 ? col.pop() : randSym();
      }
    }
  }

  // ── HUD ───────────────────────────────────────────────
  function updateHUD() {
    scoreEl.textContent = score;
    movesEl.textContent = moves;
    const pct = Math.min((score / WIN_SCORE) * 100, 100);
    barFill.style.width = pct + '%';
  }

  function setMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className   = 'msg-area' + (type ? ` ${type}` : '');
  }

  // ── Win ───────────────────────────────────────────────
  function showWin() {
    winOverlay.classList.add('active');
  }

  // ── Helpers ───────────────────────────────────────────
  function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

  // ── Event listeners ───────────────────────────────────
  btnRestart.addEventListener('click', init);
  btnRestart2.addEventListener('click', () => {
    winOverlay.classList.remove('active');
    init();
  });

  // ── Start ─────────────────────────────────────────────
  init();

}());
