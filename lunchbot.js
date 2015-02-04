var u = require('underscore');

module.exports = function(request, response, next) {

  var request = require('request');
  request({
    uri: 'http://www.caferathaus.at/speisekarte.php'
  }, function(error, res, body) {
    var extracted = [];
    if (error && res.statusCode != 200) {
      console.log('Error retrieving menu page');
    }

    // Get current day of the week - starts with Sunday(0)
    var day = (new Date().getDay() + 7) % 8;
    // Parse response body
    var cheerio = require('cheerio'),
    $ = cheerio.load(body);
    // Get current day menu
    var $menu = $('.tagesmenu', '#diese_woche').eq(day);
    var $soup = $menu.first().contents().filter(function() {
      return this.type == 'text';
    }).text();
    extracted.push($soup.trim().replace(/\s{2,}/g, ' '));
    var $menus = $menu.find('tr');
    $menus.each(function(i, item) {
      extracted.push($(item).text().trim().replace(/\s{2,}/g, ' '));
    });

    // General bot payload
    var payload = {};
    payload['username'] = 'Lunchbot';
    payload['channel'] = 'C03J74386';
    payload['icon_emoji'] = ':fork_and_knife:';

    var text = '\n:stew: *Cafe Rathaus*\n';
    u.each(extracted, function(item) {
      text += item + '\n';
    });
    // Add Billa option :D
    text += '\n:billa: *Billa*\n';
    text += 'For your Leberkäse needs';

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
};

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
