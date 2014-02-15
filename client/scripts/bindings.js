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
	relocateTask:relocateTask,
	updateTaskContents:updateTaskContents,
	taskSummaryChanged:taskSummaryChanged,
	taskPriorityChanged:taskPriorityChanged,
	taskCompleteChanged:taskCompleteChanged
});