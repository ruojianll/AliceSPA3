module.exports = {
	auth:function(req,res,next){
		var authConfig = req.app.get('config');
		var db = req.app.get('db');
		var authNameValues = {};
		for(var i in authConfig.authentication.nameFields){
			var currField = authConfig.authentication.nameFields[i];
			authNameValues[currField] = req.get(`${authConfig.httpHeaderPrefix}-authentication-${currField}`);
		}
		var authPassword = req.get(`${authConfig.httpHeaderPrefix}-authentication-password`);
		next();
	}
}