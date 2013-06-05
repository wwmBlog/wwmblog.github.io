define(function(require, exports){

  require("src/misc.js");

  function Canvas ( domElement ) {

    if ( this == window ) { return new Canvas( domElement ); }

    if ( domElement.getContext ) {

      var context = domElement.getContext("2d");
      var dpr = window.devicePixelRatio || 1;
      var bsr = context.webkitBackingStorePixelRatio
                  || context.mozBackingStorePixelRatio
                  || context.msBackingStorePixelRatio
                  || context.oBackingStorePixelRatio
                  || context.backingStoreRatio
                  || 1;
      var ratio = dpr / bsr;


      this.ctx      = context;
      this.duration = 0;
      this.rqfID    = null;
      this.nodes    = [];
      var ss = getComputedStyle(domElement);
      this.width    = parseInt(ss.width) || domElement.width;
      this.height   = parseInt(ss.height)|| domElement.height;

      if ( dpr != bsr ) {
        context.scale( ratio, ratio );

        domElement.width  = this.width * ratio;
        domElement.height = this.height * ratio;

        domElement.style.width  = this.width + "px";
        domElement.style.height = this.height + "px";

        this.width  = domElement.width;
        this.height = domElement.height;
      }

      return this;
    } else {
      return null;
    }
  }

  // Private
  Canvas.prototype.updateDuration = function() {
    if ( this.duration ) { return; }

    this.nodes.forEach(function( element ){
      if ( this.duration < element.duration ) {
        this.duration = element.duration;
      }
    }, this);
  }
  Canvas.prototype.needRedraw = function( time ) {
    for ( var i = this.nodes.length - 1; i >= 0; --i ) {
      if ( this.nodes[i].needRedraw(time) ) {
        return true;
      }
    }
    return false;
  }

  // Public
  Canvas.prototype.background = null;
  Canvas.prototype.infinite   = true;

  Canvas.prototype.context = function() { return this.ctx; }
  Canvas.prototype.addNode = function( node ) {
    this.nodes[this.nodes.length] = node;
    this.duration = 0;
  };

  Canvas.prototype.animate = function() {
    if ( this.rqfID ) { return; }

    this.updateDuration();

    var self   = this;
    var start  = Date.now();
    var elapse, t;

    this.onRequest = function () {

      elapse = Date.now() - start;
      if ( elapse > self.duration && self.infinite == false ) {
        self.onRequest = null;
        self.rqfID     = null;
        return;
      }

      var restart = elapse > self.duration + 1;
      if ( restart ) {
        t = elapse % (self.duration + 1);
        start += self.duration + 1;
      } else {
        t = elapse;
      }

      if ( restart || self.needRedraw(t) ) {
        self.render( t, restart );
      }

      self.rqfID = requestAnimationFrame( self.onRequest );
    }

    this.render();
    this.rqfID = requestAnimationFrame( this.onRequest );
  };

  Canvas.prototype.stop = function() {
    if ( this.rqfID ) {
      cancelAnimationFrame( this.rqfID );
      this.rqfID = null;
    }
  };

  Canvas.prototype.render = function( time, restart ) {
    // Clear of set the background.
    this.ctx.clearRect(0, 0, this.width, this.height);

    if ( this.background ) {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Render all nodes.
    this.ctx.save(); 
    for ( var i = 0, len = this.nodes.length; i < len; ++i ) {
      var n = this.nodes[i];
      if ( restart ) n.restart();

      n.doRender( this.ctx, time || 0 );
    }
    this.ctx.restore();
  };

  return Canvas;
});

