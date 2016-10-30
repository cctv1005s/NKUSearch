var search = require('../searchEngine/index');
var folder = '../searchEngine/lrc';
var path = require('path');
var fs = require('fs');

var ss = function(socket){
	this.socket = socket;
	this.setupSocket();
};

var getItems = function(result,files){
	var items = [];

	result = result.sort(function(a,b){
		return a.value < b.value;
	});

	for(var i in result){
		var filename = files[result[i].pos];
		//读取文件内容
		var body = fs.readFileSync(path.join(__dirname,folder,filename));
 		//转换成字符串
 		body = body.toString();
 		//取前40个字符
 		body.substr(0,40);

		items.push({
			title:filename,
			body:body,
			footer:new Date(),
			id:result[i].pos
		});
	}

	return items;
}

ss.fn = ss.prototype;

ss.fn.setupSocket = function(){
	var socket = this.socket;
	socket.on('getSearch',function(data){
		var query = data.query;
		var result = search.search(query);
		var filesname = search.searchBase.fileList;
		socket.emit('searchResult',getItems(result,filesname));
	});
}

module.exports = ss;