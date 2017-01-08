var  spawn = require('child_process').spawn;
var file2url = require('./file2url.json');
var cheerio = require('cheerio');


var searchEngine = function(keyword,page,cb){
	var search = spawn('java',['-jar','SearchFiles.jar','-query',keyword,'-paging','10','-pageno', parseInt(page) + 1 ]);
	var std = "";
	
	search.stdout.on('data', (data) => {
  		data = data.toString();
  		// console.log(data);
  		std += data;
	});

	search.stdout.on('close', (data) => {
  		std = JSON.parse(std);

      for(var i in std.data){
          var filename = std.data[i].path;
          var file_r = require('./data/'+filename);
          std.data[i].url = file_r.url;
      }

      var data = {
  			data:std,
  			page:page,
  			keyword:keyword
  		}

      cb(null,data);
	});
}

var seachIndex = function(){

}

var getBreif = function(keyword,content){
  var begin = content.indexOf(keyword);
  var $ = cheerio.load(content);
  
  content = $('body').text();

  return content.substr(begin-30,50);
}

module.exports = searchEngine;