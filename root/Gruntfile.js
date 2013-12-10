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
					{expand: true, src: ['assets/**','node_modules/**','preprocessors/**','views/**'], dot: true, dest: 'deploy/'}
				]
			}
		},
		filerev: {
			assets: { src: ['deploy/assets/**/*.*','!deploy/assets/**/*.{css,scss,js}'] },
			styles: { src: ['deploy/assets/compiled/styles.css'] },
			scripts: { src: ['deploy/assets/compiled/scripts.js'] },
			templates: { src: ['deploy/assets/compiled/templates.js'] }
		},
		filerev_replace: {
			assets: {
				options: {
					assets_root: 'deploy/assets/',
					views_root: 'deploy/assets/'
				},
				src: 'deploy/assets/compiled/*.{css,js}' },
			views: {
				options: {
					assets_root: 'deploy/assets/',
					views_root: 'deploy/views/'
				},
				src: 'deploy/views/**/*.hbs'
			}
		},
		shell: {
			predeploy_compilehbs: {
				options: { stdout: true, stderr: true, failOnError: true },
				command: 'cd deploy && grunt compilehbs'
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

	grunt.registerTask( 'default', ['compile'] );
	grunt.registerTask( 'compile', ['compilecss','compilehbs','compilejs'] );
	grunt.registerTask( 'compilehbs', ['handlebars','concat:templates','uglify:templates'] );
	grunt.registerTask( 'compilejs', ['requirejs','concat:scripts'] );
	grunt.registerTask( 'compilecss', ['sass','cssjoin','clean:styles'] );
	grunt.registerTask( 'dev', [ 'compile','server','watch' ] );
	grunt.registerTask( 'predeploy', [
		'compilecss','compilejs',
		// Copy the whole site to deploy/
		'clean:predeploy','copy:predeploy',
		// Fingerprint the deploy/ asset, styles and scripts
		'filerev:assets','filerev_replace',
		'filerev:styles','filerev_replace',
		'filerev:scripts','filerev_replace',
		// The deploy/ views now use fingerprinted assets, compile and fingerprint the deploy/ templates.js
		'shell:predeploy_compilehbs',
		'filerev:templates','filerev_replace'] );

};