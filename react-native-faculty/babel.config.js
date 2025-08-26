module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@api': './src/api',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@context': './src/context',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@utils': './src/utils',
        },
      }],
  'react-native-reanimated/plugin',
    ],
  };
};