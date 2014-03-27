var Promise = require('promise');
var FAKE_EMAIL_DOMAIN = 'github.taskcluster.net';

/**
Fetch the github email address based on the login of the user.
@param {Object} github api interface.
@param {String} login username for github.
*/
function fetchOwnerFromLogin(github, login) {
  var getUser = Promise.denodeify(github.user.getFrom.bind(github.user));
  return getUser({ user: login }).then(function(user) {
    // if we have an email immediately return it
    if (user.email) return user.email;
    // otherwise construct the ghetto fake email for takscluster
    return user.login + '@' + FAKE_EMAIL_DOMAIN;
  });
}

module.exports = fetchOwnerFromLogin;
