var fs = require('fs');

module.exports = {
    services: {},
    infos: [],
    scopes: [],
    authLibs: []
};

fs.readdirSync(__dirname + '/../public/javascripts/services').map(function (file) {
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

    module.exports.authLibs.push({
        id: service.id,
        strategy: require(service.auth.library.name)[service.auth.library.strategy]
    });
});