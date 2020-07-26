const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  webpack: {
    extensions: ['.ts', '.js', '.json', '.tsx'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      'react-native-track-player$': 'react-native-track-player-web',
      'react-native-track-player-web': path.resolve(
        __dirname,
        '../react-native-track-player-web/src',
      ),
      'react-native$': 'react-native-web',
    },
    configure: (webpackConfig) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin',
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

      // Let Babel compile outside of src/.
      const tsRule = webpackConfig.module.rules[2].oneOf[1];
      tsRule.include = undefined;
      tsRule.exclude = /node_modules/;

      return webpackConfig;
    },
  },
};
