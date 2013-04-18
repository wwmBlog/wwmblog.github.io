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
    this.dotData     = [];
  }

  Graph.prototype.vertexSize  = 10;
  Graph.prototype.maskDotSize = 14 / 2;
  Graph.prototype.draw        = draw;
  Graph.prototype.animate     = animate;
  Graph.prototype.updateMask  = updateMask;
  Graph.prototype.getGroup    = function () { return this.group; }

  function draw () {

    if ( this.polygon ) {
      this.polygonMask.remove();
      this.group.remove();
    }

    this.dots = [];

    var maskDots = [];
    var canvas   = this.canvas;
    var mask     = canvas.clip();
    var group    = canvas.group();

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

      // Remeber each vertex's position
      // So that we can update the mask(clip).
      maskDots.push( pos );

      // Update the polygon string
      polygonString.push( pos.x + "," + pos.y );
    }

    var polygon = canvas.polygon(polygonString.join(" "), true).attr(this.effect);
    group.add(polygon);

    this.polygonMask = mask;
    this.group       = group;
    this.polygon     = polygon;


    // Deal with masks.
    this.updateMask( maskDots );
    polygon.clipWith( mask );

    // Transform the whole group
    this.canvas.moveToCenter( this.group );

    return this;
  }
  function animate() {
    // Ensure that all elements are ready.
    if ( !this.polygon ) { this.draw(); }

    this.dotData = [];

    // Prepare
    for ( var i = 0; i < this.dots.length; ++i )
    {
      var dot = this.dots[i];
      var x   = parseInt(dot.attr("cx"));
      var y   = parseInt(dot.attr("cy"));

      this.dotData[i] = {
          toX   : x
        , toY   : y
        , toDis : Math.sqrt( x*x + y*y )
      };

      dot.center( 0, 0 );
    }

    // Animation
    var DURATION  = 1500;
    var TO        = this.canvas.vertexPosition( 0 ); // Get the longest distance
    var DISTANCE  = Math.sqrt(TO.x*TO.x+TO.y*TO.y);
    var self      = this;

    $.genericAnimate(DISTANCE, DURATION, function( unit, p ){
      var dots          = self.dots;
      var maskdots      = new Array( dots.length );
      var polygonString = new Array( dots.length );

      for ( var i = 0; i < dots.length; ++i ) {
        var dot  = dots[i];
        var data = self.dotData[i];
        var pp   = unit / data.toDis;
        if ( pp > 1 ) { pp = 1; }
        var toX = data.toX * pp;
        var toY = data.toY * pp;

        dot.center( toX, toY );

        maskdots[i] = { x : toX, y : toY };

        polygonString[i] = toX + "," + toY;
      }

      self.updateMask( maskdots );

      // Deal with polygon
      self.polygon.attr("points", polygonString.join(" "));
    });

    return this;
  }

  function updateMask( dots ) {

    // Generate a path for the mask
    // In chrome, if the clipPath element contains several elements,
    // it will first render the clipPath to a bitmap then apply the bitmap
    // to the target. The bitmap is render at 1x even if in retina display.
    // So we need to only generate one element for the clippath
    var clippath = this.polygonMask.children()[0];
    if ( clippath == undefined ) {
      clippath = this.canvas.path().attr("clip-rule", "evenodd");
      this.polygonMask.add( clippath );
    }

    // Everything is trasformed from the origin of the svg to the center.
    // We need to shift the clippath, because the clippath is applied 
    // before the elements are trasformed.
    var offsetX = -this.canvas.CENTER;
    var offsetY = -this.canvas.CENTER;

    var bbox = this.canvas.boundingRect();
    var path = ["M", bbox.x+offsetX, bbox.y+offsetY,
                "l", bbox.width,  0,
                     0, bbox.height,
                     -bbox.width, 0,
                     0, -bbox.height].join(" ");

    // Create holes for vertex
    /* d="
        M cx cy
        m x = -r, y = 0
        a r,r 0 1,0 (r * 2),0
        a r,r 0 1,0 -(r * 2),0
     */
    var vr = this.maskDotSize;
    for ( var i = 0; i < dots.length; ++i ) {
      var dot = dots[i];
      path += [" M", dot.x, dot.y,
                "m", -vr, 0,
                "a", vr, vr, "0 1 0", vr * 2, 0,
                "a", vr, vr, "0 1 0", -vr* 2, 0].join(" ");
    }

    clippath.attr("d", path);
  }

});
