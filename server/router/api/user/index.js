var userRouter = require('./user');
module.exports = function(router,config){
	router.use('/user',userRouter(config));
}