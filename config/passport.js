var LocalStrategy    = require('passport-local').Strategy;
var User       = require('../models/user'); // load up the user model
var configAuth = require('./authLocal'); // load the auth variables // TODO: Move this to the database

module.exports = function(app, passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy(
        { passReqToCallback : true }, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        function(req, username, password, done) {
            process.nextTick(function() { // asynchronous
                User.findOne({ 'local.username':  username }, function(err, user) {
                    if (err) // if there are any errors, return the error
                        return done(err);

                    if (!user) // if no user is found, return the message
                        return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    else // all is well, return user
                        return done(null, user);
                });
            });
        }
    ));

    passport.use('local-signup', new LocalStrategy(
        { passReqToCallback: true },
        function(req, username, password, done) {
            process.nextTick(function() { // asynchronous
                //  Whether we're signing up or connecting an account, we'll need to know if the username address is in use.
                User.findOne({'local.username': username}, function(err, existingUser) {
                    if (err) // if there are any errors, return the error
                        return done(err);

                    if (existingUser) // check to see if there's already a user with that username
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));

                    var user = req.user ? req.user : new User();
                    user.local.username = username;
                    user.local.password = user.generateHash(password);
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                });
            });
        }
    ));

    require('../models/services').authLibs.forEach(function(service) {
        service.config = configAuth[service.id];
        service.config.callbackURL = app.get('baseURL') + '/auth/' + service.id + '/callback';
        service.config.passReqToCallback = true;

        passport.use(new service.strategy(service.config,
            function(req, token, refreshTokenOrTokenSecret, profile, done) {
                function save(user) {
                    user[service.id].id = profile.id;
                    user[service.id].token = token;
                    user[service.id].refreshTokenOrTokenSecret = refreshTokenOrTokenSecret;

                    user.save(function(err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }

                process.nextTick(function() { // asynchronous
                    if (!req.user) { // check if the user is already logged in
                        var findConfig = {};
                        findConfig[service.id + '.id'] = profile.id;

                        User.findOne(findConfig, function(err, user) {
                            if (err)
                                return done(err);

                            if (user && user[service.id].token)
                                return done(null, user); // user found, return that user
                            else
                                user = new User();

                            save(user);
                        });
                    } else { // user already exists and is logged in, we have to link accounts
                        save(req.user); // pull the user out of the session
                    }
                });
            }
        ));
    });
};