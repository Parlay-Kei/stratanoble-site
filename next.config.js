/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Optimize webpack for production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    return config
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    dirs: ['src'],
    // Only run ESLint on changed files in dev
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    // Skip type checking during development for faster builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Reduce bundle size
  output: 'standalone',
}

export default nextConfig 