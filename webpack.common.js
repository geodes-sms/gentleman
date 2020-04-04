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
            '@samples': path.resolve(__dirname, 'samples'),
            '@global': path.resolve(__dirname, 'src/global'),
            '@editor': path.resolve(__dirname, 'src/editor'),
            '@model': path.resolve(__dirname, 'src/model'),
            '@model-concept': path.resolve(__dirname, 'src/model/concept'),
            '@model-attribute': path.resolve(__dirname, 'src/model/attribute'),
            '@model-component': path.resolve(__dirname, 'src/model/component'),
            '@projection': path.resolve(__dirname, 'src/projection'),
            '@field': path.resolve(__dirname, 'src/projection/field'),
            '@exception': path.resolve(__dirname, 'src/exception'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@css': path.resolve(__dirname, 'assets/css'),
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