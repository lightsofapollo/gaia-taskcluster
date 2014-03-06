require('mocha-as-promised')();
global.assert = require('assert');

process.env.TASKCLUSTER_ROUTING_KEY =
  process.env.TASKCLUSTER_ROUTING_KEY ||
  'gaia-test';


/**
Override the CONFIG_URI to the test configuration unless its set.
*/
process.env.TREEHEDER_PROJECT_CONFIG_URI =
  process.env.TREEHEDER_PROJECT_CONFIG_URI ||
  __dirname + '/projects.json';

/**
Set s3 credentials if missing to something bogus.

This important for nock mocking as AWS will not attempt to connect correctly
without something set here (even if its totally invalid)
*/
[
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ACCESS_KEY_ID'
].forEach(function(name) {
  if (!process.env[name]) process.env[name] = 'xxx';
});
