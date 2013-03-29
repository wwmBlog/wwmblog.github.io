define(function(require, exports, modules){

  require("libs/zepto.js");

  modules.exports = {
      transitionEnd : "webkitTransitionEnd transitionEnd transitionend mozTransitionEnd oTransitionEnd otransitionend"
    , animationEnd  : "webkitAnimationEnd animationEnd animationend mozAnimationEnd oAnimationEnd oanimationend"
    , threed     : false
    , transition : false
  };

  var threed = "none";
  var el = document.createElement('div');

  var transforms = {
        'WebkitTransform':'-webkit-transform'
      , 'OTransform'     :'-o-transform'
      , 'MSTransform'    :'-ms-transform'
      , 'MozTransform'   :'-moz-transform'
      , 'Transform'      :'transform'
      , 'transform'      :'transform'
  };
  document.body.insertBefore(el, document.body.lastChild);
  for(var t in transforms){
      if( el.style[ t ] !== undefined ){
          el.style[ t ] = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
          threed = window.getComputedStyle(el).getPropertyValue( transforms[t] );
      }
  }
  if( threed !== undefined ) { threed = threed !== 'none'; }
  modules.exports.threed = threed;

  var p, pre = ["", "O", "Webkit", "Moz"];
  for (p in pre) {
      if (el.style[ pre[p] + "Transition" ] !== undefined) {
          modules.exports.transition = true;
          break;
      }
  }
  modules.exports.transition = modules.exports.transition || el.style["transition"] != undefined;

  document.body.removeChild(el);

  // Easing
  (function(){
    // Easing functions copied from Chart.js
    // https://github.com/nnnick/Chart.js/blob/master/Chart.js

    modules.exports.easing = {
        linear        : function (t){ return t; }
      , easeInCubic    : function (t) { return t*t*t; }
      , easeOutCubic   : function (t) { return 1*((t = t/1-1)*t*t + 1); }
      , easeInOutCubic : function (t) {
        if ((t/=1/2) < 1) return 1/2*t*t*t;
        return 1/2*((t-=2)*t*t + 2);
      }
      , easeInQuart    : function (t) { return t*t*t*t; }
      , easeOutQuart   : function (t) { return -1 * ((t=t/1-1)*t*t*t - 1); }
      , easeInOutQuart : function (t) {
        if ((t/=1/2) < 1) return 1/2*t*t*t*t;
        return -1/2 * ((t-=2)*t*t*t - 2);
      }
      , easeInExpo: function (t) {
        return (t==0) ? 1 : 1 * Math.pow(2, 10 * (t/1 - 1));
      }
      , easeOutExpo: function (t) {
        return (t==1) ? 1 : 1 * (-Math.pow(2, -10 * t/1) + 1);
      }
      , easeInOutExpo: function (t) {
        if (t==0) return 0;
        if (t==1) return 1;
        if ((t/=1/2) < 1) return 1/2 * Math.pow(2, 10 * (t - 1));
        return 1/2 * (-Math.pow(2, -10 * --t) + 2);
      }
    };
  })();


  (function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
  })();
});
