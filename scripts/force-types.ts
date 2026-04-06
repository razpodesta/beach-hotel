import { generateTypes } from 'payload/node';

// eslint-disable-next-line @nx/enforce-module-boundaries
import configPromise from '../packages/cms/core/src/payload.generate.config';

async function executeNuclearPlan() {
  console.log("☢️ [PLAN NUCLEAR] Iniciando bypass del CLI en Windows...");
  try {
    const config = await configPromise;
    console.log("⏳ Generando tipos directamente desde la API pura de Node...");
    
    await generateTypes(config);
    
    console.log("✅ ¡Tipos generados con éxito! El bug de Windows fue evadido.");
    process.exit(0);
  } catch (error) {
    console.error("💥 Fallo en la generación pura:", error);
    process.exit(1);
  }
}

executeNuclearPlan();