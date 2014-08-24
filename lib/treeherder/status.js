var Factory = require('./job_factory');
var Promise = require('promise');

var debug = require('debug')('treeherder:status');
var request = require('superagent-promise');

function dateToSeconds(date) {
  var submit = new Date(date);
  submit = Math.floor(submit.valueOf() / 1000);
  return submit;
}

/**
taskcluster sends status updates on all tasks via amqp this module is
responsible for handling the incoming payloads and converting them into
job status updates.
*/
var StatusHandler = {
  base: function(payload, task, overrides) {
    var taskId = payload.status.taskId;
    var tags = task.tags;

    return Factory.create({
      revision_hash: tags.commit,
      project: tags.treeherderRepo,
      job: {
        who: task.metadata.owner,
        name: task.metadata.name,
        description: task.metadata.description,
        job_guid: payload.status.taskId,
        job_symbol: tags.treeherderSymbol,
        submit_timestamp: dateToSeconds(payload.status.created)
      }
    });
  },

  pending: function* (runtime, payload) {
    var task = yield runtime.queue.getTask(payload.status.taskId);
    var base = this.base(payload, task);

    base.job.state = 'pending';
    base.job.artifacts = [{
      type: 'json',
      name: 'Job Info',
      blob: {
        tinderbox_printlines: [
          'taskcluster task link: ' +
          'http://docs.taskcluster.net/tools/task-inspector/#' +
          payload.status.taskId
        ]
      }
    }];
    debug('mark task as pending', task, base);
    return base;
  },

  running: function* (runtime, payload) {
    var task = yield runtime.queue.getTask(payload.status.taskId);
    var base = this.base(payload, task);
    base.job.state = 'running';
    debug('mark task as running', task, base);
    return base;
  },

  completed: function* (runtime, payload) {
    var task = yield runtime.queue.getTask(payload.status.taskId);
    var base = this.base(payload, task);
    var run = payload.status.runs[payload.runId];

    base.job.state = 'completed';
    base.job.result = (payload.success) ? 'success' : 'testfailed';
    base.job.start_timestamp = dateToSeconds(run.started);
    base.job.end_timestamp = dateToSeconds(run.resolved);

    debug('mark task as completed', task, base);
    return base;
  },

  failed: function* (queue, payload) {
    var task = yield runtime.queue.getTask(payload.status.taskId);
    var base = this.base(payload, task);
    base.job.state = 'completed';
    base.job.result = 'busted';
    debug('mark task as failed', task, base);
    return base;
  }
};

module.exports = StatusHandler;
