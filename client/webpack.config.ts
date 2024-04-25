import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type {Configuration as DevServerConfiguration} from "webpack-dev-server";
import {IEnvVariables, IDevServer} from "./src/types/config/dev-server";
import Dotenv from "dotenv-webpack";

const devServer: IDevServer = {
    static: {
        directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: process.env.port ?? 8080
}

export default (env: IEnvVariables) => {
    const config: webpack.Configuration = {
        entry: '/src/index.ts',
        mode: env.mode,
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.ts$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', "@babel/preset-typescript"],
                        }
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|jpe?g|webp)$/i,
                    type: 'asset/resource'
                }
            ]
        },
        output: {
            filename: '[contenthash].bundle.js',
            path: path.resolve('dist'),
            assetModuleFilename: 'images/[contenthash][ext][query]',
            clean: true,
        },
        resolve: {
            extensions: ['.ts', '.js', '.json', '.css', '.scss', '.png'],
            alias: {
                '@': path.resolve(__dirname, 'src')
            },
            fallback: {
                process: require.resolve('process/browser'),
            }
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'src/public/index.html')
            }),
            new MiniCssExtractPlugin({
                filename: 'styles/[contenthash].css',
            }),
            new Dotenv()
        ],
        devServer
    }
    return config;
}