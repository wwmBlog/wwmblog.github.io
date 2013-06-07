define(function(require){

  var data = [
    {
        ttl  : "Code Editor【Flash】"
      , desc : "用<span class='emphasize'>AS3</span>做了一个简单的代码编辑器，提供一些简单的语法高亮和代码提示的功能。完全是用正则来实现的(惭愧)。"
    }
    , {
        ttl  : "TwitWar【C++】"
      , desc : "基于<span class='emphasize'>Qt框架</span>的一个桌面应用。通过<span class='emphasize'>插件</span>的方式来让用户收取豆瓣/微博/饭否等信息。甚至能检测Gmail新邮件，orz=3 。。。"
      , link : "https://code.google.com/p/twitwarreborn/"
    }
    , {
        ttl  : "MetalBone【Windows、C++】"
      , desc : "受Qt启发的一个轻量级<span class='emphasize'>DirectUI库</span>。利用GDI、Direct2D、Skia来绘图。主要负责<span class='emphasize'>交互处理</span>、<span class='emphasize'>重绘处理</span>和<span class='emphasize'>CSS管理样式</span>等功能。"
      , link : "https://github.com/WarWithinMe/MetalBone"
    }
    , {
        ttl  : "HuamiM【OSX、Obj-C】"
      , desc : "<span class='emphasize'>花密</span>是一个密码生成工具，这个是它的OSX版本。"
      , link : "http://flowerpassword.com/app/mac"
    }
    , {
        ttl  : "xVim【OSX、Obj-C】"
      , desc : "为XCode提供Vim模拟。由于有另外一个叫做XVim的项目提供了更丰富的feature，所以这个项目终止了。"
      , link : "https://github.com/WarWithinMe/xVim"
    }
    , {
        ttl  : "SublimeText CodeRunner"
      , desc : "一个简单的SublimeText插件。可以把当前文件（JS、Ruby、Python等）当做脚本运行，然后显示输出结果。"
      , link : "https://github.com/WarWithinMe/Sublime-CodeRunner"
    }
    , {
        ttl  : "grunt-seajs-build"
      , desc : "一个Grunt任务，用于构建<span class='emphasize'>Sea.js</span>项目。可以对CMD模块进行<span class='emphasize'>ID、依赖提取</span>和<span class='emphasize'>模块合并</span>"
      , link : "https://npmjs.org/package/grunt-seajs-build"
    }
  ];


  var Rect   = require("src/canvas/rect.js");
  var Path   = require("src/canvas/path.js");
  var Circle = require("src/canvas/circle.js");
  var Text   = require("src/canvas/text.js");

  data[0].setupCanvas = function ( canvas ) {

    var els = [];
    var el;

    el = new Path("M0 20l9 0l0 100l-9 0l0-100M14 11l40 0l0 10l-40 0l0-10m0 36l40 0l0 10l-40 0l0-10M24 23l30 0l0 10l-30 0l0-10m0 36l15 0l0 10l-15 0l0-10");
    el.attrs.fill = "#142f5b";
    els[0] = el;

    el = new Path("M59 23l25 0l0 10l-25 0l0-10M44 59l30 0l0 10l-30 0l0-10");
    el.attrs.fill = "#000";
    els[1] = el;

    el = new Path("M59 11l45 0l0 10l-45 0l0-10m0 36l40 0l0 10l-40 0l0-10M14 35l5 0l0 10l-5 0l0-10m0 60l5 0l0 10l-5 0l0-10M104 47l5 0l0 10l-5 0l0-10M79 59l5 0l0 10l-5 0l0-10m10 0l15 0l0 10l-15 0l0-10");
    el.attrs.fill = "#35383a";
    els[2] = el;

    el = new Path("M2 23l5 0l0 10l-5 0l0-10m0 12l5 0l0 10l-5 0l0-10m0 12l5 0l0 10l-5 0l0-10m0 12l5 0l0 10l-5 0l0-10m0 12l5 0l0 10l-5 0l0-10m0 12l5 0l0 10l-5 0l0-10m0 12l5 0l0 10l-5 0l0-10");
    el.attrs.fill = "#0f213d";
    els[3] = el;

    // New enter text
    el = new Rect(24, 71, 0, 10);
    el.d(10).c({width:5}).d(200).c({width:10}).d(200).c({width:15}).d(10);
    el.attrs.fill = "#142f5b";
    els[4] = el;

    // Popup
    el = new Rect(32, 76, 60, 44);
    el.attrs.fill    = "#142e5b";
    el.attrs.visible = false;
    el.d(10).c({visible:true}).d(200).c({x:37}).d(200).c({x:42}).d(10);
    els[5] = el;

    // Selection
    el = new Rect(32, 77, 60, 14);
    el.attrs.fill = "#f9df0a";
    el.attrs.visible = false;
    el.d(10).c({visible:true}).d(200).c({x:37}).d(200).c({x:42,y:91}).d(10);
    els[6] = el;

    // Popup text
    el = new Path("M35 79l20 0l0 10l-20 0l0-10m0 14l35 0l0 10l-35 0l0-10m0 14l25 0l0 10l-25 0l0-10");
    el.attrs.fill = "#000";
    el.attrs.visible = false;
    el.d(10).c({visible:true}).d(200).c({translate:{x:5,y:0}}).d(200).c({translate:{x:10,y:0}}).d(1200);
    els[7] = el;

    canvas.addNode(els).background = "#191b1e";
  }

  data[1].setupCanvas = function ( canvas ) {
    canvas.background = "#8656bf";
  }

  data[2].setupCanvas = function ( canvas ) {

    var els = [];
    var el;

    el = new Path("M30 42l70 0l0 8l-70 0l0-8m0 20l70 0l0 8l-70 0l0-8m0 20l30 0l0 8l-30 0l0-8m50 0l30 0l0 8l-30 0l0-8");
    el.attrs.fill = "#a52425";
    els[0] = el;

    el = new Path("M14 40l8 0r2 0 0 2 2l0 8r0 2-2 0 2l-8 0r-2 0 0-2 2l0-8r0-2 2 0 2m0 20l8 0r2 0 0 2 2l0 8r0 2-2 0 2l-8 0r-2 0 0-2 2l0-8r0-2 2 0 2A18 86 6 0 360 1A70 86 6 0 360 1");
    el.attrs.fill = "#f4c509";
    els[1] = el;

    // Button
    el = Path.RoundRect(50, 17, 4);
    el.attrs.x = 35;
    el.attrs.y = 102;
    el.attrs.fill = "#f4c609";
    el.d(1200).c({fill:"#fff000"}).d(1000);
    els[2] = el;

    // LOGO 
    el = new Path("M27.572,24.331 C26.494,26.199 24.106,26.838 22.239,25.76 C21.001,25.039 20.255,23.693 20.293,22.263 L20.291,22.262 C20.227,20.872 19.524,19.725 18.342,19.002 L9.737,14.034 L9.737,14.035 C8.678,13.434 7.381,13.357 6.261,13.838 C5.631,14.108 5.443,14.36 4.644,14.508 C3.709,14.682 2.788,14.472 1.953,14.048 C0.085,12.97 -0.554,10.582 0.524,8.715 C1.602,6.848 3.99,6.208 5.857,7.286 C3.99,6.208 3.35,3.82 4.428,1.953 C5.506,0.085 7.894,-0.554 9.761,0.524 C10.723,1.105 11.435,2.062 11.646,3.175 C11.704,3.48 11.691,3.697 11.706,3.985 C11.726,4.364 11.776,4.728 11.892,5.091 C12.188,6.018 12.816,6.767 13.641,7.272 L13.641,7.272 L22.246,12.24 C23.198,12.783 24.343,12.912 25.388,12.577 C26.123,12.342 26.476,11.956 27.31,11.789 C28.26,11.598 29.196,11.805 30.047,12.236 C31.915,13.314 32.554,15.702 31.476,17.569 C30.398,19.436 28.01,20.076 26.143,18.998 C28.01,20.076 28.65,22.464 27.572,24.331");

    el.attrs.fill      = "#fff";
    el.attrs.scale     = { x : 0.6, y : 0.6 };
    el.attrs.translate = { x : 51, y : 7 };
    els[3] = el;

    // Check 1
    el = new Rect( 15, 43, 6, 6 );
    el.attrs.fill    = "#a52425";
    el.attrs.visible = false;
    el.d(420).c({visible:true}).d(1000);
    els[4] = el;

    // Check 2
    el = new Circle( 18, 86, 3 );
    el.attrs.fill    = "#a52425";
    el.attrs.visible = false;
    el.d(920).c({visible:true}).d(1000);
    els[5] = el;

    // Cursor
    el = new Path("M21.372,6.037 C23.85,9.512 23.163,11.959 25.658,15.457 C22.517,17.697 19.348,19.957 16.04,22.316 C10.849,18.449 6.368,17.209 4.921,16.722 C3.542,16.259 2.651,15.374 2.958,14.264 C3.268,13.141 4.442,12.807 5.41,12.851 C6.87,12.917 8.055,13.355 8.055,13.355 L1.347,3.951 C0.748,3.111 0.944,1.946 1.783,1.347 C2.622,0.749 3.788,0.943 4.386,1.783 L8.929,8.142 C9.148,8.449 9.574,8.52 9.881,8.301 C10.188,8.082 10.26,7.656 10.041,7.349 L8.921,5.779 C9.427,5.65 10.042,5.496 10.723,5.33 C11.195,5.215 11.69,5.399 11.972,5.794 L12.889,7.079 C13.108,7.386 13.534,7.457 13.841,7.239 C14.148,7.019 14.22,6.593 14.001,6.286 L12.942,4.802 C13.527,4.667 14.123,4.533 14.712,4.405 C15.176,4.305 15.656,4.491 15.931,4.877 L16.71,5.968 C16.928,6.275 17.355,6.347 17.662,6.128 C17.969,5.909 18.04,5.482 17.821,5.175 L16.949,3.952 C17.126,3.919 17.3,3.888 17.469,3.859 C19.285,3.542 20.267,4.488 21.372,6.037");
    el.attrs.fill    = "#fff";
    el.attrs.visible = false;
    el.attrs.scale   = { x : 0.6, y : 0.6 };
    el.attrs.translate = { x : 120, y : 100 };
    el.d(10).c({visible:true})
      .t({ translate : {x:16,y:45} }, 390, "easeInOutCubic")
      .d(100)
      .t({ translate : {x:19,y:85} }, 400, "easeInOutCubic")
      .d(100)
      .t({ translate : {x:50,y:110}}, 300, "easeInOutCubic")
      .d(100);
    els[6] = el;

    data[2].__cursor = el;

    canvas.addNode(els).background = "#f25050";
  }
  data[2].onMove = function (x, y) { data[2].__cursor.attrs.translate = { x : x, y : y }; }


  data[3].setupCanvas = function ( canvas ) {

    var els = [];
    var el;

    // Frame
    el = Path.RoundRect( 104, 64, 4 );
    el.attrs.fill = "#254aab";
    el.attrs.translate = { x : 8, y : 37 };
    els[0] = el;

    // Input
    el = new Path("M14 47l92 0l0 12l-92 0l0-12m0 18l92 0l0 12l-92 0l0-12");
    el.attrs.fill = "#4fa9e0";
    els[1] = el;

    // ID
    el = new Rect(34, 49, 0, 8);
    el.attrs.fill = "#cd222b";
    el.d(90).c({width:10}).d(90).c({width:20})
      .d(90).c({width:30}).d(90).c({width:40})
      .d(90).c({width:50}).d(90).c({width:60})
      .d(90).c({width:70}).d(90);
    els[2] = el;

    // Password
    el = new Rect(34, 67, 0, 8);
    el.attrs.fill = "#cd222b";
    el.d(720).c({width:10}).d(90).c({width:20})
      .d(90 ).c({width:30}).d(90).c({width:40})
      .d(90 ).c({width:50}).d(90).c({width:60})
      .d(90 ).c({width:70}).d(1000);
    els[3] = el;

    // Generation
    var colors = ["#3572cc", "#cd222b", "#fff", "#4fa9e0", "#ae141e"];
    for ( var i = 0; i < 9; ++i ) {
      el = new Rect(16 + i * 10, 85, 8, 10);
      el.attrs.visible = false;
      els[els.length] = el.d(720).c({ visible : true });

      for ( var j = 0; j < 7; ++j ) {
        el.c({ fill : colors[Math.floor(Math.random()*5)] })
          .d(90);
      }
    }

    canvas.addNode(els).background = "#4fa9e0";
  }

  data[4].setupCanvas = function ( canvas ) {
    var els = [];
    var el  = new Rect(0,0,120,33);
    el.attrs.fill = "#1f2224";
    els[0] = el;

    el = new Path("A23 20 7 0 360 1A40 20 7 0 360 1M46 47l35 0l0 10l-35 0l0-10m0 15l25 0l0 10l-25 0l0-10");
    el.attrs.fill = "#f4c609";
    els[1] = el;

    el = new Rect(71,62,8,10);
    el.attrs.fill = "#c41c06";
    el.attrs.visible = false;
    el.d(300).c({ visible : true }).d(300);
    els[2] = el;

    el = Path.RoundRect( 59, 15, 4 );
    el.attrs.translate = {x:54, y:12};
    el.attrs.fill = "#f4c609";
    els[3] = el;

    el = new Path("M60 23l29 0l0 2l-29 0l0-2M0 33l36 0l0 97l-36 0l0-97");
    el.attrs.fill = "#ea370b";
    els[4] = el;

    el = new Rect(36,33,84,5);
    el.attrs.fill = "#c41c06";
    els[5] = el;

    el = new Path("M89 23l10 0l0 2l-10 0l0-2M37 17l6 0l0 6l-6 0l0-6M27 20l-5 5l0-10");
    el.attrs.fill = "#1f2224";
    els[6] = el;

    canvas.addNode(els).background = "#2449aa";
  }

  data[5].setupCanvas = function( canvas ) {

    var els = [];
    var el = new Path("M0 0l48 6l5 18l28-13l39 0l0 59l-120 0l0-70");
    el.attrs.fill = "#f8dd0d";
    els[0] = el;

    el = new Rect(0, 70, 120, 5);
    el.attrs.fill = "#c41c06";
    els[1] = el;

    el = new Rect(8, 38, 55, 10);
    el.attrs.fill = "#bd8d07";
    els[2] = el;

    el = new Text("S", "14px Helvetica,Arial");
    el.attrs.x = 60;
    el.attrs.y = 3;
    el.attrs.fill = "#f8dd0d";
    els[3] = el;

    el = new Rect(8, 50, 0, 10);
    el.attrs.fill = "#bd8d07";
    el.d(125).c({width:10}).d(125).c({width:20})
      .d(125).c({width:30}).d(125).c({width:40}).d(100);
    els[4] = el;

    el = Path.RoundRect( 54, 22, 4 );
    el.attrs.x = 33;
    el.attrs.y = 59;
    el.attrs.fill = "#080808";
    el.attrs.alpha = 0;
    el.d(550).t({alpha:1}, 250).d(500).c({alpha:0}).d(100);
    els[5] = el;

    el = new Text("⌘+R", "14px Helvetica,Arial");
    el.textBaseline  = "middle";
    el.attrs.x       = "60";
    el.attrs.y       = "70";
    el.attrs.fill    = "#f8dd0d";
    el.attrs.alpha = 0;
    el.d(550).t({alpha:1}, 250).d(500).c({alpha:0}).d(100);
    els[6] = el;

    el = new Path("M8 83l50 0l0 10l-50 0l0-10m0 12l80 0l0 10l-80 0l0-10m0 12l70 0l0 10l-70 0l0-10");
    el.attrs.fill = "#3266cc";
    el.attrs.visible = false;
    el.d(900).c({visible:true}).d(1000);
    els[7] = el;

    canvas.addNode(els).background = "#1f2224";
  }

  data[6].setupCanvas = function ( canvas ) {
    canvas.background = "#f3a540";
  }

  return data;
});
