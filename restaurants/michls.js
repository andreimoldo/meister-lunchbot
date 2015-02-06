module.exports = {
    'name': 'Michl\'s',
    'emoji': ':meat_on_bone:',
    'uri': 'http://www.michls.at/mittagsmen%C3%BC.aspx',
    parse: function($) {
        var data = {};
        var $days = $('table', '#ctl00_mainContent_ctl03_ctl01_lblPlan');

        $days.slice(1).each(function(i, day) {
            var $menus = $(day).find('tr');
            var dailies = [];
            $menus.each(function(j, menu) {
                var daily = '';
                var $foods = $(menu).find('td');
                $foods.each(function(k, food) {
                    var text = [];
                    $(food).contents().each(function(l, elem) {
                        var str = $(this).text();
                        if (str.length){
                            text.push(str);
                        }
                    });

                    daily += text.join(' ')
                        .replace(/\s{2,}/g, ' ')
                });
                dailies.push(daily);
            });
            data[i] = dailies.join('\n').reFormat();
        });

        return data;
    }
};
