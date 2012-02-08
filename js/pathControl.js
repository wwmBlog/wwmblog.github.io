define(function(require) {

    require("./tooltip.js");

    var skillDat = require("./skillDat.js");
        optns    = 
    {
        itemClass  : "pathItem",
        iconClass  : "pathItemIcon",
        titleClass : "pathItemTitle",
        minWidth   : 52,
        duration   : 250,
    };

    function PathControl(pathControlID, jsonData)
    {
        var $div    = $(pathControlID),
            control = 
            {
                $div        : $div,
                totalLv     : 0,
                firstLowest : jsonData.firstLowest
            };

        // Add child to the div.
        for (var i = 0, len = jsonData.dat.length; i < len; ++i)
        {
            var d   = jsonData.dat[i],
                $ch = $('<div class="' + optns.itemClass + '" id="'
                        + d.id + '">' + d.title + '</div>')
                        .appendTo(control.$div)
                        .data(d)
                        .hover(pcItemHover, pcItemBlur)
                        .tooltip(d.detail);

            if (!control.firstLowest) {
                $ch.css("z-index", len - i);
            }

            // Calc prefered width
            $ch.data("preferWidth", $ch.width());

            control.totalLv += d.lv;
        }

        // Resize and arrange.
        $(window).resize(function(){ resizePathControl(); });
        resizePathControl();

        function pcItemBlur()
        {
            // Animate to weighted width
            $div.children().each(
                function()
                {
                    var t = $(this);
                    t.animate({
                        left  : t.data("weightedLeft"),
                        width : t.data("weightedWidth")
                    }, optns.duration);
                }
            );
        }

        function pcItemHover() 
        {
            // Animate to prefered width
            var $this = $(this),
                pw    = $this.data("preferWidth"),
                need  = pw - $this.data("weightedWidth");
            if (need <= 0) { return; }

            var $sibling  = $this.next(),
                gain      = 0,
                rGains    = [],
                rSiblings = [];

            while ($sibling.size() != 0 && gain < need) 
            {
                rSiblings.push($sibling);

                var canget = $sibling.data("weightedWidth") - optns.minWidth;
                if (canget + gain > need) { canget = need - gain; }
                gain += canget;

                rGains.push(canget);
                $sibling = $sibling.next();
            }

            var lneed = need - gain;

            if(gain != 0) 
            {
                var rgain = gain;
                for(i = 0; i < rSiblings.length; ++i)
                {
                    $sibling = rSiblings[i]
                    $sibling.stop(true, false)
                            .animate({
                                left  : $sibling.data("weightedLeft")+rgain+"px",
                                width : $sibling.data("weightedWidth")-rGains[i]+"px"
                            }, optns.duration);
                    rgain -= rGains[i];
                }
            }

            var prevSize = $this.prevAll().size();
            if(lneed > 0 && prevSize > 0)
            {
                var leftMinWidth = prevSize * optns.minWidth,
                    leftMaxGain  = $this.data("weightedLeft") - leftMinWidth;

                if (!control.firstLowest) {
                    leftMaxGain += $this.outerWidth() - $this.width();
                }

                if (leftMaxGain <= 0) {
                    lneed = 0;
                } else if(lneed > leftMaxGain) {
                    lneed = leftMaxGain;
                }
            }

            var tleft  = $this.data("weightedLeft") - lneed;
            if (tleft > 0 && (gain > 0 || lneed > 0))
            {
                $this.stop(true, false)
                 .animate({
                    left  : tleft + "px",
                    width : pw + "px"
                 }, optns.duration);
            }

            $sibling = $this.prev();
            while(lneed > 0 && $sibling.size() != 0) 
            {
                var canget = $sibling.data("weightedWidth") - optns.minWidth;
                if (canget >= lneed)
                {
                    canget = lneed;
                    lneed  = 0;
                } else {
                    lneed -= canget;
                }

                $sibling.stop(true, false)
                        .animate({
                            left  : $sibling.data("weightedLeft") - lneed + "px",
                            width : $sibling.data("weightedWidth") - canget + "px"
                        });
                $sibling = $sibling.prev();
            }
        }

        function resizePathControl()
        {
            var w = $div.innerWidth();

            if (control.width == w) { return; }
            control.width = w;

            var children      = $div.children(),
                itemCount     = children.length,
                min           = w / itemCount,
                totalLv       = control.totalLv,
                childrenClone = [].sort.call(children.slice(0),
                                    function (a,b) {
                                        return $(a).data("lv") - $(b).data("lv");
                                    }),
                temp = i = 0, itemWidth;

            if (optns.minWidth > min) { optns.minWidth = min; }

            // Update weighted width
            for (; i < itemCount; ++i)
            {
                var $child = $(childrenClone[i]),
                    d      = $child.data();

                itemWidth = parseInt((w - temp) * d.lv / totalLv);
                totalLv  -= d.lv;

                if (optns.minWidth > itemWidth) { itemWidth = optns.minWidth; }
                temp += itemWidth;

                $child.data("weightedWidth", itemWidth).width(itemWidth);
            }

            // Arrange
            arrangePathControl();
        }

        function arrangePathControl()
        {
            var $children = $div.children(),
                itemCount = $children.length,
                i = l = left = 0;

            for(; i<itemCount; ++i)
            {
                var $ch = $($children[i]);
                if (control.firstLowest)
                {
                    l = left;
                } else {
                    l = left - Math.abs($ch.outerWidth() - $ch.width());
                }

                left += $ch.css("left", l).data("weightedLeft", l).width();
            }
        }
    }

$(function(){

    PathControl("#proPC", skillDat.pro);
    PathControl("#basicPC", skillDat.basic);

});

});
