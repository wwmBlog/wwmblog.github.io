define(function(require){

  var data = require("data/timeline.js");
  var SVG  = require("SVG");

  var canvas       = SVG("W_timeline");
  var $currents    = [];
  var currentLines = [];
  var $alphas      = [];
  var $betas       = [];
  var altlines     = [];
  var $alphaStartDot;
  var $betaStartDot;
  var $alphaStartLine;
  var $betaStartLine;

  // Part of the timeline is rendered using CSS
  var $container = $("#W_timelineContainer");

  // Init necessary elements.
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

        if ( c.alpha ) { $alphaStartDot = $dot; }
        if ( c.beta  ) { $betaStartDot  = $dot; }

        // Add lines by the way.
        var line = canvas.line().attr( { "stroke" : "#b9b9b9", "stroke-width" : "8" });
        currentLines.push( line );
      }

      // Last Line
      var line = canvas.line(0, h_half, 0, h_half)
                       .attr( { 
                            "stroke"           : "#cbcbcb"
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

        if ( i != 0 ) {
          altlines.push( canvas.line().attr({ "stroke" : "#cbcbcb", "stroke-width" : "8" }) );
        }
      }
    }

    // Alt Dot
    addAltDots( data.alpha, $alphas, $container );
    addAltDots( data.beta,  $betas,  $container );

    // Alt Curves
    $alphaStartLine = canvas.path().fill("#cbcbcb").back();
    $betaStartLine  = canvas.path().fill("#cbcbcb").back();

    // Start Dot
    var d = $("<span class='tl_dot start'></span>").appendTo($container).data("desc", data.start);
    $currents.push( d );

    addDots( data.current, $currents, $container );

    // End Dot
    d = $("<span class='tl_dot end'></span>"  ).appendTo($container).data("desc", data.end);
    $currents.push( d );

  })();

  // Recalc
  var tlTop    = 0;
  var tlCenter = 0;
  var tlBottom = 0;
  var tlState  = -2;

  function redrawTimeline () {
    var offset = $container.offset();
    var wh     = window.innerHeight;
    var space  = wh - offset.height;

    tlCenter = offset.top - space / 2;
    if ( space < 200 ) { space = 200; }
    tlTop    = offset.top - space;
    tlBottom = offset.top + offset.height + space - wh;

    arrageDots();
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
    var MARGIN = 4;
    var $dot   = $currents[0];
    var pos1   = $dot.position();
    var w1     = $dot.width() / 2 + MARGIN;
    for ( var i = 1; i < $currents.length; ++i )
    {
      $dot = $currents[i];

      var pos2 = $dot.position();
      var line = currentLines[i - 1];

      var rad  = Math.atan2( pos2.top  - pos1.top, pos2.left - pos1.left );
      var cosR = Math.cos( rad );
      var sinR = Math.sin( rad );

      pos1.left += Math.floor( cosR * w1 );
      pos1.top  += Math.floor( sinR * w1 );

      w1 = $dot.width() / 2 + MARGIN;

      var x2 = Math.floor( pos2.left - cosR * w1 );
      var y2 = Math.floor( pos2.top  - sinR * w1 );

      if ( Math.pow(x2 - pos1.left, 2) + Math.pow(y2 - pos1.top, 2) < 18 ) {
        line.attr({"x1":"0","y1":"0","x2":"0","y2":"0"});
      } else {
        line.attr({ 
              "x1" : pos1.left
            , "y1" : pos1.top
            , "x2" : x2
            , "y2" : y2
          });
      }

      pos1 = pos2;
    }

    // Curve to the first alpha and beta
    function drawCurve ( $dot1, $dot2, path ) {
      
      var pos1   = $dot1.position();
      var pos2   = $dot2.position();
      var w1     = $dot1.width() / 2 + 2;
      var rad    = Math.atan2( pos2.top - pos1.top, pos2.left - pos1.left );

      pos2.left -= $dot2.width() / 2 + 4;

      var lx_off    = pos2.top > pos1.top ? 1 : -1;
      var ly_off    = pos2.top > pos1.top ? w1 : -w1;
      var ry_off    = 4;
      var control_x = pos1.left + Math.floor( (pos2.left - pos1.left) * 0.15 );

      var p = ["M", pos1.left + lx_off, pos1.top + ly_off,
               "Q", control_x, pos2.top - ry_off,
                    pos2.left, pos2.top - ry_off,
               "L", pos2.left, pos2.top + ry_off,
               "Q", control_x, pos2.top + ry_off, 
                    pos1.left - lx_off, pos1.top + ly_off,
               "Z"
              ].join(" ");
      path.attr("d", p);
    }

    drawCurve( $alphaStartDot, $alphas[0], $alphaStartLine );
    drawCurve( $betaStartDot,  $betas[0],  $betaStartLine );

    function altLineTo( $dot1, $dot2, index ) {
      var line = altlines[index];
      var pos1 = $dot1.position();
      var pos2 = $dot2.position();
      line.attr({
          "x1" : pos1.left + $dot1.width() / 2 + 4
        , "y1" : pos1.top
        , "x2" : pos2.left - $dot2.width() / 2 - 4
        , "y2" : pos2.top
      });
    }

    // Alt lines
    for ( i = 0; i < $alphas.length - 1; ++i ) { altLineTo($alphas[i], $alphas[i + 1], i); }
    for ( i = 0; i < $betas.length  - 1; ++i ) { altLineTo($betas [i], $betas [i + 1], i+$alphas.length-1); }
  }

  redrawTimeline();

  $(window).on("debouncedResize", redrawTimeline).on("scroll", arrageDots);
});
