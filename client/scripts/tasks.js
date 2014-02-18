//User may only edit one task list at a time so we re-use the tasklist for each editing modal
//Get DOM handles to taskedit
//Cache for task lists for certain dates

var taskList = [],
	taskEdit = document.getElementById("taskEdit"),
	taskCache = [];

function TaskFactory(sum, taskid) {
	var task = {
		//taskid represents the id of the task within the db
		//id is the unique identifier of the task in the array since index can't be trusted
		taskid : taskid,
		id : 0,
		complete: false,
		summary: sum,
		priority: priorityDefaults[0]
	}
	return task;
}

//Task save object
var taskSaveObj = {
	id : 0,
	index : 0,
	date : null,
	summary : "",
	priority : "",
	complete : false,
	entrydate : null
};

function showTaskEdit(day) {
	//Modal for the task edit and task view, should be different
	//Currently the two ways of opening edit mode, are to click the edit button, or to double click the view modal
	taskEdit.classList.toggle("active");
	
	//if the task edit modal was closed, we remove all elements from the task edit list
	if( !taskEdit.classList.contains("active")) {	
		while( taskList.length > 0 ) {
			taskList.shift();
		}
	}
	else {
		//otherwise if task editor was open, we set the current selected day
		selectedDate.string = day.toString() + " " + calendarDefaults.months[cal.month] + " " + cal.year;
		selectedDate.day = day;
		//check our cache, if the data is in there, we just use the cache. Otherwise we retrieve from the db
		if( taskCache[selectedDate.string] ) {
			taskCache[selectedDate.string].forEach( function( element, index ) {
				taskList.push(element);
			});
		}
		else {
			//retrieve task lists for this date from db
			var xhr = new XMLHttpRequest(),
				tasks,
				queryStr = '/ret?date='+getSelectedDateStr();
			xhr.open( "GET", queryStr, "true" );
			xhr.onreadystatechange = function(){
				if( xhr.readyState == 4 && xhr.status == 200) {
					tasks = JSON.parse(xhr.responseText);
					if( tasks.length > 0 ) {
						tasks.forEach( function( element, index ) {
							// ensure an objectid (taskid) has been set, if not we set the objectid to -1
							if( typeof element.id === 'undefined' )
								element.id = -1;
							var item = TaskFactory( element.summary, element.id );
							item.id = taskList.length+1;
							item.priority = element.priority;
							item.complete = element.complete;
							item.originalIndex = element.index;

							taskList.push( item );
						});
						//sort the taskList
						taskList.sort( taskIndexCompare );
						//save taskList items into our cache for the selectedDate
						taskCache[selectedDate.string] = [];
						taskList.forEach( function( element, index ) {
							taskCache[selectedDate.string].push(element);
						});
					}
				}
			}
			xhr.send();
		}
	}
}

function addTask() {
	//get task summary user entered, as well as priority of task
	var summary = query("#taskEdit .taskInput").value;
	
	//set id of the new task so we can reference it in the future easily
	var item = TaskFactory(summary, -1);
	var index = taskList.length;
	
	taskSaveObj = {
		taskid : item.taskid,
		userid : 0,
		index : index,
		date : getSelectedDateStr(),
		summary : item.summary,
		priority : item.priority,
		complete : item.complete,
		entrydate : currentDate.toUTCString()
	};
	
	var xhr = new XMLHttpRequest();
	xhr.open( 'POST', '/addTask', true );
	xhr.setRequestHeader( 'Content-Type', 'application/json' );
	
	xhr.onreadystatechange = function () {
		if( xhr.readyState == 4 && xhr.status == 200 ) {
			//Only if the xhr was successful, and the taskid returned is not -1, do we add the task to the users task list
			//otherwise we provide an error message for the user
			var taskidObj = JSON.parse(xhr.responseText);
			if( taskidObj ) {
				//if taskidobj exists we add the new task to our task list for the selected day
				item.taskid = taskidObj.id;
				var id = taskList.push( item );
				item.id = id;
			}
			else {
				//display error message telling user the task was unable to be saved
			}
		}
	}
	xhr.send(JSON.stringify( taskSaveObj ) );
	
	//Remove this task list from the cache after the new task is added
	if( taskCache[selectedDate.string] )
		delete taskCache[selectedDate.string];
}

function getTaskObj( id ) {
	var task,
		index;
		
	for( var i = 0; i < taskList.length; i++ ) {
		if( taskList[i].id === id ) {
			task = taskList[i];
			index = i;
			break;
		}
	}
	var taskObj = {
		task : task,
		index: index
	}
	
	return taskObj;
}

function taskSummaryChanged(e) {
	var id = parseInt(this.parentNode.dataset.value);
	var taskObj = getTaskObj(id); 
	taskObj.task.summary = this.textContent;
	saveTask( taskObj );
}

function taskPriorityChanged(e) {
	var id = parseInt(this.parentNode.dataset.value);
	var taskObj = getTaskObj(id); 
	taskObj.task.priority = this.value;
	saveTask( taskObj );
}
	
function taskCompleteChanged(e) {
	var id = parseInt(this.parentNode.dataset.value);
	var taskObj = getTaskObj(id); 
	taskObj.task.complete = this.checked;
	saveTask( taskObj );
}

//Save changes to task 
function saveTask(taskObj) {
	var task = taskObj.task,
		index = taskObj.index;
	
	taskSaveObj = {
		taskid : task.taskid,
		userid : 0,
		index : index,
		date : getSelectedDateStr(),
		summary : task.summary,
		priority : task.priority,
		complete : task.complete,
		entrydate : currentDate.toUTCString()
	};
	
	var xhr = new XMLHttpRequest();
	xhr.open( 'POST', '/saveTask', true );
	xhr.setRequestHeader( 'Content-Type', 'application/json' );
	
	xhr.onreadystatechange = function() {
		if( xhr.status == 404 ) {
			//request was not received, inform user that the update did not happen
			//figure out method / and status code for informing later
		}
	}
	
	xhr.send( JSON.stringify( taskSaveObj ) );
	
	//Remove this task list from the cache after a task has been updated
	removeCachedTaskList();
}

function updateTaskListIndicies( index ) {
	
	var indexUpdateList = [];
	for( var i = index; i < taskList.length; i++ )
		indexUpdateList.push( {taskid : taskList[i].taskid, index : i } );
	
	if( indexUpdateList.length > 0 ) 
	{
		var xhr = new XMLHttpRequest();
		xhr.open( 'POST', '/updateTaskIndexes', true );
		xhr.setRequestHeader( 'Content-Type', 'application/json' );
		
		xhr.onreadystatechange = function() {
			if( xhr.status == 404 ) {
				//request was not received, inform user that the update did not happen
				//figure out method / and status code for informing later		
			}
		}
		
		xhr.send( JSON.stringify( indexUpdateList ) );
		
		//Remove this task list from the cache after one or more task indexes have been updated
		removeCachedTaskList();
	}
}

//remove item from our list 
function removeTaskEvent(e) {
	//get the ul node, then loop through each of it's children until you find 
	//the target child, then get its id (value)
	
	//This function should only be called after clicking a remove anchor inside of a list element
	var id = 0,
		list = e.target.parentNode,
	
	//get the id 
	id = list.dataset.value;
	
	//find and remove the item in our task list, while decrementing any current ids
	//larger than this id by 1, keep id's within range of the task list length
	var index = 0;
	for( var i = 0; i < taskList.length; i++) {
		if( taskList[i].id == id )
			index = i;
		else if( taskList[i].id > id )
			taskList[i].id--;
	}
	if( taskList[index].taskid != -1 ) {
		//after removal, don't forget to remove task from our cache, or remove the entire tasklist for this selecteddate from the cache (Not decided yet)
		var xhr = new XMLHttpRequest();
		xhr.open( 'POST', '/delete', true );
		xhr.setRequestHeader( 'Content-Type', 'application/json');
		
		xhr.onreadystatechange = function() {
			if( xhr.status == 404 ) {
				//request was not received, inform user of error
			}
		};
		//TODO:
		//When deleting an item, if that item was not in the last index
		//all indexes above this index must be decremented by 1 and updated on the server.
		var indexUpdateList = [];
		if( index < taskList.length -1 ) {
			for( var i = index+1; i < taskList.length; i++ )
				indexUpdateList.push( {taskid : taskList[i].taskid, index : i-1 } );
		}
		
		//send the id that needs to be deleted
		xhr.send( JSON.stringify( {id: taskList[index].taskid, indexUpdateList: indexUpdateList} ) );
	}
	taskList.splice(index, 1);
	//remove tasks for this date from cache when an item has been deleted
	removeCachedTaskList();
}

var dragData = {
	element: null,
	divider: null,
	mouse: 0,
	offset: 0
}

function recursiveOffsetLeft(element){
	if(!element)return 0;
	var par = element.offsetParent;
	return element.offsetLeft + (par ? recursiveOffsetLeft(par) : 0);
}

function recursiveOffsetTop(element){
	if(!element)return 0;
	var par = element.offsetParent;
	return element.offsetTop + (par ? recursiveOffsetTop(par) : 0);
}

function dragTask(e){
	var tasks = queryAll(".task");
	dragData = {
		element:this,
		index: tasks.indexOf(this),
		divider:null,
		mouse:e.pageY,
		offset: e.pageY - this.offsetTop,
		x: recursiveOffsetLeft(this)
	};
}

function taskIndex(y){
	var tasks = queryAll(".task");
	var index;
	tasks.forEach(function(el,i){
		if(
			el !== dragData.element &&
			y > recursiveOffsetTop(el) &&
			y < recursiveOffsetTop(el)+el.offsetHeight
		) index = i;
	});
	if(typeof index === "number"){
		return index;
	} else {
		var index = tasks.length-1;
		var last = tasks[index];
		if(last === dragData.element)last = tasks[index--];
		return last && y > recursiveOffsetTop(last) ? index : 0;
	}
}

function taskAt(index){
	return queryAll(".task")[index];
}

function newTaskY(e,el){
	return e.pageY - el.offsetHeight /2;
}

function handleDrag(e){
	var el = dragData.element;
	if(el){
		var rep = query(".task.active");
		if(rep)rep.classList.remove("active");
		var index = taskIndex(e.pageY);
		rep= taskAt(index);
		if(rep)rep.classList.add("active");
		el.style.position = "fixed";
		el.style.top = newTaskY(e,el) + "px";
		el.style.left = dragData.x + "px";
	}
}

function relocateTask(e){
	function moveTask(from, to) {
		if( to === from ) return;
		
		var target = taskList[from];
		var increment = to < from ? -1 : 1;
		
		for(var k = from; k != to; k += increment){
		taskList[k] = taskList[k + increment];
		}
		taskList[to] = target;
		taskList.push({});
		taskList.pop();
	}
	
	var el = dragData.element;
	if(el){
		dragData.element = null;
		var index = queryAll(".task").indexOf(query(".task.active"));
		//no active task
		if( index == -1 )
			return;
		
		queryAll(".task.active").forEach(function(e){
				e.classList.remove("active")});
		moveTask(dragData.index,index);
		el.style.position = "static";
		
		//Now we need to update all relevent indexes in the database, from the
		//newly inserted index
		if( dragData.index != index ) {
			updateTaskListIndicies( index );
		}
	}
}

function updateTaskContents(e){
	var id = parseInt(this.parentNode.dataset.value);
	var task;
	taskList.forEach(function(t){
		if(t.id === id)task = t;
	});
	task.summary = this.textContent;
}

function taskIndexCompare( a, b ) {
	if( a.originalIndex > b.originalIndex )
		return 1;
	else if ( a.originalIndex < b.originalIndex )
		return -1;
	else 
		return 0;
}

function removeCachedTaskList() {
	if( taskCache[selectedDate.string] )
		delete taskCache[selectedDate.string];
}