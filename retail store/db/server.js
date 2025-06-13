const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve frontend files

// Sample data (replace with a real database later)
const items = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Orange" }
];

// Search endpoint
app.get('/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const results = items.filter(item =>
        item.name.toLowerCase().includes(query)
    );
    res.json(results);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});