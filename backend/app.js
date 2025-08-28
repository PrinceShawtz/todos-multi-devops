const express = require('express');
const path = require('path'); // ✅ required to serve static files
const app = express();
const todoRoutes = require('./routes/todos');

app.use(express.json());
app.use('/api/todos', todoRoutes);

// serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// optional: explicitly serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
