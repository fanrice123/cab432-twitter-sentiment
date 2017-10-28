const passport = require('passport');
const request = require('request');
const FacebookStrategy = require('passport-facebook').Strategy;

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
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['name', 'email', 'link', 'gender', 'birthday'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  User.findOne({
    facebook: profile.id
  }, (err, user) => {
    if (err) return done(err);

    // If there is existing user
    if (user) {
      // Save obtained birthday from re-request route
      if (user.birthday == null)
        user.birthday = profile._json.birthday ? profile._json.birthday : null;
      // Save user to session
      req.session.user = {
        name: user.name,
        birthday: user.birthday,
        gender: user.gender
      }

      req.session.save((err) => {
        if (err) return done(err);
        return done(null, user);
      });
    } else {
      // Save new user
      const user = new User();
      user.email = profile._json.email;
      user.facebook = profile.id;
      user.tokens.push({
        kind: 'facebook',
        accessToken
      });
      user.name = `${profile.name.givenName} ${profile.name.familyName}`;
      user.gender = profile._json.gender;
      user.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
      user.birthday = profile._json.birthday ? profile._json.birthday : null;
      user.save((err) => {
        // Save user to session
        req.session.user = {
          name: user.name,
          birthday: user.birthday,
          gender: user.gender
        }
        req.session.save((err) => {
          if (err) return done(err);
          return done(null, user);
        });
      });
    }
  });
}));

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
