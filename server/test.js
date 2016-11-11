var request = require('request');

request('http://localhost:3040/',function(err,req,body){
	console.log(req);
});
