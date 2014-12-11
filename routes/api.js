var express = require('express');
var router = express.Router();
var auth = require('../config/authLocal'); // run `cp config/auth.js config/authLocal.js` and fill out the info.
var OAuth = require('oauth');
var querystring = require('querystring');
var request = require('request');

// Wrap node-oauth
// TODO make this its own module
// TODO add post, put, and delete to rest objects
function setupOAuth(service) {
    var authObj = {
	    customParameters: service.customParameters
    };

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
                get: function(url, credentials, callback) {
                    authObj.auth.get(
                        url,
                        credentials.token,
                        credentials.tokenSecret,
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
                get: function(url, credentials, callback) {
                    authObj.auth.get(
                        url,
                        credentials.access_token,
                        callback
                    );
                }
            };
            break;
    }

    return authObj;
}

var auths = {};
var servicesModel = require('../models/services');
var services = servicesModel.services;
    
Object.keys(services).map(function (id) {
    if (services[id].auth.type == 'none') {
        auths[id] = {
            type: services[id].auth.type,
            customParameters: services[id].customParameters
        };
    } else {
        if (services[id].auth)
            auths[id] = setupOAuth(services[id]);
    }
});

 // TODO: require user to be logged in
 // TODO: error handling for bad requests
 // TODO: error handling for bad/no user credentials
router.get('/service/:service', function(req, res) {
    console.log(req.query);

    var serviceID = req.params.service;
    var user = req.user;
	var auth = auths[serviceID];
    var params = JSON.parse(req.query.req);
    
    if (auth.customParameters) {
        Object.keys(auth.customParameters).map(function (key) {
            params[key] = auth.customParameters[key];
        });
    }

    if (auth.type == 'none') {
        request(
            {
                url: req.query.url + '?' + querystring.stringify(params),
                headers: {
                    'User-Agent': 'request'
                }
            },
            function(e, resp, body) {
                if (e)
                    console.error(e);
                    
                res.json({
                    headers: e ? {statusCode: e.statusCode} : resp.headers,
                    body: e ? e.data : body
                });
            }
        );
    } else {
        var credentials = {};

        if (user) {
            if (services[serviceID].auth.version == '1.0A') {
                credentials = {
                    token: user[serviceID].token,
                    tokenSecret: user[serviceID].refreshTokenOrTokenSecret
                };
            } else if (services[serviceID].auth.version == '2.0') {
                credentials = {
                    access_token: user[serviceID].token
                };
            }
        }

        auth.rest.get(
            req.query.url + '?' + querystring.stringify(params),
            credentials,
            function (e, data, resp) {
                if (e)
                    console.error(e);
                
                res.json({
                    headers: e ? {statusCode: e.statusCode} : resp.headers,
                    body: e ? e.data : data
                });
            }
        );
    }
});

router.get('/listServices', function(req, res) {
    res.json(servicesModel.infos);
});

module.exports = router;