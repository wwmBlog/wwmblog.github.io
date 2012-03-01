---
layout: post
title: "JS检测Image的加载"
date: 2012-03-01 10:54
comments: true
categories: JS
---

## Background
页面中所有指向大图的链接，在被点击时不跳转，而是直接显示该大图。为了能尽快可以加载这些大图，它们会在页面完全加载完后，自动预加载。  
JS代码要做的是__点击链接时，需要判断图片是否能立刻显示__。

## Issue
#### Firefox quirkies
FF里面，一旦一个`Image`对象加载完成，它的`complete`属性就变成`true`，并且一直为`true`，即使修改`src`属性去加载另外的图片：
``` javascript
var img = new Image();
img.src = 'loaded_pic.jpg';
console.log(img.complete == true);

img.src = 'not_loaded_pic.jpg';
// 加载没有cache的图片，这里img.complete本来应为false，但FF不重设img的complete属性。
console.log(img.complete == true);
```

-  __每次都要用全新的Image对象检测图片是否能立刻显示__

#### Chrome quirkies
Chrome的`complete`很飘忽，好难捉摸啊：

-  显示过的图片，`complete`一定(?)为`true`。
-  没Cache的图片，在没加载完成前，`complete`肯定为`false` (理所当然嘛)
-  Cache了的图片就用代码说明好了：

``` javascript
imgURL        = 'cached.jpg';    // 缓存图片路径
anotherImgURL = 'cached2.png';   // 另外一个缓存了的图片路径
globalImg     = new Image();     // 全局用预加载器

function onDocReady() // 页面加载完成后调用
{
    var preloadImg = new Image();
    preloadImg.src = imgURL;           // 第一次请求加载该图片
    console.log(preloadImg.complete == false); // 即使缓存了，complete铁定也是false

    var preloadImg2 = new Image();
    preloadImg2.src = imgURL;          // 立马再请求一次
    console.log(preloadImg.complete == false); // 依然是false

    globalImg.src = anotherImgURL;     // 用全局的来预加载
}

function onLinkClick() // 点击某个链接时调用
{
    var img = new Image();
    img.src = imgURL;
    // 之后再加载该图片，complete有可能是true，也可能是false
    console.log(img.complete == false || img.complete == true); 

    var img2 = new Image();
    img2.src = anotherImgURL;
    // 用全局的预加载的话，这个一定为true。
    console.log(img.complete == true);
}
```
结论就是：

1.  图片的complete属性最起码要在下一次代码调度时才会更改。
2.  如果指向图片A的所有Image对象都被GC，而且这个图片A并没有在页面显示过，则再创建Image对象，将它`src`设为链接A，它的complete属性要在下次调度时才会变成ture。(将预加载放在一个全局对象里面，它就不被回收)

