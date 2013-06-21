/*
 * http://www.zurb.com/playground/jquery-text-change-custom-event
 * Copyright 2010, ZURB
 * Released under the MIT License
 */
(function(a){a.event.special.textchange={setup:function(b,c){a(this).data("lastValue",this.contentEditable==="true"?a(this).html():a(this).val()),a(this).bind("keyup.textchange",a.event.special.textchange.handler),a(this).bind("cut.textchange paste.textchange input.textchange",a.event.special.textchange.delayedHandler)},teardown:function(b){a(this).unbind(".textchange")},handler:function(b){a.event.special.textchange.triggerIfChanged(a(this))},delayedHandler:function(b){var c=a(this);setTimeout(function(){a.event.special.textchange.triggerIfChanged(c)},25)},triggerIfChanged:function(a){var b=a[0].contentEditable==="true"?a.html():a.val();b!==a.data("lastValue")&&(a.trigger("textchange",[a.data("lastValue")]),a.data("lastValue",b))}},a.event.special.hastext={setup:function(b,c){a(this).bind("textchange",a.event.special.hastext.handler)},teardown:function(b){a(this).unbind("textchange",a.event.special.hastext.handler)},handler:function(b,c){c===""&&c!==a(this).val()&&a(this).trigger("hastext")}},a.event.special.notext={setup:function(b,c){a(this).bind("textchange",a.event.special.notext.handler)},teardown:function(b){a(this).unbind("textchange",a.event.special.notext.handler)},handler:function(b,c){a(this).val()===""&&a(this).val()!==c&&a(this).trigger("notext")}}})(jQuery);
/*
 * Copyright 2010
 * Written By: Darcy Clarke
 * URL: http://darcyclarke.me/
 */
jQuery.fn.watch=function(a,b,c){function e(a){var b=a.data(),c=!1,d="";for(var e=0;e<b.props.length;e++){d=a.css(b.props[e]);if(b.vals[e]!=d){b.vals[e]=d,c=!0;break}}c&&b.func&&b.func.call(a,b)}var d=jQuery;return c||(c=10),this.each(function(){var f=d(this),g=function(){e.call(this,f)},h={props:a.split(","),func:b,vals:[]};d.each(h.props,function(a){h.vals[a]=f.css(h.props[a])}),f.data(h),typeof this.onpropertychange=="object"?f.bind("propertychange",b):d.browser.mozilla?f.bind("DOMAttrModified",b):setInterval(g,c)})};