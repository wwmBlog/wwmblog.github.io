#!/usr/bin/env ruby
# encoding: utf-8
#
# EDITOR = "subl" is for SublimeText2
# EDITOR = "mvim" is for MacVim
# EDITOR = "mate" is for TextMate
#

require 'rake'

EDITOR   = "subl"
POST_DIR = "/source/_posts"
PREVIEW  = true


# Create new file
new_title = ARGV[0]
rake_new_post = "new_post[\"#{new_title}\"]"
puts "Running: " + rake_new_post
new_result = %x[rake #{rake_new_post}]

# Isolate new file
title_slug   = new_result.split("/")
new_post     = title_slug[2].strip

rake_isolate = "isolate[#{new_post}]"
puts "Running: " + rake_isolate
isolate_result = %x[rake #{rake_isolate}]

# Open new file
open_cmd = EDITOR + " " + Dir.pwd + POST_DIR + "/" + new_post
system(open_cmd)

# Preview
if PREVIEW == true then
    puts "Peady to preview..."
    component = File.basename(new_post, '.*').split("-", 4)
    component.delete_at(2)
    puts component
    preview_path = "/" + component.join("/") + "/"

    exec "rake preview[#{preview_path}]"
end
