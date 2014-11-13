var fs = require('fs');

var services = {};

fs.readdirSync(__dirname + '/../public/javascripts/services').map(function (file) {
    var service = require('../public/javascripts/services/' + file);
    
    services[service.id] = service;

    // servicesInfo.push({
    //     id: service.id,
    //     icon: service.icon,
    //     name: service.name,
    //     schema: file
    // });
});

module.exports = {
    getScopes: function() {
        var scopes = [];
        
        Object.keys(services).forEach(function(key) {
            scopes.push({
              id: key,
              scope: services[key].auth.scope
            });
        });
        
        return scopes;
    },
    
    getAuthLibraries: function() {
        var authLibs = [];
        
        Object.keys(services).forEach(function(key) {
            authLibs.push({
              id: key,
              strategy: require(services[key].auth.library.name)[services[key].auth.library.strategy]
            });
        });
        
        return authLibs;
    }
};