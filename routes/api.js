var express = require('express');
var router = express.Router();

var fs = require('fs');

var auth = require('../config/authLocal'); // run `cp config/auth.js config/authLocal.js` and fill out the info.
var userTokens = require('../config/userTokensLocal'); // run `cp config/userTokens.js config/userTokensLocal.js` and fill out the info.

var OAuth = require('oauth');
var querystring = require('querystring');

// Wrap node-oauth
function setupOAuth(service) {
    var authObj = {};

    switch (service.auth.version) {
        case '1.0A':
            authObj.auth = new OAuth.OAuth(
                service.auth.requestTokenURL,
                service.auth.accessTokenURL,
                auth[service.id].consumerKey,
                auth[service.id].consumerSecret,
                service.auth.version,
                null, //
                service.auth.signatureMethod,
                null, // Nonce Size defaults to 32
                null  // Custom Headers
            );

            authObj.rest = {
                get: function(url, callback) {
                    authObj.auth.get(
                        url,
                        userTokens[service.id].token,
                        userTokens[service.id].tokenSecret,
                        callback
                    );
                }
            };
            break;
        case '2.0':
            authObj.auth = new OAuth.OAuth2(
                auth[service.id].clientID,
                auth[service.id].clientSecret,
                service.auth.baseSite,
                service.auth.authorizePath,
                service.auth.accessTokenPath,
                null // Custom Headers
            );

            authObj.rest = {
                get: function(url, callback) {
                    authObj.auth.get(
                        url,
                        userTokens[service.id].access_token,
                        callback
                    );
                }
            };
            break;
    }

    return authObj;
}

var oauths = {};
var services = {};
var servicesInfo = [];

fs.readdir('public/javascripts/services/', function(err, files) {
    files.map(function (file) {
        var service = require('../public/javascripts/services/' + file);

        services[service.id] = service;

        servicesInfo.push({
            id: service.id,
            icon: service.icon,
            name: service.name,
            schema: file
        });

        if (service.auth)
            oauths[service.id] = setupOAuth(service);
    });
});

router.get('/service/:service', function(req, res) {
    console.log(req.query);

    var params = JSON.parse(req.query.req);

    oauths[req.params.service].rest.get(
        req.query.url + '?' + querystring.stringify(params),
        function (e, data, resp) {
            if (e) console.error(e);

            res.send(data);
        }
    );
});

router.get('/listServices', function(req, res) {
    res.send(servicesInfo);
});

module.exports = router;
