# Greek Word Matcher - Quick Start (Step by Step)

## What You're Building
A web app where:
- Anyone can create groups of Greek/English word pairs
- Everyone sees all groups
- Groups are password-protected (only you can edit/delete yours)
- The game: match 4 Greek words to 4 English translations by clicking

---

## Step 1: Download & Open the Project

1. Download the `greek-learning-app` folder
2. Open a terminal/command prompt
3. Navigate to the folder:
   ```
   cd greek-learning-app
   ```

---

## Step 2: Install Node.js

If you haven't already:
1. Go to https://nodejs.org
2. Download the LTS version (the recommended one)
3. Install it
4. Restart your terminal

To check if it worked, type:
```
node -v
```

You should see a version number like `v18.16.0`

---

## Step 3: Install Dependencies

In your terminal (inside the `greek-learning-app` folder), type:

```
npm install
```

This downloads all the packages needed. Takes 2-3 minutes. You'll see a lot of text. That's normal.

When done, you'll see something like:
```
added 150 packages
```

---

## Step 4: Start the Server

Still in the terminal, type:

```
npm start
```

You should see:
```
Server running on http://localhost:3001
Connected to SQLite database
```

**Leave this terminal window open.** It needs to stay running.

---

## Step 5: Open the App

Open your browser and go to:
```
http://localhost:3001
```

You should see the app with a title "Greek Word Matcher" and a button "Create New Group".

**Congrats! It's running locally.**

---

## Step 6: Test It

### Create a Test Group

1. Click "Create New Group"
2. Enter:
   - Name: `Test Group`
   - Password: `password123` (write this down!)
   - Add words:
     - Greek: `αγάπη` → English: `love`
     - Greek: `σπίτι` → English: `house`
     - Greek: `ψάρι` → English: `fish`
     - Greek: `κοτόπουλο` → English: `chicken`
3. Click "Create Group"

### Play the Game

1. Click "Play" on your new group
2. Click a Greek word on the left
3. Click an English word on the right
4. If they match, they disappear
5. If they don't, they flip back
6. Match all 4 pairs

### Edit the Group

1. Go back (click "Quit Game")
2. Click "Edit" on the group
3. Enter password: `password123`
4. Change a word and click "Save Changes"

### Delete the Group

1. Click "Delete" on the group
2. Enter password: `password123`
3. It's gone

---

## Architecture Explained (Simple Version)

### Backend (server.js)
- Runs on your computer at `http://localhost:3001`
- Stores groups and words in a database (SQLite file)
- Has API endpoints like:
  - `POST /api/groups` - create group
  - `GET /api/groups` - get all groups
  - `PUT /api/groups/:id` - edit group (needs password)
  - `DELETE /api/groups/:id` - delete group (needs password)

### Frontend (public/app.js, style.css)
- Runs in your browser
- Shows the UI
- When you click buttons, it sends requests to the backend
- Backend responds with data, frontend displays it

### Database (greek_learning.db)
- Created automatically when you first run the app
- Stores two tables:
  - `groups` - group names and passwords (hashed)
  - `words` - Greek/English word pairs

---

## File Meanings

| File | What It Does |
|------|------|
| `package.json` | Lists what packages your app needs |
| `server.js` | The backend (the brain) |
| `database.js` | Sets up the database |
| `public/index.html` | The main HTML page |
| `public/app.js` | Frontend logic (vanilla JavaScript) |
| `public/style.css` | Styling (sketchy design) |
| `greek_learning.db` | The database file (created on first run) |

---

## Common Issues & Solutions

### "npm: command not found"
You didn't install Node.js or your terminal didn't restart. Restart your computer, then try again.

### "Port 3001 already in use"
Another app is using that port. Either:
- Close other apps
- Or change port in `server.js` line 6 to `const PORT = 3002;`

### "Cannot find module..."
You didn't run `npm install` or it failed. Try again:
```
npm install
```

### "CORS error" (when deployed)
If frontend and backend are on different URLs, CORS might block it. It's already fixed in `server.js`, but if you see errors, ask.

### "Database locked" error
You're running the app twice on the same computer. Close the first terminal window.

---

## Next: Deploy to the Internet

Once you're happy locally, you need to share it with your class.

### Quick Option: Railway (5 minutes)

1. Put your project on GitHub
2. Go to https://railway.app
3. Sign up with GitHub
4. Create new project → import your GitHub repo
5. Railway auto-deploys
6. Get your public URL
7. Share that URL with your class

**All students go to that URL and can create/play groups together.**

See SETUP.md for more deployment details.

---

## What Your Class Will See

Everyone accessing the app will:
1. See all groups created by everyone
2. Click "Play" to play any group
3. Click "Create New Group" to add their own
4. Only edit/delete groups they created (with password)

It's a shared, collaborative learning space.

---

## Need Help?

The app code is commented. Check:
- `server.js` - Backend logic
- `public/app.js` - Frontend logic
- `SETUP.md` - Detailed setup

Common questions answered in SETUP.md.

Good luck! 🚀
