var Segment = require('node-segment').Segment;
var segment = new Segment();
segment.useDefault();

//segment.doSegment()
var fs = require('fs');
var path = require('path');
var util = require('util');

var out = console.log;
 var folderName  = './c_lrc'; //歌词目录文件
//主函数
var main = function(){
    var files = getFiles();//获取文件id已经每个文件下的词条
    console.log(files);
    var tokenQueue = mergeTokens(files);//合并词条到一个词条队列中，按字典序排列
    var reverseIndex = processQueue(tokenQueue); //处理词条队列，生成倒排索引
    FileOutIndex(reverseIndex,'output_c.idx');//将倒排索引输出到文件中
} 

setTimeout(main,0);

//获取文件id已经每个文件下的词条
var getFiles = function(){
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
        var pathname = path.join(__dirname,folderName,fileList[i]);
        var str = fs.readFileSync(pathname).toString();
        //过滤字符串
        str = filter(str);
        //以空格来生成词条
        var tokens = segment.doSegment(str);
        for(var j in tokens){
            tokens[j] = tokens[j].w;
        }
        files.push({
            index:i,
            tokens:tokens 
        });
    }
    //词条唯一化
    for(var i = 0;i < files.length;i++){
        files[i].tokens = unique(files[i].tokens); 
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