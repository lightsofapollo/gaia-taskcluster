var nock = require('nock');

module.exports = function() {
  nock('https://api.github.com:443')
    .get('/users/lightsofapollo')
    .reply(200, "{\"login\":\"lightsofapollo\",\"id\":322957,\"avatar_url\":\"https://avatars.githubusercontent.com/u/322957?\",\"gravatar_id\":\"52c6593cac3e4b93da1714af0760146b\",\"url\":\"https://api.github.com/users/lightsofapollo\",\"html_url\":\"https://github.com/lightsofapollo\",\"followers_url\":\"https://api.github.com/users/lightsofapollo/followers\",\"following_url\":\"https://api.github.com/users/lightsofapollo/following{/other_user}\",\"gists_url\":\"https://api.github.com/users/lightsofapollo/gists{/gist_id}\",\"starred_url\":\"https://api.github.com/users/lightsofapollo/starred{/owner}{/repo}\",\"subscriptions_url\":\"https://api.github.com/users/lightsofapollo/subscriptions\",\"organizations_url\":\"https://api.github.com/users/lightsofapollo/orgs\",\"repos_url\":\"https://api.github.com/users/lightsofapollo/repos\",\"events_url\":\"https://api.github.com/users/lightsofapollo/events{/privacy}\",\"received_events_url\":\"https://api.github.com/users/lightsofapollo/received_events\",\"type\":\"User\",\"site_admin\":false,\"name\":\"James Lal\",\"company\":\"Mozilla\",\"blog\":\"http://lightsofapollo.github.io/\",\"location\":\"Santa Clara, CA\",\"email\":\"jlal@mozilla.com\",\"hireable\":false,\"bio\":\"\",\"public_repos\":156,\"public_gists\":87,\"followers\":27,\"following\":30,\"created_at\":\"2010-07-05T06:28:45Z\",\"updated_at\":\"2014-03-24T11:05:28Z\"}", { server: 'GitHub.com',
    date: 'Mon, 24 Mar 2014 19:38:16 GMT',
    'content-type': 'application/json; charset=utf-8',
    status: '200 OK',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4859',
    'x-ratelimit-reset': '1395691907',
    'cache-control': 'private, max-age=60, s-maxage=60',
    'last-modified': 'Mon, 24 Mar 2014 11:05:28 GMT',
    etag: '"e4eba4f19034b2456d49e3c8ec825acf"',
    'x-oauth-scopes': 'gist, repo, user',
    'x-accepted-oauth-scopes': '',
    vary: 'Accept, Authorization, Cookie, X-GitHub-OTP',
    'x-github-media-type': 'github.beta; format=json',
    'x-content-type-options': 'nosniff',
    'content-length': '1273',
    'access-control-allow-credentials': 'true',
    'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
    'access-control-allow-origin': '*',
    'x-github-request-id': '4C6633FF:7E51:24D4B2:533089A7',
    'x-served-by': 'd818ddef80f4c7d10683dd483558952a' });
};
