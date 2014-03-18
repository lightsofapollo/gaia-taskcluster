var Promise = require('promise');
var TaskFactory = require('taskcluster-client/factory/task');
var GraphFactory = require('taskcluster-client/factory/graph');


var PROVISIONER = 'aws-provisioner';
var WORKER_TYPE = 'ami-ca7917fa';

/**
Build the list of github tasks from a github pull request.
*/
function githubTasks(github, pullRequest) {
  // XXX: This is a big hack we should pull this from the repo itself.
  var gi = TaskFactory.create({
    // Ideally these are not present in the task config itself
    provisionerId: PROVISIONER,
    workerType: WORKER_TYPE,

    routing: '',

    metadata: {
      // REALLY quick hack
      owner: 'jlal@mozilla.com'
    },

    payload: {
      image: 'lightsofapollo/gaia-taskenv',
      command: [
        './bin/github_pr ' +
        'https://github.com/mozilla-b2g/gaia.git ' +
        pullRequest.number + ' ' +
        'make test-integration REPORTER=mocha-tbpl-reporter'
      ]
    },

    tags: {
      treeherderProject: 'gaia',
      treeherderResultset: pullRequest.html_url,
      treeherderSymbol: 'GI'
    }
  });

  var lint = TaskFactory.create({
    // Ideally these are not present in the task config itself
    provisionerId: PROVISIONER,
    workerType: WORKER_TYPE,
    routing: '',

    metadata: {
      // REALLY quick hack
      owner: 'jlal@mozilla.com'
    },

    payload: {
      image: 'lightsofapollo/gaia-taskenv',
      command: [
        './bin/github_pr ' +
        'https://github.com/mozilla-b2g/gaia.git ' +
        pullRequest.number + ' ' +
        'make hint'
      ]
    },

    tags: {
      treeherderProject: 'gaia',
      treeherderResultset: pullRequest.html_url,
      treeherderSymbol: 'HINT'
    }
  });

  return Promise.from(GraphFactory.create({
    routing: process.env.TASKCLUSTER_ROUTING_KEY + '.',
    tasks: {
      lint: {
        task: gi
      },

      'marionette integration tests': {
        task: lint
      }
    }
  }));
}

module.exports = githubTasks;
