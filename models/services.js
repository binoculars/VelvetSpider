var fs = require('fs');

module.exports = {
    services: {},
    infos: [],
    scopes: [],
    authLibs: [],
    userModels: []
};

fs.readdirSync(__dirname + '/../public/javascripts/services').filter(function(file) {
    return file.slice(-5) == '.json';
}).map(function (file) {
    var service = require('../public/javascripts/services/' + file);

    module.exports.services[service.id] = service;

    module.exports.infos.push({
         id: service.id,
         icon: service.icon,
         name: service.name,
         schema: file
    });

    module.exports.scopes.push({
        id: service.id,
        scope: service.auth.scope
    });

    if (service.auth.library) {
        module.exports.authLibs.push({
            id: service.id,
            strategy: require(service.auth.library.name)[service.auth.library.strategy]
        });
    }
    
    if (service.auth.userModel) {
        module.exports.userModels.push({
            id: service.id,
            userModel: service.auth.userModel
        });
    }
});