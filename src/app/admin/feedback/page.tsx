/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type FeedbackRow = {
  id: string;
  category: string;
  message: string;
  page_url: string;
  viewport: string | null;
  user_agent: string | null;
  screenshot_path: string | null;
  status: string;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
};

type ClientErrorRow = {
  id: string;
  path: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
};

function errorProp(row: ClientErrorRow, key: string) {
  const value = row.properties?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function AdminFeedbackPage() {
  const admin = createSupabaseAdminClient();
  const { data } = admin
    ? await admin
        .from("tester_feedback")
        .select("id, category, message, page_url, viewport, user_agent, screenshot_path, status, created_at, profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const feedback = await Promise.all(
    ((data ?? []) as unknown as FeedbackRow[]).map(async (item) => {
      const screenshotUrl = item.screenshot_path && admin
        ? (await admin.storage.from("tester-feedback").createSignedUrl(item.screenshot_path, 3600)).data?.signedUrl ?? null
        : null;
      return { ...item, screenshotUrl };
    }),
  );

  // Client-side crashes captured by ErrorReporter (uncaught errors, promise
  // rejections, render crashes) — first stop for "gdzie użytkownik miał
  // błąd" without digging through Vercel logs.
  const { data: errorData } = admin
    ? await admin
        .from("analytics_events")
        .select("id, path, properties, created_at")
        .eq("event_name", "client_error")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };
  const clientErrors = (errorData ?? []) as unknown as ClientErrorRow[];

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Beta program</span>
        <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">Feedback testerów</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Screenshot, strona, urządzenie i opis problemu w jednym miejscu.</p>
      </div>

      {feedback.length === 0 ? (
        <div className="surface-panel p-8 text-muted-foreground">Nie ma jeszcze żadnych zgłoszeń.</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {feedback.map((item) => (
            <article key={item.id} className="surface-panel overflow-hidden">
              {item.screenshotUrl ? <a href={item.screenshotUrl} target="_blank" rel="noreferrer"><img src={item.screenshotUrl} alt="Screenshot zgłoszenia" className="aspect-video w-full border-b border-border object-cover object-top" /></a> : null}
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-2"><Badge>{item.category}</Badge><Badge variant="outline">{item.status}</Badge><span className="ml-auto text-xs text-muted-foreground">{new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</span></div>
                <p className="leading-7 text-foreground">{item.message}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{item.profiles?.full_name ?? item.profiles?.email ?? "Tester"}</p>
                  <p>Viewport: {item.viewport ?? "—"}</p>
                  <Link href={item.page_url} target="_blank" className="block truncate text-primary underline underline-offset-2">{item.page_url}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div>
        <span className="eyebrow">Monitoring</span>
        <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Błędy klienta</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Automatycznie zebrane błędy z przeglądarek użytkowników (ostatnie 50).
          Ta sama lista trafia też do Vercel → Analytics → Events jako{" "}
          <code>client_error</code>.
        </p>
      </div>

      {clientErrors.length === 0 ? (
        <div className="surface-panel p-8 text-muted-foreground">
          Brak zarejestrowanych błędów — tak trzymać.
        </div>
      ) : (
        <div className="space-y-3">
          {clientErrors.map((row) => (
            <article key={row.id} className="surface-panel space-y-2 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="destructive">błąd</Badge>
                <code className="truncate text-xs text-muted-foreground">{row.path ?? "—"}</code>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at))}
                </span>
              </div>
              <p className="break-words text-sm leading-6 text-foreground">
                {errorProp(row, "message") ?? "Nieznany błąd"}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {errorProp(row, "source") ? <span className="break-all">Źródło: {errorProp(row, "source")}</span> : null}
                {errorProp(row, "viewport") ? <span>Ekran: {errorProp(row, "viewport")}</span> : null}
                {errorProp(row, "digest") ? <span>Digest: {errorProp(row, "digest")}</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
