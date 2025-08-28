const express = require('express');
const app = express();
const todoRoutes = require('./routes/todos');

app.use(express.json());
app.use('/api/todos', todoRoutes);

// Add this 👇
app.get('/', (req, res) => {
  res.send('✅ Todo backend is up and running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
