/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental: {
  //   nodeMiddleware: true, // تفعيل دعم Node.js للـ Middleware
  // },
};

module.exports = nextConfig;