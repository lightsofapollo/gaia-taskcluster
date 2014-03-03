module.exports = function(grunt) {
  var docFiles = [
    'README.md',
    'amqp.js',
    'config.js',
    'exchange.js',
    'queue.js',
    'factory/task.js'
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      files: docFiles,
      tasks: ['jsdoc']
    },

    jsdoc : {
      dist : {
        dest: 'doc',
        jsdoc: './node_modules/jsdoc/jsdoc.js',
        src: docFiles,
        options: {
          private: false,
          template: './node_modules/ink-docstrap/template',
          configure: './jsdoc.json',
          tutorials: './tutorial'
        }
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['jsdoc']);
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
