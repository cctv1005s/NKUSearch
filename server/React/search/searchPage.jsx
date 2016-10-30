import React from 'react';


class searchPage extends React.Component{
	constructor(props){
		super(props);
		this.initOnce = false;
	}

	render(){
	
	var store = window.store;
	var {type,data} = store.getState();

	var self = this;
	return (<div className="searchPage">
			<div className="header">
				<div className="header-searchbox clearfix">
					<i className="header-icon am-icon am-icon-glide-g"></i>
					<input className="header-searchbox-input" value={window.query} onChange={function(e){self.onchange(e)}} ref="searchInput" onKeyDown={function(e){self.onKeyDown((e))}}>
					</input>
					<div className="header-searchbox-btn">
						<i className="am-icon am-icon-search"></i>
					</div>
				</div>
				<div className="header-list clearfix">
					<div className="list-item active">歌词</div>
					<div className="list-item">歌名</div>
					<div className="list-item">歌手</div>
				</div>
			</div>
			<div className="body">
				{this.getItem()}			
			</div>
		</div>);
	}

	getItem(){
		var store = window.store;
		var {type,data} = store.getState();
		var items = [];

		for(var i in data){
			items.push(
				<div className="searchItem">
					<div className="searchItem-title">
						{data[i].title}
					</div>
					<div className="searchItem-body">
						{data[i].body}
					</div>
					<div className="searchItem-footer">
						{data[i].footer}
					</div>
				</div>
			)
		}
		return items;
	}

	onchange(e){
		window.query = e.currentTarget.value;
		this.setState();
	}	

	onKeyDown(e){
		if(e.keyCode == 13){
			var query = this.refs.searchInput.value;
			window.query = query;
			store.dispatch({
				type:'getSearch',
				query:query
			});	
		}
	}
}

export default searchPage;