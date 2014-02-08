var express = require( 'express'),
	config = require( '../config'),
	view = require( './routes/view'),
	data = require( './routes/data'),
	app = express();

function start() {
	app.configure( function () {
		app.use( express.static( 'client' ) );
	});
	
	//setup front-end routes
	view(app);
	//setup routes to database
	data(app, express);

	app.listen(config.port);
	console.log( 'MyB running listening on port: ' + config.port);
}

module.exports = start;