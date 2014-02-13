var datamodel = require( '../model/data.js'),
	url = require( 'url');

//Handle requests to database
var dataController = {
	//express provides the request, response arguments
	'save' : function( req, res ) {
		//send request body to the model tier for saving
		datamodel.save(req.body);
		res.end();
	},
	'getTasks' : function( req, res ) {
		var taskList = datamodel.getTasks( url.parse(req.url, true).query.date, function ( taskList) {
			res.json( taskList);
		});
	}
};

module.exports = dataController;