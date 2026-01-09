#!/bin/bash

echo "Copying static seed files to public folder"

mkdir -p public/static/md
mkdir -p public/static/images
mkdir -p public/static/musics

cp -r src/static/md/* public/static/md/ 2>/dev/null || true
cp -r src/static/images/* public/static/images/ 2>/dev/null || true
cp -r src/static/musics/* public/static/musics/ 2>/dev/null || true

cp src/static/file-system-seed.manifest.json public/static/ 2>/dev/null || true

echo "satic files copied successfully!"
