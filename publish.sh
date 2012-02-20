#!/bin/bash

current_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

blog="public/blog"
target_dir="../build"
branch="master"

cd $current_dir

# Generate
rake integrate
rake generate

# Copy
rsync -vrc $blog $target_dir

# Commit
cd $target_dir
git add .
git add -u
date_time=$(date)
message="Blog updated at: "$date_time
git commit -m "$message"

# Push
git push origin $branch --force
