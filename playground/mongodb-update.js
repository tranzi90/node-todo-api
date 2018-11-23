const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, function (err, client) {

    if (err)
        return console.log('Нихуа не получилось:(');

    console.log('Приконнектились епты!!11');

    var db = client.db();

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5bf7deee1588232d74b3a91b')
    // }, {
    //     $set: {completed: true}
    // }, {
    //     returnOriginal: false
    // }).then(function (result) {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5bf55ccc14202524d066508c')
    }, {
        $set: {name: 'Den'},
        $inc: {age: 1}
    }, {
        returnOriginal: false
    }).then(function (result) {
        console.log(result);
    });

    // client.close();
});