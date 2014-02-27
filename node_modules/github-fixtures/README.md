# Github Fixtures

Github fixtures for shepherd tests.

# Fixtures

All fixtures are based on the [github api docs](http://developer.github.com/v3/)

  - PullRequest
  - PullRequestRef
  - Repo
  - User
  - Link

```js
var Repo = require('github-fixtures/repo');
    User = require('github-fixtures/user');
    PullRequest = require('github-fixtures/pull_request');


Repo.create({
  // deep merge happens in all the object operations
  owner: { login: 'woot!' },
})
```

See [object
factory](https://github.com/lightsofapollo/object-factory)
for usage of factories.

# Viewing contents of fixture

1. Clone the repo
2. npm install
3. ./node_modules/.bin/object-factory-viewer repo.js
   (replace repo.js with whatever you want to see)
