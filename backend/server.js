var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var TwitterStrategy = require('passport-twitter').Strategy;
var cors = require('cors')
var models = require('./models');

//var routes = require('./routes/routes');
var auth = require('./routes/auth');

var app = express();
var mongoose = require('mongoose');
var connect = "mongodb://localhost:27017/Destime";
mongoose.connect(connect);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport stuff here
app.use(session({
  secret: "mimm",
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));


app.use(cors())
// Tell Passport how to set req.user
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  models.User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Tell passport how to read our user models
// passport.use(new LocalStrategy(function(username, password, done) {
//
//   // Find the user with the given username
//     models.User.findOne({ username: username }, function (err, user) {
//       // if there's an error, finish trying to authenticate (auth failed)
//       if (err) {
//
//         return done(err);
//       }
//       // if no user present, auth failed
//       if (!user) {
//
//         return done(null, false, {message:'Incorrect username'});
//       }
//       // if passwords do not match, auth failed
//       if (user.password !== password) {
//
//         return done(null, false,{message: 'Incorrect password.'});
//       }
//       // auth has has succeeded
//       return done(null, user);
//     });
//   }
// ));

// passport.use(new FacebookStrategy({
//     clientID: process.env.FB_CLIENT_ID,
//     clientSecret: process.env.FB_CLIENT_SECRET,
//     callbackURL: "http://76dda266.ngrok.io/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'photos', 'email', 'name', 'friends']
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     models.User.findOrCreate({ facebookId: profile.id }, {
//       username: profile.displayName,
//       phone: process.env.FROM_PHONE,
//       // facebookToken: accessToken,
//       pictureURL: profile.photos[0].value,
//       friends: profile._json.friends.data
//     }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

// passport.use(new TwitterStrategy({
//     consumerKey: process.env.TWITTER_CONSUMER_KEY,
//     consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//     callbackURL: "http://localhost:3000/auth/twitter/callback"
//   },
//   function(token, tokenSecret, profile, cb) {
//     models.User.findOrCreate({ twitterId: profile.id }, {
//       username: profile.displayName,
//       phone: process.env.FROM_PHONE,
//       pictureURL: profile.photos[0].value,
//       twitterToken: token,
//       twitterTokenSecret: tokenSecret
//     }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', auth(passport));
//app.use('/', routes);
require('./config/passport')(passport);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json( {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json( {
    message: err.message,
    error: {}
  });
});

var test = new models.User({name: 'John Smith'});

// test.save((err) => {
//   if (err) {
//     console.log(err);
//   }
// });


module.exports = app;
