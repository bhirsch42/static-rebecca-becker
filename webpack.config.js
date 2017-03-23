const path = require('path');
const webpack = require('webpack');

module.exports.node = {
  child_process: 'empty'
}

module.exports = {
	entry: './src/gen/main.js',
	target: 'node',
	output: {
		path: path.resolve(__dirname, 'dist/func'),
		filename: 'handler.js',
		libraryTarget: 'commonjs2',
		library: ''
	},
	module: {
		rules: [
			{
				test: /\.hbs$/,
				use: [
					{
						loader: "handlebars-loader"
					}
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			S3_URL: JSON.stringify("localhost:8080")
		})
	]
}