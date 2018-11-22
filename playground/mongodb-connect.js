const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, function (err, client) {

    if (err)
        return console.log('Нихуа не получилось:(');

    console.log('Приконнектились епты!!11');

    var db = client.db();

    // db.collection('Todos').insertOne({
    //     text: 'Vi ohueli!',
    //     completed: false
    // }, function (err, result) {
    //     if (err)
    //         return console.log('не получилось вставить', err);
    //
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    db.collection('Users').insertOne({
        name: 'Alya',
        age: 25,
        location: 'mordor'
    }, function (err, result) {
        if (err)
            return console.log('не получилось вставить', err);

        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    client.close();
});