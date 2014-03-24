#! /bin/bash -vex

./node_modules/.bin/mocha \
  resources/*_test.js \
  --reporter spec

