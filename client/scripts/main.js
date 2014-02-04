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
