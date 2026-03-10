const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE RUTAS DE PRUEBA (Mirror Architecture)');
console.log('====================================================');

// 1. Definir rutas esperadas
const projectDir = path.resolve(__dirname, '../packages/testing-utils');
const mirrorTestDir = path.resolve(__dirname, '../tests/packages/testing-utils');

console.log(`📂 Directorio del Proyecto: ${projectDir}`);
console.log(`📂 Directorio Espejo de Tests: ${mirrorTestDir}`);

// 2. Verificar existencia física
if (fs.existsSync(mirrorTestDir)) {
    console.log('✅ El directorio de tests existe físicamente.');
    const files = fs.readdirSync(mirrorTestDir);
    console.log('   Archivos encontrados:', files);
} else {
    console.error('❌ ERROR CRÍTICO: El directorio de tests NO existe en la ruta calculada.');
    process.exit(1);
}

console.log('\n📋 RECOMENDACIÓN PARA JEST CONFIG:');
console.log('Debes configurar "roots" para incluir explícitamente el directorio espejo.');
console.log(`roots: ['<rootDir>/src', '<rootDir>/../../tests/packages/testing-utils']`);
