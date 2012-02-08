define(function(require) {

    var skillDat = require("./skillDat.js");
        optns    = 
    {
        itemClass  : "pathItem",
        iconClass  : "pathItemIcon",
        titleClass : "pathItemTitle",
        minWidth   : 52,
        inset      : -52,
        iconSize   : 32
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
            var d = jsonData.dat[i];
            d.parent = control;

            var $ch = $('<div class="' + optns.itemClass + '"> \
               <div class="' + optns.iconClass + '" \
               style="background-position:-' 
               + optns.iconSize * d.icnIdx + 
               'px 0"></div> \
               <div class="' + optns.titleClass + '">' + d.title + '</div> \
               </div>').appendTo(control.$div)
                       .data(d);
            if (control.firstLowest)
            {
                $ch.css("z-index", len - i);
            }

            control.totalLv += d.lv;
        }

        // Resize and arrange.
        $(window).resize(function(){ resizePathControl(control); });
        resizePathControl(control);
    }

    function resizePathControl(control, w)
    {
        var $div = control.$div,
            w    = $div.innerWidth();

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

        if (min > optns.minWidth) { min = optns.minWidth; }

        // Update weighted width
        for (; i < itemCount; ++i)
        {
            var child = childrenClone[i],
                d     = $(child).data(),
                inset = optns.inset;

            if (control.firstLowest)
            {
                if (child == children[0]) { inset = 0; }
            } else if (child == children[itemCount - 1])
            {
                inset = 0;
            }


            itemWidth = parseInt((w - temp) * d.lv / totalLv);
            totalLv  -= d.lv;

            if (min > itemWidth) { itemWidth = min; }
            temp += itemWidth;

            $(child).data("weightedWidth", itemWidth - inset)
                    .width(itemWidth - inset);
        }

        // Arrange
        arrangePathControl(control);
    }

    function arrangePathControl(control)
    {
        var $children = control.$div.children(),
            itemCount = $children.length,
            i = 0,
            left = 0;

        for(;i<itemCount;++i)
        {
            var $ch = $($children[i]);
            $ch.css("left", left);
            left += ($ch.width() + optns.inset);
        }
    }

$(function(){

    PathControl("#proPC", skillDat.pro);
    PathControl("#basicPC", skillDat.basic);

});

});
