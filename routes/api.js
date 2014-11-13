var express = require('express');
var router = express.Router();

var fs = require('fs');

var auth = require('../config/authLocal'); // run `cp config/auth.js config/authLocal.js` and fill out the info.

var OAuth = require('oauth');
var querystring = require('querystring');

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

var oauths = {};
var services = {};
var servicesInfo = [];

fs.readdir(__dirname + '/../public/javascripts/services', function(err, files) {
    if (err)
        console.log(err);
    
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

 // TODO: require user to be logged in
 // TODO: error handling for bad requests
 // TODO: error handling for bad/no user credentials
 router.get('/service/:service', function(req, res) {
    console.log(req.query);

    var serviceID = req.params.service;
    var user = req.user;
	var oauth = oauths[serviceID];
    var params = JSON.parse(req.query.req);
    var credentials = {};
    
	if (oauth.customParameters) {
		Object.keys(oauth.customParameters).map(function (key) {
			params[key] = oauth.customParameters[key];
		});
	}
	
	if (user) {
	    if (services[serviceID].auth.version == '1.0A') {
	        credentials = {
	            token: user[serviceID].token,
	            tokenSecret: user[serviceID].refreshTokenOrTokenSecret
	        };
	    } else if (services[serviceID].auth.version == '2.0') {
	        credentials = {
	            access_token: user[serviceID].token
	        }
	    }
	}

	oauth.rest.get(
        req.query.url + '?' + querystring.stringify(params),
        credentials,
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