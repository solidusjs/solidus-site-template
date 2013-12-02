var path = require('path');

module.exports = function( grunt ){

	var pkg = grunt.file.readJSON( __dirname +'/package.json');
	var solidus_port = grunt.option('port') || grunt.option('p');
	var livereload_port = grunt.option('livereloadport') || grunt.option('r');

	grunt.initConfig({
		pkg: pkg,
		sass: {
			styles: {
				options: {
					lineNumbers: true,
					style: 'expanded'
				},
				files: [{
					src: ['assets/styles/index.scss'],
					dest: 'assets/styles/index_compiled.css' 
				}]
			}
		},
		cssjoin: {
			styles: {
				files: {
					'assets/compiled/styles.css': ['assets/styles/index_compiled.css']
				}
			}
		},
		cssmin: {
			styles: {
				files: {
					'assets/compiled/styles.css': ['assets/styles/index_compiled.css']
				}
			}
		},
		clean: {
			styles: ['assets/styles/index_compiled.css'],
			predeploy: ['deploy/']
		},
		handlebars: {
			compile: {
				options: {
					namespace: 'solidus.templates',
					partialRegex: /.*/,
					partialsUseNamespace: true,
					processName: function( template_path ){
						return template_path.replace( /(^views\/)|(\.hbs)/ig, '' );
					},
					processPartialName: function( partial_path ){
						return partial_path.replace( /(^views\/)|(\.hbs)/ig, '' );
					}
				},
				files: {
					'assets/compiled/templates.js': ['views/**/*.hbs']
				}
			}
		},
		concat: {
			templates: {
				files: {
					'assets/compiled/templates.js': ['node_modules/grunt-contrib-handlebars/node_modules/handlebars/dist/handlebars.runtime.js','assets/compiled/templates.js']
				}
			},
			scripts: {
				files: {
					'assets/compiled/scripts.js': ['node_modules/grunt-contrib-requirejs/node_modules/requirejs/require.js','assets/compiled/scripts.js']
				}
			}
		},
		requirejs: {
			scripts: {
				options: {
					baseUrl: 'assets/scripts/',
					out: 'assets/compiled/scripts.js',
					name: 'index',
					preserveLicenseComments: false,
					generateSourceMaps: true,
					optimize: 'uglify2'
				}
			}
		},
		uglify: {
			templates: {
				files: {
					'assets/compiled/templates.js': ['assets/compiled/templates.js']
				}
			}
		},
		copy: {
			predeploy: {
				files: [
					{expand: true, src: '*', filter: 'isFile', dot: true, dest: 'deploy/'},
					{expand: true, src: ['assets/**','preprocessors/**','views/**'], dot: true, dest: 'deploy/'}
				]
			}
		},
		filerev: {
			assets: {
				src: ['deploy/assets/**/*.*','!deploy/assets/**/*.{css,scss,js}']
			},
			styles: {
				src: 'deploy/assets/compiled/styles.css'
			},
			scripts: {
				src: 'deploy/assets/compiled/scripts.js'
			},
			templates: {
				src: 'deploy/assets/compiled/templates.js'
			}
		},
		watch: {
			livereload: {
				files: ['assets/compiled/styles.css'],
				options: {
					livereload: livereload_port || true
				}
			},
			styles: {
				files: ['assets/styles/**/*.scss','assets/styles/**/*.css','assets/styles/**/*.sass','!assets/styles/index_compiled.css'],
				tasks: ['compilecss']
			},
			templates: {
				files: ['views/**/*.hbs'],
				tasks: ['compilehbs']
			},
			scripts: {
				files: ['assets/scripts/**/*.js'],
				tasks: ['compilejs']
			}
		},
		'replace-asset-urls': {
			files: {
				src: ['deploy/assets/compiled/*.{css,js}','deploy/views/**/*.hbs']
			}
		}
	});
	
	// The cool way to load Grunt tasks
	// https://github.com/Fauntleroy/relay.js/blob/master/Gruntfile.js
	Object.keys( pkg.devDependencies ).forEach( function( dep ){
		if( dep.substring( 0, 6 ) === 'grunt-' ) grunt.loadNpmTasks( dep );
	});

	grunt.registerTask( 'server', 'Start the Solidus server', function(){
		var solidus = require('solidus');
		solidus.start({
			port: solidus_port,
			dev: true,
			livereload_port: livereload_port
		});		
	});

	grunt.registerMultiTask( 'replace-asset-urls', function(){
		// TODO: optimize this, make it more readable, make sure it handles relative paths and
		// partial paths (for example 'some/font.eot' should match 'some/font.eot?#iefix' but not 'awesome/font.eot')
		// We should probably move this task in a dedicated file, and write some unit tests.
		this.files[0].src.forEach( function( src ){
			var contents = grunt.file.read( src );
			var changes = new Array();
			for( var url in grunt.filerev.summary ){
				var rev_url = grunt.filerev.summary[url].replace( 'deploy'+ path.sep +'assets'+ path.sep, '' );
				var url_regex = new RegExp( url.replace( 'deploy'+ path.sep +'assets'+ path.sep, '' ), 'ig' );
				var length = contents.length;
				contents = contents.replace( url_regex, rev_url );
				if( contents.length != length ) changes.push( '  '+ url_regex +' changed to '.grey+ rev_url );
			}
			grunt.file.write( src, contents );

			if( changes.length > 0 ){
				console.log( '✔'.green, src );
				for( var i in changes ) console.log( changes[i] );
			}
		});
	});

	grunt.registerTask( 'default', ['compile'] );
	grunt.registerTask( 'compile', ['compilecss','compilehbs','compilejs'] );
	grunt.registerTask( 'compilehbs', ['handlebars','concat:templates','uglify:templates'] );
	grunt.registerTask( 'compilejs', ['requirejs','concat:scripts'] );
	grunt.registerTask( 'compilecss', ['sass','cssjoin','clean:styles'] );
	grunt.registerTask( 'dev', [ 'compile','server','watch' ] );
	grunt.registerTask( 'predeploy', ['clean:predeploy','copy:predeploy','filerev:assets','replace-asset-urls','filerev:styles','replace-asset-urls','filerev:scripts','replace-asset-urls','filerev:templates','replace-asset-urls'] );

};