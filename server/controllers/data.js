var datamodel = require( '../model/data.js'),
	url = require( 'url');

//Handle requests to database
var dataController = {
	//express provides the request, response arguments
	'addTask' : function( req, res ) {
		//send request body to the model tier for saving
		datamodel.addTask(req.body, function(taskidObj) {
			if( taskidObj )
				res.json(taskidObj);
			else 
				res.end();
		});
	},
	'saveTask' : function( req, res ) {
		datamodel.saveTask( req.body );
		res.end();
	},
	'updateTaskIndexes' : function( req, res ) {
		datamodel.updateTaskIndexes( req.body );
		res.end();
	},
	'getTasks' : function( req, res ) {
		//validate the date query in the URL here.
		//Make sure it is not empty, and that it is a valid date string
		datamodel.getTasks( url.parse(req.url, true).query.date, function ( taskList) {
			if( taskList ) 
				res.json( taskList);
			else
				res.end();
		});
	},
	'removeTask' : function( req, res ) {
		datamodel.removeTask( req.body );
		res.end();
	}
};

module.exports = dataController;