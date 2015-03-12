var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');

//var users = require('./routes/users');
var api = require('./routes/api');
var dbconfig = require('./config/databaseLocal');  // `cp config/database.js config/databaseLocal.js` and edit

var app = express();

app.set('hostname', process.env.C9_HOSTNAME || 'localhost');
app.set('port', process.env.PORT || 3000);
app.set('baseURL', process.env.baseURL || 'http://' + app.get('hostname') + ':' + app.get('port'));

mongoose.connect(dbconfig.url);

require('./config/passport')(app, passport); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    //name: cookie_name,
    store: new MongoStore({  // connect-mongo session store
        url: dbconfig.url
    }),
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//app.use(favicon(__dirname + '/public/images/spider.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/test', express.static(path.join(__dirname, 'test', 'static')));
app.use('/api', api);
require('./routes/local-auth')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/connect_account')(app, passport);
app.use(express.static(path.join(__dirname, 'public')));
app.use('*', require('./routes/index'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;