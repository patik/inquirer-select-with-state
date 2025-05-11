import path from 'node:path'
import { fileURLToPath } from 'node:url'
import webpack from 'webpack'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    entry: './src/select.ts',
    mode: 'production',
    watch: false,
    output: {
        filename: 'select.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: 'node',
    plugins: [new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
}
