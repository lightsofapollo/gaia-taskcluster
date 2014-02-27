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

var thGithub = require('mozilla-treeherder/github');
var thProject = require('mozilla-treeherder/project');

var controller = {
  post: function(req, res, next) {
    var body = res.body;
    var pull_request = req.body.pull_request;

    if (!pull_request) {
      var err = new Error('Invalid pull request data');
      err.status = 400;
      return next(err);
    }
  }
};

module.exports = { api: api, controller: controller };
