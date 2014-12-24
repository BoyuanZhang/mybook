//Route Post/Get requests through here
var dataController = require('../controllers/data'),
	bodyparser = require('body-parser');

//valid route requests
var data = function (app) {
	app.get( '/ret', dataController.getTasks );
	app.post( '/addTask', bodyparser.json(), dataController.addTask );
	app.post( '/saveTask', bodyparser.json(), dataController.saveTask );
	app.post( '/updateTaskIndexes', bodyparser.json(), dataController.updateTaskIndexes );
	app.post( '/delete', bodyparser.json(), dataController.removeTask);
};

module.exports = data;