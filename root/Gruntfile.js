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
					optimize: 'uglify2',
					paths: {
						'requireLib': '../../node_modules/grunt-contrib-requirejs/node_modules/requirejs/require'
					},
					include: 'requireLib'
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
					{expand: true, src: ['**','!.git/**','!.sass-cache/**','!deploy/**'], filter: 'isFile', dot: true, dest: 'deploy/'}
				]
			}
		},
		shell: {
			predeploy_filerev: {
				options: { stdout: true, stderr: true, failOnError: true },
				command: 'cd deploy && grunt predeploy_filerev -y'
			}
		},
		prompt: {
			confirm_filerev: {
				options: {
					questions: [
						{
							config: 'confirm_filerev',
							type: 'input',
							message: 'Are you sure you want to filerev? Your assets and views will be modified. [y/n]',
							validate: function( value ) {
								if( value == 'y' ) return true;
								grunt.fatal('Aborted');
							},
							when: function() {
								return !grunt.option('y');
							}
						}
					]
				}
			}
		},
		filerev: {
			assets: { src: ['assets/**/*.*','!assets/**/*.{css,scss,js}'], filter: 'isFile' },
			styles: { src: ['assets/compiled/styles.css'] },
			scripts: { src: ['assets/compiled/scripts.js'] },
			templates: { src: ['assets/compiled/templates.js'] }
		},
		filerev_replace: {
			assets: {
				options: {
					assets_root: 'assets/',
					views_root: 'assets/'
				},
				src: 'assets/compiled/*.{css,js}' },
			views: {
				options: {
					assets_root: 'assets/',
					views_root: 'views/'
				},
				src: 'views/**/*.hbs'
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
	grunt.registerTask( 'compilejs', ['requirejs'] );
	grunt.registerTask( 'compilecss', ['sass','cssjoin','clean:styles'] );
	grunt.registerTask( 'dev', [ 'compile','server','watch' ] );
	grunt.registerTask( 'predeploy', [ 'compile','clean:predeploy','copy:predeploy','shell:predeploy_filerev' ] );

	// This is called by the predeploy task, don't call it directly, unless you know what you're doing
	grunt.registerTask( 'predeploy_filerev', [
		// Warn the user his files will be modified
		'prompt:confirm_filerev',
		// Fingerprint the assets, styles and scripts (in that order, since assets are used in styles,
		// and styles are used in scripts)
		'filerev:assets','filerev_replace',
		'filerev:styles','filerev_replace',
		'filerev:scripts','filerev_replace',
		// The views now use fingerprinted assets, compile and fingerprint templates.js
		'compilehbs',
		'filerev:templates','filerev_replace'] );

};