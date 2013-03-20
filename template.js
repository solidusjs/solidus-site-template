exports.description = 'Create a new Solidus site.';
exports.after = '\\o/ You did it!';
exports.warnOn = '*';

exports.template = function( grunt, init, done ){

	var files = init.filesToCopy();
	init.copyAndProcess( files );
	done();

};