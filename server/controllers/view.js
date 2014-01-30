var paths = require( '../paths');

//Handle the request
var viewController = {
	//express provides the request, response arguments
	'login' : function( req, res ) {
		res.send('Login page');
	},
	'homepage' : function(req, res) {
		res.send('Home Page');
	},
	'calendar' : function(req, res) {
		res.render( paths().client + '/views/calendar.html');
	},
	'taskedit' : function( req, res) {
		res.send('Task edit page');
	},
	'notfound' : function( req, res ) {
		res.send('404, Page not found');
	}
};

module.exports = viewController;