var Promise = require('promise');
var TaskFactory = require('taskcluster-client/factory/task');

/**
Build the list of github tasks from a github pull request.
*/
function githubTasks(github, pullRequest) {

  // XXX: This is a big hack we should pull this from the repo itself.
  var task = TaskFactory.create({
    payload: {
      image: 'lightsofapollo/gaia-prebuilt',
      command: ['make test-integration REPORTER=mocha-reporter-tbpl']
    },

    tags: {
      treeherder: {
        resultset: pullRequest.html_url,
        symbol: 'GI'
      }
    }
  });

  return Promise.cast([task]);
}

module.exports = githubTasks;
