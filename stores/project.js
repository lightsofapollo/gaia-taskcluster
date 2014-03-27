var projectConfig = require('../project_config');
var Promise = require('promise');
var debug = require('debug')('github-taskcluster/stores/project');

/**
Decorate a method to load data from the source config if not already loaded.
*/
function decorateWithConfig(method) {
  return function() {
    var args = Array.prototype.slice.call(arguments);

    // if this instance already has data just continue...
    if (this._data) {
      args.unshift(this._data);
      return Promise.from(method.apply(this, args));
    }

    return projectConfig(this.source).then(function(data) {
      this._data = data;
      args.unshift(data);
      return method.apply(this, args);
    }.bind(this));
  };
}

function Project(source) {
  this.source = source;
}

Project.prototype = {

  /**
  Find a project by it's repository

  @param {Object} data for configuration.
  */
  findProjectByRepo: decorateWithConfig(function(data, user, repo, branch) {
    debug('Find project', {
      user: user,
      repo: repo,
      branch: branch
    });

    for (var i = 0; i < data.length; i++) {
      var project = data[i];
      if (
        project.user === user &&
        project.repo === repo &&
        project.branch === branch
      ) {
        return project;
      }
    }
  })

};

module.exports = Project;
