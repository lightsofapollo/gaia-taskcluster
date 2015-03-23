var logger = require('json-logger');

var taskcluster = require('taskcluster-client');

var Queue = require('taskcluster-client').Queue;
var Scheduler = require('taskcluster-client').Scheduler;
var Github = require('octokit');
var Projects = require('../lib/stores/project');
var GithubApi = require('github');

/**
Instance level configuration and runtime methods/logging.
*/
function* createRuntime(profile) {
  var config = yield require('../lib/config')({
    defaults: require('../config/defaults'),
    filename: profile.envType + '-gaia-taskcluster',
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
  config.githubRaw = new GithubApi({
    version: '3.0.0',
    timeout: 30000
  });

  config.githubRaw.authenticate({
    type: 'oauth',
    token: config.github.token
  });

  return config;
}

module.exports = createRuntime;
