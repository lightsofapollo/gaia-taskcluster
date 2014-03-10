var Promise = require('promise');
var TaskFactory = require('taskcluster-client/factory/task');

/**
Build the list of github tasks from a github pull request.
*/
function githubTasks(github, pullRequest) {
  // XXX: This is a big hack we should pull this from the repo itself.
  var gi = TaskFactory.create({
    // Ideally these are not present in the task config itself
    provisionerId: 'aws-provisioner',
    workerType: 'ami-9ec3acae',

    routing: process.env.TASKCLUSTER_ROUTING_KEY,

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
    provisionerId: 'aws-provisioner',
    workerType: 'ami-4e7e117e',

    routing: process.env.TASKCLUSTER_ROUTING_KEY,

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


  return Promise.cast([gi, lint]);
}

module.exports = githubTasks;
