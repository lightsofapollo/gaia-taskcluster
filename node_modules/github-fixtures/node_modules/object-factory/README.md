## Factory

Create and distribute test fixtures/factories.

## Usage

All examples assume you have required object-factory like this:

```js
var Factory = require('object-factory');
```

```js
var Event = new Factory({
  properties: {
    // define defaults
    title: 'Amazing Event',
    location: 'Bahamas'
  }
});

var event = Event.build({ title: 'xxx' });
```
