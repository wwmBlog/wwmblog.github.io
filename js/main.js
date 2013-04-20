define(function(require){

  require("libs/zepto.js");
  require("src/definition.js");
  require("src/skill/skill.js");
  require("src/timeline.js");
  require("src/sliderpuzzle.js");


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
    var misc      = require("src/misc.js");

    // Intro Card Citing Carousel, 3D Version
    function CiteCarousel3D(){
      // Prepare
      child_len = $("#W_citeCarousel")
                      .removeClass("cite-con")
                      .children()
                      .wrap("<div class='cite-con'></div>").length;
      index = child_len - 1;

      function flipDone() {
        $("#W_citeCarousel").off(misc.animationEnd, flipDone).removeClass("cite-play");
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

        $con.on(misc.animationEnd, flipDone).addClass("cite-play");
      }

      setTimeout(flip, 2000);
    }

    (misc.threed ? CiteCarousel3D : CiteCarousel2D)();
  })();


  /* -- Stickers(Logo, Shortcuts) -- */
  ;(function(){

    var ScrollWatcher = require("src/scrollwatcher.js");
    var logoOffset  = $(".logo-wrap").height() + 5;
    var logoW = new ScrollWatcher( ".intro-wrap-holder", -logoOffset );
    logoW.on("scrollabove", function(){ $(".logo-wrap").addClass("fixed"); })
         .on("scrollinto",  function(){ $(".logo-wrap").removeClass("fixed"); });

    var shortcutW = new ScrollWatcher( ".page4", 0 );
    shortcutW.on("scrollinto",  function(){ $(".shortcut-nav").toggleClass("sticky", true);  })
             .on("scrollbelow", function(){ $(".shortcut-nav").toggleClass("sticky", false); });

    var scrolling = false;
    function scrollPage ( toggleItem, dirDown ) {
      
      if ( toggleItem ) {
        $(toggleItem).toggleClass("active", true);
        setTimeout( function(){ $(toggleItem).toggleClass("active", false); }, 200);
      }

      if ( scrolling ) { return; }

      var scrollY   = window.scrollTop || window.scrollY;
      var $pages    = $(".page-wrap");
      var toScrollY = -1;
      var i         = 0;
      var offset;

      if ( dirDown ) {
        for ( ; i < $pages.length; ++i ) {
          offset = $pages.eq(i).offset();
          if ( scrollY < offset.top ) {
            toScrollY = offset.top;
            break;
          }
        } 
      } else {
        for ( i = $pages.length - 1; i >= 0; --i ) {
          offset = $pages.eq(i).offset();
          if ( scrollY > offset.top ) {
            toScrollY = offset.top;
            break;
          }
        }
      }

      if ( toScrollY == -1 ) {
        toScrollY = dirDown ? document.documentElement.scrollHeight - window.innerHeight : 0;
      }
      if ( toScrollY != scrollY ) {
        scrolling = true;

        $.genericAnimate( toScrollY - scrollY, function( value ){
          window.scrollTo( 0, Math.floor(scrollY + value) );
          if ( scrollY + value == toScrollY ) {
            scrolling = false;
          }
        });
      }
    }

    function pageUp   ( effect ) { scrollPage( effect ? "#W_vimK" : "", false ); }
    function pageDown ( effect ) { scrollPage( effect ? "#W_vimJ" : "", true );  }

    $("body").on("keypress", function( evt ){
      var kc = evt.which || evt.keyCode;
      if ( kc == 106 /* j */) { pageDown( true ); } else 
      if ( kc == 107 /* k */) { pageUp  ( true ); }
    });
    $("#W_vimJ").on("click", pageDown);
    $("#W_vimK").on("click", pageUp);
  })();

});
