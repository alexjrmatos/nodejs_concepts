const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
const todos = [];


function checksExistsUserAccount(request, response, next) {
  let { username } = request.headers;
  let user = users.find(user => user.username == username);

  if(!user) {
    return response.status(404).json({
      error: "User not found!"
    })
  };

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  let { name, username } = request.body;

  let userAlreadyExists = users.find(user => user.username === username);
  if(userAlreadyExists) {
    return response.status(400).json({
      error: "This username already exists!"
    })
  }

  let user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  let { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  let { user } = request;
  let { title, deadline } = request.body;
  let todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  let { title, deadline } = request.body;
  let { id } = request.params;

  let todo = users.todos.find(todo => todo.id === id);
  if(!todo) return response.status(404).json({
    error: "Todo not found!"
  });

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let { user } = request;
  let { id } = request.params;

  let todo = users.todos.find(todo => todo.id == id);
  if(!todo) return response.status(404).json({
    error: "Todo not found!"
  });

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  let { user } = request;
  let { id } = request.params;

  let index = users.todos.findIndex(todo => todo.id == id);
  if(index == -1) return response.status(404).json({
    error: "Todo not found!"
  });

  user.todos.splice(index, 1);

  return response.status(204)
});

module.exports = app;