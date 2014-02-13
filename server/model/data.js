var pg = require( 'pg.js'),
	paths = require( '../paths'),
	keys = require( paths().root + '/keyconfig' );

//connection string with credentials
var conStr = "postgres://"+keys.username+":"+keys.superPassword+"@"+keys.serverURL+"/"+keys.dbname;
function saveTasks( taskList ) {
	try {
		//save if the task save list has more than one modified item
		if( taskList.length > 0 )  {
			var client = new pg.Client( conStr );
			client.connect();

			//Insert every transaction in the list that has an objectid of -1
			taskList.forEach( function(element, index) {
				if( element.taskid == -1 ) {
					client.query( "INSERT INTO cal_tasks ( userid, index, date, task, priority, complete, entrydate ) VALUES( $1, $2, $3, $4, $5, $6, $7)",
									[element.userid, element.index, element.date, element.summary, element.priority, element.complete, element.entrydate],
									function( err, result ) { 
										if( err ) { 
											console.log( "An error has occured while inserting into cal_tasks. Error: " + err );
											return rollback(client)
										}
									});
				}
			});
			//Commit once all inserts and updates are completed
			client.query( 'COMMIT', client.end.bind( client) );
		}
	}
	catch( err ) {
		//log error
		console.log( err );
		//we can also throw the error back to the client if we choose to
		//or choose another way of informing the client of an error
		//throw err;
	}
};

function getTasks( date, callback ) {
	var test = new Date();
	console.log( test.getTime() );
	var client = new pg.Client(conStr);
	client.connect();
	var query = client.query("SELECT * FROM cal_tasks WHERE date = '" +date+"'");
	query.on( 'error', function( err ) {
		//handle the error case
		console.log( err );
		client.end();
	});
	query.on( 'row', function( row, result ) {
		result.addRow( row );
	});
	query.on('end', function(result ) {
		var taskList = [];
		//after query is over, put all tasks into a task list and send back to client
		result.rows.forEach( function(element, index ) {
			taskList.push( 
				{
					id : element.id,
					userid : element.userid,
					index : element.index,
					date : new Date(element.date).toUTCString(),
					summary : element.task,
					priority : element.priority,
					complete : element.complete
				});
		});
		client.end();
		console.log( test.getTime() );
		callback(taskList);
	});
};

//rollback operation for when an error occurs during update / inserts / deletes
var rollback = function( client ) {
	client.query( 'ROLLBACK', function() {
		//close connection
		client.end();
	});
};

module.exports.save = saveTasks;
module.exports.getTasks = getTasks;