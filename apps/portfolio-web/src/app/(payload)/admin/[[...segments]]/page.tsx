/**
 * @file apps/portfolio-web/src/app/(payload)/admin/[[...segments]]/page.tsx
 * @description Punto de montaje soberano para el panel administrativo.
 *              Refactorizado: Resolución dinámica mediante contratos SSoT.
 * @version 5.1 - Static Build Resilient
 */

import { AdminView } from '@payloadcms/next/views/Admin';
import { importMap } from '@payloadcms/next/importMap';
import configPromise from '@metashark/cms-core/config';

type PageArgs = { 
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * @description AdminPage actúa como el contenedor de renderizado.
 *              La inyección de configPromise garantiza que el CMS solo arranque
 *              cuando el usuario accede a esta ruta (Lazy Handshake).
 */
export default async function AdminPage(props: PageArgs) {
  const { segments } = await props.params;
  const searchParams = await props.searchParams;

  return (
    <AdminView
      config={configPromise}
      importMap={importMap}
      params={segments || []}
      searchParams={await searchParams}
    />
  );
}