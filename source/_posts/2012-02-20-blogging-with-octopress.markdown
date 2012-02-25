---
layout: post
title: "开始用Octopress写Blog"
date: 2012-02-20 23:45
comments: true
categories: octopress
---

嗯, 貌似用[Octopress]的循例是将<strike>初夜</strike>(初篇)献给八爪君的各种触手. 
那么我也来写写好了. 

很多宅与Hacker都已经<strike>吐槽</strike>(解释)过如何打造自己的触手系博客了. 所以就再也没有必要在这个方面啰嗦啦, 还是说说日常的blog方面吧...

<!-- more -->

就算千辛万苦搭建好触手君, 写博文也不会立即变得好像抽根烟那么容易哎:   
你要打开termial, 然后输入`rake new_post[oo_xx]`, 才能下笔. 
接着还要各种`rake preview`来预览, 如果博文太多就需要`rake isolate[oo_xx]`来提高预览的速度.
最后还要`rake deploy`来发布. 
我好似忘记了说, 新建一篇博文之后, 你还得打开那个目录(别告诉我你就放在桌面!!!), 来寻找那片博文, 这要点击多少次鼠标啊, 我的苍天.

这是彻彻底底违背了宅星人的第一法则 :
{% blockquote 宅星人第一法则, %}
做事情要能懒则懒 (当然要做好, 不然老板炒鱿鱼就不要来找我寻仇哦)
{% endblockquote %}

于是就写了些脚本, 好让写blog能爽快点, 当然光脚本也是绝对不够的, 我们还要请[alfred君], (quicksilver娘因为傲娇到连我也受不了, 所以决定去和alfred君好), 当然还得为[alfred君]准备他的[powerpack], 不然就什么也做不到了.   

# 要解决的问题是:
__既然都已经输入 `rake new_post[oo_xx]`, 为什么都不直接帮我打开, 让我编辑啊, 魂淡.__ 而且我还想要立刻就打开这个页面进行预览!!!!

<strong>1\.</strong>首先修改你的Rakefile, 将`task :preview`那一段修改成这样 :
``` ruby task :preview
desc "preview the site in a web browser"
task :preview, :filename do |t, args|
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  puts "Starting to watch source with Jekyll and Compass. Starting Rack on port #{server_port}"
  system "compass compile --css-dir #{source_dir}/stylesheets" unless File.exist?("#{source_dir}/stylesheets/screen.css")
  jekyllPid = Process.spawn({"OCTOPRESS_ENV"=>"preview"}, "jekyll --auto")
  compassPid = Process.spawn("compass watch")
  rackupPid = Process.spawn("rackup --port #{server_port}")


  filename = args[:filename] || ""
  system "sleep 2; open http://localhost:4000/blog#{filename}"


  trap("INT") {
    [jekyllPid, compassPid, rackupPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, compassPid, rackupPid].each { |pid| Process.wait(pid) }
end
```
主要就是将`task :preview`改成`task :preview, :filename do |t, args|`  
然后在里面添加了`filename = args[:filename] || ""` 和 `system "sleep 2; open http://localhost:4000/blog#{filename}"` 这样就能在预览的时候直接在浏览器打开blog.

<strong>2\.</strong>接着去下载这个gist, 放到你存放Rakefile的目录里面. 这个gist的工作是创建文章, 打开文章, 预览文章:
{% gist 1874539 %}

<strong>3\.</strong>翻出你的[alfred君], 添加一个Shell Script Extension:  

- Title : 创建博文
- Description: (留空即可)
- Keyword : newpost
- Options : (__全不选!__)
- Advanced : (__同样全部不选!__)
- Parameter : 选 "Required Parameter"

然后Command里面输入 : (当然`/Your/Path/To/Rakefile/Folder`要换成你存放Rakefile的目录)
    cd /Your/Path/To/Rakefile/Folder
    ./newpost.rb "{query}"

这样, 准备功夫就完成了. 下面就试试吧 :
翻出[alfred君], 然后输入`newpost my fancy new post`(是真的不用双引号哦~), 回车... <strike>好基友</strike>[SublimeText2]是不是就弹出来让你操纵呢...

#### 其他一些问题:

1.  如果想用其他编辑器来编辑, 则需要将`newpost.rb`里面的`EDITOR = "subl"`换成 :
    - `EDITOR = "mvim"` (换成MacVim)
    - `EDITOR = "mate"` (换成TextMate)

1.  因为博客不是放在根目录里, 只能`rake preview`的方法来预览, 否则加载的文件的路径都错了... 可惜目前没找到能让[LiveReload]来刷新页面的方法, sign.
1.  __用了这个脚本, 在准备更新到服务器之前的那次`rake generate`之前, 必须先`rake integrate`. 否则只有新建的那个blog文哦.__
1.  要用[SublimeText2]之前还得先在terminal运行一下代码, 这样才能用它的命令行工具:
``` bash
sudo ln -s "/Applications/Sublime Text 2.app/Contents/SharedSupport/bin/subl" /bin/subl
```


# 呼, 好累哎, 睡觉先 =, =



[Octopress]: http://octopress.org/
[alfred君]: http://www.alfredapp.com/
[powerpack]: http://www.alfredapp.com/powerpack/
[zan5hin]: https://github.com/zan5hin
[SublimeText2]: http://www.sublimetext.com/2
[LiveReload]: http://livereload.com/