const API_BASE = '/api';

// App state
let currentScreen = 'home';
let groups = [];
let currentGroup = null;
let gameState = null;
let selectedWord = null;

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
  const emptySlots = Math.max(0, 4 - words.length);

  return `
    <div class="screen edit-screen active">
      <form onsubmit="event.preventDefault()">
        <h2>Edit Group: ${escapeHtml(currentGroup.name)}</h2>

        <div class="form-group">
          <label for="editGroupName">Group Name</label>
          <input type="text" id="editGroupName" value="${escapeHtml(currentGroup.name)}" required>
        </div>

        <div class="form-group">
          <label for="editPassword">Password (to confirm changes)</label>
          <input type="password" id="editPassword" placeholder="Enter group password" required>
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
          <h3>Greek</h3>
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
          <h3>English</h3>
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

async function loadGroups() {
  try {
    const response = await fetch(`${API_BASE}/groups`);
    groups = await response.json();
    render();
  } catch (err) {
    console.error('Error loading groups:', err);
    alert('Failed to load groups');
  }
}

async function createGroup() {
  const name = document.getElementById('groupName').value;
  const password = document.getElementById('groupPassword').value;

  if (!name || !password) {
    alert('Please fill in all fields');
    return;
  }

  const greekInputs = document.querySelectorAll('.greek-word');
  const englishInputs = document.querySelectorAll('.english-word');
  const words = [];

  for (let i = 0; i < greekInputs.length; i++) {
    if (greekInputs[i].value && englishInputs[i].value) {
      words.push({
        greek: greekInputs[i].value,
        english: englishInputs[i].value
      });
    }
  }

  if (words.length < 2) {
    alert('Please add at least 2 word pairs');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, words })
    });

    if (response.ok) {
      alert('Group created!');
      switchScreen('home');
      loadGroups();
    } else {
      const err = await response.json().catch(() => ({}));
      alert('Could not create group: ' + (err.error || `HTTP ${response.status}`));
    }
  } catch (err) {
    console.error('Error creating group:', err);
    alert('Could not reach the server. Is the backend running at ' + window.location.origin + '? Details: ' + err.message);
  }
}

async function updateGroup() {
  const password = document.getElementById('editPassword').value;
  const name = document.getElementById('editGroupName').value;

  if (!password) {
    alert('Please enter the group password');
    return;
  }

  const greekInputs = document.querySelectorAll('.greek-word');
  const englishInputs = document.querySelectorAll('.english-word');
  const words = [];

  for (let i = 0; i < greekInputs.length; i++) {
    if (greekInputs[i].value && englishInputs[i].value) {
      words.push({
        greek: greekInputs[i].value,
        english: englishInputs[i].value
      });
    }
  }

  if (words.length < 2) {
    alert('Please add at least 2 word pairs');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/groups/${currentGroup.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, name, words })
    });

    if (response.ok) {
      alert('Group updated!');
      switchScreen('home');
      loadGroups();
    } else {
      const error = await response.json();
      alert(error.error || 'Error updating group');
    }
  } catch (err) {
    console.error('Error updating group:', err);
    alert('Error updating group');
  }
}

async function deleteGroupPrompt(groupId) {
  const password = prompt('Enter group password to delete:');
  if (password === null) return;

  try {
    const response = await fetch(`${API_BASE}/groups/${groupId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      alert('Group deleted!');
      loadGroups();
    } else {
      const error = await response.json();
      alert(error.error || 'Error deleting group');
    }
  } catch (err) {
    console.error('Error deleting group:', err);
    alert('Error deleting group');
  }
}

// --- Game Functions ---

async function playGroup(groupId) {
  try {
    const response = await fetch(`${API_BASE}/groups/${groupId}`);
    currentGroup = await response.json();

    const words = currentGroup.words || [];
    if (words.length < 2) {
      alert('This group has no word pairs yet.');
      return;
    }

    const leftWords = words.map((w, i) => ({
      id: i,
      word: w.greek_word,
      matched: false,
      selected: false,
      correctMatch: i
    }));

    const rightWordsShuffled = words.map((w, i) => ({
      id: i,
      word: w.english_translation,
      matched: false,
      selected: false
    }));

    // Shuffle right words
    for (let i = rightWordsShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightWordsShuffled[i], rightWordsShuffled[j]] = [rightWordsShuffled[j], rightWordsShuffled[i]];
    }

    gameState = {
      leftColumn: leftWords,
      rightColumn: rightWordsShuffled,
      matched: [],
      totalPairs: words.length
    };

    selectedWord = null;
    currentScreen = 'game';
    render();
  } catch (err) {
    console.error('Error loading group:', err);
    alert('Error loading group');
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

function gameComplete() {
  alert('Congratulations! You completed the game! 🎉');
  switchScreen('home');
}

// --- Navigation ---

function switchScreen(screen) {
  currentScreen = screen;
  selectedWord = null;
  render();
}

function switchToEdit(groupId) {
  currentGroup = groups.find(g => g.id === groupId);
  // The /api/groups list endpoint doesn't include words, so fetch the full group
  fetch(`${API_BASE}/groups/${groupId}`)
    .then(r => r.ok ? r.json() : null)
    .then(full => {
      if (full) currentGroup = full;
      currentScreen = 'edit';
      render();
    })
    .catch(() => {
      currentScreen = 'edit';
      render();
    });
}
