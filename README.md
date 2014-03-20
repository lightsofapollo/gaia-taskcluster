# gaia-taskcluster

## Environment variables added to tasks

A number of environment variables are added to each task to enable
different workflows for both pull requests and other branches.

These do _not_ override values set in the tasks if set.

These are inspired by [travis-ci](http://docs.travis-ci.com/user/ci-environment/#Environment-variables)

  - `CI=true`: always true

  - `GH_BRANCH`: branch this task was triggered for 
     (this is the base/target branch in a pull request not the head)

  - `GH_COMMIT`: commit this task was triggered for
     (this is the most recent commit in the head in a pull request)   

  - `GH_PULL_REQUEST`: `true` when triggered by a pull request

  - `GH_PULL_REQUEST_NUMBER`: the number of the given pull request 
     (not set if this task was not triggered by a pull request)

  - `GH_REPO_SLUG`: username/repo of the target repository

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
    - `GAIA_TASKCLUSTER_QUEUE`: queue name to create and bind to.

    - `TASKCLUSTER_ROUTING_KEY`: routing key to use when posting tasks
      and binding to task queues.

    - `TASKCLUSTER_PROVISIONER_ID`: Default provisioner id if none is
      specified in the task.

    - `TASKCLUSTER_WORKER_TYPE`: Default worker type if none is
      specified in the task.

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
