var logger = require('json-logger');

var taskcluster = require('taskcluster-client');

var Queue = require('taskcluster-client').Queue;
var Scheduler = require('taskcluster-client').Scheduler;
var Github = require('octokit');
var Projects = require('../lib/stores/project');

/**
Instance level configuration and runtime methods/logging.
*/
function* createRuntime(profile) {
  var config = yield require('../lib/config')({
    defaults: require('../config/defaults'),
    filename: 'gaia-taskcluster',
    profile: profile
  });

  config.log = logger({
    queueName: config.taskcluster.listener.queueName || '<no queue>'
  });

  config.queue = new Queue(config.taskcluster.client);
  config.scheduler = new Scheduler(config.taskcluster.client);
  config.projects = new Projects(config.treeherder.configUri);
  // XXX: The name is sorta a hack around the fact we want to use config.github.
  config.githubApi = Github.new({ token: config.github.token });
  return config;
}

module.exports = createRuntime;
