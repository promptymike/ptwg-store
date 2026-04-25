import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, PackageCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatOrderNumber,
  formatOrderStatus,
  formatShortDate,
} from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { getAccountOrderDetails } from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Szczegoly zamowienia | Templify",
  robots: {
    index: false,
    follow: false,
  },
};

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/logowanie?next=/konto");
  }

  const { id } = await params;
  const order = await getAccountOrderDetails(user.id, id);

  if (!order) {
    notFound();
  }

  const orderNumber = formatOrderNumber(order.id, order.createdAt);

  return (
    <div className="shell py-10 sm:py-12 lg:py-16">
      <div className="mb-5">
        <Button variant="outline" render={<Link href="/konto#zamowienia" />}>
          <ArrowLeft className="size-4" />
          Wroc do konta
        </Button>
      </div>

      <section className="surface-panel space-y-6 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Zamowienie</span>
            <div>
              <h1 className="text-3xl text-foreground sm:text-5xl">{orderNumber}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Szczegoly zakupu, lista produktow i szybkie przejscie do pobierania.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                Data
              </p>
              <p className="mt-2 text-sm text-foreground">
                {formatShortDate(order.createdAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                Status
              </p>
              <p className="mt-2 text-sm text-foreground">
                {formatOrderStatus(order.status)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                Kwota
              </p>
              <p className="mt-2 text-sm text-foreground">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>
        </div>

        {order.items.length === 0 ? (
          <EmptyState
            badge="Produkty"
            title="Nie znaleziono pozycji zamowienia"
            description="Zamowienie istnieje, ale nie ma jeszcze widocznych pozycji. Jesli to swiezy zakup, odswiez strone za chwile."
            action={{ href: "/biblioteka", label: "Przejdz do biblioteki" }}
          />
        ) : (
          <div className="grid gap-3">
            {order.items.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.35rem] border border-border/70 bg-background/65 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="border-border/70 bg-background/70 text-foreground">
                        {item.format}
                      </Badge>
                    </div>
                    <h2 className="line-clamp-2 text-2xl text-foreground">
                      {item.productName}
                    </h2>
                    <p className="line-clamp-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 md:items-end">
                    <div className="text-sm text-muted-foreground md:text-right">
                      <p className="text-foreground">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                      <p>{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {item.slug ? (
                        <Button size="sm" variant="outline" render={<Link href={`/produkty/${item.slug}`} />}>
                          <ExternalLink className="size-4" />
                          Produkt
                        </Button>
                      ) : null}
                      {item.filePath ? (
                        <Button size="sm" render={<Link href={`/api/library/${item.productId}/download`} />}>
                          <Download className="size-4" />
                          Pobierz
                        </Button>
                      ) : (
                        <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                          <PackageCheck className="mr-1.5 size-3.5" />
                          W bibliotece
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
