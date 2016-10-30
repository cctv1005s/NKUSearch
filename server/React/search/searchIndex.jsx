import React from 'react';


class SearchIndex extends React.Component{
	
	constructor(p){
		super(p);
	}

	render(){
		var self = this;
		return (
			<div className="searchBox">
				<div className="searchTitle"><i className="am-icon am-icon-glide-g"></i>歌词搜索</div>
				<input type="text" className="searchInput" ref="searchInput" onKeyDown={function(e){self.onkeydown(e);}} ></input>
				<div className="searchBtn" onClick={function(){self.getSearch();}} >
					<i className="am-icon am-icon-search"></i>
				</div>
			</div>
		);
	}

	//搜索搜索开始函数
	getSearch(){
		var store = window.store;
		var query = this.refs.searchInput.value;
		window.query = query;
		store.dispatch({
			type:'getSearch',
			query:query
		});
	}

	onkeydown(e){
		
		if(e.keyCode == 13){
			var query = this.refs.searchInput.value;
			window.query = query;
			store.dispatch({
				type:'getSearch',
				query:query
			});	
		}
	}
};

export default SearchIndex;
