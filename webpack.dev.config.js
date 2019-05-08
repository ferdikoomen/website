"use strict";

const webpack = require("webpack");
const path = require("path");
const autoprefixer = require("autoprefixer");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {

	mode: "development",

	entry: {
		main: "./src/static/ts/main.ts",
	},

	output: {
		path: path.resolve(process.cwd(), "deploy"),
		publicPath: "/",
		filename: "static/js/[name].js"
	},

	devtool: false,

	devServer: {
		port: 8080,
		host: "0.0.0.0",
		contentBase: path.resolve(process.cwd(), "deploy"),
		disableHostCheck: true,
		inline: true,
		open: true
	},

	resolve: {
		extensions: [".ts", ".js", ".scss"]
	},

	module: {
		rules: [{
			test: /\.ts$/,
			use: [{
				loader: "babel-loader",
				options: {
					cacheDirectory: false,
					cacheCompression: false,
					presets: [
						["@babel/env", {
							modules: false,
							useBuiltIns: 'entry',
							corejs: 2
						}]
					]
				}
			}, {
				loader: "ts-loader",
				options: {
					experimentalWatchApi: true,
					onlyCompileBundledFiles: true,
					transpileOnly: true,
					compilerOptions: {
						sourceMap: true
					}
				}
			}]
		}, {
			test: /\.scss$/,
			use: [{
				loader: MiniCssExtractPlugin.loader
			}, {
				loader: "css-loader",
				options: {
					importLoaders: 1
				}
			}, {
				loader: "postcss-loader",
				options: {
					ident: "postcss",
					plugins: [
						autoprefixer()
					]
				}
			}, {
				loader: "sass-loader"
			}]
		}, {
			test: /\.(eot|otf|ttf|woff|woff2)$/,
			loader: "file-loader?publicPath=/static/fonts/&outputPath=static/fonts/&name=[name].[ext]"
		}, {
			test: /\.(jpg|png|webp|gif|svg|ico)$/,
			include: path.resolve(process.cwd(), "src/static/gfx"),
			loader: "file-loader?publicPath=/static/gfx/&outputPath=static/gfx/&name=[name].[ext]"
		}, {
			test: /\.(jpg|png|webp)$/,
			include: path.resolve(process.cwd(), "src/static/images"),
			loader: "file-loader?publicPath=/static/images/&outputPath=static/images/&name=[name].[ext]"
		}, {
			test: /\.hbs$/,
			loader: "handlebars-loader"
		}]
	},

	plugins: [
		new HardSourceWebpackPlugin({
			cacheDirectory: "../node_modules/.cache/hard-source/[confighash]",
			environmentHash: {
				root: process.cwd(),
				directories: [],
				files: [
					"package-lock.json",
					"yarn.lock",
					"webpack.dev.config.js"
				]
			}
		}),

		new webpack.EnvironmentPlugin({
			NODE_ENV: "development",
			DEBUG: true
		}),

		new ForkTsCheckerWebpackPlugin({
			workers: ForkTsCheckerWebpackPlugin.ONE_CPU,
			async: false
		}),

		new CopyWebpackPlugin([
			{ from: "src/robots.txt", to: "." },
			{ from: "src/sitemap.xml", to: "." },
			{ from: "src/static/images/*.jpg", to: "static/images/", flatten: true },
			{ from: "src/static/images/*.webp", to: "static/images/", flatten: true },
			{ from: "src/static/videos/*.mp4", to: "static/videos/", flatten: true },
			{ from: "src/static/gfx/*.jpg", to: "static/gfx/", flatten: true },
			{ from: "src/static/gfx/*.webp", to: "static/gfx/", flatten: true },
			{ from: "src/static/gfx/*.png", to: "static/gfx/", flatten: true },
			{ from: "src/static/gfx/*.svg", to: "static/gfx/", flatten: true }
		]),

		new MiniCssExtractPlugin({
			filename: "static/css/[name].css"
		}),

		new HtmlWebpackPlugin({
			template: "src/index.hbs",
			filename: "index.html",
			favicon: "src/static/gfx/favicon.ico",
			hash: false,
			inject: true,
			compile: true,
			cache: true,
			showErrors: true,
			minify: false,
			inlineSource: ".(js|css)$",
			chunksSortMode: "manual",
			chunks: ["main"]
		}),

		new HtmlWebpackInlineSourcePlugin()
	],

	optimization: {
		minimize: false
	},

	performance: {
		hints: false
	},

	watchOptions: {
		ignored: /node_modules|deploy/
	}
};
