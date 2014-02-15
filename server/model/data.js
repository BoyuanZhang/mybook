var pg = require( 'pg.js'),
	paths = require( '../paths'),
	keys = require( paths().root + '/keyconfig' );

//connection string with credentials
var conStr = "postgres://"+keys.username+":"+keys.superPassword+"@"+keys.serverURL+"/"+keys.dbname;
function addTask( task, callback ) {
	//save if the task save list has more than one modified item
	if(task)  {
		var client = new pg.Client( conStr );
		client.connect();

		//Insert if task has a taskid of -1 (It should never, ever be -1)
		if( task.taskid == -1 ) {
			var query = client.query( "INSERT INTO cal_tasks ( userid, index, date, task, priority, complete, entrydate ) VALUES( $1, $2, $3, $4, $5, $6, $7) RETURNING id",
							[task.userid, task.index, task.date, task.summary, task.priority, task.complete, task.entrydate] );
			query.on( 'error', function( err ) {
				console.log( "There was an error inserting into cal_tasks. " + err );
				return rollback( client );
			});
			query.on( 'row', function( row, result ) {
				result.addRow( row );
			});
			query.on('end', function( result ) {
				//Commit once all inserts and updates are completed, then call callback with the id of the latest insert
				//should always be in position 0
				client.query( 'COMMIT', client.end.bind( client) );
				callback( result.rows[0] );
			});
		}
		else {
			//just close the client connection. No need to rollback because no action was performed on our db
			client.end();
		}
	}
};

function saveTask( task ) {
	if( task ) {
		var client = new pg.Client( conStr );
		client.connect();
		
		//make sure the taskid is not -1 ( an id of -1 is a task that has not been saved in our db )
		if( task.taskid != -1 ) {
			client.query( "UPDATE cal_tasks SET index = $1, task = $2, priority = $3, complete = $4, entrydate = $5 WHERE id = $6",
				[task.index, task.summary, task.priority, task.complete, task.entrydate, task.taskid],
				function( err ) {
					if( err ) {
						console.log( "An error has occured while updating into cal_tasks. Error: " + err );
						return rollback(client);
					}
				});
		}
		else {
			client.end();
		}
		
		client.query( 'COMMIT', client.end.bind( client) );
	}
}

function getTasks( date, callback ) {
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
		callback(taskList);
	});
};

function removeTask( idContainer ) {
	var client = new pg.Client(conStr);
	client.connect();
		client.query( "DELETE FROM cal_tasks WHERE id = $1", [idContainer.id], function( err, result ) {
			if( err ) {
				console.log( "An error has occured while deleting from cal_tasks. Error: " + err );
				return rollback(client);
			}
		});
	//Commit once delete is complete
	client.query( 'COMMIT', client.end.bind( client) );		
}

//rollback operation for when an error occurs during update / inserts / deletes
var rollback = function( client ) {
	client.query( 'ROLLBACK', function() {
		//close connection
		client.end();
	});
};

module.exports.addTask = addTask;
module.exports.saveTask = saveTask;
module.exports.getTasks = getTasks;
module.exports.removeTask = removeTask;