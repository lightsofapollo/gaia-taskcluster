/**
@module taskcluster-client/factory/graph
*/

/**
Create a task graph factory
@see https://github.com/lightsofapollo/object-factory

@example

var factory = require('taskcluster-client/factory/graph');

factory.create({
  routing: 'test',

  tasks: {
    'run a task': {
      reruns: 0,

      task: {
        payload: {
          image: 'ubuntu',
          command: ['ls']
        }
      }
    }
  }
});

@example

// example output from a graph create

{ version: '0.2.0',
  routing: 'test',
  tasks:
   { 'run a task':
      { reruns: 0,
        task:
         { version: '0.2.0',
           provisionerId: 'dont-spawn-machines',
           routing: '',
           timeout: 180,
           retries: 1,
           priority: 5,
           payload:
            { image: 'ubuntu',
              features: {},
              command: [ 'ls' ] },
           metadata:
            { name: '',
              description: '',
              owner: '',
              source: 'http://localhost' },
           tags: {},
           created: Tue Mar 18 2014 03:38:14 GMT-0700 (PDT),
           deadline: Wed Mar 19 2014 03:38:14 GMT-0700 (PDT) },
        requires: [] } } }

*/
exports.create = function create() {};

var Factory = require('object-factory');
var Task = require('./task');


var GraphTask = new Factory({
  onbuild: function(props) {
    props.requires = props.requires || [];
  },

  properties: {
    // requires: []
    reruns: 0,
    task: Task
  }
});

var Graph = new Factory({
  onbuild: function(props) {
    props.tasks = props.tasks || {};

    props.tasks = Object.keys(props.tasks).reduce(function(result, name) {
      var task = props.tasks[name];
      result[name] = GraphTask.create(task);

      return result;
    }, {});
  },

  properties: {
    version: '0.2.0',
    // routing: ''
    // tasks: { 'name': Graph }
  }
});

module.exports = Graph;
