'use strict';

module.exports = function (grunt) {
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

      wiredep: {
        task: {
          src: [
            'index.html'
          ],
          options: {
            // See wiredep's configuration documentation for the options you may pass:
            // https://github.com/taptapship/wiredep#configuration
            overrides: {
              react:{
                main: "react.min.js"
              }
            }
          }
        }
      },
      react: {
        single_file_output: {
          files: {
            'assets/index.js': 'assets/react/index.jsx'
          }
        },
      },
      sass: {
        options: {
          sourceMap: true,
          includePaths: require('node-bourbon').includePaths
        },
        dist: {
          files: {
            'assets/style.css': 'assets/scss/style.scss'
          }
        }
      },
      watch: {
        html: {
          files: 'assets/**/*.html',
          options: {
            livereload: true
          }
        },
        js: {
          files: 'assets/**/*.js',
          options: {
            livereload: true
          }
        },
        sass: {
          files: 'assets/**/*.scss',
          tasks: ['sass'],
          options: {
            livereload: true,
          }
        },
        react: {
          files: 'assets/react/*.jsx',
          tasks: ['react']
        }
      },
      useminPrepare: {
        html: 'index.html',
        options: {
          dest: 'dist'
        }
      },
      usemin:{
        html:['dist/index.html']
      },
      copy:{
        build: {
          files: [
            { src: './index.html', dest: 'dist/index.html' },
            { src: 'assets/images/favicon.ico', dest: 'dist/favicon.ico' },
          ]
        }
      },
      serve: {
        options: {
          port: 9000
        }
      }

    });
    grunt.registerTask('preview', ['wiredep','react','sass','serve']);
    grunt.registerTask('build', [
      'react',
      'sass',
      'wiredep',
      'copy',
      'useminPrepare',
      'concat',
      'uglify',
      'cssmin',
      'usemin'
    ]);
}