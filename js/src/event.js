define(function(require, exports){

  function EventTarget() {
    if ( this == window ) { return new EventTarget(); }
    
    this.__handlers = {};
    this.__handlersCount = 0;
  }

  EventTarget.prototype.on  = function(event, handler) {
    if ( typeof event != "string" || typeof handler != "function" ) { return; }
    var handlers = this.__handlers[event];
    if ( !handlers ) {
      handlers = [ handler ];
    } else {
      handlers.push( handler );
    }
    this.__handlersCount  += 1;
    this.__handlers[event] = handlers;
  }

  EventTarget.prototype.off = function(event, handler) {
    if ( typeof event != "string" || typeof handler != "function" ) { return; }
    var handlers = this.__handlers[event];
    if ( handlers ) {
      for ( var i = 0; i < handlers.length; ++i ) {
        if ( handlers[i] == handler ) {
          handlers.splice(i, 1);
          --this.__handlersCount;
          return;
        }
      }
    }
  }

  EventTarget.prototype.one = function(event, handler) {
    var self    = this;
    var wrapper = function( evt ) {
      self.off( event, wrapper );
      handler( evt );
    }
    self.on( event, wrapper );
  }

  EventTarget.prototype.trigger = function(event, eventObj) {
    if ( typeof event != "string" ) { return; }
    var handlers = this.__handlers[event];
    if ( handlers ) {
      for ( var i = 0; i < handlers.length; ++i ) {
        handlers[i](eventObj);
      }
    }
  }

  EventTarget.prototype.handlerCount = function () { return this.__handlersCount; }

  exports.EventTarget = EventTarget;

});
