/**
Creates a graph from a github pull request.

@module github/pr_content
*/
var debug = require('debug')('github-taskcluster:github:pr_content');

function sleep(n, callback) {
  setTimeout(callback, n, null);
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
  var targetSha = pullRequest.head.sha;
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


  /**
  The process of _correctly_ fetching this sha is complicated... Each time you
  push to github a new "merge" ref is created. This "merge" ref may or may not
  be available when you push the first time and may be out of date in subsequent
  pushes. Some retry logic is needed to ensure the commit is in a sane state.

    - ensure the commit exists
    - ensure the commit has the "target sha" (what you just pushed) in it's
      recent history.

  */
  var retry = 0;
  var commit;
  while (retry++ < MAX_RETRIES) {
    var potentialCommit;
    try {
      potentialCommit = yield repo.git.getRef(refString);
    } catch (e) {
      // Only throw if the error is not a 404.
      if (!e.status || e.status != 404) throw e;
    }
    // if the potentialCommit is not available yet sleep for a bit...
    if (!potentialCommit) {
      debug('Could not fetch ref', refString, 'sleeping for ' + SLEEP);
      yield sleep.bind(null, SLEEP);
      continue
    }

    // Ensure our commit is in recent history...
    var commitList = yield repo.git.getCommits({ sha: potentialCommit });
    for (var i = 0; i < commitList.length; i++) {
      // If our target sha is in the recent history then we found our winner for
      // the merge commit!
      if (commitList[i].sha === targetSha) {
        commit = potentialCommit;
        break;
      }
    }

    // If we found the correct commit we are done...
    if (commit) break;

    // We did not find out match so sleep again...
    debug('Sha found for fetch ref', refString, 'but commits are out of date');
    yield sleep.bind(null, SLEEP);
  }

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

