/**
 * @file apps/portfolio-web/src/app/(payload)/admin/[[...segments]]/page.tsx
 * @description Punto de montaje soberano para el panel administrativo.
 *              Refactorizado: Resolución de importación mediante el punto de entrada 
 *              generado dinámicamente por Payload 3.0 en el build.
 * @version 4.0 - Deterministic Payload Entrypoint
 * @author Staff Engineer - MetaShark Tech
 */

import { AdminView } from '@payloadcms/next/views/Admin';
import { importMap } from '@payloadcms/next/importMap';
import configPromise from '@metashark/cms-core/config';

type PageArgs = { 
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminPage(props: PageArgs) {
  const { segments } = await props.params;
  const searchParams = await props.searchParams;

  return AdminView({
    config: configPromise,
    importMap,
    params: segments || [],
    searchParams,
  });
}