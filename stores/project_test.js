suite('stores', function() {
  var Project = require('./project');
  var fixture = __dirname + '/../test/fixtures/projects.json';

  var subject;
  setup(function() {
    subject = new Project(fixture);
  });

  suite('#findByRepo', function() {
    test('with a available branch', function() {
      return subject.findByRepo(
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
      return subject.findByRepo(
        'foo',
        'bar',
        'baz'
      ).then(function(value) {
        assert.ok(!value, 'returns no value for missing repo');
      });
    });
  });

  suite('#addProject', function() {
    var project;
    setup(function() {
      return subject.findByRepo(
        'mozilla-b2g',
        'gaia',
        'master'
      ).then(function(value) {
        project = {};
        for (var key in value) project[key] = value[key];
      });
    });

    test('add a project to the store', function() {
      project.branch = 'newmagicfoo';

      return subject.add(project).then(function() {
        return subject.findByRepo(
          project.user,
          project.repo,
          project.branch
        );
      }).then(function(value) {
        assert.ok(value, 'finds project');
        assert.deepEqual(project, value);
      });
    });
  });
});
