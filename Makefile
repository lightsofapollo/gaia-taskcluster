.PHONY: test
test:
	./node_modules/.bin/mocha \
		$(wildcard *_test.js) \
		$(wildcard resources/*_test.js) \
		--reporter spec
