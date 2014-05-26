var Promise = require('promise');
var FAKE_EMAIL_DOMAIN = 'github.taskcluster.net';

/**
Fetch the github email address based on the login of the user.
@param {Object} github api interface.
@param {String} login username for github.
*/
function* fetchOwnerFromLogin(github, login) {
  // This must be an email it's easier to use a "fake" email
  var user = yield github.getUser(login).getInfo();
  return user.login + '@' + FAKE_EMAIL_DOMAIN;
}

module.exports = fetchOwnerFromLogin;
