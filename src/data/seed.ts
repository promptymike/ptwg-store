import { bundles, products, storeSeed } from "@/data/mock-store";
import { CATEGORY_OPTIONS } from "@/types/store";

export function createStoreSeedPayload() {
  return {
    categories: CATEGORY_OPTIONS.map((name) => ({ name })),
    products,
    bundles,
  };
}

export { storeSeed };
