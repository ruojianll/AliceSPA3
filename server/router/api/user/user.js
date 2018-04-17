var _ = require('lodash');
var moment = require('moment');
var router = require('express').Router();
var cons = require('../../../middleware/apiParser').constrict;


module.exports = (config)=>{
/**
@name User register
@memberof ApiRout
@path {POST} /api/user/register
@body {JSON} [Username fields : String] One or more server accepted username fields
@body {JSON} [Password : String] Hash by SHA512
@response {JSON} [id : String] Id of created user
*/
router.post('/register',cons([
	{or:config.authentication.nameFields},
	'password'
],false),function(req,res){
	fields = _.omitBy({
		username:req.body.username,
		email:req.body.email,
		telephone:req.body.telephone,
		password:req.body.password
	},_.isNil)
	var userModel = req.app.get('model').user;
	userModel.create(fields,'api register',(err,results,fields,extra)=>{
		if(err){
			res.AP.dbErr(err);
			return;
		}
		res.AP.suc(extra);
	});
});
/**
@name User login
@memberof ApiRout
@path {POST} /api/user/login
@body {JSON} [Username fields : String] One or more server accepted username fields
@body {JSON} [Password : String] Hash by SHA512
@response {JSON} [token : String] User token
*/
router.post('/login',cons([
	{or:config.authentication.nameFields},
	'password'
],false),function(req,res){
	fields = _.omitBy({
		username:req.body.username,
		email:req.body.email,
		telephone:req.body.telephone,
		password:req.body.password
	},_.isNil);
	var userModel = req.app.get('model').user;
	var token = req.app.get('utils').generateToken('');
	var tokenGenerateTime = moment();
	var tokenExpiredTime = tokenGenerateTime.clone().add(req.app.get('config').authentication.userTokenValidTime,'s');
	userModel.update(null,fields,{
		token:token,
		token_generate_time:tokenGenerateTime.toDate(),
		token_expired_time:tokenExpiredTime.toDate()
	},'WEB REGISTER',(err,results)=>{
		if(err){
			res.AP.dbErr(err);
			return;
		}
		if(results.affectedRows === 0){
			res.AP.finish('E404','user not found');
			return;
		}
		res.AP.suc({token:token});
	})	
});


return router;
};