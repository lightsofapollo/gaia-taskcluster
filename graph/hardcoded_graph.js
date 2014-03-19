/**
In the real world (and near future) we will embed the task list directly into
the repository itself. For now we have a list here which will be loaded 
regardless of the project type.
*/
var PROVISIONER = 'aws-provisioner';
var WORKER_TYPE = 'ami-ca7917fa';

// XXX: This is a big hack we should pull this from the repo itself.
var gi = {
  // Ideally these are not present in the task config itself
  provisionerId: PROVISIONER,
  workerType: WORKER_TYPE,

  routing: '',

  metadata: {
    // REALLY quick hack
    owner: 'jlal@mozilla.com'
  },

  payload: {
    image: 'registry.taskcluster.net/lightsofapollo/gaia-taskenv',
    command: [
      './bin/github_pr ' +
      'https://github.com/$GH_REPO_SLUG.git ' +
      '$GH_PULL_REQUEST_NUMBER ' +
      'make test-integration REPORTER=mocha-tbpl-reporter'
    ]
  },

  tags: {
    treeherderProject: 'gaia',
    treeherderSymbol: 'GI'
  }
};

var lint = {
  // Ideally these are not present in the task config itself
  provisionerId: PROVISIONER,
  workerType: WORKER_TYPE,
  routing: '',

  metadata: {
    // REALLY quick hack
    owner: 'jlal@mozilla.com'
  },

  payload: {
    image: 'registry.taskcluster.net/lightsofapollo/gaia-taskenv',
    command: [
      './bin/github_pr ' +
      'https://github.com/$GH_REPO_SLUG.git ' +
      '$GH_PULL_REQUEST_NUMBER ' +
      'make hint'
    ]
  },

  tags: {
    treeherderProject: 'gaia',
    treeherderSymbol: 'HINT'
  }
};

module.exports = {
  routing: process.env.TASKCLUSTER_ROUTING_KEY + '.',
  tasks: {
    lint: {
      task: gi
    },

    'marionette integration tests': {
      task: lint
    }
  }
};
