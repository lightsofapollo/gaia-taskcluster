var nock = require('nock');

module.exports = function() {
  nock('https://api.github.com:443')
    .get('/repos/taskcluster/github-graph-example/contents/taskgraph.json')
    .reply(200, "{\"name\":\"taskgraph.json\",\"path\":\"taskgraph.json\",\"sha\":\"325a6c0ccf9f13152943176e65910aa4a173af16\",\"size\":372,\"url\":\"https://api.github.com/repos/taskcluster/github-graph-example/contents/taskgraph.json?ref=master\",\"html_url\":\"https://github.com/taskcluster/github-graph-example/blob/master/taskgraph.json\",\"git_url\":\"https://api.github.com/repos/taskcluster/github-graph-example/git/blobs/325a6c0ccf9f13152943176e65910aa4a173af16\",\"type\":\"file\",\"content\":\"ewogICJ0YXNrcyI6IHsKICAgICJ0ZXN0IjogewogICAgICAidGFzayI6IHsK\\nICAgICAgICAibWV0YWRhdGEiOiB7CiAgICAgICAgICAib3duZXIiOiAiamxh\\nbEBtb3ppbGxhLmNvbSIKICAgICAgICB9LAogICAgICAgICJwYXlsb2FkIjog\\newogICAgICAgICAgImltYWdlIjogInVidW50dSIsCiAgICAgICAgICAiY29t\\nbWFuZCI6IFsKICAgICAgICAgICAgImxzIgogICAgICAgICAgXQogICAgICAg\\nIH0sCiAgICAgICAgInRhZ3MiOiB7CiAgICAgICAgICAidHJlZWhlcmRlclBy\\nb2plY3QiOiAidGFza2NsdXN0ZXItaW50ZWdyYXRpb24iLAogICAgICAgICAg\\nInRyZWVoZXJkZXJTeW1ib2wiOiAiVENUIgogICAgICAgIH0KICAgICAgfQog\\nICAgfQogIH0KfQoK\\n\",\"encoding\":\"base64\",\"_links\":{\"self\":\"https://api.github.com/repos/taskcluster/github-graph-example/contents/taskgraph.json?ref=master\",\"git\":\"https://api.github.com/repos/taskcluster/github-graph-example/git/blobs/325a6c0ccf9f13152943176e65910aa4a173af16\",\"html\":\"https://github.com/taskcluster/github-graph-example/blob/master/taskgraph.json\"}}", { server: 'GitHub.com',
    date: 'Mon, 24 Mar 2014 19:43:56 GMT',
    'content-type': 'application/json; charset=utf-8',
    status: '200 OK',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4855',
    'x-ratelimit-reset': '1395691907',
    'cache-control': 'private, max-age=60, s-maxage=60',
    'last-modified': 'Mon, 24 Mar 2014 10:15:41 GMT',
    etag: '"586678625d9e692748e3c35a09ca52e2"',
    'x-oauth-scopes': 'gist, repo, user',
    'x-accepted-oauth-scopes': '',
    vary: 'Accept, Authorization, Cookie, X-GitHub-OTP',
    'x-github-media-type': 'github.beta; format=json',
    'x-content-type-options': 'nosniff',
    'content-length': '1318',
    'access-control-allow-credentials': 'true',
    'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
    'access-control-allow-origin': '*',
    'x-github-request-id': '4C6633FF:7E4F:136F2D:53308AFC',
    'x-served-by': '971af40390ac4398fcdd45c8dab0fbe7' });

  nock('https://api.github.com:443')
    .get('/repos/taskcluster/github-graph-example/contents/taskgraph.json')
    .reply(200, "{\"name\":\"taskgraph.json\",\"path\":\"taskgraph.json\",\"sha\":\"325a6c0ccf9f13152943176e65910aa4a173af16\",\"size\":372,\"url\":\"https://api.github.com/repos/taskcluster/github-graph-example/contents/taskgraph.json?ref=master\",\"html_url\":\"https://github.com/taskcluster/github-graph-example/blob/master/taskgraph.json\",\"git_url\":\"https://api.github.com/repos/taskcluster/github-graph-example/git/blobs/325a6c0ccf9f13152943176e65910aa4a173af16\",\"type\":\"file\",\"content\":\"ewogICJ0YXNrcyI6IHsKICAgICJ0ZXN0IjogewogICAgICAidGFzayI6IHsK\\nICAgICAgICAibWV0YWRhdGEiOiB7CiAgICAgICAgICAib3duZXIiOiAiamxh\\nbEBtb3ppbGxhLmNvbSIKICAgICAgICB9LAogICAgICAgICJwYXlsb2FkIjog\\newogICAgICAgICAgImltYWdlIjogInVidW50dSIsCiAgICAgICAgICAiY29t\\nbWFuZCI6IFsKICAgICAgICAgICAgImxzIgogICAgICAgICAgXQogICAgICAg\\nIH0sCiAgICAgICAgInRhZ3MiOiB7CiAgICAgICAgICAidHJlZWhlcmRlclBy\\nb2plY3QiOiAidGFza2NsdXN0ZXItaW50ZWdyYXRpb24iLAogICAgICAgICAg\\nInRyZWVoZXJkZXJTeW1ib2wiOiAiVENUIgogICAgICAgIH0KICAgICAgfQog\\nICAgfQogIH0KfQoK\\n\",\"encoding\":\"base64\",\"_links\":{\"self\":\"https://api.github.com/repos/taskcluster/github-graph-example/contents/taskgraph.json?ref=master\",\"git\":\"https://api.github.com/repos/taskcluster/github-graph-example/git/blobs/325a6c0ccf9f13152943176e65910aa4a173af16\",\"html\":\"https://github.com/taskcluster/github-graph-example/blob/master/taskgraph.json\"}}", { server: 'GitHub.com',
    date: 'Mon, 24 Mar 2014 19:43:57 GMT',
    'content-type': 'application/json; charset=utf-8',
    status: '200 OK',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4854',
    'x-ratelimit-reset': '1395691907',
    'cache-control': 'private, max-age=60, s-maxage=60',
    'last-modified': 'Mon, 24 Mar 2014 10:15:41 GMT',
    etag: '"586678625d9e692748e3c35a09ca52e2"',
    'x-oauth-scopes': 'gist, repo, user',
    'x-accepted-oauth-scopes': '',
    vary: 'Accept, Authorization, Cookie, X-GitHub-OTP',
    'x-github-media-type': 'github.beta; format=json',
    'x-content-type-options': 'nosniff',
    'content-length': '1318',
    'access-control-allow-credentials': 'true',
    'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
    'access-control-allow-origin': '*',
    'x-github-request-id': '4C6633FF:7E54:17A550:53308AFD',
    'x-served-by': 'd818ddef80f4c7d10683dd483558952a' });
};
