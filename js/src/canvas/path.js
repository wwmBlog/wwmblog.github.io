define(function(require){

  var Node = require("./node.js");

  function Path ( p ) {
    Node.call( this );
    this.path  = p;
  }

  var CmdMap;
  var CmdRegex   = /([A-Za-z])([^A-Za-z]*)/g;
  var ParamRegex = /\-?[0-9]*\.?[0-9]+/g;

  // Helpers
  function parseF  ( el, idx, array ) { array[idx] = parseFloat( el ); }
  function execCmd ( el, idx, arrry ) { el.m.call( this, el.p, el.r ); }

  // Private
  Path.prototype = new Node();
  Path.prototype.decodePath = function() {
    if ( this.decoded ) { return; }

    var decoded = this.decoded = [];
    this.path
        .replace( CmdRegex, function(m, m1, m2){

          var ps = m2.match(ParamRegex);
          if ( ps ) ps.forEach(parseF);

          decoded.push({
              m : CmdMap[m1.toLowerCase()]
            , p : ps
            , r : m1.charCodeAt(0) > 96
          });
        });

    this.path = null;
  }

  Path.prototype.createPath = function() {
    this.lastX = 0;
    this.lastY = 0;

    this.decodePath();

    this.ctx.beginPath();
    this.decoded.forEach( execCmd, this );
    this.ctx.closePath();
  }

  var ExecCmd_Len;
  var ExecCmd_I;
  Path.prototype.moveTo = function ( ps, r )  {

    ExecCmd_I = 0;
    ExecCmd_Len = ps.length / 2;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        this.lastX += ps[ExecCmd_I    ];
        this.lastY += ps[ExecCmd_I + 1];

        this.ctx.moveTo( this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
      this.lastX = ps[ExecCmd_I    ];
      this.lastY = ps[ExecCmd_I + 1];
      this.ctx.moveTo( this.lastX, this.lastY );
    }
  }
  Path.prototype.lineTo = function ( ps, r )  {

    ExecCmd_I = 0;
    ExecCmd_Len = ps.length / 2;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        this.lastX += ps[ExecCmd_I    ];
        this.lastY += ps[ExecCmd_I + 1];

        this.ctx.lineTo( this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
      this.lastX = ps[ExecCmd_I    ];
      this.lastY = ps[ExecCmd_I + 1];
      this.ctx.lineTo( this.lastX, this.lastY );
    }
  }
  Path.prototype.arcTo = function ( ps, r )  {

    ExecCmd_I = 0;
    ExecCmd_Len = ps.length / 5;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        var x1 = this.lastX + ps[ExecCmd_I    ];
        var y1 = this.lastY + ps[ExecCmd_I + 1];

        this.lastX += ps[ExecCmd_I + 2];
        this.lastY += ps[ExecCmd_I + 3];

        this.ctx.arcTo( x1, y1, this.lastX, this.lastY, ps[ExecCmd_I + 4] );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
      this.lastX = ps[ExecCmd_I + 2];
      this.lastY = ps[ExecCmd_I + 3];
      this.ctx.arcTo( ps[ExecCmd_I    ]
                    , ps[ExecCmd_I + 1]
                    , this.lastX
                    , this.lastY
                    , ps[ExecCmd_I + 4] );
    }
  }
  Path.prototype.quadraticTo = function ( ps, r )  {

    ExecCmd_I = 0;
    ExecCmd_Len = ps.length / 4;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        var x1 = this.lastX + ps[ExecCmd_I    ];
        var y1 = this.lastY + ps[ExecCmd_I + 1];

        this.lastX += ps[ExecCmd_I + 2];
        this.lastY += ps[ExecCmd_I + 3];

        this.ctx.quadraticCurveTo( x1, y1, this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
      this.lastX = ps[ExecCmd_I + 2];
      this.lastY = ps[ExecCmd_I + 3];
      this.ctx.quadraticCurveTo( ps[ExecCmd_I    ]
                               , ps[ExecCmd_I + 1]
                               , this.lastX
                               , this.lastY);
    }
  }

  Path.prototype.bezierTo = function ( ps, r )  {

    ExecCmd_I = 0;
    ExecCmd_Len = ps.length / 6;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        var cpx1 = this.lastX + ps[ExecCmd_I    ];
        var cpy1 = this.lastY + ps[ExecCmd_I + 1];
        var cpx2 = this.lastX + ps[ExecCmd_I + 2];
        var cpy2 = this.lastY + ps[ExecCmd_I + 3];

        this.lastX += ps[ExecCmd_I + 4];
        this.lastY += ps[ExecCmd_I + 5];

        this.ctx.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
      this.lastX = ps[ExecCmd_I + 4];
      this.lastY = ps[ExecCmd_I + 5];
      this.ctx.bezierCurveTo( ps[ExecCmd_I    ]
                            , ps[ExecCmd_I + 1]
                            , ps[ExecCmd_I + 2]
                            , ps[ExecCmd_I + 3]
                            , this.lastX
                            , this.lastY);
    }
  }

  var PathPrototype = Path.prototype;
  CmdMap = {
        m : PathPrototype.moveTo
      , l : PathPrototype.lineTo
      , a : PathPrototype.arcTo
      , c : PathPrototype.bezierTo
      , q : PathPrototype.quadraticTo
  };

  Path.prototype.render = function( ctx, attrs ) {
    this.ctx = ctx;
    this.createPath();
    ctx.fill();
    if ( attrs.lineWidth ) { ctx.stroke(); }
    this.ctx = null;
  }


  function createRoundRectPath () {
    var ctx = this.ctx;
    var w   = this.width;
    var h   = this.height;
    var r   = this.radius;
    ctx.beginPath();

    ctx.moveTo ( r, 0 );
    ctx.lineTo ( w - r, 0 );
    ctx.arcTo  ( w, 0, w, r, r );
    ctx.lineTo ( w, h - r );
    ctx.arcTo  ( w, h, w - r, h, r );
    ctx.lineTo ( r, h );
    ctx.arcTo  ( 0, h, 0, h - r, r );
    ctx.lineTo ( 0, r );
    ctx.arcTo  ( 0, 0, r, 0, r );
  }


  // Generate Round Rect Path Object
  Path.RoundRect = function( width, height, radius ) {
    var rr = new Path();
    rr.width  = width;
    rr.height = height;
    rr.radius = radius;
    rr.createPath = createRoundRectPath;
    return rr;
  }

  return Path;

});
