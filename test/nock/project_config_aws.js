var nock = require('nock');
nock('https://github-treeherder.s3-us-west-2.amazonaws.com:443')
  .get('/empty_config.json')
  .reply(200, "{}\n", { 'x-amz-id-2': '154pl97GRlrXMkE0OSXeBk/a3iwIbDf7WyeZeNQFf1CPSpEnEapBfHQTlFkm+EuQ',
  'x-amz-request-id': 'C21665A405C1BCDE',
  date: 'Thu, 27 Feb 2014 09:00:16 GMT',
  'last-modified': 'Thu, 27 Feb 2014 08:50:46 GMT',
  etag: '"8a80554c91d9fca8acb82f023de02f11"',
  'accept-ranges': 'bytes',
  'content-type': 'application/json',
  'content-length': '3',
  server: 'AmazonS3' });
