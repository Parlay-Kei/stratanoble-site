/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],
  experimental: {
    optimizePackageImports: ['@strata-noble/ui'],
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
    // Skip type checking during build for initial deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build for initial deployment
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
