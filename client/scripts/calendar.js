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

//Set variables used for this script,
//For first initialization, we go to current date,
//User may only edit one task list at a time so we re-use the tasklist for each editing modal
//Get DOM handles to taskedit and taskview
var cal,
	currentDate = new Date(),
	taskList = [],
	taskEdit = document.getElementById("taskEdit");

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
			showTaskView();
			alert(e.target.innerHTML);
		}
	}
};

function showSettings(){
	document.getElementById("settings").classList.toggle("active");
}

function showTaskView() {
	document.getElementById("taskView").classList.toggle("active");
}

function showTaskEdit() {
	//Modal for the task edit and task view, should be different
	//Currently the two ways of opening edit mode, are to click the edit button, or to double click the view modal
	taskEdit.classList.toggle("active");
	
	//if the task edit modal was closed, we remove all elements from the task edit list
	while( taskList.length > 0 )
		taskList.pop();
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

//Save changes
function applyTaskList() {

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

//bind rivets to calendar
rivets.binders.class = function(el, value){
	el.classList.add(value);
}
rivets.bind(
	document.getElementById('calendarTable'), {
		calendar: cal,
		daysInWeek: calendarDefaults.days,
		dayClick: dayClickEvent
	}
);

rivets.bind(
	taskEdit, {
		tasks: taskList,
		priorities: priorityDefaults,
		removeTask : removeTaskEvent
	}
);


