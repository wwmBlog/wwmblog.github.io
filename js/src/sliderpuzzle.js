define(function(require){

  var misc = require("src/misc.js");

  // Define the puzzle
  function Puzzle( url, container ) {

    var img  = new Image();
    var self = this;
    img.onload = function() {
      img.onload = null;

      $(".card-left").toggleClass("ready", true)
                     .children(".loading-wrap").remove();

      self.WIDTH  = self.$container.width();
      self.HEIGHT = self.$container.height();
      self.onLoadImage( url, img.width, img.height );
    }
    img.src = url;

    this.images     = [ img ];
    this.imgWidth   = 0;
    this.imgHeight  = 0;
    this.imgLeft    = 0;
    this.imgTop     = 0;
    this.url        = url;
    this.$container = container;

    Puzzle.ID += 1;
  }

  var dpr = window.devicePixelRatio;

  Puzzle.ID                    = 100;
  Puzzle.StyleSheet            = undefined;
  Puzzle.prototype.DPR         = dpr !== undefined && dpr > 1 ? 2 : 1;
  Puzzle.prototype.TILE_COUNT  = 4;
  Puzzle.prototype.TILE_SIZE   = 30;
  Puzzle.prototype.onLoadImage = function ( url, imgWidth, imgHeight ) {
    /* Caculate best image size for the container */
    if ( imgWidth == this.WIDTH && imgHeight == this.HEIGHT ) {
      // Image is excatly fit container.
      // No need to transform the image.
    } else {
      // Make the image to fit the container.
      var w_r = imgWidth  / this.WIDTH;
      var h_r = imgHeight / this.HEIGHT;
      if ( w_r > h_r ) { w_r = h_r; }
      if ( this.DPR == 2 ) { // This makes the image to resize larger than the container.
        if ( w_r > 2.6 ) { w_r -= 0.3;  }
      } else {
        if ( w_r > 1.3 ) { w_r -= 0.15; }
      }
      this.imgWidth  = imgWidth  / w_r;
      this.imgHeight = imgHeight / w_r;
      this.imgLeft   = ( this.imgWidth  - this.WIDTH  ) / 2;
      this.imgTop    = ( this.imgHeight - this.HEIGHT ) / 2;
    }

    /* Inject new style rules for our image */
    var cName = this.prepareCSS();
    
    /* Create tile elements */
    this.$container[0].className = cName;
    var tag  = "<span class='puzzle-item " + cName + "' style='{#s}' />";
    var tr   = "translate(Xpx,Ypx)";
    var html = "";
    for ( var i = Math.pow(this.TILE_COUNT, 2) - 1; i >= 0; --i ) {
      var x     = i % this.TILE_COUNT * this.TILE_SIZE;
      var y     = Math.floor( i / this.TILE_COUNT ) * this.TILE_SIZE;
      
      var style = misc.transformCSS( tr.replace('X', x).replace('Y', y) )
                    + "background-position:-" + x + "px -" + y +"px";

      html += tag.replace("{#s}", style);
    }
    $(html).appendTo( this.$container );
  }
  
  // Inject background styles to document and returns a class that
  // can be used by the element.
  Puzzle.prototype.prepareCSS   = function () {
    // We need to define background and backgroundSize
    var cName    = "puzzle-item" + Puzzle.ID;
    var bgsize   = "";
    if ( this.imgWidth != 0 ) {
      bgsize = "-webkit-background-size:{#bgsize} !important;"
                  + "-moz-background-size:{#bgsize} !important;"
                  + "-o-background-size:{#bgsize} !important;"
                  + "background-size:{#bgsize} !important;";
      bgsize = bgsize.replace(/\{#bgsize\}/g, this.imgWidth + "px auto");
    }

    var css = ".{#class} { background-image:url({#url}) !important; {#bgsize} }"
                  .replace("{#class}",  cName)
                  .replace("{#bgsize}", bgsize)
                  .replace("{#url}",    this.url);

    Puzzle.StyleSheet = misc.insertCSS( Puzzle.StyleSheet, css );
    return cName;
  }

  $(function(){

    var $el = $("#W_puzzle");
    // Init the first puzzle
    var url = window.getComputedStyle($el[0]).backgroundImage;
    var urlextract = /url\((.+)\)$/.exec(url);
    if ( urlextract[1] ) url = urlextract[1];
    if ( !url ) { 
      console.log("Something Bad Happens.");
    } else {
      new Puzzle( url, $el );
    }

  });  
});
