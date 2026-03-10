Estado: Pendiente tras Bypass.
Acciones Requeridas:
Fragmentación: Una vez estabilizado el proyecto, dividir los archivos consolidados en la carpeta apps/portfolio-web/src/messages/{locale}/.
Archivos Atómicos: Crear hero.json, about.json, nav-links.json, footer.json, contact.json, status.json.
Sincronización: Asegurar que el script prebuild-portfolio-web.mjs mapee correctamente las nuevas rutas de archivos al objeto Dictionary final para evitar regresiones en el tipado de Zod.