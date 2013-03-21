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
		done();

	});

};