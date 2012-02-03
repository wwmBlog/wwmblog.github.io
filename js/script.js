define(function (require) 
{
    require('dummy/../../plugins/plugins.js');
    var winScroller = require('./winScroller.js');
    var formSetup   = require('./msgForm.js');

$(function()
{
    var scrollBars = [$("#barSkill"), $("#barWork"), $("#barContact")],
        scrollBtns = [$("#btnSpace"), $("#btnLeft"), $("#btnRight")],
        msgInputs  = [$("#content"),  $("#mail")];

    // === Horizontal Scrolling ===
    scrollBtns[0].click(function(){winScroller.scrollTo(0);});
    scrollBtns[1].click(
        function() 
        {
            msgInputs[0].blur();
            msgInputs[1].blur();
            winScroller.pageLeft();
        }
    );
    scrollBtns[2].click(winScroller.pageRight);
    $("#nav a").click(
        function(e) 
        {
            if (this.name != "") {
                winScroller.scrollTo(this.name);
                e.preventDefault();
            }
        }
    );

    $("body").keydown(
        function(e)
        {
            var i = 0, key = e.keyCode | e.which;
            if (key == 37) { i = 1; } else 
            if (key == 39) { i = 2; } else 
            if (key != 32) { return true; } 
            scrollBtns[i].addClass("pressed");
            e.preventDefault();
        }
    ).keyup(
        function(e)
        {
            var i = 0, key = e.keyCode | e.which;
            if (key == 37) { i = 1; } else 
            if (key == 39) { i = 2; } else 
            if (key != 32) { return true; } 
            scrollBtns[i].removeClass("pressed").click();
            e.preventDefault();
        }
    );

    $(".container").each(function(i, tgt)
    {
        var fn = function (e)
        {
            var d = 0;
            if (e.wheelDelta) d = -e.wheelDelta / 4;
            if (e.detail    ) d = e.detail * 10;

            window.scrollBy(d);
            e.preventDefault();
        }
        if (this.addEventListener) {
            this.addEventListener( "DOMMouseScroll", fn, false );
            this.addEventListener( "mousewheel", fn, false );
        } else
            this.onmousewheel = fn;
    });

    // Disable text selection on the buttons
    for(var i=0;i<3;++i) {
        scrollBtns[i].mousedown(false).mouseup(false);
    }
   
    function adjustFixedContent()
    {
        // Adjust the bars and the nav buttons,
        // Set focus to the message input area if we
        // have scroll to that.
        var bodyW = $("body").width(),
            m = half = bodyW / 2,
            x = window.pageXOffset;
        
        for (var i = 0; i < 3; ++i)
        {
            var b = x < m ? -8 : 0;
            if(x < m + half) { b = 8 * ((x-m)/half - 1); }
            scrollBars[i].css("bottom", b + "px");
            m += bodyW;
        }
        scrollBtns[0].toggle(x > 0);
        scrollBtns[1].toggle(x > 0);
        if(x >= 3 * bodyW) {
            scrollBtns[2].hide();
            msgInputs[0].focus();
        } else if(scrollBtns[2].css("display") == "none") {
            scrollBtns[2].show();
            msgInputs[0].blur();
            msgInputs[1].blur();
        }
    }
    $(window).scroll(adjustFixedContent).resize(adjustFixedContent);
    adjustFixedContent();

    // === Main Annotation ===
    configureAnnotation({
        // A div containing the target elements that has annotation.
        $targetDiv : $("#introContent"), 
        // Those elements which have annotation in their title attr.
        $annoElems : $("#introContent").children("a")
    });
    function configureAnnotation(obj) 
    {
        var $annoDiv  = $('<div class="annotation"><div></div><div></div></div>')
                         .appendTo(obj.$targetDiv).css("height", 0),
            $children = $annoDiv.children().css("opacity", 0),
            $annoShow = $($children[0]),
            $annoBack = $($children[1]),
            currElem  = null,
            duration  = 250;

        obj.$annoElems.each(
            function()
            {
                $(this).data("anno", this.title).attr("title", "");
            }
        ).click(
            function()
            {
                $annoShow.animate({"opacity": 0}, duration);

                var h  = 0;
                if (currElem != this) {
                    currElem = this;
                    var temp = $annoShow;
                    $annoShow = $annoBack.html($(this).data("anno"))
                                         .animate({"opacity":1}, duration);
                    $annoBack = temp;
                    h = $annoShow.innerHeight();
                } else {
                    currElem = null;
                }

                $annoDiv.animate({"height":h}, duration);
                return false;
            }
        );
    }

    // === Message form ===
    var theForm = {
        $msgBox       : msgInputs[0],
        $mailInput    : msgInputs[1],
        $sendBtn      : $("#sendme"),
        $notification : $("#notification"), // A element to show the error message.
        submitURL     : "http://lmmailserver.appspot.com",

        showLoading   : function()
        {
            scrollBars[2].css({backgroundPosition:"0 0"})
                         .animate({backgroundPosition: '-96px 0' }, 
                                  500, 'linear', 
                                  theForm.showLoading);
        },
        hideLoading   : function()
        {
            scrollBars[2].stop();
        },
        showComplete  : function()
        {
            $("#stampd").css({ "left"   : "2px", 
                               "top"    : "87px", 
                               "width"  : "147px", 
                               "height" : "91px",
                               "opacity": "1"})
                        .animate({left:"7px", top:"92px", width:"137px", height:"81"}, 100);
        },
        hideComplete  : function()
        {
            $("#stampd").css({"opacity":"0"});
        }
    };
    formSetup.configureForm(theForm);

    // === Skill Chart ===

    // === Work List ===
});/*$*/

});/*define*/

