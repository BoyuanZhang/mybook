var datamodel = require( '../model/data.js');

//Handle requests to database
var dataController = {
	//express provides the request, response arguments
	'save' : function( req, res ) {
		//send request body to the model tier for saving
		datamodel.save(req.body);
		res.end();
	}
};

module.exports = dataController;