'use strict';
const MAX_ATTEMPTS = 6;
const TERMS = [
  { word: 'CPU',              clue: 'Funcionário que nunca tira férias, só faz o que ta no manual' },
  { word: 'ULA',              clue: 'Calculadora de bolso do cérebro' },
  { word: 'UC',               clue: 'O maestro: não toca nenhum instrumento, mas conhece todos' },
  { word: 'REGISTRADORES',    clue: 'Os post-its do processador: pouquíssimos, mas colados bem em cima da mesa' },
  { word: 'RAM',              clue: 'Memória de peixe com mesa grande.' },
  { word: 'ROM',              clue: 'Os dez mandamentos: dá para ler quantas vezes quiser, mas ninguém reescreve' },
  { word: 'EEPROM',           clue: 'Caderno com borracha elétrica: apaga e reescreve sem precisar de luz para lembrar' },
  { word: 'FLASH',            clue: 'O tal do relâmpago vermelho, não esquece nada, nem no escuro, e cabe no seu pendrive' },
  { word: 'CACHE',            clue: 'Troco no bolso: pouco, mas você alcança na hora, sem pro banco' },
  { word: 'MEMORIADEMASSA',   clue: 'O armário do fundo de casa, cabe muita coisa, demora para buscar, e o que está lá fica' },
  { word: 'DMA',              clue: 'O entregador que leva a encomenda direto para a prateleira, sem incomodar o chefe' },
  { word: 'ADDRESSBUS',       clue: 'O endereço no envelope: diz para onde vai, mas nunca o que tem dentro' },
  { word: 'DATABUS',          clue: 'O caminhão de mudança: leva o conteúdo das caixas de um lugar para outro' },
  { word: 'MICROCONTROLADOR', clue: 'Um computador do tamanho de uma moeda especializado' },
  { word: 'DUALCORE',         clue: 'Os dois amigos que sempre fazem o trabalho junto' },
  { word: 'QUADCORE',         clue: 'O trabalho em grupo de verdade: quatro pessoas e todas trabalham' }
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

const STATUS_RANK = { absent: 1, present: 2, correct: 3 };

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

function evaluateGuess(guess, secret) {
  const result = Array(secret.length).fill('absent');
  const remaining = {};

  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      result[i] = 'correct';
    } else {
      remaining[secret[i]] = (remaining[secret[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < secret.length; i++) {
    if (result[i] === 'correct') continue;
    if (remaining[guess[i]] > 0) {
      result[i] = 'present';
      remaining[guess[i]]--;
    }
  }

  return result;
}

function updateKeyboardColors(guess, result) {
  for (let i = 0; i < guess.length; i++) {
    const letter  = guess[i];
    const current = state.keyStatus[letter];

    // Nunca "rebaixa" uma tecla: verde > amarelo > cinza
    if (!current || STATUS_RANK[result[i]] > STATUS_RANK[current]) {
      state.keyStatus[letter] = result[i];

      const keyEl = keyboardEl.querySelector(`.key[data-key="${letter}"]`);
      if (keyEl) {
        keyEl.classList.remove('correct', 'present', 'absent');
        keyEl.classList.add(result[i]);
      }
    }
  }
}

/* ---------- Envio e fim de rodada ---------- */

function submitGuess() {
  if (state.finished) return;

  if (state.guess.length < state.secret.length) {
    const rowEl = boardEl.children[state.row];
    rowEl.classList.remove('shake');
    void rowEl.offsetWidth; // reinicia a animação caso já esteja aplicada
    rowEl.classList.add('shake');
    showMessage(`A palavra tem ${state.secret.length} letras.`, 'error', 2000);
    return;
  }

  const result = evaluateGuess(state.guess, state.secret);

  result.forEach((status, col) => {
    getTile(state.row, col).classList.add(status);
  });
  updateKeyboardColors(state.guess, result);

  if (state.guess === state.secret) {
    endRound(true);
  } else if (state.row === MAX_ATTEMPTS - 1) {
    endRound(false);
  } else {
    state.row++;
    state.guess = '';
  }
}

function endRound(won) {
  state.finished = true;

  if (won) {
    state.found++;
    updateScore();
    showMessage('Acertou!', 'success');
  } else {
    showMessage(`Fim das tentativas. O termo era ${state.secret}.`, 'error');
  }

  const isLastTerm = state.position >= state.order.length - 1;

  if (isLastTerm) {
    showMessage(
      `Fim da lista! Você descobriu ${state.found} de ${TERMS.length} termos.`,
      'success'
    );
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

function goToNextTerm() {
  if (!state.finished) return;
  if (state.position >= state.order.length - 1) return;

  state.position++;
  loadRound();
}

/* ---------- Entrada (teclado físico e virtual) ---------- */

function handleKey(key) {
  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACKSPACE') {
    removeLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === 'Enter' && event.target.closest('.btn')) return;

  if (event.key === 'Enter') {
    event.preventDefault();
    handleKey('ENTER');
  } else if (event.key === 'Backspace') {
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

nextBtn.addEventListener('click', () => {
  goToNextTerm();
  nextBtn.blur(); // devolve a digitação ao teclado físico
});

restartBtn.addEventListener('click', () => {
  startGame();
  restartBtn.blur();
});


startGame();