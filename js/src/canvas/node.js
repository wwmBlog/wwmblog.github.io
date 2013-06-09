define(function(require){

  require("../misc.js");

  // Posible attrs :
  // [ fill , stroke , lineWidth , font , alpha , scale , rotate , visible ]

  function Node() { 
    this.states       = [];
    this.lastStateIdx = -1;
    this.attrs = {};
  }

  Node.prototype.needRedraw = function( nextTime ) {

    if ( this.lastStateIdx == -1 ) { return true; }

    var currDrawnIdx = -1;
    var len = this.states.length;

    for ( var i = this.lastStateIdx; i < len; ++i ) {
      s = this.states[i];
      if ( s.start <= nextTime ) {
        if ( s.start + s.length > nextTime || i == len - 1)
        {
          currDrawnIdx = i;
          break;
        }
      }
    }

    for ( var i = this.lastStateIdx + 1; i <= currDrawnIdx; ++i ) {
      if ( this.states[i].type != "D" ) {
        return true;
      }
    }

    return this.states[currDrawnIdx].type != "D";
  };

  Node.prototype.getCurrentAttr = function ( time ) {

    var currDrawnIdx = -1;
    var len = this.states.length;
    var s;

    var safeLastIdx = this.lastStateIdx >= 0 ? this.lastStateIdx : 0;

    if ( len == 0 ) { return this.attrs; }

    for ( var i = safeLastIdx; i < len; ++i ) {
      s = this.states[i];
      if ( s.start <= time ) {
        if ( s.start + s.length > time || i == len - 1 )
        {
          currDrawnIdx = i;
          break;
        }
      }
    }

    var newAttr;
    if ( currDrawnIdx != this.lastStateIdx ) {
      newAttr = $.extend( true, {}, this.currAttrs || this.attrs);
      for ( i = safeLastIdx; i < currDrawnIdx; ++i ) {
        s = this.states[i];
        if ( s.type != "D" ) {
          $.extend( true, newAttr, s.to);
        }
      }

      this.lastStateIdx = currDrawnIdx;
      this.currAttrs    = newAttr;
    } else {
      newAttr = this.currAttrs;
    }

    s = this.states[currDrawnIdx];
    if ( s.type == "T" ) {
      newAttr = $.extend( true, {}, newAttr );

      var s  = this.states[currDrawnIdx];
      var to = s.to;
      var e  = $.easing( (time - s.start) / s.length, s.easing );
      for ( i in to ) {
        switch( i ) {
          case "scale" :
            newAttr.scale = newAttr.scale ? newAttr.scale : { x : 1, y : 1 };
            newAttr.scale.x = ( to.scale.x - newAttr.scale.x ) * e + newAttr.scale.x;
            newAttr.scale.y = ( to.scale.y - newAttr.scale.y ) * e + newAttr.scale.y;
            break;
          case "translate" :
            newAttr.translate = newAttr.translate ? newAttr.translate : { x : 0, y : 0 };
            newAttr.translate.x = ( to.translate.x - newAttr.translate.x ) * e + newAttr.translate.x;
            newAttr.translate.y = ( to.translate.y - newAttr.translate.y ) * e + newAttr.translate.y;
            break;
          case "alpha" :
            newAttr.alpha = newAttr.alpha !== undefined ? newAttr.alpha : 1;
            newAttr.alpha = ( to.alpha - newAttr.alpha ) * e + newAttr.alpha;
            break;
          default :
            newAttr[i] = newAttr[i] ? newAttr[i] : 0;
            newAttr[i] = ( to[i] - newAttr[i] ) * e + newAttr[i]; 
            break;
        }
      }
    }

    return newAttr;
  }

  Node.prototype.restart = function() {
    this.currAttrs    = this.attrs;
    this.lastStateIdx = -1;
  }

  Node.prototype.doRender = function( context, time ) {

    if ( time === 0 ) { this.restart(); }

    var attrs = this.getCurrentAttr( time );
    if ( attrs.visible === false || attrs.alpha === 0 ) { return; }

    context.fillStyle   = attrs.fill   || "#000000";
    context.strokeStyle = attrs.stroke || "#000000";
    context.lineWidth   = attrs.lineWidth || 1;
    context.globalAlpha = attrs.alpha !== undefined ? attrs.alpha : 1;

    if ( attrs.translate ) { context.translate( attrs.translate.x, attrs.translate.y ); }
    if ( attrs.scale     ) { context.scale( attrs.scale.x, attrs.scale.y ); }
    if ( attrs.rotate    ) { var rrr = attrs.rotate * Math.PI / 180; context.rotate( rrr ); }

    this.render( context, attrs );

    if ( attrs.rotate    ) { context.rotate( -rrr ); }
    if ( attrs.scale     ) { context.scale( 1 / attrs.scale.x, 1/ attrs.scale.y ); }
    if ( attrs.translate ) { context.translate( -attrs.translate.x, -attrs.translate.y ); }
  };

  Node.prototype.render = function( context, attrs ) {};

  Node.prototype.d = function( time ) {
    var lastState = this.states[this.states.length - 1];
    var s = {
          start  : lastState ? lastState.start + lastState.length : 0
        , length : time
        , type   : "D"
    };

    this.states.push(s);
    this.duration = s.start + s.length;
    return this;
  };
  Node.prototype.t = function ( props, duration, easing ) {
    var lastState = this.states[this.states.length - 1];
    var s = {
          start  : lastState ? lastState.start + lastState.length : 0
        , length : duration
        , type   : "T"
        , easing : easing ? easing : "linear"
        , to     : props
    };

    this.states.push(s);
    this.duration = s.start + s.length;
    return this;
  };

  Node.prototype.c = function ( props ) {
    var lastState = this.states[this.states.length - 1];
    var s = {
          start  : lastState ? lastState.start + lastState.length : 0
        , length : 0
        , type   : "C"
        , to     : props
    };

    this.states.push(s);
    this.duration = s.start + s.length;
    return this;
  };

  Node.prototype.clearAnimation = function () { this.states = []; };

  return Node;
});
