var nock = require('nock');
nock('http://queue.taskcluster.net:80')
  .post('/v1/task/new')
  .reply(200, "{\n  \"status\": {\n    \"taskId\": \"d46a94f8-6a3a-4c75-90d8-07194e7fa31f\",\n    \"provisionerId\": \"fake-provisioner-dont-do-stuff\",\n    \"workerType\": \"not-a-real-worker\",\n    \"runs\": [],\n    \"state\": \"pending\",\n    \"reason\": \"none\",\n    \"routing\": \"\",\n    \"retries\": 1,\n    \"priority\": 5,\n    \"created\": \"2014-03-02T23:27:58.596Z\",\n    \"deadline\": \"2014-03-03T23:27:58.596Z\",\n    \"takenUntil\": \"1970-01-01T00:00:00.000Z\"\n  }\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Sun, 02 Mar 2014 23:27:59 GMT',
  'x-powered-by': 'Express',
  'content-length': '419',
  connection: 'Close' });
