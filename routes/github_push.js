var TreeherderProject = require('mozilla-treeherder/project');
var TreehederGHFactory = require('mozilla-treeherder/factory/github');

var githubGraph = require('../graph/github_push');
var debug = require('debug')('gaia-treeherder/github/pull_request');

function githubPush(req, res, next) {
  var body = req.body;

  var ghRepo = body.repository;
  var branch = body.ref.split('/').pop();

  if (!ghRepo || !branch) {
    var error =
      new Error('Invalid commit data repository or branch is missing');
    return next(error);
  }

  // we get push notifications for branches, etc.. we only care about incoming
  // commits with new data.
  if (!body.commits || !body.commits.length) {
    return res.send(200, { message: 'No commits to take action on' });
  }


  // taskcluster queue
  var queue = res.app.get('queue');
  // taskcluster graph
  var graph = res.app.get('graph');

  // github client
  var github = res.app.get('github');

  // project configuration
  var projects = res.app.get('projects');

  // github params
  var user = ghRepo.owner.name;
  var repo = ghRepo.name;
  var project;

  return projects.findByRepo(
    user,
    repo,
    branch
  ).then(function(_project) {
    project = _project;
    debug('Handling push for project ', project);

    if (!project) {
      var err = new Error('Cannot handle requests for this github project');
      err.status = 400;
      throw err;
    }

    var resultset = {
      revision_hash: body.head_commit.id,
      type: 'push',
      revisions: TreehederGHFactory.pushCommits(project.name, body.commits),
      push_timestamp: (new Date(body.head_commit.timestamp).valueOf()) / 1000
    };

    // submit the resultset to treeherder
    var thProject = new TreeherderProject(project.name, {
      consumerKey: project.consumerKey,
      consumerSecret: project.consumerSecret
    });

    // treeherder expects an array so just wrap our single resultset.
    return thProject.postResultset([resultset]);

  }).then(function() {

    // build the graph and send it off...
    return githubGraph.buildGraph(github, project, body).then(
      graph.createTaskGraph.bind(graph)
    );

  }).then(function(result) {

    // respond with the task ids (mostly for debugging and testing)
    return res.send(201, result);

  }).catch(function(err) {
    if (!err.status) {
      // generate a default error status if an explicit value was not given..
      console.error('Could not generate or post resulset from github push');
      console.error(err.stack);
      var err = new Error(
        'failed to generate resultset ' + user + '/' + repo + ' ' + body.ref
      );
      err.status = 500;
    }

    next(err);
  });
}

module.exports = githubPush;
