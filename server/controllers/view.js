var paths = require( '../paths');

//Handle the request
var viewController = {
	//express provides the request, response arguments
	'login' : function( req, res ) {
		res.send('Login page');
	},
	'calendar' : function(req, res) {
		res.sendFile( paths().client + '/views/calendar.html');
	},
	'notfound' : function( req, res ) {
		res.send('404, Page not found');
	}
};

module.exports = viewController;