var koa = require('koa');
var co = require('co');
var request = require('superagent-promise');
var taskcluster = require('taskcluster-client');

var Projects = require('./stores/project');
var Github = require('octokit');

module.exports = function() {
  var app = koa();

  app.use(require('koa-logger')());
  app.use(require('koa-body-parser')());
  app.use(require('koa-trie-router')(app));

  var githubOptions = process.env.GITHUB_OAUTH_TOKEN ?
    { token: process.env.GITHUB_OAUTH_TOKEN } :
    undefined;

  // common services needed by the routes
  var services = {
    queue: taskcluster.queue,
    graph: taskcluster.scheduler,
    projects: new Projects(process.env.TREEHEDER_PROJECT_CONFIG_URI),
    // XXX: in the near future this will not be a global service but something
    //      directly related to each project...
    github: Github.new(githubOptions)
  };

  app.services = services;

  // github event routing logic

  var githubEvents = {
    pull_request: require('./routes/github_pr')(services),
    push: require('./routes/github_push')(services)
  };

  app.post('/github', function* () {
    // TODO: Implement ip address verification AND/OR signed bodies

    var eventName = this.get('X-GitHub-Event');

    if (!eventName) {
      this.throw(400, 'Hook must contain event type');
      return;
    }

    if (!githubEvents[eventName]) {
      this.throw(400, 'Cannot handle "' + eventName + '" events');
      return;
    }

    yield githubEvents[eventName];
  });

  app.route('/').get(function* () {
    this.status = 404;
    this.body = 'oops';
  });

  return app;
};
