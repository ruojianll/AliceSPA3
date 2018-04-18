var _ = require('lodash');
var moment = require('moment');
var router = require('express').Router();
var cons = require('../../../middleware/apiParser').constrict;

var auth = require('../../../middleware/authentication');

module.exports = (app)=>{
var config = app.get('config');
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
		password:req.body.password,
		creator_id:'web register',
		updater_id:'web register'
	},_.isNil)
	var userModel = req.app.get('model').user;
	userModel.create(fields).then((data)=>{
		res.AP.suc({id:data.id});
	},(err)=>{
		res.AP.modelErr(err);
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
	userModel.update({
		token:token,
		token_generate_time:tokenGenerateTime.toDate(),
		token_expired_time:tokenExpiredTime.toDate(),
		updator_id:"web login"
	},{where:fields}).then((data)=>{
		if(data[0] === 1){
			res.AP.suc({token:token});
		}
		else{
			res.AP.err('E404','user not found');
		}
	},(err)=>{
		res.AP.modelErr(err);
	})
});

router.post('/test',auth.auth,(a,b)=>{b.AP.suc(a.user)})
return router;
};