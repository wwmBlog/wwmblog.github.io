define(function(require, exports, module){

  require("libs/zepto.js");

  module.exports = {
      show : show  // ( element:Dom, config:Object|Function, pos:{x,y} )
    , hide : hide  // ( void )
    , auto : auto  // ( selector:String, config:Object|Function, tracking:Boolean )
    , hideOnClick   : hideOnClick
    , currentTarget : currentTarget
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
  var lastPosObject = null;

  // Features :
  // 1. Show / Hide on mouseenter and mouseleave
  // 2. Click / Touch to show, next Click/Touch to hide
  // 3. Smart placement
  // 4. Follow mouse
  // 5. Any change to screen hides the popup.
  // 6. Only one popup at a time.

  function show( element, config, pos ) {

    // Configs
    if ( typeof config == "function" ) {
      config = config( element );
    }
    config = $.extend({}, defaultOpts, config);


    // Just update the tooltip position.
    // Need to specify a new position(pos) for the tooltip.
    if ( tipElement == element ) {
      if ( lastPosObject && pos ) {
        lastPosObject = _updatePos( $tipDom, lastPosObject, pos );
      }
      return;
    }

    tipElement = element.length ? element[0] : element;


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
    lastPosObject = posObj;

    if ( noReset ) {
      noReset = !( old_gravity && old_gravity != posObj.g );
    }

    $tipDom.addClass( posObj.g + ( noReset ? "" : " no-animate" ) )
           .children(".arrow")
           .css({left:posObj.aL, top:posObj.aT});

    // Trigger re-layout
    var height = $tipDom[0].offsetHeight;

    $tipDom.removeClass("no-animate").toggleClass("shown", true);
  }

  function hide( element, force ) {
    if ( tipElement != element && !force ) { return; }
    $tipDom.removeClass("shown");
    tipElement = null;
  }

  function hideOnClick() {

    function doHide ( evt ) { 
      hide( null, true );
      hideOnClick.__bindNextHide = false;
    }

    var evt = isTouchDevice ? "touchend" : "click";
    if ( !hideOnClick.__bindNextHide ) {
      hideOnClick.__bindNextHide = true;
      $("body").one(evt, doHide);
    }
  }

  function currentTarget () { return tipElement; }

  // config : function ( element ) { return {}; }
  function auto( selector, config, tracking ) {
    if ( isTouchDevice ) {
      $(selector).on("touchend", selector, function( evt ){ 
        if ( tipElement != evt.target ) {
          show(evt.target, config);
          hideOnClick();
        }
        return false;
      });
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

  function _updatePos( $tip, posObj, pos ) {

    var xoff, yoff;

    if ( posObj.g == "left" || posObj.g == "right" ) {
      xoff = pos.x - posObj.baseline;
      yoff = pos.y - posObj.baselineAlt;
      posObj.baseline    = pos.x;
      posObj.baselineAlt = pos.y;
    } else {
      yoff = pos.y - posObj.baseline;
      xoff = pos.x - posObj.baselineAlt;
      posObj.baseline    = pos.y;
      posObj.baselineAlt = pos.x;
    }

    xoff += parseInt($tip.css("left"));
    yoff += parseInt($tip.css("top"));

    $tip.css({ left:xoff, top:yoff });
    return posObj;
  }
  

  // Get the right position for the element.
  function _position( $tip, element, config, pos ) {

    var elementOffset = pos ? { left:pos.x, top:pos.y, width:0, height:0 } : $(element).offset();
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
      baseline    = Math.round( elementOffset.left + elementOffset.width  / 2 );
      baselineAlt = Math.round( elementOffset.top  + elementOffset.height / 2 );
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
      baseline    = Math.round( elementOffset.top  + elementOffset.height / 2 );
      baselineAlt = Math.round( elementOffset.left + elementOffset.width  / 2 );
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

    $tip.css({ left:position.x, top:position.y });

    posObj.baseline    = baseline;
    posObj.baselineAlt = baselineAlt;

    return posObj;
  }
});
