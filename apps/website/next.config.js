const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enable React JSX runtime
    reactRemoveProperties: false,
    // Ensure proper JSX runtime handling
    emotion: false,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Temporarily disabled CSP for debugging CSS issues
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self'; img-src 'self' https: data:; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' plausible.io js.stripe.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; connect-src 'self' *.supabase.co *.stripe.com plausible.io api.upstash.io; frame-src js.stripe.com;"
          // },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  // Disable experimental optimizations to fix module loading errors
  experimental: {
    // optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  serverExternalPackages: ['@supabase/realtime-js', '@opentelemetry/instrumentation'],
  webpack: (config, { isServer, dev }) => {
    // Ensure proper module resolution
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

    // Minimal webpack configuration to fix React issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    if (isServer) {
      config.ignoreWarnings = [
        {
          module: /@opentelemetry/,
          message: /Critical dependency: the request of a dependency is an expression/,
        },
        {
          module: /@supabase\/realtime-js/,
          message: /Critical dependency: the request of a dependency is an expression/,
        },
      ];
    }

    return config;
  },
  // Use Turbopack for faster builds
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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    dirs: ['src'],
    // Disable ESLint during builds to avoid babel-eslint conflicts
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Only ignore build errors in development if explicitly set
    ignoreBuildErrors: process.env.IGNORE_TYPESCRIPT_ERRORS === 'true',
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Reduce bundle size by skipping source maps in production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig;
