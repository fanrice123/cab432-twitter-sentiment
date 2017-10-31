/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const request = require("request");
const Twit = require('twit');
const analyze = require('Sentimental').analyze;
const fs = require("fs");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
  // store: new MongoStore({
  //   url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
  //   autoReconnect: true,
  //   clear_interval: 3600
  // })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests. 
});

/**
 * Primary app routes.
 */
app.get('/', (req, res) => {
  return res.render('landing', { title: "Welcome" });
});

app.get('/home', homeController.index);

var tweets = [];

/**
 * Endpoint for retrieving tweets used for NLP in the backend
 * Tweets limit is based on the user-selected value
 */
app.get('/tweets', (req, res) => {
  let keywords = req.query.keywords;
  let limit = req.query.limit;
  tweets = [];

  if (keywords.length > 0)
    stream = T.stream('statuses/filter', { track: keywords, language: 'en' });
  else
    stream = T.stream('statuses/sample', { language: 'en' });

  stream.on('tweet', (tweet) => {
    if (tweets.length < limit) {
      tweets.push(tweet);
      console.log('Loaded ' + tweets.length + ' of ' + limit);
    }
  });

  // Stop the request after specified seconds
  setTimeout(() => {
    stream.stop();
    req.flash('success', { msg: tweets.length + ' tweets retrieved' });
    res.render('tweets', { title: 'Tweets', keywords: keywords, tweets: tweets });
  }, 5 * 1000);
});

app.get('/test', (req, res) => {
  console.log(tweets[0]);
  let result = [];

  let sample = [];

  var texts = fs.readFileSync("public/data/pos.txt").toString().split("\n");
  var texts2 = fs.readFileSync("public/data/neg.txt").toString().split("\n");

  tweets.forEach(function(tweet) {
    sample.push(tweet.text);
  }, this);

  
  for (i in texts) {
    sample.push(texts[i]);
  }
  
  for (j in texts2) {
    sample.push(texts2[j]);
  }
  
  sample.forEach((data) => {
    result.unshift(analyze(data));
  }, this);
  
  res.json(result);  
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at port %d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
