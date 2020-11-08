'use strict';

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {

    mode: 'development',

    entry: {
        main: './src/static/ts/main.ts',
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'static/js/[name].js'
    },

    devtool: false,

    stats: 'minimal',

    devServer: {
        port: 8080,
        host: '0.0.0.0',
        contentBase: path.resolve(__dirname, 'dist'),
        disableHostCheck: true,
        inline: true,
        open: true
    },

    resolve: {
        extensions: ['.ts', '.js', '.scss']
    },

    module: {
        rules: [{
            test: /\.ts$/,
            include: path.resolve(__dirname, 'src/static/ts'),
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-transform-runtime']
                }
            }, {
                loader: 'ts-loader',
                options: {
                    experimentalWatchApi: true,
                    onlyCompileBundledFiles: true,
                    transpileOnly: true
                }
            }]
        }, {
            test: /\.scss$/,
            include: path.resolve(__dirname, 'src/static/scss'),
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, {
                loader: 'css-loader'
            }, {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        ident: 'postcss',
                        plugins: [
                            autoprefixer()
                        ]
                    }
                }
            }, {
                loader: 'sass-loader'
            }]
        }, {
            test: /\.(eot|otf|ttf|woff|woff2)$/,
            include: path.resolve(__dirname, 'src/static/fonts'),
            loader: 'file-loader',
            options: {
                publicPath: '/static/fonts/',
                outputPath: 'static/fonts/',
                name: '[name].[ext]'
            }
        }, {
            test: /\.(jpg|png|webp|gif|svg|ico)$/,
            include: path.resolve(__dirname, 'src/static/gfx'),
            loader: 'file-loader',
            options: {
                publicPath: '/static/gfx/',
                outputPath: 'static/gfx/',
                name: '[name].[ext]'
            }
        }, {
            test: /\.(jpg|png|webp)$/,
            include: path.resolve(__dirname, 'src/static/images'),
            loader: 'file-loader',
            options: {
                publicPath: '/static/images/',
                outputPath: 'static/images/',
                name: '[name].[ext]'
            }
        }, {
            test: /\.hbs$/,
            loader: 'handlebars-loader'
        }]
    },

    plugins: [

        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
            DEBUG: true
        }),

        new ForkTsCheckerWebpackPlugin({
            async: false
        }),

        new CopyWebpackPlugin({
            patterns: [
                {from: 'src/robots.txt', to: '.'},
                {from: 'src/sitemap.xml', to: '.'},
                {from: 'src/static/images/*.jpg', to: 'static/images/', flatten: true},
                {from: 'src/static/images/*.webp', to: 'static/images/', flatten: true},
                {from: 'src/static/videos/*.mp4', to: 'static/videos/', flatten: true},
                {from: 'src/static/gfx/*.jpg', to: 'static/gfx/', flatten: true},
                {from: 'src/static/gfx/*.webp', to: 'static/gfx/', flatten: true},
                {from: 'src/static/gfx/*.png', to: 'static/gfx/', flatten: true},
                {from: 'src/static/gfx/*.svg', to: 'static/gfx/', flatten: true}
            ]
        }),

        new MiniCssExtractPlugin({
            filename: 'static/css/[name].css'
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.hbs',
            filename: 'index.html',
            favicon: 'src/static/gfx/favicon.ico',
            hash: false,
            inject: true,
            compile: true,
            cache: true,
            showErrors: true,
            minify: false,
            inlineSource: '.(js|css)$',
            chunksSortMode: 'manual',
            chunks: ['main']
        }),

        new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
    ],

    optimization: {
        minimize: false
    },

    performance: {
        hints: false
    },

    watchOptions: {
        ignored: /node_modules|dist/
    }
};
