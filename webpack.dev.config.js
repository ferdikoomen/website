'use strict';

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {

    mode: 'development',

    entry: {
        main: './src/static/ts/main.ts',
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'static/js/[name].js',
    },

    devtool: false,

    stats: 'minimal',

    devServer: {
        port: 8080,
        host: '0.0.0.0',
        open: true,
        static: {
            directory: path.join(__dirname, 'static'),
            publicPath: '/static'
        }
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
                    onlyCompileBundledFiles: true
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
            type: 'asset/resource',
            generator: {
                filename: 'static/fonts/[name][ext]'
            }
        }, {
            test: /\.(jpg|png|webp|gif|svg|ico)$/,
            include: path.resolve(__dirname, 'src/static/gfx'),
            type: 'asset/resource',
            generator: {
                filename: 'static/gfx/[name][ext]'
            }
        }, {
            test: /\.(jpg|png|webp)$/,
            include: path.resolve(__dirname, 'src/static/images'),
            type: 'asset/resource',
            generator: {
                filename: 'static/images/[name][ext]'
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

        new CopyWebpackPlugin({
            patterns: [
                {from: 'src/robots.txt', to: '.'},
                {from: 'src/sitemap.xml', to: '.'},
                {from: 'src/static/images/**/*.jpg', to: 'static/images/[name][ext]'},
                {from: 'src/static/images/**/*.webp', to: 'static/images/[name][ext]'},
                {from: 'src/static/videos/**/*.mp4', to: 'static/videos/[name][ext]'},
                {from: 'src/static/gfx/**/*.jpg', to: 'static/gfx/[name][ext]'},
                {from: 'src/static/gfx/**/*.webp', to: 'static/gfx/[name][ext]'},
                {from: 'src/static/gfx/**/*.png', to: 'static/gfx/[name][ext]'},
                {from: 'src/static/gfx/**/*.svg', to: 'static/gfx/[name][ext]'}
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
            compile: true,
            cache: true,
            showErrors: true,
            minify: false,
            inject: 'body',
            inlineSource: '.(js|css)$',
            chunksSortMode: 'manual',
            chunks: ['main'],
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
