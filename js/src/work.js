define(function(require){

  var data = require("data/work.js");
  var Canvas = require("./canvas/hex-canvas.js");

  var $workHeap = $(".work-heap");

  for ( var i = 0; i < data.length; ++i ) {
    var html = "<li class='work-piece'>";
    if ( data[i].link ) {
      html += "<a class='work-link' href='" + data[i].link + "'></a>";
    }
    var $work = $(html + "<canvas></canvas></li>").appendTo($workHeap).data("widx", i);

    if ( data[i].setupCanvas ) {
      var canvas = new Canvas( $work.children('canvas')[0] );
      data[i].canvas = canvas;
      data[i].setupCanvas(canvas);
      canvas.render();
    }
  }

  var testInsideLink;
  var testInsideHexagon = function(x, y) {
    var hexagonSize = $(".work-piece").offset();
    hexagonSize.width  /= 2;
    hexagonSize.height /= 2;

    var halfHeight = hexagonSize.height / 2;
    var angle      = Math.atan2(halfHeight, hexagonSize.width);

    testInsideHexagon = function(x, y) {
      if ( x > hexagonSize.width  ) x = hexagonSize.width - (x - hexagonSize.width);
      if ( y > hexagonSize.height ) y = hexagonSize.height- (y - hexagonSize.height);
      if ( y > halfHeight ) { return true; }

      y = halfHeight - y;
      return Math.atan2(y, x) < angle;
    }

    testInsideLink = function(x, y) {
      if ( x > hexagonSize.width && y < hexagonSize.height ) {
        return Math.pow(x - 92, 2) + Math.pow(y - 20, 2) < 256;
      }
      return false;
    }

    return testInsideHexagon(x, y);
  }

  var lastInside  = false;
  var heapTimeout = null;
  function hoverWork( $workDom ) {
    var $dom    = $workDom.toggleClass("hover", true);
    var theData = data[$dom.data("widx")];

    var domPos  = $dom.position();

    // Show description for the work.
    $("#W_workDesc")
      .attr("data-faq", theData.ttl)
      .html(theData.desc)
      .css("top", domPos.top);

    $workHeap.toggleClass("hover", true);
    if ( heapTimeout ) {
      clearTimeout(heapTimeout);
      heapTimeout = null;
    }

    if ( theData.canvas ) {
      theData.canvas.animate();
    }

  }

  function hoverOutHeap () { $workHeap.toggleClass("hover", false); }
  function hoverOutWork( $workDom ) {
    $("#W_workDesc").attr("data-faq", "").html("");

    $workDom.toggleClass("hover", false);
    if ( !heapTimeout )
      heapTimeout = setTimeout(hoverOutHeap, 150);

    var theData = data[$workDom.data("widx")];
    if ( theData.canvas ) {
      theData.canvas.stop();
      theData.canvas.render();
    }
  }
  $workHeap.on("mousemove", ".work-piece", function(evt){
    var inside = testInsideHexagon( evt.offsetX, evt.offsetY );
    var insideLink = false;
    var $currentTarget = $(evt.currentTarget);

    // Handle the link here.
    if ( !inside ) {
      insideLink = $currentTarget.children(".work-link").length > 0;
      if ( insideLink )
        inside = insideLink = testInsideLink( evt.offsetX, evt.offsetY );
    }

    $currentTarget.toggleClass("link-hover", insideLink);

    if ( lastInside != inside ) {
      lastInside = inside;
      if ( inside ) {
        hoverWork( $currentTarget );
      } else {
        hoverOutWork( $currentTarget );
      }
    }

  }).on("mouseleave", ".work-piece", function(evt){
    lastInside = false;
    hoverOutWork( $(evt.currentTarget) );
  }).on("click", ".work-piece", function(evt){
    var $currentTarget = $(evt.currentTarget);
    if ( $currentTarget.hasClass("link-hover") ) {
      window.open( $currentTarget.children(".work-link").attr("href"), "_blank" );
    }
  })

});
