// dependencies
const path = require('path');

// paths
const srcPath = path.resolve('./src');
const appPath = path.resolve(srcPath, 'main');


module.exports = {
	entry: {
		app: [appPath]
	},
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
				loader: 'style!css?sourceMap!sass?sourceMap&outputStyle=expanded'
			}
		]
	},
	devtool: 'cheap-module-source-map',
	devServer: {
		contentBase: 'build'
	}
};
