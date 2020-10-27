"use strict";

const webpack = require("webpack");
const path = require("path");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {

	mode: "production",

	entry: {
		main: "./src/static/ts/main.ts"
	},

	output: {
		path: path.resolve(process.cwd(), "dist"),
		publicPath: "/",
		filename: "static/js/[name].js"
	},

	devtool: false,

	resolve: {
		extensions: [".ts", ".js", ".scss"]
	},

	module: {
		rules: [{
			test: /\.ts$/,
			use: [{
				loader: "babel-loader",
				options: {
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
					onlyCompileBundledFiles: true,
					transpileOnly: true,
					compilerOptions: {
						sourceMap: false
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
					postcssOptions: {
						ident: "postcss",
						plugins: [
							autoprefixer(),
							cssnano({
								safe: true,
								autoprefixer: false,
								discardComments: {
									removeAll: true
								}
							})
						]
					}
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
		new webpack.EnvironmentPlugin({
			NODE_ENV: "production",
			DEBUG: false
		}),

		new ForkTsCheckerWebpackPlugin({
			async: false
		}),

		new CopyWebpackPlugin({
			patterns: [
				{ from: "src/robots.txt", to: "." },
				{ from: "src/sitemap.xml", to: "." },
				{ from: "src/static/images/*.jpg", to: "static/images/", flatten: true },
				{ from: "src/static/images/*.webp", to: "static/images/", flatten: true },
				{ from: "src/static/videos/*.mp4", to: "static/videos/", flatten: true },
				{ from: "src/static/gfx/*.jpg", to: "static/gfx/", flatten: true },
				{ from: "src/static/gfx/*.webp", to: "static/gfx/", flatten: true },
				{ from: "src/static/gfx/*.png", to: "static/gfx/", flatten: true },
				{ from: "src/static/gfx/*.svg", to: "static/gfx/", flatten: true }
			]
		}),

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
			minify: {
				html5: true,
				caseSensitive: true,
				collapseWhitespace: true,
				removeComments: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				processScripts: ["application/ld+json"],
				lint: false,
				minifyJS: true,
				minifyCSS: true
			},
			inlineSource: ".(js|css)$",
			chunksSortMode: "manual",
			chunks: ["main"]
		}),

		new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
	],

	optimization: {
		splitChunks: false,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				cache: true,
				sourceMap: false,
				terserOptions: {
					mangle: true,
					output: {
						comments: false
					},
					compress: {
						arrows: true,
						booleans: true,
						comparisons: true,
						conditionals: true,
						dead_code: true,
						drop_console: true,
						drop_debugger: true,
						evaluate: true,
						if_return: true,
						inline: true,
						join_vars: true,
						loops: true,
						properties: true,
						sequences: true,
						unused: true,
						warnings: false
					}
				}
			})
		]
	},

	performance: {
		hints: false
	},

	watchOptions: {
		ignored: /node_modules|dist/
	}
};
