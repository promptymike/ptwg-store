"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminCopyLinkButtonProps = {
  href?: string | null;
  disabled?: boolean;
};

export function AdminCopyLinkButton({
  href,
  disabled = false,
}: AdminCopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!href || disabled) {
      return;
    }

    const absoluteHref =
      typeof window !== "undefined"
        ? new URL(href, window.location.origin).toString()
        : href;

    try {
      await navigator.clipboard?.writeText(absoluteHref);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={disabled || !href}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Skopiowano" : "Kopiuj link"}
    </Button>
  );
}
