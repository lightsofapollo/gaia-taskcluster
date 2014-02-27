package.json:
	npm install

.PHONY:
test: package.json
	./node_modules/.bin/mocha $(shell find . -name "*_test.js")
	./bin/object-factory-viewer examples/single_depth.js '{"xfoo": true}'
