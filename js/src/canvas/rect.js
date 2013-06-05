define(function(require){

  var Node = require("./node.js");

  function Rect (x, y, width, height) {
    Node.call( this );

    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
  }

  Rect.prototype = new Node();
  Rect.prototype.render = function( ctx, attrs ) {
    ctx.fillRect( this.x, this.y, this.width, this.height );

    if ( attrs.lineWidth ) {
      ctx.strokeRect( this.lineWidth );
    }
  }

  return Rect;

});
