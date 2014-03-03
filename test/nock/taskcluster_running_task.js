var nock = require('nock');

nock('http://tasks.taskcluster.net:80')
  .get('/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/task.json')
  .reply(200, "{\"version\":\"0.2.0\",\"provisionerId\":\"aws-provisioner\",\"routing\":\"gaia-taskcluster\",\"retries\":1,\"priority\":5,\"payload\":{\"image\":\"ubuntu\",\"features\":{},\"command\":[\"ls\"]},\"metadata\":{\"name\":\"\",\"description\":\"\",\"owner\":\"jlal@mozilla.com\",\"source\":\"http://localhost\"},\"tags\":{\"treeherderProject\":\"gaia\",\"treeherderResultset\":\"https://github.com/mozilla-b2g/gaia/pull/16607\",\"treeherderSymbol\":\"GI\"},\"workerType\":\"ami-cc5c30fc\",\"created\":\"2014-03-03T10:18:34.961Z\",\"deadline\":\"2014-03-04T10:18:34.961Z\"}", { 'x-amz-id-2': 'znqWUYT64dxwCSpsAMKeMn3yq50sQAZt8YeHEk8ISIqMI4Uw1YwztcZjuZRTa6PF',
  'x-amz-request-id': '6F3EF2C72AEDBF12',
  date: 'Mon, 03 Mar 2014 10:57:46 GMT',
  'last-modified': 'Mon, 03 Mar 2014 10:18:36 GMT',
  etag: '"9665e3c1e595f1a51c4b2c8e38c83849"',
  'content-type': 'application/json',
  'content-length': '496',
  server: 'AmazonS3' });

nock('http://tasks.taskcluster.net:80')
  .get('/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/runs/1/logs.json')
  .reply(200, "{\"version\":\"0.2.0\",\"logs\":{\"terminal.log\":\"https://tasklogs.blob.core.windows.net:443/taskclusterlogs/9469381c-22bb-401a-95f8-7bd970598c88\"}}", { 'x-amz-id-2': 'JzdUgHfhHgPPJupbeqNSTUpuuv5kdDta6PhfREMsB/PWFBO8XBipokVpKY1D1J5m',
  'x-amz-request-id': '1717D8EE0843C400',
  date: 'Mon, 03 Mar 2014 10:57:46 GMT',
  'last-modified': 'Mon, 03 Mar 2014 10:18:47 GMT',
  etag: '"3cbb09fd0018ce403ca12c90ae51c29e"',
  'content-type': 'application/json',
  'content-length': '141',
  server: 'AmazonS3' });
