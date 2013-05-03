define(function(require){

  var data          = require("data/skill.js");
  var RadarChart    = require("src/skill/sk-chart.js");
  var ScrollWatcher = require("src/scrollwatcher.js");

  var chart         = new RadarChart( data, "W_skillChart" );

  $("#W_skillChart").watchAutoResize()
                    .on("autoresize", function(){ chart.render( chart.EVT_RESIZE ); });


  var chartW  = new ScrollWatcher( ".logo", -1 );
  chartW.one("scrollabove", function(){ chart.render(); });


  var Tooltip = require("src/tooltip.js");

  var tooltipOption = {
      margin     : 15
    , extraClass : "skill"
    , content    : function ( element ) {
        var data = chart.getData( element );
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

  if ( !!('ontouchstart' in window) )
  {
    var __bindNextHide = false;
    $("#W_skillChart").on("touchend", "ellipse", function( evt ) {
      var winScrollY = window.scrollTop  || window.scrollY;
      var winScrollX = window.scrollLeft || window.scrollX;
      var rect       = evt.target.getBoundingClientRect();
      var pos        = {  x : Math.round(rect.width  / 2 + rect.left) + winScrollX
                        , y : Math.round(rect.height / 2 + rect.top ) + winScrollY
                       };
      console.log(evt);
      Tooltip.show( evt.target, tooltipOption, pos );
      Tooltip.hideOnClick();
      return false;
    });

  } else {
    // Popup interaction
    $("#W_skillChart")
      .on("mouseover", "ellipse", function( evt ){
        Tooltip.show( evt.target, tooltipOption, { x:evt.pageX, y:evt.pageY } );
      })
      .on("mousemove", "ellipse", function( evt ){ 
        Tooltip.show( evt.target, tooltipOption, { x:evt.pageX, y:evt.pageY } );
      })
      .on("mouseout",  "ellipse", function( evt ){ Tooltip.hide( evt.target ); });
  }
});
