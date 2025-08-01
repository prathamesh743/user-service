const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3001; // Use Render's PORT or default to 3001 locally

// Initialize SQLite database
const db = new sqlite3.Database(':memory:'); // In-memory for simplicity; use a file for persistence

// Create users table
db.serialize(() => {
  db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)`);
});

// Middleware to parse JSON
app.use(express.json());

// Create a user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  stmt.run(name, email, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    res.status(201).json({ id: this.lastID, name, email });
  });
  stmt.finalize();
});

// Get a user by ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => { // Bind to 0.0.0.0 for Render
  console.log(`User Service running on port ${port}`);
});