const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, function (err, client) {

    if (err)
        return console.log('Нихуа не получилось:(');

    console.log('Приконнектились епты!!11');

    var db = client.db();

    // db.collection('Todos').deleteMany({text: 'дупликат'}).then(function (result) {
    //     console.log(result);
    // });

    // db.collection('Todos').deleteOne({text: 'bleat'}).then(function (result) {
    //     console.log(result);
    // });

    // db.collection('Todos').findOneAndDelete({completed: false}).then(function (result) {
    //     console.log(result);
    // });

    // db.collection('Users').deleteMany({name: 'Den'});

    db.collection('Users').findOneAndDelete({_id: new ObjectID('5bf55309d2d13b17ac6bf51f')}).then(function (result) {
        console.log(result);
    });

    // client.close();
});