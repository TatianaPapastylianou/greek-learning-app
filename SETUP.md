# Greek Word Matcher - Setup Guide

## Overview
This is a backend + frontend app for learning Greek through word matching games. Groups are shared across all users. Each group is password-protected so only the creator can edit/delete it.

## Local Development Setup

### Step 1: Prerequisites
You need to install Node.js first. Go to https://nodejs.org and download the LTS version (18 or higher).

### Step 2: Install Dependencies
Navigate to your project folder and run:

```bash
npm install
```

This installs all the required packages (Express, SQLite, bcryptjs, CORS).

### Step 3: Run the Server
In the same terminal:

```bash
npm start
```

You should see:
```
Server running on http://localhost:3001
Connected to SQLite database
```

### Step 4: Open the Frontend
Open your browser and go to:
```
http://localhost:3001
```

You should see the Greek Word Matcher app.

---

## How It Works

### Creating a Group
1. Click "Create New Group"
2. Enter group name (e.g., "Food Vocabulary")
3. Enter a password (required to edit/delete later - don't forget this!)
4. Add at least 2 word pairs (Greek → English)
5. Click "Create Group"

### Playing a Game
1. Click "Play" on a group
2. Click a Greek word on the left
3. Click the matching English translation on the right
4. If correct, both cards disappear
5. If wrong, cards flip back
6. Match all pairs to complete!

### Editing a Group
1. Click "Edit" on a group card
2. Enter the password you set when creating it
3. Change the name or words
4. Click "Save Changes"

### Deleting a Group
1. Click "Delete" on a group card
2. Enter the password
3. Group is permanently deleted

---

## Database

The app uses SQLite, which stores data in a file called `greek_learning.db` in your project folder.

**Tables:**
- `groups` - stores group name and password
- `words` - stores Greek/English word pairs linked to groups

When you delete a group, all its words are automatically deleted too (CASCADE delete).

---

## Deployment to Production

When you're ready to share with your class, you need to deploy this to the internet.

### Option A: Deploy on Railway (Recommended for Beginners)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Connect your GitHub repository
5. Railway auto-detects Node.js and deploys
6. Your backend gets a public URL like `https://greek-app-production.up.railway.app`

Update your frontend to use that URL:
- In `public/app.js`, change:
  ```javascript
  const API_BASE = 'http://localhost:3001/api';
  ```
  to:
  ```javascript
  const API_BASE = 'https://greek-app-production.up.railway.app/api';
  ```

### Option B: Deploy on Render

1. Go to https://render.com
2. Sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Set Build Command: `npm install`
6. Set Start Command: `npm start`
7. Deploy
8. Update frontend API_BASE to your Render URL

### Option C: Deploy Locally (Shared Network)

If everyone is on the same school network:
1. Run `npm start` on your computer
2. Find your computer's local IP address (ask your teacher or IT)
3. Share the URL: `http://YOUR_IP:3001`
4. Everyone connects to your computer over the network

---

## File Structure

```
greek-learning-app/
├── package.json           # Project dependencies
├── server.js              # Backend server (Express)
├── database.js            # Database setup & helpers
├── public/
│   ├── index.html         # Main HTML file
│   ├── app.js             # Frontend logic (vanilla JS)
│   └── style.css          # Sketchy styling
└── greek_learning.db      # SQLite database (created on first run)
```

---

## Troubleshooting

### "Cannot find module 'express'"
Run: `npm install`

### "Port 3001 already in use"
Change port in `server.js`:
```javascript
const PORT = process.env.PORT || 3002; // Change 3001 to 3002
```

### "CORS error when playing"
If frontend and backend are on different domains, make sure CORS is enabled. It's already enabled in `server.js` with:
```javascript
app.use(cors());
```

### Database error
Delete `greek_learning.db` and restart the server. It will create a fresh database.

### Password not working when trying to edit/delete
Make sure you're entering the exact password you set when creating the group. Passwords are case-sensitive.

---

## Adding More Groups/Words

The app supports unlimited groups and unlimited words per group. But the game only displays 4 words at a time for matching (4 pairs = 8 cards).

If you want different game sizes, modify `public/app.js` in the `playGroup()` function.

---

## Next Steps

1. Get comfortable creating/editing groups locally
2. Test the game mechanics (matching, scoring)
3. Deploy to Railway or Render
4. Share the URL with your class
5. Have them create their own groups to collaborate

Questions? Feel free to ask!
