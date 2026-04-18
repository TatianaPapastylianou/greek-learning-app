const API_BASE = 'http://localhost:3001/api';

// App state
let currentScreen = 'home';
let groups = [];
let currentGroup = null;
let gameState = null;
let selectedWord = null;

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
  attachEventListeners();
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
            <h3>${group.name}</h3>
            <div class="group-card-actions">
              <button onclick="playGroup(${group.id})" class="secondary">Play</button>
              <button onclick="switchToEdit(${group.id})">Edit</button>
              <button onclick="deleteGroupPrompt(${group.id})" class="danger">Delete</button>
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
      <form>
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
          <label>Words (Greek → English)</label>
          <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Add 4 words for the matching game</p>
          <div class="word-inputs">
            ${[1, 2, 3, 4].map(i => `
              <div class="word-input-pair">
                <input type="text" class="greek-word" placeholder="Greek word" required>
                <input type="text" class="english-word" placeholder="English translation" required>
              </div>
            `).join('')}
          </div>
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
  
  return `
    <div class="screen edit-screen active">
      <form>
        <h2>Edit Group: ${currentGroup.name}</h2>
        
        <div class="form-group">
          <label for="editGroupName">Group Name</label>
          <input type="text" id="editGroupName" value="${currentGroup.name}" required>
        </div>

        <div class="form-group">
          <label for="editPassword">Password (to confirm changes)</label>
          <input type="password" id="editPassword" placeholder="Enter group password" required>
        </div>

        <div class="form-group">
          <label>Words (Greek → English)</label>
          <div class="word-inputs">
            ${(currentGroup.words || []).map((word, i) => `
              <div class="word-input-pair">
                <input type="text" class="greek-word" value="${word.greek_word}" required>
                <input type="text" class="english-word" value="${word.english_translation}" required>
              </div>
            `).join('')}
            ${[currentGroup.words.length, currentGroup.words.length + 1, currentGroup.words.length + 2, currentGroup.words.length + 3].slice(0, 4 - currentGroup.words.length).map(i => `
              <div class="word-input-pair">
                <input type="text" class="greek-word" placeholder="Greek word">
                <input type="text" class="english-word" placeholder="English translation">
              </div>
            `).join('')}
          </div>
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
        <h2>${currentGroup.name}</h2>
        <div class="game-progress">Matched: ${matchedCount} / ${totalPairs}</div>
      </div>

      <div class="game-board">
        <div class="game-column">
          <h3>Greek</h3>
          ${leftWords.map(item => `
            <div 
              class="word-card ${item.matched ? 'matched' : ''} ${item.selected ? 'selected' : ''}"
              onclick="selectWord('left', ${item.id})"
              data-id="${item.id}"
              data-side="left"
            >
              ${item.word}
            </div>
          `).join('')}
        </div>

        <div class="game-column">
          <h3>English</h3>
          ${rightWords.map(item => `
            <div 
              class="word-card ${item.matched ? 'matched' : ''} ${item.selected ? 'selected' : ''}"
              onclick="selectWord('right', ${item.id})"
              data-id="${item.id}"
              data-side="right"
            >
              ${item.word}
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

// API Functions

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
      alert('Error creating group');
    }
  } catch (err) {
    console.error('Error creating group:', err);
    alert('Error creating group');
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

// Game Functions

async function playGroup(groupId) {
  try {
    const response = await fetch(`${API_BASE}/groups/${groupId}`);
    currentGroup = await response.json();

    // Initialize game
    const words = currentGroup.words;
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

  // If nothing selected, select this
  if (!selectedWord) {
    card.selected = true;
    selectedWord = { side, id };
    render();
    return;
  }

  // If same side selected, deselect
  if (selectedWord.side === side) {
    card.selected = false;
    selectedWord = null;
    render();
    return;
  }

  // Different side - check if match
  const leftCard = selectedWord.side === 'left' 
    ? gameState.leftColumn.find(c => c.id === selectedWord.id)
    : column.find(c => c.id === id);
  
  const rightCard = selectedWord.side === 'right'
    ? gameState.rightColumn.find(c => c.id === selectedWord.id)
    : column.find(c => c.id === id);

  // Check if it's a correct match
  if (leftCard.correctMatch === rightCard.id) {
    // Match found
    leftCard.matched = true;
    rightCard.matched = true;
    gameState.matched.push({ left: leftCard.id, right: rightCard.id });
    selectedWord = null;
  } else {
    // Wrong match - flash and reset
    leftCard.selected = false;
    card.selected = false;
    selectedWord = null;
    
    // Add wrong animation class
    render();
    const cards = document.querySelectorAll('.word-card');
    cards.forEach(c => c.classList.add('wrong'));
    
    setTimeout(() => {
      render();
    }, 300);
    return;
  }

  render();
}

function gameComplete() {
  alert('Congratulations! You completed the game! 🎉');
  switchScreen('home');
}

// Navigation

function switchScreen(screen) {
  currentScreen = screen;
  selectedWord = null;
  render();
}

function switchToEdit(groupId) {
  currentGroup = groups.find(g => g.id === groupId);
  currentScreen = 'edit';
  render();
}

// Event listeners (called after render)
function attachEventListeners() {
  // Event listeners are handled via onclick attributes in HTML
}
