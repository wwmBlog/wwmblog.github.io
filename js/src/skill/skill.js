define(function(require){

  var data          = require("data/skill.js");
  var RadarChart    = require("src/skill/sk-chart.js");
  var ScrollWatcher = require("src/scrollwatcher.js");

  var chart         = new RadarChart( data, "W_skillChart" );

  $("#W_skillChart").watchAutoResize()
                    .on("autoresize", function(){ chart.render( chart.EVT_RESIZE ); });


  var chartW  = new ScrollWatcher( ".logo", -1 );
  chartW.one("scrollabove", function(){ chart.render(); console.log(" scrolled into "); });


  var Tooltip = require("src/tooltip.js");

  var tooltipOption = {
      margin     : 15
    , extraClass : "skill"
    , content    : function ( element ) {
        var data = chart.getData( element );
        console.log( data );
        var html = "<p class='sk-tip-desc'><span class='tip-tag'>" 
                      + data.name
                      + "</span>"
                      + data.desc
                      + "</p><p class='sk-tip-lv lv"
                      + data.v
                      + "'></p>";
        return html;
      }
  };

  // Popup interaction
  $("#W_skillChart")
    .on("mouseover", "ellipse", function( evt ){
      Tooltip.show( evt.target, tooltipOption, { x:evt.pageX, y:evt.pageY } );
    })
    .on("mousemove", "ellipse", function( evt ){ 
      Tooltip.show( evt.target, tooltipOption, { x:evt.pageX, y:evt.pageY }, true );
    })
    .on("mouseout",  "ellipse", function( evt ){ Tooltip.hide( evt.target ); });
});
