/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Static optimization
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;