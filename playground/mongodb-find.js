const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, function (err, client) {

    if (err)
        return console.log('Нихуа не получилось:(');

    console.log('Приконнектились епты!!11');

    var db = client.db();

    // db.collection('Todos').find({
    //     _id : new ObjectID('5bf3fd5b41d84f18e4a99b50')
    // }).toArray().then(function (docs) {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, function (err) {
    //     console.log('Нихуа не получилось:(', err);
    // });

    // db.collection('Todos').find().count().then(function (count) {
    //     console.log(`Todos total: ${count}`);
    // }, function (err) {
    //     console.log('Нихуа не получилось:(', err);
    // });

    db.collection('Users').find({name: 'Den'}).toArray().then(function (docs) {
        console.log(JSON.stringify(docs, undefined, 2));
    }, function (err) {
        console.log('Нихуа не получилось:(', err);
    });

    // client.close();
});