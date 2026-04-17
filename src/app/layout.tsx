import type { Metadata } from "next";
import { Geist_Mono, Cormorant_Garamond, Manrope } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-provider";
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
  metadataBase: new URL("https://ptwg.pl"),
  title: {
    default: "PTWG.pl | Cyfrowe produkty premium",
    template: "%s | PTWG.pl",
  },
  description:
    "MVP sklepu z cyfrowymi produktami premium: planery, przepisy, plany treningowe, finanse i rozwój osobisty.",
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
      className={`dark ${geistMono.variable} ${manrope.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
