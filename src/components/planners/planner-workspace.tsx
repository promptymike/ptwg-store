"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cloud, CloudOff, LoaderCircle, LockKeyhole } from "lucide-react";

import type { InteractivePlanner } from "@/data/interactive-planners";

type SaveState = "loading" | "saved" | "saving" | "local" | "error";

export function PlannerWorkspace({ planner, demo = false }: { planner: InteractivePlanner; demo?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const dataRef = useRef<Record<string, string>>({});
  const timerRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const [saveState, setSaveState] = useState<SaveState>(demo ? "local" : "loading");

  const save = useCallback(async () => {
    if (demo) return;
    setSaveState("saving");
    const response = await fetch(`/api/planner-instances/${planner.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataRef.current }),
    }).catch(() => null);
    setSaveState(response?.ok ? "saved" : "error");
  }, [demo, planner.slug]);

  useEffect(() => {
    function scheduleSave() {
      if (demo) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setSaveState("saving");
      timerRef.current = window.setTimeout(save, 700);
    }

    async function onMessage(event: MessageEvent) {
      const message = event.data;
      if (!message || message.slug !== planner.slug || event.source !== iframeRef.current?.contentWindow) return;
      if (message.type === "templify:planner-ai-request" && !demo) {
        const response = await fetch(`/api/planner-instances/${planner.slug}/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message.body ?? {}),
        }).catch(() => null);
        const body = response
          ? await response.json().catch(() => ({ error: { message: "Nie udało się odczytać odpowiedzi AI." } }))
          : { error: { message: "Asystent AI jest chwilowo niedostępny." } };
        iframeRef.current?.contentWindow?.postMessage({
          type: "templify:planner-ai-response",
          slug: planner.slug,
          requestId: String(message.requestId ?? ""),
          status: response?.status ?? 503,
          body,
        }, "*");
        return;
      }
      if (message.type === "templify:planner-ready" && !demo && !hydratedRef.current) {
        const response = await fetch(`/api/planner-instances/${planner.slug}`).catch(() => null);
        if (!response?.ok) { setSaveState("error"); return; }
        const payload = (await response.json()) as { data?: Record<string, string> };
        dataRef.current = payload.data ?? {};
        hydratedRef.current = true;
        iframeRef.current?.contentWindow?.postMessage({ type: "templify:planner-hydrate", slug: planner.slug, data: dataRef.current }, "*");
        setSaveState("saved");
      }
      if (message.type === "templify:planner-change") {
        if (message.value === null) delete dataRef.current[String(message.key)];
        else dataRef.current[String(message.key)] = String(message.value);
        scheduleSave();
      }
      if (message.type === "templify:planner-clear") { dataRef.current = {}; scheduleSave(); }
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [demo, planner.slug, save]);

  const status = {
    loading: [LoaderCircle, "Łączenie z Twoim kontem…"],
    saving: [LoaderCircle, "Zapisywanie…"],
    saved: [Cloud, "Wszystko zapisane"],
    local: [LockKeyhole, "Demo — dane tylko w tej sesji"],
    error: [CloudOff, "Zapis w chmurze chwilowo niedostępny"],
  }[saveState] as [typeof Cloud, string];
  const StatusIcon = status[0];

  return (
    <div className="flex h-dvh flex-col bg-[#11100d] text-white">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={demo ? `/planery/${planner.slug}` : "/biblioteka"} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10"><ArrowLeft className="size-4" /></Link>
          <div className="min-w-0"><p className="truncate font-semibold">{planner.name}</p><p className="text-[10px] uppercase tracking-[.18em] text-white/45">Templify interactive</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65"><StatusIcon className={`size-3.5 ${saveState === "saving" || saveState === "loading" ? "animate-spin" : ""}`} />{status[1]}</div>
      </header>
      {demo ? <div className="flex items-center justify-center gap-3 bg-amber-300 px-4 py-2 text-center text-xs font-semibold text-stone-950">To jest działające demo. Po zakupie dane zapisują się na Twoim koncie.<Link href={`/planery/${planner.slug}`} className="underline underline-offset-2">Zobacz pełną wersję</Link></div> : null}
      <iframe ref={iframeRef} title={planner.name} src={`/api/planners/${planner.slug}/embed?mode=${demo ? "demo" : "owned"}`} className="min-h-0 w-full flex-1 border-0 bg-white" sandbox="allow-scripts allow-forms allow-modals allow-downloads allow-popups" />
    </div>
  );
}
