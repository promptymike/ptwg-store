"use client";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <div className="surface-panel gold-frame space-y-4 p-6">
      <span className="eyebrow">Admin</span>
      <div className="space-y-2">
        <h2 className="text-2xl text-white">Nie udało się wczytać panelu</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "Wystąpił nieoczekiwany błąd po stronie aplikacji."}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-primary/30 bg-primary/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/18"
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
