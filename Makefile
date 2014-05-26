.PHONY: test
test:
	./node_modules/.bin/mocha --harmony \
		$(wildcard treeherder/*_test.js) \
		$(wildcard graph/*_test.js) \
		$(wildcard *_test.js) \
		--reporter spec

.PHONY: test-full
test-full: test
	./node_modules/.bin/mocha --harmony \
		$(wildcard routes/*_test.js)
