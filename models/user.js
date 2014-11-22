
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local            : {
        username     : String,
        password     : String
    },
    facebook         : { // TODO: read this from json files
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        refreshTokenOrTokenSecret     : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String,
        refreshTokenOrTokenSecret     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        refreshTokenOrTokenSecret     : String
    },
    instagram        : {
        id           : String,
        token        : String,
        refreshTokenOrTokenSecret     : String
    },
    linkedin         : {
        id           : String,
        token        : String,
        refreshTokenOrTokenSecret     : String
    }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
