export const CATEGORY_OPTIONS = [
  "Planery",
  "Przepisy",
  "Plany treningowe",
  "Finanse",
  "Rozwój osobisty",
] as const;

export const ROLE_OPTIONS = ["admin", "user"] as const;
export const ORDER_STATUSES = [
  "Nowe",
  "Opłacone",
  "W realizacji",
  "Anulowane",
] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];
export type UserRole = (typeof ROLE_OPTIONS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

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
  includes: string[];
  heroNote: string;
  bestseller?: boolean;
  featured?: boolean;
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
