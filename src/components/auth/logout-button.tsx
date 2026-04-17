"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  redirectTo?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function LogoutButton({
  redirectTo = "/",
  variant = "outline",
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
    <Button variant={variant} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
}
