const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5bfd22de5ba56632c4921143';
//
// if (!ObjectID.isValid(id))
//     console.log('bad id');

// Todo.find({
//     _id: id
// }).then(function (todos) {
//     console.log(todos);
// });
//
// Todo.findOne({
//     _id: id
// }).then(function (todo) {
//     console.log(todo);
// });

// Todo.findById(id).then(function (todo) {
//     if (!todo)
//         return console.log('ашипка бро');
//
//     console.log(todo);
// }).catch((e) => console.log(e));

User.findById(id).then(function (user) {
    if (!user)
        return console.log('нема якого юзера');

    console.log(user);
}).catch((e) => console.log(e));