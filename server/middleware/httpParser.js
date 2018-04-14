function _AliceSPA3HttpParserPayload(res){
	this.res = res;
	this.finish = function(errCode,errorBody,description,data){
		var error = res.app.get('error');
		var err = error[errCode];
		if(!err){
			err = error['E-1'];
			err.code = errCode;
			
		}
		if(errorBody){
			err.error = errorBody;
		}
		if(description){
			err.description = description;
		}
		err.data = data;

		res.json(err);
	}
	this.success = function(data){
		this.finish('E0',null,null,data)
	}
	this.suc = this.success;
	this.dbErr = function(dbErr){
		this.finish('DB-' + dbErr.errno, dbErr.code,'Something wrong in database communication');
	}
}

module.exports = function(req,res,next){
	var AP = new _AliceSPA3HttpParserPayload(res);
	res.AP = AP;
	next();
}