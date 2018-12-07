const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.deleteMany({}).then((result) => console.log(result));

Todo.findByIdAndDelete('5c0a4f74158823190ce9f0c7').then((result) => console.log(result));