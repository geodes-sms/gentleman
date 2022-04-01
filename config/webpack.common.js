const path = require('path');
const root = `${__dirname}/../`;

module.exports = {
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(root, 'dist')
    },
    resolve: {
        alias: {
            '@': '.',
            '@src': path.resolve(root, 'src'),
            '@bin': path.resolve(root, 'bin'),
            '@models': path.resolve(root, 'models'),
            '@editor': path.resolve(root, 'src/editor'),
            '@model': path.resolve(root, 'src/model'),
            '@generator': path.resolve(root, 'src/generator'),
            '@concept': path.resolve(root, 'src/model/concept'),
            '@structure': path.resolve(root, 'src/model/structure'),
            '@projection': path.resolve(root, 'src/projection'),
            '@field': path.resolve(root, 'src/projection/field'),
            '@layout': path.resolve(root, 'src/projection/layout'),
            '@static': path.resolve(root, 'src/projection/static'),
            '@exception': path.resolve(root, 'src/exception'),
            '@utils': path.resolve(root, 'src/utils'),
            '@css': path.resolve(root, 'assets/css'),
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