/*jslint node: true*/

module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    packageName: '<%= pkg.name.toLowerCase() %>',

    /* Directories */
    rootDir: 'src',
    scriptDir: '<%= rootDir %>/js',
    cssDir: '<%= rootDir %>/css',
    testDir: 'tests',
    buildDir: 'build',
    vendorDir: 'bower_components',
    /* Destination */
    dest: '<%= buildDir %>/<%= packageName %>.js',
    destMinified: '<%= buildDir %>/<%= packageName %>.min.js',
    CSSdest: '<%= buildDir %>/<%= packageName %>.css',
    fullDest: '<%= buildDir %>/<%= packageName %>.full.js',
    fullMinDest: '<%= buildDir %>/<%= packageName %>.full.min.js',

    /* Tasks */
    jslint: {
      server: {
        src: [
          '<%= scriptDir %>/**/*.js'
        ],
        exclude: [
          '<%= scriptDir %>/**/polyfills/*.js'
        ],
        directives: {
          node: true,
          todo: true,
          white: true,
          nomen: true,
          plusplus: true,
          bitwise: true,
          maxlen: 120
        },
        options: {
          failOnError: false
        }
      }
    },
    replace: {
      main: {
        options: {
          patterns: [
            {
              match: 'VERSION',
              replacement: '<%= pkg.version %>',
              // Simple variable lookup.
              expression: false
            },
            {
              match: 'DATE',
              replacement: new Date(),
              // Simple variable lookup.
              expression: false
            }
          ]
        },
        files: [
          {
            src: [
              '<%= dest %>'
            ],
            dest: '<%= buildDir %>',
            expand: true,
            flatten: true
          }
        ]
      },
      css_path: {
        options: {
          patterns: [
            {
              match: /font\//g,
              replacement: '<%= rootDir %>/font/'
            }
          ]
        },
        files: [
          {
            src: [
              '<%= buildDir %>/*.css'
            ],
            dest: '<%= buildDir %>',
            expand: true,
            flatten: true
          }
        ]
      }
    },
    concat: {
      options: {
        separator: '\n'
      },
      css: {
        src: [
          '<%= cssDir %>/normalize.css',
          '<%= cssDir %>/ebookreader.css'
        ],
        dest: '<%= CSSdest %>'
      },
      ebr: {
        src: [
          // Polifills.
          '<%= scriptDir %>/polifills/array.js',
          '<%= scriptDir %>/polifills/function.js',
          // Libs.
          '<%= scriptDir %>/lib/image_loader.js',
          // Localizations.
          '<%= scriptDir %>/ebookreader/locale/en/us.js',
          '<%= scriptDir %>/ebookreader/locale/ru/ru.js',
          // eBookReader.
          '<%= scriptDir %>/ebookreader/main.js',
          '<%= scriptDir %>/ebookreader/reader.js',
          '<%= scriptDir %>/ebookreader/image_reader/main.js',
          '<%= scriptDir %>/ebookreader/image_reader/screen_mode/single.js',
          '<%= scriptDir %>/ebookreader/image_reader/screen_mode/dual.js',
          '<%= scriptDir %>/ebookreader/html_reader/main.js'
        ],
        dest: '<%= dest %>'
      },
      full_ebr: {
        src: [
          '<%= vendorDir %>/jez/src/main.js',
          '<%= dest %>'
        ],
        dest: '<%= fullDest %>'
      }
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: '<%= buildDir %>',
        src: ['*.css'],
        dest: '<%= buildDir %>',
        ext: '.min.css'
      }
    },
    removelogging: {
      main: {
        options: {
          replaceWith: '',
          namespace: [
            'console',
            'window.console',
            'debugger',
            'window.debugger'
          ],
          methods: [
            'log', 'time', 'timeEnd'
          ]
        },
        src: '<%= dest %>',
        dest: '<%= dest %>'
      }
    },
    uglify: {
      main: {
        src: '<%= dest %>',
        dest: '<%= destMinified %>'
      },
      full: {
        src: '<%= fullDest %>',
        dest: '<%= fullMinDest %>'
      }
    },
    clean: {
      main: {
        src: [
          '<%= buildDir %>/*'
        ]
      }
    },
    jsdoc: {
      dist: {
        src: ['<%= dest %>'], 
        options: {
          destination: 'docs'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    'clean',
    'jslint',
    'concat:ebr',
    'removelogging',
    'concat:full_ebr',
    'replace',
    'uglify',
    'uglify:full',
    'concat:css',
    'replace:css_path',
    'cssmin',
    'jsdoc'
  ]);
};
