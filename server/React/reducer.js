function getSearch(state,action){
	var socket = window.socket;
	var query = action.query;
	socket.emit('getSearch',{
		query:query
	});
	return state;
}

var initState = {
	type:'searchIndex',
}

export default (state = initState,action) =>{
	switch(action.type){
		case 'getSearch':
			state = getSearch(state,action);
		break;
		case 'searchResult':
			state = action;
			state.type = "searchPage"
		break;
	}

	return state;
}
