const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

const config = {
    entry: './main.jsx',
    output: {
        path: path.resolve(__dirname, '..', 'public', 'assets', 'js'),
        filename: 'main.js'
    },
	mode: "development", // "production" or "development"
	module: {
		rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.jsx?$/,
                exclude: [/node_modules/],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env', ['@babel/preset-react', { "runtime": "automatic" }]]
                    }
                }
            },
            {
                test: /\.(jpg|png)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[hash][ext]'
                }
            }
        ]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			}),
		],
	}
};

module.exports = config;
