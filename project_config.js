/**
@fileoverview

This module deals with loading the project configuration (from disk or s3)
*/
var URL = require('url');
var Promise = require('promise');
var debug = require('debug')('gaia-treeherder:project_config');

/**
An absolute path on disk OR a URL.


@example

// s3
load('s3://bucket/path');

// disk
load('/projects.json');

*/
function load(path) {
  return new Promise(function(accept, reject) {
    if (path[0] === '/') {
      return accept(loadDisk(path));
    }

    if (path.slice(0, 5) !== 's3://') {
      return reject(new Error('invalid config file must be from s3 or on disk'));
    }

    return loadS3(path.slice(5)).then(accept, reject);
  });
}

function loadDisk(path) {
  debug('disk', path);
  return require(path);
}

function loadS3(path) {
  // format idea taken from the aws-cli tools...
  var split = path.split('/');
  var bucket = split.shift();
  var bucketPath = split.join('/');

  var aws = require('aws-sdk-promise');
  var s3 = new aws.S3({
    region: 'us-west-2'
  });

  debug('s3', bucket, bucketPath);
  return s3.getObject(
    { Bucket: bucket, Key: bucketPath }
  ).promise().then(function(res) {
    return JSON.parse(res.data.Body);
  });
}

module.exports = load;
