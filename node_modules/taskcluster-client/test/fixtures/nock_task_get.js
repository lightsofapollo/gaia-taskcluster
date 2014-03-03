var nock = require('nock');

nock('http://queue.taskcluster.net:80')
  .post('/v1/task/new')
  .reply(200, "{\n  \"status\": {\n    \"taskId\": \"1af370f8-86d4-4623-8fd0-be5ba758c650\",\n    \"provisionerId\": \"fake-provisioner-dont-do-stuff\",\n    \"workerType\": \"not-a-real-worker\",\n    \"runs\": [],\n    \"state\": \"pending\",\n    \"reason\": \"none\",\n    \"routing\": \"\",\n    \"retries\": 1,\n    \"priority\": 5,\n    \"created\": \"2014-03-03T00:05:17.353Z\",\n    \"deadline\": \"2014-03-04T00:05:17.353Z\",\n    \"takenUntil\": \"1970-01-01T00:00:00.000Z\"\n  }\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Mon, 03 Mar 2014 00:05:18 GMT',
  'x-powered-by': 'Express',
  'content-length': '419',
  connection: 'Close' });

nock('http://tasks.taskcluster.net:80')
  .get('/1af370f8-86d4-4623-8fd0-be5ba758c650/task.json')
  .reply(200, "{\"version\":\"0.2.0\",\"provisionerId\":\"fake-provisioner-dont-do-stuff\",\"routing\":\"\",\"retries\":1,\"priority\":5,\"payload\":{\"image\":\"ubuntu\",\"features\":{},\"command\":[\"/bin/bash -c\",\"ls -lah\"]},\"metadata\":{\"name\":\"\",\"description\":\"\",\"owner\":\"testing@testing.com\",\"source\":\"http://localhost\"},\"tags\":{\"madeFromTest\":\"yup\"},\"workerType\":\"not-a-real-worker\",\"created\":\"2014-03-03T00:05:17.353Z\",\"deadline\":\"2014-03-04T00:05:17.353Z\"}", { 'x-amz-id-2': 'GahGMmFDeEgUmO/voR6bathh8gXKbIdns9rgVU5Gd68schdKr5ZVURLed7zdlRhQ',
  'x-amz-request-id': '11184702E02FC347',
  date: 'Mon, 03 Mar 2014 00:05:19 GMT',
  'last-modified': 'Mon, 03 Mar 2014 00:05:18 GMT',
  etag: '"02d60c4f7daf2c391adfb77474e4ca8f"',
  'content-type': 'application/json',
  'content-length': '422',
  server: 'AmazonS3' });
