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
	return obj;
}