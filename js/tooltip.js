define(function(require){

    jQuery.fn.tooltip = function(content, options)
    {
        if (content == "") { return this; }

        var optns     = $.extend({
            distance  : 10,
            time      : 250,
            hideDelay : 200,
            isTop     : true
        }, options),

            hideTimer = null,
            shown     = false,
            inEffect  = "-=",
            outEffect = "+=",

            $tip      = $('<div class="tooltip" style="opacity:0;">'
                          + content + '</div>').appendTo("body"),
            arrow     = '<div class="arrow"></div>',
            hoverTgts = this;

        if(optns.isTop) 
        {
            $tip.append(arrow);
            hoverTgts.add(arrow);
        } else {
            inEffect  = "+=";
            outEffect = "-=";
            $tip.addClass("ttBottom");
            $tip.prepend(arrow);
        }

        hoverTgts.hover(
            function() 
            {
                if(hideTimer) clearTimeout(hideTimer);
                if(shown) { return; }
                shown = true;

                var $t        = $(this),
                    targetPos = $t.offset(),
                    tipX      = (targetPos.left - window.pageXOffset
                                 + $t.outerWidth() / 2)
                                 - $tip.outerWidth() / 2,
                    tipY      = targetPos.top - window.pageYOffset
                                + (optns.isTop ? -$tip.outerHeight() - 10
                                            : $t.outerHeight() + 10);

                $tip.css({
                    "left"    : tipX + 'px', 
                    "top"     : tipY + 'px', 
                    "display" :'block'
                }).stop()
                  .animate({
                    "top"     : inEffect + optns.distance + 'px', 
                    "opacity" : 1
                }, optns.time, 'swing');
            },
            function() 
            {
                if(hideTimer) clearTimeout(hideTimer);

                hideTimer = setTimeout(function () {
                        hideDelayTimer = null;
                        shown = false;
                        $tip.stop(true,true)
                            .animate({
                                "top"     : outEffect + optns.distance + 'px', 
                                "opacity" :0
                            }, optns.time, 'swing', function() { 
                                $tip.css("display", 'none'); 
                            });
                    }, optns.hideDelay);
            }
        );

        return this; 
    };
});