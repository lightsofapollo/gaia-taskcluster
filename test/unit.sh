#! /bin/bash -vex

./node_modules/.bin/mocha \
  graph/*_test.js \
  treeherder/*_test.js \
  *_test.js \
  --reporter spec


