var _ = require('lodash');
var utils = require('../../utils/utils');
module.exports = function(db){
	var me = this;
	this.db = db;
	this.metadata = {
		fields:{
			id:'id'
		},
		tableName:'defaultTable'

	}
	this._dbProtectedFields = [
		'_create_time',
		'_update_time',
		'_creator_id',
		'_updater_id',
		'_active'
	]
	this.isFieldsProtected = function(fields){
		if(!_.includes(this._dbProtectedFields,this.metadata.fields.id)){
			this._dbProtectedFields.push(this.metadata.fields.id);
		}

		fields = _.isObject(fields) ? _.keys(fields) : fields;
		return !_.isEmpty(_.intersection(this._dbProtectedFields,fields));
	}
	this.create = function(fields,operatorId,cb,transactionConn = null){
		if(this.isFieldsProtected(fields)){
			throw new Error('AliceSPA3_DB fields are protected');
		}
		var conn = transactionConn || this.db;
		var fieldNames = _(fields).keys().concat(
			[this.metadata.fields.id,
			'_creator_id',
			'_updater_id']
			).value();
		var id = utils.generateUUIDv4();
		var fieldValues = _(fields).values().concat(
				[id,
				operatorId,
				operatorId]
			).value();

		conn.query(`INSERT INTO ??(${utils.parseSqlTemplate(fieldNames.length,'??',null,',')}) VALUES(${utils.parseSqlTemplate(fieldNames.length,'?',null,',')})`,
			_.concat(this.metadata.tableName,fieldNames,fieldValues),
			(err,results,fields)=>{
				cb(err,results,fields,{id:id});
			});
	};
	this.find = function(id,fields,getFields,cb){
		var getFieldNames = getFields?getFields.join(',') : '*';
		if(id){
			fields = {};
			fields[this.metadata.fields.id] = id;
		}
		var sqlWhereParams = utils.mixSqlTemplateValue(fields);
		
		this.db.query(`SELECT ${utils.parseSqlTemplate(getFieldNames.length,'??',null,',')} FROM ?? WHERE ${utils.parseSqlTemplate(fields.length,'??','?','AND')}`,
			_.concat(getFieldNames,this.metadata.tableName,sqlWhereParams),
			cb)
	}
	var _update = function(id,fields,updateFields,operatorId,cb,transactionConn = null){
		var conn = transactionConn || me.db;
		if(id){
			fields = {};
			fields[me.metadata.fields.id] = id;
		}

		var sqlSetParams = utils.mixSqlTemplateValue(updateFields);
		var sqlWhereParams = utils.mixSqlTemplateValue(fields);

		conn.query(`UPDATE ?? SET ${utils.parseSqlTemplate(updateFields.length,'??','?',',')} WHERE ${utils.parseSqlTemplate(fields.length,'??','?','AND')}`,
			_.concat(me.metadata.tableName,sqlSetParams,sqlWhereParams),
			cb);
	}
	this.update = function(id,fields,updateFields,operatorId,cb,transactionConn = null){
		if(this.isFieldsProtected(updateFields)){
			throw new Error('AliceSPA3_DB fields are protected');
		}
		_update(id,fields,updateFields,operatorId,cb,transactionConn)
	}
	this.delete = function(id,fields,operatorId,cb,transactionConn = null,isSoft = true,){
		if(isSoft){
			_update(id,fields,{'_active':false},operatorId,cb,transactionConn);
		}
		else{
			var conn = transactionConn || this.db;
			if(id){
				fields = {};
				fields[me.metadata.fields.id] = id;
			}
			var sqlWhereParams = utils.mixSqlTemplateValue(fields);
			conn.query(`DELETE FROM ?? WHERE ${utils.parseSqlTemplate(fields.length,'??','?','AND')}`,
				_.concat(this.metadata.tableName,sqlWhereParams),
				cb);
		}
	}
}