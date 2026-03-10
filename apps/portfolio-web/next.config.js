// RUTA: apps/portfolio-web/next.config.js
const { composePlugins, withNx } = require('@nx/next');
const { withPayload } = require('@payloadcms/next/withPayload');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@metashark-cms/ui',
    '@metashark-cms/core',
    '@razpodesta/protocol-33',
    '@razpodesta/auth-shield'
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
  },
};

module.exports = composePlugins(withNx, withPayload)(nextConfig);