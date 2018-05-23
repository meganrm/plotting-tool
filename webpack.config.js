const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');

const plugins = [
    new HTMLPlugin({
        template: `${__dirname}/src/index.html`,
    }),
];

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins,
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.csv$/,
                loader: 'csv-loader',
                options: {
                    dynamicTyping: true,
                    header: true,
                    skipEmptyLines: true
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader' },
                ],
            },
            {
                test: /\.js$/,
                exclude: /src/,
                use: [
                    'ify-loader',
                    'transform-loader?plotly.js/tasks/util/compress_attributes.js',
                ]
            },
        ],
    },
    node: {
        child_process: 'empty',
    },
};
