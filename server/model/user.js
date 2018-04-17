var _ = require('lodash');
var utils = require('../../utils/utils');
var {base,dbValues} = require('./base');
module.exports = function(db){
	var obj = {};
	base.apply(obj,arguments);
	
	obj.metadata = {
		fields:{
			'username':{
				type:'varchar(30)',
				default:dbValues.NULL,
				unique:true,
				index:1
			},
			'email':{
				type:'varchar(45)',
				default:dbValues.NULL,
				unique:true,
				index:2
			},
			'telephone':{
				type:'varchar(25)',
				default:dbValues.NULL,
				unique:true,
				index:3
			},
			'password':{
				type:'varchar(128)',
				notNull:true,
				index:4
			},
			'token':{
				type:'varchar(128)',
				index:5
			},
			'token_generate_time':{
				type:'datetime',
				index:6
			},
			'token_expired_time':{
				type:'datetime',
				index:7
			}
		},
		id:'id',
		tableName:'user'
	}

	obj.checkToken = function(nameFields,token){
		return new Promise((resolve,reject)=>{
			obj.db.query(
			`SELECT * FROM ?? WHERE ${utils.parseSqlTemplate(_.keys(nameFields).length + 2,'??','?','AND',_(Array(_.keys(nameFields).length + 2)).fill('=').fill('>',0,1).valueOf())}`,
			_.concat([obj.metadata.tableName,'token_expired_time',new Date(),'token',token],utils.mixSqlTemplateValue(nameFields)),
			(err,results)=>{
				if(err){
					reject(err);
					return;
				}
				if(results.length === 0){
					resolve(false);
					return;
				}
				resolve(true);
			});	
		})
	}
	return obj;
}