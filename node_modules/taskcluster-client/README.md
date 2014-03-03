# taskcluster-client

Various utilities for interacting with various taskcluster components
(mostly the queue and amqp). The intent is for the "client" to be a set
of small modules which can be used selectively.

## Developing

Right now both a simple Makefile AND a Gruntfile are used (based on
whatever I felt had the best tooling)... The source of truth for
commands is the package.json... See the scripts section for how to run
project wide tooling.


### Run all the tests

```sh
npm test
```

### Generate the docs

```sh
npm run-script doc
```
