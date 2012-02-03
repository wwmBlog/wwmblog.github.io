define({
    configureForm : function (form)
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
                        url:      form.submitURL,  
                        dataType: 'jsonp',
                        jsonp:    'jsonp',
                        data:     {"email": mailVal, "content": msgVal},
                        success: function(data) 
                        {
                            if(data.result == "success") {
                                form.$notification.html("发送成功，我会尽快回复你的。");
                                form.showComplete();
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
});
