suite('github', function() {
  var Promise = require('promise');
  var PromiseProxy = require('proxied-promise-object');
  var Github = require('github');
  var github = new Github({
    version: '3.0.0'
  });

  var ghRepo = PromiseProxy(Promise, github.repos);

  var PullRequest = require('github-fixtures/pull_request');
  var Graph = require('taskcluster-client/factory/graph');

  var subject = require('./github_pr');

  var USER = 'taskcluster';
  var REPO = 'github-graph-example';

  function eachTask(graph, fn) {
    Object.keys(graph.tasks).forEach(function(name) {
      fn(graph.tasks[name], name);
    });
  }

  suite('#fetchGraph', function() {
    var pr = PullRequest.create({
      head: {
        user: { login: USER },
        repo: {
          name: REPO
        }
      }
    });

    var content;
    setup(function() {
      return ghRepo.getContent({
        user: USER,
        repo: REPO,
        path: 'taskgraph.json'
      }).then(function(values) {
        content = JSON.parse(new Buffer(values.content, 'base64'));
      });
    });

    test('fetches content from github via pr', function() {
      return subject.fetchGraph(github, pr).then(function(graph) {
        assert.deepEqual(graph, content);
      });
    });
  });

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

    test('tags', function() {
      eachTask(decorated, function(task) {
        // ugh> inner task definition.
        var tags = task.task.tags;
        assert.equal(tags.commit, pr.head.sha);
        assert.equal(tags.repository, pr.base.repo.html_url);
        assert.equal(tags.pullRequest, pr.html_url);
        assert.equal(tags.githubUsername, pr.head.user.login);
      });
    });

    test('treeherder tag', function() {
      eachTask(decorated, function(task) {
        var tags = task.task.tags;
        assert.equal(
          subject.pullRequestResultsetId(pr),
          tags.treeherderResultset
        );
      });
    });
  });

});
