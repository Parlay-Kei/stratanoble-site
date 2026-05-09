import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@strata-noble/ui', '@strata-noble/utils'],
  experimental: {
    optimizePackageImports: ['@strata-noble/ui'],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@strata-noble/utils/src/stripe-server': false,
      }
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
