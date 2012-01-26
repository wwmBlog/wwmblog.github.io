var lastMailContent = "";

$(function(){

	// 鼠标滚轮、导航链接、左右移动按钮、底部8px bar
	var fixed = [$("#barSkill"), $("#barWork"), $("#barContact"), 
				$("#btnSpace").hide(), $("#btnLeft").hide(), $("#btnRight")];
				
	fixed[3].click(function() { $.scrollTo({top:0, left:0}, 500); });
	fixed[4].click(function() {
		var bodyW = $("body").width();
		var curr  = Math.floor(window.pageXOffset / bodyW);
		if(window.pageXOffset % bodyW == 0 && curr > 0) { --curr; }
		$.scrollTo({top:0, left: curr * bodyW}, 300);
	});
	fixed[5].click(function() {
		var bodyW = $("body").width();
		var curr  = Math.ceil(window.pageXOffset / bodyW);
		if(window.pageXOffset % bodyW == 0 && curr < 3) { ++curr; }
		$.scrollTo({top:0, left: curr * bodyW}, 300);
	});
	$("#nav a").each(function() { 
		if(this.name != "") { $(this).click(function(e) { $.scrollTo('#'+this.name, 600); e.preventDefault(); }); }
	});
	
	
	$("body").mousewheel(function(e, delta) {
		window.scrollBy(-delta*30, 0)
		e.preventDefault();
	}).keyup(function(e) {
		var key = e.keyCode | e.which;
		if(key == 32) { fixed[3].click(); }
		else if(key == 37) { fixed[4].click(); }
		else if(key == 39) { fixed[5].click(); }
		e.preventDefault();
	});
	
	var $mailContent = $("#content");
	var $mailAddress = $("#mail");
	var $mailNotify  = $("#notification");
	$mailContent.add("#fancyInput").mousewheel(stopProp).keyup(stopProp);
	$(window).scroll(adjustFixContent).resize(adjustFixContent);
	
	function stopProp(e) { e.stopPropagation(); }
	function adjustFixContent() {
		var bodyW  = $("body").width();
		var half = bodyW / 2;
		var m  = half;
		var x = window.pageXOffset;
		
		for(var i = 0; i < 3; ++i)
		{
			var b = x < m ? -8 : 0;
			if(x < m + half) { b = 8 * ((x-m)/half - 1); }
			fixed[i].css("bottom", b + "px");
			m += bodyW;
		}
		fixed[3].toggle(x > 0);
		fixed[4].toggle(x > 0);
		if(x >= 3 * bodyW) {
			fixed[5].hide();
			$mailContent.focus();
		} else if(fixed[5].css("display") == "none") {
			fixed[5].show();
			$mailContent.blur();
		}
	}
	
	// Form
	$("#sendme").click(function(e) {
		// Global
		if($mailContent.val() == "" || $mailContent.val() == $mailContent.attr("placeholder")) {
			$mailNotify.html("你什么都还没写呢~~");
		} else if(!testEmail($mailAddress.val())) {
			$mailNotify.html("Email不正确吧~~");
		} else if(lastMailContent == $mailContent.val()) {
			$mailNotify.html("你已经发过一样的消息了。");
		} else {
			// Global
			lastMailContent = $mailContent.val();
		
			$mailNotify.html("");
			animateBar(fixed[2]);
			$mailNotify.html("Sending...");
			// send the content
			$.ajax({  
				type: "POST",  
				url:  "ohnewmessage.php",  
				data: {"email": $mailAddress.val(), "content": $mailContent.val()},  
				success: function(data) {
					if(data == "Success") {
						$mailNotify.html("发送成功。我会尽快回复你的。");
						$("#stampd").show()
						.css({"left":"2px", "top":"87px", "width":"147px", "height":"91px"})
						.animate({left:"7px", top:"92px", width:"137px", height:"81"}, 100);
					} else {
						onSendError();
					}
				},
				error: onSendError,
				complete: function() { fixed[2].stop(); }
			});
			function onSendError() {
				$("#stampd").hide();
				$mailNotify.html("Oops，出错了。不如直接发邮件给我吧: liangmorr@gmail.com");
			}
		}
		return false;
	});
	$mailContent.bind("textchange", function() { $mailNotify.html(""); $("#stampd").hide(); });
	// 验证Email
	$mailAddress.bind("textchange", function() {
		if(testEmail($(this).val())) { $("#sendme").removeAttr("disabled"); } else { $("#sendme").attr("disabled", "disabled"); }
	}).keydown(function(e){
		if(e.keyCode == 13 | e.which == 13) { 
			$("#sendme").click();
			e.preventDefault();
			return false;
		}
	}).trigger("textchange");
	function testEmail(m) {
		var pat = /[\w\d_\.\-]+@([\w\d_\-]+\.)+[\w\d]{2,4}/;
		return pat.test(m);
	}
	function animateBar(bar) {
		bar.css({backgroundPosition:"0 0"})
		.animate({backgroundPosition: '-96px 0' }, 500, 'linear', function() { animateBar(bar); });
	}
	// PlaceHolder
	if(!$.support.placeholder) {
		var p = "placeholder";
		$mailContent.add($mailAddress).focus(function() {
			var $t = $(this);
			if ($t.attr(p) != "" && $t.val() == $t.attr(p)) {
				$t.val("");
			}
		}).blur(function () {
			var $t = $(this);
			if ($t.attr(p) != "" && $t.val() == "") {
				$t.val($t.attr(p));
			} 
		}).blur();
	}
	
	// Work List
	$("#worklist .overlay").css("opacity", 0);
	$("#worklist li a").append("<div class='s2'></div>")
	$("#worklist li").hover(
		function() {
			var title = $(this).stop().animate({"top":"-5px"},250)
						.children(".triangle").hide()
						.nextAll(".overlay").stop().animate({"opacity":1}, 250).next();
			title.animate({"left":(111-title.outerWidth())/2 + "px"},200)
			.next().show().animate({"left":"38px","top":"30px",
								"width":"34px","height":"34px","opacity":"0.7"}, 200)
		},
		function() {
			$(this).animate({"top":"0"},250)
			.children(".overlay").animate({"opacity":0}, 250)
			.next().animate({"left":"-10px"},200,"linear",function(){$(this).siblings(".triangle").show();})
			.next().css({"left":"45px","top":"35px","width":"24px","height":"24px","opacity":"0"}).hide();
		}
	);
	
	// Logo
    $("#logoAlt").css("opacity","0").hover(
	    function() { $(this).stop().animate({"opacity":"1"}, 200); },
	    function() { $(this).stop().animate({"opacity":"0"}, 200); });
	    
	// 社交Icons
	var $socialExpand = $("#socialExpand");
	var $socialLinks = $socialExpand.find("a");
	$("#social #showSocial").toggle(
		function() { 
			$(this).rotate({ "animateTo":90 });
			$socialExpand.stop().slideDown(200, 
				function(){ $socialLinks.each(function(i){ $(this).delay(i*50).animate({"opacity":1},250); }); }
			)
		},
		function() { 
			$(this).rotate({ "animateTo":0 });
			$socialLinks.animate({"opacity":0}, 100, function() { $socialExpand.slideUp(200);});
		}
	).click();
	
	// Tooltip。将class含tooltip的element的title变成它的tooltip
	$(".ttTarget").each(function() {
	
		var target = $(this);
		var title = target.attr("title");
		if(title == "") { return; }
		target.attr("title","");
		
		// options
	    var distance  = target.hasClass("ttFar") ? 20 : 10;
	    var time      = 250;
	    var hideDelay = 200;

	    var hideTimer = null;
	    var shown     = false;
	    var inEffect  = "-=";
	    var outEffect = "+=";
	    
	    var tip = $("<div class='tooltip' style='opacity:0;'>" + title + "</div>").appendTo("body");
	    var isTop = !target.hasClass("ttBottom");
	    var arrow = "<div class='arrow'></div>";
	    
	    var hoverTarget = target;
	    
	    if(target.hasClass("lf")) { tip.addClass("lf"); }
	    
	    if(isTop) {
	    	tip.append(arrow);
	    	hoverTarget = target.add(tip);
	    } else {
		    inEffect  = "+=";
		    outEffect = "-=";
		    tip.addClass("ttBottom");
	    	tip.prepend(arrow);
	    }
	    
	    hoverTarget.hover(
	    	function() {
	    		
		    	if(hideTimer) clearTimeout(hideTimer);
		    	if(shown) { return; }
		    	shown = true;
		    	
		    	var targetPos = target.offset();
		    	var tipX = (targetPos.left - window.pageXOffset + target.outerWidth() / 2) - tip.outerWidth()/2;
		    	var tipY = targetPos.top - window.pageYOffset + (isTop ? (-tip.outerHeight() - 10) : target.outerHeight() + 10);
		    	
		    	tip.css({"left":tipX+'px', "top":tipY+'px', "display":'block'})
		    	.stop().animate({"top":inEffect + distance + 'px', "opacity":1}, time, 'swing');
	    	},
	    	function() {
		    	if(hideTimer) clearTimeout(hideTimer);
		    	
		    	hideTimer = setTimeout(function () {
		    			hideDelayTimer = null;
		    	  		shown = false;
		    	  		tip.stop(true,true).animate({"top":outEffect + distance + 'px', "opacity":0}, time, 'swing', function() { tip.css("display", 'none'); });
		    		}, hideDelay);
	    	}
	    );	
	});
	
	// Mac雅黑没有bold字体，所以如果是在Mac系统，并且有雅黑字体，则将部分元素设为非粗体。
	var pf = navigator.platform.toLowerCase();
	var notWindow = pf.indexOf("windows") == -1 || pf.indexOf("win32") == -1;
	if(notWindow && testYahei()) { $("#intro").add("#nav").css("font-weight","normal"); }
	
	function testYahei() {
		var h = document.getElementsByTagName("body")[0];
		var d = document.createElement("div");
		var s = document.createElement("span");
		d.appendChild(s);
		d.style.fontFamily = s.style.fontFamily = "Arial";
		s.style.fontSize   = "72px";
		s.innerHTML        = "mmmmmmmmmmlil";
		h.appendChild(d);
		var dw   = s.offsetWidth;
		var dh  = s.offsetHeight;
		s.style.fontFamily = "Microsoft Yahei";
		var nw = s.offsetWidth;
		var nh = s.offsetHeight;
		h.removeChild(d);
		return nw != dw || nh != dh;
	}
	
	// Skill List
	setupSkill($("#pro"));
	setupSkill($("#basic"));
	window.onresize = function() {
		var p = $("#pro");
		if(p.outerWidth() != p.data("currentWidth")) {
			setupSkill(p);
			setupSkill($("#basic"));
		}
	}
	
	function stopSkillAni(target) {
		target.children().stop(true,true).each(function() { $(this).children().stop(true,true); });
		return target;
	}
	
	function setupSkill(target) {
		var targetWidth  = stopSkillAni(target).outerWidth() - Number(target.attr("lend"));
		var rightEnd     = Number(target.attr("rend"));
		var contentWidth = targetWidth - rightEnd;
		var piece        = contentWidth / Number(target.attr("totalLv"));
		
		var $children    = target.children();
		var maxIndex     = $children.size() - 1;
		
		var contentLeft     = 0;
		
		var inited = target.data("inited") == true;
		if(!inited) { target.data("inited", true); }
		
		for (var i = maxIndex; i >= 0; --i) {
			var $child = $($children[i]);
			
			if(!inited) { $child.attr("prefWidth", $child.outerWidth()); }
			var childW = Math.round($child.attr("level") * piece);
			
			var cf = contentLeft + 4;
			contentLeft += childW;
			var cr = targetWidth - contentLeft;
			
			$child.css("right", cr).data({"contentLeft":cf, "thisRight":cr})
			.children().css({"left": cf, "position":"absolute"});
		}
		
		target.data("currentWidth", target.outerWidth());
	}

	$("#pro").children().hover(skillHover, skillBlur);
	$("#basic").children().hover(skillHover, skillBlur);
	
	function skillBlur() {
		$(this).parent().children().each(function () {
			var t = $(this).stop(true, false);
			t.animate({"right":t.data("thisRight")+'px'}, 200)
			.children().animate({"left":t.data("contentLeft")+'px'}, 200);
		});
	}
	
	function skillHover() {	
		
		var $this  = $(this);
		var pWidth = $this.parent().outerWidth();
		
		function getTagContentWidth(tag) {
			return pWidth - parseInt(tag.css("left")) - tag.data("thisRight") - tag.data("contentLeft") - 10;// 10: cotnent的right属性
		}
		
		var need   = $this.attr("prefWidth") - getTagContentWidth($this);
		if(need <= 0) { return; }
		
		var minContentWidth = 4 + 32 + 10;
		
		var sibling   = $this.prev();
		var gain      = 0;
		var rSiblings = [];
		var rGains    = [];
		
		while(sibling.size() != 0 && gain < need) {
			rSiblings.push(sibling);
			var canget = getTagContentWidth(sibling) - 32; // Icon size
			if(canget + gain > need) { canget = need - gain; }
			gain += canget;
			
			rGains.push(canget);
			sibling = sibling.prev();
		}
		
		var lneed = need - gain;
		
		$this.stop(true, false).animate({"right": $this.data("thisRight") - gain + 'px'}, 200);
		
		if(gain != 0) {
			var rgain = gain;
			for(i = 0; i < rSiblings.length; ++i) {
				sibling = rSiblings[i];
				sibling.children().stop(true, false)
				.animate({'left': sibling.data("contentLeft") + rgain + 'px'}, 200);
				
				if(i != rSiblings.length - 1) {
					rgain -= rGains[i];
					sibling.stop(true, false)
					.animate({'right': sibling.data("thisRight") - rgain + 'px'}, 200);
				}
			}
		}
		
		if(lneed != 0) {
			var leftMinWidth = 0;
			sibling = $this.next();
			
			while(sibling.size() != 0) {
				leftMinWidth += minContentWidth;
				sibling = sibling.next();
			}
			
			var leftMaxGain = $this.children().position().left - leftMinWidth;
			if(leftMaxGain <= 0) { return; }
			if(lneed > leftMaxGain) { lneed = leftMaxGain; }
			
			$this.children().stop(true, false)
			.animate({'left': $this.data("contentLeft") - lneed + 'px'}, 200);
			
			sibling = $this.next();
			while(sibling.size() != 0 && lneed > 0) {
				var t = sibling.stop(true, false)
						.animate({'right': sibling.data("thisRight") + lneed + 'px'}, 200);
				sibling = sibling.next();
				
				if(sibling.size() != 0) {
					var canget = getTagContentWidth(t) - 32;
					if(canget > lneed) {
						lneed = 0;
					} else {
						lneed -= canget;
						t.children().stop(true, false)
						.animate({'left': t.data("contentLeft") - lneed + 'px'}, 200);
					}
				}
			}
		}
	}
});