define(function(require){
  /* svg.js Extentions*/

  var SVG_EASE_IN    = {keyTimes:"0; 1",keySplines:".42 0 1 1"};
  var SVG_EASE_OUT   = {keyTimes:"0; 1",keySplines:"0 0 .58 1"};
  var SVG_EASE_INOUT = {keyTimes:"0; 1",keySplines:".42 0 .58 1"};
  
  SVG.extend(SVG.Shape, {

    // Old webkit seems to not support beginElement()
    // So we need a hack to trigger animation.

    // NOTE : If the build in JS-BASED animation of svg.js is good
    // enough, we don't need native animation to work.
    // Actually, I don't want to risk to use native animation, if
    // I'm not sure whether the animation will go...
    nativeAnimate : function( attrObj, duration, easing ) {

      var duration = duration ? duration / 1000 + "s" : "0.4s";
      for ( var n = this; n && n.type != "svg"; ) {
        n = n.parent;
      }
      var id = n.node.getAttribute("id");

      for (var i in attrObj) {
        if ( attrObj.hasOwnProperty(i) ) {
          try {
            var el = document.createElementNS(SVG.ns, "animate");
            el.setAttribute("attributeName", i);
            el.setAttribute("to",   attrObj[i]);
            el.setAttribute("fill", "freeze");
            el.setAttribute("dur",  duration);
            el.setAttribute("begin", id + ".DOMNodeInserted");
            el.setAttribute("attributeType", "XML");
            if ( easing ) {
              el.setAttribute("keyTimes",   easing.keyTimes);
              el.setAttribute("keySplines", easing.keySplines);
            }
    
            this.node.appendChild(el);

          } catch (e) {
            console.log(e);
          }
        }
      }
      return this;
    }
  });
})
