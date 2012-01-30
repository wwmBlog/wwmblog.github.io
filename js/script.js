$(function(){

    var scrollBars = [$("#barSkill"), $("#barWork"), $("#barContact")],
        scrollBtns = [$("#btnSpace"), $("#btnLeft"), $("#btnRight")];

    // === Horizontal Scrolling ===
    var winScroller = {
        pageLeft : function () 
        {
            var bodyW = $("body").width(),
                curr  = Math.floor(window.pageXOffset / bodyW);
            if(window.pageXOffset % bodyW == 0 && curr > 0) { --curr; }
            winScroller.scrollTo(curr * bodyW, 300);
        },

        pageRight: function () 
        {
            var bodyW = $("body").width(),
                curr  = Math.ceil(window.pageXOffset / bodyW);
            if(window.pageXOffset % bodyW == 0 && curr < 3) { ++curr; }
            winScroller.scrollTo(curr * bodyW, 300);
        },

        // xpos accepts number or string.
        // string is the name of an element.
        scrollTo : function (xpos, duration) 
        {
            var d = (window.contentWindow || window).document || window.ownerDocument || window,
                t = $.browser.safari || doc.compatMode == 'BackCompat' ? d.body : d.documentElement,
                l = typeof xpos == "number" ? xpos : $(xpos).offset().left;
            $(t).stop().animate({ "scrollLeft": l }, duration);
        }
    };

    scrollBtns[0].click(function(){winScroller.scrollTo(0);});
    scrollBtns[1].click(winScroller.pageLeft);
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

    $(window).scroll(adjustFixedContent).resize(adjustFixedContent);
    adjustFixedContent();

    // Adjust the bars and the nav buttons,
    // Set focus to the message input area if we
    // have scroll to that.
    function adjustFixedContent()
    {
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
            $("#content").focus();
        } else if(scrollBtns[2].css("display") == "none") {
            scrollBtns[2].show();
            $("#content").blur();
        }
    }

    // === Message form ===
    var theForm = {
        $msgBox       : $("#content"),
        $mailInput    : $("#mail"),
        $sendBtn      : $("#sendme"),
        $notification : $("#notification"), // A element to show the error message.
        submitURL     : "ohnewmessage.php",

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
            $("#stampd").show()
                        .css({"left":"2px", "top":"87px", "width":"147px", "height":"91px"})
                        .animate({left:"7px", top:"92px", width:"137px", height:"81"}, 100);
        },
        hideComplete  : function()
        {
            $("#stampd").hide();
        }
    }
    configureForm(theForm);

    function configureForm(form)
    {
        // Clear notification when input changes.
        form.$msgBox.bind(
            "textchange", 
            function() 
            {
                form.$notification.html(""); 
                form.hideComplete();
            }
        );

        // Check email and interpret 'Enter'
        form.$mailInput.bind(
            "textchange",
            function() 
            {
                if(testEmail($(this).val())) { 
                    form.$sendBtn.removeAttr("disabled"); 
                } else {
                    form.$sendBtn.attr("disabled", "disabled");
                }
            }
        ).keydown(
            function(e) 
            {
                var k = e.keyCode | e.which;
                if(k == 13) { 
                    form.$sendBtn.click();
                    return false;
                } else if (k == 9) {
                    form.$msgBox.focus();
                    return false;
                }
                e.stopPropagation();
            }
        ).trigger("textchange");

        form.$msgBox.add(form.$mailInput).keydown(stopProp).keyup(stopProp);

        form.$sendBtn.click(
            function(e)
            {
                var msgVal  = form.$msgBox.val(),
                    mailVal = form.$mailInput.val(),
                    err     = "";
                if(msgVal == "" || msgVal == form.$msgBox.attr("placeholder")) 
                {
                    err = "你什么都还没写呢=，=";
                } else if(!testEmail(mailVal))
                {
                    err = "Email不正确吧~~";
                } else if(form.lastContent == msgVal)
                {
                    err = "你刚才就发过了...";
                } else {
                    form.lastContent = msgVal;
                    form.showLoading();
                    err = "正在努力地发送中...";
        
                    // send the content
                    $.ajax({  
                        type: "POST",  
                        url:  form.submitURL,  
                        data: {"email": mailVal, "content": msgVal},  
                        success: function(data) 
                        {
                            if(data == "Success") {
                                form.$notification.html("发送成功。我会尽快回复你的。");
                                showComplete();
                            } else {
                                onSendError();
                            }
                        },
                        error: onSendError,
                        complete: function() { form.hideLoading(); }
                    });
                    function onSendError() {
                        form.hideComplete();
                        form.$notification
                            .html("Oops，出错了。不如直接发邮件给我吧: liangmorr@gmail.com");
                    }
                }

                form.$notification.html(err);
                return false;
            }
        );

        // PlaceHolder
        var ph = "placeholder";
        if(!(ph in document.createElement('input'))) 
        {
            form.$msgBox.add(form.$mailInput).focus(
                function() 
                {
                    var $t = $(this);
                    if ($t.attr(ph) != "" && 
                        $t.val() == $t.attr(ph)) 
                    { $t.val(""); }
                }
            ).blur(
                function ()
                {
                    var $t = $(this);
                    if ($t.attr(ph) != "" && 
                        $t.val() == "")
                    { $t.val($t.attr(ph)); }
                }
            ).blur().end();
        }

        function testEmail(m) { 
            return /[\w\d_\.\-]+@([\w\d_\-]+\.)+[\w\d]{2,4}/.test(m);
        }
        function stopProp(e) { e.stopPropagation(); }
    }

    // === Skill Chart ===

    // === Work List ===
});