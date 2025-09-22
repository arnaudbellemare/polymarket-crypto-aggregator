/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CPMI_API_URL: process.env.CPMI_API_URL || 'http://YOUR_VM_IP:3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.CPMI_API_URL || 'http://YOUR_VM_IP:3000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
