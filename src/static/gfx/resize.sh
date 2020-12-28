#!/bin/sh

# convert favicon-1024x1024.png -thumbnail 16 -strip -colorspace sRGB favicon-16x16.png
# convert favicon-1024x1024.png -thumbnail 32 -strip -colorspace sRGB favicon-32x32.png
# convert favicon-1024x1024.png -thumbnail 96 -strip -colorspace sRGB favicon-96x96.png
# convert favicon-1024x1024.png -thumbnail 194 -strip -colorspace sRGB favicon-194x194.png

# convert apple-touch-icon-1024x1024.png -thumbnail 60 -strip -colorspace sRGB apple-touch-icon-60x60.png
# convert apple-touch-icon-1024x1024.png -thumbnail 76 -strip -colorspace sRGB apple-touch-icon-76x76.png
# convert apple-touch-icon-1024x1024.png -thumbnail 120 -strip -colorspace sRGB apple-touch-icon-120x120.png
# convert apple-touch-icon-1024x1024.png -thumbnail 152 -strip -colorspace sRGB apple-touch-icon-152x152.png
# convert apple-touch-icon-1024x1024.png -thumbnail 180 -strip -colorspace sRGB apple-touch-icon-180x180.png

convert preview-capture3.png -thumbnail 630 -quality 95 -strip -colorspace sRGB preview-capture3.jpg
convert preview-capture3.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB preview-capture3@2x.jpg
convert preview-folume.png -thumbnail 630 -quality 95 -strip -colorspace sRGB preview-folume.jpg
convert preview-folume.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB preview-folume@2x.jpg
convert preview-smartparks.png -thumbnail 630 -quality 95 -strip -colorspace sRGB preview-smartparks.jpg
convert preview-smartparks.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB preview-smartparks@2x.jpg
convert preview-mini.png -thumbnail 630 -quality 95 -strip -colorspace sRGB preview-mini.jpg
convert preview-mini.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB preview-mini@2x.jpg

convert preview-capture3.png -thumbnail 630 -quality 95 -strip -colorspace sRGB -define webp:lossless=false preview-capture3.webp
convert preview-capture3.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB -define webp:lossless=false preview-capture3@2x.webp
convert preview-folume.png -thumbnail 630 -quality 95 -strip -colorspace sRGB -define webp:lossless=false preview-folume.webp
convert preview-folume.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB -define webp:lossless=false preview-folume@2x.webp
convert preview-smartparks.png -thumbnail 630 -quality 95 -strip -colorspace sRGB -define webp:lossless=false preview-smartparks.webp
convert preview-smartparks.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB -define webp:lossless=false preview-smartparks@2x.webp
convert preview-mini.png -thumbnail 630 -quality 95 -strip -colorspace sRGB -define webp:lossless=false preview-mini.webp
convert preview-mini.png -thumbnail 1260 -quality 85 -strip -colorspace sRGB -define webp:lossless=false preview-mini@2x.webp
