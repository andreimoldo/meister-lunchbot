var express = require('express');
var bodyParser = require('body-parser');
var lunchbot = require('./lunchbot');

var app = express();
var port = process.env.PORT || 3001;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/lunch', lunchbot);

app.listen(port, function () {
  console.log('Meisterlunch started on port ' + port);
});
