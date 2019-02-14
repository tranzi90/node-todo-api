const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const user1Id = new ObjectID();
const user2Id = new ObjectID();

const users = [{
    _id: user1Id,
    email: 'acc1@mail.ua',
    password: 'password1',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: user1Id, access: 'auth'}, process.env.JWT_SECRET || 'dla/;dsm;glm3-2058u6-2439y5vuj5t94').toString()
    }]
}, {
    _id: user2Id,
    email: 'acc2@mail.ua',
    password: 'password2',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: user2Id, access: 'auth'}, process.env.JWT_SECRET || 'dla/;dsm;glm3-2058u6-2439y5vuj5t94').toString()
    }]
}];

const todos = [{
    _id: new ObjectID(),
    text: 'test 1',
    _creator: user1Id
}, {
    _id: new ObjectID(),
    text: 'test 2',
    completed: true,
    completedAt: 333,
    _creator: user2Id
}];

const populateTodos = function (done) {
    Todo.deleteMany({})
        .then(() => Todo.insertMany(todos))
        .then(() => done());
};

const populateUsers = function (done) {
    User.deleteMany({})
        .then(() => new User(users[0]).save())
        .then(() => new User(users[1]).save())
        .then(() => done())
};

module.exports = {todos, populateTodos, users, populateUsers};