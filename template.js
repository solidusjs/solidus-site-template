var child_process = require('child_process');

exports.description = 'Create a new Solidus site.';
exports.after = '\\o/ You did it!';
exports.warnOn = '*';

exports.template = function( grunt, init, done ){

	init.process({
		name: 'My Solidus Site'
	}, [
		init.prompt('name')
	], function( err, properties ){

		var files = init.filesToCopy( properties );
		init.copyAndProcess( files, properties );

		// install node modules
		var install_process = child_process.spawn( 'npm', ['install'], {
			stdio: 'inherit'
		});
		install_process.on( 'close', function(){
			done();
		});

	});

};