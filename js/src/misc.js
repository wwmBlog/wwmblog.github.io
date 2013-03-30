define(function(require){

  require("libs/zepto.js");

  // Debounced Resize Event
  var resizeDebounceTO = null;
  var RESIZE_THRESHOLD = 250;
  $(window).on("resize", function() {

      function debounced () { $(window).trigger("debouncedResize"); }

      if ( resizeDebounceTO ) {
        clearTimeout(resizeDebounceTO);
      } else {
        debounced();
      }
      resizeDebounceTO = setTimeout( debounced, RESIZE_THRESHOLD );
  });

  // Resize Event for Element which's size is based on body
  var autoresize_els = [];
  $.fn.watchAutoResize = function() {
    if ( this.data("_ar_width") != undefined ) return;
    this.data("_ar_width",  this.width())
        .data("_ar_height", this.height());
    autoresize_els.push(this);
    if ( autoresize_els.length == 1) {
      $(window).on("debouncedResize", function(){
        for ( var i = 0; i < autoresize_els.length; ++i )
        {
          var t = autoresize_els[i];
          var w = t.width();
          var h = t.height();
          if ( w != t.data("_ar_width") || h != t.data("_ar_height") ) {
            t.data("_ar_width",  w)
             .data("_ar_height", h)
             .trigger("autoreisze");
          }
        }
      });
    }
  }

});
