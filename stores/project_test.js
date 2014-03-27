suite('stores', function() {
  var Project = require('./project');
  var fixture = __dirname + '/../test/fixtures/projects.json';

  var subject;
  setup(function() {
    subject = new Project(fixture);
  });

  suite('#findProjectByRepo', function() {
    test('with a available branch', function() {
      return subject.findProjectByRepo(
        'mozilla-b2g',
        'gaia',
        'master'
      ).then(function(project) {
        assert.ok(project, 'returns a project');
        assert.equal(project.branch, 'master');
        assert.equal(project.repo, 'gaia');
        assert.equal(project.user, 'mozilla-b2g');
      });
    });

    test('without a config', function() {
      return subject.findProjectByRepo(
        'foo',
        'bar',
        'baz'
      ).then(function(value) {
        assert.ok(!value, 'returns no value for missing repo');
      });
    });
  });
});
