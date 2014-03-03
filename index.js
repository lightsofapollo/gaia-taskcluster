var express = require('express');
var github = require('github');
var Promise = require('promise');
var swagger = require('swagger-jack');
var Github = require('github');
var Queue = require('taskcluster-client/queue');

var projectConfig = require('./project_config');

module.exports = function buildApp(config) {
  config = config || {};
  config.apiVersion = config.apiVersion || '0.0.1';
  config.basePath = config.basePath || 'http://localhost:' + process.env.PORT;

  var app = express();

  // github configuration

  var github = new Github({
    version: '3.0.0'
  });

  if (process.env.GITHUB_OAUTH_TOKEN) {
    github.authenticate({ type: 'oauth', token: process.env.GITHUB_OAUTH_TOKEN });
  }

  app.set('github', github);

  // taskcluster client configuration
  app.set('queue', new Queue());

  // this is kind of ghetto but the idea is to start loading the project
  // configuration at startup but block any incoming requests if they
  // happen prior to this being finished... 
  var projects = projectConfig(process.env.TREEHEDER_PROJECT_CONFIG_URI);
  var projectsResolved = false;
  projects = projects.then(function(config) {
    projectsResolved = true;
    app.set('projects', config);
  });

  app.use(function(req, res, next) {
    if (projectsResolved) return next();
    projects.then(next, next);
  });

  // REST resources
  app.use('/swagger/', express.static(__dirname + '/swagger/'));
  app.use(express.json());
  app.use(swagger.generator(
    app,
    config,
    [
      require('./resources/github_pr')
    ]
  ));

  //app.use(swagger.validator(app));
  app.use(swagger.errorHandler(app));
  return app;
};
