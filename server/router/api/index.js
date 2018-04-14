/**@namespace ApiRouter*/
var apiRouter = require('express').Router();
var bodyParser = require("body-parser");
var user = require('./user/')
module.exports = function(router){
	router.use('/api',apiRouter);
	apiRouter.use(bodyParser.json());
	user(apiRouter);
};