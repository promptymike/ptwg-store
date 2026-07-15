const ONLINE_AND_PDF_LABEL = "Dostęp online + PDF";

export function formatCustomerFacingProductFormat(
  format: string | null | undefined,
) {
  const value = (format ?? "").trim();

  if (!value) {
    return ONLINE_AND_PDF_LABEL;
  }

  if (/\b(html|zip)\b/i.test(value)) {
    return ONLINE_AND_PDF_LABEL;
  }

  if (/^pdf$/i.test(value)) {
    return "PDF do pobrania";
  }

  return value;
}

export function formatCustomerFacingText(text: string) {
  return text
    .replace(/\bFaktur(?:a|y|ę)\s+VAT\b/gi, "Potwierdzenie płatności e-mailem")
    .replace(/\b14\s+dni\s+na\s+zwrot\b/gi, "Wsparcie posprzedażowe")
    .replace(/\bZIP\s*\(\s*HTML\s*\)/gi, ONLINE_AND_PDF_LABEL)
    .replace(/\bPlik\s+HTML\s*\/\s*PDF\b/gi, ONLINE_AND_PDF_LABEL)
    .replace(/\bplik\s+HTML\b/gi, "e-book dostępny online")
    .replace(/\bPliki\s+HTML\b/g, "E-booki")
    .replace(/\bpliki\s+HTML\b/g, "e-booki")
    .replace(/\bebooki\s+HTML\b/gi, "e-booki online + PDF")
    .replace(/\bebook\s+HTML\b/gi, "e-book online + PDF")
    .replace(/\bHTML\b/g, ONLINE_AND_PDF_LABEL);
}
