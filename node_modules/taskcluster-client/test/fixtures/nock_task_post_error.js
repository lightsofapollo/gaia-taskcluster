var nock = require('nock');

nock('http://queue.taskcluster.net:80')
  .post('/v1/task/new')
  .reply(400, "{\n  \"message\": \"Request payload must follow the schema: http://schemas.taskcluster.net/v1/task.json#\",\n  \"error\": [\n    {\n      \"instanceContext\": \"#\",\n      \"resolutionScope\": \"http://schemas.taskcluster.net/v1/task.json#\",\n      \"constraintName\": \"required\",\n      \"constraintValue\": [\n        \"version\",\n        \"provisionerId\",\n        \"workerType\",\n        \"routing\",\n        \"retries\",\n        \"priority\",\n        \"created\",\n        \"deadline\",\n        \"payload\",\n        \"metadata\",\n        \"tags\"\n      ],\n      \"desc\": \"missing: workerType,routing\",\n      \"kind\": \"ObjectValidationError\"\n    },\n    {\n      \"instanceContext\": \"#/provisionerId\",\n      \"resolutionScope\": \"http://schemas.taskcluster.net/v1/task.json#/properties/provisionerId\",\n      \"constraintName\": \"maxLength\",\n      \"constraintValue\": 36,\n      \"testedValue\": 38,\n      \"kind\": \"StringValidationError\"\n    },\n    {\n      \"instanceContext\": \"#/metadata/owner\",\n      \"resolutionScope\": \"http://schemas.taskcluster.net/v1/task.json#/properties/metadata/properties/owner\",\n      \"constraintName\": \"format\",\n      \"constraintValue\": \"email\",\n      \"desc\": \"not a valid email address\",\n      \"kind\": \"FormatValidationError\"\n    }\n  ]\n}", { 'access-control-allow-headers': 'X-Requested-With,Content-Type',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  date: 'Sun, 02 Mar 2014 22:55:20 GMT',
  'x-powered-by': 'Express',
  'content-length': '1209',
  connection: 'Close' });
