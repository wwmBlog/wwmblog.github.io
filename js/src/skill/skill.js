define(function(require){

  var data          = require("data/skill.js");
  var RadarChart    = require("src/skill/sk-chart.js");
  var ScrollWatcher = require("src/scrollwatcher.js");

  var chart         = new RadarChart( data, "W_skillChart" );

  $("#W_skillChart").on("autoresize", function(){ chart.render(); });

  var chartW  = new ScrollWatcher( ".page1" );
  chartW.on("scrollabove", onShown)
  function onShown () { 
    chart.render();
    chartW.off("scrollabove", onShown);
    console.log(" Scrolled Into ");
  }

});
