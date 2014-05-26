#! /bin/bash -vex

./node_modules/.bin/mocha \
  routes/*_test.js \
  --harmony \
  --reporter spec

