const path = require('path');

/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    reactRemoveProperties: false,
    emotion: false,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Temporarily disabled CSP for debugging CSS issues
          // { key: 'Content-Security-Policy', value: "default-src 'self'" },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(dev ? [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' }] : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/services',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/services/:path*',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/technology',
        destination: '/platform',
        permanent: true,
      },
    ];
  },
  experimental: {
    // optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],
  serverExternalPackages: ['@supabase/realtime-js', '@opentelemetry/instrumentation'],
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      util: false,
      buffer: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    if (isServer) {
      config.ignoreWarnings = [
        { module: /@opentelemetry/, message: /Critical dependency: the request of a dependency is an expression/ },
        { module: /@supabase\/realtime-js/, message: /Critical dependency: the request of a dependency is an expression/ },
      ];
    }

    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'localhost', port: '', pathname: '/**' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: process.env.IGNORE_TYPESCRIPT_ERRORS === 'true',
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;