#!/bin/sh

# 1. JS under ./js/lib & ./js/plugins are not compiled.
#    They are manually compressed and copied
# 2. Other JS files are compiled into one file and copied to ../build/js
# 3. Other files are copied to ../build by running r.js

BUILD="/app.build.js"
MAIN_SCPT="/js/script.js"
SEA_OUTPUT_PATH="/../build/js"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

spm build --combine --app_url "." --out_path $DIR$SEA_OUTPUT_PATH $DIR$MAIN_SCPT

r.js -o $DIR$BUILD
