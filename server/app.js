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
const error = require('../config/error.json');
const ServerConfig = require('../config/server.json')[argv.env];
if(!ServerConfig.database.databases.main.port){
	ServerConfig.database.databases.main.port = 3306;
}

const app = new Express();
app.set('argv',argv);
app.set('utils',utils);
app.set('error',error);
app.set('config',ServerConfig);

const Db = require('./database')(ServerConfig);
app.set('db',Db);
var models = require('./model/')(Db);
app.set('model',models);

var httpParserMiddleware = require('./middleware/httpParser.js')
app.use(httpParserMiddleware);

var auth = require('./middleware/authentication.js');

// app.get('/',function(req,res){
// 	models.user.delete(null,{username:'test111',password:'zzz'},'a',(a,b,c,extra)=>{
// 		res.AP.apiSuc(b);
// 	},null,false);
// });

require('./router/api/')(app);

app.listen(8081,function(){
	console.log("Running on 8081 port...");
});