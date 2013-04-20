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

      var $c = self.$container;

      self.ready = true;
      self.onLoadImage( url, img.width, img.height );
    }
    img.src = url;

    this.ready       = false;
    this.imgWidth    = 0;
    this.imgHeight   = 0;
    this.imgLeft     = 0;
    this.imgTop      = 0;
    this.url         = url;
    this.stylesheet  = undefined;
    this.$container  = container;
    this.emptyPos    = 0;

    Puzzle.ID += 1;
  }

  var dpr = window.devicePixelRatio;

  Puzzle.ID                     = 100;
  Puzzle.prototype.DPR          = dpr !== undefined && dpr > 1 ? 2 : 1;
  Puzzle.prototype.COLUMN_COUNT = 4;
  Puzzle.prototype.TILE_COUNT   = 16;
  Puzzle.prototype.TILE_SIZE    = 30;
  Puzzle.prototype.onLoadImage  = function ( url, imgWidth, imgHeight ) {

    var WIDTH  = this.$container.width();
    var HEIGHT = this.$container.height();

    this.imgLeft  = parseInt(this.$container.css("padding-left"));
    this.imgTop   = parseInt(this.$container.css("padding-top"));

    /* Caculate best image size for the container */
    if ( imgWidth == WIDTH && imgHeight == HEIGHT ) {
      // Image is excatly fit container.
      // No need to transform the image.
      this.imgWidth = 0;
    } else {
      // Make the image to fit the container.
      var w_r = imgWidth  / WIDTH;
      var h_r = imgHeight / HEIGHT;
      if ( w_r > h_r ) { w_r = h_r; }
      // Makes the image to resize larger than the container.
      if ( w_r > 1.3 * this.DPR ) { w_r -= 0.15 * this.DPR; } 

      this.imgWidth   = imgWidth  / w_r;
      this.imgHeight  = imgHeight / w_r;
      this.imgLeft   += ( this.imgWidth  - WIDTH  ) / 2 / this.DPR;
      this.imgTop    += ( this.imgHeight - HEIGHT ) / 2 / this.DPR;
    }

    /* Inject new style rules for our image */
    var cName = this.prepareCSS();
    
    /* Create tile elements */
    this.$container[0].className = cName;
    var tag       = "<span class='puzzle-item " + cName + "' style='{#s}' data-idx='{#i}' />";
    var html      = "";

    for ( var i = 0; i < this.TILE_COUNT; ++i ) {
      html += tag
                .replace("{#s}", this.itemStyle( i ) )
                .replace("{#i}", i);
    }

    $(html).appendTo( this.$container );
  }

  Puzzle.prototype.itemPos = function ( index, a ) {
    if ( !a ) { a = {}; }
    a['x'] = index % this.COLUMN_COUNT * this.TILE_SIZE;
    a['y'] = Math.floor( index / this.COLUMN_COUNT ) * this.TILE_SIZE;
    return a;
  }

  Puzzle.prototype.itemStyle = function ( index, positionIndex ) {
    var tr = "translate(Xpx,Ypx)";
    var bg = [ "background-position:-", 0, "px -", 0, "px" ];
    var x, y, pos;

    Puzzle.prototype.itemStyle = function ( index, positionIndex ) {
      pos = this.itemPos( index );

      bg[1] = pos.x + this.imgLeft;
      bg[3] = pos.y + this.imgTop;

      if ( positionIndex !== undefined && positionIndex != index ) {
        pos.x = positionIndex % this.COLUMN_COUNT * this.TILE_SIZE;
        pos.y = Math.floor( positionIndex / this.COLUMN_COUNT ) * this.TILE_SIZE;
      }

      return ( misc.transformCSS( tr.replace('X', pos.x).replace('Y', pos.y) ) + bg.join("") );
    }

    return this.itemStyle( index, positionIndex );
  }
  
  // Inject background styles to document and returns a class that
  // can be used by the element.
  Puzzle.prototype.prepareCSS   = function () {
    // We need to define background and backgroundSize
    var cName  = "pzli" + Puzzle.ID;
    var bgsize = "";
    var bgpos  = "";

    if ( this.imgWidth != 0 ) {
      bgsize = "-webkit-background-size:{#bgsize} !important;"
                  + "-moz-background-size:{#bgsize} !important;"
                  + "-o-background-size:{#bgsize} !important;"
                  + "background-size:{#bgsize} !important;";
      bgsize = bgsize.replace(/\{#bgsize\}/g, this.imgWidth + "px auto");
    }

    var x = this.imgLeft - parseInt(this.$container.css("padding-left"));
    var y = this.imgLeft - parseInt(this.$container.css("padding-top"));
    if ( x != 0 && y != 0 ) {
      bgpos = "background-position:-" + x + "px -" + y + "px;";
    }

    var css = ".{#class} { background-image:url({#url}) !important; {#bgpos} {#bgsize}}"
                  .replace("{#class}",  cName)
                  .replace("{#bgpos}",  bgpos)
                  .replace("{#bgsize}", bgsize)
                  .replace("{#url}",    this.url);

    this.stylesheet = misc.insertCSS( this.stylesheet, css );
    return cName;
  }

  Puzzle.prototype.random = function () {

    if ( !this.ready ) { return; }

    var len        = this.TILE_COUNT - 1;
    var r          = new Array( len );
    var switch_idx = 0;
    var t;
    for ( var i = 0; i < len; ++i ) {
      switch_idx  = Math.floor( Math.random() * (len - i) ) + i;

      t = r[ switch_idx ];

      r[ switch_idx ] = r[i] === undefined ? i          : r[i];
      r[ i ]          = t    === undefined ? switch_idx : t;
    }

    // Count the parity
    var parity = 0;
    for ( i = 0; i < len; ++i ) {
      t = r[i];
      for ( var j = i+1; j < len; ++j ) {
        if ( t > r[j] ) { ++parity; }
      }
    }
    console.log( r, parity );
    // Insert the empty square to odd row if parity is odd.
    this.emptyPos = Math.floor( Math.random() * this.COLUMN_COUNT ) + 
                      this.COLUMN_COUNT *
                      ( Math.floor( Math.random() * this.COLUMN_COUNT / 2 ) * 2 + (parity + 1) % 2 );
    r.splice( this.emptyPos, 0, len );

    console.log ( r );

    var pos    = { x : 0, y : 0 };
    var $tiles = this.$container.addClass("random")
                                .children(".puzzle-item");
    for ( i = 0; i < $tiles.length; ++i ) {
      this.itemPos( i, pos );
      $tiles.eq( r[i] )
            .data("pos", i)
            .transform("translate(" + pos.x + "px, " + pos.y + "px)");
    }

    var self = this;
    setTimeout( function(){ self.$container.removeClass("random"); }, 300 );
  }

  Puzzle.prototype.solve = function ( layoutArr ) {

  }

  // Finds out pos2 is in which direction of pos1
  Puzzle.prototype.direction = function ( pos1, pos2 ) {
    // Left   : x = -1
    // Right  : x = 1
    // Top    : y = -1
    // Bottom : y = 1
    var c  = this.COLUMN_COUNT;
    var y1 = Math.floor( pos1 / c );
    var y2 = Math.floor( pos2 / c );
    var x1 = pos1 % c;
    var x2 = pos2 % c;
    var r  = { x : x2 - x1, y : y2 - y1 };
    r.adjoining = Math.abs( r.x ) + Math.abs( r.y ) == 1;
    return r;
  }

  Puzzle.prototype.slide = function ( element ) {
    var $el = $(element);
    var pos = $el.data("pos");
    if ( !this.direction( this.emptyPos, pos ).adjoining ) return;

    var newPos = this.itemPos( this.emptyPos );
    $el.data("pos", this.emptyPos)
       .transform("translate(" + newPos.x + "px, " + newPos.y + "px)");

    this.emptyPos = pos;
  }

  Puzzle.prototype.checkDone = function () {
    var $tiles = this.$container.children(".puzzle-item");

    var done = true;

    // Don't check the last tile, since last tile is empty
    // Note: This code will break if $tiles[$tiles.length - 1] != emptyTile
    for ( var i = $tiles.length - 2; i >= 0; --i ) {
      var $t = $tiles.eq(i);
      if ( $t.data("idx") != $t.data("pos") ) {
        done = false;
        break;
      }
    }

    if ( done ) {
      $(".card-left").removeClass("playing");

      i = this.TILE_COUNT - 1;
      var pos = this.itemPos( i );
      this.$container.children(".puzzle-item").eq(i)
          .data("pos", i)
          .transform("translate(" + pos.x + "px, " + pos.y + "px)");
    }
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
      var p = new Puzzle( url, $el );
      $("#W_playGame").on("click", function(){ 
        p.random();
        $(".card-left").addClass("playing");
        return false;
      });

      $el.on("click", ".puzzle-item", function(){
        p.slide( this );
        p.checkDone();
        return false;
      });
    }

  });  
});
