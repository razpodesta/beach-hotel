/**
 * @file apps/portfolio-web/src/app/(payload)/admin/[[...segments]]/page.tsx
 * @description Punto de montaje del panel administrativo (Silo de Gestión).
 *              Refactorizado: Uso del componente Admin nativo de Payload v3+.
 * @version 6.0 - Payload 3.x Native Entrypoint
 * @author Staff Engineer - MetaShark Tech
 */

import { AdminView } from '@payloadcms/next/views/Admin';
import { importMap } from '@payloadcms/next/importMap';
import config from '@metashark/cms-core/config';

// Tipado estricto para los parámetros del App Router
type PageArgs = { 
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * @description El componente AdminView ya no se importa de 'payload' 
 * sino desde el paquete de integración oficial.
 */
export default async function AdminPage(props: PageArgs) {
  const { segments } = await props.params;
  const searchParams = await props.searchParams;

  // Renderizado soberano del CMS
  return (
    <AdminView
      config={config}
      importMap={importMap}
      params={segments || []}
      searchParams={await searchParams}
    />
  );
}