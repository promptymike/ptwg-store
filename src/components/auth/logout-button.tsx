"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  redirectTo?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
};

export function LogoutButton({
  redirectTo = "/",
  variant = "outline",
  size = "default",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    setIsLoading(true);

    try {
      await supabase.auth.signOut();
      router.push(redirectTo);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="size-4" />
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
}
