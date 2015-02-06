module.exports = {
    name: 'Cantinetta',
    emoji: ':spaghetti:',
    uri: 'http://www.lacantinetta.at/index.php?id=menu',
    parse: function($) {
        var data = {};
        var $days = $('.dayentry', '#menue');

        $days.each(function(i, day) {
            var foods = [];
            var $menus = $(day).find('div');
            $menus.each(function(j, item) {
                if ($(item).hasClass('day') == false) {
                    foods.push(
                        $(item).text()
                               .trim()
                               .replace(/\n(\d),/, '€ $1')
                    );
                }
            });
            var price = foods.pop();
            data[i] = (
                foods.join('\n').trim() +
                ' € ' +
                parseInt(price).toFixed(2).replace('.', ',')
            ).reFormat();
        });

        return data;
    }
};
