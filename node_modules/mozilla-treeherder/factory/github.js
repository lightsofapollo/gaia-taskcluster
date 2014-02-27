/**
@fileoverview

Github factory which will convert github results into treeherder compatible 
types.

@module mozilla-treeherder/factory/github
*/

/**
@private
*/
function commitToRev(repository, record) {
  var author = record.commit.author;
  return {
    comment: record.commit.message,
    revision: record.sha,
    repository: repository,
    author: author.name + ' <' + author.email + '>'
  };
}

/**
@example

var factory = require('mozilla-treeherder/factory/github');
var commitsFromGithub = [
  // http://developer.github.com/v3/pulls/#list-commits-on-a-pull-request
]

factory.commits('gaia', commitsFromGithub);

@see http://developer.github.com/v3/pulls/#list-commits-on-a-pull-request
@param {String} repository name of the project.
@param {Array<Object>} list of github commits.
@return {Array} 'revsions' portion of a resultset collection.
*/
function commits(repository, list) {
  return list.map(commitToRev.bind(this, repository));
}

module.exports.commits = commits;

/**
@param {Object} githubPr pull request object.
@see https://developer.github.com/v3/pulls/#get-a-single-pull-request
@return {Object} partial resultset from single pull request object.
*/
function pull(repository, githubPr) {
  // created in seconds
  var timestamp = new Date(githubPr.created_at);
  timestamp = timestamp.valueOf() / 1000;

  return {
    revision_hash: githubPr.html_url,
    push_timestamp: timestamp,
    // XXX: not sure what the purpose of this or what other values we
    //      can expect...
    type: 'push'
  };
}

module.exports.pull = pull;
