const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} херовая идея...'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {return _.pick(this.toObject(), ['_id', 'email'])};

UserSchema.methods.generateAuthToken = function () {

    var access = 'auth';
    var token = jwt.sign({_id: this._id.toString(), access}, 'secret').toString();

    this.tokens.push({access, token});

    this.save();

    return token;
}

var User = mongoose.model('User', UserSchema);

module.exports = {User};