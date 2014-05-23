var koa = require('koa');
var co = require('co');
var request = require('superagent-promise');
var taskcluster = require('taskcluster-client');

var Projects = require('./stores/project');
var Github = require('octokit');

module.exports = function() {
  // include configuration in a function to give time for overrides?
  var config = require('./config');
  var app = koa();

  app.use(require('koa-logger')());
  app.use(require('koa-body-parser')());
  app.use(require('koa-trie-router')(app));

  // common services needed by the routes
  var services = {
    config: config,
    queue: taskcluster.queue,
    graph: taskcluster.scheduler,
    projects: new Projects(config.treeherder.configUri),
    // XXX: in the near future this will not be a global service but something
    //      directly related to each project...
    github: Github.new({ token: config.github.token })
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

  return app;
};
