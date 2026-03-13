// RUTA: apps/portfolio-web/next.config.js
const { withNx } = require('@nx/next/plugins/with-nx');
const { withPayload } = require('@payloadcms/next/withPayload');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Sincronizado con el namespace @metashark/ definido en tsconfig.base.json y package.json
  transpilePackages: [
    '@metashark/cms-ui',
    '@metashark/cms-core',
    '@metashark/protocol-33',
    '@metashark/auth-shield',
    'payload',
    '@payloadcms/next',
    '@payloadcms/db-postgres',
    '@payloadcms/richtext-lexical'
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
  },
};

module.exports = withPayload(withNx(nextConfig));