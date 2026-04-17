"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type AdminSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  className?: string;
};

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "default",
  className,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} className={className} disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
