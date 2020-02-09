'use strict';

const path = require('path');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// ENV: 'dev', 'dist'
const ENV = {
	production: 'production',
	development: 'development'
};

const isDev = process.env.NODE_ENV !== ENV.production;

const definePlugins = {
	'process.env.version': new Date().getTime(),
	'process.env.NODE_ENV': JSON.stringify(
		isDev ? ENV.development : ENV.production
	)
};
if (process.argv.find(a => /API_HOST/.test(a)) === undefined) {
	definePlugins['process.env.API_HOST'] = JSON.stringify('');
}
if (process.argv.find(a => /AUTH_HOST/.test(a)) === undefined) {
	definePlugins['process.env.AUTH_HOST'] = JSON.stringify(
		'https://my.mastergrad.com/auth/sign-in/'
	);
}

// Default plugins
let plugins = [
	new webpack.DefinePlugin(definePlugins),
	// Lint CSS
	new StyleLintPlugin({
		files: 'src/css/**/*.css'
	}),
	new MiniCssExtractPlugin({
		filename: 'main.[contenthash:4].css',
		disable: false,
		allChunks: true
	}),
	//one HTML file
	new HtmlWebpackPlugin({
		inject: false,
		hash: true,
		template: './src/index.pug',
		filename: 'index.html'
	})
];

module.exports = {
	entry: {
		main: './src/js/main.ts'
	},
	output: {
		path: path.join(__dirname, 'built'),
		filename: '[name].[chunkhash:4].js'
    },
    devtool: "source-map",
	module: {
		rules: [
			// JS
			{
                test: /\.js$/,
				enforce: 'pre',
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					configFile: path.join(__dirname, '.eslintrc'),
					rules: { semi: 0 }
				}
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
              },
			{
				test: /\.js$/,
				exclude: /node_modules/,
                use: ['babel-loader']
			},

			// All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
			{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },
			// CSS
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                      config: {
                        path: path.join(__dirname, 'postcss.config.js'),
                      },
                    },
                  }]
			},
			// html
			{
				test: /\.(pug|jade)$/,
				loader: 'pug-loader'
			},
			// Copy images
			{
				test: /\.(png|jpg|gif|svg)/,
				loader: 'file-loader?name=[hash:6].[ext]'
			},
			// Copy fonts
			{
				test: /\.(woff2?|ttf|eot)/,
				loader: ['file-loader']
			}
		]
    },
	plugins: plugins,
	resolve: {
        extensions: [".ts", ".tsx", ".js", ".css"],
        modules: ['./src', './node_modules'],
		alias: {
			node_modules: path.join(__dirname, 'node_modules')
		}
	}
};
