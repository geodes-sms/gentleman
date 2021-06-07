const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');


module.exports = merge(common, {
    mode: 'production',
    entry: {
        mindmap: {
            import: './demo/mindmap/index.js',
            library: { name: 'GentlemanX', type: "umd" },
        },
        trafficlight:  {
            import: './demo/trafficlight/index.js',
            library: { name: 'GentlemanX', type: "umd" },
        }
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/models')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
});