const jwt = require('jsonwebtoken');

var data = {id: 10};

var token = jwt.sign(data, 'huypizda');
console.log(token);

var decoded = jwt.verify(token, 'huypizda');
console.log(decoded);