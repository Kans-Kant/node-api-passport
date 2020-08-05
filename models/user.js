var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var uniqueValidator = require('mongoose-unique-validator');

var UserSchema = new Schema({
  email: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false,
    },
    sexe: {
        type: String,
        required: false,
    }
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

//UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('users', UserSchema);
