var paths = require( '../paths');

//Handle requests to database
var dataController = {
	//express provides the request, response arguments
	'save' : function( req, res ) {
		console.log( req.body );
		res.end();
	}
};

module.exports = dataController;