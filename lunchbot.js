var u = require('underscore');
var fs = require('fs');

// Cache file def
var moment = require('moment');
var weekNumber = moment().isoWeek();
var cacheFile = 'cache/rathaus-' + weekNumber + '.json';

module.exports = function(request, response, next) {

  // try to delete last weeks cache
  if (!fs.existsSync('cache')) {
    console.log('Cache folder does not exist');
    fs.mkdirSync('cache');
  }
  // check if we already have a cache for this week
  fs.exists(cacheFile, function(exists) {
    if (!exists) {
      // if we don't fetch it
      console.log('Cache file not found. Fetching!');

      var request = require('request');
      request({
        uri: 'http://www.caferathaus.at/speisekarte.php'
      }, function(error, res, body) {
        var data = {};
        if (error && res.statusCode != 200) {
          console.log('Error retrieving menu page');
        }

        var cheerio = require('cheerio'),
          $ = cheerio.load(body);
          var $days = $('.tagesmenu', '#diese_woche');
          $days.each(function(i, day) {
            var foods = [];
            var $soup = $(day).first().contents().filter(function() {
              return this.type == 'text';
            }).text();
            foods.push($soup.trim().replace(/\s{2,}/g, ' '));
            var $menus = $(day).find('tr');
            $menus.each(function(j, item) {
              foods.push($(item).text().trim().replace(/\s{2,}/g, ' '));
            });
            data[i] = foods;
          });
          fs.writeFile(cacheFile, JSON.stringify(data), function(err) {
            if (err) {
              console.log('Error saving cache file');
              throw err;
            }
            sendMessage(response, next);
          });
      });
    } else {
      sendMessage(response, next);
    }
  });
};

function sendMessage(response, next) {
  // read from cache file
  var menu;
  fs.readFile(cacheFile, 'utf8', function(err, data) {
    if (err) {
      console.log('Error reading cache file');
      throw err;
    }
    console.log('Processing cache file', cacheFile);
    menu = JSON.parse(data);

    var weekday = (moment().day() + 7) % 8;
    var text = '\n:stew: *Cafe Rathaus*\n';
    u.each(menu[weekday], function(item) {
      text += item + '\n';
    });
    // Add Billa option :D
    text += '\n:billa: *Billa*\n';
    text += 'For your Leberkäse needs';

    // General bot payload
    var payload = {};
    payload['username'] = 'Lunchbot';
    payload['channel'] = 'C03J74386';
    payload['icon_emoji'] = ':fork_and_knife:';

    payload['text'] = text;
    // Send message
    send(payload, function(error, status, body) {
      if (error) {
        return next(error);
      } else if (status != 200) {
        return next(new Error('Incoming Webhook: ' + status));
      } else {
        return response.status(200).end();
      }
    });
  });
}

function send(payload, callback) {
  var outgoing = 'https://hooks.slack.com/services/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';

  var request = require('request');
  request({
    uri: outgoing,
    method: 'POST',
    body: JSON.stringify(payload)
  }, function(error, response, body) {
    if (error) {
      return callback(error);
    }

    callback(null, response.statusCode, body);
  });
}
