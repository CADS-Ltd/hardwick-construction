#!/bin/sh
# Build the plugin and theme zips for uploading to WordPress (Plugins/Themes › Add New › Upload).
set -e
cd "$(dirname "$0")"
mkdir -p dist
rm -f dist/premier-developments.zip dist/premier-heritage.zip
(cd plugins && zip -qr ../dist/premier-developments.zip premier-developments -x '*.DS_Store')
(cd themes && zip -qr ../dist/premier-heritage.zip premier-heritage -x '*.DS_Store')
ls -l dist
