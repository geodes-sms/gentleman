const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');
const root = `${__dirname}/../`;

module.exports = merge(common, {
    mode: 'production',
    entry: {
        mindmap: './demo/mindmap/index.js',
        trafficlight: './demo/traffic-light/index.js',
        relis: './demo/relis/index.js',
        todo: './demo/todo/index.js',
        /*cms: './demo/cms/index.js',*/
        library: './demo/library/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(root, 'demo/dist')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
});