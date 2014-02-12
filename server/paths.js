var path = require( 'path' ),
	root = path.resolve( __dirname + '/../');

function paths() {
	return {
		'root' : root,
		'client' : path.join(root + '/client')
	};
};

module.exports = paths;