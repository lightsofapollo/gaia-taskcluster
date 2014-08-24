var koa = require('koa');
var request = require('superagent-promise');
var createRuntime = require('../lib/runtime');

module.exports = function* createApp(profile) {
  var app = koa();
  app.use(require('koa-logger')());
  app.use(require('koa-body-parser')());
  app.use(require('koa-trie-router')(app));

  app.runtime = yield createRuntime(profile);

  // github event routing logic
  var githubEvents = {
    pull_request: require('../routes/github_pr')(app.runtime),
    push: require('../routes/github_push')(app.runtime)
  };

  app.post('/github', function* () {
    // TODO: Implement ip address verification AND/OR signed bodies

    var eventName = this.get('X-GitHub-Event');

    if (!eventName) {
      this.throw(400, 'Hook must contain event type');
      return;
    }

    if (!githubEvents[eventName]) {
      this.throw(400, 'Cannot handle "' + eventName + '" events');
      return;
    }

    yield githubEvents[eventName];
  });

  return app;
}
