var _ = require('lodash');
var router = require('express').Router();

/**
@name User register
@memberof ApiRouter
@path {POST} /api/user/register
@body {JSON} [Username fields : String] One or more server accepted username fields
@body {JSON} [Password : String] Hash by SHA512
@response {JSON} [id : String] Id of created user
*/
router.post('/register',function(req,res){
	var body = req.body;
	var config = req.app.get('config');
	var nameFields = config.authentication.nameFields;

	var names = {}
	_.forEach(nameFields,(name)=>{
		if(!_.isEmpty(_.trim(body[name]))){
			names[name] = body[name];
		}
	});
	
	if(_.isEmpty(names)){
		res.AP.api('E4','username');
		return;
	}
	var password = body.password;
	if(_.isEmpty(password)){
		res.AP.api('E4','password');
		return;
	}

	names.password = password;
	var userModel = req.app.get('model').user;
	userModel.create(names,'api register',(err,results,fields,extra)=>{
		if(err){
			res.AP.dbErr(err);
			return;
		}
		res.AP.suc(extra);
	})
})

module.exports = router;