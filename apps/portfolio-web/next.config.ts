import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import { withPayload } from '@payloadcms/next/withPayload';


const nextConfig: NextConfig = {
  transpilePackages: [
    '@metashark/cms-core',
    '@metashark/cms-ui',
    '@metashark/protocol-33',
    '@metashark/auth-shield'
  ],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
  },

  serverExternalPackages: ['sharp', 'pg', 'bcryptjs'],

  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Bóveda de Configuración: Impedir que el cliente intente empaquetar el CMS Core
      config.resolve.alias['@metashark/cms-core/config'] = false;
      config.resolve.alias['payload'] = false;
      config.resolve.alias['sharp'] = false;
      config.resolve.alias['pg'] = false;
    }
    return config;
  },

  experimental: {
    typedRoutes: true,
  },
};

export default withPayload(withNx(nextConfig));