var nock = require('nock');

nock('http://scheduler.taskcluster.net:80')
  .post('/v1/task-graph/create')
  .reply(200, "{\n  \"status\": {\n    \"taskGraphId\": \"zX4W2metQNyPrge5YSEh6Q\",\n    \"schedulerId\": \"task-graph-scheduler\",\n    \"state\": \"running\",\n    \"routing\": \"testing\"\n  }\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Tue, 18 Mar 2014 10:10:46 GMT',
  'x-powered-by': 'Express',
  'content-length': '158',
  connection: 'Close' });
