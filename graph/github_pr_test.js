suite('github', function() {

  var Github = require('github');
  var github = new Github({
    version: '3.0.0'
  });

  var PullRequest = require('github-fixtures/pull_request');
  var Graph = require('taskcluster-client/factory/graph');

  var subject = require('./github_pr');

  function eachTask(graph, fn) {
    Object.keys(graph.tasks).forEach(function(name) {
      fn(graph.tasks[name], name);
    });
  }

  suite('#decorateGraph', function() {
    var pr = PullRequest.create();

    var decorated;
    setup(function() {
      return subject.decorateGraph(
        Graph.create({
          tasks: {
            'one': {
              task: {
                payload: {
                  // override a value
                  env: { CI: false }
                }
              }
            },
            'two': {
              task: {
                payload: {
                  env: { CUSTOM: true }
                }
              }
            }
          }
        }),
        github,
        pr
      ).then(function(result) {
        decorated = result;
      });
    });

    test('environment variables', function() {
      function commonAsserts(task) {
        var envs = task.payload.env;
        assert.equal(envs.GH_BRANCH, pr.base.label);
        assert.equal(envs.GH_COMMIT, pr.head.sha);
        assert.equal(envs.GH_PULL_REQUEST, 'true');
        assert.equal(envs.GH_PULL_REQUEST_NUMBER, pr.number);
        assert.equal(envs.GH_REPO_SLUG, pr.base.repo.full_name);
      }

      var one = decorated.tasks.one.task;
      var two = decorated.tasks.two.task;

      commonAsserts(one);
      commonAsserts(two);

      // does not override explicitly set values.
      assert.equal(one.payload.env.CI, false);

      // allows for values other then the presets
      assert.equal(two.payload.env.CUSTOM, true);
    });

    test('metadata', function() {
      eachTask(decorated, function(task) {
        // ugh> inner task definition.
        var metadata = task.task.metadata;
        assert.equal(metadata.commit, pr.head.sha);
        assert.equal(metadata.repository, pr.base.repo.html_url);
        assert.equal(metadata.pullRequest, pr.html_url);
        assert.equal(metadata.githubUsername, pr.head.user.login);
      });
    });

    test('treeherder tag', function() {
      eachTask(decorated, function(task) {
        var tags = task.task.tags;
        assert.equal(tags.treeherderResultset, pr.html_url);
      });
    });
  });

});
