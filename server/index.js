var express = require( 'express'),
	config = require( '../config'),
	view = require( './routes/view'),
	data = require( './routes/data'),
	app = express();

function start() {
	app.use( express.static( 'client' ) );
	
	//setup routes to database
	data(app);
	//setup front-end routes
	view(app);

	app.listen(config.port);
	console.log( 'MyB running listening on port: ' + config.port);
}

module.exports = start;