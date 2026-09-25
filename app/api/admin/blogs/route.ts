import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { getBlogCoverImage } from '@/data/blogPosts';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedPosts = posts.map((p: any) => ({
    ...p,
    coverImage: getBlogCoverImage(p),
  }));

  return NextResponse.json(formattedPosts);
}

export async function POST(req: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      coverImage,
      category,
      tags = [],
      isHighlight = false,
      date,
      readTime,
      author,
    } = body;

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: 'Judul, ringkasan, dan konten wajib diisi' }, { status: 400 });
    }

    let slug = slugify(title);
    if (!slug) slug = `post-${Date.now()}`;

    // Ensure unique slug
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Single Highlight rule: If setting as highlight, un-highlight all other articles
    if (isHighlight) {
      await db.blogPost.updateMany({
        data: { isHighlight: false },
      });
    }

    const post = await db.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        coverImage: coverImage || null,
        category: category || 'Tips Perabotan',
        tags: Array.isArray(tags) ? tags : [],
        isHighlight: Boolean(isHighlight),
        date: date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        readTime: readTime || '5 min baca',
        author: author || 'Tim Spesialis TRI J',
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Admin Blog POST Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menambahkan artikel blog' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, excerpt, content, coverImage, category, tags, isHighlight } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID artikel wajib diisi' }, { status: 400 });
    }

    // Single Highlight rule: If setting as highlight, un-highlight all other articles
    if (isHighlight) {
      await db.blogPost.updateMany({
        where: { id: { not: Number(id) } },
        data: { isHighlight: false },
      });
    }

    const updateData: any = {};
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (isHighlight !== undefined) updateData.isHighlight = Boolean(isHighlight);

    const post = await db.blogPost.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Admin Blog PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengupdate artikel blog' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID artikel wajib diisi' }, { status: 400 });
    }

    await db.blogPost.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Blog DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus artikel blog' }, { status: 500 });
  }
}
