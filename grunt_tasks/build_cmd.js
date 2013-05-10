module.exports = function(grunt) {

  /* Building for Sea.js
     // Phase Trasform
     1. each TARGET defines a SCHEME of 
          how to transform file PATH to ID
          within a FOLDER
     2. each FILE within the FOLDER is a CMD
     3. for each CMD, change `define(FACTORY)` to `define(ID, DEPENDENCIES, FACTORY)`
     4. for each require/use call, change `require(xxx)` to `require(ID)`

     // Phase Concat
     1. specify an ALGORITHM to determine what files should be concat together
     2. output a seajs.config.alias object to indicate ID to PATH mapping.
   */

  /* Notes about SCHEME.
     the SCHEME is only applied if the DEPENDENCY is found within TARGET.
     otherwise, the PATH to ID is by a ALIAS FUNCTION.
   */


  grunt.registerMultiTask("build_cmd", function () {
    grunt.log.ok( "Trasforming for target : " + this.target );

    var options    = this.options();
    var targetData = {};

    options.outputPath = ensureTrailingSlash( options.outputPath );
    options.path       = ensureTrailingSlash( options.path );

    if ( !grunt.file.exists( options.outputPath ) ) {
      grunt.file.mkdir( options.outputPath );
    }

    // Loop through every files inside TARGET
    grunt.file.recurse( options.path, function(abspath, rootdir, subdir, filename){
      if ( filename.indexOf(".js") != filename.length - 3 ) { return; }
      subdir = ensureTrailingSlash( subdir );
      var content = grunt.file.read(abspath).toString();

      content = transform( options, targetData, content, subdir, filename );

      grunt.file.write( options.outputPath + abspath, content );
    });
  });



  ////////////////////
  //// Helpers
  ////////////////////
  function ensureTrailingSlash ( path ) {
    if ( !path || path.length == 0 ) { return ""; }
    switch ( path[path.length-1] ) {
      case "\\":
      case "/" :
        return path;
      default  :
        path += "/";
        return path;
    }
  }

  function path2id( path, scheme ) {
    if ( scheme ) {
      return typeof scheme == "string" ?
                scheme.replace("{{filename}}", path) : scheme(path);
    } else {
      return path;
    }
  }

  function transform(options, targetData, content, subdir, filename) {
    
    // Test if the module has already has ID
    var DEFINE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(?:^|[^$])\bdefine\s*\(\s*(["'])(.+?)\1\s*/g;
    /*"*/

    var hasID  = false;
    content.replace( DEFINE_RE, function(m, m1, m2){ 
      if(m2) { hasID = true; }
    });
    if ( hasID ) { return content; }


    // Create dependency array
    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    /*"*/
    var requires = [];
    content = content.replace( REQUIRE_RE, function(m, m1, m2, offset, string ){

      // Modify original content to change dependency's PATH to ID
      if ( m2 ) {
        var replace = "";

        // If the file is relative to the TARGET PATH and exists
        // Use SCHEME to set the ID of the file
        if ( grunt.file.exists( options.path + m2) ) {
          replace = path2id( m2, options.scheme );
          requires.push( replace );
        } else {
          replace = options.alias ? options.alias("") : "";
          requires.push( replace ? replace : m2 );
        }

        if ( replace ) { return 'require("' + replace + '")'; }
      }

      return m;
    });


    // Change define(FACTORY) to define(ID,DEPENDENCIES,FACTORY)
    var newID      = path2id( subdir + filename, options.scheme );
    var new_define = "define('" + newID + "'," + JSON.stringify(requires) + ",";

    grunt.log.writeln( "   - [" + subdir + filename + "] >>>>> \"" + newID + "\"" );

    var DEFINE_RE2 = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(?:^|[^$])\b(define)\s*\(\s*({|function)/g;
    
    content = content.replace( DEFINE_RE2, function(m, m1, m2){ return m2 ? new_define + m2 : m; });

    // Write new content
    return content;
  }
}
