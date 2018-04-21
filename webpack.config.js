'use strict';

const path = require('path');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const CleanWebpackPlugin = require('clean-webpack-plugin');

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
  new CleanWebpackPlugin('public', {}),
  new webpack.DefinePlugin(definePlugins),
  // Lint CSS
  new StyleLintPlugin({
    files: 'static_src/css/**/*.css'
  }),
  new ExtractTextPlugin({
    filename: 'main.[hash].css',
    disable: false,
    allChunks: true
  }),
  //one HTML file
  new HtmlWebpackPlugin({
    inject: false,
    hash: true,
    template: './static_src/index.pug',
    filename: 'index.html'
  }),
  new WebpackMd5Hash()
];

module.exports = {
  entry: {
    main: './static_src/js/main.js'
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      // JS
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          configFile: path.join(__dirname, '.eslintrc'),
          rules: { semi: 0 }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      // CSS
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
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
