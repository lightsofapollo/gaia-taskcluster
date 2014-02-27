# gaia-taskcluster

## Project configuration

Treeherder has a per-project authentication strategy... In order to keep
track of which repos we can accept requests for and what credentials to
use to update treeherder of the status we have a configuration file
which lives on S3 which keeps track of this.

Here is what the configuration file looks like:

```js
[
  {
    // treeherder project name
    project: 'gaia',

    // treeherder authentication (you must get this from the treeherder
    // team).
    consumerKey: '...',
    consumerSecret: '...'

    // github repository name
    repo: 'gaia',

    // github owner 
    user: 'mozilla-b2g'
  }
]
```
