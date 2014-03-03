var nock = require('nock');
nock('http://tasks.taskcluster.net:80')
  .get('/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/task.json')
  .reply(200, "{\"version\":\"0.2.0\",\"provisionerId\":\"aws-provisioner\",\"routing\":\"gaia-taskcluster\",\"retries\":1,\"priority\":5,\"payload\":{\"image\":\"ubuntu\",\"features\":{},\"command\":[\"ls\"]},\"metadata\":{\"name\":\"\",\"description\":\"\",\"owner\":\"jlal@mozilla.com\",\"source\":\"http://localhost\"},\"tags\":{\"treeherderProject\":\"gaia\",\"treeherderResultset\":\"https://github.com/mozilla-b2g/gaia/pull/16607\",\"treeherderSymbol\":\"GI\"},\"workerType\":\"ami-cc5c30fc\",\"created\":\"2014-03-03T10:18:34.961Z\",\"deadline\":\"2014-03-04T10:18:34.961Z\"}", { 'x-amz-id-2': '4wFTiZcpOFGDtEwOF4KNC0g68xUeiLpFRLZ0BTfLQaEE5nNnYEYOOlmMNL7HM6pC',
  'x-amz-request-id': '9709F213A2E9847C',
  date: 'Mon, 03 Mar 2014 11:44:30 GMT',
  'last-modified': 'Mon, 03 Mar 2014 10:18:36 GMT',
  etag: '"9665e3c1e595f1a51c4b2c8e38c83849"',
  'content-type': 'application/json',
  'content-length': '496',
  server: 'AmazonS3' });
