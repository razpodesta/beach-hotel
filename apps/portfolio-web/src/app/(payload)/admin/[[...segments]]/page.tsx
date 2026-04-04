/**
 * @file apps/portfolio-web/src/app/(payload)/admin/[[...segments]]/page.tsx
 * @description Punto de montaje soberano para el panel administrativo.
 *              Refactorizado: Resolución de importación mediante el componente 
 *              'AdminPage' oficial del paquete '@payloadcms/next/views'.
 * @version 3.0 - Standard Payload Entrypoints Corrected
 * @author Staff Engineer - MetaShark Tech
 */

import { AdminPage } from '@payloadcms/next/views';
import { importMap } from '@payloadcms/next/importMap';
import configPromise from '@metashark/cms-core/config';

type PageArgs = { params: Promise<{ segments: string[] }> };

export default async function Page(props: PageArgs) {
  const { segments } = await props.params;

  return AdminPage({
    config: configPromise,
    importMap,
    params: segments || [],
    searchParams: {},
  });
}