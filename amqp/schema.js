var Schema = require('amqpworkers/schema');
var Exchanges = require('taskcluster-client/exchange');

/**
Build a schema object based on the queue configuration
*/
module.exports = function(queue, options) {
  var route = Exchanges.graphTaskRoutingKey({
    taskGraphRouting: process.env.TASKCLUSTER_ROUTING_KEY + '.#'
  });

  return new Schema({
    exchanges: [],

    queues: [
      [queue, options || {}]
    ],

    binds: Exchanges.QUEUE_TASKS.map(function(name) {
      return [queue, name, route];
    })
  });
};
