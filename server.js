const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Port for deployment platforms or fallback to 3000 locally
const port = process.env.PORT || 3000;

// Secret key for protecting answer viewing and clearing routes
const secretKey = 'DIVYANSH';

app.use(cors());
app.use(express.json());

// POST /vote route to accept RSVP submissions
app.post('/vote', (req, res) => {
  const { name, answer } = req.body;

  console.log(`Received vote - Name: ${name}, Answer: ${answer}`); // Debug log

  if (!name || !answer) {
    return res.status(400).json({ status: 'error', message: 'Missing name or answer' });
  }

  try {
    fs.appendFileSync('answer.txt', `${name}: ${answer}\n`);
    console.log('Vote saved successfully');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Error writing to answer.txt:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Secure GET /answers endpoint to view RSVP responses
app.get('/answers', (req, res) => {
  const key = req.query.key;

  if (key !== secretKey) {
    return res.status(403).send('Forbidden: Invalid key');
  }

  const filePath = path.join(__dirname, 'answer.txt');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('No RSVP answers recorded yet.');
  }

  res.sendFile(filePath, err => {
    if (err) {
      console.error('Error sending answer.txt:', err);
      res.status(500).send('Error loading RSVP answers');
    }
  });
});

// Secure POST /clear endpoint to delete all entries in answer.txt
app.post('/clear', (req, res) => {
  const key = req.query.key;

  if (key !== secretKey) {
    return res.status(403).json({ status: 'error', message: 'Forbidden: Invalid key' });
  }

  const filePath = path.join(__dirname, 'answer.txt');

  fs.writeFile(filePath, '', err => {
    if (err) {
      console.error('Error clearing answer.txt:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to clear RSVP answers' });
    }
    res.json({ status: 'ok', message: 'RSVP answers cleared successfully' });
  });
});

// Optional root route to verify server status (can be removed)
app.get('/', (req, res) => {
  res.send('RSVP backend server is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
