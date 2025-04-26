// server.js
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
let puzzles = [];

app.use(cors());
app.use(express.static('public')); // for serving frontend

// Load puzzles from CSV (limit for now to 1000)
fs.createReadStream('lichess_reduced.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (puzzles.length < 1000) {
      puzzles.push({
        id: row.PuzzleId,
        fen: row.FEN,
        moves: row.Moves.split(' '),
        rating: parseInt(row.Rating),  // Convert rating to integer for easier filtering
        themes: row.Themes.split(' '),
      });
    }
  })
  .on('end', () => {
    console.log('✅ CSV loaded!');
  });

app.get('/puzzle/random', (req, res) => {
  // Get min and max rating from query parameters
  const minRating = parseInt(req.query.minRating) || 0;
  const maxRating = parseInt(req.query.maxRating) || 3000;
  
  // Filter puzzles based on rating
  const filteredPuzzles = puzzles.filter(puzzle => 
    puzzle.rating >= minRating && puzzle.rating <= maxRating
  );
  
  // If no puzzles match the criteria, return any puzzle
  if (filteredPuzzles.length === 0) {
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    console.log('No puzzles in rating range, returning random puzzle');
    return res.json(randomPuzzle);
  }
  
  // Return a random puzzle from the filtered list
  const randomPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
  console.log(`Returning puzzle with rating ${randomPuzzle.rating} (in range ${minRating}-${maxRating})`);
  res.json(randomPuzzle);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});