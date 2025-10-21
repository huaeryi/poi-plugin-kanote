const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: {
      type: 'commonjs2'
    }
  },
  externals: {
    'react': 'commonjs react',
    'react-dom': 'commonjs react-dom',
    'views/utils/ship-img': 'commonjs views/utils/ship-img'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        // Only compile files in this package's src directory.
        // When this package lives inside another project's node_modules,
        // excluding all node_modules would skip our source files.
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  target: 'electron-renderer'
}