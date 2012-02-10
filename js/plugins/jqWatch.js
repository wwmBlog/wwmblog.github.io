/*
/* jQuery Watch Attributes Plugin v 1.0.0
/* Copyright 2010
/*
/* Written By: Darcy Clarke
/* URL: http://darcyclarke.me/
/*
/* */
jQuery.fn.watch = function(props, callback, timeout){
    var $ = jQuery;
    if(!timeout)
        timeout = 10;
    return this.each(function(){
        var el      = $(this), 
            func    = function(){ __check.call(this, el) },
            data    = { props:  props.split(","),
                        func:   callback,
                        vals:   [] };
        $.each(data.props, function(i) { data.vals[i] = el.css(data.props[i]); });
        el.data(data);
        if (typeof (this.onpropertychange) == "object"){
            el.bind("propertychange", callback);
        } else if ($.browser.mozilla){
            el.bind("DOMAttrModified", callback);
        } else {
            setInterval(func, timeout);
        }
    });
    function __check(el) {
        var data    = el.data(),
            changed = false,
            temp    = "";
        for(var i=0;i < data.props.length; i++) {
            temp = el.css(data.props[i]);
            if(data.vals[i] != temp){
                data.vals[i] = temp;
                changed = true;
                break;
            }
        }
        if(changed && data.func) {
            data.func.call(el, data);
        }
    }
}