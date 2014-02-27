var Factory = require('object-factory'),
    Repo = require('./repo'),
    User = require('./user');


module.exports = new Factory({
  properties: {
    label: 'master',
    sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
    user: User,
    repo: Repo
  }
});

