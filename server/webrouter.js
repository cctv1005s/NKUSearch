var express = require('express');
var router = express.Router();

var userRequired = function(req,res,next){
    if(!req.session.user)
        res.json('请先登录');
    next();
}


/* GET home page. */
router.get('/', function(req, res, next){
    //登录权限控制
    var login = false;
    if(req.session.user){
        login = true;
    }    

    res.render('index',{login:login});
});

module.exports = router;
