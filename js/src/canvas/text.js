define(function(require){

  var Node = require("./node.js");

  function Text ( text, font ) {
    Node.call( this );

    this.attrs.font = font;
    this.attrs.text = text;
  }

  Text.prototype = new Node();
  Text.prototype.render = function( ctx, attrs ) {
    
    ctx.font = attrs.font;
    ctx.textBaseline = this.textBaseline || "top";
    ctx.textAlign    = this.textAlign    || "center";
    
    ctx.fillText( attrs.text, attrs.x || 0, attrs.y || 0 );

    if ( attrs.lineWidth ) {
      ctx.strokeText( attrs.text, attrs.x || 0, attrs.y || 0 );
    }
  }

  return Text;

});
