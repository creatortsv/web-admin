import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/v1/treasury/:path*',
        destination: process.env.TREASURY_GATEWAY_URL
          ? `${process.env.TREASURY_GATEWAY_URL}/v1/treasury/:path*`
          : 'http://localhost:8089/v1/treasury/:path*',
      },
      {
        source: '/v1/:path*',
        destination: process.env.API_GATEWAY_URL
          ? `${process.env.API_GATEWAY_URL}/v1/:path*`
          : 'http://localhost:8080/v1/:path*',
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
});
