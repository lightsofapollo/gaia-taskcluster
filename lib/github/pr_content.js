/**
Creates a graph from a github pull request.

@module github/pr_content
*/
var debug = require('debug')('github-taskcluster:github:pr_content');

function sleep(n, callback) {
  setTimeout(n, callback, null);
}

// Amount of time to wait between attempts...
var SLEEP = 500;
// Max attempts...
var MAX_RETRIES = 20;

/**
Fetch the graph (but do not decorate it) from the pull request.

@return {Promise<Object>} raw graph as defined in the repository.
*/
function* fetch(github, pullRequest, path) {
  var refString = 'pull/' + pullRequest.number + '/merge';

  debug(
    'Fetching graph from repository',
    pullRequest.head.user.login,
    pullRequest.head.repo.name,
    refString
  );

  var repo = github.getRepo(
    pullRequest.base.user.login, // user
    pullRequest.base.repo.name // repo
  );


  var retry = 0;
  var ref;
  while (!ref && retry++ < MAX_RETRIES) {
    console.log('start ref');
    ref = yield repo.git.getRef(refString);
    // if the ref is not available yet sleep for a bit...
    if (!ref) {
      debug('Could not fetch ref', refString, 'sleeping for ' + sleep);
      yield sleep.bind(null, SLEEP);
    }
    console.log('end ref');
  }

  console.log(ref);
  var commit = yield repo.git.getCommit(ref);
  console.log(JSON.stringify(commit, null, 4));

  if (!ref) {
    throw new Error("Timed out while attempting to fetch ref", refString);
  }

  try {
    return yield repo.git.getContents(path, ref);
  } catch (e) {
    debug('Error while trying to fetch path', path, 'at ref', ref, e);
    throw e;
  }
}

module.exports = fetch;

