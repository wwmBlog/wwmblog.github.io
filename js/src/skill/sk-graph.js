define(function(require, exports, module){

  module.exports = Graph;

  require("src/misc.js");

  function Graph( data, canvas ) {

    this.data       = data;
    this.canvas     = canvas;

    this.effect = {
        "fill"         : data.fill        || "#000"
      , "fill-opacity" : data.fillOpacity || 1
      , "stroke"       : data.stroke      || "#000"
      , "stroke-width" : data.strokeWidth || 1
    }

    this.polygon     = null;
    this.polygonMask = null;
    this.group       = null;

    this.dots        = [];
    this.maskDots    = [];
  }

  Graph.prototype.vertexSize = 10;
  Graph.prototype.draw       = draw;
  Graph.prototype.animate    = animate;
  Graph.prototype.getGroup   = function () { return this.group; }

  function draw () {

    if ( this.polygon ) {
      this.polygonMask.remove();
      this.group.remove();
    }

    this.dots        = [];
    this.maskDots    = [];

    var canvas = this.canvas;
    var mask   = canvas.mask();
    var group  = canvas.group();

    // Draw dots
    var ds = this.data.data;
    var polygonString = [];

    for ( var i = 0; i < ds.length; ++i )
    {
      if ( ds[i] == null ) { continue; }

      var pos = canvas.vertexPosition( i, ds[i].v );

      var dot = canvas.circle(this.vertexSize, this.vertexSize)
                      .center(pos.x, pos.y)
                      .fill(this.data.stroke || "#000");

      this.dots.push( dot );
      group.add( dot );

      // Dot for the mask
      var maskDot = dot.clone().attr({
                        fill : "#000"
                      , rx   : this.vertexSize / 2 + 2
                      , ry   : this.vertexSize / 2 + 2
                      , transform : "" });
      mask.add( maskDot );
      this.maskDots.push( maskDot );

      // Update the polygon string
      polygonString.push( pos.x + "," + pos.y );
    }

    var polygon = canvas.polygon(polygonString.join(" "), true).attr(this.effect);
    group.add(polygon);

    // Deal with masks.
    var bbox = polygon.bbox();
    var sw   = this.data.strokeWidth;
    bbox.width  += sw * 2 + 2;
    bbox.height += sw * 2 + 2;
    bbox.x      -= sw + 1;
    bbox.y      -= sw + 1;

    mask.add( canvas.rect( bbox.width, bbox.height ).move( bbox.x, bbox.y ).fill( "#fff" ), 0 );

    polygon.maskWith( mask );

    this.group       = group;
    this.polygonMask = mask;
    this.polygon     = polygon;

    // Transform the whole group
    this.canvas.moveToCenter( this.group );

    return this;
  }
  function animate() {
    // Ensure that all elements are ready.
    if ( !this.polygon ) { this.draw(); }

    // Prepare
    for ( var i = 0; i < this.dots.length; ++i )
    {
      var dot = this.dots[i];
      var x   = parseInt(dot.attr("cx"));
      var y   = parseInt(dot.attr("cy"));
      dot.data("toX",    x)
         .data("toY",    y)
         .data("toDis",  Math.sqrt(x*x+y*y))
         .center( 0, 0 );
    }

    // Animation
    var DURATION  = 1500;
    var TO        = this.canvas.vertexPosition( 0 ); // Get the longest distance
    var DISTANCE  = Math.sqrt(TO.x*TO.x+TO.y*TO.y);
    var self      = this;

    $.genericAnimate(DISTANCE, DURATION, function( unit, p ){
      var dots          = self.dots;
      var maskdots      = self.maskDots;
      var polygonString = [];

      for ( var i = 0; i < dots.length; ++i ) {
        var dot = dots[i];
        var pp  = unit / dot.data("toDis");
        if ( pp > 1 ) { pp = 1; }
        var toX = dot.data("toX") * pp;
        var toY = dot.data("toY") * pp;

        dot.center( toX, toY );
        maskdots[i].center( toX, toY );

        polygonString.push( toX + "," + toY );
      }

      // Deal with polygon
      self.polygon.attr("points", polygonString.join(" "));
    });

    return this;
  }

});
