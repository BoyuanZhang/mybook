//Route Post/Get requests through here
var dataController = require('../controllers/data');

//valid route requests
var data = function (app, express) {
	app.post( '/save', express.json(), dataController.save )
};

module.exports = data;