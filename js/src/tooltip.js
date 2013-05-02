define(function(require, exports, module){

  require("libs/zepto.js");

  module.exports = {
      show : show  // ( element:Dom, config:Object|Function, pos:{x,y} )
    , hide : hide  // ( void )
    , auto : auto  // ( selector:String, config:Object|Function, tracking:Boolean )
  };

  var defaultOpts = {
      content    : ""
    , side       : "top"
    , margin     : 25
    , extraClass : ""
  };

  var TIP_EDGE   = 10;
  var ARROW_SIZE = 6;

  var tipElement    = null;
  var $tipDom       = $tipDom = $("<div class='tooltip top'><div class='tip-content'></div><span class='arrow'></span></div>").appendTo("body");
  var isTouchDevice = !!('ontouchstart' in window);

  // Features :
  // 1. Show / Hide on mouseenter and mouseleave
  // 2. Click / Touch to show, next Click/Touch to hide
  // 3. Smart placement
  // 4. Follow mouse
  // 5. Any change to screen hides the popup.
  // 6. Only one popup at a time.

  function show( element, config, pos ) {

    tipElement = element.length ? element[0] : element;

    // Configs
    if ( typeof config == "function" ) {
      config = config( element );
    }
    config = $.extend({}, defaultOpts, config);

    var old_gravity = $tipDom.attr("class").replace(/left|right|top|bottom/);
    var noReset     = !$tipDom.hasClass("shown");

    old_gravity = old_gravity ? old_gravity[0] : "";

    // Clean up
    $tipDom
      .attr( "class", "tooltip " + config.extraClass )
      .children('.tip-content')
      .html( typeof config.content == "function" ? config.content(element) : config.content )

    // Get the gravity
    var posObj = _position( $tipDom, element, config, pos );

    if ( noReset ) {
      noReset = !( old_gravity && old_gravity != posObj.g );
    }

    $tipDom.addClass( posObj.g + ( noReset ? "" : " no-animate" ) )
           .children(".arrow")
           .css({left:posObj.aL, top:posObj.aT});

    var height = $tipDom[0].offsetHeight;

    $tipDom.removeClass("no-animate").toggleClass("shown", true);
  }

  function hide( element ) {
    if ( tipElement != element ) { return; }
    $tipDom.removeClass("shown");
  }

  // config : function ( element ) { return {}; }
  function auto( selector, config, tracking ) {
    if ( isTouchDevice ) {
      $("body").on("touchend",   selector, function( evt ){ show(evt.target, config); return false; });
    } else {
      $("body").on("mouseenter", selector, function( evt ){ 
                  show(evt.target, config); return false;
                })
               .on("mouseleave", selector, function( evt ){
                  hide(evt.target);         return false; 
                });

      if ( tracking ) {
        $("body").on("mousemove", selector, function( evt ){
          show(evt.target, config, { x : evt.pageX, y : evt.pageY });
          return false;
        });
      }
    }
  }
  

  // Get the right position for the element.
  function _position( $tip, element, config, pos ) {

    var elementOffset = $(element).offset();
    var tipOffset     = $tip.offset();

    var docEl      = document.documentElement;
    var viewportW  = docEl.clientWidth;
    var viewportH  = docEl.clientHeight;
    var docW       = docEl.scrollWidth;
    var docH       = docEl.scrollHeight;
    var scrollX    = window.scrollLeft || window.scrollX;
    var scrollY    = window.scrollTop  || window.scrollY;

    var baseline, baselineAlt, measurement, halfTipSize;

    var position = { x : 0, y : 0 };
    var posObj   = { g : "left", aL : undefined, aT : undefined };

    if ( "left" == config.side || "right" == config.side ) {
      baseline    = pos ? pos.x : Math.round( elementOffset.left + elementOffset.width  / 2 );
      baselineAlt = pos ? pos.y : Math.round( elementOffset.top  + elementOffset.height / 2 );
      measurement = tipOffset.width + config.margin;

      position.y = baselineAlt - Math.floor( tipOffset.height / 2 );

      if ( "left" == config.side ) {

        if ( measurement < baseline - scrollX ) {
          // Enough *visible* space on the left.
          position.x = baseline - measurement;
          
        } else if ( measurement < docW - baseline ) {
          // Enough space on the right.
          position.x = baseline + config.margin;
          posObj.g   = "right";
          
        } else if ( measurement < baseline ) {
          // Enough space on the left.
          position.x = baseline - measurement;

        } else {
          config.side = "top";
        }
      } else {
        if ( measurement < scrollX + viewportW - baseline ) {
          // Enough *visible* space on the right.
          position.x = baseline + config.margin;
          posObj.g   = "right";

        } else if ( measurement < baseline - scrollX ) {
          // Enough *visible* space on the left.
          position.x = baseline - measurement;

        } else if ( measurement < docW - baseline ) {
          // Enough space on the right.
          position.x = baseline + config.margin;
          posObj.g   = "right";
          

        } else {
          config.side = "top";
        }
      }
    }

    if ( "bottom" == config.side || "top" == config.side ) {
      baseline    = pos ? pos.y : Math.round( elementOffset.top  + elementOffset.height / 2 );
      baselineAlt = pos ? pos.x : Math.round( elementOffset.left + elementOffset.width  / 2 );
      measurement = tipOffset.height + config.margin;
      posObj.g    = "top";

      if ( "bottom" == config.side ) {
        if ( measurement < scrollY + viewportH - baseline ) {
          // Enough *visible* space on the bottom
          position.y = baseline + config.margin;
          posObj.g   = "bottom";

        } else if ( measurement < baseline - scrollY ) {
          // Enough *visible* space on the top
          position.y = baseline - measurement;


        } else if ( measurement < docH - baseline ) {
          // Enough space on the bottom
          position.y = baseline + config.margin;
          posObj.g   = "bottom";

        } else {
          position.y = baseline - measurement;
        }
      } else {
        if ( measurement < baseline - scrollY ) {
          // Enough *visible* space on the top
          position.y = baseline - measurement;

        } else if ( measurement < docH - baseline ) {
          // Enough space on the bottom
          position.y = baseline + config.margin;
          posObj.g   = "bottom";

        } else {
          position.y = baseline - measurement;
        }
      }

      halfTipSize = Math.round( tipOffset.width / 2 );

      if ( docW < tipOffset.width
            || (baselineAlt - scrollX >= halfTipSize 
                 && scrollX + viewportW - baselineAlt >= halfTipSize) )
      {
        position.x = baselineAlt - halfTipSize;

      } else if ( viewportW >= tipOffset.width ) {

        // The tip can be totally visible inside the screen.
        if ( baselineAlt - scrollX < halfTipSize ) {
          position.x = scrollX + TIP_EDGE;
          if ( position.x + tipOffset.width > scrollX + viewportW ) {
            position.x = scrollX + viewportW - tipOffset.width;
          }
        } else {
          position.x = scrollX + viewportW - TIP_EDGE - tipOffset.width;
          if ( position.x < scrollX ) {
            position.x = scrollX;
          }
        }

      } else {

        // Part of the tip is invisible.
        if ( baselineAlt < halfTipSize + TIP_EDGE ) {
          position.x = TIP_EDGE;
        } else {
          position.x = baselineAlt - halfTipSize;
        }

      }

      posObj.aL = baselineAlt - position.x - ARROW_SIZE;
    }

    $tip.css({ "left": position.x, "top": position.y });

    return posObj;
  }
});
