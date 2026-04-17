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
      return "W realizacji";
    case "cancelled":
      return "Anulowane";
    default:
      return status;
  }
}
