const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, function (req, res) {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then(function (doc) {
        res.send(doc);
    }, function (e) {
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, function (req, res) {
    Todo.find({
        _creator: req.user._id
    }).then(function (todos) {
        res.send({todos});
    }, function (e) {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, function (req, res) {
    var id = req.params.id;

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then(function (todo) {
        if (!todo)
            return res.status(404).send();

        res.send({todo});
    }).catch(() => res.status(400).send());
});

app.delete('/todos/:id', authenticate, async function (req, res) {
    let id = req.params.id;

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    try {
        const todo = await Todo.findOneAndDelete({
            _id: id,
            _creator: req.user._id
        });

        if (!todo)
            return res.status(404).send();

        res.send({todo});
    } catch (e) {
        res.status(400).send();
    }
});

app.patch('/todos/:id', authenticate, function (req, res) {
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

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true}).then(function (todo) {
        if (!todo)
            return res.status(404).send();

        res.send({todo});
    }).catch(() => res.status(400).send());
});

app.post('/users', async function (req, res) {
    try {
        const user = new User(_.pick(req.body, ['email', 'password']));
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/users/me', authenticate, function (req, res) {
    res.send(req.user);
});

app.post('/users/login', async function (req, res) {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    }
});

app.delete('/users/me/token', authenticate, async function (req, res) {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});

app.listen(port, function () {
    console.log(`Running on port ${port}`);
});

module.exports = {app};