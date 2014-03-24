.PHONY: test
test:
	./node_modules/.bin/mocha \
		$(wildcard treeherder/*_test.js) \
		$(wildcard graph/*_test.js) \
		$(wildcard *_test.js) \
		--reporter spec

.PHONY: test-full
test-full: test
	./node_modules/.bin/mocha \
		$(wildcard resources/*_test.js)
