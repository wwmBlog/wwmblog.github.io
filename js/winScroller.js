define(
    function(require, exports)
    {
        // xpos accepts number or string.
        // string is the name of an element.
        exports.scrollTo = function (xpos, duration)
        {
            var d = (window.contentWindow || window).document || 
                    window.ownerDocument || window,
                t = $.browser.safari || d.compatMode == 'BackCompat' ? d.body : d.documentElement,
                l = typeof xpos == "number" ? xpos : $(xpos).offset().left;
            $(t).stop().animate({ "scrollLeft": l }, duration);
        };

        exports.pageLeft = function ()
        {
            var bodyW = $("body").width(),
                curr  = Math.floor(window.pageXOffset / bodyW);
            if(window.pageXOffset % bodyW == 0 && curr > 0) { --curr; }
            exports.scrollTo(curr * bodyW);
        };

        exports.pageRight = function ()
        {
            var bodyW = $("body").width(),
                curr  = Math.ceil(window.pageXOffset / bodyW);
            if(window.pageXOffset % bodyW == 0 && curr < 3) { ++curr; }
            exports.scrollTo(curr * bodyW, 400);
        };
    }
);
