import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { getAllPosts, getPostBySlug } from "@/app/lib/posts";

marked.use({ gfm: true, breaks: false });

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Ian Wood`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await marked(post.content);

  return (
    <div className="layout">
      <main className="main">
        <div className="post-view">
          <a href="/#writing" className="post-back">
            Writing
          </a>
          <h1 className="post-full-title">{post.title}</h1>
          <div className="post-full-meta">
            <span>{formatDate(post.date)}</span>
            <span>{post.readTime} read</span>
          </div>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>
    </div>
  );
}
