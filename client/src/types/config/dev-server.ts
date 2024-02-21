export interface IEnvVariables {
    mode: 'production' | 'development';
}

export interface IDevServer {
    static: object;
    compress: boolean;
    port: number | string;
}

