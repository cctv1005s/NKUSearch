var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('util');

var  spawn = require('child_process').spawn;
var iconv = require('iconv-lite');

var searchEngine = require('./searchEngine');


router.get('/',function(req,res,next){
	res.render('index');
});

/*搜索页面*/
router.get('/search',function(req,res,next){
	var keyword = req.query.keyword;
	var page = req.query.page||0;
	
	if(!keyword){
		res.redirect('/');
	}

	searchEngine(keyword,page,function(err,data){
		data.keyword = keyword;
		data.page = page;
		res.render('search',data);
	});
});


// https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=www
//搜索建议

router.get('/suggest',function(req,res,next){
	try{
	var wd = req.query.wd;
	var url = util.format('https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=%s',encodeURIComponent(wd));

	request(url,{encoding: "binary"},function(err,req,body){
		res.send(getGBK(body));
	});}
	catch(e){
		console.log(e);
	}
});


var getGBK = function(buffer){
    return iconv.decode(new Buffer(buffer, 'binary'),'gbk'); 
}


//简单的图片搜索
router.get('/image/search',function(req,res,next){
	var keyword = req.query.keyword;
	var page = req.query.page||0;
	
	if(!keyword){
		res.redirect('/');
	}
	var tk = keyword;
	keyword = keyword.split('').join('.*');
	var reg 　= new RegExp(keyword);
	var x = require('./imgRecorder.json');
	var t = [];

	for(var i in x){
		
		//扔掉一些出现频率比较高的图片
		if(x[i].src.indexOf('template') >= 0){
			continue;
		}

		if(x[i].breif.match(reg)>=0){
			t.push(x[i]);
		}
	}

	var b = [];

	for(var i = page*50;i < (parseInt(page)+1)*50 ;i++){
		b.push(t[i]);
	}

	// console.log(t);
	res.render('img_search',{data:b,keyword:tk,page:page,length:t.length});
});

module.exports = router;


//->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//抓取程序
var search_spider = function(){
	var node = spawn('node',['getNKUWeb.js']);

	node.stdout.on('data', (data) => {
	  console.log(data.toString());
	});

	//一次抓取２０分钟
	setTimeout(function(){
		console.log("kill");
		node.kill('SIGHUP');
		search_index();
	},1000*60*20);
}

//生成索引
var search_index = function(){
	var _index = spawn('java',['-jar','lutest.jar']);
}

//每五个小时执行一次抓取程序
setInterval(function(){
	search_spider();
},1000*60*60*5);

search_spider();
