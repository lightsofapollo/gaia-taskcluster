#! /bin/bash -vex

./node_modules/.bin/mocha \
  routes/*_test.js \
  --reporter spec

