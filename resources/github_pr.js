var api = {
  resourcePath: '/github/pull_request/',
  models: {
    TaskList: {
      id: 'TaskList',
      properties: {
        taskIds: {
          description: 'An array of task ids as defined by taskcluster',
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  },
  apis: [
    {
      path: '/github/pull_request/',
      operations: [
        {
          summary:
            'Handle incoming pull requests and link them to treeherder',

          httpMethod: 'POST',
          nickname: 'post',
          responseClass: 'TaskList'
        }
      ]
    }
  ]
};

var Promise = require('promise');
var TreeherderGithub = require('mozilla-treeherder/github');
var TreeherderProject = require('mozilla-treeherder/project');

var githubTasks = require('../tasks/github_pr');
var debug = require('debug')('gaia-treeherder/github/pull_request');

function findProject(projects, user, repo) {
  var i = 0;
  var len = projects.length;

  for (; i < len; i++) {
    var proj = projects[i];
    if (proj.user === user && proj.repo === repo) {
      return proj;
    }
  }
}

var controller = {
  post: function(req, res, next) {
    var body = req.body;
    var ghRepository = body.repository;

    if (!body.pull_request) {
      var err = new Error('Invalid pull request data');
      err.status = 400;
      return next(err);
    }

    // taskcluster queue
    var queue = res.app.get('queue');

    // github client
    var github = res.app.get('github');

    // project configuration
    var projects = res.app.get('projects');

    // github params
    var user = ghRepository.owner.login;
    var repo = ghRepository.name;
    var number = body.pull_request.number;

    var project = findProject(projects, user, repo);
    if (!project) {
      var err = new Error('Cannot handle requests for this github project');
      err.status = 400;
      return next(err);
    }

    // project is valid so lets continue...
    TreeherderGithub.pull(project.name, {
      github: github,
      repo: repo,
      user: user,
      number: number
    }).then(function(resultset) {
      // submit the resultset to treeherder
      var thProject = new TreeherderProject(project.name, {
        consumerKey: project.consumerKey,
        consumerSecret: project.consumerSecret
      });

      // treeherder expects an array so just wrap our single resultset.
      return thProject.postResultset([resultset]);
    }).then(function() {

      console.log('posted resultset for ' + user + '/' + repo + ' #' + number);
      return githubTasks(req.app.get('github'), body.pull_request);

    }).then(function(tasks) {

      var promises = tasks.map(function(task) {
        return queue.postTask(task);
      });

      return Promise.all(promises);

    }).then(function(list) {
      var taskIds = [];
      list.forEach(function(task) {
        console.log('Posted new task %s', task.status.taskId);
        taskIds.push(task.status.taskId);
      });

      // respond with the task ids (mostly for debugging and testing)
      return res.send(200, { taskIds: taskIds });

    }).catch(function(err) {
      console.error('Could not generate or post resulset from github pr');
      console.error(err);
      var err = new Error(
        'failed to generate resultset ' + user + '/' + repo + ' #' + number
      );
      err.status = 500;
      next(err);
    });
  }
};

module.exports = { api: api, controller: controller };
