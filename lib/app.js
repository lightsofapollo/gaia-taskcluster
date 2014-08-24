var koa = require('koa');
var request = require('superagent-promise');
var taskcluster = require('taskcluster-client');
var Queue = require('taskcluster-client').Queue;
var Scheduler = require('taskcluster-client').Scheduler;

var Runtime = require('../lib/runtime');
var Projects = require('../lib/stores/project');
var Github = require('octokit');

module.exports = function* createApp(profile) {
  // include configuration in a function to give time for overrides?
  var config = yield require('../lib/config')({
    defaults: require('../config/defaults'),
    filename: 'gaia-taskcluster',
    profile: profile
  });

  var app = koa();
  app.use(require('koa-logger')());
  app.use(require('koa-body-parser')());
  app.use(require('koa-trie-router')(app));

  console.log(JSON.stringify(config.taskcluster.credentials));

  config.queue = new Queue(config.taskcluster.credentials);
  config.scheduler = new Scheduler(config.taskcluster.credentials);

  config.projects = new Projects(config.treeherder.configUri);

  console.log(config.github.token, '<<<!!');
  // XXX: The name is sorta a hack around the fact we want to use config.github.
  config.githubApi = Github.new({ token: config.github.token });

  app.runtime = new Runtime(config);

  // github event routing logic

  var githubEvents = {
    pull_request: require('../routes/github_pr')(app.runtime),
    push: require('../routes/github_push')(app.runtime)
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
}
