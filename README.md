
#Meisterlunch

Slack bot that parses different restaurants around our offices and posts them to Slack.

##Adding Restaurants

Create a new file in `/restaurants` with either of the 2 following contents. After that, add the name of the file to the `restaurants` variable inside lunchbot.js.
The order from the variable determines the order from the message.

###Parsed Homepage

    module.exports = {
        name: 'Cafe Rathaus',
        emoji: ':stew:',
        uri: 'http://www.caferathaus.at/speisekarte.php',
        parse: function($) {
        }
    };

The `parse` method should return something in the following format, the keynames should be weekdays starting from 0.

	{
		'0': 'Some Title\nsome other stuff'
	}

###Joke Restaurants

These restaurants don't have a URI or parse method. Instead, they just get added to the result with the *message* as payload.

	module.exports = {
    	name: 'Billa',
	    emoji: ':billa:',
    	message: 'For your Leberkäse needs'
	};

##Testing

Just run `node test` and you will see the result that would get posted to Slack.

*Props to Ostermonn! :D*
