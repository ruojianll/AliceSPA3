const _ = require('lodash');
module.exports = {
/*
{
	'post':['C','R']
}
*/
	checkPermissions:function(arg){
		return function(req,res,next){

			if(!req.user){
				res.AP.err('E7','user not login');
				return;
			}
			var acl = req.app.get('acl');
			var promises = [];
			_.every(arg,(v,k)=>{
				promises.push(acl.isAllowed(
					req.user.id,
					k,
					v
					).then((err,allowed)=>{
						if(err){
							return Promise.reject(err);
						}
						if(!allowed){
							return Promise.reject(false);
						}
						return allowed;
					}))
			});
			if(promises.length === 0){
				res.AP.err('E7');
				return;
			}
			Promise.all(promises).then(allowed=>{
				next();
			},err=>{
				res.AP.err('E7');
			})
		}
	},
	/*
	['r1','r2'] or 'r1'
	*/
	checkRoles:function(roles){
		return function(req,res,next){
			if(!req.user){
				res.AP.err('E7','user not login');
				return;
			}
			if(roles.isString(roles)){
				roles = [roles];
			}
			var acl = req.app.get('acl');
			var promises = [];
			_.every(roles,(i)=>{
				promises.push(acl.hasRole(
					req.user.id,
					i
					).then((err,allowed)=>{
						if(err){
							return Promise.reject(err);
						}
						if(!allowed){
							return Promise.reject(false);
						}
						return allowed;
					}))
			});
			if(promises.length === 0){
				res.AP.err('E7');
				return;
			}
			Promise.all(promises).then(allowed=>{
				next();	
			},err=>{
				res.AP.err('E7');
			})
		}
	}
}