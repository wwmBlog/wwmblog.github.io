define(function(require, exports, modules){

  require("libs/zepto.js");

  var effect = {
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
  effect.threed = threed;

  var p, pre = ["", "O", "Webkit", "Moz"];
  for (p in pre) {
      if (el.style[ pre[p] + "Transition" ] !== undefined) {
          effect.transition = true;
          break;
      }
  }
  effect.transition = effect.transition || el.style["transition"] != undefined;

  document.body.removeChild(el);

  modules.exports = effect;
});
