module.exports = function(app, passport) {
    
    // TODO read this from /public/javascripts/services
    var services = [{
        'name': 'facebook',
        'scope' : 'email'
    }, {
        'name': 'twitter',
        'scope' : 'email'
    }, {
        'name': 'google',
        'scope' : ['profile', 'email']
    }, {
        'name': 'instagram',
        'scope': ''
    }, {
        'name': 'linkedin',
        'scope': ''
    }];

    services.forEach(function(service) {
        // =============================================================================
        // AUTHENTICATE (FIRST LOGIN) ==================================================
        // =============================================================================

        app.get('/auth/' + service.name,
            passport.authenticate(service.name, {
                scope : service.scope
            })
        );

        // the callback after google has authenticated the user
        app.get('/auth/' + service.name + '/callback',
            passport.authenticate(service.name, {
                successRedirect : '/profile',
                failureRedirect : '/'
            })
        );

        // =============================================================================
        // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
        // =============================================================================

        app.get('/connect/' + service.name,
            passport.authorize(
                service.name, {
                scope : service.scope
            })
        );

        app.get('/connect/' + service.name + '/callback',
            passport.authorize(service.name, {
                successRedirect : '/profile',
                failureRedirect : '/'
            })
        );

        // =============================================================================
        // UNLINK ACCOUNTS =============================================================
        // =============================================================================
        // used to unlink accounts. for social accounts, just remove the token
        // for local account, remove email and password
        // user account will stay active in case they want to reconnect in the future

        app.get('/unlink/:service', isLoggedIn, function(req, res) {
            var user            = req.user;

            user[req.params.service].token = undefined;

            user.save(function(err) {
                res.redirect('/profile');
            });
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
