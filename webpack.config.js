const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const srcPath = path.resolve(__dirname, "src");
const publicPath = path.resolve(__dirname, "dist");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

const cssLoaders = (ext) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        //   publicPath,
        hmr: isDev,
        //   reloadAll: true,
      },
    },
    "css-loader",
  ];

  if (ext) {
    loaders.push(ext);
  }

  return loaders;
};

const babelOptions = (ext) => {
  const options = {
    presets: ["@babel/preset-env"],
    plugins: ["@babel/plugin-proposal-class-properties"],
  };

  if (ext) {
    options.presets.push(...ext);
  }

  return options;
};

const plugins = () => {
  const plugins = [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: "./index.html",
      filename: "index.html",
      minify: { collapseWhitespace: isProd },
      cache: false,
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: path.resolve(__dirname, "src/assets/favicon.png"),
    //       to: path.resolve(__dirname, "dist"),
    //     },
    //   ],
    // }),
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
  ];

  if (isProd) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return plugins;
};

const webpackConfig = {
  context: srcPath,
  mode: "development",
  entry: {
    main: ["@babel/polyfill", "./index.tsx"],
  },
  output: {
    filename: filename("js"),
    publicPath,
    path: publicPath,
  },
  resolve: {
    extensions: [".js", "jsx"],
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@components": path.resolve(__dirname, "src/components"),
      "@src": path.resolve(__dirname, "src"),
    },
  },
  optimization: optimization(),
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    port: 9000,
    open: true,
    hot: true,
    inline: true,
    // writeToDisk: true,
  },
  devtool: isDev ? "source-map" : false,
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders(),
      },
      {
        test: /\.less$/,
        use: cssLoaders("less-loader"),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders("sass-loader"),
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: ["file-loader"],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ["file-loader"],
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"],
      },
      {
        test: /\.csv$/,
        use: ["csv-loader"],
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: babelOptions(["@babel/preset-typescript"]),
        },
      },
      {
        test: /\.tsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: babelOptions(["@babel/preset-typescript", "@babel/react"]),
        },
      },
    ],
  },
};

module.exports = webpackConfig;
