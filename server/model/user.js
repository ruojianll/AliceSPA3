var {base,dbValues} = require('./base');
module.exports = function(db){
	var obj = {};
	base.apply(obj,arguments);
	
	obj.metadata = {
		fields:{
			id:'id',
			_data:{
				'username':{
					type:'varchar(30)',
					default:dbValues.NULL
				},
				'email':{
					type:'varchar(45)',
					default:dbValues.NULL
				},
				'email':{
					type:'varchar(25)',
					default:dbValues.NULL
				},
				'password':{
					type:'varchar(128)',
					notNull:true
				},

			}
		},
		tableName:'user'
	}

	return obj;
}