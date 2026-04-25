import type { Metadata } from "next";
import { Geist_Mono, Cormorant_Garamond, Manrope } from "next/font/google";
import { cookies } from "next/headers";

import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { CookieConsentBanner } from "@/components/compliance/cookie-consent";
import { CartProvider } from "@/components/cart/cart-provider";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { CONSENT_COOKIE_KEY } from "@/lib/consent";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://templify.store"),
  title: {
    default: "Templify | Praktyczne ebooki i planery dla codziennego życia",
    template: "%s | Templify",
  },
  description:
    "Templify to sklep z praktycznymi ebookami i planerami: finanse, zdrowie, macierzyństwo, produktywność, kariera. Pobierz natychmiast po zakupie.",
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
      className={`${geistMono.variable} ${manrope.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full overflow-x-clip bg-background text-foreground">
        <ThemeScript />
        <ThemeProvider>
          <AnalyticsProvider>
            <CartProvider>
              {children}
              <CookieConsentBanner initialHasConsent={initialHasConsent} />
              <CursorGlow />
            </CartProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
