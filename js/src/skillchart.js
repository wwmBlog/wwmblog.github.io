define(function(require){

  require("src/misc.js");
  var SVG  = require("SVG");
  var data = require("data/skill.js");
  var draw = SVG("W_skillChart");

  var data_pro   = data.pro;
  var data_basic = data.basic;
  var dotCount   = data_pro.length + data.basic.length;
  var RADIUS     = 110;
  var CENTER     = 230 / 2;

  function cos( deg ) { return Math.cos( deg * Math.PI / 180 ); }
  function sin( deg ) { return Math.sin( deg * Math.PI / 180 ); }

  $("#W_skillChart").on("autoresize", rerender);

  function rerender() {
    draw.clear();
    beforeRender();
    renderBG();
  }

  function beforeRender () {
    var container = $("#W_skillChart");
    CENTER = container.width() / 2;
    RADIUS = CENTER - 5;
  }

  function renderBG () {
    var angle     = 360 / dotCount;
    var colors    = ["#e2ddce", "#d8d1be", "#d1c8b1", "#cac1a9", "#c5bca3"];
    var color_len = colors.length;
    for ( var i = 0; i < color_len; ++i ) {
      var string = [];
      var r      = Math.floor((color_len - i) / color_len * RADIUS);
      for ( var j = 0; j < dotCount; ++j )
      {
        var a = 90 - angle * j;
        var x = Math.floor( cos(a) * r );
        var y = Math.floor( sin(a) * r );
        string.push(x + "," + y);
      }
      draw.polygon(string.join(" "), true)
          .fill(colors[i])
          .move(CENTER, CENTER);
    }
  };

  rerender();
});
