🧪 @metashark/testing-utils: The Quality Mirror Engine
Versión: 2.0 (Elite Testing Infrastructure)
Tipo: Infraestructura de Calidad / Tooling
Alcance: Transversal (Apps, Libs & CI)
Estatus: OBLIGATORIO para cualquier ciclo de prueba.
1. Misión y Filosofía: "El Espejo de Calidad"
El propósito de testing-utils es erradicar la fricción entre la escritura de código y su validación. Actúa como un Gemelo Digital de nuestra infraestructura de producción, proveyendo un entorno pre-configurado donde los componentes de React, las Server Actions y la lógica de dominio operan exactamente igual que en el navegador del huésped, pero bajo condiciones controladas.
Objetivos Estratégicos:
Paridad de Entorno: Garantiza que los tests utilicen los mismos proveedores (Themes, Contexts, i18n) que la aplicación real.
Aislamiento de Red: Centraliza el Protocolo Heimdall de Mocks (vía MSW) para que ningún test dependa de APIs externas reales.
Soberanía de Datos: Elimina los datos quemados (hardcoded) mediante Factories dinámicas y deterministas.
2. Los 3 Pilares del Arsenal de Pruebas
I. Custom Render (The Master Wrapper)
En lugar de usar render de Testing Library directamente, este motor provee un orquestador que inyecta automáticamente el Shell de Infraestructura:
ThemeProvider (Pre-configurado en modo Dark).
WidgetContext (Telemetría).
I18nProvider (Simulación de diccionarios).
II. Sovereign Mocking (MSW Bridge)
Gestiona el ciclo de vida de los Interceptores de Red.
Handlers Centralizados: Si la API del Hotel cambia, solo se actualiza aquí, y todos los tests del monorepo se sincronizan instantáneamente.
Simulación de Latencia: Capacidad para probar estados de carga (skeletons) de forma determinista.
III. Data Factories (Faker Orchestration)
Generación de entidades de dominio (User, Post, Suite, Reputation) con tipado estricto.
Idempotencia: Los datos generados siguen esquemas de Zod, garantizando que el "Espejo" nunca use datos que producción rechazaría.
3. Implementación de Próxima Generación (Dual-Mode)
Esta librería es la prueba de concepto máxima del Manifiesto TypeScript v6.0:
Vía Web (Next.js): Consumida vía src/ para una integración fluida con SWC.
Vía Infra (Jest/Node): Consumida vía dist/ (JavaScript ESM puro) para evitar errores de sintaxis TypeScript durante la ejecución de Jest.
Tree-Shaking: Configurada con sideEffects: false. Si un test solo usa una Factory, el empaquetador descarta todo el código de Mocking y Rendering, optimizando la memoria del proceso de CI.
4. Casos de Uso de Élite
A. Prueba de Componente con Contexto Atmosférico
code
TypeScript
import { render, screen } from '@metashark/testing-utils';
import { HeroCarousel } from './HeroCarousel';

test('debe renderizar el título editorial con el tema activo', () => {
  // El render ya inyecta ThemeProvider y contextos i18n
  render(<HeroCarousel />);
  expect(screen.getByText(/Boutique Sanctuary/i)).toBeInTheDocument();
});
B. Inyección de Identidad para Protocolo 33
code
TypeScript
import { buildUser } from '@metashark/testing-utils/factories';

const mockUser = buildUser({ level: 33, role: 'sponsor' });
// Resultado: Un objeto validado por Zod, listo para inyectar en el store
C. Simulación de Fallo de Telemetría (Heimdall)
code
TypeScript
import { server, http, HttpResponse } from '@metashark/testing-utils/mocks';

server.use(
  http.get('/api/visitor', () => {
    return new HttpResponse(null, { status: 500 });
  })
);
// El componente VisitorHud ahora puede ser probado bajo condiciones de error de red.
5. Guía de Mantenimiento (Protocolo de Calidad)
Prohibición de .d.ts manuales: Todas las declaraciones deben ser emitidas automáticamente por el build hacia dist/. No ensucies src/.
Higiene de Dependencias: Al añadir una nueva herramienta de test, evalúa si debe ser peerDependency. Si el consumidor (ej: la App Web) ya la tiene, agrégala como peer para evitar colisiones de versiones.
Extensión ESM: Todos los imports internos deben usar la extensión .js (ej: ./lib/engine.js) para satisfacer la resolución nodenext del build de infraestructura.
6. Estrategia de Ejecución: Cloud-First (GitHub Actions)
Debido a la alta complejidad computacional de nuestro ecosistema 3D y WebGL, y para garantizar la integridad sin comprometer el rendimiento de los equipos locales, la ejecución soberana de los tests reside en GitHub Actions.
I. Soberanía de Archivos y Git
A diferencia de los proyectos estándar, nuestro .gitignore está configurado para garantizar que el 100% de la infraestructura de pruebas sea rastreada y subida al origen.
Regla: Los archivos *.spec.ts, *.test.ts, y el directorio raíz tests/ son ciudadanos de primera clase en el control de versiones.
Propósito: Permitir que los runners de GitHub tengan el contexto completo para ejecutar validaciones atómicas.
II. Orquestación Manual (On-Demand Intelligence)
Para optimizar el uso de recursos y mantener un control total sobre el flujo de trabajo, todos los aparatos de CI de MetaShark se disparan mediante workflow_dispatch (Manual).
No hay ejecuciones accidentales. El arquitecto decide cuándo y qué validar.
III. Estándar de Nomenclatura de Actions (The Protocol)
Para facilitar el diagnóstico forense en el panel de acciones, hemos estandarizado los nombres de los disparadores siguiendo esta jerarquía:
Categoría	Formato de Nombre	Ejemplo
Atómico (Lib)	TEST: [LIB] - {nombre-paquete}	TEST: [LIB] - protocol-33
Funcional (Feature)	TEST: [FEAT] - {nombre-funcionalidad}	TEST: [FEAT] - hotel-booking-engine
Ruta (Path)	TEST: [PATH] - {ruta/completa}	TEST: [PATH] - apps/portfolio-web/api/visitor
Integración	TEST: [INT] - {flujo-de-negocio}	TEST: [INT] - guest-reputation-sync
E2E (User Flow)	TEST: [E2E] - {escenario-takeover}	TEST: [E2E] - festival-ticket-purchase
IV. Aparatos de Infraestructura en la Nube
Cada Action genera un entorno efímero que:
Sincroniza el Grafo: Instala dependencias y restaura el caché de Nx.
Activa el Dual-Mode: Compila las dependencias necesarias en dist/ para satisfacer a Node.js.
Ejecuta el Espejo: Dispara Jest utilizando el transformador SWC para máxima velocidad.

---

