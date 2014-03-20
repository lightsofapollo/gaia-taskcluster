suite('exchange', function() {
  var exchange = require('./exchange');

  suite('#queueRoutingKey', function() {

    test('defaults', function() {
      assert.equal(
        exchange.queueRoutingKey(),
        '*.*.*.*.*.*.#'
      );
    });

    test('no defaults', function() {
      var expected = [];
      var object = {};
      var keys = [
       'taskId',
       'runId',
       'workerGroup',
       'workerId',
       'provisionerId',
       'workerType',
       'taskRouting'
      ];

      keys.forEach(function(name) {
        expected.push(name);
        object[name] = name;
      });

      assert.equal(
        exchange.queueRoutingKey(object),
        expected.join('.')
      );
    });
  });

  test('#graphRoutingKey', function() {
    var expected = '*.*.*.*.*.*.sch.graphid.param';
    var result = exchange.graphRoutingKey({
      schedulerId: 'sch',
      taskGraphId: 'graphid',
      taskGraphRouting: 'param'
    });
    assert.equal(result, expected);
  });
});

