const Twit = require('twit');
const analyze = require('Sentimental').analyze;
const fs = require("fs");
const stopwords = require('../stopwords');
const _ = require('lodash');
const filter = require('../keyword-search');

var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests. 
});

var stream;
var tweets = [];

/**
 * GET /
 * Search page.
 */
exports.result = (req, res) => {
  let keywords = req.query.keywords;
  let limit = req.query.limit;
  tweets = [];
  let analysisResult = [];

  if (keywords.length > 0)
    stream = T.stream('statuses/filter', { track: keywords });
  else
    stream = T.stream('statuses/sample', { language: 'en' });

    stream.on('tweet', (tweet) => {
      tweets.unshift(tweet);
    });

    // Stop the request after specified seconds
  setTimeout(() => {
    stream.stop();
    // req.flash('success', { msg: tweets.length + ' tweets retrieved' });
    // res.render('tweets', { title: 'Tweets', keywords: keywords, tweets: tweets, limit: limit });
    tweets.forEach(function (tweet) {
      analysisResult.unshift(analyze(tweet.text));
    }, this);

    let remaining = limit - analysisResult.length;

    readLocalTweets('public/data/sample_tweets.txt')
      .then(data => {
        let unfilteredSample = data.toString().split('\n');

        filterLocalTweets(keywords, unfilteredSample, analysisResult.length, limit).then(filteredSample => {
          for (i in filteredSample) {
            analysisResult.push(analyze(filteredSample[i]));

            if (analysisResult.length >= limit) break;
          }

          let chartData = createSentimentChartDatset(analysisResult);

          stream.start();

          res.render('result',
            {
              title: 'Result',
              keywords: keywords,
              limit: limit,
              wordCloudData: JSON.stringify(createWordCloudDataset(analysisResult)),
              chartData: JSON.stringify(chartData),
              tweets: tweets
            });
        });
      })
      .catch(error => {
        console.log('Error: ', error);
      });
  }, 5 * 1000);
};


exports.intervalData = (req, res) => {
  res.json(tweets[0]);
}

var createWordCloudDataset = (result) => {
  let array = [];
  result.forEach(function (element) {
    array = array.concat(element.positive.words, element.negative.words);
  }, this);

  return _.uniq(array);
};

var createSentimentChartDatset = (analysisResult) => {
  let posCount = 0;
  let negCount = 0;
  analysisResult.forEach(function (element) {
    if (element.score < 0) negCount++;
    else if (element.score > 0) posCount++;
  }, this);

  console.log([posCount, negCount]);

  return [posCount, negCount];
};

var readLocalTweets = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });
};

var filterLocalTweets = (keywords, sample) => {
  return new Promise((resolve, reject) => {
    keywords = keywords.split(',');

    let filteredTweet = [];

    if (keywords.length > 0) {
      sample.forEach(function (tweet) {
        let matched = false;
        keywords.forEach(function (keyword) {
          if (_.includes(tweet.toLowerCase(), keyword.toLowerCase())) {
            filteredTweet.push(tweet);
          }
        }, this);
      }, this);
      return resolve(_.uniq(filteredTweet));
    } else {
      return resolve(sample);
    }
  });
}
