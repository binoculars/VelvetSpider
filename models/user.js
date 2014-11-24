var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var schema = {
    "local": {
        "username": "String",
        "password": "String"
    }
};

require('./services').userModels.forEach(function(service){
    schema[service.id] = service.userModel;
});

// define the schema for our user model
var userSchema = mongoose.Schema(schema);

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