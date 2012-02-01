#!/bin/sh

BUILD="/app.build.js"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
r.js -o $DIR$BUILD
