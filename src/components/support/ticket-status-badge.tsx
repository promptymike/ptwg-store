import { supportStatusLabel } from "@/lib/email/support-templates";

const STATUS_STYLES: Record<string, string> = {
  new: "border-sky-600/30 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  in_progress:
    "border-amber-600/30 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  waiting_customer:
    "border-violet-600/30 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
  resolved:
    "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  closed: "border-border bg-secondary/50 text-muted-foreground",
};

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ?? STATUS_STYLES.closed
      }`}
    >
      {supportStatusLabel(status)}
    </span>
  );
}
