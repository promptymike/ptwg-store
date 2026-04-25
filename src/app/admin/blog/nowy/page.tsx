import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminBlogForm } from "@/components/admin/admin-blog-form";

export default function AdminBlogNewPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Wszystkie wpisy
      </Link>
      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-2xl text-foreground">Nowy wpis</h2>
          <p className="text-sm text-muted-foreground">
            Po zapisie ze statusem &bdquo;Opublikowany&rdquo; wpis pojawia się
            natychmiast pod adresem /blog/[slug] i trafia do sitemapy.
          </p>
        </div>
        <AdminBlogForm />
      </div>
    </div>
  );
}
