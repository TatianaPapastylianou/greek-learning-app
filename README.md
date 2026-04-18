# Greek Word Matcher

A collaborative Greek vocabulary learning app using a matching game mechanic. Shared word groups, password-protected ownership, no user accounts needed.

## What You Have

- **Backend:** Node.js + Express + SQLite
- **Frontend:** HTML, CSS, vanilla JavaScript (no frameworks)
- **Design:** Sketchy, hand-drawn aesthetic with fonts (Caveat, Indie Flower)
- **Database:** SQLite (auto-created on first run)
- **Local running on:** `http://localhost:3001`

---

## Getting Started (Choose Your Path)

### Quick Start (Fastest)
Start here if you want to get running in 5 minutes.
→ Read: **QUICKSTART.md**

### Full Setup Guide
Complete guide with explanations and deployment instructions.
→ Read: **SETUP.md**

### How It Works (Architecture)
Understand the code structure, database design, and data flow.
→ Read: **ARCHITECTURE.md**

### Troubleshooting
Something broke? Start here.
→ Read: **TROUBLESHOOTING.md**

---

## 30-Second Summary

1. **Install Node.js** from https://nodejs.org
2. **Run these commands:**
   ```bash
   npm install
   npm start
   ```
3. **Open browser:** http://localhost:3001
4. **Create groups** with Greek/English word pairs (protected by password)
5. **Play matching games** - click a Greek word, click the matching English translation
6. **Invite your class** - share the URL when deployed

---

## File Structure

```
greek-learning-app/
├── README.md              ← You are here
├── QUICKSTART.md          ← Start here if new
├── SETUP.md               ← Detailed setup & deployment
├── ARCHITECTURE.md        ← How it works
├── TROUBLESHOOTING.md     ← When things break
│
├── package.json           ← Dependencies
├── server.js              ← Backend (Node.js/Express)
├── database.js            ← Database setup
│
└── public/                ← Frontend (runs in browser)
    ├── index.html         ← Main HTML
    ├── app.js             ← Game logic & UI
    └── style.css          ← Sketchy styling
```

---

## Core Features

### Group Management
- Create unlimited word groups
- Each group password-protected (only creator can edit/delete)
- Everyone can see and play all groups

### Matching Game
- 4 Greek words on left, 4 English translations on right (shuffled)
- Click to match pairs
- If correct, cards disappear
- If wrong, cards flip back
- Complete all 4 pairs to win

### Data Sharing
- All data stored on one backend
- Everyone in class accesses the same groups
- Real-time collaboration (no sync delays)

---

## Key Decision: Why This Approach?

### Why matching game instead of multiple choice?
Recognition vs. production. Matching forces recall and spatial memory.

### Why password-protect instead of user accounts?
Simplicity. No login system, no forgotten passwords, no authentication complexity. Just a password per group.

### Why SQLite instead of PostgreSQL?
Easier to learn. Single file. No server setup. Perfect for this size.

### Why vanilla JavaScript instead of React?
Simpler. Fewer dependencies. Runs directly in browser. Easier to debug for learning.

### Why sketchy aesthetic?
Makes it feel personal and less intimidating. Hand-drawn font (Caveat) is more welcoming than corporate design.

---

## Deployment

### For Your Class (5 minutes)

1. Push code to GitHub
2. Go to https://railway.app
3. Sign up with GitHub
4. Create new project from repo
5. Railway auto-detects Node.js and deploys
6. Share the public URL with your class

All students go to that URL. They see all groups. They create their own groups. Shared learning.

See **SETUP.md** for detailed deployment steps.

---

## What the Code Does

### Backend (server.js)
- Listens for HTTP requests
- Manages groups and words
- Hashes passwords with bcryptjs
- Stores/retrieves data from database

### Database (database.js)
- Initializes SQLite database
- Creates `groups` and `words` tables
- Helper functions for queries

### Frontend (app.js)
- Manages app state (current screen, current group, game state)
- Handles user interactions (clicks, form submissions)
- Communicates with backend via HTTP
- Renders UI dynamically

### Styling (style.css)
- Sketchy design with CSS transforms (rotations, shadows)
- Hand-drawn fonts
- Wobbly borders
- Mobile responsive

---

## Next Steps

1. **Read QUICKSTART.md** (5 min) - Get it running locally
2. **Test it** (10 min) - Create a group, play a game, edit/delete
3. **Understand ARCHITECTURE.md** (15 min) - Know how it works
4. **Deploy** (10 min) - Share with your class
5. **Add features** (optional) - Audio, images, progress tracking, etc.

---

## Common Questions

**Q: Can students create their own groups?**
A: Yes. They click "Create New Group" and add words. Password-protected.

**Q: Can students see groups made by others?**
A: Yes. Everyone sees all groups. Can play any group.

**Q: Can a student edit another student's group?**
A: No. They'd need the password, which only the creator knows.

**Q: What if a student forgets their password?**
A: They can't edit that group anymore. But they can delete it and create a new one.

**Q: Is the sketchy design fixed?**
A: No. You can change it in `public/style.css` (colors, fonts, borders).

**Q: Can I add more than 4 words per group?**
A: Yes, but the game displays only 4 pairs at a time. Modifiable in code.

**Q: Can I add audio pronunciation?**
A: Yes, but requires database changes and new code. See ARCHITECTURE.md for roadmap.

**Q: Is it free?**
A: Yes. Node.js is free. SQLite is free. Railway/Render has free tier.

**Q: How many students can use it?**
A: Hundreds easily. Thousands with tuning.

**Q: Can it work offline?**
A: Only locally. When deployed, everyone needs internet to access backend.

---

## Roadmap (What You Can Add Later)

- Audio pronunciation for words
- Progress tracking (see which words you struggle with)
- User accounts (optional - adds complexity)
- Multiple game modes (beyond matching)
- Difficulty levels (4, 6, 8 word pairs)
- Categories/topics for groups
- Leaderboards (most groups created, etc.)
- Export/import groups as CSV

---

## Support

**Getting started?**
→ QUICKSTART.md

**Something broken?**
→ TROUBLESHOOTING.md

**How does it work?**
→ ARCHITECTURE.md

**Want to deploy?**
→ SETUP.md (Deployment section)

**Code unclear?**
→ Read comments in `server.js` and `public/app.js`

---

## License

This code is yours. Use it, modify it, share it. No restrictions.

---

## One More Thing

This is a learning project. It's meant to teach:
- How backends and frontends talk via HTTP
- How databases store data
- How passwords are hashed (security)
- How to build a complete full-stack app

Read the code. Modify it. Break it. Fix it. That's how you learn.

Have fun learning Greek! 🇬🇷

---

**Ready? Start with QUICKSTART.md →**
