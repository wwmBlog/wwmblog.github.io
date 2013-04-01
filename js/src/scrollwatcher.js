define(function(require, exports, module){

  // Inspired by scrollMonitor(https://github.com/sakabako/scrollMonitor)
  // However, this Monitor only watches a point, instead of a rectangle.

  module.exports = ScrollWatcher;

  // Requires
  require("libs/zepto.js");
  require("src/misc.js");
  var EventTarget = require("src/event.js").EventTarget;


  var watcherList    = [];
  if ( !watcherList.forEach ) {
    watcherList.forEach = function ( fn ) {
      for ( var i = 0; i < this.length; ++i ) { fn.apply( this[i] ); }
    }
  }
  /* -- ScrollWatcher -- */
  // Watcher should be independent.
  // e.g. Watcher A watches element B, and changes element C's position.
  // Then element C should not be watched.
  function ScrollWatcher( watchElement, offset ) {

    // watchElement can be:
    // number    : position relative to the document
    // string    : selector string to select the element
    // dom       : the element
    // zepto_obj : the element
    
    this.offset  = offset || 0;
    this.element = watchElement;
    this.emmiter = new EventTarget();

    var type = typeof watchElement;
    if ( type == "number" ) {
      this.offset  = watchElement;
      this.element = $(document.documentElement);
    } else if ( type == "string" || !watchElement.length ) {
      this.element = $(watchElement);
    }

    if ( viewportTop != 0 ) {
      // If the window has been scroll, I want to fire an event.
      // So we need to delay until next cycle,
      // so that the event handlers have been bound.
      var self = this;
      setTimeout( function(){ self.update(); }, 18 );
    } else {
      this.update();
    }
  }

  ScrollWatcher.prototype.on = function ( event, callback ) {
    if ( this.emmiter.handlerCount() == 0 ) {
      watcherList.push( this );
    }
    this.emmiter.on( event, callback );
    return this;
  }
  ScrollWatcher.prototype.off = function ( event, callback ) {
    this.emmiter.off( event, callback );
    if ( this.emmiter.handlerCount() == 0 ) {
      for ( var i = watcherList.length - 1 ; i >= 0; --i )
      {
        if ( watcherList[i] == this ) {
          watcherList.splice( i, 1 );
          break;
        }
      }
    }
    return this;
  }
  ScrollWatcher.prototype.trigger = function ( event, eventObj ) {
    this.emmiter.trigger( event, eventObj );
    return this;
  }

  // Recalcs the position of the watched item.
  // One should manually call update() if the watched item moved potentially
  // Updating a watcher may fire events.
  ScrollWatcher.prototype.update = function () {
    this.watchY = this.element.offset().top;

    if ( this.offset < 0 ) {
      this.watchY += theHeight.apply( this.element ) + this.offset;
    } else if ( this.offset > 0 ) {
      this.watchY += this.offset;
    }

    this.notify();
  }

  // Trigger Events if state changed.
  ScrollWatcher.prototype.notify = function () {

    this.prevAbove = this.currAbove;
    this.prevBelow = this.currBelow;

    if ( this.watchY < viewportTop ) {
      this.currAbove = true;
      this.currBelow = false;
    } else if ( this.watchY > viewportBottom ) {
      this.currAbove = false;
      this.currBelow = true;
    } else {
      this.currAbove = false;
      this.currBelow = false;
    }

    if ( this.prevAbove != this.currAbove && this.currAbove == true ) {
      this.emmiter.trigger( "scrollabove" );
      return;
    }

    if ( this.prevBelow != this.currBelow && this.currBelow == true ) {
      this.emmiter.trigger( "scrollbelow" );
      return;
    }

    if ( this.currAbove == false && this.currBelow == false ) {
      if ( this.prevAbove != false || this.prevBelow != false ) {
        this.emmiter.trigger( "scrollinto" );
      }
    }
  }

  function theHeight () {
    var el = this[0];
    if ( el == document.documentElement ) {
      return el.scrollHeight;
    } else {
      return this.height();
    }
  }

  // Variables used.
  var viewportTop    = 0;
  var viewportBottom = 0;
  var viewportHeight = 0;
  var docHeight      = 0;
  var docEl          = document.documentElement;

  function calcViewport() {
    viewportHeight = docEl.offsetHeight;
    viewportTop    = window.scrollTop || window.scrollY;
    viewportBottom = viewportTop + viewportHeight;
    docHeight      = docEl.scrollHeight;
  }

  function notifyWrap ( thisObj ) { thisObj.notify(); }
  function updateWrap ( thisObj ) { thisObj.update(); }

  // Update All Stuffs when Window Scrolled / Resized.
  function onWinResize () {
    calcViewport();

    // Update all items if the body has been resized.
    // Note that one need to manually update the item,
    // if the item might have changed.
    watcherList.forEach( updateWrap );
  }
  function onWinScroll () {
    calcViewport();
    watcherList.forEach( notifyWrap );
  }

  calcViewport();

  var resizeDebounceTO = null;
  var RESIZE_THRESHOLD = 250;
  $(window)
    .on("scroll", function(e){ onWinScroll(); })
    .on("debouncedResize", onWinResize);

});
