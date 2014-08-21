var Project = require('mozilla-treeherder/project');
var Promise = require('promise');
var Status = require('../treeherder/status');
var debug = require('debug')('gaia-taskcluster:task-consumer');

function jobFromTask(queue, taskState) {
  return new Promise(function(accept, reject) {
    var state = taskState.status.state;
    switch (state) {
      case 'pending':
      case 'running':
      case 'failed':
      case 'completed':
        Status[state](queue, taskState).then(accept, reject);
        break;
      default:
        var err = new Error('unknown task state: ' + state);
        err.task = taskState;
        reject(err);
        break;
    }
  });
}

function findProject(name, projects) {
  var len = projects.length;
  for (var i = 0; i < len; i++) {
    if (projects[i].name === name) {
      return projects[i];
    }
  }
}

/**
message consumer for posting messages into treeherder.
*/
function TaskConsumer(connection, projects, queue) {
  Consumer.call(this, connection);

  this.queue = queue;
  this.projects = projects;
}

TaskConsumer.prototype = {
  __proto__: Consumer.prototype,

  treeherderProject: function(project) {
    var config = findProject(project, this.projects);
    return new Project(config.name, {
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret
    });
  },

  read: function(content, message) {
    debug('amqp message:', content, { exchange: message.fields.exchange });
    return jobFromTask(this.queue, content).then(function(job) {
      var project = this.treeherderProject(job.project || 'gaia');
      debug('job', job);
      return project.postJobs([job]);
    }.bind(this));
  }
};

module.exports = TaskConsumer;
