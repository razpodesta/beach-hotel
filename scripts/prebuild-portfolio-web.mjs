/**
 * @file prebuild-portfolio-web.mjs
 * @version 6.0 - Elite Assembly Engine
 * @description Ensamblador de diccionarios para el Beach Hotel Canasvieiras.
 *              Genera un único objeto JSON consolidado por idioma para latencia cero.
 * @author Raz Podestá - MetaShark Tech
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES =['en-US', 'es-ES', 'pt-BR'];
const SOURCE_DIR = path.join(__dirname, '../apps/portfolio-web/src/messages');
const DEST_DIR = path.join(__dirname, '../apps/portfolio-web/src/dictionaries');

// LISTA MAESTRA (Todos los archivos granulares que conforman el diccionario)
const FILES =[
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
  'project_details',
  'blog_page' // <-- AÑADIDO: Vital para el Concierge Journal y evitar crash
];

// MAPEO ESTRUCTURAL (Inyecta los archivos en ramas específicas del JSON final)
const FILE_MAPPING = {
  'hero': ['homepage', 'hero'],
  'about': ['homepage', 'about_section'],
  'value_proposition': ['homepage', 'value_proposition_section'],
  'contact':['homepage', 'contact'],
  'history': ['homepage', 'history_section'],
  'ai_gallery_section':['homepage', 'ai_gallery_section']
};

/**
 * Crea la estructura de objetos anidados de forma dinámica si no existe.
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

async function buildDictionaries() {
  console.log('\n🏨[PILOT CMS] INICIANDO ENSAMBLAJE DE DICCIONARIOS HOTELEROS (v6.0)...');
  
  try {
    // Asegurar que el directorio de destino existe
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
            // Si no tiene mapeo específico, va a la raíz del diccionario
            dictionary[file] = jsonContent;
          }
          filesProcessed++;
        } catch (error) {
          // Tolerancia a fallos: Si falta un archivo, no rompemos el build, solo advertimos
          if (error.code === 'ENOENT') {
            console.warn(`   ⚠️  [${locale}] Archivo faltante: ${file}.json (Omitido)`);
          } else {
            // Romper build si el JSON existe pero está mal formado (SyntaxError)
            console.error(`   ❌ [${locale}] Error parseando ${file}.json:`, error.message);
            throw error; 
          }
        }
      }

      // Protección contra vaciado: Solo escribir si se procesaron datos reales
      if (Object.keys(dictionary).length > 0) {
        const destPath = path.join(DEST_DIR, `${locale}.json`);
        await fs.writeFile(destPath, JSON.stringify(dictionary, null, 2));
        console.log(`✅ [${locale}] Diccionario ensamblado con éxito (${filesProcessed} fragmentos).`);
      } else {
        console.log(`⚪ [${locale}] Modo Bypass: No se encontraron fragmentos, no se reescribió el archivo.`);
      }
    }
    
    console.log('✨ ENSAMBLAJE COMPLETADO CORRECTAMENTE.\n');
  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO EN PREBUILD:', error.message);
    process.exit(1);
  }
}

buildDictionaries();