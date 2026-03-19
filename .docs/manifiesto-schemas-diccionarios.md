 Manifiesto de Arquitectura de Contenido Soberano (MACS) v1.0
1. Misión
Eliminar la fricción entre la edición de contenido (JSONs) y la lógica de tipos (Zod), garantizando que el proceso de compilación sea un guardián infalible (Heimdall) y no un obstáculo.
2. La Triada Atómica (Por cada Aparato/Sección)
Cada componente o sección de la interfaz debe poseer obligatoriamente tres pilares sincronizados. Si falta uno, el aparato está incompleto.
El Contrato (Schema): src/lib/schemas/{feature}.schema.ts
Define la forma exacta de los datos usando Zod.
Regla: Prohibido usar z.any() o z.unknown() para textos. Todo string debe ser z.string().min(1).
La Realidad (JSONs): src/messages/{lang}/{feature}.json
Existen exactamente 3 archivos (es-ES, en-US, pt-BR) por cada contrato.
Regla: La estructura del JSON debe ser plana y coincidir 1:1 con el Schema del punto 1.
El Consumidor (Componente): El archivo .tsx que recibe las props tipadas por z.infer<typeof schema>.
3. Jerarquía Soberana (Flattening Protocol)
Para evitar errores de undefined y rutas de acceso kilométricas, se prohíbe el anidamiento lógico innecesario.
❌ PROHIBIDO: dictionary.homepage.hero.title (Anidamiento por página).
✅ OBLIGATORIO: dictionary.hero.title (Acceso directo por aparato).
Justificación: El script de pre-build mapea el nombre del archivo {feature}.json directamente a una llave en la raíz del objeto global. Anidar dentro de homepage o shared solo duplica el trabajo y rompe el SSoT.
4. El Orquestador Maestro (dictionary.schema.ts)
Este archivo no es un almacén de datos, es el Validador de Frontera.
Función: Importa todos los Schemas atómicos y los une en un solo objeto z.object.
Regla de Oro: Si añades un nuevo archivo JSON en messages, DEBES registrar su esquema correspondiente en dictionary.schema.ts. Si no lo haces, el script de pre-build abortará la misión.
5. El Script de Ensamblaje (prebuild-portfolio-web.ts)
Es el único proceso autorizado para generar los archivos en src/dictionaries/.
Flujo:
Escanea src/messages/{lang}/.
Fusiona los JSONs atómicos en un objeto gigante por idioma.
Valida ese objeto contra dictionary.schema.ts.
Si la validación pasa, escribe el artefacto final en src/dictionaries/{lang}.json.
Regla: Nunca edites manualmente nada dentro de la carpeta src/dictionaries/. Es territorio generado.
6. Protocolo de Creación de un Nuevo Aparato (Paso a Paso)
Cuando necesites crear una nueva sección (ej: newsletter):
Crea src/lib/schemas/newsletter.schema.ts.
Crea src/messages/{es,en,pt}/newsletter.json con los textos.
Registra newsletter: newsletterSchema en src/lib/schemas/dictionary.schema.ts.
Ejecuta pnpm run prebuild:web.
Consume dictionary.newsletter en tu componente.
7. Mantenimiento de Calidad
Cero Regresiones: Cualquier cambio en un Schema debe ser replicado en los 3 JSONs de inmediato.
Mensajes Forenses: Si el build falla, el error debe indicar exactamente qué llave (path) y qué idioma causó la ruptura del contrato.

---

