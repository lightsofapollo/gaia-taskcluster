var api = {
  resourcePath: '/github',
  apis: [
    {
      path: '/github',
      operations: [
        {
          summary:
            'Handle incoming github pull events and link them to treeherder',

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
  post: function(req, res) {
    res.send(200);
  }
};

module.exports = { api: api, controller: controller };
