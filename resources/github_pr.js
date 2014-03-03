var api = {
  resourcePath: '/github/pull_request/',
  apis: [
    {
      path: '/github/pull_request/',
      operations: [
        {
          summary:
            'Handle incoming pull requests and link them to treeherder',

          httpMethod: 'POST',
          nickname: 'post',
          responseClass: 'void'
        }
      ]
    }
  ]
};

var TreeherderGithub = require('mozilla-treeherder/github');
var TreeherderProject = require('mozilla-treeherder/project');
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

    var projects = res.app.get('projects');
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
      github: req.app.get('github'),
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
      res.send(200);
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
