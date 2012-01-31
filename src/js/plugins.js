/*!
 * jQuery TextChange Plugin
 * http://www.zurb.com/playground/jquery-text-change-custom-event
 *
 * Copyright 2010, ZURB
 * Released under the MIT License
 */
(function ($) {
    
    $.event.special.textchange = {
        
        setup: function (data, namespaces) {
          $(this).data('lastValue', this.contentEditable === 'true' ? $(this).html() : $(this).val());
            $(this).bind('keyup.textchange', $.event.special.textchange.handler);
            $(this).bind('cut.textchange paste.textchange input.textchange', $.event.special.textchange.delayedHandler);
        },
        
        teardown: function (namespaces) {
            $(this).unbind('.textchange');
        },
        
        handler: function (event) {
            $.event.special.textchange.triggerIfChanged($(this));
        },
        
        delayedHandler: function (event) {
            var element = $(this);
            setTimeout(function () {
                $.event.special.textchange.triggerIfChanged(element);
            }, 25);
        },
        
        triggerIfChanged: function (element) {
          var current = element[0].contentEditable === 'true' ? element.html() : element.val();
            if (current !== element.data('lastValue')) {
                element.trigger('textchange',  [element.data('lastValue')]);
                element.data('lastValue', current);
            }
        }
    };
    
    $.event.special.hastext = {
        
        setup: function (data, namespaces) {
            $(this).bind('textchange', $.event.special.hastext.handler);
        },
        
        teardown: function (namespaces) {
            $(this).unbind('textchange', $.event.special.hastext.handler);
        },
        
        handler: function (event, lastValue) {
            if ((lastValue === '') && lastValue !== $(this).val()) {
                $(this).trigger('hastext');
            }
        }
    };
    
    $.event.special.notext = {
        
        setup: function (data, namespaces) {
            $(this).bind('textchange', $.event.special.notext.handler);
        },
        
        teardown: function (namespaces) {
            $(this).unbind('textchange', $.event.special.notext.handler);
        },
        
        handler: function (event, lastValue) {
            if ($(this).val() === '' && $(this).val() !== lastValue) {
                $(this).trigger('notext');
            }
        }
    };  

})(jQuery);

/**
 * @author Alexander Farkas
 * v. 1.22
 */
(function($) {
    if(!document.defaultView || !document.defaultView.getComputedStyle){ // IE6-IE8
        var oldCurCSS = $.curCSS;
        $.curCSS = function(elem, name, force){
            if(name === 'background-position'){
                name = 'backgroundPosition';
            }
            if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
                return oldCurCSS.apply(this, arguments);
            }
            var style = elem.style;
            if ( !force && style && style[ name ] ){
                return style[ name ];
            }
            return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
        };
    }
    
    var oldAnim = $.fn.animate;
    $.fn.animate = function(prop){
        if('background-position' in prop){
            prop.backgroundPosition = prop['background-position'];
            delete prop['background-position'];
        }
        if('backgroundPosition' in prop){
            prop.backgroundPosition = '('+ prop.backgroundPosition;
        }
        return oldAnim.apply(this, arguments);
    };
    
    function toArray(strg){
        strg = strg.replace(/left|top/g,'0px');
        strg = strg.replace(/right|bottom/g,'100%');
        strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
        var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
        return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
    }
    
    $.fx.step. backgroundPosition = function(fx) {
        if (!fx.bgPosReady) {
            var start = $.curCSS(fx.elem,'backgroundPosition');
            if(!start){//FF2 no inline-style fallback
                start = '0px 0px';
            }
            
            start = toArray(start);
            fx.start = [start[0],start[2]];
            var end = toArray(fx.end);
            fx.end = [end[0],end[2]];
            
            fx.unit = [end[1],end[3]];
            fx.bgPosReady = true;
        }
        //return;
        var nowPosX = [];
        nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
        nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];           
        fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];

    };
})(jQuery);