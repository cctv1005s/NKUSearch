var config = require('./config');
var app = require('./app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var searchSocket = require('./searchSocket');
var users = [];
var init = require('./init');

io.on('connection', function (socket) {
    var ss = new searchSocket(socket);
});

http.listen(config.port||3050);