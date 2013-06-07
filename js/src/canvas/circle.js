define(function(require){

  var Node = require("./node.js");

  function Circle (x, y, radius) {
    Node.call( this );

    this.attrs.x      = x;
    this.attrs.y      = y;
    this.attrs.radius = radius;
  }

  Circle.prototype = new Node();
  Circle.prototype.render = function( ctx, attrs ) {
    ctx.beginPath();
    ctx.arc( attrs.x, attrs.y, attrs.radius, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
    if ( attrs.lineWidth ) { ctx.stroke(); }
  }

  return Circle;

});
