// ==========
// Image gallery
// ==========
(function($){

$.galleryWM = {

    defaults : {
        link_sels      : 'a.photos, a.iframes',
        loadingElement : '',
        aniDuration    : 180
    },

    isShowing     : false,
    $currentLink  : null,
    loadImg       : new Image(),

    groups        : {},

    gwm_init : function() {
        $("body").append("<div id='galleryBG'></div><div id='galleryContainer'><div id='galleryWrap'></div><div class='galleryNav left'></div><div class='galleryNav right'></div></div><div id='circle_loading'><div class='circle left'><div class='cl_bg'></div></div><div class='circle right'><div class='cl_bg'></div></div></div>");
        $('#galleryBG, #galleryWrap').click(function() { $.galleryWM.gwm_hide() });
        $('#galleryContainer').find('.galleryNav').click($.galleryWM.gwm_next);
    },

    gwm_next : function() {
        var $t  = $(this),
            gwm = $.galleryWM
            idx = gwm.$currentLink.data('groupIdx');
        if ($t.hasClass("left"))
        {
            --idx;
        } else {
            ++idx;
        }
        gwm.$currentLink = gwm.groups[gwm.$currentLink.attr('rel') || 'defaultG'][idx];
        gwm.gwm_showImage();
    },

    gwm_hide : function() {

        var gwm = $.galleryWM,
            geo = gwm.gwm_linkGeo(gwm.$currentLink);

        $('#galleryBG').fadeOut();
        $('#circle_loading').hide();
        $('#galleryContainer').stop()
        .animate({
            opacity  : 0, 
            width    : geo.width,
            height   : geo.height,
            top      : geo.top - $(window).scrollTop(),
            left     : geo.left - $(window).scrollLeft()
        }, gwm.defaults.aniDuration, function() {$(this).hide();});

        isShowing = false;
    },

    gwm_imageDidLoad : function() {

        if (!isShowing) { return; }

        var preferSize = $.galleryWM.gwm_calcPreferImgSize(this);

        $('#circle_loading').hide();

        $container  = $('#galleryContainer')
        .stop()
        .animate({
            opacity  : 1,
            width    : preferSize.width,
            height   : preferSize.height,
            top      : ($(window).height() - preferSize.height) / 2,
            left     : ($(window).width() - preferSize.width) / 2
        }, $.galleryWM.defaults.aniDuration)
        .find('img').css('opacity', 1).get(0).src = this.src;
    },

    gwm_linkClicked : function(event) {
        // Context is the link
        var type = $(this).data('galleryWM');
        if (type == 'image')
        {
            event.preventDefault();
            $.galleryWM.gwm_showImgGallery.call(this);
            return false;
        }

        return true;
    },

    gwm_calcPreferImgSize : function(showcaseImg) {

        var toWidth  = showcaseImg.width,
            toHeight = showcaseImg.height,
            maxW     = $(window).width()  * .82,
            maxH     = $(window).height() * .82;

        // Reduce size to fit the window if necessary, respect the img ratio.
        if (maxH / toHeight < maxW / toWidth)
        {
            if (toHeight > maxH)
            {
                toWidth  = maxH / toHeight * toWidth;
                toHeight = maxH;
            }
        } else if (toWidth > maxW)
        {
            toHeight = maxW / toWidth * toHeight;
            toWidth  = maxW;
        }
        return { width : Math.round(toWidth), height : Math.round(toHeight) };
    },

    gwm_showImage : function() {

        var gwm      = $.galleryWM,
            $link    = gwm.$currentLink,
            $real    = $link.find('img') || $link,
            $loading = $('#circle_loading'),
            url      = $link.attr('href'),
            style    = 'width:100%;height:100%;',
            img      = $link.data('preloadImg'),
            preferSize  = {};

        if (img.complete)
        {
            preferSize = gwm.gwm_calcPreferImgSize(img);
            $loading.hide();

            gwm.loadImg.onload = null;

        } else {
            // The image is not loaded yet.
            preferSize = gwm.gwm_calcPreferImgSize({
                width  : $real.width(),
                height : $real.height()
            });

            style += 'opacity:.5;';
            $loading.show();

            gwm.loadImg.onload = $.galleryWM.gwm_imageDidLoad;
            gwm.loadImg.src = url;

            url = $real.attr('src');
        }

        if (url) { 
            url = 'src="' + url + '" ';
        } else {
            preferSize = {
                width  : $loading.width(),
                height : $loading.height()
            };
        }

        var wrap = $('#galleryWrap'),
            orig = wrap.find('img');

        orig.animate({
            opacity : 0,
            width   : '+=30%',
            height  : '+=30%',
            left    : '-' + orig.width() * .15 + 'px',
            top     : '-' + orig.height()* .15 + 'px'
        }, gwm.defaults.aniDuration, function() { $(this).remove(); });

        wrap.prepend('<img ' + url + 'style="' + style + '">');

        var nav = $('#galleryContainer')
                    .stop()
                    .animate({
                        opacity  : 1,
                        width    : preferSize.width,
                        height   : preferSize.height,
                        top      : ($(window).height() - preferSize.height) / 2,
                        left     : ($(window).width() - preferSize.width) / 2
                    }, gwm.defaults.aniDuration)
                    .find('.galleryNav'),
            rel = gwm.$currentLink.attr('rel');
        if (rel != undefined)
        {
            var g = gwm.groups[rel || 'defaultG'],
                i = gwm.$currentLink.data('groupIdx');
            nav.filter('.left').toggle(i > 0).end().filter('.right').toggle(i < g.length - 1);
        } else {
            nav.hide();
        }
    },

    gwm_linkGeo : function($link) {
        var $real      = $link.find('img') || $link,
            offset     = $real.offset();
        return {
            width  : $real.width(),
            height : $real.height(),
            top    : offset.top,
            left   : offset.left
        };
    },

    gwm_showImgGallery : function() {

        // Context is the link

        // Make it to load the link image.
        var gwm        = $.galleryWM,
            $t         = $(this),
            linkGeo    = gwm.gwm_linkGeo($t);

            isShowing  = true;

        // Show_BG
        $('#galleryBG').fadeIn(gwm.defaults.aniDuration);
        $('#galleryWrap').empty();
        $('#galleryContainer')
        .show()
        .css({
            opacity  : 0,
            width    : linkGeo.width,
            height   : linkGeo.height,
            top      : linkGeo.top - $(window).scrollTop(),
            left     : linkGeo.left - $(window).scrollLeft()
        });

        gwm.$currentLink = $t;
        gwm.gwm_showImage();
    }
};

$($.galleryWM.gwm_init);

$.fn.galleryWM = function (options) {
    var settings = $.extend($.galleryWM.defaults, options);

    this.on("click", settings.link_sels, $.galleryWM.gwm_linkClicked);

    return this.each(function(){
        $(settings.link_sels, this).each(
            function() {
                var $link = $(this),
                    href  = this.href,
                    rel   = $link.attr('rel');

                if (href.match(/\.(png|jpg|jpeg|bmp|gif)(.*)?$/))
                {
                    // This link porints to image.
                    // Check if it has img children.
                    var imgCh = $link.find('img'),
                        chSrc = imgCh.attr('src');
                    if (chSrc != undefined && chSrc != href) 
                    {
                        // Preload the big one.
                        var img = new Image();
                        img.src = href;
                        $link.data('preloadImg', img);
                    }
                    $link.data('galleryWM', 'image');
                } else {
                    $link.data('galleryWM', 'iframe');
                }
                if (rel != undefined) 
                {
                    var g = $.galleryWM.groups[ rel || "defaultG" ];
                    if (!g) { g = $.galleryWM.groups[ rel || "defaultG" ] = []; }
                    g.push($link.data('groupIdx', g.length));
                }
            }
        )
    });
};

})(jQuery);

// ==========
// BackToTop
// ==========
(function($){
$.fn.backToTop = function (speed) {
    var scrollSpeed = speed | 1200;
    return this.each(function() {
        var $BTT_Target = $(this);
        $BTT_Target.click(function(){
            $('html, body').animate({scrollTop:0}, scrollSpeed);
            $BTT_Target.addClass('hidden');
        });
        $(window).scroll(function(){
            if ($(window).scrollTop() > $(window).height() / 2)
            {
                $BTT_Target.removeClass('hidden');
            } else if(!$BTT_Target.hasClass('hidden'))
            {
                $BTT_Target.addClass('hidden');
            }
        });
    });
};
})(jQuery);

$(function()
{
    $('#backToTop').backToTop();
    $('.post, .singlePost').galleryWM();
});
