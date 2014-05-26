var superagent = require('superagent-promise');

function getTask(taskId) {
  var url = 'http://tasks.taskcluster.net/' + taskId + '/task.json';
  return superagent.get(url).
    end().
    then(function(res) {
      if (res.error) throw res.error;
      return res.body;
    });
};

module.exports = getTask;
