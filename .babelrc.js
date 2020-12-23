/* istanbul ignore file */

const presets = [
    [
        "@babel/preset-env",
        {
            "modules": process.env['NODE_ENV'] === 'test' ? 'commonjs' : false
        }
    ]
];
const plugins = [
    [
        "module-resolver",
        {
            "root": ["."],
            "alias": {
                "@": ".",
                "@samples": "./samples",
                "@bin": "./bin",
                "@assets": "./assets",
                "@css": "./assets/css",
                "@src": "./src",
                "@environment": "./src/environment",
                "@model": "./src/model",
                "@concept": "./src/model/concept",
                "@structure": "./src/model/structure",
                "@projection": "./src/projection",
                "@field": "./src/projection/field'",
                "@exception": "./src/exception",
                "@utils": "./src/utils"
            }
        }
    ]
];

module.exports = { presets, plugins };