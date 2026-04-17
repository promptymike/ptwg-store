export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="surface-panel gold-frame space-y-4 p-6">
        <div className="h-4 w-36 animate-pulse rounded-full bg-primary/20" />
        <div className="h-10 w-full max-w-xl animate-pulse rounded-full bg-primary/10" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="surface-panel gold-frame h-40 animate-pulse bg-primary/5"
          />
        ))}
      </div>
    </div>
  );
}
