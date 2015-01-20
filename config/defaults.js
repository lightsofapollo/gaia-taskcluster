function env(name, defaultValue) {
  return process.env[name] || defaultValue || '';
};

var route = env('GAIA_TASKCLUSTER_ROUTING', 'gaia-taskcluster');

module.exports = {
  route: route,

  port: process.env.PORT || 60023,

  // location relative to the root of the tree where the task graph lives
  taskGraphPath: 'taskgraph.json',

  // graph level defaults
  graph: {
    routes: [route],
    tags: {},
    metadata: {}
  },

  // task level defaults
  task: {
    provisionerId: env('TASKCLUSTER_PROVISIONER_ID', 'aws-provisioner'),
    workerType: env('TASKCLUSTER_WORKER_TYPE', 'v2'),
    retries: 5,
    extra: {
      github: {
        baseUser: '{{githubBaseUser}}',
        baseRepo: '{{githubBaseRepo}}',
        baseRevision: '{{githubBaseRevision}}',
        baseBranch: '{{githubBaseBranch}}',

        headUser: '{{githubHeadUser}}',
        headRepo: '{{githubHeadRepo}}',
        headRevision: '{{githubBaseRevision}}}',
        headBranch: '{{githubHeadBranch}}',
      }
    },
    metadata: {},
    payload: {
      env: {
        CI: true,
        GITHUB_PULL_REQUEST: '0',

        // Base details
        GITHUB_BASE_REPO: '{{githubBaseRepo}}',
        GITHUB_BASE_USER: '{{githubBaseUser}}',
        GITHUB_BASE_GIT: 'https://github.com/{{githubBaseUser}}/{{githubBaseRepo}}',
        GITHUB_BASE_REV: '{{githubBaseRevision}}',
        GITHUB_BASE_BRANCH: '{{githubBaseBranch}}',

        // Head details
        GITHUB_HEAD_REPO: '{{githubHeadRepo}}',
        GITHUB_HEAD_USER: '{{githubHeadUser}}',
        GITHUB_HEAD_GIT: 'https://github.com/{{githubHeadUser}}/{{githubHeadRepo}}',
        GITHUB_HEAD_REV: '{{githubHeadRevision}}',
        GITHUB_HEAD_BRANCH: '{{githubHeadBranch}}',

        // Treeherder
        TREEHERDER_PROJECT: '{{treeherderRepo}}',
        TREEHERDER_REVISION: '{{githubHeadRevision}}'
      },
      maxRunTime: 7200,
      features: {}
    }
  },

  taskcluster: {
    listener: {
      queueName: process.env.GAIA_TASKCLUSTER_QUEUE || null,
      connectionString: env('TASKCLUSTER_AMQP_URL'),
      prefetch: 100
    },

    client: {
      clientId: env('TASKCLUSTER_CLIENT_ID'),
      accessToken: env('TASKCLUSTER_ACCESS_TOKEN')
    }
  },

  taskclusterTreeherder: {
    route: 'tc-treeherder-stage'
  },

  treeherder: {
    // where to pull the treeherder configuration projects from...
    // XXX: Soon this will be a store
    configUri: env('TREEHEDER_PROJECT_CONFIG_URI'),

    // base location for treeherder services...
    baseUrl: env('TREEHERDER_URL') || ''
  },

  github: {
    rawUrl: 'https://raw.githubusercontent.com/',
    // XXX: soon this will go away in favor or per-project configuration
    token: env('GITHUB_OAUTH_TOKEN')
  }
};
