module.exports = {
    name: 'Cafe Rathaus',
    emoji: ':stew:',
    uri: 'http://www.caferathaus.at/speisekarte.php',
    parse: function($) {
        var data = {};
        var $days = $('.tagesmenu', '#diese_woche');

        $days.each(function(i, day) {
          var foods = [];
          var $soup = $(day).first().contents().filter(function() {
              return this.type == 'text';
          }).text();

          foods.push($soup.trim().replace(/\s{2,}/g, ' '));

          var $menus = $(day).find('tr');
          $menus.each(function(j, item) {
              foods.push(
                  $(item).text()
                         .trim()
                         .replace(/\s{2,}/g, ' ')
                         .replace(/\s(\w\W)+€/, ' €')
              );
          });

          data[i] = foods.join('\n');
        });

        return data;
    }
};
