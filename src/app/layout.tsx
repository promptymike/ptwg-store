import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { cookies } from "next/headers";

import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { PlausibleAnalytics } from "@/components/analytics/plausible-analytics";
import { CookieConsentBanner } from "@/components/compliance/cookie-consent";
import { CartProvider } from "@/components/cart/cart-provider";
import { PwaBootstrap } from "@/components/pwa/pwa-bootstrap";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { CONSENT_COOKIE_KEY } from "@/lib/consent";
import { env } from "@/lib/env";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Hanken Grotesk drives the whole "Editorial Alive" voice — one confident,
// highly legible grotesque from giant display headings down to UI labels.
// Latin-ext subset so Polish diacritics (ł, ń, ż, ś, ó…) render correctly.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Templify | Premium digital systems i template",
    template: "%s | Templify",
  },
  description:
    "Templify to storefront z gotowymi systemami, template i produktami cyfrowymi do planowania, sprzedaży, finansów i produktywności.",
  openGraph: {
    type: "website",
    siteName: "Templify",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialHasConsent = cookieStore.has(CONSENT_COOKIE_KEY);

  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${geistMono.variable} ${hanken.variable} h-full`}
    >
      <body className="min-h-full overflow-x-clip bg-background text-foreground">
        <ThemeScript />
        <ThemeProvider>
          <AnalyticsProvider>
            <CartProvider>
              {children}
              <CookieConsentBanner initialHasConsent={initialHasConsent} />
              <CursorGlow />
              <PwaBootstrap />
            </CartProvider>
            <PlausibleAnalytics />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
