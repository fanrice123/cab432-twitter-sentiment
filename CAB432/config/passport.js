const passport = require('passport');
const request = require('request');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

// Middleware to check if required inputs are obtained before analysis
exports.detailsObtained = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('errors', {
      msg: 'Oops. We need your info to proceed'
    });
    res.redirect('/home');
  }
};
