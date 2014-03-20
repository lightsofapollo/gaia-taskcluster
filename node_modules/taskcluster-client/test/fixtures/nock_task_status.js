var nock = require('nock');

nock('http://queue.taskcluster.net:80')
  .post('/v1/task/new')
  .reply(200, "{\n  \"status\": {\n    \"taskId\": \"CFEBqPtxSzCZ7h71ehtQtA\",\n    \"provisionerId\": \"fake-provisioner\",\n    \"workerType\": \"not-a-real-worker\",\n    \"runs\": [],\n    \"state\": \"pending\",\n    \"reason\": \"none\",\n    \"routing\": \"task-status-test\",\n    \"timeout\": 180,\n    \"retries\": 1,\n    \"priority\": 5,\n    \"created\": \"2014-03-18T08:50:19.033Z\",\n    \"deadline\": \"2014-03-19T08:50:19.033Z\",\n    \"takenUntil\": \"1970-01-01T00:00:00.000Z\"\n  }\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Tue, 18 Mar 2014 08:50:22 GMT',
  'x-powered-by': 'Express',
  'content-length': '427',
  connection: 'Close' });


nock('http://queue.taskcluster.net:80')
  .get('/v1/task/CFEBqPtxSzCZ7h71ehtQtA/status')
  .reply(200, "{\n  \"status\": {\n    \"taskId\": \"CFEBqPtxSzCZ7h71ehtQtA\",\n    \"runs\": [],\n    \"provisionerId\": \"fake-provisioner\",\n    \"workerType\": \"not-a-real-worker\",\n    \"state\": \"pending\",\n    \"reason\": \"none\",\n    \"routing\": \"task-status-test\",\n    \"retries\": 1,\n    \"timeout\": 180,\n    \"priority\": 5,\n    \"created\": \"2014-03-18T08:46:07.554Z\",\n    \"deadline\": \"2014-03-19T08:46:07.554Z\",\n    \"takenUntil\": \"1970-01-01T00:00:00.000Z\"\n  }\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Tue, 18 Mar 2014 08:46:11 GMT',
  etag: '"1331328900"',
  'x-powered-by': 'Express',
  'content-length': '424',
  connection: 'Close' });
