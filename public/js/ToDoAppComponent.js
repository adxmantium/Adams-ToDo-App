window.zenefits = {};

zenefits.saveObject = function(key, value){
	localStorage.setItem(key, JSON.stringify(value));
};

zenefits.getObject = function(key){
	var value = localStorage.getItem(key);
	return value && JSON.parse(value);
};

var ToDoAppComponent = React.createClass({displayName: "ToDoAppComponent",
	getInitialState: function(){
		return {
			showIntro: true,
			id: 1,
			users: [],
			activeUser: {},
		};
	},

	componentWillMount: function(){
		if( localStorage.length > 0 ){
			//set up then next available id
			this.state.id = ++localStorage.length;
			//loop through storage to save existing users to array
			for( var i = 1; i <= localStorage.length; i++){
				this.state.users.push( zenefits.getObject(i) );
			}
		}
	},

	componentDidMount: function(){
		// console.log( this.state.users );
	},

	toggleViews: function(e){
		e.preventDefault();
		var entered = $(e.currentTarget).find('input').val();

		this.addUser(entered);
		this.setState({showIntro: false});
	},

	//user functions
	addUser: function(name_entered){
		var newUser = {
			id: this.state.id,
			name: name_entered,
			tasks: []
		};

		//add to users array
		this.state.users.push(newUser);
		//save to localstorage
		zenefits.saveObject(newUser.id, newUser);
		//set active user
		this.setActiveUser(newUser);
		//increment id
		this.state.id++;
	},
	existingToActiveUser:function(user){
		this.setActiveUser(user);
		this.setState({showIntro: false});
	},
	setActiveUser: function(newUser){
		this.state.activeUser = newUser;
	},
	logout: function(){
		this.setState({showIntro: true});
	},

	//render
	render: function(){
		return (
			React.createElement("div", {className: "container-fluid"}, 
				 
					this.state.showIntro ? 
					React.createElement(Intro_Component, {users: this.state.users, toggleViews_function: this.toggleViews, existingToActiveUser_function: this.existingToActiveUser}) : 
					React.createElement(List_Component, {user: this.state.activeUser, logout_function: this.logout})
				
			)
		);
	}
});

var Intro_Component = React.createClass({displayName: "Intro_Component",
	getInitialState: function(){
		return {
			users: this.props.users,
		};
	},

	render: function(){
		var _this = this;
		var directions = "All we need to begin a new to-do list, is your name";
		return (
			React.createElement("div", {className: "createList-container"}, 
				React.createElement("div", {className: "text-left"}, 
					React.createElement("h2", null, "Welcome, to Zenefits ", React.createElement("small", null, "ToDo"), "!"), 
					React.createElement("div", null, directions)
				), 

				React.createElement("form", {className: "intro-form text-left", onSubmit: this.props.toggleViews_function}, 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("input", {type: "text", className: "form-control", placeholder: "What's your name?", "aria-describedby": "basic-addon2"}), 
						React.createElement("span", {className: "input-group-addon", id: "basic-addon2"}, React.createElement("button", null, "Create"))
					)	
				), 

				React.createElement("div", {className: "existing-users-container text-left"}, 
					React.createElement("div", null, "Already created a list?"), 
					
						_this.state.users.length > 0 ?
						_this.state.users.map(function(user){
							return React.createElement(ExistingUsers_Component, {key: user.id, user: user, existingToActiveUser_function: _this.props.existingToActiveUser_function})
						}) :
						React.createElement("div", null, React.createElement("small", null, "No existing lists"))
					
				), 

				React.createElement("div", {className: "by-adam-adams text-left"}, React.createElement("small", null, "By: Adam Adams"))

			)
		);
	}
});



//Existing Users Component
var ExistingUsers_Component = React.createClass({displayName: "ExistingUsers_Component",
	getInitialState: function(){
		return {
			user: this.props.user,
			highestPriority: 'none',
		};
	},

	findNumberOfIncompleteTasks: function(){
		var iTasks = _.filter(this.props.user.tasks, {complete: false});
		this.state.highestPriority = this.findHighestPriority(iTasks);
		return iTasks.length;
	},

	findNumberOfFinishedTasks: function(){
		var iTasks = _.filter(this.props.user.tasks, {complete: true});
		return iTasks.length;
	},

	findHighestPriority: function(tasks){
		var classes = 'highest-priority ';
		var priority = ['high', 'medium', 'low'];
		var highest = 'low';
		var temp = null;

		for(var i = 0; i < priority.length; i++){
			temp = _.filter(tasks, {priority: priority[i]});
			if( !_.isEmpty(temp) ){
				highest = priority[i];
				break;
			}
		}

		return classes += highest;
	},

	setExistingToActive: function(){
		this.props.existingToActiveUser_function(this.state.user);
	},

	render: function(){
		var num_of_incomplete = this.findNumberOfIncompleteTasks();
		var num_of_complete = this.findNumberOfFinishedTasks();
		return (
			React.createElement("div", {className: "existing-user", onClick: this.setExistingToActive}, 
				React.createElement("div", {className: "user-name"}, this.props.user.name), 
				React.createElement("div", {className: "user-incompleted"}, "Incomplete Tasks: ", React.createElement("span", {className: this.state.highestPriority}, num_of_incomplete)), 
				React.createElement("div", {className: "user-completed"}, React.createElement("small", null, "Completed Tasks: ", num_of_complete)), 
				React.createElement("div", {className: "arrow"}, "›")
			)	
		);	
	}
});




// -- List Component
var List_Component = React.createClass({displayName: "List_Component",
	getInitialState: function(){
		return {
			user: this.props.user,
			tasks: this.props.user.tasks,
			num_of_tasks: this.props.user.tasks.length,
			showNotcompletedView: true,
			unfinished_count: 0,
			finished_count: 0,
		};
	},

	componentWillMount: function(){
		// console.log(this.state.user);
	},

	componentDidMount: function(){
		// console.log(this.props.user);
	},

	//task functions
	addTask: function(e){
		e.preventDefault();
		var entered_task = $(e.currentTarget).find('input.task-input');
		var this_val = entered_task.val();
		var task_len = this.state.tasks.length;
		var task = {
			id: ++task_len, 
			val: this_val,
			complete: false,
			priority: 'low'
		};

		//add task to list
		this.state.tasks.push(task);
		this.state.num_of_tasks = task_len;

		//reset form
		entered_task.val('');

		//save and re-render
		this.saveAndRerender();
	},
	permanentlyDeleteTask: function(task){
		this.state.tasks = _.reject(this.state.tasks, {id: task.id});
		this.saveAndRerender();
	},
	sortByPriority:function(tasks){
		var getHigh = _.filter(tasks, {priority: 'high'});
		var getMed = _.filter(tasks, {priority: 'medium'});
		var getLow = _.filter(tasks, {priority: 'low'});
		var newList = _.flatten([getHigh, getMed, getLow]);
		return newList;		
	},
	getUnfinished: function(){
		var unfinished = _.filter(this.state.tasks, {complete: false});
		this.state.unfinished_count = unfinished.length;
		return this.sortByPriority(unfinished);
	},
	getFinished: function(){
		var finished = _.filter(this.state.tasks, {complete: true});
		this.state.finished_count = finished.length;
		return this.sortByPriority(finished);
	},
	saveAndRerender:function(){
		this.saveChanges();
		this.setState({tasks: this.state.tasks});
	},

	//toggle list views
	toggleCompletedView: function(e){
		console.log(e.target);
		console.log(e.currentTarget);
		if( this.state.showNotcompletedView && e.target.id === 'c-nav' )
			this.setState({showNotcompletedView: !this.state.showNotcompletedView});
		else if( !this.state.showNotcompletedView && e.target.id == 'not-c-nav' )
			this.setState({showNotcompletedView: !this.state.showNotcompletedView});
	},

	getCompListClasses: function(){
		var classes = 'col-xs-6 text-center not-c';
		return this.state.showNotcompletedView ? classes += ' active' : classes;
	},

	getNotCompListClasses: function(){
		var classes = 'col-xs-6 text-center is-c';
		return !this.state.showNotcompletedView ? classes += ' active' : classes;
	},

	//save this user's info to local storage
	saveChanges: function(){
		zenefits.saveObject(this.state.user.id, this.state.user);
	},

	//num of complete/incomplete

	//render
	render: function(){
		var _this = this;
		var user = this.state.user;
		var finished = this.getFinished();
		var unfinished = this.getUnfinished();
		var emptyList = _.isEmpty(unfinished);
		var emptyCompletedList = _.isEmpty(finished);
		var compClasses = this.getCompListClasses();
		var notCompClasses = this.getNotCompListClasses();
		return (
			React.createElement("div", {className: "list-component"}, 
				React.createElement("div", {className: "list-header clearfix"}, 
					React.createElement("div", {className: "zenefits-header"}, 
						React.createElement("h2", null, "Zenefits ", React.createElement("small", null, "ToDo"))
					), 
					React.createElement("div", {className: "logout text-right"}, 
						React.createElement("a", {onClick: this.props.logout_function}, "Logout")
					), 
					React.createElement("div", {className: "clearfix"})
				), 

				React.createElement("div", {className: "welcome-container"}, 
					React.createElement("h3", null, "Welcome, ", user.name, "!"), 
					React.createElement("form", {onSubmit: this.addTask}, 
						React.createElement("input", {className: "task-input", type: "text", placeholder: "Enter a new task"})
					)
				), 

				React.createElement("div", {className: "container-fluid"}, 
					React.createElement("div", {className: "row nav-row"}, 
						React.createElement("div", {className: compClasses, onClick: this.toggleCompletedView}, 
							React.createElement("h4", null, React.createElement("a", {id: "not-c-nav"}, "Not completed"), " ", React.createElement("span", {className: "num"}, this.state.unfinished_count))
						), 
						React.createElement("div", {className: notCompClasses, onClick: this.toggleCompletedView}, 
							React.createElement("h4", null, React.createElement("a", {id: "c-nav"}, "Completed"), " ", React.createElement("span", {className: "num"}, this.state.finished_count))
						)
					)
				), 

					this.state.showNotcompletedView ?
					React.createElement("div", {className: "container-fluid task-list-container"}, 
						 
							!emptyList ? 
							unfinished.map(function(task) {
								return React.createElement(Task_Component, {key: task.id, task: task, saveAndRerender_function: _this.saveAndRerender, saveChanges_function: _this.saveChanges})
					        })
							: React.createElement("div", null, React.createElement("small", null, "This list is empty"))
						
					) :
					React.createElement("div", {className: "container-fluid task-list-container"}, 
						 
							!emptyCompletedList ? 
							finished.map(function(task) {
								return React.createElement(Task_Component, {key: task.id, task: task, deleteTask_function: _this.permanentlyDeleteTask, saveAndRerender_function: _this.saveAndRerender, saveChanges_function: _this.saveChanges})
					        })
							: React.createElement("div", null, React.createElement("small", null, "This list is empty"))
						
					), 
				

				React.createElement("div", {className: "by-adam-adams text-left"}, React.createElement("small", null, "By: Adam Adams"))
			)
		);
	}
});

var Task_Component = React.createClass({displayName: "Task_Component",
	getInitialState: function(){
		return {
			this_task: this.props.task,
			editing_on: false,
		};
	},

	completed: function(){
		this.props.task.complete = !this.props.task.complete;
		this.props.saveChanges_function();
		this.setState({this_task: this.props.task});
	},

	isDone: function(e){
		var elem = $(e.target).closest('.task-item').find('.val');
		var _this = this;

		if( !this.props.task.complete ){
			elem.addClass('complete');
			$(e.target).addClass('emphasize');
		}else{
			elem.removeClass('complete');
			$(e.target).addClass('emphasize');
		}

		this.props.task.complete = !this.props.task.complete;

		setTimeout(function(){
			_this.props.saveAndRerender_function();
		}, 500);
	},

	editTask: function(e){
		e.preventDefault();
		var new_val = $(e.currentTarget).find('input').val();
		this.props.task.val = new_val;
		this.toggleEditMode();
		this.props.saveChanges_function();
		this.setState({this_task: this.props.task});
	},

	deleteTask: function(){
		this.props.deleteTask_function(this.props.task);
	},

	updatePriority: function(){
		var this_pri = this.props.task.priority;	
		this.props.task.priority = this.priorityMap(this_pri);
		this.props.saveAndRerender_function();
	},

	priorityMap: function(new_priority){
		var priMap = {};
		priMap['low'] = 'medium';
		priMap['medium'] = 'high';
		priMap['high'] = 'low';

		return priMap[new_priority];
	},

	toggleEditMode: function(){
		this.setState({editing_on: !this.state.editing_on});
	},

	buildTaskItemClasses: function(){
		var taskItem = 'row task-item ';
		taskItem += this.getPriority();
		return taskItem;
	},

	buildValClasses: function(){
		var val = 'col-xs-12 val ';
		val = this.props.task.complete ? val += 'complete' : val;
		return val;
	},

	buildPriorityClasses: function(){
		var pri = 'col-xs-4 text-center options priority ';
		pri += this.getPriority();	

		return pri;
	},

	buildDoneClasses: function(){
		var done = 'col-xs-4 text-center options done ';
		done = this.props.task.complete ? done += 'emphasize': done;
		return done;
	},

	getPriority: function(){
		var pri = '';
		switch(this.props.task.priority){
			case 'low':
				pri = ' low';
				break;
			case 'medium':
				pri = ' medium';
				break;
			case 'high':
				pri = ' high';
				break;
		}
		return pri;
	},

	render: function(){
		var task_val = this.props.task.val;
		var valClasses = this.buildValClasses();
		var doneClasses = this.buildDoneClasses();
		var priorityClasses = this.buildPriorityClasses();
		var taskItemClasses = this.buildTaskItemClasses();

		return (
			React.createElement("div", {className: taskItemClasses, "data-task-id": this.props.task.id}, 
				React.createElement("div", {className: valClasses}, 
					 
						this.state.editing_on ? 
						React.createElement("form", {onSubmit: this.editTask}, 
							React.createElement("input", {type: "text", className: "edit-field", defaultValue: this.props.task.val})
						)
						: this.props.task.val
					
				), 
				
					!this.props.task.complete ?
					React.createElement("div", {onClick: this.updatePriority, className: priorityClasses}, this.props.task.priority) :
					React.createElement("div", {onClick: this.isDone, className: "col-xs-6 text-center options edit"}, "Restore"), 
				
				
					!this.props.task.complete ?
					React.createElement("div", {onClick: this.isDone, className: doneClasses}, "Done") :
					React.createElement("div", {onClick: this.deleteTask, className: "col-xs-6 text-center options done"}, "Delete"), 
				
				
					!this.props.task.complete ?
					React.createElement("div", {onClick: this.toggleEditMode, className: "col-xs-4 text-center options edit"}, "Edit") :
					null
				
				
			)
		);
	}
});

ReactDOM.render( React.createElement(ToDoAppComponent, null), document.getElementById('list-container') );