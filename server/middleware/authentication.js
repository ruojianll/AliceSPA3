const _ = require('lodash');
module.exports = {
	auth:function(req,res,next){
		var authConfig = req.app.get('config');
		var authNameValues = {};
		for(var i in authConfig.authentication.nameFields){
			var currField = authConfig.authentication.nameFields[i];
			authNameValues[currField] = req.get(`${authConfig.httpHeaderPrefix}-authentication-${currField}`);
		}
		var token = req.get(`${authConfig.httpHeaderPrefix}-authentication-token`);
		if(_.isEmpty(token)){
			res.AP.api('E3');
			return;
		}
		authNameValues = _.omitBy(authNameValues,_.isNil);

		req.get('models').user.checkToken(authNameValues,token).then((r)=>{
			if(r){
				next();
			}
			else{
				res.AP.api('E3');
			}
		})
	}
}