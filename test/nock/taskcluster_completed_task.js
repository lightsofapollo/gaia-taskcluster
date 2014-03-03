var nock = require('nock');

nock('http://tasks.taskcluster.net:80')
  .get('/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/task.json')
  .reply(200, "{\"version\":\"0.2.0\",\"provisionerId\":\"aws-provisioner\",\"routing\":\"gaia-taskcluster\",\"retries\":1,\"priority\":5,\"payload\":{\"image\":\"ubuntu\",\"features\":{},\"command\":[\"ls\"]},\"metadata\":{\"name\":\"\",\"description\":\"\",\"owner\":\"jlal@mozilla.com\",\"source\":\"http://localhost\"},\"tags\":{\"treeherderProject\":\"gaia\",\"treeherderResultset\":\"https://github.com/mozilla-b2g/gaia/pull/16607\",\"treeherderSymbol\":\"GI\"},\"workerType\":\"ami-cc5c30fc\",\"created\":\"2014-03-03T10:18:34.961Z\",\"deadline\":\"2014-03-04T10:18:34.961Z\"}", { 'x-amz-id-2': 'JjHrX04VxuGPK1qKlsrIw2F9u1mCN1tmuKFh5S8ARCeaGU/eD5qzyXhQZ8glE+qy',
  'x-amz-request-id': 'FB75A90FB0B3D392',
  date: 'Mon, 03 Mar 2014 11:15:53 GMT',
  'last-modified': 'Mon, 03 Mar 2014 10:18:36 GMT',
  etag: '"9665e3c1e595f1a51c4b2c8e38c83849"',
  'content-type': 'application/json',
  'content-length': '496',
  server: 'AmazonS3' });

nock('http://tasks.taskcluster.net:80')
  .get('/04fe0a81-d2f4-48de-9251-08dcd66cf6a8/runs/1/result.json')
  .reply(200, "{\"version\":\"0.2.0\",\"artifacts\":{},\"statistics\":{\"started\":\"2014-03-03T10:18:46.232Z\",\"finished\":\"2014-03-03T10:18:47.011Z\"},\"metadata\":{\"workerGroup\":\"us-west-2a\",\"workerId\":\"i-9ff3e596\"},\"result\":{\"exitCode\":0,\"startTimestamp\":1393841925997,\"stopTimestamp\":1393841927011}}", { 'x-amz-id-2': 'XvdF49BxY9zv6orUVNBzoP4HpIaNBCK30+YFTJ2DRND/xqytCn5C50bILuzDiZ1j',
  'x-amz-request-id': 'B88D39FC1698E11A',
  date: 'Mon, 03 Mar 2014 11:15:53 GMT',
  'last-modified': 'Mon, 03 Mar 2014 10:18:49 GMT',
  etag: '"3813fd0075a9178082ee77131437d34e"',
  'content-type': 'application/json',
  'content-length': '273',
  server: 'AmazonS3' });
