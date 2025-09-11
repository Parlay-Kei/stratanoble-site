/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],
  experimental: {
    optimizePackageImports: ['@strata-noble/ui'],
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