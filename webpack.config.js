// dependencies
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');

// paths
const srcPath = path.resolve('./src');
const appPath = path.resolve(srcPath, 'main');

// env
const env = process.env.NODE_ENV;
const isDev = env !== 'production';
const isProd = env === 'production';

// plugins
const plugins = [
	new webpack.DefinePlugin({
		'process.env.': { NODE_ENV: JSON.stringify(isDev ? 'development' : 'production') },
		__DEV__: JSON.stringify(isDev)
	})
];

if (isProd) {
	plugins.push(
		// output css file
		new ExtractTextPlugin('[name].css'),

		// create minified index page
		new HtmlWebpackPlugin({
			title: pkg.name,
			minify: {
				removeComments: true,
				collapseWhitespace: true
			}
		}),

		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),

		// minify javascript
		new webpack.optimize.UglifyJsPlugin({
			output: { comments: false }
		})
	);
}


// final config
module.exports = {
	entry: appPath,
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '/',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				include: [srcPath]
			},
			{
				test: /\.s?css$/,
				loader: isDev
					? 'style!css?sourceMap!sass?sourceMap&outputStyle=expanded'
					: ExtractTextPlugin.extract('style', 'css?minimize!sass?outputStyle=compressed')
			}
		]
	},
	plugins,
	devtool: isDev ? 'cheap-module-source-map' : null,
	devServer: {
		contentBase: 'build'
	}
};
