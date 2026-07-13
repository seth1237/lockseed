/** @type {import('next').NextConfig} */

// The website backend (Express) origin. Requests from the browser go to the
// same-origin `/backend-api/*` path and Vercel/Next proxies them here server-side,
// so the auth cookie stays first-party to the frontend domain (works in Brave/Chrome
// which block third-party cookies).
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'https://lockseed.codewithseth.co.ke';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
}

export default nextConfig
