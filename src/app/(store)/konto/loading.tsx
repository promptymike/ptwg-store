export default function AccountLoading() {
  return (
    <div className="shell section-space space-y-6">
      <div className="surface-panel h-64 animate-pulse border-border/70 bg-primary/6" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-panel h-48 animate-pulse border-border/70 bg-primary/6" />
        <div className="surface-panel h-48 animate-pulse border-border/70 bg-primary/6" />
        <div className="surface-panel h-48 animate-pulse border-border/70 bg-primary/6" />
      </div>
    </div>
  );
}
