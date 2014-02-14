//Route Post/Get requests through here
var dataController = require('../controllers/data');

//valid route requests
var data = function (app, express) {
	app.get( '/ret', dataController.getTasks );
	app.post( '/save', express.json(), dataController.save );
	app.post( '/delete', express.json(), dataController.removeTask);
};

module.exports = data;