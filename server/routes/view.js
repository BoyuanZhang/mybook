//We route the server request to the proper controller

var viewController = require('../controllers/view');

//valid route requests
var view = function (app) {
	app.get( '/', viewController.login );
	app.get( '/home', viewController.homepage );
	app.get( '/calendar', viewController.calendar);
	app.get( '/tasks', viewController.taskedit );
	app.get( '/*', viewController.notfound);
};

module.exports = view;