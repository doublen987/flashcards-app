const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WatchIgnorePlugin } = require('webpack');

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'index.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new WatchIgnorePlugin({
            paths: [
                "./dist"
            ]
        })
    ]
};