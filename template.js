var child_process = require('child_process');

exports.description = 'Create a new Solidus site.';
exports.after = '\\o/ You did it!';
exports.warnOn = '*';

exports.template = function( grunt, init, done ){

	init.process({
		name: 'My Solidus Site'
	}, [
		init.prompt('name'),
		init.prompt('title')
	], function( err, properties ){

		var files = init.filesToCopy( properties );
		init.copyAndProcess( files, properties );

		grunt.util.spawn({
			cmd: 'npm',
			args: ['install'],
			opts: {
				stdio: 'inherit'
			},
		}, function( err, result, code ){
			done();
		});

	});

};