/**@namespace ApiRouter*/
var apiRouter = require('express').Router();
var bodyParser = require("body-parser");
var user = require('./user/')
var apiParser = require('../../middleware/apiParser').parser
module.exports = function(router,config){
	router.use('/api',apiRouter);
	apiRouter.use(bodyParser.json());
	apiRouter.use(apiParser);
	user(apiRouter,config);
};