const Express = require('express');
const utils = require('../utils/utils');
const argv = require('minimist')(process.argv);

if(!argv.env){
	argv.env = 'pro';
}
if(argv.env === 'pro'){
	process.env.NODE_ENV = 'production';
}

console.log(`In env : ${argv.env}`)
const error = require('../config/error');
const ServerConfig = require('../config/server')[argv.env];
if(!ServerConfig.database.databases.main.port){
	ServerConfig.database.databases.main.port = 3306;
}
if(!ServerConfig.timezone){
	ServerConfig.timezone = 'GMT';
}
process.env.TZ = ServerConfig.timezone;
const app = new Express();
app.set('argv',argv);
app.set('utils',utils);
app.set('error',error);
app.set('config',ServerConfig);

const Db = require('./database')(ServerConfig);
app.set('db',Db);
var models = require('./model/')(Db);
app.set('model',models);

var auth = require('./middleware/authentication');

// app.get('/',function(req,res){
// 	models.user.delete(null,{username:'test111',password:'zzz'},'a',(a,b,c,extra)=>{
// 		res.AP.apiSuc(b);
// 	},null,false);
// });
// var zzz = require('./model/zzz');
// app.get('/',function(req,res){
// 	zzz(Db).createTable();
// })
require('./router/api/')(app);

var cons = require('./middleware/apiParser').constrict;

app.listen(8081,function(){
	console.log("Running on 8081 port...");
});