var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var fs = require('fs');


var restaurants = [
    'rathaus',
    'cantinetta',
    'michls',
    'ohh',
    'billa'
]
.map(function(name) {
    return require('./restaurants/' + name + '.js');
});


module.exports = function(slack_req, slack_res) {
    var result = {};
    var weekNumber = moment().isoWeek();
    var cacheFile = './cache/' + weekNumber + '.json';
    var i = 0;

    // Send cache file for current week if it exists
    if (fs.existsSync(cacheFile) && !global.testing) {
        var cachedData = JSON.parse(fs.readFileSync(cacheFile));
        if (_.keys(cachedData).length !== restaurants.length) {
            // A new restaurant has been added, reparse
            parsePages();
        } else {
            result = cachedData;
            postToSlack();
        }
    } else {
        parsePages();
    }

    function parsePages() {
        restaurants.forEach(function(restaurant) {
            // For some jokes :P
            if (!restaurant.uri) {
                result[restaurant.name] = {
                    message: restaurant.message
                };
                return doneParsingRestaurant();
            }

            request({uri: restaurant.uri, headers: {'User-Agent': 'Chrome'}}, function(err, res, body) {
                if (err) return console.log('Error when trying to load ' + restaurant.name, err);
                result[restaurant.name] = restaurant.parse(cheerio.load(body));
                doneParsingRestaurant();
            });
        });
    }

    function doneParsingRestaurant() {
        i++;
        if (i === restaurants.length) {
            saveCache();
            postToSlack();
        }
    }

    function getTodaysMenus() {
        var menus = '';
        var weekday = (moment().day() + 7) % 8;
        _.each(restaurants, function(restaurant) {
            var menu = result[restaurant.name];
            menu = menu.message || menu[weekday];
            menus += restaurant.emoji + ' ' +
                     restaurant.name + '\n' +
                     menu + '\n\n';

        });
        return menus.trim();
    }

    function saveCache() {
        if (!fs.existsSync('./cache/')) fs.mkdirSync('./cache/');
        fs.writeFileSync(cacheFile, JSON.stringify(result), 'utf8');
        // TODO delete previous cache if existing
    }

    function postToSlack() {
        if (global.testing) {
            return console.log(getTodaysMenus());
        }

        var payload = {};
        payload['username'] = 'Lunchbot';
        payload['channel'] = 'C03J74386';
        payload['icon_emoji'] = ':fork_and_knife:';
        payload['text'] = getTodaysMenus();

        var outgoing = 'https://hooks.slack.com/services' + process.env.INCOMING_WEBHOOK_PATH;

        request({
            uri: outgoing,
            method: 'POST',
            body: JSON.stringify(payload)
        }, function(err, res, body) {
            if (err) {
                console.log('Error when posting to Slack Hook', err);
            }
            slack_res.status(200).end();
        });
    }
};



global.String.prototype.reFormat = function() {
    var result = this;

    result = result.split(/\n/g).map(function(str) {
        // Capitalises words
        var splitted = str.split(' ');
        str = splitted.map(function(str, i) {
            // capitalise word if its between two other words and up to 3 chars long
            if (i !== 0 && i !== splitted.length-1 && str.length < 4) return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        }).join(' ');

        //removes allergy warnings
        return str.split(' ').map(function(str1) {
            return str1.split(',').filter(function(str2) {
                if (str2.length === 1 && /[A-Z]/.test(str2)) {
                    return false;
                } else {
                    return true;
                }
            }).join(',');
        }).join(' ');
    }).join('\n');

    // double spaces
    result = result.replace(/  /g, ' ');

    //string:string to string: string
    result = result.replace(/(\w)\:(\w)/g, '$1: $2');

    return result;
}
