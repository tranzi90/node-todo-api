const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', function (req, res) {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then(function (doc) {
        res.send(doc);
    }, function (e) {
        res.status(400).send(e);
    });
});

app.get('/todos', function (req, res) {
    Todo.find().then(function (todos) {
        res.send({todos});
    }, function (e) {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', function (req, res) {
    var id = req.params.id;

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    Todo.findById(id).then(function (todo) {
        if (!todo)
            return res.status(404).send();

        res.send({todo});
    }).catch(() => res.status(400).send());
});

app.delete('/todos/:id', function (req, res) {
    let id = req.params.id;

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    Todo.findByIdAndDelete(id).then(function (todo) {
        if (!todo)
            return res.status(404).send();

        res.send({todo});
    }).catch(() => res.status(400).send());
});

app.patch('/todos/:id', function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    if (_.isBoolean(body.completed) && body.completed)
        body.completedAt = new Date().getTime();
    else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(function (todo) {
        if (!todo)
            return res.status(404).send();

        res.send({todo});
    }).catch(() => res.status(400).send());
});

app.post('/users', function (req, res) {
    let user = new User(_.pick(req.body, ['email', 'password']));

    user.save().then(function () {
        res.header('x-auth', user.generateAuthToken()).send(user);
    }, function (e) {
        res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, function (req, res) {
    res.send(req.user);
});

app.post('/users/login', function (req, res) {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then(function (user) {
            res.header('x-auth', user.generateAuthToken()).send(user);
        })
        .catch(() => res.status(400).send());
});

app.listen(port, function () {
    console.log(`Пайехалле блять на порту ${port}`);
});

module.exports = {app};