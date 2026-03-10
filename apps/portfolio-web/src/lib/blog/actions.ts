// RUTA: apps/portfolio-web/src/lib/blog/actions.ts
// VERSIÓN: 5.0 - CMS Integrity Adapter

import { fetchGraphQL } from '../graphql-client';
import type { PostWithSlug } from '../schemas/blog.schema';

// Adaptador para el esquema de Payload CMS 3.0
function mapPayloadToPost(entry: any): PostWithSlug {
  return {
    slug: entry.slug,
    metadata: {
      title: entry.title,
      description: entry.description,
      author: entry.author?.username || 'Concierge Team',
      published_date: entry.publishedDate || entry.published_date,
      tags: entry.tags?.map((t: any) => t.tag) || [],
    },
    content: entry.content?.root?.children ? JSON.stringify(entry.content) : entry.content || '',
  };
}

export async function getAllPosts(): Promise<PostWithSlug[]> {
  const query = `
    query GetAllPosts {
      BlogPosts(where: { status: { equals: published } }) {
        docs {
          title slug description content author { username } publishedDate tags { tag }
        }
      }
    }
  `;
  const data: any = await fetchGraphQL(query);
  return (data.BlogPosts.docs || []).map(mapPayloadToPost);
}

export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
  const query = `
    query GetPostBySlug($slug: String!) {
      BlogPosts(where: { slug: { equals: $slug } }) {
        docs {
          title slug description content author { username } publishedDate tags { tag }
        }
      }
    }
  `;
  const data: any = await fetchGraphQL(query, { slug });
  const post = data.BlogPosts.docs[0];
  return post ? mapPayloadToPost(post) : null;
}