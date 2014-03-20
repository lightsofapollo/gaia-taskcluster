var Factory = require('./job_factory');
var Promise = require('promise');

var debug = require('debug')('treeherder:status');
var request = require('superagent-promise');

function dateToSeconds(date) {
  var submit = new Date(date);
  submit = Math.floor(submit.valueOf() / 1000);
  return submit;
}

function fetchWithRetry(url, timeout) {
  timeout = timeout || 30000;
  timeout = Date.now() + timeout;

  return new Promise(function(accept, reject) {
    function fetch() {
      if (Date.now() > timeout) {
        return reject(
          new Error('timoeut while trying to fetch url: ' + url)
        );
      }

      request('GET', url).end().then(function(res) {
        if (!res.ok) return setTimeout(fetch, 100);
        accept(res.body);
      });
    }
    fetch();
  });
}

/**
Function decorator will fetch the task definition from task id and inject it
after the queue.
*/
function taskDecorator(method) {
  return function(queue, payload) {
    var taskId = payload.status.taskId;

    return queue.getTask(taskId).then(function(task) {
      return method.call(this, queue, payload, task);
    }.bind(this));

  };
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
      revision_hash: tags.treeherderResultset,
      project: tags.treeherderProject,
      job: {
        name: task.metadata.name,
        description: task.metadata.description,
        job_guid: payload.status.taskId,
        job_symbol: tags.treeherderSymbol,
        submit_timestamp: dateToSeconds(payload.status.created)
      }
    });
  },

  pending: taskDecorator(function(queue, payload, task) {
    var base = this.base(payload, task);
    base.job.state = 'pending';
    debug('mark task as pending', task, base);
    return base;
  }),

  running: taskDecorator(function(queue, payload, task) {
    return fetchWithRetry(payload.logsUrl).then(function(body) {
      var logs = body.logs;
      var base = this.base(payload, task);
      base.job.state = 'running';
      base.job.artifact = {
        type: 'json',
        name: 'Job Info',
        blob: {
          tinderbox_printlines: [
            'taskcluster task link: ' +
            'http://docs.taskcluster.net/tools/task-inspector/#' +
            payload.status.taskId
          ]
        }
      };
      base.job.log_references = Object.keys(logs).map(function(name) {
        return {
          url: logs[name],
          name: name
        };
      });

      debug('mark task as running', task, base);
      return base;
    }.bind(this));
  }),

  completed: taskDecorator(function(queue, payload, task) {
    return fetchWithRetry(payload.resultUrl).then(function(body) {
      var base = this.base(payload, task);

      base.job.state = 'completed';
      base.job.result = (body.result.exitCode === 0) ? 'success' : 'testfailed';

      base.job.start_timestamp =
        dateToSeconds(body.statistics.started);

      base.job.end_timestamp =
        dateToSeconds(body.statistics.finished);

      debug('mark task as completed', task, base);
      return base;
    }.bind(this));
  }),

  failed: taskDecorator(function(queue, payload, task) {
    return fetchWithRetry(payload.resultUrl).then(function(body) {
      var base = this.base(payload, task);
      base.job.state = 'completed';
      base.job.result = 'busted';
      debug('mark task as failed', task, base);
      return base;
    }.bind(this));

  })
};

module.exports = StatusHandler;
