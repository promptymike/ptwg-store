"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { Bug, Camera, CheckCircle2, Loader2, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type FeedbackCategory = "bug" | "idea" | "ux" | "content";

function wait(ms: number) {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error("capture_timeout")), ms);
  });
}

export function TesterFeedbackWidget() {
  const captureRunRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  async function startReport() {
    const runId = captureRunRef.current + 1;
    captureRunRef.current = runId;

    setOpen(true);
    setSent(false);
    setCapturing(true);
    setError(null);
    setScreenshot(null);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await Promise.race([
        html2canvas(document.body, {
          scale: Math.min(window.devicePixelRatio || 1, 1.25),
          width: window.innerWidth,
          height: window.innerHeight,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          useCORS: true,
          logging: false,
          backgroundColor:
            getComputedStyle(document.body).backgroundColor || "#f8f4ec",
          ignoreElements: (element) =>
            element.hasAttribute("data-tester-feedback") ||
            element.tagName === "IFRAME" ||
            element.tagName === "VIDEO",
        }),
        wait(4500),
      ]);

      if (captureRunRef.current !== runId) return;
      setScreenshot(canvas.toDataURL("image/jpeg", 0.7));
    } catch {
      if (captureRunRef.current !== runId) return;
      setScreenshot(null);
      setError(
        "Nie udało się zrobić zrzutu, ale formularz działa — opisz krótko problem i wyślij zgłoszenie.",
      );
    } finally {
      if (captureRunRef.current === runId) {
        setCapturing(false);
      }
    }
  }

  function closeModal() {
    captureRunRef.current += 1;
    setCapturing(false);
    setOpen(false);
  }

  async function submitFeedback() {
    if (message.trim().length < 3) {
      setError("Napisz krótko, co się wydarzyło lub co warto poprawić.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/tester-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          pageUrl: window.location.href,
          screenshot,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });
      if (!response.ok) throw new Error("submit_failed");
      setSent(true);
      window.setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
        setScreenshot(null);
        setCategory("bug");
      }, 1600);
    } catch {
      setError("Nie udało się wysłać zgłoszenia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={startReport}
        data-tester-feedback
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-[0_20px_50px_-18px_rgba(225,29,72,.8)] transition hover:-translate-y-0.5 hover:bg-rose-500"
      >
        {capturing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Bug className="size-4" />
        )}
        Zgłoś błąd
      </button>

      {open ? (
        <div
          data-tester-feedback
          className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-background shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/70 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-rose-500">
                  Panel beta-testera
                </p>
                <h2
                  id="feedback-title"
                  className="mt-2 text-3xl text-foreground"
                >
                  Co powinniśmy poprawić?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Zapisujemy adres strony automatycznie. Screenshot dołączy się,
                  jeśli przeglądarka zdąży go zrobić.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Zamknij"
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-3 p-12 text-center">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <p className="text-xl font-semibold text-foreground">
                  Dzięki — zgłoszenie zapisane.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 p-6 md:grid-cols-[.8fr_1.2fr]">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">
                    Automatyczny screenshot
                  </p>
                  {screenshot ? (
                    <img
                      src={screenshot}
                      alt="Screenshot dołączony do zgłoszenia"
                      className="aspect-video w-full rounded-xl border border-border object-cover object-top"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">
                      {capturing ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Robimy zrzut w tle…
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 size-4" />
                          Bez zrzutu
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-xs leading-5 text-muted-foreground">
                    Zrzut trafia wyłącznie do zespołu Templify razem z tym
                    zgłoszeniem.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["bug", "Błąd"],
                        ["ux", "Nieczytelne"],
                        ["idea", "Pomysł"],
                        ["content", "Treść"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategory(value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          category === value
                            ? "border-rose-500 bg-rose-500/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={7}
                    maxLength={4000}
                    placeholder="Co zrobiłeś/aś? Czego się spodziewałeś/aś? Co pojawiło się zamiast tego?"
                  />
                  {error ? <p className="text-sm text-rose-500">{error}</p> : null}
                  <Button
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Wyślij feedback
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
