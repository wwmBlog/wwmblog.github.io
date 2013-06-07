define(function(require){

  var Canvas = require("./canvas.js");

  function HexagonCanvas( domElement ) {
    var c = new Canvas( domElement );
    c._render = c.render;
    c.render  = render;
    return c;
  }

  function render ( time, restart ) {

    this._render( time, restart );

    var ctx = this.ctx;

    // Draw to the clip with dest-in
    ctx.beginPath();
    var hw = this.width  / 2;
    var qh = this.height / 4;
    ctx.moveTo( hw, 0);
    ctx.lineTo(this.width, qh );
    ctx.lineTo(this.width, qh * 3 );
    ctx.lineTo( hw, this.height );
    ctx.lineTo( 0, qh * 3 );
    ctx.lineTo( 0, qh );

    ctx.globalCompositeOperation = "destination-in";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  return HexagonCanvas;
});
