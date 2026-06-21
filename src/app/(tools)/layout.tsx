import type { ReactNode } from "react";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-[#11100d]">{children}</main>;
}
