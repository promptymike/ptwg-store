import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AdminBlogForm } from "@/components/admin/admin-blog-form";
import { getAdminBlogPostBySlug } from "@/lib/supabase/blog";

type AdminBlogEditProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminBlogEditPage({ params }: AdminBlogEditProps) {
  const { slug } = await params;
  const post = await getAdminBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Wszystkie wpisy
        </Link>
        {post.status === "published" ? (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
          >
            Zobacz na stronie
            <ExternalLink className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-2xl text-foreground">Edycja wpisu</h2>
          <p className="text-sm text-muted-foreground">
            Zmiany zapisują się od razu i invalidują cache na /blog.
          </p>
        </div>
        <AdminBlogForm post={post} />
      </div>
    </div>
  );
}
