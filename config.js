function env(name, defaultValue) {
  return process.env[name] || defaultValue || '';
}

module.exports = {

  // location relative to the root of the tree where the task graph lives
  taskGraphPath: 'taskgraph.json',

  // graph level defaults
  graph: {
    routing: env('TASKCLUSTER_ROUTING_KEY') + '.',
    tags: {},
    metadata: {},
    params: {}
  },

  // task level defaults
  task: {
    provisionerId: env('TASKCLUSTER_PROVISIONER_ID', 'aws-provisioner'),
    workerType: env('TASKCLUSTER_WORKER_TYPE', 'aufs-worker'),
    retries: 5,
    timeout: 180,
    tags: {
      commit: '{{githubCommit}}',
      githubRepo: '{{githubRepo}}',
      githubUser: '{{githubUser}}',
      githubRef: '{{githubRef}}',
      treeherderRepo: '{{treeherderRepo}}'
    },
    metadata: {},
    payload: {
      env: {
        CI: true,
        GH_BRANCH: '{{githubBranch}}',
        GH_COMMIT: '{{githubCommit}}',
        GH_USER: '{{githubUser}}',
        GH_REPO: '{{githubRepo}}',
        GH_REF: '{{githubRef}}'
      },
      maxRunTime: 7200,
      features: {}
    }
  },

  treeherder: {
    // where to pull the treeherder configuration projects from...
    // XXX: Soon this will be a store
    configUri: env('TREEHEDER_PROJECT_CONFIG_URI')
  },

  github: {
    rawUrl: 'https://raw.githubusercontent.com/',
    // XXX: soon this will go away in favor or per-project configuration
    token: env('GITHUB_OAUTH_TOKEN')
  }
};
