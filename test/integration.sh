#! /bin/bash -vex

./node_modules/.bin/mocha \
  test/integration/*_test.js \
  --harmony \
  --reporter spec

