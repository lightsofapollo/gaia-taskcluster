module.exports = {
  github: { token: process.env.GH_TESTING_TOKEN },

  githubTest: {
    token: process.env.GH_TESTING_TOKEN,
    user: process.env.GH_TESTING_USER,
    repo: process.env.GH_TESTING_REPO,
  },

  treeherder: {
    configUri: __dirname + '/../projects.json',
    // This is the default url for the treeherder vagrant
    baseUrl: 'http://192.168.33.10/api/'
  }
};
