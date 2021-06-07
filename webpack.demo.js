const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');


module.exports = merge(common, {
    mode: 'production',
    entry: {
        mindmap: './demo/mindmap/index.js',
        trafficlight: './demo/traffic-light/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'demo/dist')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
});