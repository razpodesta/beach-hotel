/**
 * @file eslint.config.mjs
 * @description Constitución de Calidad Estática y Gobernanza del Monorepo MetaShark.
 *              Versión 10.0 - Lego Architecture & Multi-Layer Security.
 * 
 * @pilar V: Adherencia Arquitectónica - Control de fronteras entre Silos.
 * @pilar IX: Desacoplamiento - Aislamiento estricto de capas de presentación.
 * @pilar X: Higiene de Código - Erradicación de tipos laxos y variables huérfanas.
 */

import nxPlugin from '@nx/eslint-plugin';

export default [
  // --- CAPA 1: FUNDACIÓN (Nx Ecosystem) ---
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  ...nxPlugin.configs['flat/javascript'],

  // --- CAPA 2: EXCLUSIONES GLOBALES (Higiene de Build & Asset Protection) ---
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/.next',
      '**/.nx',
      '**/coverage',
      '**/test-output',
      '**/tmp',
      '**/*.d.ts',
      'apps/portfolio-web/public/video',
      'apps/portfolio-web/public/fonts'
    ],
  },

  // --- CAPA 3: EL GUARDIÁN DE FRONTERAS SOBERANAS (RBAC para Código) ---
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // Lista Blanca de Protocolos Externos Autorizados (SSoT)
          allow: [
            'react', 
            'react-dom', 
            'next', 
            'payload', 
            'zod', 
            'framer-motion',
            'lucide-react',
            '@supabase/supabase-js',
            '@supabase/ssr',
            'gl-matrix', // Motor WebGL
            'xlsx',      // Ingestión de Datos (Alchemy)
            'sharp'      // Procesamiento de Imágenes
          ],
          depConstraints: [
            // 1. APLICACIÓN WEB (Orquestador Supremo)
            // Posee autoridad total sobre todas las capas del ecosistema.
            {
              sourceTag: 'scope:metashark',
              onlyDependOnLibsWithTags: [
                'scope:shared', 
                'scope:cms',
                'layer:domain', 
                'layer:infrastructure', 
                'layer:presentation',
                'layer:security'
              ],
            },

            // 2. CAPA DE SEGURIDAD (IAM - Identity & Access Management)
            // Solo depende de infraestructura base para comunicación con Supabase/Auth.
            {
              sourceTag: 'layer:security',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'layer:infrastructure',
                'layer:util'
              ],
            },

            // 3. CAPA DE PRESENTACIÓN (UI Kit / WebGL Rendering Engine)
            // Aislamiento Total: Solo puede depender de sí misma o de utilidades.
            // Prohibido importar de Domain o Infrastructure para asegurar portabilidad extrema.
            {
              sourceTag: 'layer:presentation',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'layer:presentation',
                'layer:util'
              ],
            },

            // 4. CAPA DE DOMINIO (Business Logic: Revenue, Reputation, CRM, Hospitality)
            // Puede consumir infraestructura (Adaptadores) y el perímetro de seguridad.
            {
              sourceTag: 'layer:domain',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'layer:domain',
                'layer:infrastructure',
                'layer:security'
              ],
            },

            // 5. CAPA DE INFRAESTRUCTRURA (Adapters: Comms, Storage, SEO, I18n, Telemetry)
            // Es la base del sistema. No puede depender de capas superiores.
            {
              sourceTag: 'layer:infrastructure',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'layer:infrastructure',
                'layer:util'
              ],
            },

            // 6. NÚCLEO DE DATOS (CMS Core Registry)
            {
              sourceTag: 'scope:cms',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:cms',
                'layer:data',
                'layer:security',
                'layer:domain'
              ],
            },

            // 7. ESPEJO DE CALIDAD (Tests)
            // El auditor tiene visibilidad de 360 grados sobre el monorepo.
            {
              sourceTag: 'scope:tests',
              onlyDependOnLibsWithTags: ['*'], 
            }
          ],
        },
      ],
      
      // --- REGLAS DE RIGOR TÉCNICO METASHARK (Pilar III & X) ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          'argsIgnorePattern': '^_', 
          'varsIgnorePattern': '^_' 
        }
      ],
      // Autorizamos logs jerárquicos para el Protocolo Heimdall
      'no-console': ['warn', { 
        allow: ['warn', 'error', 'info', 'group', 'groupEnd', 'table'] 
      }]
    },
  },
];