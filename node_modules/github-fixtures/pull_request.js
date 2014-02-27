var Factory = require('object-factory'),
    Repo = require('./repo'),
    User = require('./user'),
    Link = require('./link'),
    PullRequestRef = require('./pull_request_ref');

var Links = new Factory({
  properties: {
    self: Link,
    html: Link,
    comments: Link,
    review_comments: Link,
    statuses: Link
  }
});

module.exports = new Factory({
  properties: {
    url: 'https://api.github.com/repos/octocat/Hello-World/pulls/1',
    html_url: 'https://github.com/octocat/Hello-World/pull/1',
    diff_url: 'https://github.com/octocat/Hello-World/pulls/1.diff',
    patch_url: 'https://github.com/octocat/Hello-World/pulls/1.patch',
    issue_url: 'https://github.com/octocat/Hello-World/issue/1',
    statuses_url: 'https://api.github.com/repos/octocat/Hello-World/statuses/6dcb09b5b57875f334f61aebed695e2e4193db5e',
    number: 1,
    state: 'open',
    title: 'new-feature',
    body: 'Please pull these awesome changes',
    created_at: '2011-01-26T19:01:12Z',
    updated_at: '2011-01-26T19:01:12Z',
    closed_at: '2011-01-26T19:01:12Z',
    merged_at: '2011-01-26T19:01:12Z',
    head: PullRequestRef,
    base: PullRequestRef,
    user: User,
    _links: Links
  }
});
