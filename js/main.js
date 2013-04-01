define(function(require){

  require("libs/zepto.js");
  require("src/definition.js");
  require("src/skill/skill.js");
  require("src/timeline.js");


  /* -- Intro Page -- */
  ;(function(){
    // Intro Card Citing Carousel, 2D Version
    function CiteCarousel2D(){
      var index = 0;
      function nextCiting() {
        var $cites = $("#W_citeCarousel .cite-wrap").eq(0);
        $cites.animate({"margin-top":-$cites.height()}, 400, "linear", function(){
          $("#W_citeCarousel .cite-wrap").eq(0).appendTo($("#W_citeCarousel")).css("margin-top", 0);
        });

        setTimeout(nextCiting, 5000);
      }
      setTimeout(nextCiting, 5000);
    }

    var index     = 0;
    var child_len = 0;
    var support   = require("src/support.js");

    // Intro Card Citing Carousel, 3D Version
    function CiteCarousel3D(){
      // Prepare
      child_len = $("#W_citeCarousel")
                      .removeClass("cite-con")
                      .children()
                      .wrap("<div class='cite-con'></div>").length;
      index = child_len - 1;

      function flipDone() {
        $("#W_citeCarousel").off(support.animationEnd, flipDone).removeClass("cite-play");
        setTimeout(flip, 5000);
        return false;
      }
      function flip() {
        var $con = $("#W_citeCarousel");
        var $chs = $con.children();
        $con.children(".head").removeClass("head");
        $con.children(".tail").removeClass("tail");

        $chs.eq(index).addClass("head");
        ++index;
        if ( index == child_len ) { index = 0; }
        $chs.eq(index).addClass("tail");

        $con.on(support.animationEnd, flipDone).addClass("cite-play");
      }

      setTimeout(flip, 3000);
    }

    (support.threed ? CiteCarousel3D : CiteCarousel2D)();
  })();


  /* -- Stickers(Logo, Shortcuts) -- */
  ;(function(){

    var ScrollWatcher = require("src/scrollwatcher.js");
    var logoOffset  = $(".logo-wrap").height() + 5;
    var logoW = new ScrollWatcher( ".intro-wrap-holder", -logoOffset );
    logoW.on("scrollabove", function(){ $(".logo-wrap").addClass("fixed"); })
         .on("scrollinto",  function(){ $(".logo-wrap").removeClass("fixed"); });

    var shortcutW = new ScrollWatcher( "footer", 10 );
    shortcutW.on("scrollinto",  function(){ $(".shortcut-nav").toggleClass("sticky", true);  })
             .on("scrollbelow", function(){ $(".shortcut-nav").toggleClass("sticky", false); });

  })();

});
