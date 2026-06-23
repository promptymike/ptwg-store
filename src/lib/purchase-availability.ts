export const PURCHASES_ENABLED =
  process.env.NEXT_PUBLIC_PURCHASES_ENABLED === "true";

export const PURCHASES_UNAVAILABLE_TITLE = "Sklep jest teraz w fazie testów";

export const PURCHASES_UNAVAILABLE_MESSAGE =
  "Zakupy są obecnie niedostępne, bo dopracowujemy platformę w trybie testowym. Zapraszamy za tydzień :)";

export const PURCHASES_UNAVAILABLE_CODE = "purchases_temporarily_disabled";

export function purchaseUnavailablePayload() {
  return {
    message: PURCHASES_UNAVAILABLE_MESSAGE,
    code: PURCHASES_UNAVAILABLE_CODE,
  };
}
