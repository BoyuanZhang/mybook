var calendarDefaults = {
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
};

var priorityDefaults = ['normal', 'low', 'high'];

rivets.configure({
	adapter: {
		subscribe: function (obj, keypath, callback) {
			watch(obj, keypath, callback)
		},
		unsubscribe: function (obj, keypath, callback) {
			unwatch(obj, keypath, callback)
		},
		read: function (obj, keypath) {
			return obj[keypath]
		},
		publish: function (obj, keypath, value) {
			obj[keypath] = value
		},
	}
})

function query(query){
	return document.querySelector(query);
}

function queryAll(query){
	return [].slice.call(document.querySelectorAll(query));
}

//Set variables used for this script,
//For first initialization, we go to current date,
//Selected date string to keep track of the date user is viewing / modifying
//User may only edit one task list at a time so we re-use the tasklist for each editing modal
//Get DOM handles to taskedit and taskview
var cal,
	currentDate = new Date(),
	selectedDate = {
		"string" : "",
		"day" : 0
	},
	taskSaveList = [],
	taskList = [],
	taskEdit = document.getElementById("taskEdit"),
	taskView = document.getElementById("taskView");
	
function DayFactory(dayofmonth, type) {
	var day = {
		dayOfMonth: dayofmonth,
		dayType : type
	}
	return day;
}

function TaskFactory(sum) {
	var task = {
		id : 0,
		complete: false,
		summary: sum,
		priority: priorityDefaults[0]
	}
	return task;
}

function Calendar(month, year) {
	//Are month and year valid?
	this.month = (isNaN(month) || month == null) ? currentDate.getMonth() : month;
	this.year = (isNaN(year) || year == null) ? currentDate.getFullYear() : year;
	this.weeks = [];
	for (var i = 1; i < 7; ++i) {
		this["daysInWeek" + i] = [];
		this.weeks.push(this["daysInWeek" + i]);
	}
};

Calendar.prototype.compileCalendar = function () {
	this.monthText = calendarDefaults.months[this.month];
	this.resetDays();

	var firstDayOfMonth = new Date(this.year, this.month, 1),
		startingDay = firstDayOfMonth.getDay(),
		monthLength = calendarDefaults.daysInMonth[this.month];

	//account for leap year
	if (this.month == 1) {
		if ((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0)
			monthLength = 29;
	}
	//we now need the length of the previous month, also account for leap year
	var prevMonthLength;
	if (this.month == 0)
		prevMonthLength = calendarDefaults.daysInMonth[11];
	else
		prevMonthLength = calendarDefaults.daysInMonth[this.month - 1];

	if (this.month == 2)
		if ((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0)
			prevMonthLength = 29;

	//take care of all pre month days, in week 1
	for (var i = 0; i < startingDay; i++)
		this.daysInWeek1.push(DayFactory(((prevMonthLength + 1) - (startingDay - i)), 'premonth'));

	var currentDay = 0,
		currentWeek = 0;

	while (currentDay < monthLength) {
		if ((currentDay + startingDay) % 7 == 0)
			currentWeek++;
		//check if the current day we are processing is equal to the current date
		//Don't forget to add 1 to the current day, since the current day is zero indexed
		if (currentDay + 1 == currentDate.getDate()) {
			//only set the current day cell if we, are in the current month/year
			if (this.month == currentDate.getMonth() && this.year == currentDate.getFullYear())
				this.weeks[currentWeek].push(DayFactory((currentDay + 1), 'currentday'));
			else
				this.weeks[currentWeek].push(DayFactory((currentDay + 1), 'day'));
		} else
			this.weeks[currentWeek].push(DayFactory((currentDay + 1), 'day'));

		currentDay++;
	}
};

Calendar.prototype.resetDays = function () {
	//clear all days in the current calendar
	for (var i = 0; i < this.weeks.length; i++) {
		while (this.weeks[i].length > 0)
			this.weeks[i].pop();
	}
};

function prevMonth() {
	//if current month is January, set it to December
	if (cal.month == 0) {
		cal.month = 11;
		cal.year -= 1;
	} else
		cal.month -= 1;

	cal.compileCalendar();
};

function nextMonth() {
	if (cal.month == 11) {
		cal.month = 0;
		cal.year += 1;
	} else
		cal.month += 1;

	cal.compileCalendar();
};

function today() {
	cal.month = currentDate.getMonth();
	cal.year = currentDate.getFullYear();

	cal.compileCalendar();
};

cal = new Calendar()

function init() {
	cal.compileCalendar();
};

function dayClickEvent(e) {
	//e is clicked element
	if (e.target && e.target.nodeName == "TD") {
		if (e.target.className == "day" || e.target.className == "currentday") {
			showTaskView(e.target.innerHTML);
		}
	}
};

function showSettings(){
	document.getElementById("settings").classList.toggle("active");
}
//Task save object
var taskSaveObj = {
	date : null,
	task : "",
	priority : "",
	complete : false,
	entrydate : null
};
//Save changes
function saveTaskList() {
	//Saves changes in the current task save list 
	if( taskSaveList.length > 0 ) {
		var xhr = new XMLHttpRequest();
		xhr.open( 'POST', '/save', true );
		xhr.setRequestHeader( 'Content-Type', 'application/json' );
		
		//Check for errors upon ready state changes
		xhr.onreadystatechange = function () {
			if( xhr.status == 404 ) {
				//request was not received, inform user of error.
				//figure out method of informing later
			}
		};
		xhr.send( JSON.stringify( taskSaveList ) );
	}
}

function showTaskView( day ) {
	taskView.classList.toggle("active");
	
	//if newly opened, we set the day / month / year in the header
	if( taskView.classList.contains("active") ) {
		selectedDate.string = day.toString() + " " + calendarDefaults.months[cal.month] + " " + cal.year;
		selectedDate.day = day;
	}
}

function showTaskEdit() {
	//Modal for the task edit and task view, should be different
	//Currently the two ways of opening edit mode, are to click the edit button, or to double click the view modal
	taskEdit.classList.toggle("active");
	
	//if the task edit modal was closed, we add the list if modified to a save object to be sent to the server,
	//and remove all elements from the task edit list
	if( !taskEdit.classList.contains("active")) {
		//get proper month and day strings in format ##
		var monthStr,
			dayStr;
		if( cal.month >= 9 )
			monthStr = (cal.month + 1).toString();
		else
			monthStr = '0' + (cal.month + 1 );
			
		if( selectedDate.day >= 10 )
			dayStr = selectedDate.day.toString();
		else
			dayStr = '0' + selectedDate.day;
		
		//before we begin saving empty out the current task save list
		while( taskSaveList.length > 0 )
			taskSaveList.pop();
		
		while( taskList.length > 0 ) {
			taskSaveObj = {
				date : cal.year.toString() + '/' + monthStr + '/' + dayStr,
				task : taskList[0].summary,
				priority : taskList[0].priority,
				complete : taskList[0].complete,
				entrydate : currentDate.toLocaleDateString()
			};
			taskSaveList.push( taskSaveObj );
			taskList.shift();
		}
		saveTaskList();
	}
}

function addTask() {
	//get task summary user entered, as well as priority of task
	var summary;
		
	for( var i = 0; i < taskEdit.childNodes.length; i++ ) {
		if( taskEdit.childNodes[i].className == "taskInput" ) {
			summary = taskEdit.childNodes[i].value;
			break;
		}
	}
	
	//set id of the new task so we can reference it in the future easily
	var item = TaskFactory(summary);
	var id = taskList.push( item ) - 1;
	item.id = id;
}

//remove item from our list 
function removeTaskEvent(e) {
	//get the ul node, then loop through each of it's children until you find 
	//the target child, then get its id (value)
	
	//This function should only be called after clicking a remove anchor inside of a list element
	var id = 0,
		list = e.target.parentNode,
		listParent = list.parentNode;
	
	//get the id 
	for( var i = 0; i < listParent.children.length; i++) {
		if( listParent.children[i].nodeName == "LI" ) {
			if( listParent.children[i] === list ) {
				id = parseInt(listParent.children[i].dataset.value);
				break;
			}
		}
	}
	
	//find and remove the item in our task list, while decrementing any current ids
	//larger than this id by 1, keep id's within range of the task list length
	var index = 0;
	for( var i = 0; i < taskList.length; i++) {
		if( taskList[i].id == id )
			index = i;
		else if( taskList[i].id > id )
			taskList[i].id--;
	}
	taskList.splice(index, 1);
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
	}
}

//bind rivets to calendar
rivets.binders.class = function(el, value){
	el.classList.add(value);
}
rivets.binders["on-enter"] = function(el,value){
	el.addEventListener("keypress",function (e) {
		var code = e.keyCode || e.which;
		if (code == 13 && !e.shiftKey) {
			if("call" in value)value.call(el,el,e);
			return false;
		}
	});
}
var binding = rivets.bind(document.body, {
	calendar: cal,
	daysInWeek: calendarDefaults.days,
	dayClick: dayClickEvent,
	selectedDate : selectedDate,
	tasks: taskList,
	priorities: priorityDefaults,
	removeTask : removeTaskEvent,
	dragTask: dragTask,
	handleDrag: handleDrag,
	relocateTask:relocateTask
});
