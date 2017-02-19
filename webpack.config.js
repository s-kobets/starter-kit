'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const args = require('minimist')(process.argv.slice(2));
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// ENV: 'dev', 'dist'
const ENV = args.env || 'dev';
const API_HOST = args['api-host'] || '';

// Default plugins
let plugins = [
	new webpack.DefinePlugin({
		'process.env.version': new Date().getTime(),
		'process.env.API_HOST': '"' + API_HOST + '"'
	}),
	// Lint CSS
	new StyleLintPlugin({
		files: 'static_src/css/**/*.css'
	}),
	new ExtractTextPlugin({
		filename: 'main.css',
		allChunks: true 
	}),
	//one HTML file
    new HtmlWebpackPlugin({
        filename: 'index.html',
        inject : true,
        template: './static_src/index.html',
        chunks: 'filename'
    })
];

if (ENV === 'dev') {
	// Development plugins
	plugins = plugins.concat([
	]);
} else if (ENV === 'dist') {
	// Dist plugins
	plugins = plugins.concat([
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}, output: {comments: false}, sourceMap: true}),
		new webpack.optimize.AggressiveMergingPlugin()
	]);
}

module.exports = {
	entry: {
		main : './static_src/js/main.js'
	},
	output: {
		path: path.join(__dirname, 'public'),
		publicPath: '/public/',
		filename: '[name].js'
	},
	module: {
		rules: [
			// JS
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.js$/,
				use: [{
					loader: 'eslint-loader',
					options: {
						configFile: path.join(__dirname, '.eslintrc'),
						rules: {semi: 0}
					},
				}],
				enforce: 'pre',
				exclude: /(node_modules)/
			},
			// CSS
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: [
						{   loader: 'style-loader',
					    	options: {
					      		modules: true
					    	}
						}
					],
	                use: [
		                'css-loader',
		                {
							loader: 'postcss-loader',
							options: {
								plugins: function (webpack) {
									const cssDir = path.dirname(this.resource).split(path.sep);
									const widgetName = cssDir[cssDir.length - 3];

									if (ENV === 'dev') {
										return [
											// postcss-import for webpack watch
											require('postcss-import')({addDependencyTo: webpack}),
											require('precss')(),
											require('postcss-initial')(),
											require('postcss-assets')(),
											require('autoprefixer')({browsers: ['last 2 versions', 'ie >= 11'], cascade: false}),
											// Build styleguide
											require('postcss-style-guide')({dest: './static/styleguide/' + widgetName + '.html'})
										];
									}
									return [
										require('precss')(),
										require('postcss-initial')(),
										require('postcss-assets')(),
										require('autoprefixer')({browsers: ['last 2 versions', 'ie >= 11'], cascade: false}),
										// Minimize CSS build
										require('postcss-csso')()
									];
								}
							}
						}
	                ]
	            })
			},
			// Copy images
			{
				test: /\.(png|jpg|gif|svg)/,
				loader: "file-loader?name=[hash:6].[ext]"
			},
			// Copy fonts
			{
				test: /\.(woff2?|ttf|eot)/,
				loader: ['file-loader']
			}
		]
	},
	devtool: 'sourcemap',
	plugins: plugins,
	resolve: {
		extensions: ['.js', '.css'],
		modules: ['./static_src', './node_modules'],
		alias: {
			node_modules: path.join(__dirname, 'node_modules')
		}
	}
};
