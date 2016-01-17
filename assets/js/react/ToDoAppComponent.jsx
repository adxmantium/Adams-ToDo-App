window.finito = {};

finito.saveObject = function(key, value){
	localStorage.setItem(key, JSON.stringify(value));
};

finito.getObject = function(key){
	var value = localStorage.getItem(key);
	return value && JSON.parse(value);
};

finito.clearStorage = function(){
	localStorage.clear();
};

var ToDoAppComponent = React.createClass({
	getInitialState: function(){
		return {
			showIntro: true,
			id: 1,
			users: [],
			activeUser: {},
		};
	},

	componentWillMount: function(){
		var hasFinito = finito.getObject('finito');

		//if null, create spot in localstorage for saving user info
		if( _.isNull(hasFinito) ){
			finito.saveObject('finito', this.state.users);
		}else{
			var next_id = hasFinito.length;
			
			//loop through storage to save existing users to array
			for( var i = 0; i < hasFinito.length; i++){
				this.state.users.push( hasFinito[i] );
			}

			// set up then next available id
			this.state.id = ++next_id;
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
		//save to localStorage
		this.saveChanges();
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
	saveChanges: function(){
		//save to localstorage
		finito.saveObject('finito', this.state.users);
	},

	//render
	render: function(){
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-xs-12">
				{ 
					this.state.showIntro ? 
					<Intro_Component users={this.state.users} toggleViews_function={this.toggleViews} existingToActiveUser_function={this.existingToActiveUser} /> : 
					<List_Component user={this.state.activeUser} saveChanges_function={this.saveChanges} logout_function={this.logout} /> 
				}
					</div>
				</div>
			</div>
		);
	}
});

var Intro_Component = React.createClass({
	getInitialState: function(){
		return {
			users: this.props.users,
		};
	},

	componentWillMount: function(){
		// console.log(this.props.users);
	},

	render: function(){
		var _this = this;
		var directions = "All we need to begin a new to-do list, is your name";
		return (
			<div className="createList-container">
				<div className="text-left">
					<h2>Welcome, to Finito <small>ToDo App</small>!</h2>
					<div>{directions}</div>
				</div>

				<form className="intro-form text-left" onSubmit={this.props.toggleViews_function}>
					<div className="input-group">
						<input type="text" className="form-control" placeholder="What's your name?" aria-describedby="basic-addon2" />
						<span className="input-group-addon" id="basic-addon2"><button>Create</button></span>
					</div>	
				</form>

				<div className="existing-users-container text-left">
					<div>Already created a list?</div>
					{
						_this.state.users.length > 0 ?
						_this.state.users.map(function(user){
							return <ExistingUsers_Component key={user.id} user={user} existingToActiveUser_function={_this.props.existingToActiveUser_function} />
						}) :
						<div><small>No existing lists</small></div>
					}
				</div>

				<div className="by-adam-adams text-left"><small>By: Adam Adams</small></div>

			</div>
		);
	}
});



//Existing Users Component
var ExistingUsers_Component = React.createClass({
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
			<div className="existing-user" onClick={this.setExistingToActive}>
				<div className="user-name">{this.props.user.name}</div>
				<div className="user-incompleted">Incomplete Tasks: <span className={this.state.highestPriority}>{num_of_incomplete}</span></div>
				<div className="user-completed"><small>Completed Tasks: {num_of_complete}</small></div>
				<div className="arrow">&#8250;</div>
			</div>	
		);	
	}
});




// -- List Component
var List_Component = React.createClass({
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
		this.state.user.tasks = this.state.tasks;
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
		this.props.saveChanges_function();
		this.setState({tasks: this.state.tasks});
	},

	//toggle list views
	toggleCompletedView: function(e){
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
	// saveChanges: function(){
	// 	finito.saveObject(this.state.user.id, this.state.user);
	// },

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
			<div className="list-component">
				<div className="list-header clearfix">
					<div className="finito-header">
						<h2>Finito <small>ToDo App</small></h2>
					</div>
					<div className="logout text-right">
						<a onClick={this.props.logout_function}>Logout</a>
					</div>
					<div className="clearfix"></div>
				</div>

				<div className="welcome-container">
					<h3>Welcome, {user.name}!</h3>
					<form onSubmit={this.addTask}>
						<input className="task-input" type="text" placeholder="Enter a new task" />
					</form>
				</div>

				<div className="container-fluid">
					<div className="row nav-row">
						<div className={compClasses} onClick={this.toggleCompletedView}>
							<h4><a id="not-c-nav">Not completed</a> <span className="num">{this.state.unfinished_count}</span></h4>
						</div>
						<div className={notCompClasses} onClick={this.toggleCompletedView}>
							<h4><a id="c-nav">Completed</a> <span className="num">{this.state.finished_count}</span></h4>
						</div>
					</div>
				</div>

				{	this.state.showNotcompletedView ?
					<div className="container-fluid task-list-container">
						{ 
							!emptyList ? 
							unfinished.map(function(task) {
								return <Task_Component key={task.id} task={task} saveAndRerender_function={_this.saveAndRerender} saveChanges_function={_this.props.saveChanges_function} />
					        })
							: <div><small>This list is empty</small></div>
						}
					</div> :
					<div className="container-fluid task-list-container">
						{ 
							!emptyCompletedList ? 
							finished.map(function(task) {
								return <Task_Component key={task.id} task={task} deleteTask_function={_this.permanentlyDeleteTask} saveAndRerender_function={_this.saveAndRerender} saveChanges_function={_this.saveChanges} />
					        })
							: <div><small>This list is empty</small></div>
						}
					</div>
				}

				<div className="by-adam-adams text-left"><small>By: Adam Adams</small></div>
			</div>
		);
	}
});

var Task_Component = React.createClass({
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
			<div className={taskItemClasses} data-task-id={this.props.task.id}>
				<div className={valClasses}>
					{ 
						this.state.editing_on ? 
						<form onSubmit={this.editTask}>
							<input type="text" className="edit-field" defaultValue={this.props.task.val} /> 
						</form>
						: this.props.task.val 
					}
				</div>
				{
					!this.props.task.complete ?
					<div onClick={this.updatePriority} className={priorityClasses}>{this.props.task.priority}</div> :
					<div onClick={this.isDone} className="col-xs-6 text-center options edit">Restore</div>
				}
				{
					!this.props.task.complete ?
					<div onClick={this.isDone} className={doneClasses}>Done</div> :
					<div onClick={this.deleteTask} className="col-xs-6 text-center options done">Delete</div>
				}
				{
					!this.props.task.complete ?
					<div onClick={this.toggleEditMode} className="col-xs-4 text-center options edit">Edit</div> :
					null
				}
				
			</div>
		);
	}
});

ReactDOM.render( <ToDoAppComponent />, document.getElementById('list-container') );