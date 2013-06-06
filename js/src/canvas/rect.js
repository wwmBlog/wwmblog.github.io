define(function(require){

  var Node = require("./node.js");

  function Rect (x, y, width, height) {
    Node.call( this );

    this.attrs.x      = x;
    this.attrs.y      = y;
    this.attrs.width  = width;
    this.attrs.height = height;
  }

  Rect.prototype = new Node();
  Rect.prototype.render = function( ctx, attrs ) {
    
    ctx.fillRect( attrs.x, attrs.y, attrs.width, attrs.height );

    if ( attrs.lineWidth ) {
      ctx.strokeRect( attrs.x, attrs.y, attrs.width, attrs.height );
    }
  }

  return Rect;

});
