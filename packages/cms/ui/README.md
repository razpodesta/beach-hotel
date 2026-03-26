🎨 @metashark/cms-ui: The Aesthetic DNA Engine
Versión: 2.0 (Elite Component System)
Tipo: Librería de Componentes / Sistema de Diseño Encapsulado
Alcance: Interfaz Administrativa y Presentación Compartida
Estatus: ACTIVO. Repositorio soberano de la experiencia de usuario MetaShark.
1. Misión Arquitectónica
cms-ui es el orquestador de la capa visual del ecosistema. Su propósito es proveer una librería de componentes Atómicos y Organismos de alta fidelidad, garantizando que la estética del Beach Hotel y el Festival sea consistente, accesible y de alto rendimiento.
Principios de Ingeniería de Élite:
Aislamiento de Estilos: Implementa CSS Modules para erradicar la colisión de clases y garantizar el encapsulamiento total.
Tree-Shaking Optimizado: Configurado con sideEffects granulares para permitir que Next.js descarte componentes no utilizados sin perder las definiciones de estilo críticas.
Dual-Mode Compliance: Servido mediante código fuente (src/) para el empaquetado de Next.js y mediante artefactos compilados (dist/) para entornos de prueba y documentación.
2. Operación y Resolución Dual-Mode
Este paquete implementa el estándar de Próxima Generación para resolver la fricción entre estilos y lógica:
Modo Source-First (Next.js 15): Next.js consume directamente los archivos .tsx y .module.css. Gracias a transpilePackages: ['@metashark/cms-ui'], el empaquetador SWC procesa los componentes al vuelo con paridad total de tema.
Modo Build-First (Infraestructura/Node): El build de Nx emite archivos .js reales y copia los archivos .css a la carpeta dist/. Esto permite que herramientas externas consuman la lógica de los componentes sin depender del pipeline de Next.js.
3. Gobernanza de Estilos (CSS Modules)
Para garantizar la estabilidad visual, seguimos un protocolo estricto:
Tipado de Estilos: El archivo src/global.d.ts es el contrato que permite a TypeScript validar las clases inyectadas desde archivos .css.
Declaración de Efectos: El package.json marca explícitamente los archivos CSS como poseedores de efectos secundarios (sideEffects: ["**/*.css"]). Esto protege al diseño de ser "limpiado" por error durante la optimización de producción.
4. El Grafo de Mantenimiento (Nx Commands)
Acción	Comando	Propósito Forense
Build	nx build cms-ui	Genera artefactos físicos y sincroniza los assets CSS en ./dist.
Typecheck	nx typecheck cms-ui	Valida la integridad estática de los componentes y las definiciones de CSS.
Lint	nx lint cms-ui	Audita la higiene visual y el cumplimiento de las reglas de React Hooks.
Test	nx test cms-ui	Ejecuta pruebas de renderizado mediante Jest + JSDOM en el Espejo de Calidad.
5. Ejemplo de Implementación de Élite
Los componentes se consumen mediante los alias soberanos, manteniendo la limpieza en las importaciones:
code
Tsx
/**
 * @pilar IX: Componentización Lego.
 * Consumo desde la App Web utilizando la vía Source-First.
 */
import { MetasharkCmsUi } from '@metashark/cms-ui';

export function AdminDashboard() {
  return (
    <section className="layout-sovereign">
      <MetasharkCmsUi variant="high-fidelity" />
    </section>
  );
}
6. Guía de Evolución (Best Practices)
Atomicidad: Si un componente crece más de 200 líneas, debe ser fragmentado en sub-componentes internos dentro de src/lib/.
Agnosticismo de Datos: Los componentes de UI deben ser puramente presentacionales. No deben realizar peticiones a API; reciben los datos y las acciones mediante props estrictamente tipadas.
Accesibilidad (A11Y): Todo componente interactivo debe incluir atributos ARIA y soporte para navegación por teclado por defecto.
Veredicto de Arquitectura:
cms-ui no es solo una carpeta de componentes; es el guardián de la sofisticación. Es el puente entre la ingeniería de sistemas y el diseño editorial de lujo del Beach Hotel Canasvieiras.

---

