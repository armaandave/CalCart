/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    domains: ['images.unsplash.com', 'd2lnr5mha7bycj.cloudfront.net']
  }
}

module.exports = nextConfig

