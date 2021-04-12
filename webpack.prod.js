const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');


module.exports = merge(common, {
    mode: 'production',
    entry: {
        core: {
            import: './src/index.js',
            library: { name: 'Gentleman', type: "umd" },
        },
        models: './scripts/models.js',
    },
    output: {
        filename: 'gentleman.[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
});