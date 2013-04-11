define(function(require){

  // Define the puzzle
  function Puzzle( url ) {

    $(".card-left").toggleClass("ready", false);

    var img  = new Image();
    var self = this;
    img.onload = function() {
      img.onload = null;
      $(".card-left").toggleClass("ready", true);
      self.onLoadImage( url, img.width, img.height );
    }
    img.src = url;
    this.images = [ img ];
  }

  var dpr = window.devicePixelRatio;
  var $el = $("#W_puzzle");

  Puzzle.prototype.ID          = 101;
  Puzzle.prototype.DPR         = dpr !== undefined && dpr > 1 ? 2 : 1;
  Puzzle.prototype.TILE_COUNT  = 4;
  Puzzle.prototype.TILE_SIZE   = 30;
  Puzzle.prototype.WIDTH       = $el.width();
  Puzzle.prototype.HEIGHT      = $el.height();
  Puzzle.prototype.onLoadImage = function ( url, imgWidth, imgHeight ) {
    /* Caculate best image size for the container */
    if ( imgWidth == this.WIDTH && imgHeight == this.HEIGHT ) {
      // Image is excatly fit container.
      // No need to transform the image.
      this.imgWidth  = 0;
      this.imgHeight = 0;
      this.imgLeft   = 0;
      this.imgTop    = 0;
    } else {
      // Make the image to fit the container.
      var w_r = imgWidth  / this.WIDTH;
      var h_r = imgHeight / this.HEIGHT;
      if ( w_r > h_r ) { w_r = h_r;   }
      if ( w_r > 1.3 ) { w_r -= 0.15; } // This makes the image to resize larger than the container.
      this.imgWidth  = imgWidth  / w_r;
      this.imgHeight = imgHeight / w_r;
      this.imgLeft   = ( this.imgWidth  - this.WIDTH  ) / 2;
      this.imgTop    = ( this.imgHeight - this.HEIGHT ) / 2;
    }

    /* Inject new style rules for our image */

    /* Create tile elements */
  }


  // Init the first puzzle
  var url = window.getComputedStyle($el[0]).backgroundImage;
  var urlextract = /url\((.+)\)$/.exec(url);
  if ( urlextract[1] ) url = urlextract[1];
  if ( !url ) { 
    console.log("Something Bad Happens.");
  } else {
    new Puzzle( url );
  }
});
