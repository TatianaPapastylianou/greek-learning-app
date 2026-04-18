# Troubleshooting & FAQ

## Installation Problems

### "npm: command not found"

**Problem:** You typed `npm` but the terminal doesn't recognize it.

**Cause:** Node.js isn't installed or wasn't recognized by your terminal.

**Solution:**
1. Go to https://nodejs.org
2. Download LTS version
3. Install it
4. **Restart your computer** (this is important)
5. Open a new terminal and try again

**Verify it worked:**
```bash
node -v
npm -v
```

Both should show version numbers.

---

### "Cannot find module 'express'" or other missing modules

**Problem:** You run `npm start` and get an error about missing modules.

**Cause:** Dependencies weren't installed.

**Solution:**
```bash
npm install
```

Wait for it to finish. You should see "added X packages".

Then try:
```bash
npm start
```

---

### npm install hangs or never finishes

**Problem:** You run `npm install` and it gets stuck.

**Cause:** Network issue or npm cache corruption.

**Solution:**
1. Press Ctrl+C to stop
2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
3. Try again:
   ```bash
   npm install
   ```

If it still hangs:
1. Delete the `node_modules` folder and `package-lock.json` file
2. Run `npm install` again

---

## Runtime Problems

### "Port 3001 already in use"

**Problem:** You get this error when running `npm start`:
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Cause:** Another app is using port 3001, or you have two terminals running the app.

**Solution:**

Option 1: Close other apps using port 3001
- Close any other Node.js apps
- Close any other servers

Option 2: Use a different port
- Edit `server.js` line 6
- Change:
  ```javascript
  const PORT = process.env.PORT || 3001;
  ```
  to:
  ```javascript
  const PORT = process.env.PORT || 3002;
  ```
- Then go to `http://localhost:3002` in browser

Option 3: Kill the process on Linux/Mac
```bash
lsof -i :3001
kill -9 <PID>
```

---

### "Database locked" error

**Problem:** You get a database error when trying to create/edit groups.

**Cause:** Database is corrupted or locked. Usually happens if app crashes while writing to database.

**Solution:**
1. Stop the server (Ctrl+C)
2. Delete the database file: `greek_learning.db`
3. Start the server again:
   ```bash
   npm start
   ```
4. Database will be recreated fresh

---

### Frontend loads but nothing happens when clicking buttons

**Problem:** You see the app, but clicking buttons doesn't work.

**Cause:** Usually JavaScript errors. Check browser console.

**Solution:**
1. Open browser Developer Tools (F12 or Ctrl+Shift+I)
2. Go to "Console" tab
3. Look for red error messages
4. Screenshot the error and check ARCHITECTURE.md or ask

---

### "Failed to load groups" error

**Problem:** You see this message on the home screen.

**Cause:** Frontend can't reach the backend. Backend might not be running.

**Solution:**
1. Check terminal - is `npm start` still running?
   - If not, run `npm start` again
   - If yes, check if there are error messages
2. Go to `http://localhost:3001/health` in browser
   - Should show `{"status":"ok"}`
   - If blank or error, backend isn't responding

---

### Password not working for edit/delete

**Problem:** You created a group with password "password123" but it says "Invalid password" when you try to edit.

**Cause:** Password is case-sensitive and must be exact.

**Solution:**
- Make sure Caps Lock is off
- Make sure you're typing the exact same password
- If you forgot it, you have to delete the group (you can't recover it without password)
- For future groups, write the password down!

---

### Changed words in edit but they didn't save

**Problem:** You edited a group, clicked save, but when you play it, the old words are still there.

**Cause:** Check if you saw a success message. If not, something went wrong.

**Solution:**
1. Make sure you entered the correct password
2. Check browser console for errors (F12)
3. Try again
4. If still failing, restart the server

---

## Deployment Problems

### "CORS error" when accessing from different computer

**Problem:** You deployed to Railway/Render and get a CORS error in the browser console.

**Cause:** Frontend and backend are on different domains. Browser blocks it for security.

**Cause:** Actually, this shouldn't happen because CORS is enabled in `server.js`. But if it does:

**Solution:**
1. Check that your API_BASE in `app.js` is correct:
   ```javascript
   const API_BASE = 'https://your-railway-url/api';
   ```
2. Check that Railway/Render is running (check their dashboard)
3. Test manually:
   ```
   https://your-railway-url/health
   ```
   Should return `{"status":"ok"}`

---

### Backend deployed but frontend shows "Cannot reach server"

**Problem:** Frontend is deployed but can't talk to backend.

**Cause:** Frontend and backend URLs don't match.

**Solution:**
1. Find your backend URL (from Railway/Render dashboard)
2. Update `public/app.js`:
   ```javascript
   const API_BASE = 'https://your-actual-backend-url/api';
   ```
3. Redeploy frontend (or if Railway, it auto-redeploys on push)

---

### Data disappeared after deploying

**Problem:** Groups you created locally are gone after deploying.

**Cause:** You had a local database file (`greek_learning.db`) but the deployed version starts fresh.

**Solution:**
- This is expected behavior
- Deployed database is separate from local
- Ask your class to start creating groups on deployed version
- (Advanced: You can export/import database, but that's complex)

---

## Browser/Client Problems

### App looks ugly/broken

**Problem:** Sketchy design isn't showing, fonts look wrong.

**Cause:** CSS isn't loading.

**Solution:**
1. Check browser console (F12) for CSS errors
2. Make sure you're accessing `http://localhost:3001` (not just `localhost:3001`)
3. Check that `public/style.css` exists in your folder
4. Refresh page (Ctrl+F5 to hard refresh)

---

### Cards don't respond to clicks in game

**Problem:** You click on cards but nothing happens.

**Cause:** JavaScript error or app didn't load properly.

**Solution:**
1. Press F12 to open console
2. Look for red errors
3. Try refreshing the page
4. Try a different browser (Chrome, Firefox, Safari)

---

### Game doesn't shuffle correctly (same order every time)

**Problem:** Every time you play, cards are in the same position.

**Cause:** Random shuffle might be working but looks non-random by chance.

**Solution:**
- This is actually fine - try playing multiple times, they should vary
- If truly not shuffling, check browser console for errors

---

### Creates a group but can't see it

**Problem:** You create a group, click "Create" and it goes back to home, but no new group appears.

**Cause:** Either it didn't save, or you need to refresh.

**Solution:**
1. Refresh the page (F5)
2. Try creating again
3. If still not showing, check:
   - Did you see a success message?
   - Check browser console (F12) for errors
   - Check server terminal for error messages

---

## Performance Problems

### App is slow / laggy

**Problem:** Clicking buttons takes forever, game is sluggish.

**Cause:** Usually network latency or too many groups.

**Solution:**
1. Make sure backend is running
2. Check internet connection
3. Close other apps using internet
4. Refresh page
5. If deployed, might be slow server - try again in different time of day

---

### Database is huge and slow

**Problem:** After creating many groups, app gets slower.

**Cause:** SQLite performance degrades with lots of data.

**Solution:**
1. Delete old test groups you don't need
2. Delete the database and start fresh:
   ```bash
   rm greek_learning.db
   npm start
   ```
3. When you have thousands of groups, migrate to PostgreSQL (advanced)

---

## Feature Not Working

### Can't add more than 4 words to a group

**Problem:** Form only shows 4 word input pairs.

**Cause:** By design - game is built for 4 pairs (8 cards).

**Solution:**
- The form only shows 4 pairs because the game only displays 4 at a time
- If you want different game size, edit `public/app.js` function `renderCreateScreen()`
- Change the loop from `[1, 2, 3, 4]` to `[1, 2, 3, 4, 5, 6]` for 6 pairs

---

### Want to add audio/images to words

**Problem:** App doesn't support audio or images yet.

**Cause:** Not built in yet.

**Solution:**
- This requires database schema changes
- Would need to store URLs for audio/images
- Then display them in game
- Intermediate to advanced feature
- Ask if you want to add this

---

### Want users to have accounts

**Problem:** Currently anyone can edit/delete groups if they know password.

**Cause:** By design (simplicity).

**Solution:**
- This requires authentication (login system)
- Need to add users table, login screen, sessions
- Advanced feature
- Current approach (password per group) is simpler

---

## Getting Help

### When asking for help, provide:

1. **What you were doing** - "I was creating a group..."
2. **What happened** - "I got an error..."
3. **The exact error message** - screenshot or copy-paste
4. **What you already tried** - "I restarted..."

### Where to find answers:
1. Check this file first
2. Check QUICKSTART.md for basic setup
3. Check ARCHITECTURE.md for how things work
4. Check code comments in `server.js` and `public/app.js`

### If you find a bug:
1. Note exactly how to reproduce it
2. Check browser console (F12) for errors
3. Check server terminal for errors
4. Try with fresh database (delete `greek_learning.db`)

---

## Advanced Troubleshooting

### Check server logs

Terminal where you run `npm start` shows logs. Look for:
- `Server running on...` - good, running
- `Database connection error` - database problem
- `POST /api/groups` - API calls being made
- Stack traces - actual errors

### Check browser console

Press F12, go to Console tab:
- Red messages = errors
- Yellow = warnings (usually OK)
- Blue = info (usually OK)

### Check database directly

If you have SQLite viewer:
```bash
sqlite3 greek_learning.db
SELECT * FROM groups;
SELECT * FROM words;
```

### Check network requests

F12 → Network tab:
- Click on API requests
- See what data was sent/received
- See response status (200 = OK, 400 = error, 500 = server error)

---

## When Nothing Else Works

**The nuclear option:**

1. Delete entire project folder
2. Download fresh copy
3. Delete `node_modules` folder
4. Delete `package-lock.json` file
5. Start over:
   ```bash
   npm install
   npm start
   ```

This fixes 95% of weird issues.

---

## Known Limitations

- **SQLite only** - works great for learning, but not suited for 10,000+ users
- **No user accounts** - everyone is anonymous (feature, not bug)
- **No analytics** - can't see who's learning what
- **4 pairs per game** - by design for focus
- **No offline mode** - needs backend running
- **No undo/recover** - delete is permanent

These can all be added later if needed.

---

Still stuck? Check QUICKSTART.md step-by-step again.
