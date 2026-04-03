# Manifiesto: Protocolo de Construcción y Despliegue (Vercel + Nx)
**Versión:** 1.0 (Resolución de Rutas Críticas)

## 1. Regla de Oro del Build
El `outputPath` en `project.json` debe coincidir con el directorio padre del build de Next.js. Vercel, al detectar el framework 'nextjs', buscará automáticamente la carpeta `.next` dentro del `outputDirectory` definido en `vercel.json`.

## 2. Flujo de Datos del Build
1. `pnpm run build` -> ejecuta `nx build portfolio-web`.
2. Nx compila en `dist/apps/portfolio-web`.
3. Next.js genera su salida en `dist/apps/portfolio-web/.next`.
4. Vercel lee `outputDirectory: dist/apps/portfolio-web/.next`.
5. El archivo `routes-manifest.json` es encontrado en la raíz de la carpeta `.next`.

## 3. Resolución de Errores
Si el error persiste, la única causa posible es que el cache de Vercel está corrompido. Debes forzar un "Redeploy" desde el dashboard de Vercel marcando la opción **"Redeploy with existing Build Cache = False"**.