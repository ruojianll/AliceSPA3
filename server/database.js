const Mysql = require('mysql');

module.exports = function(dbConfig){
	var mysqlOpts = {
		connectionLimit : dbConfig.database.databases.main.databaseLimit,
		host            : dbConfig.database.databases.main.host,
		port            : dbConfig.database.databases.main.port,
		user            : dbConfig.database.databases.main.users.main.username,
		password        : dbConfig.database.databases.main.users.main.password,
		database        : dbConfig.database.databases.main.databaseName,
		timezone		: dbConfig.database.databases.main.timezone
	};
	var mysqlPool  = Mysql.createPool(mysqlOpts);

	mysqlPool.doTransaction = function(inTransaction){
		mysqlPool.getConnection((err,conn)=>{
			if(err){
				inTransaction(err);
				return;
			}
			conn.beginTransaction(function(err){
				if(err){throw err;}
				inTransaction(
					null,
					conn,
					(cb)=>{
						conn.commit(
							(err)=>{
								if(err){
									conn.rollback(()=>{
										conn.release();
										cb(err);
									});
								}
								else{
									cb(null);
								}
							}
						);
					},
					(cb)=>{
						conn.rollback(()=>{
							conn.release();
							cb(null);
						});
					})
			});			
		});
	}

	return mysqlPool;
}