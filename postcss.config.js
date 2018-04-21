module.exports = {
  plugins: [
    require('autoprefixer'),
    // require('postcss-import'),
    require('precss'),
    require('postcss-initial'),
    require('postcss-assets'),
    require('autoprefixer')({
      browsers: ['last 2 versions', 'ie >= 11'],
      cascade: false
    }),
    require('postcss-csso')
  ]
};
