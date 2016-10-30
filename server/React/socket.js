export default (socket) =>{
	socket.on('searchResult',function(data){
		var store = window.store;
		store.dispatch({
			type:'searchResult',
			data:data
		})
	});
}