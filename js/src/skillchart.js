define(function(require){

  require("src/misc.js");

  /* Graph */
  function Graph( data, canvas ) {
    this.data   = data;
    this.canvas = canvas;
    this.prototype.graphs.push(this);
  }
  Graph.prototype.draw = function () {

  }


  /* Canvas */
  var SVG    = require("SVG");
  var canvas = SVG("W_skillChart");
  canvas.setDataSet = function ( dataset ) {
    this.data = dataset;
    this.render();
  }

  canvas.render = function () {
    this.clear();
    this.setup();
    this.renderBG();
  }

  canvas.setup = function () {
    var $c = $("#W_skillChart");

    this.CENTER = $c.width() / 2;
    this.RADIUS = this.CENTER - 5; 
  }

  canvas.renderBG = function () {
    var labels = this.data.labels;
    var angle  = 360 / labels.length;
    var colors = ["#e2ddce", "#d8d1be", "#d1c8b1", "#cac1a9", "#c5bca3"];
    var c_len  = colors.length;

    for ( var i = 0; i < c_len; ++i ) {
      var string = [];
      var r      = Math.floor((c_len - i) / c_len * this.RADIUS);

      for ( var j = 0; j < labels.length; ++j )
      {
        var a = 90 - angle * j;
        var x = Math.floor( cos(a) * r );
        var y = Math.floor( sin(a) * r );
        string.push(x + "," + y);
      }
      
      this.polygon(string.join(" "), true)
          .fill(colors[i])
          .move(this.CENTER, this.CENTER);
    }
  }

  /* Helpers */
  function cos( deg ) { return Math.cos( deg * Math.PI / 180 ); }
  function sin( deg ) { return Math.sin( deg * Math.PI / 180 ); }

  /* Data / Entrance */
  var data = require("data/skill.js");
  canvas.setDataSet( data );
  $("#W_skillChart").on("autoresize", function(){ canvas.render(); });
});
