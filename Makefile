all:

publish:
	npm publish --access public

install:
	npm install
	git submodule update --init --recursive
	cd PeerJS-Network && npm install