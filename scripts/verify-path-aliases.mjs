// RUTA: /scripts/verify-path-aliases.mjs
// VERSIÓN: 3.1 - "Auditor de Integridad Arquitectónica" (Impecable y Definitivo)
// DESCRIPCIÓN: Versión final que corrige la última advertencia de ESLint sobre
//              variables no utilizadas, utilizando la sintaxis moderna 'catch' sin
//              parámetros para un código 100% limpio.

import fs from 'fs/promises';
import path from 'path';

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', gray: '\x1b[90m',
  magenta: '\x1b[35m', blue: '\x1b[34m'
};

async function verifyPathAliases() {
  console.log(`${colors.yellow}🚀 Iniciando Auditoría de Alias de TypeScript...${colors.reset}`);
  console.log('----------------------------------------------------');

  const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.base.json');
  let successCount = 0;
  let errorCount = 0;

  try {
    const tsconfigFileContent = await fs.readFile(tsconfigPath, 'utf8');
    const tsconfig = JSON.parse(tsconfigFileContent.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));

    const paths = tsconfig.compilerOptions?.paths;
    const baseUrl = tsconfig.compilerOptions?.baseUrl || '.';

    if (!paths || Object.keys(paths).length === 0) {
      console.log(`${colors.red}❌ No se encontraron 'paths' en tsconfig.base.json. Auditoría detenida.${colors.reset}`);
      return;
    }

    console.log(`🔎 Se encontraron ${Object.keys(paths).length} alias para verificar:\n`);

    for (const alias in paths) {
      const targetPathArray = paths[alias];
      const rawTargetPath = targetPathArray[0];

      const cleanTargetPath = rawTargetPath.replace(/\/\*$/, '');
      const absoluteTargetPath = path.resolve(process.cwd(), baseUrl, cleanTargetPath);

      process.stdout.write(`  - Verificando alias ${colors.cyan}'${alias}'${colors.reset}... `);

      try {
        await fs.access(absoluteTargetPath);
        console.log(`${colors.green}✅ OK${colors.reset}`);
        console.log(`    ↳ Mapea a: ${absoluteTargetPath}`);
        successCount++;
      } catch { // --- CORRECCIÓN ESLINT DEFINITIVA ---
                // Se omite el parámetro del catch por completo, ya que no se utiliza.
                // --- FIN DE LA CORRECCIÓN ---
        console.log(`${colors.red}❌ ERROR: Archivo o directorio no encontrado.${colors.reset}`);
        console.log(`    ↳ Se esperaba encontrar: ${absoluteTargetPath}`);
        errorCount++;
      }
    }
  } catch (error) {
    console.error(`${colors.red}💥 Error crítico al leer o parsear tsconfig.base.json:${colors.reset}\n`, error);
    errorCount++;
  }

  console.log('----------------------------------------------------');
  if (errorCount > 0) {
    console.log(`${colors.red}🚨 Auditoría completada con ${errorCount} error(es). Revisa las rutas fallidas.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}🎉 Auditoría completada con éxito. Todas las ${successCount} rutas de alias son válidas.${colors.reset}`);
  }
}

verifyPathAliases();
