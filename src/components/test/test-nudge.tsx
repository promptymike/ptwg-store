"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "templify:test-nudge-dismissed-at";
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

export function TestNudge() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (["/test", "/checkout", "/koszyk", "/logowanie", "/rejestracja"].some((path) => pathname.startsWith(path))) return;
    const dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (Date.now() - dismissedAt < TWO_WEEKS) return;
    const timeout = window.setTimeout(() => setVisible(true), 60_000);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="fixed bottom-5 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-[1.7rem] border border-amber-300/30 bg-stone-950 p-5 text-white shadow-[0_28px_80px_-24px_rgba(0,0,0,.85)]" aria-label="Propozycja testu dopasowania">
      <button type="button" onClick={dismiss} aria-label="Zamknij" className="absolute right-3 top-3 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-amber-300"><Sparkles className="size-3.5" />2 minuty · bezpłatnie</span>
      <h2 className="mt-4 pr-8 text-2xl leading-tight">Nie wiesz, który planer lub e-book wybrać?</h2>
      <p className="mt-3 text-sm leading-6 text-white/65">Odpowiedz na 10 krótkich pytań. Pokażemy Ci konkretny system dopasowany do Twojego stylu działania.</p>
      <Link href="/test" onClick={dismiss} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-4 py-3 text-sm font-bold text-stone-950 transition hover:bg-amber-200">Zrób test dopasowania<ArrowRight className="size-4" /></Link>
    </aside>
  );
}
