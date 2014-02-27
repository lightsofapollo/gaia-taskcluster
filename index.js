var express = require('express');
var github = require('github');
var Promise = require('promise');
var swagger = require('swagger-jack');

module.exports = function buildApp(config) {
  var app = express();
  app.use('/swagger/', express.static(__dirname + '/swagger/'));
  app.use(express.json());
  app.use(swagger.generator(
    app,
    config,
    [
      require('./resources/github')
    ]
  ));

  //app.use(swagger.validator(app));
  app.use(swagger.errorHandler(app));
  return app;
};
