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
    console.log(req.body);
    res.send(200);
  }
};

module.exports = { api: api, controller: controller };
