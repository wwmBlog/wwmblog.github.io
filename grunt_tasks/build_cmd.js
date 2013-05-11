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

  /* Notes about CONCAT
     the dependencies must comes first.
   */

  var path  = require("path");
  var gFile = grunt.file;

  var RE_DEFINE_ID = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(?:^|[^$])\bdefine\s*\(\s*(["'])(.+?)\1\s*/g;
    /*"*/
  var RE_REQUIRE   = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    /*"*/
  var RE_DEFINE    = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*define|(?:^|[^$])\b(define)\s*\(\s*({|function)/g;


  grunt.registerMultiTask("build_cmd", function () {
    grunt.log.ok( "Trasforming for target : " + this.target );

    var targetData = {};
    var options    = this.options({
          path       : "."
        , scheme     : null
        , alias      : null 
        , recursive  : true
        , concatDeps : false
    });



    /// MultiTask Setup Code ///
    options.outputPath    = ensureTrailingSlash( options.outputPath );
    options.seajsBasePath = ensureTrailingSlash( options.seajsBasePath );

      // Make the TARGET's PATH relative to GruntFile
    if ( options.path == "." ) {
      options.path = options.seajsBasePath;
    } else {
      options.path = ensureTrailingSlash( options.seajsBasePath + options.path );
    }

    if ( !gFile.exists( options.outputPath ) ) { gFile.mkdir( options.outputPath ); }
    ///////////////////////////



    if ( !gFile.isPathInCwd( options.seajsBasePath) ) {
      grunt.fail.fatal("Seajs Base Path Not Found!");
    }

    /* 
        Extract ID
          : loop through every files inside TARGET
     */
    gFile.recurse( options.path, 
      function(abspath, rootdir, subdir, filename)
      {
        // Don't extract ID if it's not js file
        if ( filename.indexOf(".js") != filename.length - 3 || filename.length <= 3 ) { return; }
        // Don't extract ID for files in subfolder if the TARGET is not recursive.
        if ( options.recursive === false && subdir ) { return; } 

        subdir = ensureTrailingSlash( subdir );
        var content = gFile.read(abspath).toString();

        content = transform( options, targetData, content, abspath );

        gFile.write( options.outputPath + abspath, content );
      }
    );


    /*
        Concat CMD Files
     */
    this.files.forEach(function( file ){

      // Remap each src
      file.src.forEach(function( value, index, array ){

      });

      var content = file.src.filter(function(p) {
        if ( !grunt.file.exists( p ) ) {
          grunt.log.warn('Files not found when concating: ' + p);
          return false;
        }
        return true;
      }).map(function( p ) {
        // Read and return the file's source.
        return grunt.file.read(filepath);
      }).join('\n');

    });
    
  });



  ////////////////////
  //// Helpers
  ////////////////////
  function ensureTrailingSlash ( p ) {
    if ( !p || p.length == 0 ) { return ""; }
    p = path.normalize( p );
    switch ( p[p.length-1] ) {
      case "\\":
      case "/" :
        return p;
      default  :
        return p + "/";
    }
  }

  function colorLog ( text, color ) {
    var reset = "\033[0m"
    switch ( color ) {
      case "black"   : return '\033[30m' + text + reset;
      case "red"     : return '\033[31m' + text + reset;
      case "green"   : return '\033[32m' + text + reset;
      case "yellow"  : return '\033[33m' + text + reset;
      case "blue"    : return '\033[34m' + text + reset;
      case "magenta" : return '\033[35m' + text + reset;
      case "cyan"    : return '\033[36m' + text + reset;
      case "white"   : return '\033[37m' + text + reset;
      default        : return text;
    }
  }

  function resolveToBase ( abspath, base ) {
    // The input  `abspath` is relative to GruntFile
    // The output `path` is relative to base and normalized
    var abspaths = path.normalize( abspath ).split("/");
    var bases    = base.split("/");
    var newPaths = [];

    for ( var i = 0, j = 0; i < bases.length; ++i ) {
      if ( !bases[i] ) { break; }

      if ( bases[i] == abspaths[j] ) {
        ++j;
      } else {
        newPaths.push("..");
      }
    }

    if ( j > 0 ) { abspaths.splice(0, j); }
    abspaths = abspaths.join("/");

    return newPaths.length ? newPaths.join("/") + "/" + abspaths : abspaths;
  }

  function path2id( p, scheme ) {
    if ( scheme ) {
      return typeof scheme == "string" ?
                scheme.replace("{{filename}}", p) : scheme(p);
    } else {
      return p;
    }
  }

  function transform(options, targetData, content, abspath) {
    
    // Test if the module has already has ID
    var hasID  = false;
    content.replace( RE_DEFINE_ID, function(m, m1, m2){ if(m2) { hasID = true; } return m; });
    if ( hasID ) { return content; }


    // Create dependency array
    var requires = [];
    content = content.replace( RE_REQUIRE, function( m, m1, m2, offset, string ){

      if ( m2 ) {
        // Found a require("XXX"), which XXX is m2;

        // The require uri can be :
        // relative : starts with . or ..
        //    It's relative to current module
        // normal   : starts with / or http://, https:// ...
        //    It's not relative to anything
        // absolute : everything else
        //    It's relative to seajsBasePath

        // The SCHEME is used to transform files within this TARGET
        // The ALIAS  is used to transform files within this PROJECT

        var replace = null;

        if ( /^\w{2,6}:\/\//.exec( m2 ) ) {
          // Do nothing if the uri is like http://, https://
          requires.push( m2 );
          return m;
        }

        if ( m2.length < 4 || m2.indexOf(".js") != m2.length - 3 ) {
          m2 += ".js";
        }

        if ( m2[0] == "/" ) {
          // Use ALIAS to get ID for `normal` uri
          if ( options.alias ) {
            replace = options.alias( m2 );
          }
        } else {
          var absM2;
          var useScheme = true;

          if ( m2[0] == "." ) {
            absM2 = path.normalize( abspath + "/../" + m2 );
          } else {
            absM2 = path.normalize( options.path + m2 );
          }

          // Use SCHEME to get the ID of the file if only :
          // 1. The file exists and is inside TARGET's PATH
          // 2. The file is in subfolder and TARGET is `recursive`
          //    Or
          //    The file is not in subfolder

          if ( !gFile.exists( absM2 ) ) {
            useScheme = false;
          } else if ( absM2.indexOf( options.path ) != 0 ) {
            useScheme = false;
          } else if ( options.recursive === false ) {
            if ( absM2.replace( options.path ).indexOf("/") != -1 ) {
              useScheme = false;
            }
          }

          // Make m2 to be relative to seajsBasePath
          absM2 = resolveToBase( absM2, options.seajsBasePath );

          if ( useScheme ) {
            replace = path2id( absM2, options.scheme );
            requires.push( replace );
          } else {
            replace = options.alias ? options.alias( absM2 ) : null;
            requires.push( replace ? replace : m2 );
          }
        }

        if ( replace ) {
          // Return dependency's ID to replace its PATH
          return 'require("' + replace + '")';
        }
      }

      return m;
    });


    // Change define(FACTORY) to define(ID,DEPENDENCIES,FACTORY)
    var thisFile   = resolveToBase( abspath, options.seajsBasePath );
    console.log( abspath, options.seajsBasePath, thisFile );
    var newID      = path2id( thisFile, options.scheme );
    var new_define = "define('" + newID + "'," + JSON.stringify(requires) + ",";

    grunt.log.writeln( colorLog("   - ", 'blue') 
                        + "File : [" + thisFile + "]" 
                        + colorLog(" >>>> ", 'blue') 
                        + "ID : \"" + newID + "\"" );
    
    content = content.replace( RE_DEFINE, function(m, m1, m2){ return m2 ? new_define + m2 : m; });

    // Write new content
    return content;
  }
}
