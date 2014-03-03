Its fairly easy to bind everything yourself with amqp but there is quite
a bit of boilerplate and hardcoded strings... Here is an example of
using the `amqp` and `exchange` module together to listen on the task
running exchange.

```js
// schema.js
var AmqpSchema = require('amqpworkers/schema');

var exchange = require('taskcluster-client/exchange');
var route = exchange.taskRoutingKey();

module.exports = new AmqpSchema({
  queues: [
    ['taskcluster-thing', { durable: true }]
  ],

  binds: [
    ['taskcluster-thing', exchanges.QUEUE_TASK_RUNNING, route]
  ]
});
```

```js
// app.js
var Queue = require('taskcluster-client/queue');
var amqp = require('amqplib');
var schema = require('./schema');

var api = new Queue();

api.amqpConnectionString().then(funciton(credentials) {
  amqp.connect(credentials.url).then(function(connection) {
    // define your amqp schema (this is idempontent...
    return schema.define(connection);
  });
});


```

Also see the [docs for schema](https://github.com/lightsofapollo/amqpworkers#schema)

