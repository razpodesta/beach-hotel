// RUTA: apps/portfolio-web/src/data/ai-gallery.ts
// VERSIÓN: 2.1 - Inventario de Activos Auditado
// DESCRIPCIÓN: Define la colección de la galería.
// NOTA CRÍTICA: Asegúrate de que los archivos existan en:
// apps/portfolio-web/public/images/ai-gallery/

export interface AiGalleryAsset {
  id: string;
  image: string;
  category: 'Typography' | 'Product' | 'Architecture' | 'Abstract';
}

export const aiGalleryData: AiGalleryAsset[] = [
  {
    id: 'neon-typography',
    image: '/images/ai-gallery/razbits-neon-typography.jpg', // CHECK: File exists?
    category: 'Typography'
  },
  {
    id: 'editorial-fashion',
    image: '/images/ai-gallery/aesthetic-editorial-fashion.jpg', // CHECK: File exists?
    category: 'Typography'
  },
  {
    id: 'tech-badge',
    image: '/images/ai-gallery/tech-badge-v2.jpg', // CHECK: File exists?
    category: 'Typography'
  },
  {
    id: 'transparent-gadget',
    image: '/images/ai-gallery/transparent-tech-gadget.jpg', // CHECK: File exists?
    category: 'Product'
  },
  {
    id: 'luxury-perfume',
    image: '/images/ai-gallery/luxury-perfume-gold.jpg', // CHECK: File exists?
    category: 'Product'
  },
  {
    id: 'concept-car',
    image: '/images/ai-gallery/concept-car-detail.jpg', // CHECK: File exists?
    category: 'Product'
  },
  {
    id: 'concrete-workspace',
    image: '/images/ai-gallery/minimalist-concrete-workspace.jpg', // CHECK: File exists?
    category: 'Architecture'
  },
  {
    id: 'cyberpunk-street',
    image: '/images/ai-gallery/cyberpunk-city-street.jpg', // CHECK: File exists?
    category: 'Architecture'
  },
  {
    id: 'abstract-geometry',
    image: '/images/ai-gallery/abstract-architectural-geometry.jpg', // CHECK: File exists?
    category: 'Architecture'
  },
  {
    id: 'fluid-shapes',
    image: '/images/ai-gallery/fluid-iridescent-shapes.jpg', // CHECK: File exists?
    category: 'Abstract'
  },
  {
    id: 'mechanical-insect',
    image: '/images/ai-gallery/mechanical-insect-macro.jpg', // CHECK: File exists?
    category: 'Abstract'
  },
  {
    id: 'neural-network',
    image: '/images/ai-gallery/data-visualization-art.jpg', // CHECK: File exists?
    category: 'Abstract'
  }
];
