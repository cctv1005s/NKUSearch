import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import App from './index.jsx';
import reducer from './reducer.js';
import setupSocket from './socket.js';

var util = require('util');

//放入reducer函数
var store = createStore(reducer);
window.store = store;
window.socket = io();
setupSocket(socket);

var render = function(){
    ReactDOM.render(<App />, document.getElementById('app'));    
}


render();
store.subscribe(render);


//处理屏幕的问题
$(function(){
	var setWindow = function(){
		var width = $(window).width();
		width = Math.min(width,540);
		var fontSize = util.format('%spx',width/10);
		$('html').css('font-size',fontSize);
	}
	setTimeout(function(){
		setWindow();
	},10);

	$(window).resize(function(){
		setWindow();
	});	
})
