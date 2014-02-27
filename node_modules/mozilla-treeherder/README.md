# mozilla-treeherder [![Build Status](https://travis-ci.org/lightsofapollo/treeherder-node.png?branch=master)](https://travis-ci.org/lightsofapollo/treeherder-node)

NodeJS interface for treeherder.

## Usage

```js
var Project = require('mozilla-treeherder/project');

// this configuration can be aquired from an ateam member working on
// treeherder (jeads).
var project = new Project('gaia', {
  consumerKey: '...',
  consumerSecret: ''
});
```

## CLI

See all the options with:

```sh
./bin/treeherder --help
```

## Tests

(you must run npm install first)

```sh
// run all the tests
npm test

// run one test
./node_modules/.bin/mocha path_to_test.js
```

Tests use nock so we can test some of our logic on CI without hitting
real servers but they are also designed to work with nock disabled... To
test against real servers do this:

```sh
// XXX: Testing this way is potentially buggy use at your own risk...
NOCK_OFF=true ./node_modules/.bin/mocha path_to_test
```

## Notes

  - `TREEHERDER_URL` environment variable can be used to configure the
     base url for treeherder.

