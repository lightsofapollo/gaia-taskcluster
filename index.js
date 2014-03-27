var express = require('express');
var github = require('github');
var Promise = require('promise');
var Github = require('github');
var Queue = require('taskcluster-client/queue');
var Graph = require('taskcluster-client/graph');
var ProjectStore = require('./stores/project');

module.exports = function buildApp(config) {
  var app = express();

  // github configuration

  var github = new Github({
    version: '3.0.0'
  });

  if (process.env.GITHUB_OAUTH_TOKEN) {
    github.authenticate({
      type: 'oauth',
      token: process.env.GITHUB_OAUTH_TOKEN
    });
  }

  app.set('github', github);

  // taskcluster client configuration
  app.set('queue', new Queue());
  // taskcluster graph configuration
  app.set('graph', new Graph());
  // project configuration store
  app.set(
    'projects',
    new ProjectStore(process.env.TREEHEDER_PROJECT_CONFIG_URI)
  );

  // REST resources
  app.use(express.json());
  app.post('/github/pull_request', require('./routes/github_pr'));

  app.use(function errorHandler(error, req, res, next) {
    if (!error) return;

    var status = error.status || 500;
    var body = error.body || { message: error.message };
    console.error('Error while handling', req.path, '\n', error.stack);
    res.send(status, body);
  });

  return app;
};
