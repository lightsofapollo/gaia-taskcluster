require('mocha-as-promised')();
global.assert = require('assert');

/**
Override the CONFIG_URI to the test configuration unless its set.
*/
process.env.TREEHEDER_PROJECT_CONFIG_URI =
  process.env.TREEHEDER_PROJECT_CONFIG_URI ||
  __dirname + '/projects.json';
