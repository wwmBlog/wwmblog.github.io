define(function(require){

  var data          = require("data/skill.js");
  var RadarChart    = require("src/skill/sk-chart.js");
  var ScrollWatcher = require("src/scrollwatcher.js");

  var chart         = new RadarChart( data, "W_skillChart" );

  $("#W_skillChart").watchAutoResize()
                    .on("autoresize", function(){ chart.render( chart.EVT_RESIZE ); });


  var chartW  = new ScrollWatcher( ".page1" );
  chartW.one("scrollabove", function(){ chart.render(); console.log(" scrolled into "); });
});
