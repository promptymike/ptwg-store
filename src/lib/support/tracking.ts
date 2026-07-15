import { env } from "@/lib/env";

// Public status-page URL for a ticket. The token is an opaque capability —
// the URL never carries the customer's e-mail or other personal data.
export function buildSupportTrackingUrl(token: string) {
  return new URL(
    `/pomoc/zgloszenie/${token}`,
    env.siteUrl ?? "https://templify.pl",
  ).toString();
}
