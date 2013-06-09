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

  Path.prototype.createPath = function( ctx, attrs ) {
    this.lastX = 0;
    this.lastY = 0;

    this.decodePath();

    this.ctx = ctx;
    ctx.beginPath();
    this.decoded.forEach( execCmd, this );
    ctx.closePath();
    this.ctx = null;
  }

  var ExecCmd_Len;
  var ExecCmd_I;
  var ExecCmd_I_REAL;
  Path.prototype.moveTo = function ( ps, r )  {

    // A moveTo command always create a subPath
    if ( r ) {
      this.lastX += ps[0];
      this.lastY += ps[1];
    } else {
      this.lastX = ps[0];
      this.lastY = ps[1];
    }

    this.initX = this.lastX;
    this.initY = this.lastY;
    this.ctx.moveTo(this.lastX, this.lastY);

    // Other parameters are treated as lineTo
    ExecCmd_I      = 2;
    ExecCmd_I_REAL = 2;
    ExecCmd_Len    = ps.length / 2;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=2 ) {
        this.lastX += ps[ExecCmd_I_REAL    ];
        this.lastY += ps[ExecCmd_I_REAL + 1];
        this.ctx.lineTo( this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=2 ) {
      this.lastX = ps[ExecCmd_I_REAL    ];
      this.lastY = ps[ExecCmd_I_REAL + 1];
      this.ctx.lineTo( this.lastX, this.lastY );
    }
  }
  Path.prototype.lineTo = function ( ps, r )  {

    ExecCmd_I      = 0;
    ExecCmd_I_REAL = 0;
    ExecCmd_Len    = ps.length / 2;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=2 ) {
        this.lastX += ps[ExecCmd_I_REAL    ];
        this.lastY += ps[ExecCmd_I_REAL + 1];

        this.ctx.lineTo( this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=2 ) {
      this.lastX = ps[ExecCmd_I_REAL    ];
      this.lastY = ps[ExecCmd_I_REAL + 1];
      this.ctx.lineTo( this.lastX, this.lastY );
    }
  }
  Path.prototype.horLineTo = function ( ps, r )  {

    ExecCmd_I   = 0;
    ExecCmd_Len = ps.length;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        this.lastX += ps[ExecCmd_I];
        this.ctx.lineTo( this.lastX, this.lastY );
      }
      return;
    }

    this.lastX = ps[ExecCmd_Len - 1];
    this.ctx.lineTo( this.lastX, this.lastY );
  }
  Path.prototype.verLineTo = function ( ps, r ) {
    ExecCmd_I   = 0;
    ExecCmd_Len = ps.length;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I ) {
        this.lastY += ps[ExecCmd_I];
        this.ctx.lineTo( this.lastX, this.lastY );
      }
      return;
    }

    this.lastY = ps[ExecCmd_Len - 1];
    this.ctx.lineTo( this.lastX, this.lastY );
  }
  Path.prototype.arcTo = function ( ps, r )  {

    ExecCmd_I      = 0;
    ExecCmd_I_REAL = 0;
    ExecCmd_Len    = ps.length / 5;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=5 ) {
        var x1 = this.lastX + ps[ExecCmd_I_REAL    ];
        var y1 = this.lastY + ps[ExecCmd_I_REAL + 1];

        this.lastX = x1 + ps[ExecCmd_I_REAL + 2];
        this.lastY = y1 + ps[ExecCmd_I_REAL + 3];

        this.ctx.arcTo( x1, y1, this.lastX, this.lastY, ps[ExecCmd_I_REAL + 4] );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=5 ) {
      this.lastX = ps[ExecCmd_I_REAL + 2];
      this.lastY = ps[ExecCmd_I_REAL + 3];
      this.ctx.arcTo( ps[ExecCmd_I_REAL    ]
                    , ps[ExecCmd_I_REAL + 1]
                    , this.lastX
                    , this.lastY
                    , ps[ExecCmd_I_REAL + 4] );
    }
  }
  Path.prototype.quadraticTo = function ( ps, r )  {

    ExecCmd_I      = 0;
    ExecCmd_I_REAL = 0;
    ExecCmd_Len    = ps.length / 4;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=4 ) {
        var x1 = this.lastX + ps[ExecCmd_I_REAL    ];
        var y1 = this.lastY + ps[ExecCmd_I_REAL + 1];

        this.lastX += ps[ExecCmd_I_REAL + 2];
        this.lastY += ps[ExecCmd_I_REAL + 3];

        this.ctx.quadraticCurveTo( x1, y1, this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=4 ) {
      this.lastX = ps[ExecCmd_I_REAL + 2];
      this.lastY = ps[ExecCmd_I_REAL + 3];
      this.ctx.quadraticCurveTo( ps[ExecCmd_I_REAL    ]
                               , ps[ExecCmd_I_REAL + 1]
                               , this.lastX
                               , this.lastY);
    }
  }

  Path.prototype.bezierTo = function ( ps, r )  {

    ExecCmd_I      = 0;
    ExecCmd_I_REAL = 0;
    ExecCmd_Len    = ps.length / 6;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=6 ) {

        var cpx1 = this.lastX + ps[ExecCmd_I_REAL    ];
        var cpy1 = this.lastY + ps[ExecCmd_I_REAL + 1];
        var cpx2 = this.lastX + ps[ExecCmd_I_REAL + 2];
        var cpy2 = this.lastY + ps[ExecCmd_I_REAL + 3];

        this.lastX += ps[ExecCmd_I_REAL + 4];
        this.lastY += ps[ExecCmd_I_REAL + 5];

        this.ctx.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=6 ) {

      this.lastX = ps[ExecCmd_I_REAL + 4];
      this.lastY = ps[ExecCmd_I_REAL + 5];
      this.ctx.bezierCurveTo( ps[ExecCmd_I_REAL    ]
                            , ps[ExecCmd_I_REAL + 1]
                            , ps[ExecCmd_I_REAL + 2]
                            , ps[ExecCmd_I_REAL + 3]
                            , this.lastX
                            , this.lastY);
    }
  }

  // The smoothBT doesn't follow SVG spec.
  // The first control point is always current point.
  Path.prototype.smoothBezierTo = function( ps, r ) {
    ExecCmd_I      = 0;
    ExecCmd_I_REAL = 0;
    ExecCmd_Len    = ps.length / 4;

    var cp1x = this.lastX;
    var cp1y = this.lastY;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=4 ) {

        var cpx2 = this.lastX + ps[ExecCmd_I_REAL    ];
        var cpy2 = this.lastY + ps[ExecCmd_I_REAL + 1];

        this.lastX += ps[ExecCmd_I_REAL + 2];
        this.lastY += ps[ExecCmd_I_REAL + 3];

        this.ctx.bezierCurveTo( cp1x, cp1y, cpx2, cpy2, this.lastX, this.lastY );
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=4 ) {

      this.lastX = ps[ExecCmd_I_REAL + 2];
      this.lastY = ps[ExecCmd_I_REAL + 3];
      this.ctx.bezierCurveTo( cp1x, cp1y
                            , ps[ExecCmd_I_REAL    ]
                            , ps[ExecCmd_I_REAL + 1]
                            , this.lastX
                            , this.lastY);
    }
  }

  Path.prototype.closePath = function () { 
    this.ctx.closePath();
    this.lastX = this.initX;
    this.lastY = this.initY;
  }

  var R2D = Math.PI / 180;
  Path.prototype.arc = function ( ps, r )  {

    // x, y, radius, startAngle, endAngle, anticlockwise

    ExecCmd_I      = 0;
    ExecCmd_I_REAL = 0;
    ExecCmd_Len    = ps.length / 6;

    var radius;
    var endAngle;

    if ( r ) {
      for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=6 ) {

        radius   = ps[ExecCmd_I_REAL + 2];
        endAngle = ps[ExecCmd_I_REAL + 4];

        this.lastX += ps[ExecCmd_I_REAL    ];
        this.lastY += ps[ExecCmd_I_REAL + 1];

        this.ctx.arc( 
            this.lastX
          , this.lastY
          , radius
          , ps[ExecCmd_I_REAL + 3] * R2D
          , endAngle * R2D
          , ps[ExecCmd_I_REAL + 5] || 0);

        this.lastX += Math.round(Math.cos( endAngle * R2D ) * radius);
        this.lastY += Math.round(Math.sin( endAngle * R2D ) * radius);
      }
      return;
    }

    for ( ; ExecCmd_I < ExecCmd_Len; ++ExecCmd_I, ExecCmd_I_REAL+=6 ) {
      radius   = ps[ExecCmd_I_REAL + 2];
      endAngle = ps[ExecCmd_I_REAL + 4];

      this.ctx.arc( 
          ps[ExecCmd_I_REAL    ]
        , ps[ExecCmd_I_REAL + 1]
        , radius
        , ps[ExecCmd_I_REAL + 3] * R2D
        , endAngle * R2D
        , ps[ExecCmd_I_REAL + 5] || 0);

      this.lastX = Math.round(Math.cos( endAngle * R2D ) * radius);
      this.lastY = Math.round(Math.sin( endAngle * R2D ) * radius);
    }
  }

  var PathPrototype = Path.prototype;
  CmdMap = {
        m : PathPrototype.moveTo
      , l : PathPrototype.lineTo
      , r : PathPrototype.arcTo
      , a : PathPrototype.arc
      , c : PathPrototype.bezierTo
      , q : PathPrototype.quadraticTo
      , z : PathPrototype.closePath
      , h : PathPrototype.horLineTo
      , s : PathPrototype.smoothBezierTo
      , v : PathPrototype.verLineTo
  };

  Path.prototype.doRender = function( ctx, time ) {

    if ( this.clipPath ) {
      ctx.save();
      this.clipPath.createPath( ctx, this.clipPath.getCurrentAttr( time ) );
      ctx.clip();
    }

    Node.prototype.doRender.call( this, ctx, time );

    if ( this.clipPath ) {
      ctx.restore();
    }
  };

  // Public
  Path.prototype.render = function( ctx, attrs ) {
    this.createPath( ctx, attrs );
    ctx.fill();
    if ( attrs.lineWidth ) { ctx.stroke(); }
  }

  Path.prototype.clip = function ( apath ) {
    apath.decodePath();
    this.clipPath = apath;
  }


  function createRoundRectPath ( ctx, attrs ) {
    var w   = attrs.width;
    var h   = attrs.height;
    var r   = attrs.radius;
    var x   = attrs.x || 0;
    var y   = attrs.y || 0;

    ctx.beginPath();
    ctx.moveTo ( x + r    , y );
    ctx.lineTo ( x + w - r, y );
    ctx.arcTo  ( x + w,  y, x + w, y + r, r );
    ctx.lineTo ( x + w    , y + h - r );
    ctx.arcTo  ( x + w    , y + h, x + w - r, y + h, r );
    ctx.lineTo ( x + r    , y + h );
    ctx.arcTo  ( x        , y + h, x, y + h - r, r );
    ctx.lineTo ( x        , y + r );
    ctx.arcTo  ( x        , y    , x + r, y, r );
  }


  // Generate Round Rect Path Object
  Path.RoundRect = function( width, height, radius ) {
    var rr = new Path();
    rr.attrs.width  = width;
    rr.attrs.height = height;
    rr.attrs.radius = radius;
    rr.createPath   = createRoundRectPath;
    return rr;
  }

  return Path;

});
