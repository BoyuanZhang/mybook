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

			//Insert every transaction in the list
			taskList.forEach( function(element, index) {
				client.query( "INSERT INTO cal_tasks ( userid, index, date, task, priority, complete, entrydate ) VALUES( $1, $2, $3, $4, $5, $6, $7)",
								[element.userid, element.index, element.date, element.task, element.priority, element.complete, element.entrydate],
								function( err, result ) { 
									if( err ) { 
										console.log( "An error has occured while inserting into cal_tasks. Error: " + err );
										return rollback(client)
									}
								});
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

//rollback operation for when an error occurs during update / inserts
var rollback = function( client ) {
	client.query( 'ROLLBACK', function() {
		//close connection
		client.end();
	});
};

module.exports.save = saveTasks;