/**
@see https://github.com/lightsofapollo/object-factory
@tutorial task_factories
@module taskcluster-client/factory/task
*/
var Factory = require('object-factory');
var Tags = new Factory();

var Payload = new Factory({
  onbuild: function(object) {
    object.command = object.command || ['/bin/bash -c', 'ls -lah'];
  },

  properties: {
    image: 'ubuntu',
    // onbuild above handles this
    // command: []
    features: {
    }
  }
});

var Metadata = new Factory({
  properties: {
    name: '',
    description: '',
    owner: '',
    source: 'http://localhost'
  }
});

var Task = new Factory({
  onbuild: function(object) {
    object.created = object.created || new Date();

    var defaultDeadline = new Date(object.created);
    defaultDeadline.setHours(defaultDeadline.getHours() + 24);
    object.deadline = object.deadline || defaultDeadline;
  },

  properties: {
    version: '0.2.0',
    provisionerId: 'dont-spawn-machines',
    routing: '',
    // workerType: ''
    timeout: 180, // in seconds
    retries: 1,
    priority: 5,
    // created: new Date()
    // deadline: new Date()
    payload: Payload,
    metadata: Metadata,
    tags: Tags
  }
});

module.exports = Task;
