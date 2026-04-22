export const CATEGORY_OPTIONS = [
  "Planowanie i Notion",
  "Content i marketing",
  "Sprzedaż i oferty",
  "Finanse i operacje",
  "Produktywność osobista",
] as const;

export const ROLE_OPTIONS = ["admin", "user"] as const;
export const ORDER_STATUSES = [
  "Nowe",
  "Opłacone",
  "Zrealizowane",
  "Anulowane",
] as const;
export const PRODUCT_BADGES = [
  "bestseller",
  "new",
  "featured",
  "pack",
] as const;
export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export const PRODUCT_PIPELINE_STATUSES = [
  "working",
  "refining",
  "ready",
  "published",
] as const;

export type Category = string;
export type UserRole = (typeof ROLE_OPTIONS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ProductBadge = (typeof PRODUCT_BADGES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductPipelineStatus = (typeof PRODUCT_PIPELINE_STATUSES)[number];

export type ProductPreview = {
  id: string;
  imageUrl: string | null;
  altText: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  format: string;
  pages: number;
  tags: string[];
  rating: number;
  salesLabel: string;
  accent: string;
  coverGradient: string;
  /**
   * 0-100 value controlling how much of the cover image shows through on top
   * of the gradient on product cards, the product hero and the library tile.
   * 0 = gradient-only (cover hidden), 100 = cover fully opaque over the
   * gradient. Undefined means "use the default blend" (currently 40).
   * Consumers should go through `getProductCoverOpacity` in `@/lib/product`
   * to apply the fallback consistently.
   */
  coverImageOpacity?: number;
  includes: string[];
  heroNote: string;
  badge?: ProductBadge | null;
  status?: ProductStatus;
  pipelineStatus?: ProductPipelineStatus;
  bestseller?: boolean;
  featured?: boolean;
  coverImageUrl?: string | null;
  previews?: ProductPreview[];
};

export type Bundle = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  accent: string;
  productIds: string[];
  perks: string[];
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  quote: string;
  score: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type StoreStat = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type CategoryHighlight = {
  slug: string;
  title: Category;
  description: string;
  accent: string;
};

export type AdminOrderPreview = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: string[];
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type SiteSectionContent = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type ContentPage = {
  slug: string;
  title: string;
  description: string;
  body: string;
};
