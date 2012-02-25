// ==========
// Image gallery
// 1. Wrap the "img" tag with "a.#{link_class}>span" if its parent is not 'a' and 
//    it has class #{img_class}
// 2. Wrap the "img" tag with "span" if its parent is 'a' and ensure the parent has
//    class of #{link_class}.
// ==========
(function($){
$.fn.galleryWM = function (options) {

    var settings = $.extend(
                        {
                            link_class  : 'photos',
                            img_class   : 'wrap',
                            img_sels    : 'a img, p > img'
                        }, options);

    function imgClicked(event) {
        console.log(event);
        return true;
    }

    return this.each(function() {

        $(settings.img_sels, this).each(
            function() {

                var $img = $(this);
                if (!$img.hasClass(settings.img_class)) return;

                // Properly wrap the image.
                var $p         = $img.parent(),
                    extraClass = $img.attr('class').replace(settings.img_class, ""),
                    wrapHTML   = '<span />';

                if ($p.get(0).tagName.toUpperCase() != 'A')
                {
                    wrapHTML = '<a class="' + settings.link_class + 
                               ' ' + extraClass +'" href="' +
                               $img.attr('src') +'"><span /></a>';

                } else {
                    if(!$p.hasClass(settings.link_class)) {
                        $p.addClass(settings.link_class + ' ' + extraClass);
                    } else {
                        $p.addClass(extraClass);
                    }
                    if (!$p.attr('href')) {
                        $p.attr('href', $img.attr('src'));
                    }
                }
                $img.removeClass(extraClass).wrap(wrapHTML);
            }
        );

        $(this).click(imgClicked);
    });
};
})(jQuery);

$(function()
{
    // ==========
    // Back To Top Button
    // ==========
    var BTT_Options = {
                        min         : 200,
                        inDelay     : 600,
                        scrollSpeed : 1200
                      },
        $BTT_Target = $('#backToTop');

    if ($BTT_Target.length != 0)
    {
        $BTT_Target.click(
            function()
            {
                $('html, body').animate({scrollTop:0}, 1200);
                $(this).addClass('hidden');
            }
        );
        $(window).scroll(
            function()
            {
                if ($(window).scrollTop() > $(window).height() / 2)
                {
                    $BTT_Target.removeClass('hidden');
                } else if(!$BTT_Target.hasClass('hidden'))
                {
                    $BTT_Target.addClass('hidden');
                }
            }
        );
    }

    $('.post, .singlePost').galleryWM();
});
