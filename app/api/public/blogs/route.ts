import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts, getBlogCoverImage } from '@/data/blogPosts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!(db as any).blogPost) {
      if (slug) {
        const staticPost = blogPosts.find((p) => p.slug === slug);
        return staticPost
          ? NextResponse.json({ ...staticPost, coverImage: getBlogCoverImage(staticPost) })
          : NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(blogPosts.map((p) => ({ ...p, coverImage: getBlogCoverImage(p) })));
    }

    if (slug) {
      const dbPost = await (db as any).blogPost.findUnique({ where: { slug } });
      if (dbPost) {
        return NextResponse.json({ ...dbPost, coverImage: getBlogCoverImage(dbPost) });
      }
      const staticPost = blogPosts.find((p) => p.slug === slug);
      if (staticPost) {
        return NextResponse.json({ ...staticPost, coverImage: getBlogCoverImage(staticPost) });
      }
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    let posts = await (db as any).blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Seed initial posts if DB is empty or update missing coverImages
    if (posts.length === 0 && blogPosts.length > 0) {
      try {
        for (const post of blogPosts) {
          await db.blogPost.upsert({
            where: { slug: post.slug },
            update: {
              coverImage: post.coverImage || null,
            },
            create: {
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              content: post.content,
              coverImage: post.coverImage || null,
              date: post.date,
              readTime: post.readTime || '5 min baca',
              author: post.author || 'Tim Spesialis TRI J',
              category: post.category || 'Tips Perabotan',
              tags: post.tags || [],
              isHighlight: Boolean(post.isHighlight),
            },
          });
        }
        posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
      } catch (seedErr) {
        console.warn('Blog seed warning:', seedErr);
        posts = blogPosts as any;
      }
    }

    const formattedPosts = posts.map((p: any) => ({
      ...p,
      coverImage: getBlogCoverImage(p),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error: any) {
    console.error('Public Blog GET Error:', error);
    return NextResponse.json(blogPosts.map((p) => ({ ...p, coverImage: getBlogCoverImage(p) })));
  }
}
