var calendarDefaults = {
	days : ['Sunday', 'Monday','Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday'],
	months: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],		
	daysInMonth : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
};

rivets.configure( {
	adapter: {
		subscribe: function(obj, keypath, callback){
			watch( obj, keypath, callback )
		},
		unsubscribe: function( obj, keypath, callback){
			unwatch( obj, keypath, callback)
		},
		read: function(obj, keypath){
			return obj[keypath]
		},
		publish: function(obj, keypath, value){
			obj[keypath] = value
		},
	}
})

//For first initialization, we go to current date
var cal,
	currentDate = new Date();

function DayFactory( inmonth, dayofmonth, iscurrentday )  {
	var day = {
		dayOfMonth : dayofmonth,
		inMonth : inmonth,
		isCurrentDay : iscurrentday
	}	
	return day;
}
	
function Calendar( month, year) {
	//Are month and year valid?
	this.month = (isNaN(month) || month == null ) ? currentDate.getMonth() : month;
	this.year = (isNaN(year) || year == null ) ? currentDate.getFullYear() : year;
	this.daysInWeek1 = new Array();
	this.daysInWeek2 = new Array();
	this.daysInWeek3 = new Array();
	this.daysInWeek4 = new Array();
	this.daysInWeek5 = new Array();
	this.daysInWeek6 = new Array();
	
	//container to index all the weeks for cleaner traversals of week rows
	this.weeks = [ this.daysInWeek1, this.daysInWeek2, this.daysInWeek3, this.daysInWeek4, this.daysInWeek5, this.daysInWeek6];
};

Calendar.prototype.compileCalendar = function() {
	this.monthText = calendarDefaults.months[this.month];
	this.resetDays();

	var firstDayOfMonth = new Date(this.year, this.month, 1),
		startingDay = firstDayOfMonth.getDay(),
		monthLength = calendarDefaults.daysInMonth[ this.month];
	
		//account for leap year
	if( this.month == 1 ){
		if( ( this.year % 4 == 0 && this.year % 100!= 0) || this.year % 400 == 0 )
			monthLength = 29;
	}
	//we now need the length of the previous month, also account for leap year
	var prevMonthLength;
	if( this.month == 0 )
		prevMonthLength = calendarDefaults.daysInMonth[ 11 ];
	else
		prevMonthLength = calendarDefaults.daysInMonth[ this.month - 1];
		
	if( this.month == 2 )
		if( ( this.year % 4 == 0 && this.year % 100!= 0) || this.year % 400 == 0 )
			prevMonthLength = 29;

		
	//get a handle to the DOM, so we may change the class of the pre month days, and the current day, also remember
	//the current row within the calendar starts at 2, to account for the current month header, and the days of the week
	var calendarTable = document.getElementById('calendarTable');
	//take care of all pre month days, in week 1
	for( var i = 0; i < startingDay; i++) {
		this.daysInWeek1.push( DayFactory( false, ((prevMonthLength +1) - (startingDay - i))) );
		calendarTable.rows[2].cells[i].className = 'premonth';
	}

	var currentDay = 0,
		currentWeek = 0;

	while( currentDay < monthLength )
	{
		if( (currentDay+startingDay) % 7 == 0 )
			currentWeek++;
		//check if the current day we are processing is equal to the current date
		//Don't forget to add 1 to the current day, since the current day is zero indexed
		if( currentDay+1 == currentDate.getDate() ) {
			//only set the current day cell if we, are in the current month/year
			if( this.month == currentDate.getMonth() && this.year == currentDate.getFullYear() ) {
				this.weeks[currentWeek].push( DayFactory( true, (currentDay+1), true));
				calendarTable.rows[2+currentWeek].cells[((currentDay + startingDay) % 7)].className = 'currentday';
			}
			else
				this.weeks[currentWeek].push( DayFactory( true, (currentDay+1)));
		}
		else
			this.weeks[currentWeek].push( DayFactory( true, (currentDay+1)));
			
		currentDay++;
	}
};

Calendar.prototype.resetDays = function() {
	//clear all days in the current calendar
	for( var i = 0; i < this.weeks.length; i++) {
		while( this.weeks[i].length > 0 )
			this.weeks[i].pop();
	}
};

function prevMonth() {
	//if current month is January, set it to December
	if( cal.month == 0 ) {
		cal.month = 11;
		cal.year -= 1;
	}
	else
		cal.month -= 1;
		
	cal.compileCalendar();
};

function nextMonth() {
	if( cal.month == 11 ) {
		cal.month  = 0;
		cal.year += 1;
	}
	else
		cal.month  += 1;
	
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
	// addEventDelegates();
};

function addEventDelegates() {
	document.getElementById( 'calendarTable' ).addEventListener( "click", dayClickEvent );
};

function dayClickEvent(e) {
	//e is clicked element
	if( e.target && e.target.nodeName == "TD" ) {
		if( e.target.className == "day" || e.target.className == "currentday" )
			alert(e.target.innerHTML);
	}
};

//bind rivets to calendar
rivets.bind(
	document.getElementById( 'calendarTable' ),
	{
		calendar : cal,
		daysInWeek : calendarDefaults.days,
		dayClick: dayClickEvent
	}
);
