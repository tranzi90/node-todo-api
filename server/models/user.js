const { mongoose } = require('./../db/mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

// const {users} = require('../tests/seed/seed');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} incorrect e-mail',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [
        {
            access: {
                type: String,
                required: true,
            },
            token: {
                type: String,
                required: true,
            },
        },
    ],
})

UserSchema.methods.toJSON = function () {
    return _.pick(this.toObject(), ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = function () {
    var access = 'auth'
    var token = jwt
        .sign(
            { _id: this._id.toString(), access },
            process.env.JWT_SECRET || 'dla/;dsm;glm3-2058u6-2439y5vuj5t94'
        )
        .toString()

    this.tokens.push({ access, token })

    return this.save().then(() => token)
}

UserSchema.methods.removeToken = function (token) {
    return this.updateOne({
        $pull: {
            tokens: {
                token,
            },
        },
    })
}

UserSchema.statics.findByToken = function (token) {
    try {
        var decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'dla/;dsm;glm3-2058u6-2439y5vuj5t94'
        )
    } catch (e) {
        return Promise.reject(e)
    }

    return this.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth',
    })
}

UserSchema.statics.findByCredentials = async function (email, password) {
    try {
        const user = await this.findOne({ email })
        const match = await bcrypt.compare(password, user.password)
        if (match) return user
    } catch (e) {
        throw new Error()
    }
}

UserSchema.pre('save', function (next) {
    let user = this

    if (user.isModified('password')) {
        bcrypt.genSalt(14, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash
                next()
            })
        })
    } else next()
})

var User = mongoose.model('User', UserSchema)

module.exports = { User }
