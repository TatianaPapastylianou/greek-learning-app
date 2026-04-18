# Architecture Overview

## How the App Works

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Frontend)                      │
│                                                             │
│  User clicks button → JavaScript → HTTP Request            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Frontend (app.js)                                    │  │
│  │ - Shows UI                                           │  │
│  │ - Handles clicks                                     │  │
│  │ - Sends API requests to backend                      │  │
│  │ - Displays data from backend                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Styling (style.css)                                  │  │
│  │ - Sketchy, hand-drawn look                           │  │
│  │ - Caveat font, Indie Flower font                     │  │
│  │ - Wobbly borders, rotated cards                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              ↓ HTTP (GET, POST, PUT, DELETE)
┌─────────────────────────────────────────────────────────────┐
│              YOUR COMPUTER/SERVER (Backend)                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Express Server (server.js)                           │  │
│  │ Listens on http://localhost:3001                     │  │
│  │                                                      │  │
│  │ Endpoints:                                           │  │
│  │ GET    /api/groups          → Get all groups        │  │
│  │ POST   /api/groups          → Create new group      │  │
│  │ GET    /api/groups/:id      → Get specific group    │  │
│  │ PUT    /api/groups/:id      → Edit group            │  │
│  │ DELETE /api/groups/:id      → Delete group          │  │
│  │ POST   /api/groups/:id/verify-password              │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Database (SQLite - greek_learning.db)               │  │
│  │                                                      │  │
│  │ Table: groups                                        │  │
│  │ ├─ id (auto-increment)                              │  │
│  │ ├─ name (text)                                       │  │
│  │ ├─ password (hashed with bcryptjs)                  │  │
│  │ └─ created_at (timestamp)                            │  │
│  │                                                      │  │
│  │ Table: words                                         │  │
│  │ ├─ id (auto-increment)                              │  │
│  │ ├─ group_id (foreign key → groups.id)               │  │
│  │ ├─ greek_word (text)                                │  │
│  │ └─ english_translation (text)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Creating a Group

```
1. User fills form and clicks "Create Group"
   ↓
2. JavaScript collects data:
   {
     name: "Food Vocabulary",
     password: "mypassword",
     words: [
       { greek: "αγάπη", english: "love" },
       { greek: "σπίτι", english: "house" }
     ]
   }
   ↓
3. Sends POST request to http://localhost:3001/api/groups
   ↓
4. Express server receives request
   ↓
5. Hashes password using bcryptjs (mypassword → $2a$10$...)
   ↓
6. Inserts into database:
   INSERT INTO groups VALUES (1, "Food Vocabulary", "$2a$10$...", "2024-04-15")
   INSERT INTO words VALUES (1, 1, "αγάπη", "love")
   INSERT INTO words VALUES (2, 1, "σπίτι", "house")
   ↓
7. Server responds: { id: 1, name: "Food Vocabulary" }
   ↓
8. JavaScript displays success message
   ↓
9. User sees new group in the list
```

---

## Data Flow Example: Playing a Game

```
1. User clicks "Play" on a group
   ↓
2. JavaScript sends GET to /api/groups/:id
   ↓
3. Server queries database:
   SELECT * FROM groups WHERE id = 1
   SELECT * FROM words WHERE group_id = 1
   ↓
4. Server returns:
   {
     id: 1,
     name: "Food Vocabulary",
     words: [
       { id: 1, greek_word: "αγάπη", english_translation: "love" },
       { id: 2, greek_word: "σπίτι", english_translation: "house" }
     ]
   }
   ↓
5. JavaScript shuffles right column (English words)
   ↓
6. Displays game board:
   Left: [αγάπη, σπίτι]  →  Right: [house, love] (shuffled)
   ↓
7. User clicks cards - all matching logic happens in JavaScript
   (No server calls during gameplay)
   ↓
8. User completes game → Back to home screen
```

---

## Data Flow Example: Editing a Group

```
1. User clicks "Edit" and enters password
   ↓
2. JavaScript sends POST to /api/groups/:id/verify-password
   with { password: "mypassword" }
   ↓
3. Server:
   - Gets hashed password from database
   - Compares plain password with hashed version using bcryptjs
   - Returns { valid: true } or { valid: false }
   ↓
4a. If password invalid:
    User sees "Invalid password" error
    ↓
4b. If password valid:
    User is shown edit form with current data
    ↓
5. User changes words and clicks "Save"
   ↓
6. JavaScript sends PUT to /api/groups/:id with:
   { password, name, words }
   ↓
7. Server verifies password again (security)
   ↓
8. Server deletes old words and inserts new ones
   ↓
9. User sees success message
```

---

## Why This Architecture?

### SQLite (Database Choice)
- Simple to set up (single file, no server needed)
- Good for small to medium apps
- Built into Node.js easily
- Perfect for learning

### Express (Backend Framework)
- Minimal, lightweight
- Easy to understand
- Perfect for REST APIs
- Standard for Node.js apps

### Vanilla JavaScript (Frontend)
- No dependencies, no build step
- Runs directly in browser
- Easier to debug
- Smaller bundle size

### Password Protection (Not Full Auth)
- Simpler than user accounts
- Group owner just needs password to edit/delete
- Everyone can still play all games
- Good balance of simplicity and control

---

## Security Notes

### What's Secure
- Passwords are hashed with bcryptjs (attacker can't reverse them)
- Password checked every time you edit/delete
- Database stores hashed passwords, not plain text

### What's NOT Secure (Intentional Tradeoffs)
- No HTTPS locally (just HTTP) - OK for learning
- No user authentication - everyone is anonymous
- Passwords sent in request body - add HTTPS when deploying
- Anyone can see all groups - that's the feature

### When Deploying
- Use HTTPS (Railway/Render do this automatically)
- Consider rate limiting (prevent spam)
- Consider input validation (done, but could be more robust)

---

## Scaling Notes

This architecture handles:
- 1,000+ groups easily (SQLite handles this)
- 100+ concurrent users on small hardware
- Unlimited word pairs per group (but game shows 4 at a time)

If you need more:
- Switch to PostgreSQL (more powerful)
- Add caching (Redis)
- Add load balancing
- But start with SQLite - it's plenty

---

## File Dependencies

```
server.js
├─ requires express
├─ requires cors
├─ requires bcryptjs
└─ requires database.js

database.js
└─ requires sqlite3

public/app.js
├─ requires public/index.html (loaded by browser)
└─ requires public/style.css (loaded by browser)
  - Calls API at http://localhost:3001/api/...

public/index.html
├─ loads public/style.css
├─ loads public/app.js
└─ contains fonts from Google Fonts
```

---

## How to Add Features Later

### Add user accounts
- Create `users` table with email/password
- Add login screen
- Add user_id to groups
- Only show groups created by that user (option)

### Add pronunciation audio
- Store audio URLs in words table
- Add audio tag in game
- Use Google Translate API or similar

### Add progress tracking
- Create `sessions` table (user id, group id, date, score)
- Track correct/wrong answers
- Show graphs over time

### Add difficulty levels
- Create groups with 4, 6, or 8 word pairs
- Adjust game screen grid dynamically

### Add categories
- Create `categories` table
- Let users filter groups by category
- Pre-populate with categories

Start simple, add features later based on what your class needs.
