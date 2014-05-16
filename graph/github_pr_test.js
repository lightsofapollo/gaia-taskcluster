suite('github pr', function() {
  var nock = require('nock');
  var github = require('octokit').new({
    token: 'ec6fc0b2b20ddb87fd3f90c1522d720c99c8dc93'
  });
  var co = require('co');

  var PullRequest = require('github-fixtures/pull_request');
  var Graph = require('taskcluster-task-factory/graph');

  var subject = require('./github_pr');

  var USER = 'taskcluster';
  var REPO = 'github-graph-example';

  function eachTask(graph, fn) {
    Object.keys(graph.tasks).forEach(function(name) {
      fn(graph.tasks[name], name);
    });
  }

  suiteSetup(function() {
    nock.disableNetConnect();
  });

  suiteTeardown(function() {
    nock.enableNetConnect();
  });

  var pr = PullRequest.create({
    head: {
      ref: 'testing',
      user: { login: USER },
      repo: {
        name: REPO
      }
    },
    base: {
      user: { login: USER },
      repo: { name: REPO }
    }
  });

  suite('#fetchGraph', function() {
    var content;
    setup(co(function* () {
      require('../test/nock/github_fetch_graph')();
      var repo = github.getRepo(USER, REPO);
      content = yield repo.getBranch('master').contents('taskgraph.json');
    }));

    test('fetches content from github via pr', co(function* () {
      try {
      var graph = yield subject.fetchGraph(github, pr);
      } catch(e) {
        console.log(e);
      }
      assert.deepEqual(graph, content);
    }));
  });

  suite('#decorateGraph', function() {
    var decorated;
    setup(co(function * () {
      require('../test/nock/github_user_email')();

      var graph = Graph.create({
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
      });

      decorated = yield subject.decorateGraph(
        graph,
        { name: 'treeherder' },
        github,
        pr
      );
    }));

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
        assert.equal(tags.treeherderProject, 'treeherder');
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
