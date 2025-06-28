/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
    // Faster refresh and compilation
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Faster development builds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable bundle analyzer in dev
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      }
      // Faster source maps
      config.devtool = 'eval-cheap-module-source-map'
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
  // Faster page loads
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig 