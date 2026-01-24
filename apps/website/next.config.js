const path = require('path');

/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  distDir: 'build',
  reactStrictMode: true,
  // Force dynamic rendering for all pages to avoid client component issues during static generation
  // This is a workaround for the useState null error during prerendering
  // See: https://nextjs.org/docs/app/building-your-application/rendering/server-components#client-components
  output: 'standalone',
  compiler: {
    reactRemoveProperties: false,
    emotion: false,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async headers() {
    // CSP allowlist for third-party services
    // Noupe/Jotform: chat widget
    // Google: analytics, fonts
    // Plausible: privacy-friendly analytics
    // Calendly: scheduling widget
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://plausible.io https://cdn.jotfor.ms https://assets.calendly.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jotfor.ms https://assets.calendly.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://*.jotform.com https://*.googletagmanager.com https://assets.calendly.com",
      "frame-src 'self' https://*.jotform.com https://calendly.com",
      "connect-src 'self' https://*.jotform.com https://www.google-analytics.com https://plausible.io https://api.calendly.com",
      "media-src 'self' https://*.jotform.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.jotform.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // CSP with Noupe/Jotform allowlist - no wildcards except for verified subdomains
          { key: 'Content-Security-Policy', value: cspDirectives },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Allow microphone for Noupe voice features, deny camera and geolocation
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self "https://*.jotform.com"), geolocation=()' },
          ...(dev ? [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' }] : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Kill contradicting pages - redirect to pipeline-focused destinations
      {
        source: '/solutions',
        destination: '/',
        permanent: true,
      },
      {
        source: '/achievery-preview',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/platform',
        destination: '/tools',
        permanent: true,
      },
      // Legacy redirects
      {
        source: '/services',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/technology',
        destination: '/tools',
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

    // Fix chunk loading timeout issues in development
    if (dev && !isServer) {
      config.output = {
        ...config.output,
        // Increase chunk loading timeout from default 120s to 300s
        chunkLoadTimeout: 300000,
      };
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
    // Performance optimizations
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  // Performance optimizations
  reactStrictMode: true,
};

module.exports = nextConfig;


