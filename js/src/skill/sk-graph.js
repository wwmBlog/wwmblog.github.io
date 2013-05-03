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

  Graph.prototype.vertexSize  = 10 / 2;
  Graph.prototype.maskDotSize = 14 / 2;
  Graph.prototype.draw        = draw;
  Graph.prototype.init        = init;
  Graph.prototype.animate     = animate;
  Graph.prototype.updateMask  = updateMask;
  Graph.prototype.getData     = getData;
  Graph.prototype.getGroup    = function () { return this.group; }

  function init ( force ) {
    if ( this.polygon ) {
      if ( force ) {
        this.polygonMask.remove();
        this.group.remove();
      } else {
        return;
      }
    }

    this.dots = [];

    var canvas   = this.canvas;
    var group    = canvas.group();

    // Draw dots
    var ds = this.data.data;
    for ( var i = 0; i < ds.length; ++i )
    {
      if ( ds[i] == null ) { continue; }
      var dot = canvas.circle(0,0).center(0,0).data("idx", i);

      this.dots.push( dot );
      group.add( dot );
    }

    this.polygonMask = canvas.clip();
    this.polygon     = canvas.polygon().clipWith( this.polygonMask ).attr("pointer-events", "none");
    this.group       = group.add( this.polygon );

    // Transform the whole group
    this.canvas.moveToCenter( this.group );
  }

  function draw () {

    this.init( true );

    var maskDots = [];
    var canvas   = this.canvas;

    // Draw dots
    var ds = this.data.data;
    var polygonString = [];

    for ( var i = 0, j = 0; i < ds.length; ++i )
    {
      if ( ds[i] == null ) { continue; }

      var pos = canvas.vertexPosition( i, ds[i].v );

      // Remeber each vertex's position
      // So that we can update the mask(clip).
      maskDots.push( pos );

      // Update the polygon string
      polygonString.push( pos.x + "," + pos.y );

      this.dots[j]
          .attr({ rx : this.vertexSize, ry : this.vertexSize })
          .center(pos.x, pos.y)
          .fill(this.data.stroke || "#000");

      ++j;
    }

    this.polygon.attr("points", polygonString.join(" ")).attr(this.effect);

    // Deal with masks.
    this.updateMask( maskDots );

    return this;
  }
  function animate() {
    // Ensure that all elements are ready.
    this.init();

    this.dotData = [];
    this.polygon.attr(this.effect);

    // Prepare
    var ds = this.data.data;
    for ( var i = 0, j = 0; i < ds.length; ++i )
    {
      if ( ds[i] == null ) { continue; }

      this.dots[j]
          .attr({ rx : this.vertexSize, ry : this.vertexSize })
          .fill(this.data.stroke || "#000");

      var pos = this.canvas.vertexPosition( i, ds[i].v );
      this.dotData[j] = {
          toX   : pos.x
        , toY   : pos.y
        , toDis : Math.sqrt( pos.x*pos.x + pos.y*pos.y )
      };

      ++j;
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

    var minX = 999999999;
    var minY = 999999999;
    var maxX = -99999999;
    var maxY = -99999999;
    var path = "";
    var vr   = this.maskDotSize;

    // Create holes for vertex
    /* d="
        M cx cy
        m x = -r, y = 0
        a r,r 0 1,0 (r * 2),0
        a r,r 0 1,0 -(r * 2),0
     */
    for ( var i = 0; i < dots.length; ++i ) {
      var dot = dots[i];
      path += [" M", dot.x, dot.y,
                "m", -vr, 0,
                "a", vr, vr, "0 1 0", vr * 2, 0,
                "a", vr, vr, "0 1 0", -vr* 2, 0,
                "z"].join(" ");

      if ( dot.x < minX ) { minX = dot.x; }
      if ( dot.x > maxX ) { maxX = dot.x; }
      if ( dot.y < minY ) { minY = dot.y; }
      if ( dot.y > maxY ) { maxY = dot.y; }
    }

    path = ["M", minX - vr, minY - vr,
            "L", maxX + vr, minY - vr,
                 maxX + vr, maxY + vr,
                 minX - vr, maxY + vr,
            "Z"].join(" ") + path;

    clippath.attr("d", path);
  }

  function getData ( element ) {
    var parent = element.parentNode || element.parentElement;
    if ( parent != this.group.node ) {
      return null;
    }

    var idx = parseInt( element.getAttribute('data-idx') );
    if ( !isNaN(idx) ) {
      var d = $.extend( {}, this.data.data[idx] );
      d['idx'] = idx;
      return d;
    }
    return null;
  }

});
