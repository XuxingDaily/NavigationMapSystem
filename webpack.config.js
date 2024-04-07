const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./view/main.ts",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "js/[name].js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.ts$/,
                loader: "ts-loader"
            },
            {
                test: /\.(ttf|woff2|eot|woff|geojson|svg?)$/,
                type: "asset/resource",
                generator: {
                    filename: "media/[hash:8][ext][query]"
                }
            },
        ]
    },
    optimization: {
        splitChunks: { chunks: "all" }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./view/index.html")
        }),
        new MiniCssExtractPlugin({
            filename: "css/main.css"
        })
    ],
    resolve: {
        extensions: [".js", ".ts", ".json"]
    },
    devServer: {
        host: "localhost",
        port: "8000",
        open: true
    },
    mode: "development",
    devtool: "cheap-module-source-map"
}