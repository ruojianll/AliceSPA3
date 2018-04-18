module.exports = function(db){
	var models = {};
	models.user = db.import('./user');
	models.user.sync()
	return models;
};