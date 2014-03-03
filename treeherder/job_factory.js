var Factory = require('object-factory');

var Opts = new Factory({
  properties: { opts: true }
});

var Platform = new Factory({
  properties: {
    // XXX: We should expose these from the worker?
    platform: 'linux64',
    os_name: 'linux',
    architecture: 'x86_64'
  }
});

var JobFactory = new Factory({
  properties: {
    name: '',
    description: '',
    build_url: '',
    build_platform: Platform,
    machine_platform: Platform,
    result: '',
    option_collection: Opts,
    job_guid: '',
    // submit_timestamp: (new Date()).valueOf()
    job_symbol: 'GI',
    state: 'pending',
    // log_references: []
  }
});

module.exports = new Factory({
  properties: {
    revision_hash: '',
    project: '',
    job: JobFactory
  }
});
