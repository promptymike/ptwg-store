type AdminStatusNoticeProps = {
  type?: string;
  message?: string;
};

export function AdminStatusNotice({
  type,
  message,
}: AdminStatusNoticeProps) {
  if (!type || !message) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-[1.4rem] border p-4 text-sm ${
        isSuccess
          ? "border-primary/20 bg-primary/10 text-muted-foreground"
          : "border-destructive/30 bg-destructive/10 text-foreground"
      }`}
    >
      {message}
    </div>
  );
}
