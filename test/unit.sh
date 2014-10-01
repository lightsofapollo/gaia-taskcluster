#! /bin/bash -vex

./node_modules/.bin/mocha \
  --harmony \
  --reporter spec \
  lib/stores/*_test.js


