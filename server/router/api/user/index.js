var userRouter = require('./user');
module.exports = function(router){
	router.use('/user',userRouter);
}