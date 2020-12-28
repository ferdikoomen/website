#!/bin/sh

doResize () {
	echo "Resize: $1"

	convert $1.png -thumbnail 1760 -quality 95 -strip -colorspace sRGB $1-ultrawide.jpg
	convert $1.png -thumbnail 3520 -quality 85 -strip -colorspace sRGB $1-ultrawide@2x.jpg
	convert $1.png -thumbnail 1470 -quality 95 -strip -colorspace sRGB $1-superwide.jpg
	convert $1.png -thumbnail 2940 -quality 85 -strip -colorspace sRGB $1-superwide@2x.jpg
	convert $1.png -thumbnail 1170 -quality 95 -strip -colorspace sRGB $1-wide.jpg
	convert $1.png -thumbnail 2340 -quality 85 -strip -colorspace sRGB $1-wide@2x.jpg
	convert $1.png -thumbnail 880 -quality 95 -strip -colorspace sRGB $1-desktop.jpg
	convert $1.png -thumbnail 1760 -quality 85 -strip -colorspace sRGB $1-desktop@2x.jpg
	convert $1.png -thumbnail 650 -quality 95 -strip -colorspace sRGB $1-tablet.jpg
	convert $1.png -thumbnail 1300 -quality 85 -strip -colorspace sRGB $1-tablet@2x.jpg
	convert $1.png -thumbnail 460 -quality 95 -strip -colorspace sRGB $1-mobile.jpg
	convert $1.png -thumbnail 920 -quality 85 -strip -colorspace sRGB $1-mobile@2x.jpg

	convert $1.png -thumbnail 1760 -quality 95 -strip -colorspace sRGB -define webp:lossless=false $1-ultrawide.webp
	convert $1.png -thumbnail 3520 -quality 85 -strip -colorspace sRGB -define webp:lossless=false $1-ultrawide@2x.webp
	convert $1.png -thumbnail 1470 -quality 95 -strip -colorspace sRGB -define webp:lossless=false $1-superwide.webp
	convert $1.png -thumbnail 2940 -quality 85 -strip -colorspace sRGB -define webp:lossless=false $1-superwide@2x.webp
	convert $1.png -thumbnail 1170 -quality 95 -strip -colorspace sRGB -define webp:lossless=false $1-wide.webp
	convert $1.png -thumbnail 2340 -quality 85 -strip -colorspace sRGB -define webp:lossless=false $1-wide@2x.webp
	convert $1.png -thumbnail 880 -quality 95 -strip -colorspace sRGB -define webp:lossless=false $1-desktop.webp
	convert $1.png -thumbnail 1760 -quality 85 -strip -colorspace sRGB -define webp:lossless=false $1-desktop@2x.webp
	convert $1.png -thumbnail 650 -quality 95 -strip -colorspace sRGB -define webp:lossless=false $1-tablet.webp
	convert $1.png -thumbnail 1300 -quality 85 -strip -colorspace sRGB -define webp:lossless=false $1-tablet@2x.webp
	convert $1.png -thumbnail 460 -quality 95 -strip -colorspace sRGB -define webp:lossless=false $1-mobile.webp
	convert $1.png -thumbnail 920 -quality 85 -strip -colorspace sRGB -define webp:lossless=false $1-mobile@2x.webp
}

doResize capture3-camera
doResize capture3-interface
doResize capture3-panels
doResize capture3-transform
doResize folume-design-mode
doResize folume-print-mode
doResize folume-printing-1
doResize folume-printing-2
doResize smartparks-admin-edit
doResize smartparks-admin-overview
doResize smartparks-map-connections
doResize smartparks-map-heatmap
doResize smartparks-map-dashboard
doResize smartparks-map-details
doResize smartparks-map-login
doResize smartparks-map-path
doResize smartparks-mobile-1
doResize smartparks-mobile-2
doResize smartparks-mobile-3
doResize mini-front-color-1
doResize mini-front-color-2
doResize mini-front-color-3
doResize mini-mobile-1
doResize mini-mobile-2
doResize mini-mobile-3
doResize mini-mobile-4
doResize mini-physics-1
doResize mini-physics-2
doResize mini-physics-3
doResize mini-side-color-1
doResize mini-side-color-2
doResize mini-side-color-3
