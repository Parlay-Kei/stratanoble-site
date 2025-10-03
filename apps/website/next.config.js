/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Transpile shared packages to use website's React instance
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],

  // Webpack config to fix React module resolution
  webpack: (config, { isServer }) => {
    const path = require('path');

    // Fix for "Cannot read properties of undefined (reading 'call')"
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // Ensure shared packages resolve modules from website's node_modules
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];

    return config;
  },

  // Disable experimental features
  experimental: {},

  // Image config
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Build config
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;




