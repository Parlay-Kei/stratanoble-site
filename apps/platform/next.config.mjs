/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],
  experimental: {
    optimizePackageImports: ['@strata-noble/ui'],
  },
}

export default nextConfig