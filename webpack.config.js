const path = require('path');

module.exports = {
  entry: {
    app: './client/maker.jsx',
    login: './client/login.jsx',
    stats: './client/stats.jsx',
    accountManagement: './client/accountManagement.jsx',
    premium: './client/premium.jsx',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'production',
  watchOptions: {
    aggregateTimeout: 200,
  },
  output: {
    path: path.resolve(__dirname, 'hosted'),
    filename: '[name]Bundle.js',
  },
  performance: {
    hints: false,
  },
};
