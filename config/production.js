module.exports = {
  envType: 'production',
  treeherder: {
    baseUrl: process.env.TREEHERDER_URL || 'https://treeherder.allizom.org/api/'
  }
};
