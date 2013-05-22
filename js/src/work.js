define(function(require){

  var data = require("data/work.js");

  var $workHeap = $(".work-heap");

  for ( var i = 0; i < data.length; ++i ) {
    $('<li class="work-piece"><canvas></canvas></li>')
      .appendTo($workHeap)
      .data("widx", i);
  }

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

    return testInsideHexagon(x, y);
  }

  var lastInside  = false;
  var heapTimeout = null;
  function hoverWork( workDom ) {
    var $dom    = $(workDom).toggleClass("hover", true);
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

  }

  function hoverOutHeap () { $workHeap.toggleClass("hover", false); }
  function hoverOutWork( workDom ) {
    $("#W_workDesc").attr("data-faq", "").html("");

    $(workDom).toggleClass("hover", false);
    if ( !heapTimeout )
      heapTimeout = setTimeout(hoverOutHeap, 200);
  }
  $workHeap.on("mousemove", ".work-piece", function(evt){
    var inside = testInsideHexagon( evt.offsetX, evt.offsetY );
    if ( lastInside != inside ) {
      lastInside = inside;
      if ( inside ) {
        hoverWork( evt.currentTarget );
      } else {
        hoverOutWork( evt.currentTarget );
      }
    }
  }).on("mouseleave", ".work-piece", function(evt){
    lastInside = false;
    hoverOutWork( evt.currentTarget );
  });

});
