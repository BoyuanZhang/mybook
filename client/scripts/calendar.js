var calendarDefaults = {
	days : ['Monday', 'Tuesday','Wednesday', 'Thursday','Friday', 'Saturday', 'Sunday'],
	months: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],		
	daysInMonth : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
};

//For first initialization, we go to current date
var cal,
	currentDate = new Date();

function calendar( month, year) {
	//Are month and year valid?
	this.month = (isNaN(month) || month == null ) ? currentDate.getMonth() : month;
	this.year = (isNaN(year) || year == null ) ? currentDate.getFullYear() : year;
	this.calendarHTML = "";
}

calendar.prototype.compileCalendarHTML = function() {
	var firstDayOfMonth = new Date(this.year, this.month, 1);
	var startingDay = firstDayOfMonth.getDay();
	
	var monthLength = calendarDefaults.daysInMonth[ this.month];
	
	//account for leap year
	if( currentDate.getMonth == 1 ){
		if( ( this.year % 4 == 0 && this.year % 100!= 0) || this.year % 400 == 0 )
			monthLength = 29;
	}
	
	var monthName = calendarDefaults.months[ this.month ];
	
	//Build calendar header html
	var headerCalendarHTML = "<table class='calendar'> <tr class='currentmonth'>" +
							"<th class = 'prevmonth' onclick = 'prevMonth()'> Previous </th>" +
							"<th class = 'month'>" + monthName +" "+ this.year +"</th>"+
							"<th class = 'nextmonth' onclick = 'nextMonth()'> Next </th></tr>";
							
	//Add today cell
	headerCalendarHTML += "<tr class = 'currentmonth'><th class = 'today' onclick = 'today()'>Today</th></tr>";
							
	headerCalendarHTML +="<tr class='daysofweek'>";
	for( var i = 0; i < 7; i++ )
		headerCalendarHTML+= "<td>" +calendarDefaults.days[i] +"</td>";
	headerCalendarHTML+= "</tr>";
	
	//Build inner calendar html
	//keep track of the current day,
	var innerCalendarHTML = "",
		currentDay = 0;
		
	//Fill in cells not part of the current month in the first row
	for( var i = 0; i < startingDay; i++)
		innerCalendarHTML += "<td class='premonth'>" + (32 - (startingDay - i)) + "</td>";
	
	while( currentDay < monthLength )
	{
		if( (currentDay+startingDay) % 7 == 0 )
			innerCalendarHTML += "</tr><tr>";
		
		//check if the current day we are processing is equal to the current date
		//Don't forget to add 1 to the current day, since the current day is zero indexed
		if( currentDay+1 == currentDate.getDate() ) {
			//only set the current day cell if we, are in the current month/year
			if( this.month == currentDate.getMonth() && this.year == currentDate.getFullYear() )
				innerCalendarHTML += "<td class='currentday'>"+(currentDay+1)+"</td>";
			else
				innerCalendarHTML += "<td class = 'day'>"+(currentDay+1)+"</td>";
		}
		else
			innerCalendarHTML += "<td class = 'day'>"+(currentDay+1)+"</td>";
			
		currentDay++;
	}
	
	//Finnished with the inner calendar, time to put it all together
	
	this.calendarHTML = headerCalendarHTML;
	this.calendarHTML += "<tr>";
	this.calendarHTML += innerCalendarHTML;
	this.calendarHTML += "</tr></table>";
};

calendar.prototype.getCalendar = function() {
	if( this.calendarHTML )
		return this.calendarHTML;
	else
		return "";
}

//getter's for the current month, current year
calendar.prototype.getMonth = function() {
	var month = (isNaN(this.month) || this.month == null ) ? currentDate.getMonth() : this.month;
	
	return month;
}

calendar.prototype.getYear = function() {
	var year = (isNaN(this.year) || this.year == null ) ? currentDate.getFullYear() : this.year;
	
	return year;
}

//Initialization call from client browser, this should only be called once per page load
function init() {
	cal = new calendar();
	compileAndShow();
};

function prevMonth() {
	//check for edge case
	var currentMonth = cal.getMonth(),
		currentYear = cal.getYear();
	//if current month is January, set it to December
	if( currentMonth == 0 ) {
		currentMonth = 11;
		currentYear -= 1;
	}
	else
		currentMonth -= 1;
		
	cal = new calendar( currentMonth, currentYear );
	compileAndShow();
};

function nextMonth() {
	//check for edge case
	var currentMonth = cal.getMonth(),
		currentYear = cal.getYear();
	
	if( currentMonth == 11 ) {
		currentMonth = 0;
		currentYear += 1;
	}
	else
		currentMonth += 1;
		
	cal = new calendar( currentMonth, currentYear );
	compileAndShow();
};

function today() {
	var currentMonth = currentDate.getMonth(),
		currentYear = currentDate.getFullYear();
	
	cal = new calendar( currentMonth, currentYear );
	compileAndShow();
}

function compileAndShow()
{
	cal.compileCalendarHTML();
	document.getElementById( 'calendar' ).innerHTML = cal.getCalendar();
}