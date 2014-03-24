var nock = require('nock');

module.exports = function() {
  nock('https://api.github.com:443')
    .get('/users/lightsofapollo-staging')
    .reply(200, "{\"login\":\"lightsofapollo-staging\",\"id\":5711702,\"avatar_url\":\"https://avatars.githubusercontent.com/u/5711702?\",\"gravatar_id\":\"03df4b23cc992e1cb2877c574e0bc4c6\",\"url\":\"https://api.github.com/users/lightsofapollo-staging\",\"html_url\":\"https://github.com/lightsofapollo-staging\",\"followers_url\":\"https://api.github.com/users/lightsofapollo-staging/followers\",\"following_url\":\"https://api.github.com/users/lightsofapollo-staging/following{/other_user}\",\"gists_url\":\"https://api.github.com/users/lightsofapollo-staging/gists{/gist_id}\",\"starred_url\":\"https://api.github.com/users/lightsofapollo-staging/starred{/owner}{/repo}\",\"subscriptions_url\":\"https://api.github.com/users/lightsofapollo-staging/subscriptions\",\"organizations_url\":\"https://api.github.com/users/lightsofapollo-staging/orgs\",\"repos_url\":\"https://api.github.com/users/lightsofapollo-staging/repos\",\"events_url\":\"https://api.github.com/users/lightsofapollo-staging/events{/privacy}\",\"received_events_url\":\"https://api.github.com/users/lightsofapollo-staging/received_events\",\"type\":\"User\",\"site_admin\":false,\"name\":\"\",\"company\":\"\",\"blog\":\"\",\"location\":\"\",\"email\":\"\",\"hireable\":false,\"bio\":null,\"public_repos\":3,\"public_gists\":0,\"followers\":0,\"following\":0,\"created_at\":\"2013-10-17T17:20:35Z\",\"updated_at\":\"2014-03-24T19:36:34Z\",\"private_gists\":0,\"total_private_repos\":0,\"owned_private_repos\":0,\"disk_usage\":0,\"collaborators\":0,\"plan\":{\"name\":\"free\",\"space\":307200,\"collaborators\":0,\"private_repos\":0}}", { server: 'GitHub.com',
    date: 'Mon, 24 Mar 2014 19:38:16 GMT',
    'content-type': 'application/json; charset=utf-8',
    status: '200 OK',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4858',
    'x-ratelimit-reset': '1395691907',
    'cache-control': 'private, max-age=60, s-maxage=60',
    'last-modified': 'Mon, 24 Mar 2014 19:36:34 GMT',
    etag: '"031f6feecee4817e6c2d9a37ebabfc1c"',
    'x-oauth-scopes': 'gist, repo, user',
    'x-accepted-oauth-scopes': '',
    vary: 'Accept, Authorization, Cookie, X-GitHub-OTP',
    'x-github-media-type': 'github.beta; format=json',
    'x-content-type-options': 'nosniff',
    'content-length': '1462',
    'access-control-allow-credentials': 'true',
    'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
    'access-control-allow-origin': '*',
    'x-github-request-id': '4C6633FF:7E4F:11FC00:533089A8',
    'x-served-by': '3061975e1f37121b3751604ad153c687' });
};
