suite('queue', function() {
  var nock = require('nock');
  var urlJoin = require('url-join');
  var TaskFactory = require('./factory/task');
  var Queue = require('./queue');

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

  test('#url', function() {
    var expected = urlJoin(
      subject.options.queueUrl,
      Queue.API_VERSION,
      'task/1/status'
    );

    var url = subject.url('task/%d/status', 1);

    assert.equal(expected, url);
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

      var task = TaskFactory.create({
        // use some fake values so we don't run real tasks...
        workerType: 'not-a-real-worker',
        provisionerId: 'fake-provisioner-dont-do-stuff',
        metadata: { owner: 'testing@testing.com' }
      });

      return subject.postTask(task).then(function(body) {
        // quick sanity check
        assert.ok(body.status);
        assert.equal(body.status.workerType, task.workerType);
      });
    });
  });

  test('#getTask', function() {
    require('./test/fixtures/nock_task_get');

    var submitTask = TaskFactory.create({
      workerType: 'not-a-real-worker',
      provisionerId: 'fake-provisioner-dont-do-stuff',
      metadata: { owner: 'testing@testing.com' },
      tags: {
        madeFromTest: 'yup'
      }
    });

    return subject.postTask(submitTask).then(function(body) {
      var taskId = body.status.taskId;
      return subject.getTask(taskId);
    }).then(function(task) {
      assert.deepEqual(task.tags.madeFromTest, submitTask.tags.madeFromTest);
    });
  });
});
