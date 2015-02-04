var express = require('express');
var bodyParser = require('body-parser');

var lunchbot = require('./lunchbot');

var app = express();
var port = process.env.PORT || 3001;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/lunch', lunchbot);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function () {
  console.log('Meisterlunch started on port ' + port);
});
