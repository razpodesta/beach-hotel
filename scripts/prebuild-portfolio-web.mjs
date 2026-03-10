/**
 * @file prebuild-portfolio-web.mjs
 * @version 5.0 - Hospitality Core
 * @description Ensamblador de diccionarios para el Beach Hotel Canasvieiras.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES = ['en-US', 'es-ES', 'pt-BR'];
const SOURCE_DIR = path.join(__dirname, '../apps/portfolio-web/src/messages');
const DEST_DIR = path.join(__dirname, '../apps/portfolio-web/src/dictionaries');

// LISTA MAESTRA NATURALIZADA (Solo lo que el Hotel necesita)
const FILES = [
  'header',
  'nav-links',
  'hero',
  'about',
  'value_proposition',
  'contact',
  'history',
  'footer',
  'language_switcher',
  'not_found',
  'maintenance',
  'mission_vision',
  'legal',
  'system_status',
  'ai_gallery_section',
  'project_details' // Se mantiene el nombre del archivo para no romper el import de Zod, pero con contenido de experiencias
];

// MAPEO ESTRUCTURAL (Lego Logic)
const FILE_MAPPING = {
  'hero': ['homepage', 'hero'],
  'about': ['homepage', 'about_section'],
  'value_proposition': ['homepage', 'value_proposition_section'],
  'contact': ['homepage', 'contact'],
  'history': ['homepage', 'history_section'],
  'ai_gallery_section': ['homepage', 'ai_gallery_section']
};

function setNestedValue(obj, path, value) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

async function buildDictionaries() {
  console.log('\n🏨 [PILOT CMS] INICIANDO ENSAMBLAJE DE DICCIONARIOS HOTELEROS');
  
  try {
    await fs.mkdir(DEST_DIR, { recursive: true });

    for (const locale of LOCALES) {
      const dictionary = {};
      
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
        } catch (error) {
          // Si el archivo no existe, simplemente lo ignoramos para permitir 
          // que el modo Bypass manual funcione sin errores de build.
          if (error.code !== 'ENOENT') throw error;
        }
      }

      // Solo guardamos si hemos recolectado datos (Protección contra vaciado accidental)
      if (Object.keys(dictionary).length > 0) {
        const destPath = path.join(DEST_DIR, `${locale}.json`);
        await fs.writeFile(destPath, JSON.stringify(dictionary, null, 2));
        console.log(`✅ [${locale}] Diccionario actualizado.`);
      } else {
        console.log(`⚪ [${locale}] Modo Bypass detectado o archivos faltantes. No se realizó escritura.`);
      }
    }
  } catch (error) {
    console.error('❌ Error crítico en prebuild:', error.message);
    process.exit(1);
  }
}

buildDictionaries();