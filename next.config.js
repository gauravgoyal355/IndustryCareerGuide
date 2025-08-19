/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize for Vercel deployment
  experimental: {
    appDir: false // Using pages directory
  },
  
  // Static optimization
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: true
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/quiz',
        destination: '/quiz/',
        permanent: true
      },
      {
        source: '/results',
        destination: '/results/',
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;