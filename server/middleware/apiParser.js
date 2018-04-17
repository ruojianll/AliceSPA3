const _ = require('lodash');
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
function consCheckValueType(value){
	if(!((_.isString(value) && _.trim(value).length > 0) || _.isNumber(value) || _.isBoolean(value))){
		return false;
	}
	return true;
}
function consCheckValue(data,con,isEval,onError,customerCheck,message){
	var value = isEval?_.get(data,con):data[con];
	var res = consCheckValueType(value);
	if(res === true){
		if(_.isFunction(customerCheck)){
			res =  customerCheck(value);
			if(res === true){
				return true;
			}
			else{
				onError(`Customer Check Failed. Message: ${message || 'NO MESSAGE'}`);
				return false;
			}
		}
		return true;
	}
	else{
		onError(`System Type Check Failed. Message: ${message || 'NO MESSAGE'}`);
		return false;
	}
}
function consParse(data,cons,ope,isEval,onError){
	var _ope = undefined,_con = undefined;
	if(_.isString(cons)){
		return consCheckValue(data,cons,isEval,onError)	
	}
	if(_.isArray(cons)){
		_ope = _.toUpper(ope || 'AND');
		if(_ope === 'AND'){
			return _.every(cons,(i)=>consParse(data,i,ope,isEval,onError));
		}
		else if(_ope === 'OR'){
			return _.some(cons,(i)=>consParse(data,i,ope,isEval,onError));
		}
	}
	if(_.isObject(cons)){
		if(_.has(cons,'name')){
			var key = cons.name;
			var customerCheck = cons.customerCheck;
			var message = cons.message
			return consCheckValue(data,key,isEval,onError,customerCheck,message);
		}
		else{
			_ope = _.keys(cons)[0];
			_con = cons[_ope];
			return consParse(data,_con,_ope,isEval,onError);			
		}
	}
}
module.exports = {
	parser:function(req,res,next){
		var AP = new _AliceSPA3HttpParserPayload(res);
		res.AP = AP;
		next();
	},
	constrict:function(cons,isEval){
		return function(req,res,next){
			var errors = [];
			var result = consParse(req.body,cons,null,isEval,(msg)=>{
				errors.push(msg);
			});

			if(result === true){
				next();
			}
			else{
				
				res.AP.finish('E04',errors.join('\n'));
			}			
		}
	}
}
