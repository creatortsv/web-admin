import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
});
