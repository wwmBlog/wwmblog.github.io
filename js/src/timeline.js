define(function(require){

  var data = require("data/timeline.js");
  var SVG  = require("SVG");

  var canvas       = SVG("W_timeline");
  var $currents    = [];
  var currentLines = [];
  var $alphas      = [];
  var $betas       = [];

  // Part of the timeline is rendered using CSS
  var $container = $("#W_timelineContainer");

  ;(function(){

    var c_height = $container.height();
    var h_quater = c_height / 4;
    var h_third  = c_height / 3;
    var h_half   = c_height / 2;
    var restrict = false;

    function addDots( target, collection, $container ) {

      for ( var i = 0; i < target.length; ++i )
      {
        var c    = target[i];
        var min  = h_third;
        var size = h_third;
        if ( restrict ) {
          min  += 20;
          size -= 40;
        } else if ( c.alpha || c.beta ) {
          restrict = true;
        }

        var r = range( min, size, h_half);
        var $dot = $("<span class='tl_dot'></span>")
                        .appendTo($container)
                        .data("y", c.y)
                        .data("desc", c.desc)
                        .data("maxT", r.max)
                        .data("minT", r.min)
                        .data("midT", r.mid)
                        .css( "left", c.left );
        collection.push($dot);

        // Add lines by the way.
        var line = canvas.line(0, h_half, 0, h_half).attr( { "stroke" : "#b9b9b9", "stroke-width" : "8" } );
        currentLines.push( line );
      }

      var line = canvas.line(0, h_half, 0, h_half)
                       .attr( { 
                            "stroke"           : "#b9b9b9"
                          , "stroke-width"     : "8"
                          , "stroke-dasharray" : "16, 8"
                       } );
      currentLines.push( line );
    }

    function range ( start, s , b ) {
      var a = Math.random() * s + start;
      var c = Math.random() * s + start;
      if ( Math.abs(a - b) < 10 ) { a += a < b ? -10 : 10; }
      if ( Math.abs(c - b) < 10 ) { c += c < b ? -10 : 10; }
      var t;
      if ( (a - b)*(c - b) > 0 ) {
        if ( a > c ) { c = b - (c - b); }
        if ( c > a ) { a = b - (a - b); }
      }
      return { max : Math.floor(c), min : Math.floor(a), mid : Math.floor(b) };
    }

    function addAltDots( target, collection, $container ) {
      for ( var i = 0; i < target.length; ++i )
      {
        var c = target[i];
        var $dot = $("<span class='tl_dot alt'></span>")
                          .appendTo($container)
                          .data("y", c.y)
                          .data("desc", c.desc)
                          .css( "left", c.left );
        collection.push($dot);
      }
    }

    addAltDots( data.alpha,   $alphas,   $container );
    addAltDots( data.beta,    $betas,    $container );

    var d = $("<span class='tl_dot start'></span>").appendTo($container).data("desc", data.start);
    $currents.push( d );

    addDots( data.current, $currents, $container );

    d = $("<span class='tl_dot end'></span>"  ).appendTo($container).data("desc", data.end);
    $currents.push( d );

  })();

  var tlTop    = 0;
  var tlCenter = 0;
  var tlBottom = 0;
  var tlState  = -2;

  function updateMetric () {
    var offset = $container.offset();
    var wh     = window.innerHeight;
    var space  = wh - offset.height;

    tlCenter = offset.top - space / 2;
    if ( space < 200 ) { space = 200; }
    tlTop    = offset.top - space;
    tlBottom = offset.top + offset.height + space - wh;
  }

  function arrageDots () {
    var scrollY = window.scrollTop || window.scrollY;
    if ( scrollY <= tlTop ) {
      if ( tlState == -1 ) {
        return;
      }
      scrollY = tlTop;
      tlState = -1;
    } else if ( scrollY >= tlBottom ) {
      if ( tlState == 1 ) {
        return;
      }
      scrollY = tlBottom;
      tlState = 1;
    } else {
      tlState = (scrollY - tlCenter) / (tlCenter - tlTop);
    }

    for ( var i = 1; i < $currents.length - 1; ++i ) {
      var $dot = $currents[i];
      var midT = $dot.data("midT");
      var endT;
      if ( tlState < 0.05 && tlState > -0.05 ) {
        $dot.css("top", midT);
      } else if ( tlState < 0 ) {
        endT = $dot.data("minT");
        $dot.css("top", Math.floor(midT + (midT - endT) * tlState) );
      } else {
        endT = $dot.data("maxT");
        $dot.css("top", Math.floor(midT + (endT - midT) * tlState) );
      }
    }

    var c_height = Math.floor( $container.height() / 4 );
    for ( i = 0; i < $alphas.length; ++i ) {
      $dot = $alphas[i].css("top", c_height);
    }
    c_height *= 3;
    for ( i = 0; i < $betas.length; ++i ) {
      $dot = $betas[i].css("top", c_height);
    }

    drawLines();
  }

  function drawLines () {
    var $dot = $currents[0];
    var pos1 = $dot.position();
    var w1   = $dot.width() / 2 + 4;
    for ( var i = 1; i < $currents.length; ++i )
    {
      $dot = $currents[i];

      var pos2 = $dot.position();
      var line = currentLines[i - 1];
      var rad  = Math.atan2( pos2.top - pos1.top, pos2.left - pos1.left );

      pos1.left += Math.floor( Math.cos( rad ) * w1 );
      pos1.top  += Math.floor( Math.sin( rad ) * w1 );

      w1 = $dot.width() / 2 + 4;

      line.attr({ "x1" : pos1.left, "y1" : pos1.top })
          .attr({ 
              "x2" : pos2.left - Math.floor( Math.cos( rad ) * w1 )
            , "y2" : pos2.top  - Math.floor( Math.sin( rad ) * w1 )
          });

      pos1 = pos2;
    }
  }

  $(window).on("resize", updateMetric)
           .on("scroll", arrageDots);

  updateMetric();
  arrageDots();
});
