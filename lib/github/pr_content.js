/**
Creates a graph from a github pull request.

@module github/pr_content
*/
var debug = require('debug')('github-taskcluster:github:pr_content');

/**
Fetch the graph (but do not decorate it) from the pull request.

@return {Promise<Object>} raw graph as defined in the repository.
*/
function* fetch(github, pullRequest, path) {
  // XXX: This does not account for merges and always uses whatever the target
  // repository has in the future we should ideally be using merges...
  var repo = github.getRepo(
    pullRequest.head.user.login, // user
    pullRequest.head.repo.name // repo
  );

  try {
    return yield repo.git.getContents(path, pullRequest.head.sha)
  } catch (e) {
    debug('Error while trying to fetch path', path, 'at ref', ref, e);
    throw e;
  }
}

module.exports = fetch;

