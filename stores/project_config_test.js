suite('project config', function() {  
  var subject = require('./project_config');

  var nock = require('nock');

  suiteSetup(function() {
    nock.disableNetConnect();
  });

  suiteTeardown(function() {
    nock.enableNetConnect();
  });

  test('from disk', function() {
    var fixture = __dirname + '/../test/fixtures/projects.json';

    var expected = require(fixture);

    return subject(fixture).then(function(value) {
      assert.deepEqual(value, expected);
    });
  });

  test('from s3', function() {
    // nock recording for this request
    require('./../test/nock/project_config_aws');

    var path = 's3://github-treeherder/empty_config.json';
    return subject(path).then(function(obj) {
      assert.deepEqual(obj, {});
    });
  });
});
