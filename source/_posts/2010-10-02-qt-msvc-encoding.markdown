---
layout: post
title: "Qt与MSVC的中文问题"
date: 2010-10-02 15:50
comments: true
categories: Qt
---

因为之前发布了GCC编译的TwitWar，结果在有些人的xp系统下面出现Runtime Error。主要是调用插件，而这个插件又调用了其他的dll文件。。。然后一直解决不了，最后还是决定用MSVC2008编译。。还好最后结果还不错。。(但是有个同学说他没能加载插件，真悲催。。。)

如果用MSVC2008编译的话，源代码的编码格式是绝对不可以是__UTF-8 without BOM__的。因为该死的MSVC只认__UTF-8 without BOM__。。。如果你保存的编码格式是__UTF-8 with BOM__，那么你用Qt的时候，十有八九会乱码。。

目前我觉得最稳妥的方法是：
<!-- more -->

1.  将源代码都保存为__GBK__或__GB2312__。这样编译之后的二进制文件中的字符串就都是这个编码。
1.  凡是源代码中有中文的字符串都用`tr()`括起来。。例如：`tr(“测试中文”)`;
1.  在`main()`函数中，一开始就设置__codec__：

``` cpp 设置Codec
QTextCodec* codec = QTextCodec::codecForName("UTF-8");
QTextCodec::setCodecForCStrings(codec);
codec = QTextCodec::codecForLocale();
//codec = QTextCodec::codecForName("GBK");//或GB2312
QTextCodec::setCodecForTr(codec);
```

这里解释一下：

1.  按常理来说，被注释掉的`codec = QTextCodec::codecForName(“GBK”);`应该是能工作的。因为源代码是用__GBK__格式保存的。
但是实际上在xp系统下，依然会乱码，只能用`codecForLocale()`来解决。郁闷的是xp系统的默认编码本来就是__GBK__。

1.  最后一行设置了用于`tr()`的编码为__GBK__。这样，被`tr()`括起来的中文就会被[Qt]正确转换成Unicode了。

1.  如果设置了`codecForCString`为__UTF-8__的话，那么下面的会按__UTF-8__来转换。`QString astring = "My little World!";` 虽然因为源代码是__GBK__格式，My little World!会以__GBK__格式储存。但是由于__UTF-8__和__GBK__都兼容__ASCII__，就是说那些__ASCII__字符在__UTF-8__和__GBK__里面都是一样的，所以这里不会出错。。

1.  至于为什么要将`CStrings`的编码设置成__UTF-8__？因为网络数据。网络数据一般都是__UTF-8__编码的，而`codecForCStrings`指定的是`QByteArray`、`char*`与`QString`互换的编码。。  
例如，读取`QNetworkReply`中的数据：

``` cpp
QByteArray data = reply->readAll();
QString content = data;
```

因为`data`是__UTF-8__格式，所以按上面设置以后content不会乱码。

[Qt]: http://qt.nokia.com/products/
