import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { initializeDatabase, runQuery, getQuery, allQuery } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database on startup
await initializeDatabase();

// GROUPS ENDPOINTS

// Get all groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await allQuery('SELECT id, name, created_at FROM groups ORDER BY created_at DESC');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single group with words
app.get('/api/groups/:id', async (req, res) => {
  try {
    const group = await getQuery('SELECT id, name, created_at FROM groups WHERE id = ?', [req.params.id]);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const words = await allQuery('SELECT id, greek_word, english_translation FROM words WHERE group_id = ?', [req.params.id]);
    
    res.json({ ...group, words });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create group
app.post('/api/groups', async (req, res) => {
  try {
    const { name, password, words } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create group
    const result = await runQuery(
      'INSERT INTO groups (name, password) VALUES (?, ?)',
      [name, hashedPassword]
    );

    const groupId = result.id;

    // Add words if provided
    if (words && Array.isArray(words) && words.length > 0) {
      for (const word of words) {
        await runQuery(
          'INSERT INTO words (group_id, greek_word, english_translation) VALUES (?, ?, ?)',
          [groupId, word.greek, word.english]
        );
      }
    }

    res.status(201).json({ id: groupId, name, message: 'Group created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify password for group
app.post('/api/groups/:id/verify-password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const group = await getQuery('SELECT password FROM groups WHERE id = ?', [req.params.id]);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMatch = await bcrypt.compare(password, group.password);
    res.json({ valid: isMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update group (requires password)
app.put('/api/groups/:id', async (req, res) => {
  try {
    const { password, name, words } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    // Verify password
    const group = await getQuery('SELECT password FROM groups WHERE id = ?', [req.params.id]);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMatch = await bcrypt.compare(password, group.password);
    if (!isMatch) return res.status(403).json({ error: 'Invalid password' });

    // Update group name if provided
    if (name) {
      await runQuery('UPDATE groups SET name = ? WHERE id = ?', [name, req.params.id]);
    }

    // Replace words if provided
    if (words && Array.isArray(words)) {
      await runQuery('DELETE FROM words WHERE group_id = ?', [req.params.id]);
      for (const word of words) {
        await runQuery(
          'INSERT INTO words (group_id, greek_word, english_translation) VALUES (?, ?, ?)',
          [req.params.id, word.greek, word.english]
        );
      }
    }

    res.json({ message: 'Group updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete group (requires password)
app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    // Verify password
    const group = await getQuery('SELECT password FROM groups WHERE id = ?', [req.params.id]);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMatch = await bcrypt.compare(password, group.password);
    if (!isMatch) return res.status(403).json({ error: 'Invalid password' });

    // Delete group (words deleted automatically by CASCADE)
    await runQuery('DELETE FROM groups WHERE id = ?', [req.params.id]);

    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
