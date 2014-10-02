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
  var commit;
  while (!commit && retry++ < MAX_RETRIES) {
    commit = yield repo.git.getRef(refString);
    // if the ref is not available yet sleep for a bit...
    if (!commit) {
      debug('Could not fetch ref', refString, 'sleeping for ' + sleep);
      yield sleep.bind(null, SLEEP);
    }
  }

  var commitList = (yield repo.git.getCommits({ sha: commit })).map(function(c) {
    return { sha: c.sha, message: c.commit.message };
  });
  console.log('Handling merge: ', commitList);

  if (!commit) {
    throw new Error("Timed out while attempting to fetch ref", refString);
  }

  try {
    return yield repo.git.getContents(path, commit);
  } catch (e) {
    debug('Error while trying to fetch path', path, 'at ref', commit, e);
    throw e;
  }
}

module.exports = fetch;

