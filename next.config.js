/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // For audio/image uploads
    },
  },

  // Image optimization
  images: {
    domains: ['lh3.googleusercontent.com'], // For user profile images
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables validation
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    WHISPER_SERVICE_URL: process.env.WHISPER_SERVICE_URL || 'http://localhost:8000',
    DATA_ROOT_PATH: process.env.DATA_ROOT_PATH || './data',
  },

  // Webpack config for server-side file operations
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add node: protocol for server-side modules
      config.externals.push({
        'fs/promises': 'commonjs fs/promises',
        'crypto': 'commonjs crypto',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
