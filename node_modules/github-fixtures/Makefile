VIEWER=./node_modules/.bin/object-factory-viewer

.PHONY: test
test: node_modules
	./node_modules/.bin/mocha $(shell find . test -depth 1 -type f -name "*_test.js")
	@echo
	@echo "github_fixture/repo"
	$(VIEWER) repo.js
	@echo
	@echo "github_fixture/user"
	$(VIEWER) user.js
	@echo
	@echo "github_fixture/pull_request"
	$(VIEWER) pull_request.js

node_modules: package.json
	npm install
