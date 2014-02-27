suite('factory', function() {
  var Factory = require('./');
  var subject;

  function Model(options) {
    var key;
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }
  }

  suite('hooks', function() {
    setup(function() {
      subject = new Factory({
        onbuild: function(obj) {
          obj.hitBuild = true;
        },

        oncreate: function(obj) {
          obj.hitCreate = true;
        },

        properties: {
          one: true
        }
      });
    });

    test('create', function() {
      var out = subject.create();
      assert(out.hitBuild);
      assert(out.hitCreate);
    });

    test('build', function() {
      var out = subject.build();
      assert(out.hitBuild);
      assert.ok(!out.hitCreate);
    });
  });

  suite('simple property factory', function() {
    setup(function() {
      subject = new Factory({
        properties: {
          get one() {
            return 'cool';
          },
          two: 'foo'
        }
      });
    });

    test('initialization', function() {
      assert.deepEqual(subject.properties, {
        one: 'cool',
        two: 'foo'
      });
    });

    test('create - no overrides', function() {
      var result = subject.create();

      assert.deepEqual(
        result,
        subject.properties
      );
    });

    test('create - overrides', function() {
      var result = subject.create(
        { one: '1', three: '3' }
      );

      assert.deepEqual(
        result, {
          one: '1',
          two: 'foo',
          three: '3'
        }
      );
    });
  });

  suite('with getters', function() {
    var increment;

    setup(function() {
      increment = 0;
      subject = new Factory({
        properties: {
          get increment() {
            return increment++;
          }
        }
      });
    });

    test('increment getter', function() {
      subject.create();
      subject.create();
      subject.create();

      var result = subject.create();

      // This is probably something you would not want to do in real life but
      // it proves that increments are clean.
      assert.equal(result.increment, 0);
      assert.equal(result.increment, 1);
      assert.equal(result.increment, 2);
      assert.equal(result.increment, 3);
    });

  });

  suite('with constructors', function() {
    setup(function() {
      subject = new Factory({
        object: Model,
        properties: {
          value: 'foo'
        }
      });
    });

    test('create - no overrides', function() {
      var result = subject.create();

      assert(result instanceof Model);
      assert.equal(result.value, 'foo');
    });

    test('create - with overrides', function() {
      var result = subject.create(
        { value: 'val', other: true }
      );

      assert(result instanceof Model);
      assert.equal(result.value, 'val');
      assert.equal(result.other, true);
    });

    test('build', function() {
      var result = subject.build({ val: 1 });
      assert(!(result instanceof Model));

      assert.equal(result.val, 1);
      assert.equal(result.value, 'foo');
    });
  });

  suite('with factory props', function() {
    var childFactory;
    var increment = 0;

    setup(function() {
      childFactory = new Factory({
        object: Model,
        properties: {
          get child() {
           return true;
          }
        }
      });

      subject = new Factory({
        properties: {
          parent: 'yes',
          child: childFactory,
          inertChild: childFactory
        }
      });
    });

    test('create', function() {
      var result = subject.create({
        parentVal: 1,
        child: {
          otherVal: 1
        }
      });

      assert(result.child instanceof Model);
      assert(result.inertChild instanceof Model);

      assert.equal(result.parent, 'yes');
      assert.equal(result.parentVal, 1);

      assert.equal(result.inertChild.child, true);
      assert.equal(result.child.child, true);
      assert.equal(result.child.otherVal, 1);
    });

    test('build', function() {
      var result = subject.build({
        child: {
          otherVal: 1
        }
      });

      assert(!(result.child instanceof Model));
      assert(!(result.inertChild instanceof Model));
    });

    test('#extend', function() {
      var sub = subject.extend({
        object: Model,
        properties: {
          foo: 'bar'
        }
      });

      assert.ok(!subject.properties.foo);

      assert.equal(sub.object, Model);

      var result = sub.create({
        other: 'fooz'
      });

      assert(result instanceof Model);

      assert.notEqual(
        sub.properties,
        subject.properties
      );

      assert.equal(result.other, 'fooz');
      assert(result.child instanceof Model);
      assert(result.inertChild instanceof Model);
      assert.equal(result.child.child, true);
    });
  });

  suite('acceptance', function() {
    var result;

    function Event() { Model.apply(this, arguments) }
    function Cal() { Model.apply(this, arguments) }
    function Account() { Model.apply(this, arguments) }

    var EventFactory = new Factory({
      object: Event,
      properties: {
        isEvent: true
      }
    });

    var CalFactory = new Factory({
      object: Cal,
      properties: {
        isCalendar: true,
        event: EventFactory
      }
    });

    var AccountFactory = new Factory({
      object: Account,
      properties: {
        isAccount: true,
        normalCal: CalFactory,
        extendCal: CalFactory.extend({
          properties: {
            isCrazy: true,
            event: EventFactory.extend({
              properties: {
                isCrazy: true
              }
            })
          }
        })
      }
    });

    function hasProps() {
     // account
      assert(result.isAccount);

      // normal cal
      assert(result.normalCal.isCalendar);
      assert.ok(!result.normalCal.isCrazy);

      // crazy cal
      assert(result.extendCal.isCrazy);
      assert(result.extendCal.isCalendar);

      // normal event
      assert(result.normalCal.event.isEvent);
      assert.ok(!result.normalCal.event.isCrazy);

      // crazy calendar
      assert(result.extendCal.event.isEvent);
      assert(result.extendCal.event.isCrazy);
    }

    test('#create - no overrides', function() {
      result = AccountFactory.create();

      assert(result instanceof Account, 'result Account');
      assert(result.normalCal instanceof Cal, 'normalCal');
      assert(result.extendCal instanceof Cal, 'extendCal');
      assert(result.normalCal.event instanceof Event, 'normalCal.event');
      assert(result.extendCal.event instanceof Event, 'extendCal.event');

      hasProps();
    });

    test('#build - no overrides', function() {
      result = AccountFactory.build();
      assert(!(result instanceof Account));
      hasProps();
    });

    test('deep overrides', function() {
      result = AccountFactory.build({
        normalCal: {
          foo: true,
          event: {
            nested: true
          }
        }
      });

      // we did not kill the defaults
      hasProps();

      assert(result.normalCal.foo);
      assert(result.normalCal.event.nested);
    });

  });

});
