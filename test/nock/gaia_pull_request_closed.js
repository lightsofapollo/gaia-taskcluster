var nock = require('nock');

nock('http://treeherder-dev.allizom.org:80')
  .filteringPath(/\?(.*)/, '')
  .get('/api/project/gaia/resultset/')
  .reply(200, '[]', { server: 'gunicorn/0.17.2',
  vary: 'Accept,Cookie',
  'content-type': 'application/json; charset=utf-8',
  allow: 'GET, POST, HEAD, OPTIONS',
  date: 'Thu, 27 Feb 2014 19:37:35 GMT',
  'x-varnish': '1154153904',
  age: '0',
  via: '1.1 varnish',
  connection: 'close' });

