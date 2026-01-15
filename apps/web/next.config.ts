import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * API Proxy Configuration
   * 
   * This proxy makes all API requests appear to come from the same domain as the frontend,
   * solving cross-domain cookie issues in production.
   * 
   * How it works:
   * - Browser makes request to: https://cash-flow-two-iota.vercel.app/api/auth/login
   * - Vercel proxies to: https://cashflow-production-b118.up.railway.app/api/auth/login
   * - Response comes back from same domain (Vercel)
   * - httpOnly cookies work perfectly (first-party cookies)
   * 
   * Benefits:
   * - No cross-domain cookie blocking
   * - No CORS issues
   * - httpOnly cookies remain secure
   * - Works in all browsers (Safari, Firefox, mobile)
   */
  async rewrites() {
    const apiUrl = process.env.RAILWAY_API_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
