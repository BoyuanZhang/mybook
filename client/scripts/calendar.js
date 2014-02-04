var calendarDefaults = {
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
};

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

//For first initialization, we go to current date
var cal,
	currentDate = new Date();

function DayFactory(dayofmonth, type) {
	var day = {
		dayOfMonth: dayofmonth,
		dayType : type
	}
	return day;
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


		//get a handle to the DOM, so we may change the class of the pre month days, and the current day, also remember
		//the current row within the calendar starts at 2, to account for the current month header, and the days of the week
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
		if (e.target.className == "day" || e.target.className == "currentday")
			alert(e.target.innerHTML);
	}
};

function showSettings(){
	document.getElementById("settings").classList.toggle("active");
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
