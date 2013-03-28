define(function(require){

  require("src/misc.js");
  var SVG = require("SVG");

  var SVG_EASE_IN    = {keyTimes:"0; 1",keySplines:".42 0 1 1"};
  var SVG_EASE_OUT   = {keyTimes:"0; 1",keySplines:"0 0 .58 1"};
  var SVG_EASE_INOUT = {keyTimes:"0; 1",keySplines:".42 0 .58 1"};

  /* svg.js Extentions*/
  SVG.extend(SVG.Shape, {

    // Old webkit seems to not support beginElement()
    // So we need a hack to trigger animation.

    // NOTE : If the build in JS-BASED animation of svg.js is good
    // enough, we don't need native animation to work.
    // Actually, I don't want to risk to use native animation, if
    // I'm not sure whether the animation will go...
    nativeAnimate : function( attrObj, duration, easing ) {

      var duration = duration ? duration / 1000 + "s" : "0.4s";
      for ( var n = this; n && n.type != "svg"; ) {
        n = n.parent;
      }
      var id = n.node.getAttribute("id");

      for (var i in attrObj) {
        if ( attrObj.hasOwnProperty(i) ) {
          try {
            var el = document.createElementNS(SVG.ns, "animate");
            el.setAttribute("attributeName", i);
            el.setAttribute("to",   attrObj[i]);
            el.setAttribute("fill", "freeze");
            el.setAttribute("dur",  duration);
            el.setAttribute("begin", id + ".DOMNodeInserted");
            el.setAttribute("attributeType", "XML");
            if ( easing ) {
              el.setAttribute("keyTimes",   easing.keyTimes);
              el.setAttribute("keySplines", easing.keySplines);
            }
    
            this.node.appendChild(el);

          } catch (e) {
            console.log(e);
          }
        }
      }
      return this;
    }
  });

  /* Graph */
  function Graph( data, canvas ) {
    this.data    = data;
    this.canvas  = canvas;
    this.effect  = {
        "fill"         : data.fill        || "#000"
      , "fill-opacity" : data.fillOpacity || 1
      , "stroke"       : data.stroke      || "#000"
      , "stroke-width" : data.strokeWidth || 1
    }

    this.dots        = [];
    this.polygon     = null;
    this.polygonMask = null;
    this.group       = null;
  }
  Graph.prototype.vertexSize = 10;
  Graph.prototype.draw = function () {

    var canvas = this.canvas;
    var mask   = canvas.mask();
    var group  = canvas.group();

    // Draw dots
    var ds      = this.data.data;
    var polygon = [];

    for ( var i = 0; i < ds.length; ++i )
    {
      if ( ds[i] == null ) { continue; }

      var pos = canvas.vertexPosition( i, ds[i].v );

      var dot = canvas.circle(this.vertexSize, this.vertexSize)
                      .center(pos.x, pos.y)
                      .fill(this.data.stroke || "#000");

      this.dots.push( dot );

      polygon.push( pos.x + "," + pos.y );
    }

    var polygon = canvas.polygon(polygon.join(" "), true).attr(this.effect);
    group.add(polygon);

    // Deal with masks.
    var bbox = polygon.bbox();
    bbox.width  += this.data.strokeWidth * 2 + 2;
    bbox.height += this.data.strokeWidth * 2 + 2;
    bbox.x      -= this.data.strokeWidth + 1;
    bbox.y      -= this.data.strokeWidth + 1;

    var maskRect = canvas.rect( bbox.width, bbox.height )
                         .move( bbox.x,     bbox.y )
                         .fill( "#fff" );
    mask.add( maskRect );

    for ( i = 0; i < this.dots.length; ++i )
    {
      group.add(this.dots[i]);
      mask.add(this.dots[i].clone()
                           .attr({ 
                                fill : "#000"
                              , rx   : this.vertexSize / 2 + 2
                              , ry   : this.vertexSize / 2 + 2
                              , transform : "" }));
    }

    polygon.maskWith( mask );

    this.group       = group;
    this.polygonMask = mask;
    this.polygon     = polygon;
  }
  Graph.prototype.animate = function () {

  }


  /* Canvas */
  
  var canvas = SVG("W_skillChart");
  canvas.setDataSet = function ( data ) {
    this.data      = data;
    this.unitAngle = 360 / data.labels.length;
    this.maxValue  = 5;
    this.graphs    = [];

    var datasets = data.datasets;
    for ( var i = 0; i < datasets.length; ++i ) {
      this.graphs.push( new Graph(datasets[i], this) );
    }

    this.setup();
    this.renderBG();
  }

  canvas.render = function () {
    this.clear();
    this.renderBG();
    this.renderGraphs();

    // // This is the hack to kick off the animation
    // var self = this;
    // setTimeout(function(){
    //   self.node.appendChild(document.createElementNS(SVG.ns, "desc"));
    // }, 10);
  }

  canvas.setup = function () {
    var $c = $("#W_skillChart");

    this.CENTER = $c.width() / 2;
    this.RADIUS = this.CENTER - 5; 
  }

  canvas.renderBG = function () {

    var group = this.group();

    var colors = ["#e2ddce", "#d8d1be", "#d1c8b1", "#cac1a9", "#c5bca3"];
    var c_len  = colors.length;

    var labels = this.data.labels;

    for ( var i = 0; i < c_len; ++i ) {
      var string = [];

      for ( var j = labels.length - 1; j >= 0; --j )
      {
        var pos = this.vertexPosition(j, c_len - i);
        string.push(pos.x + "," + pos.y);
      }
      

      group.add( this.polygon(string.join(" "), true).fill(colors[i]) );
    }

    var labelStyle = {
        size   : "12px"
      , anchor : "middle"
      , fill   : "#b4ac95"
    };

    for ( i = 0; i < labels.length; ++i )
    {
      var pos  = this.vertexPosition(i, 6);
      var text = this.text(labels[i])
                     .font(labelStyle)
                     .move(pos.x, pos.y);
      group.add( text );
    }


  }
  canvas.renderGraphs = function() {
    for ( var i = 0; i < this.graphs.length; ++i ) {
      this.graphs[i].draw();
    }
  }
  canvas.vertexPosition = function ( index, value ) {
    var a = 90 - this.unitAngle * index;
    var p = value / this.maxValue;
    var x = this.CENTER + Math.floor( cos(a) * this.RADIUS * p );
    var y = this.CENTER - Math.floor( sin(a) * this.RADIUS * p );

    return { x : x, y : y };
  }

  /* Helpers */
  function cos( deg ) { return Math.cos( deg * Math.PI / 180 ); }
  function sin( deg ) { return Math.sin( deg * Math.PI / 180 ); }

  /* Data / Entrance */
  var data = require("data/skill.js");
  canvas.setDataSet( data );

  $("#W_skillChart").on("autoresize", function(){ canvas.render(); });

  var ScrollWatcher = require("src/scrollwatcher.js");
  var chartW  = new ScrollWatcher( ".page1" );
  chartW.on("scrollabove", onShown)
  function onShown () { 
    canvas.render();
    chartW.off("scrollabove", onShown);
    console.log(" Scrolled Into ");
  }
});
