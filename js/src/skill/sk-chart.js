define(function( require, exports, module ){

  module.exports = RadarChart;

  var Graph = require("src/skill/sk-graph.js");

  function RadarChart ( data, elementID ) {

    var canvas = SVG(elementID);

    // Setting data
    canvas.elementID = elementID;
    canvas.data      = data;
    canvas.unitAngle = 360 / data.labels.length;
    canvas.maxValue  = 5;

    canvas.firstRender = true;

    // Graphs
    canvas.graphs    = [];
    var datasets = data.datasets;
    for ( var i = 0; i < datasets.length; ++i ) {
      canvas.graphs.push( new Graph(datasets[i], canvas) );
    }

    canvas.render         = render;
    canvas.renderBG       = renderBG;
    canvas.renderGraphs   = renderGraphs;
    canvas.moveToCenter   = moveToCenter;
    canvas.vertexPosition = vertexPosition;
    canvas.setup          = setup;
    canvas.getData        = getData;
    

    canvas.EVT_RESIZE   = "resize";

    canvas.setup();
    canvas.renderBG();

    return canvas;
  }

  function setup () {
    // Container Info
    this.CENTER = document.getElementById(this.elementID).clientWidth / 2;
    this.RADIUS = this.CENTER - 50;
  }

  function renderBG () {

    var group  = this.group();
    var colors = ["#e2ddce", "#d8d1be", "#d1c8b1", "#cac1a9", "#c5bca3"];
    var c_len  = colors.length;
    var labels = this.data.labels;

    // Generate level bg
    for ( var i = 0; i < c_len; ++i ) {
      var string = [];

      for ( var j = labels.length - 1; j >= 0; --j )
      {
        var pos = this.vertexPosition(j, c_len - i);
        string.push(pos.x + "," + pos.y);
      }
      

      group.add( this.polygon(string.join(" "), true).fill(colors[i]) );
    }

    // Generate label
    var labelStyle = {
        size   : "12px"
      , anchor : "middle"
      , fill   : "#b4ac95"
    };

    var LABEL_LEN     = labels.length;
    var LABEL_LEN_1_4 = LABEL_LEN / 4;
    var LABEL_LEN_2_4 = LABEL_LEN / 2;
    var LABEL_LEN_3_4 = LABEL_LEN_1_4 * 3;

    for ( i = 0; i < labels.length; ++i )
    {
      var pos  = this.vertexPosition(i, 5.2);
      var text = this.text(labels[i])
                     .font(labelStyle);

      var bbox = text.node.getBBox();

      if ( i < LABEL_LEN_2_4 && i > 0) {
        pos.x += bbox.width / 2;
      } else if ( i != 0 && i != LABEL_LEN_2_4 ) {
        pos.x -= bbox.width / 2;
      }

      if ( i < LABEL_LEN_3_4 && i > LABEL_LEN_1_4 ) {
        pos.y += bbox.height / 2;
      } else if ( i != LABEL_LEN_1_4 && i != LABEL_LEN_3_4 ) {
        pos.y -= bbox.height / 2;
      }

      text.center( pos.x, pos.y );

      group.add( text );
    }

    this.moveToCenter( group );
  }
  function renderGraphs () {
    for ( var i = 0; i < this.graphs.length; ++i ) {
      var g = this.graphs[i];
      if ( this.firstRender ) {
        g.animate();
      } else {
        g.draw();
      }
    }
  }
  function render ( event ) {

    if ( event == this.EVT_RESIZE ) {
      this.setup();
      this.clear();
      this.renderBG();
      if ( this.firstRender == false )
      {
        this.renderGraphs();
      }
    } else if ( this.firstRender ) {
      this.renderGraphs();
      this.firstRender = false;
    }
  }
  function moveToCenter ( svgElement ) {
    svgElement.transform( { "x" : this.CENTER, "y" : this.CENTER });
  }
  function vertexPosition ( index, value ) {

    var a = 90 - this.unitAngle * index;
    var p = value == undefined ? 1 : value / this.maxValue;

    var x =   Math.floor( cos(a) * this.RADIUS * p );
    var y = - Math.floor( sin(a) * this.RADIUS * p );

    return { x : x, y : y };
  }

  function getData( vetexElement ) {
    for ( var i = 0; i < this.graphs.length; ++i )
    {
      var d = this.graphs[i].getData( vetexElement );
      if ( d ) { 
        d['name'] = this.data.labels[d.idx];
        return d;
      }
    }
    return null;
  }

  /* Helpers */
  function cos( deg ) { return Math.cos( deg * Math.PI / 180 ); }
  function sin( deg ) { return Math.sin( deg * Math.PI / 180 ); }

});
