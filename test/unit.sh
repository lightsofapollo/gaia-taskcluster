#! /bin/bash -vex

./node_modules/.bin/mocha \
  --harmony \
  --reporter spec \
  treeherder/*_test.js \
  stores/*_test.js


