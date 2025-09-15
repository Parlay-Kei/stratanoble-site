import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Production optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
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
  // Enhanced webpack config to handle JSX/TSX files properly
  webpack: (config, { dev, isServer }) => {
    // Ensure proper JSX/TSX handling for Netlify builds
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'next/dist/compiled/babel/loader',
        options: {
          presets: ['next/babel'],
          plugins: []
        }
      }
    });

    // Handle any remaining JSX files that might cause issues
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];

    return config;
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
  // Reduce bundle size
}

// Export without Sentry wrapper to fix Turbopack compatibility
export default nextConfig;
