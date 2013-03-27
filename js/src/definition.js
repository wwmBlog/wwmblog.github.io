define(function(require){

  require("libs/zepto.js");

  $("body").on("click", "dfn", function() {

    var $t            = $(this);
    var def           = $t.attr("title");
    var defClass      = $t.attr("data-def");
    var $wrapper      = $t.parent().parent();
    var $defContainer = defClass ? $t.wrapper.find(defClass) : null;

    if ( !$defContainer || $defContainer.length == 0 ) {
      $defContainer = $wrapper.children(".definition");
    }
    if ( $defContainer.length == 0 ) {
      $defContainer = $('<details class="definition hidden"></details>').appendTo($wrapper);
    }

    var immDef = $defContainer.children().html();
    if ( immDef != def ) {
      $defContainer
        .removeClass("hidden")
        .html("<span class='def-span'>" + def + "</span>")
        .css("height", immDef == def ? 0 : $defContainer.children().height());
    } else {
      $defContainer.html("<span class='def-span'>" + def + "<b></b></span>").css("height", 0).addClass("hidden");
    }

  });
});
