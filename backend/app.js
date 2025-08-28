const express = require('express');
const app = express();
const todoRoutes = require('./routes/todos');

app.use(express.json());
app.use('/api/todos', todoRoutes);

// Serve simple HTML directly
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Todo App</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; }
        h1 { color: #333; }
        ul { list-style: none; padding: 0; }
        li { padding: 0.5rem 0; border-bottom: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <h1>Team A Todos</h1>
      <ul id="todo-list"></ul>

      <script>
        fetch('/api/todos')
          .then(response => response.json())
          .then(todos => {
            const list = document.getElementById('todo-list');
            todos.forEach(todo => {
              const li = document.createElement('li');
              li.textContent = todo.title + (todo.completed ? ' ✅' : '');
              list.appendChild(li);
            });
          })
          .catch(err => {
            console.error('Error fetching todos:', err);
          });
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
