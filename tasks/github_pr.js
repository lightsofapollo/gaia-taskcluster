var Promise = require('promise');
var TaskFactory = require('taskcluster-client/factory/task');

/**
Build the list of github tasks from a github pull request.
*/
function githubTasks(github, pullRequest) {
  // XXX: This is a big hack we should pull this from the repo itself.
  var task = TaskFactory.create({
    // Ideally these are not present in the task config itself
    provisionerId: 'aws-provisioner',
    workerType: 'ami-cc5c30fc',

    metadata: {
      // REALLY quick hack
      owner: 'jlal@mozilla.com'
    },

    payload: {
      image: 'lightsofapollo/gaia-prebuilt',
      command: ['make test-integration REPORTER=mocha-reporter-tbpl']
    },

    tags: {
      treeherderResultset: pullRequest.html_url,
      treeherderSymbol: 'GI'
    }
  });

  return Promise.cast([task]);
}

module.exports = githubTasks;
