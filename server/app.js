var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var webrouter = require('./webrouter'); 
var partials = require('express-partials');
var app = express();

//调用游戏执行文件
// view engine setup
app.set('views', path.join(__dirname, '../client/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(partials());

app.use(session({
    secret: 'work-system',
    cookie: {
        maxAge: 7*24 * 60 * 60 * 60
    },
    // store:new RedisStore({
    //   port: '6379',
    //   host: '127.0.0.1',
    //   db: 0,
    //   pass:''
    // })
    // ,
    resave:false,
    saveUninitialized:false
}));



app.use('/',webrouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = 3040;
console.log('app listen on '+port);
app.listen(port);
module.exports = app;
