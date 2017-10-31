var searcher = require('string-search')
var Bluebird = require('bluebird')


exports.find_string = function(keywords, tweet_arr) {
    
    let result_promises = [];

    let words = keywords.split(',');

    for (raw_tweet of tweet_arr) {
        const tweet = raw_tweet.replace(/[\r]+/g, '');
        let keyword_promises = [];
        for (word of words) {
            let promise = searcher.find(tweet, word)
                .then(result => result.length != 0);
            keyword_promises.push(promise);
        }
        let result_promise = Bluebird.all(keyword_promises).then(results => {
            let flag = false;
            for (result of results) {
                if (result) {
                    flag = true;
                    break;
                }
            }
            //console.log(`${tweet}: ${results}`);
            return {
                'tweet': tweet,
                'result': flag
            };
        });
        result_promises.push(result_promise);
    }

    return Bluebird.all(result_promises);
}

