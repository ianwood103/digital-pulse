import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const WORDS_PER_MINUTE = 220;

function toISODate(raw: unknown): string | null {
  if (raw instanceof Date) return raw.toISOString().split("T")[0];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Pull the first H1 out of the body and return both the title and the body
// with that heading removed (so the page template doesn't render the title twice).
function extractH1(content: string): { title: string | null; body: string } {
  const match = content.match(/^\s*#\s+(.+?)\s*$/m);
  if (!match) return { title: null, body: content };
  const body = content.replace(match[0], "").replace(/^\s*\n+/, "");
  return { title: match[1].trim(), body };
}

function deriveExcerpt(content: string): string {
  const stripped = content.replace(/```[\s\S]*?```/g, "");
  const paragraph = stripped
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith(">"));
  if (!paragraph) return "";
  return paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

function parsePost(filename: string): Post {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  const { title: h1, body: bodyWithoutH1 } = extractH1(content);
  const hasFrontmatterTitle = typeof data.title === "string" && data.title.trim().length > 0;

  // If the author supplied a title in frontmatter, keep the H1 in the body (it's intentional).
  // If we derived the title from an H1, strip it so it isn't rendered twice.
  const body = hasFrontmatterTitle ? content : bodyWithoutH1;
  const title = hasFrontmatterTitle ? (data.title as string) : h1 ?? slugToTitle(slug);

  const excerpt =
    typeof data.excerpt === "string" && data.excerpt.trim()
      ? data.excerpt
      : deriveExcerpt(body);

  const readTime =
    typeof data.readTime === "string" && data.readTime.trim()
      ? data.readTime
      : deriveReadTime(body);

  const date = toISODate(data.date) ?? todayISO();

  return { slug, title, date, readTime, excerpt, content: body };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parsePost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filepath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  return parsePost(`${slug}.md`);
}
