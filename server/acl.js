const Acl       = require('acl');
const AclSeq    = require('./lib/acl_sequelize/backend');  


module.exports = db=>{
	return new Acl(new AclSeq(db, { prefix: 'acl_' }));
}