
var ToDoAppComponent = React.createClass({displayName: "ToDoAppComponent",
	render: function(){
		return (
			React.createElement("div", null, 
				"Hi from react"
			)
		);
	}
});

ReactDOM.render( React.createElement(ToDoAppComponent, null), document.getElementById('list-container') );