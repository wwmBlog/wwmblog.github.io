define(function(require){

  var Canvas = require("./canvas.js");

  function HexagonCanvas( domElement ) {
    var c = new Canvas( domElement );

    var ctx = c.ctx;
    ctx.beginPath();
    var hw = c.width  / 2;
    var qh = c.height / 4;
    ctx.moveTo( hw, 0);
    ctx.lineTo(c.width, qh );
    ctx.lineTo(c.width, qh * 3 );
    ctx.lineTo( hw, c.height );
    ctx.lineTo( 0, qh * 3 );
    ctx.lineTo( 0, qh );
    ctx.clip();

    return c;
  }

  return HexagonCanvas;
});
