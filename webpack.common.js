const path = require('path');

module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            '@': '.',
            '@src': path.resolve(__dirname, 'src'),
            '@global': path.resolve(__dirname, 'src/global'),
            '@model': path.resolve(__dirname, 'src/model'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@css': path.resolve(__dirname, 'assets/css'),
            '@zenkai': path.resolve(__dirname, 'lib/zenkai'),
        }
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    }
};