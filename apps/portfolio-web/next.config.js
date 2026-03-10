// RUTA: apps/portfolio-web/next.config.js
const { withNx } = require('@nx/next/plugins/with-nx');
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
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
  },
};

// Se envuelve primero con withNx y luego con withPayload
module.exports = withPayload(withNx(nextConfig));