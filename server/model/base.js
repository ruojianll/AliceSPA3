var _ = require('lodash');
var utils = require('../../utils/utils');
var dbValues = {
		'CURRENT_TIMESTAMP':Symbol('CURRENT_TIMESTAMP'),
		'NULL':Symbol('NULL')
	};
var _dbProtectedFields = [
		'_create_time',
		'_update_time',
		'_creator_id',
		'_updater_id',
		'_active'
	];
var _metadata = {
	fields:{
		'_create_time':{
			type:'timestamp',
			notNull:true,
			default:dbValues.CURRENT_TIMESTAMP,
			index:-1
		},
		'_update_time':{
			type:'timestamp',
			notNull:true,
			default:dbValues.CURRENT_TIMESTAMP,
			onUpdate:dbValues.CURRENT_TIMESTAMP,
			index:-2
		},
		'_creator_id':{
			type:'varchar(36)',
			notNull:true,
			index:-3
		},
		'_updater_id':{
			type:'varchar(36)',
			index:-4
		},
		'_active':{
			type:'tinyint(4)',
			notNull:true,
			default:'1',
			index:-5
		},
		'_id':{
			type:'varchar(36)',
			key:true,
			notNull:true,
			index:0
		},
	},
	id:'_id',
	tableName:'defaultName'
};
exports.dbValues = dbValues;
exports.base = function(db){
	var me = this;
	this.db = db;
	this.isFieldsProtected = function(fields){
		if(!_.includes(_dbProtectedFields,this.metadata.fields.id)){
			_dbProtectedFields.push(this.metadata.fields.id);
		}

		fields = _.isObject(fields) ? _.keys(fields) : fields;
		return !_.isEmpty(_.intersection(_dbProtectedFields,fields));
	}
	this.create = function(fields,operatorId,cb,transactionConn = null){
		if(this.isFieldsProtected(fields)){
			throw new Error('AliceSPA3_DB fields are protected');
		}
		var conn = transactionConn || this.db;
		var fieldNames = _(fields).keys().concat(
			[this.metadata.id,
			'_creator_id']
			).value();
		var id = utils.generateUUIDv4();
		var fieldValues = _(fields).values().concat(
				[id,
				operatorId]
			).value();
		console.log(`INSERT INTO ??(${utils.parseSqlTemplate(fieldNames.length,'??',null,',')}) VALUES(${utils.parseSqlTemplate(fieldNames.length,'?',null,',')})`,_.concat(this.metadata.tableName,fieldNames,fieldValues))
		conn.query(`INSERT INTO ??(${utils.parseSqlTemplate(fieldNames.length,'??',null,',')}) VALUES(${utils.parseSqlTemplate(fieldNames.length,'?',null,',')})`,
			_.concat(this.metadata.tableName,fieldNames,fieldValues),
			(err,results,fields)=>{
				cb(err,results,fields,{id:id});
			});
	};
	this.find = function(id,fields,getFields,cb){
		if(id){
			fields = {};
			fields[this.metadata.fields.id] = id;
		}
		var sqlWhereParams = utils.mixSqlTemplateValue(fields);
		this.db.query(`SELECT ${utils.parseSqlTemplate(getFields.length,'??',null,',')} FROM ?? WHERE ${utils.parseSqlTemplate(_.keys(fields).length,'??','?','AND')}`,
			_.concat(getFields,this.metadata.tableName,sqlWhereParams),
			cb)
	}
	var _update = function(id,fields,updateFields,operatorId,cb,transactionConn = null){
		var conn = transactionConn || me.db;
		if(id){
			fields = {};
			fields[me.metadata.id] = id;
		}
		var sqlSetParams = utils.mixSqlTemplateValue(updateFields);
		var sqlWhereParams = utils.mixSqlTemplateValue(fields);
		conn.query(`UPDATE ?? SET ${utils.parseSqlTemplate(_.keys(updateFields).length,'??','?',',')} WHERE ${utils.parseSqlTemplate(fields.length,'??','?','AND')}`,
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
	this.createTable = function(cb){
		var extendFunc = function(a,b){
			if((_.isObject(a) || _.isArray(a)) && (_.isObject(b) || _.isArray(b))){
				return _.extendWith(a,b,extendFunc)
			}
			else{
				return a;
			}
		}
		var parseDbValue = function(value){
			var key;
			if(_.isSymbol(value)){
				key = _.findKey(dbValues,(v,k)=>{
					return v === value;
				});
			}
			else if(_.isString(value)){
				key = `'${value}'`;
			}
			return key;
		}
		var fieldsData = _.extendWith({},this.metadata,_metadata,extendFunc);
		if(fieldsData.id != _metadata.id){
			fieldsData.fields[fieldsData.id] = _metadata.fields[_metadata.id];
			delete fieldsData.fields[_metadata.id];			
		}
		var fields = _(fieldsData.fields).keys().map((v)=>{
			return {
				name:v,
				data:fieldsData.fields[v]
			}
		}).value().sort((a,b)=>{
			var na = a.data.index;
			if(na < 0){
				na = 100000000 - na;
			}
			if(na === undefined){
				na = 99999999;
			}
			var nb = b.data.index;
			if(nb < 0){
				nb = 100000000 - nb;
			}
			if(nb === undefined){
				nb = 99999999;
			}
			return na - nb;
		});
		var items = [];
		_.each(fields,(v)=>{
			if(!v.data.notNull && !v.data.default){
				v.data.default = dbValues.NULL;
			}
			var currField = `\`${v.name}\` ${v.data.type}${v.data.notNull?' NOT NULL':''}${v.data.default?' DEFAULT '+parseDbValue(v.data.default):''}${v.data.onUpdate?' ON UPDATE '+parseDbValue(v.data.onUpdate):''}`;
			items.push(currField);
			if(v.data.unique){
				items.push(`UNIQUE KEY \`${v.name}_UNIQUE\` (\`${v.name}\`)`);
			}
		});
		items.push(`PRIMARY KEY (\`${fieldsData.id}\`)`);
		var sql = `CREATE TABLE ${this.metadata.tableName}(${items.join(',')})`;
		this.db.query(sql,cb);
	}
}