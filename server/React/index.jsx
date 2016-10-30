import React from 'react';
import SearchIndex from './search/searchIndex.jsx';
import SearchPage from './search/searchPage.jsx';

class App extends React.Component {
   
   view(){
   	var store = window.store;
   	var {type} = store.getState();
   	
   	switch(type){
   		case 'searchIndex':
   			return (<SearchIndex />);
   		break;
   		case 'searchPage':
   			return (<SearchPage />);
   		break;
   		default:
   			return (<SearchIndex />);
   		break;
   	}
   }

   render() {
      return (
        <div className="app">
        	{this.view()}
        </div>
    );
   }
}

export default App;