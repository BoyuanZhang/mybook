var express = require( 'express'),
	config = require( '../config'),
	view = require( './routes/view'),
	app = express();

function start() {
	app.configure( function () {
		app.use( express.static( 'client' ) );
	});
	
	//setup front-end routes
	view(app, express);

	app.listen(config.port);
	console.log( 'MyB running listening on port: ' + config.port);
}

module.exports = start;