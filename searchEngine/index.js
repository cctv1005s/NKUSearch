var fs = require('fs');
var path = require('path');
var util = require('util');

var out = console.log;
var folderName  = path.join(__dirname,'./lrc'); //歌词目录文件

//生成一个搜索库必备的几个信息
var makeSearchBase = function(){
    var files = getFiles();//获取文件id已经每个文件下的词条
    var tokenQueue = mergeTokens(files);//合并词条到一个词条队列中，按字典序排列
    //++2016年10月29日 信息检索第二次作业新加入内容
    var unfile = getFiles(true);
    var untokenQueue = mergeTokens(files);
    var tf = makeTf(untokenQueue);//++根据tokenQueue生成一个tf表

    var reverseIndex = processQueue(tokenQueue); //处理词条队列，生成倒排索引    
    //++2016年10月29日 信息检索第二次作业新加入内容
    var idf = makeIdf(reverseIndex,files.length);//根据倒排索引记录表生成一个idf表
    var wtf = makeWtf(tf,idf);//++根据idf表，tf表，已经文档数目来生成每一个单词对于文档 n 的相关度

	return {
		reverseIndex:reverseIndex,
		tf:tf,
		idf:idf,
		wtf:wtf,
        fileList:fs.readdirSync(folderName)
	};
}

//获取文件id已经每个文件下的词条
var getFiles = function(uni){
    uni = uni || true;
    var filter = function(str){
     	while(str.indexOf('[') >= 0 &&str.indexOf(']') >= 0){
     		var begin = str.indexOf('[');
     		var end = str.indexOf(']'); 		
     		str = str.replace( str.substr(begin,end+1-begin),"");
     	}
     	//symbol 
     	str = str.replace(/\n/g," ");
     	str = str.replace(/\./g," ");
     	return str;
    }

   function unique(arr) {
        var result = [];
        for(var i = 0;i < arr.length;i++){
            var repeat = false;
            if(arr[i].length == 0)
                continue;
            for(var j = 0;j < result.length;j++){
            
                if(result[j] == arr[i])
                    repeat = true;
            }
            if(!repeat){
                result.push(arr[i]);
            }
        }
        return result;
    }

    var fileList = fs.readdirSync(folderName);
    var files = [];

    //生成词条以及id
    for(var i = 0;i < fileList.length;i++){
        var pathname = path.join(folderName,fileList[i]);
        var str = fs.readFileSync(pathname).toString();
        //过滤字符串
        str = filter(str);
        //以空格来生成词条
        var tokens = str.split(' ');
        files.push({
            index:i,
            tokens:tokens 
        });
    }
    //词条唯一化
    if(uni){
        for(var i = 0;i < files.length;i++){
            files[i].tokens = unique(files[i].tokens); 
        }
    }
    return files;
}

//compare算法比较有用，拿出来当全局变量
var compare = function(stra,strb){
    var tick = Math.min(stra.length,strb.length);
    for(var i = 0;i < tick;i++){
        if(stra[i] > strb[i])
            return 1;
        if(stra[i] < strb[i])
            return -1;
    }
    if(stra.length == strb.length )
        return 0;
    return stra.length > strb.length ? 1 : -1;
}

//合并生成词条队列
var mergeTokens = function(files){
    var queue = [];
    for(var i in files)
        for(var j in files[i].tokens){
            queue.push({
                index:files[i].index,
                token:files[i].tokens[j]
            })
        }
    //按字典序比较二者大小
    queue.sort(function(a,b){
        return compare(a.token,b.token);
    });
    return queue;
}

function processQueue(queue){
    var index = [];
    var nowToken = "";
    for(var i in queue){
        if(compare(nowToken,queue[i].token) != 0){
            nowToken = queue[i].token;
            index.push({
                token:nowToken,
                pos:[queue[i].index]
            });
        }else{
            index[index.length - 1].pos.push(queue[i].index);
        }
        index[index.length - 1].pos.sort();
    }
    return index;
}

var FileOutIndex = function(index,output){
    var str = "";
    for(var i in index){
        var set = "";
        for(var j in index[i].pos){
            set += index[i].pos[j] + ",";
        }
        set = set.slice(0,set.length - 1);
        str += util.format("%s#%s@%s\n",index[i].token,index[i].pos.length,set);
    }
    fs.writeFileSync(output,str);
}


//++2016年10月28日23:58:40
//++信息检索作业2，为歌词检索加入向量空间模型

/**
 * 用于生成tf表
 *
 * @params tq {array} -已经排序过的词条记录表
 * @return tf {array} -tf表
 */

var makeTf = function(tq){
	var tf = [];
	for(var i in tq){
		var token = tq[i].token,
			index = tq[i].index;
		if(!tf[token]){
			tf[token] = {};
		}
		if(!tf[token][index]){
			//初始化值
			tf[token][index] = 0;
		}
		//记录值++
		tf[token][index] ++;
	}
	return tf;
}

/**
 * 用于生成idf表
 *
 * @params ri {array} -已经排序过的词条记录表
 * @params fl {int} -总的文档数目
 * @return idf {array} -idf表
 */
var makeIdf = function(ri,fl){
	var idf = [];
	for(var i in ri){
		var token  = ri[i].token,
			poslen = ri[i].pos.length;
		idf[token] = log10(fl/poslen);
	}
	return idf;
}


/**
 * 用于生成wtf表
 *
 * @params tf {array} -一个tf表
 * @params idf {array} -与之相关的idf表
 * @return wtf {array} -wtf表
 */
var makeWtf = function(tf,idf){
	var wtf = [];
	for(var i in tf){
		for(var j in tf[i]){
			
			if(!wtf[i]){
				wtf[i] = {};
			}
			wtf[i][j] =  (1 + log10(tf[i][j]))*idf[i];
		}
	}
	return wtf;
}

/**
 * 用于生成10的对数
 *
 * @params x {number} -一个数字
 */
var log10 = function(x){
	return Math.log(x) / Math.LN10;
}


/**
 * 用于生成一条查询语句的wtf表
 *
 * @params {string} query -一条查询语句
 */
var query2tf = function(query){
	//拿到由query组成的词条队列
	var tokenQueue = query2queue(query);
	var tf = makeTf(tokenQueue);
    return tf;
}

/**
 * 将一条查询语句转换为一个词条队列
 *
 * @params {string} query -一条查询语句
 */
var query2queue = function(query){
    //分词
    var tokens = query.split(' ');
    var qfiles = [{
    	index : 0,
    	tokens:tokens
    }];
    return mergeTokens(qfiles);
}

//一个垃圾搜索引擎
var SE = function(){
	this.init();
}

SE.fn = SE.prototype;

SE.fn.init = function(){
	//生成一个searcheBase
	this.searchBase = makeSearchBase();
}

//找出query所在的倒排索引的文件的id
SE.fn.findQuery = function(ri,query){
	var tokens = query.split(' ');
	var pos = [];

	for(var i in tokens){
		var found = false;
		for(var j in ri){
			if(ri[j].token == tokens[i]){
				found  = true;
				pos.push(ri[j].pos);
			}
		}
		if(!found){
			pos.push([]);
		}
	}

	function mergePos(a,b){
	   return a.concat(b);
	}

    function unipos(a){
        var b = []
        for(var i in a){

            var found = false;
            for(var j in b){
                if(a[i] == b[j])
                    found = true;
            }

            if(found)
                continue;
            
            b.push(a[i]);
        }
        return b;
    }

	var mergepos = pos[0];
	
	for(var i = 0;i < pos.length;i++){
        mergepos = mergePos(mergepos,pos[i]);
	}
    mergepos = unipos(mergepos);
	return mergepos;
};


SE.fn.getQueryWtf = function(query,pos){
	var qwtf = [];
	var qtf = query2tf(query);
	var idf = this.searchBase.idf;
	
	for(var i in qtf){
		qwtf[i] = {};
		for(var j in qtf[i]){
			qwtf[i][j] = (1 + log10(qtf[i][j]))*idf[i]||0;
		}		
	}

	return qwtf;
}

SE.fn.search = function(query){
	//
	var ri = this.searchBase.reverseIndex;
	//合并之后出现的文档的位置
	var pos = this.findQuery(ri,query);

	var qwtf = this.getQueryWtf(query,pos);
	var wtf = this.searchBase.wtf;
	var tokens = query.split(' ');
	var rankPos = [];

	for(var i in pos){
		
        var child = 0,
			qi_sum = 0,
			di_sum = 0;

		for(var j in tokens){
			var t = tokens[j];
			
			if(!wtf[t]){
				wtf[t] = 0;
			}

			child += qwtf[t][0] * wtf[t][i]||0;
			di_sum += wtf[t][i] * wtf[t][i]||0;
		}

		//对分母开根号

		// qi_sum = Math.sqrt(qi_sum);
		di_sum = Math.sqrt(di_sum);

		if(child == 0){
			rankPos.push({
				pos:pos[i],
				value:0
			});
			continue;
		}

		rankPos.push({
			pos:pos[i],
			value: child / ( di_sum )
		});
	}

	return rankPos;
}

var search = new SE();

module.exports = search;


