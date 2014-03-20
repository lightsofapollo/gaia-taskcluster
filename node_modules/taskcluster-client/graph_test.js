suite('queue', function() {
  var nock = require('nock');
  var TaskFactory = require('./factory/task');
  var GraphFactory = require('./factory/graph');
  var Graph = require('./graph');

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
    subject = new Graph();
  });

  test('#create', function() {
    require('./test/fixtures/nock_graph_create');

    var graph = GraphFactory.create({
      routing: 'testing',
      tasks: {
        'test one': {
          task: TestTask.create(),
        },

        'test two': {
          task: TestTask.create()
        }
      }
    });

    // XXX: This is pretty damn lazy but ensures we post the values...
    //      Code implementing create is essentially an http call with a body and
    //      it's verified on the server that it's in the right format.
    return subject.create(graph).then(function(body) {
      assert.ok(body.status);
    });
  });
});
