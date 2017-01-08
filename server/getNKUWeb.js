var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");
var util = require("util");
var md5 =require("md5");
var iconv = require('iconv-lite');
var urlPaser = require('url');

var index = "http://www.nankai.edu.cn";
var all_spider_page = 0;

/*编码转换*/
var getGBK = function(buffer){
    return iconv.decode(new Buffer(buffer, 'binary'),'gbk'); 
}

var getUtf8 = function(buffer){
    return iconv.decode(new Buffer(buffer, 'binary'),'utf-8');    
}

var getHtml = function(url,cb){
    try{
        request(url,{encoding: "binary"},function(err,req,body){
            if(err){
                console.log(err);
                cb(err);
            }else{
                var type = req.headers['content-type'];
                if(typeof type != "string")
                    return ;
                var lag = type.match(/charset=.*/);
                if(!lag){
                    return;
                }
                lag = lag[0];
                
                if(lag.match(/utf-8/)||lag.match(/UTF-8/)){
                    return cb(null,getUtf8(body));
                }else{
                    return cb(null,getGBK(body));
                }
            }
        });
    }catch(e){
        console.log(e);
    }
}

var allurl = {};
var urlLogFile = "url.log";
var file2url = {};

allurl[md5(index)] = {url:index};

var main = function(){
    //get 一个页面
    //下载这个页面
    //提取其中的url
    //宽度优先遍历

    //将要访问的url记录下来
    fs.writeFileSync(path.join(__dirname,urlLogFile),"");

    var saveFile = function(body,url){
        var $ = cheerio.load(body);
        var title = $('title').text().replace(/[^\u4e00-\u9fa5]/g,'');
        var fileName  = util.format("%s.json",title);
        
        //保存标题
        allurl[md5(url)].title = $('title').text();
        
        //之前废弃的代码
        file2url[fileName] = url;
      
        try{
            var $ = cheerio.load(body);    
        }catch(e){
            console.log(e);
            return;
        }

        //取出其中的img标签，和url,生成简单的图片索引
        imageRecorder(body,url);

        //将文件存储成json格式
        var file_content = {
            url:url,
            content:$('body').text()
        };
        
        try{
           fs.writeFileSync(path.join(__dirname,"/data/",fileName), JSON.stringify(file_content));
        }catch(e){
            console.log(e);
        }

        console.log(all_spider_page ++);

    }

    var get = function(uurl){    
        
        fs.writeFileSync('./allurl.json',JSON.stringify(allurl));
        //fs.writeFileSync('./file2url.json',JSON.stringify(file2url));

        if(uurl.indexOf('nankai.edu.cn') == -1){
            return ;
        }

        if(uurl.match(/nankai.edu.cn[a-zA-Z]+/)){
            return;
        }

        fs.appendFileSync(path.join(__dirname,urlLogFile),uurl+"\n");
        
        getHtml(uurl,function(err,body){
            // console.log(body);
            try{
            var $ = cheerio.load(body);
            var tagA = $('a');   
            }catch(e){
                console.log(e);
                return;
            }
            saveFile(body,uurl);
            //即将要访问到的地址
            var nexturl = [];
            
            for(var i in tagA){
                if(tagA[i].attribs && tagA[i].attribs.href){
                    //获取路径
                    var turl = tagA[i].attribs.href;
                    //整理地址
                    if(turl.indexOf('http://')< 0){
                        turl = index + uurl;
                    }

                    //如果我们没有这个地址，就添加
                    if(!allurl[md5(turl)]){
                        //添加入即将访问的地址
                        nexturl.push(turl);
                        allurl[md5(turl)] = {url:turl};
                    } 
                }
                else{
                    //如果不存在属性，那么就继续
                    continue;
                }

            }

            setTimeout(function(){
                while(nexturl.length != 0){
                    var curl = nexturl.shift();
                    get(curl);
                }
            },0);
        });        
    }    
    //从首页开始抓取
    get(index); 
}

//为了读取上下文环境必须要用到的
setTimeout(function(){
    main();
},0);


var _img_recorder = [];

//-------------------------------->
//爬虫补充部分　2017.1.1
function imageRecorder(body,url){
    var $ = cheerio.load(body);
    var $img = $('img');
    
    for(var i in $img){
        
        try{
            var $ele = $($img[i]);    
            // console.log($($img[i]));
        }catch(e){
            continue;
        }

        //图片的地址
        var src = $ele.attr('src');
        
        if(!src){
            continue;
        }

        //图片的简介,这里我们通过读取三个地方的文字组成这一个图片的简介 title + alt + parent的文字
        var _parent = $ele.parent().parent().text()||"";
        var _tile = $ele.attr('title')||"";
        var _pagetitle = $('title').text()||"";
        var _alt = $ele.attr('alt')||"";

        var breif =  _parent + _pagetitle + _alt + _tile;

        //补全单个图片的地址
        if(src.indexOf('http://') == -1){
            var result = urlPaser.parse(url);
            src = result.protocol + "//" + result.host + src;

        }
        _img_recorder.push({
            src:src,
            breif:breif,
            url:url
        });
    }

    //保存图片地址
    fs.writeFileSync('./imgRecorder.json',JSON.stringify(_img_recorder));
}
