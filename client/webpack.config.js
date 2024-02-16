const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry: "/src/index.ts",
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve('dist')
    },
    resolve: {
      extensions: ['.ts','.js','.json']
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Test title',
            template: path.join(__dirname, 'src/public/index.html')
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080
    }
}