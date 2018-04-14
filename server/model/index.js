module.exports = function(db){
	var models = {};
	models.user = require('./user.js')(db);
	return models;
};