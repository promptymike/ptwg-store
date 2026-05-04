"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <main key={pathname} className="page-transition-enter flex-1">
      {children}
    </main>
  );
}
