const path = require('path')

module.exports = function(grunt) {
    const reRequire = "require\\(([\\'\\\"\\`])(.*?)\\1\\)";
    const requirePattern = new RegExp(reRequire, 'gi');
    const requireRepl = function(match, p1, p2) {
        return 'require("' + p2.replace(/[\/\\]/g, '_') + '")'
    };

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.initConfig({
        clean: { 'dist': ['dist'] },

        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'dist/js/',
                    src: '**',
                    dest: 'dist/js_flatten/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        // Change the path name utilize underscores for folders
                        return path.win32.join(dest, src.replace(/\//g,'_'))
                    }
                }],
            }            
        },

        ts: {
            options: { allowJs: true, rootDir: 'src' },
            default: {
                src: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.d.ts', 'src/**/*.js', 'src/**/*.jsx'],
                outDir: 'dist/js/',
            }
        },

        'string-replace': {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/js_flatten/',
                    src: '**/*.js',
                    dest: 'dist/js_require/',
                    filter: 'isFile'
                }],
                options: {
                    replacements: [{pattern: requirePattern, replacement: requireRepl}]
                }
            }
        },

        watch: {
            screeps: {
                files: 'src/**',
                tasks: ['clean', 'ts', 'copy:screeps', 'string-replace']
            }

        }
    });

    grunt.registerTask('default',  ['clean', 'ts', 'copy:screeps', 'string-replace']);
}
