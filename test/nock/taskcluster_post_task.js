var nock = require('nock');

nock('http://queue.taskcluster.net:80')
  .post('/v1/task/new')
  .reply(200, "{\n  \"status\": {\n    \"taskId\": \"cd11c7a1-3abc-40c7-b3ab-2da1445cc4e9\",\n    \"provisionerId\": \"aws-provisioner\",\n    \"workerType\": \"ami-cc5c30fc\",\n    \"runs\": [],\n    \"state\": \"pending\",\n    \"reason\": \"none\",\n    \"routing\": \"\",\n    \"retries\": 1,\n    \"priority\": 5,\n    \"created\": \"2014-03-03T02:52:41.566Z\",\n    \"deadline\": \"2014-03-04T02:52:41.566Z\",\n    \"takenUntil\": \"1970-01-01T00:00:00.000Z\"\n  }\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Mon, 03 Mar 2014 02:52:42 GMT',
  'x-powered-by': 'Express',
  'content-length': '399',
  connection: 'Close' });
