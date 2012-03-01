# Title: Simple Image tag for Jekyll
# Authors: Brandon Mathis http://brandonmathis.com
#          Felix Schäfer, Frederic Hemberger
# Description: Easily output images with optional class names, width, height, title and alt attributes
#
# Syntax {% img [class name(s)] [http[s]:/]/path/to/image [width [height]] [title text | "title text" ["alt text"]] %}
#
# Examples:
# {% img /images/ninja.png Ninja Attack! %}
# {% img left half http://site.com/images/ninja.png Ninja Attack! %}
# {% img left half http://site.com/images/ninja.png 150 150 "Ninja Attack!" "Ninja in attack posture" %}
#
# Output:
# <img src="/images/ninja.png">
# <img class="left half" src="http://site.com/images/ninja.png" title="Ninja Attack!" alt="Ninja Attack!">
# <img class="left half" src="http://site.com/images/ninja.png" width="150" height="150" title="Ninja Attack!" alt="Ninja in attack posture">
#
#
# {% img [linkURL] [imageClass | "imageClass"] imgURL [width [height]] title "rel" %}
# at least linkURL or imageClass should exist.
# if imageClass has quotes, the image is wrapped by <a class='imageClass'><span></span></a>
# imgURL will be a's href if linkURL is not specified

module Jekyll

  class ImageTag < Liquid::Tag
    @img = nil

    def initialize(tag_name, markup, tokens)
      attributes = ['link_src', 'class', 'src', 'width', 'height', 'title']

      if markup =~ /(?<link_src>(?:https?:\/\/|\/|\S+\/)\S+)?(?<class>\s*?.*\s+)?(?<src>(?:https?:\/\/|\/|\S+\/)\S+)(?:\s+(?<width>\d+))?(?:\s+(?<height>\d+))?(?<title>\s+.+)?/i

        @img = attributes.reduce({}) { |img, attr| img[attr] = $~[attr].strip if $~[attr]; img }

        if /(?:"|')(?<title>[^"']+)?(?:"|')\s+(?:"|')(?<rel>[^"']+)?(?:"|')/ =~ @img['title']
          @img['title']  = title
          @img['rel']    = rel
        else
          @img['rel']    = @img['title'].gsub!(/"/, '&#34;') if @img['title']
        end
      end
      super
    end

    def render(context)
      if @img 
        if @img["class"] && @img["class"].gsub!(/"|'/, '')
          html = "<a href='#{@img["link_src"] ? @img["link_src"] : @img["src"]}' class='#{@img["class"]}' #{ 'rel=\'' + @img["rel"] + '\'' if @img["rel"] }><span>"
          @img.delete("class")
          @img.delete("link_src")
          @img.delete("rel")
          html + "<img #{@img.collect {|k,v| "#{k}=\"#{v}\"" if v}.join(" ")}></span></a>"
        else
          "<img #{@img.collect {|k,v| "#{k}=\"#{v}\"" if v}.join(" ")}>"
        end
      else
        "Error processing input, expected syntax: {% img [class name(s)] [http[s]:/]/path/to/image [width [height]] [title text | \"title text\" [\"alt text\"]] %}"
      end
    end
  end
end

Liquid::Template.register_tag('img', Jekyll::ImageTag)
