"use client";

import { PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminDetailsToggleButtonProps = {
  targetId: string;
};

export function AdminDetailsToggleButton({
  targetId,
}: AdminDetailsToggleButtonProps) {
  function handleOpen() {
    const target = document.getElementById(targetId);

    if (!(target instanceof HTMLDetailsElement)) {
      return;
    }

    target.open = true;
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleOpen}>
      <PencilLine className="size-4" />
      Edytuj
    </Button>
  );
}
