//Route Post/Get requests through here
var dataController = require('../controllers/data');

//valid route requests
var data = function (app, express) {
	app.get( '/ret', dataController.getTasks );
	app.post( '/addTask', express.json(), dataController.addTask );
	app.post( '/saveTask', express.json(), dataController.saveTask );
	app.post( '/updateTaskIndexes', express.json(), dataController.updateTaskIndexes );
	app.post( '/delete', express.json(), dataController.removeTask);
};

module.exports = data;