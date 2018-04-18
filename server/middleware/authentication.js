const _ = require('lodash');
const Op = require('sequelize').Op;
module.exports = {
	auth:function(req,res,next){
		var authConfig = req.app.get('config');
		var authNameValues = {};
		for(var i in authConfig.authentication.nameFields){
			var currField = authConfig.authentication.nameFields[i];
			authNameValues[currField] = req.get(`${authConfig.httpHeaderPrefix}-authentication-${currField}`);
		}
		authNameValues = _.omitBy(authNameValues,_.isNil)
		if(_.isEmpty(authNameValues)){
			res.AP.err('E6','authentication test');
			return;
		}
		var token = req.get(`${authConfig.httpHeaderPrefix}-authentication-token`);
		if(_.isEmpty(token)){
			res.AP.err('E3');
			return;
		}
		authNameValues = _.omitBy(authNameValues,_.isNil);

		var now = new Date();
		var userModel = req.app.get('model').user;
		userModel.update({
			last_active_time:now
		},
		{
			where:{...authNameValues,token,token_expired_time:{
				[Op.gt]:now
			}
		}
		}).then((data)=>{
			if(data[0] === 0){
				res.AP.err('E3');
				return;
			}
			return userModel.findOne();
		},(err)=>{
			res.AP.modelErr(err);
		}).then(data=>{
			req.user = data;
			next();
		},err=>{

			res.AP.modelErr(err);
		});
	}
}