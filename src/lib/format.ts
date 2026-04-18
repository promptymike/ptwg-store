export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatOrderStatus(status: string) {
  switch (status) {
    case "new":
      return "Nowe";
    case "paid":
      return "Opłacone";
    case "fulfilled":
      return "Zrealizowane";
    case "cancelled":
      return "Anulowane";
    default:
      return status;
  }
}

export function formatProductPipelineStatus(status: string) {
  switch (status) {
    case "working":
      return "Roboczy";
    case "refining":
      return "Do opracowania";
    case "ready":
      return "Gotowy do publikacji";
    case "published":
      return "Opublikowany";
    default:
      return status;
  }
}

export function formatProductStatus(status: string) {
  switch (status) {
    case "draft":
      return "Draft";
    case "published":
      return "Opublikowany";
    case "archived":
      return "Zarchiwizowany";
    default:
      return status;
  }
}

export function formatProductSourceLinkStatus(status: string) {
  switch (status) {
    case "unattached":
      return "Niepodpięty";
    case "draft":
      return "Draft";
    case "published":
      return "Opublikowany";
    default:
      return status;
  }
}

export function formatProductSourceStage(stage: string) {
  switch (stage) {
    case "in_progress":
      return "In progress";
    case "final":
      return "Final wersje";
    case "ideas":
      return "Pomysły";
    case "planning":
      return "Plan";
    default:
      return stage;
  }
}

export function formatMimeTypeLabel(mimeType: string, fallbackName?: string) {
  if (mimeType === "application/pdf") {
    return "PDF";
  }

  if (mimeType === "text/html") {
    return "HTML";
  }

  if (mimeType === "application/x-rar") {
    return "RAR";
  }

  if (fallbackName?.includes(".")) {
    return fallbackName.split(".").pop()?.toUpperCase() ?? mimeType;
  }

  return mimeType;
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
