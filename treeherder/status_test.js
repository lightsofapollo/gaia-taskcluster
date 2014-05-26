suite.skip('status handler', function() {
  var TASK_ID = 'f2EFy3b-TvChw1qxmxEsTA';
  var getTask = require('../taskcluster/get_task');
  var co = require('co');

  var Status = require('./status');
  var nock = require('nock');

  suiteSetup(function() {
    nock.disableNetConnect();
  });

  suiteTeardown(function() {
    nock.enableNetConnect();
  });

  var queue;
  setup(function() {
    queue = require('taskcluster-client').queue;
  });

  var task;
  setup(co(function*() {
    require('../test/nock/taskcluster_task')();
    task = yield getTask(TASK_ID);
  }));

  suite('#pending', function() {
    var fixture = {
      "version": "0.2.0",
      "status": {
        "taskId": TASK_ID,
        "provisionerId": "aws-provisioner",
        "workerType": "ami-cc5c30fc",
        "runs": [],
        "state": "pending",
        "reason": "none",
        "routing": "gaia-taskcluster",
        "retries": 1,
        "priority": 5,
        "created": "2014-03-03T10:18:34.961Z",
        "deadline": "2014-03-04T10:18:34.961Z",
        "takenUntil": "1970-01-01T00:00:00.000Z"
      }
    };

    test('pending result', function() {
      require('../test/nock/taskcluster_pending_task')();

      var submitTimestamp = new Date(fixture.status.created);
      submitTimestamp = Math.floor(submitTimestamp.valueOf() / 1000);

      return Status.pending(queue, fixture).then(function(result) {
        assert.equal(result.revision_hash, task.tags.treeherderResultset);
        assert.equal(result.project, 'gaia');

        var job = result.job;
        assert.equal(job.job_guid, fixture.status.taskId);
        assert.equal(job.submit_timestamp, submitTimestamp);
      });
    });
  });

  suite('#running', function() {
    var fixture = {
      "version": "0.2.0",
      "workerGroup": "us-west-2a",
      "workerId": "i-9ff3e596",
      "runId": 1,
      "logsUrl": "http://tasks.taskcluster.net/" + TASK_ID + "/runs/1/logs.json",
      "status": {
        "taskId": TASK_ID,
        "runs": [
          {
            "runId": 1,
            "workerGroup": "us-west-2a",
            "workerId": "i-9ff3e596"
          }
        ],
        "provisionerId": "aws-provisioner",
        "workerType": "ami-cc5c30fc",
        "state": "running",
        "reason": "none",
        "routing": "gaia-taskcluster",
        "retries": 0,
        "priority": 5,
        "created": "2014-03-03T10:18:34.961Z",
        "deadline": "2014-03-04T10:18:34.961Z",
        "takenUntil": "2014-03-03T10:38:45.734Z"
      }
    };

    test('running task', function() {
      require('../test/nock/taskcluster_running_task')();

      return Status.running(queue, fixture).then(function(result) {
        var job = result.job;
        var logs = job.log_references;
        assert.equal(job.job_guid, fixture.status.taskId);
        assert.deepEqual(logs, [{
          url: 'https://tasklogs.blob.core.windows.net:443/taskclusterlogs/88aefff8-e56c-4bf9-a042-9ed769c08e68',
          name: 'terminal.log'
        }]);
      });
    });
  });

  suite('#completed', function() {
    var fixture = {
      "version": "0.2.0",
      "status": {
        "taskId": TASK_ID,
        "runs": [
          {
            "runId": 1,
            "workerGroup": "us-west-2a",
            "workerId": "i-9ff3e596"
          }
        ],
        "provisionerId": "aws-provisioner",
        "workerType": "ami-cc5c30fc",
        "state": "completed",
        "reason": "none",
        "routing": "gaia-taskcluster",
        "retries": 0,
        "priority": 5,
        "created": "2014-03-03T10:18:34.961Z",
        "deadline": "2014-03-04T10:18:34.961Z",
        "takenUntil": "2014-03-03T10:38:45.734Z"
      },
      "resultUrl": "http://tasks.taskcluster.net/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/runs/1/result.json",
      "logsUrl": "http://tasks.taskcluster.net/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/runs/1/logs.json",
      "runId": 1,
      "workerId": "i-9ff3e596",
      "workerGroup": "us-west-2a"
    };

    test('completed task success', function() {
      require('../test/nock/taskcluster_completed_task')();

      return Status.completed(queue, fixture).then(function(result) {
        var job = result.job;
        assert.equal(job.state, 'completed');
        assert.equal(job.result, 'success');
      });
    });
  });

  suite('#failed', function() {
    var fixture = {
      "version": "0.2.0",
      "status": {
        "taskId": TASK_ID,
        "runs": [
          {
            "runId": 1,
            "workerGroup": "us-west-2a",
            "workerId": "i-9ff3e596"
          }
        ],
        "provisionerId": "aws-provisioner",
        "workerType": "ami-cc5c30fc",
        "state": "completed",
        "reason": "none",
        "routing": "gaia-taskcluster",
        "retries": 0,
        "priority": 5,
        "created": "2014-03-03T10:18:34.961Z",
        "deadline": "2014-03-04T10:18:34.961Z",
        "takenUntil": "2014-03-03T10:38:45.734Z"
      },
      "resultUrl": "http://tasks.taskcluster.net/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/runs/1/result.json",
      "logsUrl": "http://tasks.taskcluster.net/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/runs/1/logs.json",
      "runId": 1,
      "workerId": "i-9ff3e596",
      "workerGroup": "us-west-2a"
    };

    test('failed task', function() {
      require('../test/nock/taskcluster_completed_task')();
      return Status.failed(queue, fixture).then(function(result) {
        var job = result.job;
        assert.equal(job.state, 'completed');
        assert.equal(job.result, 'busted');
      });
    });
  });

});
