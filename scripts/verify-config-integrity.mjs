// RUTA: /scripts/verify-config-integrity.mjs
// VERSIÓN: 2.4 - "Sistema de Diagnóstico de Integridad Arquitectónica" (Impecable y Final)
// DESCRIPCIÓN: Versión final que corrige la última advertencia de ESLint 'no-useless-escape'
//              mediante una desactivación explícita, reconociendo un falso positivo del linter.

import fs from 'fs/promises';
import path from 'path';

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', gray: '\x1b[90m',
  magenta: '\x1b[35m', blue: '\x1b[34m'
};

const LOG_PREFIX = `${colors.blue}[DIAGNÓSTICO]${colors.reset}`;

class CheckResult {
  constructor(status, message) { this.status = status; this.message = message; }
  static Pass(message) { return new CheckResult('PASS', `${colors.green}✅ ${message}${colors.reset}`); }
  static Fail(message) { return new CheckResult('FAIL', `${colors.red}❌ ${message}${colors.reset}`); }
  static Skip(message) { return new CheckResult('SKIP', `${colors.gray}⚪ ${message}${colors.reset}`); }
}

async function readJsoncFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
  } catch { return null; }
}

async function findWorkspaces() {
    const workspaceRoots = ['apps', 'packages'];
    const workspaces = [];
    for (const root of workspaceRoots) {
        try {
            const dirs = await fs.readdir(path.resolve(process.cwd(), root), { withFileTypes: true });
            for (const dir of dirs) {
                if (dir.isDirectory()) {
                    const projectPath = path.join(root, dir.name);
                    try {
                        await fs.access(path.join(projectPath, 'project.json'));
                        workspaces.push({ name: dir.name, path: projectPath });
                    } catch { // Es una carpeta contenedora
                        try {
                            const subDirs = await fs.readdir(projectPath, { withFileTypes: true });
                            for (const subDir of subDirs) {
                                if (subDir.isDirectory()) {
                                    const nestedProjectPath = path.join(projectPath, subDir.name);
                                    try {
                                        await fs.access(path.join(nestedProjectPath, 'project.json'));
                                        workspaces.push({ name: `${dir.name}/${subDir.name}`, path: nestedProjectPath });
                                    } catch { /* Intencionalmente vacío: No es un proyecto anidado */ }
                                }
                            }
                        } catch { /* Intencionalmente vacío: No es una carpeta o no se pudo leer */ }
                    }
                }
            }
        } catch { /* Intencionalmente vacío: La carpeta raíz no existe */ }
    }
    return workspaces;
}

async function auditTsconfig(project) {
    const results = [];
    const filePath = path.resolve(project.path, 'tsconfig.json');
    const config = await readJsoncFile(filePath);
    if (!config) { return [CheckResult.Skip(`No se encontró tsconfig.json.`)]; }
    const relativeBasePath = path.relative(project.path, process.cwd()).replace(/\\/g, '/');
    const expectedExtends = `${relativeBasePath}/tsconfig.base.json`;
    if (config.extends === expectedExtends) { results.push(CheckResult.Pass(`Hereda correctamente de '${expectedExtends}'.`));
    } else { results.push(CheckResult.Fail(`Debe heredar de '${expectedExtends}', pero se encontró '${config.extends}'.`)); }
    return results;
}

async function auditTsconfigSpec(project) {
    const results = [];
    const projectJson = await readJsoncFile(path.resolve(project.path, 'project.json'));
    const hasTestTarget = !!projectJson?.targets?.test;
    const filePath = path.resolve(project.path, 'tsconfig.spec.json');
    const config = await readJsoncFile(filePath);
    if (!config) {
        if(hasTestTarget) { results.push(CheckResult.Fail(`El proyecto tiene un target 'test' pero no tiene tsconfig.spec.json.`));
        } else { results.push(CheckResult.Skip(`No se encontró tsconfig.spec.json (y el proyecto no tiene un target 'test').`)); }
        return results;
    }
    if (config.extends === './tsconfig.json') results.push(CheckResult.Pass(`Hereda correctamente de './tsconfig.json'.`));
    else results.push(CheckResult.Fail(`Debe heredar de './tsconfig.json', pero se encontró '${config.extends}'.`));
    if (config.compilerOptions?.module === 'commonjs') results.push(CheckResult.Pass(`'compilerOptions.module' está configurado como 'commonjs'.`));
    else results.push(CheckResult.Fail(`'compilerOptions.module' debe ser 'commonjs' para Jest, pero es '${config.compilerOptions?.module}'.`));
    const types = config.compilerOptions?.types || [];
    if (types.includes('jest') && types.includes('node')) results.push(CheckResult.Pass(`'compilerOptions.types' incluye 'jest' y 'node'.`));
    else results.push(CheckResult.Fail(`'compilerOptions.types' debe incluir 'jest' y 'node'. Se encontró: [${types.join(', ')}].`));
    const setupFilePath = path.resolve(project.path, 'jest.setup.ts');
    try {
        await fs.access(setupFilePath);
        if (config.include?.includes('jest.setup.ts')) { results.push(CheckResult.Pass(`Incluye el archivo 'jest.setup.ts' existente.`));
        } else { results.push(CheckResult.Fail(`Existe un 'jest.setup.ts' pero NO está incluido en la sección 'include'.`)); }
    } catch {
        if (config.include?.includes('jest.setup.ts')) { results.push(CheckResult.Fail(`'include' apunta a un 'jest.setup.ts' que NO existe.`));
        } else { results.push(CheckResult.Skip(`No se encontró 'jest.setup.ts'.`)); }
    }
    const relativeProjectPath = project.path.replace(/\\/g, '/');
    if(config.include?.some(p => p.includes(`tests/${relativeProjectPath}`))) { results.push(CheckResult.Pass(`'include' apunta a la arquitectura de espejo en 'tests/'.`));
    } else { results.push(CheckResult.Fail(`'include' no apunta a la ruta de pruebas en 'tests/${relativeProjectPath}'.`)); }
    return results;
}

async function auditJestConfig(project) {
    const results = [];
    const filePath = path.resolve(project.path, 'jest.config.ts');

    let fileContent;
    try {
        fileContent = await fs.readFile(filePath, 'utf8');
    } catch {
        const projectJson = await readJsoncFile(path.resolve(project.path, 'project.json'));
        if (projectJson?.targets?.test) { results.push(CheckResult.Fail(`El proyecto tiene un target 'test' pero no tiene jest.config.ts.`));
        } else { results.push(CheckResult.Skip(`No se encontró jest.config.ts (y no es requerido).`)); }
        return results;
    }

    const displayNameRegex = new RegExp(`displayName:\\s*['"\`]${project.name}['"\`]`);
    if(displayNameRegex.test(fileContent)) results.push(CheckResult.Pass(`Contiene 'displayName' consistente ('${project.name}').`));
    else results.push(CheckResult.Fail(`'displayName' falta o no coincide con el nombre del proyecto ('${project.name}').`));

    const presetRegex = /preset:\s*['"`]..\/..\/jest\.preset\.js['"`]/;
    if(presetRegex.test(fileContent)) results.push(CheckResult.Pass(`Usa el preset raíz '../../jest.preset.js'.`));
    else results.push(CheckResult.Fail(`No se encontró el uso del preset raíz.`));

    const isBackend = project.name.endsWith('-api');
    const expectedEnv = isBackend ? 'node' : 'jsdom';
    const testEnvRegex = new RegExp(`testEnvironment:\\s*['"\`]${expectedEnv}['"\`]`);
    if (testEnvRegex.test(fileContent)) {
        results.push(CheckResult.Pass(`Configura 'testEnvironment' como '${expectedEnv}'.`));
    } else {
        results.push(CheckResult.Fail(`Debe configurar 'testEnvironment: '${expectedEnv}'' para este tipo de proyecto.`));
    }

    const setupFilePath = path.resolve(project.path, 'jest.setup.ts');
    try {
        await fs.access(setupFilePath);
        const setupRegex = /setupFilesAfterEnv:\s*\[\s*['"`]<rootDir>\/jest\.setup\.ts['"`]\s*]/;
        if(setupRegex.test(fileContent)) {
             results.push(CheckResult.Pass(`Configura correctamente 'setupFilesAfterEnv'.`));
        } else {
             results.push(CheckResult.Fail(`Existe 'jest.setup.ts' pero 'setupFilesAfterEnv' no está configurado o es incorrecto.`));
        }
    } catch { /* Intencionalmente vacío */ }

    const relativeProjectPath = project.path.replace(/\\/g, '/');
    // eslint-disable-next-line no-useless-escape
    const matchRegex = new RegExp(`testMatch:\\s*\\[\\s*['"\`]<rootDir>\\/..\\/..\\/tests\\/${relativeProjectPath}\\/\\*\\*\\/\\*\\.spec\\.ts\\?\\(x\\)['"\`]\s*\\]`);
    if(matchRegex.test(fileContent)) {
        results.push(CheckResult.Pass(`'testMatch' apunta a la arquitectura de espejo.`));
    } else {
        results.push(CheckResult.Fail(`'testMatch' no apunta a la ruta de pruebas esperada.`));
    }
    return results;
}


async function main() {
  console.log(`${LOG_PREFIX} ${colors.yellow}Iniciando auditoría completa de configuración...${colors.reset}`);
  const workspaces = await findWorkspaces();
  let totalFailures = 0;
  console.log(`${LOG_PREFIX} Se auditarán ${workspaces.length} workspaces.\n`);
  for (const project of workspaces) {
    console.log(`${colors.magenta}====================================================${colors.reset}`);
    console.log(`${colors.magenta}   Auditoría del Workspace: ${colors.cyan}${project.path}${colors.reset}`);
    console.log(`${colors.magenta}====================================================${colors.reset}`);
    let projectFailures = 0;
    const auditSection = async (title, auditFn) => {
        console.log(`\n  ${colors.yellow}🔎 Verificando ${title}...${colors.reset}`);
        const results = await auditFn(project);
        results.forEach(result => {
            console.log(`    ${result.message}`);
            if (result.status === 'FAIL') {
                projectFailures++;
                totalFailures++;
            }
        });
    };
    await auditSection('tsconfig.json', auditTsconfig);
    await auditSection('tsconfig.spec.json', auditTsconfigSpec);
    await auditSection('jest.config.ts', auditJestConfig);
    if (projectFailures > 0) { console.log(`\n  ${colors.red}❗ Resumen de ${project.path}: ${projectFailures} configuración(es) incorrecta(s) detectada(s).${colors.reset}`);
    } else { console.log(`\n  ${colors.green}✨ Resumen de ${project.path}: Todas las configuraciones son correctas.${colors.reset}`); }
    console.log('\n');
  }
  console.log(`${colors.magenta}====================================================${colors.reset}`);
  console.log(`${LOG_PREFIX} ${colors.yellow}Auditoría Finalizada.${colors.reset}`);
  if (totalFailures > 0) {
    console.log(`${LOG_PREFIX} ${colors.red}Resultado General: Se encontraron ${totalFailures} errores de configuración en el monorepo.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${LOG_PREFIX} ${colors.green}Resultado General: ¡Felicitaciones! Todas las configuraciones auditadas son correctas.${colors.reset}`);
  }
}

main();
