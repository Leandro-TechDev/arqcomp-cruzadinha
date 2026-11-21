'use strict';
const MAX_ATTEMPTS = 6;
// Temporário
const TERMS = [
  { word: 'CPU',      clue: 'Pista de teste: unidade que executa as instruções.' },
  { word: 'ULA',      clue: 'Pista de teste: faz as operações aritméticas e lógicas.' },
  { word: 'DUALCORE', clue: 'Pista de teste: processador com dois núcleos.' }
];

const boardEl      = document.getElementById('board');
const keyboardEl   = document.getElementById('keyboard');
const clueTextEl   = document.getElementById('clue-text');
const wordLengthEl = document.getElementById('word-length');
const messageEl    = document.getElementById('message');
const scoreFoundEl = document.getElementById('score-found');
const scoreTotalEl = document.getElementById('score-total');
const nextBtn      = document.getElementById('btn-next');
const restartBtn   = document.getElementById('btn-restart');

const state = {
  order: [],        // ordem embaralhada dos índices de TERMS
  position: 0,      // posição atual dentro de "order"
  secret: '',       // palavra secreta da rodada
  row: 0,           // linha (tentativa) atual
  guess: '',        // texto digitado na linha atual
  finished: false,  // rodada encerrada (vitória ou derrota)
  found: 0,         // termos descobertos
  keyStatus: {}     // melhor estado de cada letra: 'absent' | 'present' | 'correct'
};

let messageTimer = null;
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getTile(row, col) {
  return boardEl.children[row].children[col];
}

function showMessage(text, type = '', autoClearMs = 0) {
  clearTimeout(messageTimer);
  messageEl.textContent = text;
  messageEl.className = 'message' + (type ? ` message--${type}` : '');
  if (autoClearMs > 0) {
    messageTimer = setTimeout(() => showMessage(''), autoClearMs);
  }
}

function updateScore() {
  scoreFoundEl.textContent = state.found;
  scoreTotalEl.textContent = TERMS.length;
}

function buildBoard(columns) {
  boardEl.style.setProperty('--cols', columns);
  boardEl.innerHTML = '';

  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    for (let c = 0; c < columns; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      rowEl.appendChild(tile);
    }
    boardEl.appendChild(rowEl);
  }
}

function resetKeyboard() {
  state.keyStatus = {};
  keyboardEl.querySelectorAll('.key').forEach((key) => {
    key.classList.remove('correct', 'present', 'absent');
  });
}

function loadRound() {
  const term = TERMS[state.order[state.position]];

  state.secret   = term.word;
  state.row      = 0;
  state.guess    = '';
  state.finished = false;

  clueTextEl.textContent   = term.clue;
  wordLengthEl.textContent = term.word.length;

  showMessage('');
  buildBoard(term.word.length);
  resetKeyboard();
  nextBtn.disabled = true;
}

function startGame() {
  const indexes = [];
  for (let i = 0; i < TERMS.length; i++) {
    indexes.push(i);
  }
  state.order = shuffle(indexes);
  state.position = 0;
  state.found    = 0;
  updateScore();
  loadRound();
}

/* ---------- Digitação ---------- */

function addLetter(letter) {
  if (state.finished || state.guess.length >= state.secret.length) return;

  const tile = getTile(state.row, state.guess.length);
  tile.textContent = letter;
  tile.classList.add('filled', 'pop');
  tile.addEventListener('animationend', () => tile.classList.remove('pop'), { once: true });

  state.guess += letter;
}

function removeLetter() {
  if (state.finished || state.guess.length === 0) return;

  state.guess = state.guess.slice(0, -1);
  const tile = getTile(state.row, state.guess.length);
  tile.textContent = '';
  tile.classList.remove('filled');
}

/* ---------- Entrada (teclado físico e virtual) ---------- */

function handleKey(key) {
  if (key === 'BACKSPACE') {
    removeLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === 'Backspace') {
    handleKey('BACKSPACE');
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    handleKey(event.key.toUpperCase());
  }
});

keyboardEl.addEventListener('click', (event) => {
  const keyEl = event.target.closest('.key');
  if (!keyEl) return;

  handleKey(keyEl.dataset.key);
  keyEl.blur(); // devolve a digitação ao teclado físico
});

restartBtn.addEventListener('click', () => {
  startGame();
  restartBtn.blur();
});


startGame();