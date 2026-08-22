/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/protokoll',
        destination: '/protokoll.html',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // Ensure API URL has protocol
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://chart-generator-production.up.railway.app';

    // Add https:// if no protocol is present
    if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`;
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
