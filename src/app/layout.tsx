import type { Metadata } from "next";
import { Geist_Mono, Cormorant_Garamond, Manrope } from "next/font/google";

import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { CookieConsentBanner } from "@/components/compliance/cookie-consent";
import { CartProvider } from "@/components/cart/cart-provider";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
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
    default: "Templify | Premium szablony cyfrowe dla nowoczesnych marek",
    template: "%s | Templify",
  },
  description:
    "Templify to premium sklep z szablonami cyfrowymi, plannerami i gotowymi systemami dla założycieli, studiów i marek usługowych. Natychmiastowy dostęp po zakupie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${geistMono.variable} ${manrope.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeScript />
        <ThemeProvider>
          <AnalyticsProvider>
            <CartProvider>
              {children}
              <CookieConsentBanner />
            </CartProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
