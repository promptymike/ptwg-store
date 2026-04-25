// Shared between server and client — no `import "server-only"` here so
// the gift purchase UI can render the denominations without pulling the
// service-role helpers in lib/gift-codes.ts.

export const GIFT_CODE_DENOMINATIONS = [50, 100, 200, 500] as const;
export const GIFT_CODE_MIN = 30;
export const GIFT_CODE_MAX = 1000;
