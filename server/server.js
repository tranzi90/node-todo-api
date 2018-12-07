var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
const {ObjectID} = require('mongodb');

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

app.listen(port, function () {
    console.log(`Пайехалле блять на порту ${port}`);
});

module.exports = {app};