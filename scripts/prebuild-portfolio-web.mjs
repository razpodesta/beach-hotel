/**
 * @file scripts/prebuild-portfolio-web.mjs
 * @version 8.0 - Ultra-Verbose Integrity Orchestrator
 * @description Ensamblador de diccionarios con trazabilidad total.
 *              Garantiza la convergencia de fragmentos i18n para el motor Next.js.
 * @author Raz Podestá - MetaShark Tech
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURACIÓN DE CONTEXTO SOBERANO
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const LOCALES = ['en-US', 'es-ES', 'pt-BR'];
const DEST_DIR = path.join(rootDir, 'apps/portfolio-web/src/dictionaries');

/**
 * LISTA MAESTRA DE INTEGRIDAD
 * Sincronizada con el contrato innegociable de dictionary.schema.ts
 */
const FILES = [
  'header',
  'nav-links',
  'hero',
  'about',
  'value_proposition',
  'contact',
  'contact_page',
  'history',
  'footer',
  'language_switcher',
  'visitor_hud',
  'not_found',
  'server_error',
  'maintenance',
  'mission_vision',
  'legal',
  'system_status',
  'ai_gallery_section',
  'project_details',
  'blog_page',
  'lucide_page',
  'profile_page'
];

/**
 * MAPEO DE JERARQUÍA (Pilar I - Visión Holística)
 * Organiza los fragmentos en la estructura esperada por la Homepage.
 */
const FILE_MAPPING = {
  'hero': ['homepage', 'hero'],
  'about': ['homepage', 'about_section'],
  'value_proposition': ['homepage', 'value_proposition_section'],
  'contact': ['homepage', 'contact'],
  'history': ['homepage', 'history_section'],
  'ai_gallery_section': ['homepage', 'ai_gallery_section'],
};

/**
 * UTILITY: Inyección de profundidad en objeto.
 */
function setNestedValue(obj, pathArray, value) {
  let current = obj;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  current[pathArray[pathArray.length - 1]] = value;
}

/**
 * NÚCLEO DEL ENSAMBLAJE (Protocolo Heimdall)
 */
async function buildDictionaries() {
  const startTime = Date.now();
  console.log('\n🛡️  [HEIMDALL] INICIANDO PROTOCOLO DE ENSAMBLAJE DE INTEGRIDAD (v8.0)');
  console.log(`📂  Destino Maestro: ${path.relative(rootDir, DEST_DIR)}`);
  
  try {
    // Aseguramos existencia del directorio de destino
    await fs.mkdir(DEST_DIR, { recursive: true });

    for (const locale of LOCALES) {
      console.log(`\n🌍  [${locale}] PROCESANDO IDIOMA...`);
      const dictionary = {};
      let fragmentsSucceeded = 0;
      let fragmentsFailed = 0;
      
      for (const file of FILES) {
        const relativeSrcPath = path.join('apps/portfolio-web/src/messages', locale, `${file}.json`);
        const absoluteSrcPath = path.join(rootDir, relativeSrcPath);

        try {
          const content = await fs.readFile(absoluteSrcPath, 'utf-8');
          const jsonContent = JSON.parse(content);

          if (FILE_MAPPING[file]) {
            setNestedValue(dictionary, FILE_MAPPING[file], jsonContent);
          } else {
            dictionary[file] = jsonContent;
          }
          
          console.log(`   ├─ ✅ [SINC] ${file}.json`);
          fragmentsSucceeded++;
        } catch (error) {
          if (error.code === 'ENOENT') {
            console.warn(`   ├─ ⚠️  [MISSING] ${file}.json (Usando fallback vacío)`);
            if (FILE_MAPPING[file]) {
                setNestedValue(dictionary, FILE_MAPPING[file], {});
            } else {
                dictionary[file] = {};
            }
            fragmentsFailed++;
          } else {
            console.error(`   └─ ❌ [ERROR] Fallo crítico en fragmento ${file}: ${error.message}`);
            throw error; 
          }
        }
      }

      // Escritura del artefacto final por idioma
      if (Object.keys(dictionary).length > 0) {
        const fileName = `${locale}.json`;
        const destPath = path.join(DEST_DIR, fileName);
        const relativeDest = path.relative(rootDir, destPath);

        await fs.writeFile(destPath, JSON.stringify(dictionary, null, 2));
        
        console.log(`   └─ ✨ [${locale}] COMPILADO EXITOSAMENTE.`);
        console.log(`      📍 Ruta: ./${relativeDest}`);
        console.log(`      📊 Stats: ${fragmentsSucceeded} OK | ${fragmentsFailed} Fallbacks.`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n🚀 [CONVERGENCIA] ENSAMBLAJE DE ÉLITE COMPLETADO EN ${duration}ms.\n`);
  } catch (error) {
    console.error('\n💥 [CRITICAL] VIOLACIÓN DE INTEGRIDAD EN EL PREBUILD:');
    console.error(`   Detalle: ${error.message}`);
    process.exit(1);
  }
}

buildDictionaries();