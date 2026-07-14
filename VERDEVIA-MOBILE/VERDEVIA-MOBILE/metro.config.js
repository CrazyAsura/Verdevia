const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Suporte para extensões extras (.mjs, .cjs)
config.resolver.sourceExts.push('mjs', 'cjs');

// 2. CORREÇÃO PARA O GLUESTACK / REACT-ARIA (Garante caminhos node_modules limpos)
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// 3. Ajuste inteligente dos campos principais de resolução
// Em vez de chumbar ['native', 'browser'], preservamos o padrão do Expo que lida com Web/Native dinamicamente
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 4. Polyfills e mapeamentos de módulos
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer'),
  'socket.io-client': require.resolve('socket.io-client/dist/socket.io.js'),
};

// 5. Correção para o Apollo Client / tslib (Garante resolução ESM correta do tslib)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return context.resolveRequest(
      context,
      path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config, { inlineRem: 16 });