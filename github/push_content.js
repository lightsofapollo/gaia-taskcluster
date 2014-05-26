/**
Creates a graph from a github pull request.

@module github/push_content
*/
var debug = require('debug')('github-taskcluster:github:pull_content');

/**
Fetch the graph (but do not decorate it) from the pull request.

@return {Promise<Object>} raw graph as defined in the repository.
*/
function* fetch(github, pushEvent, path) {
  debug(
    'Fetching graph from repository',
    pushEvent.repository.owner.name,
    pushEvent.repository.name
  );

  var repo = github.getRepo(
    pushEvent.repository.owner.name,
    pushEvent.repository.name
  );

  try {
    var ref = yield repo.git.getRef(pushEvent.ref.split('refs/').pop());
    return yield repo.git.getContents(path, ref);
  } catch (e) {
    debug('Error while trying to fetch path', path, 'at ref', ref, e);
    throw e;
  }
}

module.exports = fetch;
