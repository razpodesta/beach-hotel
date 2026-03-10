// RUTA: apps/portfolio-web/src/lib/blog/actions.ts
// VERSIÓN: 4.0 - Adaptado a Mocking Universal

import { fetchGraphQL } from '../graphql-client';
import type { PostWithSlug } from '../schemas/blog.schema';

type CmsTag = { name: string; slug: string; };
type CmsAuthor = { username: string; };
type CmsPost = {
  title: string;
  slug: string;
  description: string;
  content: string;
  author: CmsAuthor | string; // Adaptamos para aceptar string directo del mock o objeto de API
  published_date: string;
  tags: CmsTag[] | string[]; // Adaptamos para aceptar array de strings del mock
};

type GetPostsPayload = { getPosts: CmsPost[] };
type GetPostBySlugPayload = { getPostBySlug: CmsPost | null };
type GetPostsByTagPayload = { getPostsByTagSlug: CmsPost[] };

function mapCmsDataToPost(entry: CmsPost): PostWithSlug {
  // Normalización de datos (Mock vs API real)
  const tags = Array.isArray(entry.tags)
    ? entry.tags.map(t => typeof t === 'string' ? t : t.name)
    : [];

  const author = typeof entry.author === 'string'
    ? entry.author
    : (entry.author?.username || 'Unknown');

  return {
    slug: entry.slug,
    metadata: {
      title: entry.title,
      description: entry.description,
      author: author,
      published_date: entry.published_date,
      tags: tags,
    },
    content: entry.content || '',
  };
}

export async function getAllPosts(): Promise<PostWithSlug[]> {
  const query = `
    query GetAllPosts {
      getPosts {
        title slug description content published_date
        author { username }
        tags { name slug }
      }
    }
  `;
  const data = await fetchGraphQL<GetPostsPayload>(query);
  return (data.getPosts || []).map(mapCmsDataToPost);
}

export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
  const query = `
    query GetPostBySlug($slug: String!) {
      getPostBySlug(slug: $slug) {
        title slug description content published_date
        author { username }
        tags { name slug }
      }
    }
  `;
  const data = await fetchGraphQL<GetPostBySlugPayload>(query, { slug });
  if (!data.getPostBySlug) return null;
  return mapCmsDataToPost(data.getPostBySlug);
}

export async function getPostsByTag(slug: string): Promise<PostWithSlug[]> {
  const query = `
    query GetPostsByTag($slug: String!) {
      getPostsByTagSlug(slug: $slug) {
        title slug description content published_date
        author { username }
        tags { name slug }
      }
    }
  `;
  const data = await fetchGraphQL<GetPostsByTagPayload>(query, { slug });
  return (data.getPostsByTagSlug || []).map(mapCmsDataToPost);
}
