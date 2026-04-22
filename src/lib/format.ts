const MISSING_DATA_LABEL = "Brak danych";

export function formatCurrency(
  value: number | string | null | undefined,
  fallback = "Brak ceny",
) {
  const normalizedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(normalizedValue)) {
    return fallback;
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(normalizedValue);
}

export function formatOrderStatus(status: string | null | undefined) {
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
      return status ?? MISSING_DATA_LABEL;
  }
}

export function formatProductPipelineStatus(status: string | null | undefined) {
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
      return status ?? MISSING_DATA_LABEL;
  }
}

export function formatProductStatus(status: string | null | undefined) {
  switch (status) {
    case "draft":
      return "Draft";
    case "published":
      return "Opublikowany";
    case "archived":
      return "Zarchiwizowany";
    default:
      return status ?? MISSING_DATA_LABEL;
  }
}

export function formatProductSourceLinkStatus(status: string | null | undefined) {
  switch (status) {
    case "unattached":
      return "Niepodpięty";
    case "draft":
      return "Draft";
    case "published":
      return "Opublikowany";
    default:
      return status ?? MISSING_DATA_LABEL;
  }
}

export function formatProductSourceStage(stage: string | null | undefined) {
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
      return stage ?? MISSING_DATA_LABEL;
  }
}

export function formatMimeTypeLabel(
  mimeType: string | null | undefined,
  fallbackName?: string | null,
) {
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
    return fallbackName.split(".").pop()?.toUpperCase() ?? mimeType ?? MISSING_DATA_LABEL;
  }

  return mimeType ?? MISSING_DATA_LABEL;
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return "Brak daty";
  }

  const normalizedDate = new Date(value);

  if (Number.isNaN(normalizedDate.getTime())) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(normalizedDate);
}
