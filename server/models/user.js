const {mongoose} = require('./../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
    var token = jwt.sign({_id: this._id.toString(), access}, process.env.JWT_SECRET).toString();

    this.tokens.push({access, token});

    return this.save().then(() => token);
};

UserSchema.methods.removeToken = function (token) {
    return this.updateOne({
        $pull: {
            tokens: {
                 token
            }
        }
    });
};

UserSchema.statics.findByToken = function (token) {
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject(e);
    }

    return this.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {

     return this.findOne({email}).then(function (user) {
        if (!user)
            return Promise.reject();
        
        return new Promise(function (resolve, reject) {
            bcrypt.compare(password, user.password, function (err, res) {
                if (res)
                    resolve(user);
                else
                    reject(err);
            });
        });
    });
};

UserSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(14, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash;
                next();
            });
        });
    }
    else
        next();
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};