import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { blogPosts } from "@/data/blogPosts";
import { db } from "@/lib/db";
import BlogPostClient from "./BlogPostClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.findUnique({ where: { slug } });
    if (post) return post;
  } catch (e) {}
  return blogPosts.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel Blog | TRI J",
    };
  }

  return {
    title: `${post.title} | Blog TRI J`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.coverImage || "",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post: any = await getBlogPostBySlug(slug);

  return (
    <main className="relative overflow-hidden bg-[#F8FAFC]">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <BlogPostClient slug={slug} initialPost={post || undefined} />
      </section>

      <Footer />
    </main>
  );
}
