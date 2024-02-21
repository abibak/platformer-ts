import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type {Configuration as DevServerConfiguration} from "webpack-dev-server";
import {IEnvVariables, IDevServer} from "./src/types/config/dev-server";

const devServer: IDevServer = {
    static: {
        directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: process.env.port ?? 3000
}

export default (env: IEnvVariables) => {
    const config: webpack.Configuration = {
        entry: "/src/index.ts",
        mode: env.mode,
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        output: {
            filename: '[name].js',
            path: path.resolve('dist'),
            clean: true,
        },
        resolve: {
            extensions: ['.ts', '.js', '.json', '.css', '.scss']
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'src/public/index.html')
            }),
            new MiniCssExtractPlugin({
                filename: 'styles/[name].css',
            })
        ],
        devServer
    }
    return config;
}