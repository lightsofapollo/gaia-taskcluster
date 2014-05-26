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
  debug(
    'Fetching graph from repository',
    pullRequest.head.user.login,
    pullRequest.head.repo.name
  );

  var repo = github.getRepo(
    pullRequest.base.user.login, // user
    pullRequest.base.repo.name // repo
  );

  try {
    var ref = yield repo.git.getRef('pull/' + pullRequest.number + '/merge');
    return yield repo.git.getContents(path, ref)
  } catch (e) {
    debug('Error while trying to fetch path', path, 'at ref', ref, e);
    throw e;
  }
}

module.exports = fetch;

