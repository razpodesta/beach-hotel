/**
 * @file prebuild-portfolio-web.mjs
 * @version 7.0 - Full Sync Edition
 * @description Ensamblador de diccionarios. Incluye todos los fragmentos 
 *              requeridos por el esquema soberano de Zod.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES = ['en-US', 'es-ES', 'pt-BR'];
const SOURCE_DIR = path.join(__dirname, '../apps/portfolio-web/src/messages');
const DEST_DIR = path.join(__dirname, '../apps/portfolio-web/src/dictionaries');

// LISTA MAESTRA ACTUALIZADA (Sincronizada con dictionary.schema.ts)
const FILES = [
  'header',
  'nav-links',
  'hero',
  'about',
  'value_proposition',
  'contact',
  'contact_page',    // <-- AÑADIDO
  'history',
  'footer',
  'language_switcher',
  'visitor_hud',      // <-- AÑADIDO
  'not_found',
  'server_error',     // <-- AÑADIDO
  'maintenance',
  'mission_vision',
  'legal',
  'system_status',
  'ai_gallery_section',
  'project_details',
  'blog_page',
  'lucide_page',      // <-- AÑADIDO
  'profile_page'      // <-- AÑADIDO
];

// MAPEO ESTRUCTURAL (Para mantener la jerarquía de la homepage y legal)
const FILE_MAPPING = {
  'hero': ['homepage', 'hero'],
  'about': ['homepage', 'about_section'],
  'value_proposition': ['homepage', 'value_proposition_section'],
  'contact': ['homepage', 'contact'],
  'history': ['homepage', 'history_section'],
  'ai_gallery_section': ['homepage', 'ai_gallery_section'],
  // Si legal.json contiene el objeto { privacy_policy, terms_of_service },
  // no necesita mapeo extra porque va a la raíz 'legal'
};

function setNestedValue(obj, pathArray, value) {
  let current = obj;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  current[pathArray[pathArray.length - 1]] = value;
}

async function buildDictionaries() {
  console.log('\n🛡️ [HEIMDALL] INICIANDO ENSAMBLAJE DE INTEGRIDAD (v7.0)...');
  
  try {
    await fs.mkdir(DEST_DIR, { recursive: true });

    for (const locale of LOCALES) {
      const dictionary = {};
      let filesProcessed = 0;
      
      for (const file of FILES) {
        const filePath = path.join(SOURCE_DIR, locale, `${file}.json`);

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const jsonContent = JSON.parse(content);

          if (FILE_MAPPING[file]) {
            setNestedValue(dictionary, FILE_MAPPING[file], jsonContent);
          } else {
            dictionary[file] = jsonContent;
          }
          filesProcessed++;
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Error preventivo: Si el archivo falta en la carpeta src/messages, el build avisará.
            console.warn(`   ⚠️ [${locale}] ARCHIVO REQUERIDO FALTANTE: ${file}.json`);
            // Creamos un objeto vacío para evitar que el typecast falle catastróficamente
            if (FILE_MAPPING[file]) {
                setNestedValue(dictionary, FILE_MAPPING[file], {});
            } else {
                dictionary[file] = {};
            }
          } else {
            throw error; 
          }
        }
      }

      if (Object.keys(dictionary).length > 0) {
        const destPath = path.join(DEST_DIR, `${locale}.json`);
        await fs.writeFile(destPath, JSON.stringify(dictionary, null, 2));
        console.log(`✅ [${locale}] Sincronizado (${filesProcessed} fragmentos).`);
      }
    }
    console.log('✨ ENSAMBLAJE DE ÉLITE COMPLETADO.\n');
  } catch (error) {
    console.error('\n💥 ERROR DE INTEGRIDAD:', error.message);
    process.exit(1);
  }
}

buildDictionaries();