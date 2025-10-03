/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],
  experimental: {
    optimizePackageImports: ['@strata-noble/ui', 'lucide-react'],
  },
  // Ensure Next.js looks in the src directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { isServer }) => {
    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@strata-noble/utils/src/stripe-server': false,
      }
    }
    return config
  },
  typescript: {
    // Enable type checking in production builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint in production builds
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
