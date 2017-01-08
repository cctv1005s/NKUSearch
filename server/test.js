const spawn = require('child_process').spawn;

var node = spawn('node',['getNKUWeb.js']);

node.stdout.on('data', (data) => {
  console.log(data.toString());
});


setTimeout(function(){
	console.log("kill");
	node.kill('SIGHUP');
},3000);
