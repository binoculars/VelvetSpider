module.exports = function(app, passport) {
    require('../models/services').scopes.forEach(function(service) {
        // =============================================================================
        // AUTHENTICATE (FIRST LOGIN) ==================================================
        // =============================================================================

        app.get('/auth/' + service.id,
            passport.authenticate(service.id, {
                scope : service.scope
            })
        );

        // the callback after the service has authenticated the user
        app.get('/auth/' + service.id + '/callback',
            passport.authenticate(service.id, {
                successRedirect : '/profile',
                failureRedirect : '/'
            })
        );

        // =============================================================================
        // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
        // =============================================================================

        app.get('/connect/' + service.id,
            passport.authorize(
                service.id, {
                scope : service.scope
            })
        );

        app.get('/connect/' + service.id + '/callback',
            passport.authorize(service.id, {
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
            var user = req.user;

            user[req.params.service].token = undefined;

            user.save(function(err) {
                if (err) console.log(err);
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