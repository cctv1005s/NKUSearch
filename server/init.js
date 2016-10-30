/**
* 每日执行抓取必应首页图片,存储在public下的background.jpg
*/

var request = require('request');
var cheerio = require('cheerio');
var later = require('later');
var fs = require('fs');
var config = require('./config');

var basic = {h:[00],m:[01]};  //设置每天凌晨执行
var composite=[
    basic
];

var sched={
    schedules:composite
};
later.date.localTime();  //设置本地时区


var getBackground = function(){
    var bing = config.bing;
    request(bing,function(err,req,body){
        var data = JSON.parse(body);
        var url = data.images[0].url;
        saveAsFile(url);
    });
}

var saveAsFile = function(url){
    var ws = fs.createWriteStream('../client/public/img/background.jpg');
    request(url)
    .pipe(ws);
}

//每次启动时先抓取文件
getBackground();
//每日执行任务
later.setInterval(getBackground,sched);
setInterval(getBackground,1000*60*60*24);