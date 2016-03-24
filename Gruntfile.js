module.exports = function (grunt)
{

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      babel: {
        options: {
            sourceMap: true,
            presets: ['es2015']
        },
        dist: {
            files: {
                'dist/influx.js': 'src/influx.js'
            }
        }
      },
      watch: {
        files: ['src/*.js'],
        tasks: ['build']
      },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['babel']);
    grunt.registerTask('default', ['babel']);
};
