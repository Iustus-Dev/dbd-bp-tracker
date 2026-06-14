const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'matches.json');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

/**
 * Helper to read matches from JSON file
 */
const readMatches = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading matches:', error);
    return [];
  }
};

/**
 * Helper to write matches to JSON file
 */
const writeMatches = (matches) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(matches, null, 2));
  } catch (error) {
    console.error('Error writing matches:', error);
  }
};

/**
 * GET /api/matches
 * Returns all recorded matches
 */
app.get('/api/matches', (req, res) => {
  const matches = readMatches();
  res.json(matches);
});

/**
 * POST /api/matches
 * Stores a new match round
 * Body: { character: string, bloodpoints: number }
 */
app.post('/api/matches', (req, res) => {
  const { character, bloodpoints } = req.body;

  if (!character || bloodpoints === undefined) {
    return res.status(400).json({ error: 'Missing character or bloodpoints' });
  }

  const newMatch = {
    id: uuidv4(),
    character,
    bloodpoints: Number(bloodpoints),
    timestamp: new Date().toISOString()
  };

  const matches = readMatches();
  matches.push(newMatch);
  writeMatches(matches);

  res.status(201).json(newMatch);
});

/**
 * DELETE /api/matches/:id
 * Removes a specific match by ID
 */
app.delete('/api/matches/:id', (req, res) => {
  const { id } = req.params;
  const matches = readMatches();
  const filteredMatches = matches.filter(m => m.id !== id);

  if (matches.length === filteredMatches.length) {
    return res.status(404).json({ error: 'Match not found' });
  }

  writeMatches(filteredMatches);
  res.status(200).json({ message: 'Match deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
