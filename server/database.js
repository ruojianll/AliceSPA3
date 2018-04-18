const _ = require('lodash');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};

module.exports = function(dbConfig){
	var options = {
		dialect: 'mysql',
		host            : dbConfig.database.databases.main.host,
		port            : dbConfig.database.databases.main.port,
		timezone		: dbConfig.database.databases.main.timezone,
		pool: {
			max: 5,
			idle: 30000,
			acquire: 60000,
		},
		define: {
			underscored: true,
			charset: 'utf8',
			dialectOptions: {
				collate: 'utf8_general_ci'
			},
			timestamps: true,
			paranoid:false
		},
		operatorsAliases:operatorsAliases,
		logging:dbConfig.database.logging
	};
	var db  = new sequelize(
		dbConfig.database.databases.main.databaseName,
		dbConfig.database.databases.main.users.main.username,
		dbConfig.database.databases.main.users.main.password,
		options
		);
	return db;
}