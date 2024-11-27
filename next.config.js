const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // react 18 about strict mode https://reactjs.org/blog/2022/03/29/react-v18.html#new-strict-mode-behaviors
  // enable for testing purpose
  reactStrictMode: false,
  transpilePackages: [
    '@ant-design'
    // '@ant-design/icons-svg'
  ],
  distDir: 'dist/.next',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. in development we need to run yarn lint
    ignoreDuringBuilds: true
  },
  poweredByHeader: false,
  swcMinify: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
    API_ENDPOINT: process.env.API_SERVER_ENDPOINT || process.env.API_ENDPOINT
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    API_ENDPOINT: process.env.API_ENDPOINT,
    SOCKET_ENDPOINT: process.env.SOCKET_ENDPOINT || process.env.API_ENDPOINT,
    MAX_SIZE_IMAGE: process.env.MAX_SIZE_IMAGE || 5,
    MAX_SIZE_FILE: process.env.MAX_SIZE_FILE || 100,
    MAX_SIZE_TEASER: process.env.MAX_SIZE_TEASER || 200,
    MAX_SIZE_VIDEO: process.env.MAX_SIZE_VIDEO || 2000
  },

  async rewrites() {
    return [
      {
        source: '/:username',
        destination: '/model/:username'
      },
      {
        source: '/:username/video/:id',
        destination: '/video/:id'
      },
      {
        source: '/:username/gallery/:id',
        destination: '/gallery/:id'
      },
      {
        source: '/:username/store/:id',
        destination: '/store/:id'
      }
    ];
  }
};

module.exports = withPlugins([
  withLess({
    lessLoaderOptions: {
      lessOptions: {
        javascriptEnabled: true
      }
    }
  }),
  nextConfig
]);
