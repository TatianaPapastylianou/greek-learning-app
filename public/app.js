// App state
let currentScreen = 'home';
let groups = [];
let currentGroup = null;
let gameState = null;
let selectedWord = null;
let editPassword = null;

// --- Helpers ---

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Styled modal dialogs ---

function closeModal(modal) {
  modal.classList.remove('active');
  setTimeout(() => modal.remove(), 100);
}

function showAlert(message, { title = 'Notice', okLabel = 'OK' } = {}) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button type="button" class="primary" data-ok>${escapeHtml(okLabel)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const okBtn = modal.querySelector('[data-ok]');
    const done = () => { closeModal(modal); resolve(); };
    okBtn.addEventListener('click', done);
    modal.addEventListener('click', (e) => { if (e.target === modal) done(); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        document.removeEventListener('keydown', onKey);
        done();
      }
    });
    setTimeout(() => okBtn.focus(), 20);
  });
}

function showPrompt(message, {
  title = 'Enter value',
  placeholder = '',
  type = 'text',
  okLabel = 'OK',
  cancelLabel = 'Cancel',
  okClass = 'primary'
} = {}) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <input type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" data-input>
        <div class="modal-actions">
          <button type="button" class="secondary" data-cancel>${escapeHtml(cancelLabel)}</button>
          <button type="button" class="${escapeHtml(okClass)}" data-ok>${escapeHtml(okLabel)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const input = modal.querySelector('[data-input]');
    const okBtn = modal.querySelector('[data-ok]');
    const cancelBtn = modal.querySelector('[data-cancel]');
    const resolveWith = (val) => { closeModal(modal); resolve(val); };
    okBtn.addEventListener('click', () => resolveWith(input.value));
    cancelBtn.addEventListener('click', () => resolveWith(null));
    modal.addEventListener('click', (e) => { if (e.target === modal) resolveWith(null); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); resolveWith(input.value); }
      else if (e.key === 'Escape') { resolveWith(null); }
    });
    setTimeout(() => input.focus(), 20);
  });
}

function wordPairHtml(greek = '', english = '') {
  return `
    <div class="word-input-pair">
      <input type="text" class="greek-word" value="${escapeHtml(greek)}" placeholder="Greek word">
      <input type="text" class="english-word" value="${escapeHtml(english)}" placeholder="English translation">
      <button type="button" class="word-remove" aria-label="Remove pair" onclick="removeWordPair(this)">×</button>
    </div>
  `;
}

function addWordPair() {
  const container = document.getElementById('wordInputs');
  if (!container) return;
  container.insertAdjacentHTML('beforeend', wordPairHtml());
  const inputs = container.querySelectorAll('.greek-word');
  inputs[inputs.length - 1].focus();
}

function removeWordPair(btn) {
  const row = btn.closest('.word-input-pair');
  if (row) row.remove();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  render();
  loadGroups();
});

// Render function
function render() {
  const app = document.getElementById('app');

  let html = `
    <header>
      <h1>Greek Word Matcher</h1>
      <p class="subtitle">Learn Greek through matching</p>
    </header>
  `;

  if (currentScreen === 'home') {
    html += renderHomeScreen();
  } else if (currentScreen === 'create') {
    html += renderCreateScreen();
  } else if (currentScreen === 'game') {
    html += renderGameScreen();
  } else if (currentScreen === 'edit') {
    html += renderEditScreen();
  }

  app.innerHTML = html;
}

// Home Screen
function renderHomeScreen() {
  return `
    <div class="screen home-screen active">
      <div class="button-group">
        <button onclick="switchScreen('create')" class="primary">Create New Group</button>
      </div>

      <h2 style="text-align: center; font-family: 'Caveat', cursive; font-size: 2em; margin-bottom: 30px;">Available Groups</h2>

      ${groups.length === 0 ? '<p class="empty-state">No groups yet. Create one to get started!</p>' : ''}

      <div class="groups-list">
        ${groups.map(group => `
          <div class="group-card">
            <h3>${escapeHtml(group.name)}</h3>
            <div class="group-card-actions">
              <button onclick="playGroup(${Number(group.id)})" class="secondary">Play</button>
              <button onclick="switchToEdit(${Number(group.id)})">Edit</button>
              <button onclick="deleteGroupPrompt(${Number(group.id)})" class="danger">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Create Screen
function renderCreateScreen() {
  return `
    <div class="screen create-screen active">
      <form onsubmit="event.preventDefault()">
        <h2>Create New Group</h2>

        <div class="form-group">
          <label for="groupName">Group Name</label>
          <input type="text" id="groupName" placeholder="e.g., Food Vocabulary" required>
        </div>

        <div class="form-group">
          <label for="groupPassword">Password (to edit/delete later)</label>
          <input type="password" id="groupPassword" placeholder="Enter a password" required>
        </div>

        <div class="form-group">
          <label>Words (Greek &rarr; English)</label>
          <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Add as many word pairs as you like (minimum 2). Use the + button to add more.</p>
          <div class="word-inputs" id="wordInputs">
            ${[1, 2, 3, 4].map(() => wordPairHtml()).join('')}
          </div>
          <button type="button" class="word-add-btn secondary" onclick="addWordPair()">＋ Add Word Pair</button>
        </div>

        <div class="form-actions">
          <button type="button" onclick="switchScreen('home')" class="secondary">Cancel</button>
          <button type="button" onclick="createGroup()" class="primary">Create Group</button>
        </div>
      </form>
    </div>
  `;
}

// Edit Screen
function renderEditScreen() {
  if (!currentGroup) return '';

  const words = currentGroup.words || [];
  const emptySlots = Math.max(0, 2 - words.length);

  return `
    <div class="screen edit-screen active">
      <form onsubmit="event.preventDefault()">
        <h2>Edit Group: ${escapeHtml(currentGroup.name)}</h2>

        <div class="form-group">
          <label for="editGroupName">Group Name</label>
          <input type="text" id="editGroupName" value="${escapeHtml(currentGroup.name)}" required>
        </div>

        <div class="form-group">
          <label>Words (Greek &rarr; English)</label>
          <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Add, edit, or remove pairs. Minimum 2.</p>
          <div class="word-inputs" id="wordInputs">
            ${words.map(word => wordPairHtml(word.greek_word, word.english_translation)).join('')}
            ${Array.from({ length: emptySlots }).map(() => wordPairHtml()).join('')}
          </div>
          <button type="button" class="word-add-btn secondary" onclick="addWordPair()">＋ Add Word Pair</button>
        </div>

        <div class="form-actions">
          <button type="button" onclick="switchScreen('home')" class="secondary">Cancel</button>
          <button type="button" onclick="updateGroup()" class="primary">Save Changes</button>
        </div>
      </form>
    </div>
  `;
}

// Game Screen
function renderGameScreen() {
  if (!gameState) return '';

  const leftWords = gameState.leftColumn;
  const rightWords = gameState.rightColumn;
  const matchedCount = gameState.matched.length;
  const totalPairs = gameState.totalPairs;

  return `
    <div class="screen game-screen active">
      <div class="game-header">
        <h2>${escapeHtml(currentGroup.name)}</h2>
        <div class="game-progress">Matched: ${matchedCount} / ${totalPairs}</div>
      </div>

      <div class="game-board">
        <div class="game-column">
          ${leftWords.map(item => `
            <div
              class="word-card ${item.matched ? 'matched' : ''} ${item.selected ? 'selected' : ''}"
              onclick="selectWord('left', ${Number(item.id)})"
              data-id="${Number(item.id)}"
              data-side="left"
            >
              ${escapeHtml(item.word)}
            </div>
          `).join('')}
        </div>

        <div class="game-column">
          ${rightWords.map(item => `
            <div
              class="word-card ${item.matched ? 'matched' : ''} ${item.selected ? 'selected' : ''}"
              onclick="selectWord('right', ${Number(item.id)})"
              data-id="${Number(item.id)}"
              data-side="right"
            >
              ${escapeHtml(item.word)}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="game-actions">
        ${matchedCount === totalPairs ? `
          <button onclick="gameComplete()" class="primary">Game Complete! 🎉</button>
        ` : ''}
        <button onclick="switchScreen('home')" class="secondary">Quit Game</button>
      </div>
    </div>
  `;
}

// --- API Functions ---

function friendlyError(err) {
  const raw = (err && err.message) || String(err);
  if (/invalid password/i.test(raw)) return 'That password is not correct.';
  if (/group not found/i.test(raw)) return 'Group not found.';
  if (/name required/i.test(raw)) return 'Please enter a name.';
  if (/password required/i.test(raw)) return 'Please enter a password.';
  return raw;
}

async function loadGroups() {
  try {
    groups = await db.listGroups();
    render();
  } catch (err) {
    console.error('Error loading groups:', err);
    await showAlert(friendlyError(err), { title: 'Could not load groups' });
  }
}

async function createGroup() {
  const name = document.getElementById('groupName').value.trim();
  const password = document.getElementById('groupPassword').value;

  if (!name || !password) {
    await showAlert('Please fill in all fields', { title: 'Missing info' });
    return;
  }

  const greekInputs = document.querySelectorAll('.greek-word');
  const englishInputs = document.querySelectorAll('.english-word');
  const words = [];

  for (let i = 0; i < greekInputs.length; i++) {
    const g = greekInputs[i].value.trim();
    const e = englishInputs[i].value.trim();
    if (g && e) words.push({ greek: g, english: e });
  }

  if (words.length < 2) {
    await showAlert('Please add at least 2 word pairs', { title: 'Not enough pairs' });
    return;
  }

  try {
    await db.createGroup({ name, password, words });
    await showAlert('Group created!', { title: 'Done' });
    switchScreen('home');
    loadGroups();
  } catch (err) {
    console.error('Error creating group:', err);
    await showAlert(friendlyError(err), { title: 'Could not create group' });
  }
}

async function updateGroup() {
  if (!editPassword) {
    await showAlert('Session expired. Please try again.', { title: 'Oops' });
    switchScreen('home');
    return;
  }

  const name = document.getElementById('editGroupName').value.trim();

  const greekInputs = document.querySelectorAll('.greek-word');
  const englishInputs = document.querySelectorAll('.english-word');
  const words = [];

  for (let i = 0; i < greekInputs.length; i++) {
    const g = greekInputs[i].value.trim();
    const e = englishInputs[i].value.trim();
    if (g && e) words.push({ greek: g, english: e });
  }

  if (words.length < 2) {
    await showAlert('Please add at least 2 word pairs', { title: 'Not enough pairs' });
    return;
  }

  try {
    await db.updateGroup({ id: currentGroup.id, password: editPassword, name, words });
    await showAlert('Group updated!', { title: 'Saved' });
    switchScreen('home');
    loadGroups();
  } catch (err) {
    console.error('Error updating group:', err);
    await showAlert(friendlyError(err), { title: 'Could not save' });
  }
}

async function deleteGroupPrompt(groupId) {
  const password = await showPrompt('Enter the group password to confirm deletion.', {
    title: 'Delete group?',
    placeholder: 'Group password',
    type: 'password',
    okLabel: 'Delete',
    okClass: 'danger'
  });
  if (password === null || password === '') return;

  try {
    await db.deleteGroup({ id: groupId, password });
    await showAlert('Group deleted.', { title: 'Done' });
    loadGroups();
  } catch (err) {
    console.error('Error deleting group:', err);
    await showAlert(friendlyError(err), { title: 'Could not delete' });
  }
}

// --- Game Functions ---

async function playGroup(groupId) {
  try {
    currentGroup = await db.getGroup(groupId);
    if (!currentGroup) {
      await showAlert('Group not found.', { title: 'Oops' });
      return;
    }

    const words = currentGroup.words || [];
    if (words.length < 2) {
      await showAlert('This group has no word pairs yet.', { title: 'Nothing to play' });
      return;
    }

    const leftWords = shuffle(words.map((w, i) => ({
      id: i,
      word: w.greek_word,
      matched: false,
      selected: false,
      correctMatch: i
    })));

    const rightWords = shuffle(words.map((w, i) => ({
      id: i,
      word: w.english_translation,
      matched: false,
      selected: false
    })));

    gameState = {
      leftColumn: leftWords,
      rightColumn: rightWords,
      matched: [],
      totalPairs: words.length
    };

    selectedWord = null;
    currentScreen = 'game';
    render();
  } catch (err) {
    console.error('Error loading group:', err);
    await showAlert('Error loading group', { title: 'Oops' });
  }
}

function selectWord(side, id) {
  if (!gameState) return;

  const column = side === 'left' ? gameState.leftColumn : gameState.rightColumn;
  const card = column.find(c => c.id === id);

  if (!card || card.matched) return;

  // Nothing selected yet → select this card
  if (!selectedWord) {
    card.selected = true;
    selectedWord = { side, id };
    render();
    return;
  }

  // Same side clicked → deselect the previously-selected card on this side
  if (selectedWord.side === side) {
    const prevCard = column.find(c => c.id === selectedWord.id);
    if (prevCard) prevCard.selected = false;
    if (selectedWord.id === id) {
      selectedWord = null;
    } else {
      card.selected = true;
      selectedWord = { side, id };
    }
    render();
    return;
  }

  // Different sides → evaluate match
  const leftCard = selectedWord.side === 'left'
    ? gameState.leftColumn.find(c => c.id === selectedWord.id)
    : card;
  const rightCard = selectedWord.side === 'right'
    ? gameState.rightColumn.find(c => c.id === selectedWord.id)
    : card;

  if (leftCard.correctMatch === rightCard.id) {
    // Match found
    leftCard.matched = true;
    rightCard.matched = true;
    leftCard.selected = false;
    rightCard.selected = false;
    gameState.matched.push({ left: leftCard.id, right: rightCard.id });
    selectedWord = null;
    render();
  } else {
    // Wrong match — shake only the two involved cards
    leftCard.selected = false;
    rightCard.selected = false;
    selectedWord = null;
    render();

    const leftEl = document.querySelector(`.word-card[data-side="left"][data-id="${leftCard.id}"]`);
    const rightEl = document.querySelector(`.word-card[data-side="right"][data-id="${rightCard.id}"]`);
    leftEl && leftEl.classList.add('wrong');
    rightEl && rightEl.classList.add('wrong');

    setTimeout(() => {
      leftEl && leftEl.classList.remove('wrong');
      rightEl && rightEl.classList.remove('wrong');
    }, 500);
  }
}

async function gameComplete() {
  await showAlert('You matched every pair!', { title: 'Well done!' });
  switchScreen('home');
}

// --- Navigation ---

function switchScreen(screen) {
  if (currentScreen === 'edit' && screen !== 'edit') {
    editPassword = null;
  }
  currentScreen = screen;
  selectedWord = null;
  render();
}

async function switchToEdit(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  const password = await showPrompt(`Enter the password for "${group.name}" to edit it.`, {
    title: 'Password required',
    placeholder: 'Group password',
    type: 'password',
    okLabel: 'Unlock'
  });
  if (password === null || password === '') return;

  try {
    const valid = await db.verifyPassword(groupId, password);
    if (!valid) {
      await showAlert('That password is not correct.', { title: 'Wrong password' });
      return;
    }

    editPassword = password;
    const full = await db.getGroup(groupId);
    currentGroup = full || group;
    currentScreen = 'edit';
    render();
  } catch (err) {
    console.error('Error unlocking group:', err);
    await showAlert(friendlyError(err), { title: 'Oops' });
  }
}
