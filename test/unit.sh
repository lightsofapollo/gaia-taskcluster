#! /bin/bash -vex

./node_modules/.bin/mocha \
  graph/*_test.js \
  treeherder/*_test.js \
  stores/*_test.js \
  *_test.js \
  --harmony \
  --reporter spec


