var modelBase = require('./base');
module.exports = function(db){
	var obj = {};
	modelBase.apply(obj,arguments);
	
	obj.metadata = {
		fields:{
			id:'id'
		},
		tableName:'user'
	}

	return obj;
}