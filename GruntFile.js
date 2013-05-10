module.exports = function(grunt) {

  // HOW TO BUILD
  // 1. Specify every build options in this GruntFile.js
  // 2. Load necessary tasks to finish the building.

  grunt.initConfig({
      "build_cmd" : {
        options : { 
          outputPath    : "build"
        , seajsBasePath : "js" // 
      }

      // Target `main`
      , main : { options : {         // Target-level options
          path        : "js"         // Folder relative to GruntFile.js
        , scheme      : null 
            // If scheme is string, {{filename}} is replace by the file path, relative to GruntFile.js.
            // If scheme is function : function( filename ) { return id; }
            // If scheme is falsy, the id is filename.
        , alias       : null  // If a depedency is not found, function alias is used to map filename to id.

        , concatRules : [
          {
            includeDependency : true 
              // If true, it will include every dependencies into one file, recursively.
            , source : [ "main.js" ]
            , output : "main.js"
          }
        ] // If concatRules is not falsy, the files are merge together,
          // And a generate
      }}
    }
  });

  // grunt.initConfig({
  //   transport: {
  //     options: {
  //       format: 'wwm/{{filename}}',  // id format
  //     },
  //     wwm : {
  //         options : {
  //         paths : ["js"]
  //       }
  //       , files: [{
  //           cwd  : "js"
  //         , src  : ["*", "data/*", "src/*"]
  //         , dest : ".build"
  //       }]
  //     }
  //   },

  //   concat: {
  //     main: {
  //       options: {
  //         relative: true  // this will include relative dependencies
  //       },
  //       files: {
  //         'dist/main.js': ['.build/main.js'],
  //         'dist/main-debug.js': ['.build/main-debug.js']
  //       }
  //     }
  //   },
  //   uglify: {
  //     main: {
  //       files: {
  //         'dist/main.js': ['dist/main.js']
  //       }
  //     }
  //   },
  //   clean: {
  //     build: ['.build']
  //   }
  // })

  // grunt.loadNpmTasks('grunt-cmd-transport');
  // grunt.loadNpmTasks('grunt-cmd-concat');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadTasks("grunt_tasks");
  grunt.registerTask("default", ['build_cmd']);
}
