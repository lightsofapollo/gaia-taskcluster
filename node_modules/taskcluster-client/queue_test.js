suite('queue', function() {
  var nock = require('nock');
  var urlJoin = require('url-join');
  var TaskFactory = require('./factory/task');
  var Queue = require('./queue');

  var TestTask = TaskFactory.extend({
    properties: {
      workerType: 'not-a-real-worker',
      provisionerId: 'fake-provisioner',
      metadata: {
        name: 'test-task',
        source: 'http://localhost',
        owner: 'testing@testing.com'
      }
    }
  });

  //nock.recorder.rec();

  suiteSetup(function() {
    nock.disableNetConnect();
  });

  suiteTeardown(function() {
    nock.enableNetConnect();
  });

  var subject;
  setup(function() {
    subject = new Queue();
  });

  test('initialize with queueUrl', function() {
    var url = 'http://xfoo.com';
    var subject = new Queue({
      queueUrl: url
    });

    assert.equal(subject.options.queueUrl, url);
  });

  test('#amqpConnectionString', function() {
    var config = require('./config');

    nock(subject.options.queueUrl).
      get('/v1/settings/amqp-connection-string').
      reply(200, { url: 'amqp://localhost:5672' });

    return subject.amqpConnectionString().then(function(body) {
      assert.ok(body.url);
      assert.ok(body.url.indexOf('amqp') === 0);
    });
  });

  suite('#postTask', function() {

    test('unsuccessful', function(done) {
      require('./test/fixtures/nock_task_post_error');
      var task = TaskFactory.create();

      subject.postTask(task).then(function(response) {
        done(new Error('Should not be successful'));
      }).catch(function(err) {
        assert.ok(err);
        assert.ok(err.message.indexOf('schema') !== -1);
        done();
      });
    });

    test('successful', function() {
      require('./test/fixtures/nock_task_post_success');
      var task = TestTask.create();

      return subject.postTask(task).then(function(body) {
        // quick sanity check
        assert.ok(body.status);
        assert.equal(body.status.workerType, task.workerType);
      });
    });
  });

  test('#getTask', function() {
    require('./test/fixtures/nock_task_get');
    var submitTask = TestTask.create({ tags: { madeFromTest: 'yup' } });

    return subject.postTask(submitTask).then(function(body) {
      var taskId = body.status.taskId;
      return subject.getTask(taskId);
    }).then(function(task) {
      assert.deepEqual(task.tags.madeFromTest, submitTask.tags.madeFromTest);
    });
  });

  suite('#taskStatus', function() {
    var task = TestTask.create({ routing: 'task-status-test' });
    var taskId;

    setup(function() {
      require('./test/fixtures/nock_task_status');
      return subject.postTask(task).then(function(body) {
        taskId = body.status.taskId;
      });
    });

    test('status', function() {
      return subject.taskStatus(taskId).then(function(body) {
        var status = body.status;
        assert.equal(status.routing, task.routing);
      });
    });
  });
});
