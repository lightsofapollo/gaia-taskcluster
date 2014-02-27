/**
There is no database in this prototype we simply record all the repos
and then run tasks based on this configuration.
*/
module.exports = {
  // XXX: the intent is to move this configuration to the repo ASAP.
  repositories: {
    'lightsofapollo/gaia-taskcluster': {
      tasks: [
        {
          treeherder: {
            job_symbol: 'GI'
          },
          payload: require('./tasks/gaia_prebuilt')
        }
      ]
    }
  }
};
