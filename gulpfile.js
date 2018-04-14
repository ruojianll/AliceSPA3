var gulp = require("gulp");
var exec = require("child_process").exec;
var pm2 = require("pm2");
gulp.task("doc",function(){
	exec("./node_modules/.bin/jsdoc -c ./jsdoc.conf.json -t ./node_modules/ink-docstrap/template -R README.md .",function (err, stdout, stderr) {
	    console.log(stdout);
	    console.log(stderr);
  	});
});
gulp.task("serve-dev-server",function(cb){
	pm2.connect(true, function() {
		pm2.start({
			name: 'AliceSPA3-Server',
			script: 'server/app.js',
			args:["--env=dev"],
			maxRestarts:1
		}, function() {
			console.log('AliceSPA3-Server dev started!');
			pm2.streamLogs('all', 0);
			cb();
	});
  });
});
gulp.task("serve-server",function(cb){
	pm2.connect(false, function() {
		pm2.start({
			name: 'AliceSPA3-Server',
			script: 'server/app.js',
			args:["--env=pro"]
		}, function() {
			console.log('AliceSPA3-Server started!');
			cb();
	});
  });	
});
gulp.task("restart-dev-server",function(cb){
	pm2.restart("AliceSPA3-Server",function(){
		console.log("AliceSPA3-Server dev restarted!");
		cb();
	});
});
gulp.task("dev-server",["serve-dev-server","restart-dev-server"],function(){
	console.log('Watching server codes...')
	gulp.watch(["server/**/*.js","utils/**/*.js","config/**/*.json"],["restart-dev-server"])
	.on("change",function(event) {
  		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});
