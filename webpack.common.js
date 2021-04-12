const path = require('path');

module.exports = {
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            '@': '.',
            '@src': path.resolve(__dirname, 'src'),
            '@bin': path.resolve(__dirname, 'bin'),
            '@models': path.resolve(__dirname, 'models'),
            '@environment': path.resolve(__dirname, 'src/environment'),
            '@model': path.resolve(__dirname, 'src/model'),
            '@concept': path.resolve(__dirname, 'src/model/concept'),
            '@structure': path.resolve(__dirname, 'src/model/structure'),
            '@projection': path.resolve(__dirname, 'src/projection'),
            '@field': path.resolve(__dirname, 'src/projection/field'),
            '@layout': path.resolve(__dirname, 'src/projection/layout'),
            '@static': path.resolve(__dirname, 'src/projection/static'),
            '@exception': path.resolve(__dirname, 'src/exception'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@css': path.resolve(__dirname, 'assets/css'),
        }
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    }
};