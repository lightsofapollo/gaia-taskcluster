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
    name: 'gaia',

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

## Configuring Github

To link a project to treeherder from github some hooks are required:

  - A `Pull Request` hook to the /github/pull_request url

TODO: Add auto configuration script from repo (or via a UI)

## Env configuration

    - `GITHUB_OAUTH_TOKEN` : github oauth token to use when making
      github api calls (currently optional)

    - `TREEHEDER_PROJECT_CONFIG_URI` : where the treeherder project
      configuration file lives... This can be a local path (defaults to
      ./project.json) or a path on s3 (s3://bucket/key/in/bucket.json)

    - `AWS_SECRET_ACCESS_KEY` : Only needed if
       TREEHEDER_PROJECT_CONFIG_URI is set to a s3 url

    - `AWS_ACCESS_KEY_ID` : Only needed if TREEHEDER_PROJECT_CONFIG_URI
       is set to an s3 url.

## Deployment

Every commit in master will be pushed to heroku if master is in a green
state (continuous deployment via travis-ci). Current staging url is: http://gaia-taskcluster.herokuapp.com/
