import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type {Configuration as DevServerConfiguration} from "webpack-dev-server";
import {IEnvVariables, IDevServer} from "./src/types/config/dev-server";
import Dotenv from "dotenv-webpack";

function devServer(env: any): IDevServer {
    return {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: env.port ?? 8080
    }
}

export default (env: IEnvVariables) => {
    const config: webpack.Configuration = {
        entry: '/src/index.ts',
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', {
                        loader: 'sass-loader',
                        options: {
                            'api': 'modern-compiler'
                        }
                    }],
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
                    test: /\.(png|jpe?g|webp|wav)$/i,
                    type: 'asset/resource'
                },
                {
                    test: /\.ttf$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/fonts/[contenthash][ext]'
                    }
                },
                {
                    test: /\.(mp3|wav)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/sounds/[contenthash][ext]'
                    }
                }
            ]
        },
        output: {
            filename: '[contenthash].bundle.js',
            path: path.resolve('dist'),
            assetModuleFilename: 'assets/images/[contenthash][ext][query]',
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
                filename: 'assets/styles/[contenthash].css',
            }),
            new Dotenv()
        ],
        devServer: devServer(env)
    }
    return config;
}