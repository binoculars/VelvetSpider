// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../models/user');

// load the auth variables
var configAuth = require('./authLocal'); // use this one for testing

module.exports = function(app, passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({

        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, username, password, done) {

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, username, password, done) {

        // asynchronous
        process.nextTick(function() {

            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the username address is in use.
            User.findOne({'local.username': username}, function(err, existingUser) {

                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if there's already a user with that username
                if (existingUser) 
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));

                //  If we're logged in, we're connecting a new local account.
                if(req.user) {
                    var user            = req.user;
                    user.local.username    = username;
                    user.local.password = user.generateHash(password);
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                } 
                //  We're not logged in, so we're creating a brand new user.
                else {
                    // create the user
                    var newUser            = new User();

                    newUser.local.username    = username;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    require('../models/services').authLibs.forEach(function(service) {
        service.config = configAuth[service.id];
        
        service.config.callbackURL = app.get('baseURL') + '/auth/' + service.id + '/callback';

        service.config.passReqToCallback = true;

        passport.use(new service.strategy(service.config,
            function(req, token, refreshTokenOrTokenSecret, profile, done) {
                console.log(service.id, token, refreshTokenOrTokenSecret);

                function save(user) {
                    user[service.id].id    = profile.id;
                    user[service.id].token = token;
                    user[service.id].refreshTokenOrTokenSecret = refreshTokenOrTokenSecret;

                    user.save(function(err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }

                // asynchronous
                process.nextTick(function() {
                    var user;

                    // check if the user is already logged in
                    if (!req.user) {
                        var findConfig = {};
                        findConfig[service.id + '.id'] = profile.id;

                        User.findOne(findConfig, function(err, user) {
                            if (err)
                                return done(err);

                            if (user) {
                                if (user[service.id].token)
                                    return done(null, user); // user found, return that user
                            } else {
                                user = new User();
                            }

                            save(user);
                        });
                    } else {
                        // user already exists and is logged in, we have to link accounts
                        user = req.user; // pull the user out of the session
                        save(user);
                    }
                });
            }
        ));
    });
};